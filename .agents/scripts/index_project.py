#!/usr/bin/env python3
"""Build and query the project-local .agents knowledge index."""

from __future__ import annotations

import argparse
import hashlib
import json
import posixpath
import re
import sqlite3
import sys
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path, PurePosixPath
from typing import Any


EXCLUDED_DIRECTORY_NAMES = {
    ".cache",
    ".git",
    ".mypy_cache",
    ".pytest_cache",
    ".ruff_cache",
    ".workflow",
    "__pycache__",
    "build",
    "coverage",
    "dist",
    "generated",
    "node_modules",
    "vendor",
}
SECRET_FILE_NAMES = {
    ".npmrc",
    "credentials.json",
    "secrets.json",
    "service-account.json",
}
SECRET_FILE_STEMS = {"credential", "credentials", "secret", "secrets", "service-account"}
SECRET_SUFFIXES = {".key", ".p12", ".pem", ".pfx"}
OPERATOR_LOCAL_FILE_NAMES = {".hermes.md"}
TEXT_SUFFIXES = {
    ".cjs",
    ".conf",
    ".css",
    ".html",
    ".js",
    ".json",
    ".jsx",
    ".md",
    ".mdx",
    ".mjs",
    ".py",
    ".rst",
    ".scss",
    ".sh",
    ".sql",
    ".toml",
    ".ts",
    ".tsx",
    ".txt",
    ".yaml",
    ".yml",
}
TEXT_FILE_NAMES = {"Dockerfile", "Makefile"}
MAX_DOCUMENT_BYTES = 1_000_000


@dataclass(frozen=True)
class Document:
    path: str
    title: str
    digest: str
    content: str
    size: int


@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    ordinal: int
    heading: str
    content: str
    start_line: int
    end_line: int


class IndexerError(RuntimeError):
    """Raised when the local index cannot be built or queried safely."""


def normalize_relative_path(path: str) -> str:
    """Return a deterministic POSIX representation for a project-relative path."""
    return PurePosixPath(path.replace("\\", "/")).as_posix()


def stable_node_id(kind: str, path: str, fragment: str = "") -> str:
    """Return a stable, readable node ID derived only from node identity fields."""
    identity = "\0".join((kind, normalize_relative_path(path), fragment))
    digest = hashlib.sha256(identity.encode("utf-8")).hexdigest()[:24]
    return f"{kind}:{digest}"


def should_exclude(relative_path: PurePosixPath, *, is_directory: bool) -> bool:
    """Return whether a relative path is generated, vendored, secret, or unsupported."""
    parts = relative_path.parts
    if any(part in EXCLUDED_DIRECTORY_NAMES for part in parts):
        return True
    if is_directory:
        return False

    name = relative_path.name
    lower_name = name.lower()
    base_name = lower_name.split(".", 1)[0]
    if (
        lower_name.startswith(".env")
        or lower_name in SECRET_FILE_NAMES
        or lower_name in OPERATOR_LOCAL_FILE_NAMES
        or base_name in SECRET_FILE_STEMS
    ):
        return True
    if relative_path.suffix.lower() in SECRET_SUFFIXES:
        return True
    return name not in TEXT_FILE_NAMES and relative_path.suffix.lower() not in TEXT_SUFFIXES


def _iter_candidate_files(project: Path, directory: Path) -> list[Path]:
    candidates: list[Path] = []
    for entry in sorted(directory.iterdir(), key=lambda candidate: candidate.name):
        if entry.is_symlink():
            continue
        relative_path = PurePosixPath(entry.relative_to(project).as_posix())
        if entry.is_dir():
            if not should_exclude(relative_path, is_directory=True):
                candidates.extend(_iter_candidate_files(project, entry))
            continue
        if entry.is_file() and not should_exclude(relative_path, is_directory=False):
            candidates.append(entry)
    return candidates


def discover_documents(project: Path) -> list[Document]:
    """Read deterministic, bounded UTF-8 documents beneath the project root."""
    project = project.resolve()
    documents: list[Document] = []
    for path in _iter_candidate_files(project, project):
        if path.stat().st_size > MAX_DOCUMENT_BYTES:
            continue
        raw_content = path.read_bytes()
        if b"\0" in raw_content:
            continue
        try:
            content = raw_content.decode("utf-8")
        except UnicodeDecodeError:
            continue
        relative_path = path.relative_to(project).as_posix()
        title = path.stem
        if path.suffix.lower() in {".md", ".mdx"}:
            first_heading = next(
                (line.lstrip("#").strip() for line in content.splitlines() if line.startswith("# ")),
                None,
            )
            if first_heading:
                title = first_heading
        documents.append(
            Document(
                path=relative_path,
                title=title,
                digest=hashlib.sha256(raw_content).hexdigest(),
                content=content,
                size=len(raw_content),
            )
        )
    return documents


def chunk_document(document: Document, *, max_lines: int = 60) -> list[Chunk]:
    """Split a document into deterministic line-bounded FTS chunks."""
    lines = document.content.splitlines()
    sections: list[tuple[str, int, list[str]]] = []
    current_heading = document.title
    current_start = 1
    current_lines: list[str] = []
    is_markdown = PurePosixPath(document.path).suffix.lower() in {".md", ".mdx"}

    for line_number, line in enumerate(lines, start=1):
        heading_match = re.match(r"^#{1,6}\s+(.+?)\s*$", line) if is_markdown else None
        if heading_match and current_lines:
            sections.append((current_heading, current_start, current_lines))
            current_lines = []
            current_start = line_number
        if heading_match:
            current_heading = heading_match.group(1).strip()
        current_lines.append(line)
    if current_lines or not sections:
        sections.append((current_heading, current_start, current_lines))

    chunks: list[Chunk] = []
    ordinal = 0
    for heading, section_start, section_lines in sections:
        for offset in range(0, max(len(section_lines), 1), max_lines):
            selected_lines = section_lines[offset : offset + max_lines]
            content = "\n".join(selected_lines).strip()
            if not content:
                continue
            start_line = section_start + offset
            end_line = start_line + len(selected_lines) - 1
            chunk_id = stable_node_id("chunk", document.path, f"{ordinal}:{heading}")
            chunks.append(
                Chunk(
                    chunk_id=chunk_id,
                    ordinal=ordinal,
                    heading=heading,
                    content=content,
                    start_line=start_line,
                    end_line=end_line,
                )
            )
            ordinal += 1
    return chunks


def generated_directory(project: Path) -> Path:
    return project.resolve() / ".agents" / "generated"


def database_path(project: Path) -> Path:
    return generated_directory(project) / "index.sqlite3"


def graph_path(project: Path) -> Path:
    return generated_directory(project) / "graph.jsonl"


def state_path(project: Path) -> Path:
    return generated_directory(project) / "state.json"


def _heading_records(document: Document) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    nodes: list[dict[str, Any]] = []
    edges: list[dict[str, Any]] = []
    occurrences: dict[str, int] = {}
    parent_id = stable_node_id("file", document.path)
    for line_number, line in enumerate(document.content.splitlines(), start=1):
        match = re.match(r"^(#{1,6})\s+(.+?)\s*$", line)
        if not match:
            continue
        title = match.group(2).strip().rstrip("#").strip()
        base_slug = re.sub(r"[^\w-]+", "-", title.casefold(), flags=re.UNICODE).strip("-") or "section"
        occurrences[base_slug] = occurrences.get(base_slug, 0) + 1
        slug = base_slug if occurrences[base_slug] == 1 else f"{base_slug}-{occurrences[base_slug]}"
        node_id = stable_node_id("heading", document.path, slug)
        nodes.append(
            {
                "record": "node",
                "id": node_id,
                "kind": "heading",
                "path": f"{document.path}#{slug}",
                "title": title,
                "hash": hashlib.sha256(title.encode("utf-8")).hexdigest(),
                "level": len(match.group(1)),
                "line": line_number,
            }
        )
        edges.append(
            {"record": "edge", "type": "contains", "source": parent_id, "target": node_id}
        )
    return nodes, edges


def _normalized_candidate(path: str) -> str:
    normalized = posixpath.normpath(path)
    return normalized[2:] if normalized.startswith("./") else normalized


def _resolve_module_spec(source_path: str, specifier: str, known_paths: set[str]) -> str | None:
    source = PurePosixPath(source_path)
    candidates: list[str] = []
    suffix = source.suffix.lower()
    if specifier.startswith("."):
        if suffix == ".py":
            leading_dots = len(specifier) - len(specifier.lstrip("."))
            base = source.parent
            for _ in range(max(leading_dots - 1, 0)):
                base = base.parent
            module_part = specifier[leading_dots:].replace(".", "/")
            unresolved = (base / module_part).as_posix()
        else:
            unresolved = (source.parent / specifier).as_posix()
    elif suffix == ".py":
        unresolved = specifier.replace(".", "/")
    else:
        return None

    unresolved = _normalized_candidate(unresolved)
    if PurePosixPath(unresolved).suffix:
        candidates.append(unresolved)
    else:
        extensions = [".py"] if suffix == ".py" else [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]
        candidates.extend(f"{unresolved}{extension}" for extension in extensions)
        candidates.extend(f"{unresolved}/index{extension}" for extension in extensions)
    return next((candidate for candidate in candidates if candidate in known_paths), None)


def _import_targets(document: Document, known_paths: set[str]) -> set[str]:
    suffix = PurePosixPath(document.path).suffix.lower()
    specifiers: set[str] = set()
    if suffix == ".py":
        specifiers.update(
            match.group(1)
            for match in re.finditer(r"^\s*from\s+([.\w]+)\s+import\s+", document.content, re.MULTILINE)
        )
        specifiers.update(
            match.group(1)
            for match in re.finditer(r"^\s*import\s+([\w.]+)", document.content, re.MULTILINE)
        )
    elif suffix in {".cjs", ".js", ".jsx", ".mjs", ".ts", ".tsx"}:
        specifiers.update(
            match.group(1)
            for match in re.finditer(
                r"(?:\bfrom\s*|\bimport\s*\(|\brequire\s*\()\s*['\"]([^'\"]+)['\"]",
                document.content,
            )
        )
        specifiers.update(
            match.group(1)
            for match in re.finditer(r"^\s*import\s*['\"]([^'\"]+)['\"]", document.content, re.MULTILINE)
        )
    return {
        target
        for specifier in specifiers
        if (target := _resolve_module_spec(document.path, specifier, known_paths)) is not None
    }


def _documentation_targets(document: Document, known_paths: set[str]) -> set[str]:
    if PurePosixPath(document.path).suffix.lower() not in {".md", ".mdx"}:
        return set()
    targets: set[str] = set()
    for match in re.finditer(r"\[[^\]]+\]\(([^)]+)\)", document.content):
        destination = match.group(1).strip().split()[0].strip("<>")
        if not destination or destination.startswith(("#", "http://", "https://", "mailto:")):
            continue
        path_part = destination.split("#", 1)[0]
        candidate = _normalized_candidate((PurePosixPath(document.path).parent / path_part).as_posix())
        if candidate in known_paths:
            targets.add(candidate)
    return targets


def _test_target(document: Document, known_paths: set[str]) -> str | None:
    path = PurePosixPath(document.path)
    name = path.name
    target_name: str | None = None
    if name.startswith("test_"):
        target_name = name.removeprefix("test_")
    else:
        target_name = re.sub(r"\.(?:test|spec)(?=\.)", "", name)
        if target_name == name:
            target_name = None
    if target_name is None:
        return None
    candidates = sorted(
        candidate
        for candidate in known_paths
        if PurePosixPath(candidate).name == target_name and candidate != document.path
    )
    return next((candidate for candidate in candidates if candidate.startswith("src/")), candidates[0] if candidates else None)


def build_graph_records(project: Path, documents: list[Document]) -> list[dict[str, Any]]:
    """Build deterministic nodes and typed relationships for indexed documents."""
    known_paths = {document.path for document in documents}
    aggregate_hash = hashlib.sha256(
        "\n".join(f"{document.path}\0{document.digest}" for document in documents).encode("utf-8")
    ).hexdigest()
    project_id = stable_node_id("project", ".")
    nodes: list[dict[str, Any]] = [
        {
            "record": "node",
            "id": project_id,
            "kind": "project",
            "path": ".",
            "title": project.name,
            "hash": aggregate_hash,
        }
    ]
    edges: list[dict[str, Any]] = []
    for document in documents:
        document_id = stable_node_id("file", document.path)
        nodes.append(
            {
                "record": "node",
                "id": document_id,
                "kind": "file",
                "path": document.path,
                "title": document.title,
                "hash": document.digest,
            }
        )
        edges.append(
            {"record": "edge", "type": "contains", "source": project_id, "target": document_id}
        )
        heading_nodes, heading_edges = _heading_records(document)
        nodes.extend(heading_nodes)
        edges.extend(heading_edges)
        for target in sorted(_import_targets(document, known_paths)):
            edges.append(
                {
                    "record": "edge",
                    "type": "imports",
                    "source": document_id,
                    "target": stable_node_id("file", target),
                }
            )
        for target in sorted(_documentation_targets(document, known_paths)):
            edges.append(
                {
                    "record": "edge",
                    "type": "documents",
                    "source": document_id,
                    "target": stable_node_id("file", target),
                }
            )
        if (target := _test_target(document, known_paths)) is not None:
            edges.append(
                {
                    "record": "edge",
                    "type": "tests",
                    "source": document_id,
                    "target": stable_node_id("file", target),
                }
            )

    records: list[dict[str, Any]] = [{"record": "meta", "schema_version": "1"}]
    records.extend(sorted(nodes, key=lambda node: node["id"]))
    records.extend(
        sorted(edges, key=lambda edge: (edge["type"], edge["source"], edge["target"]))
    )
    return records


def write_graph(project: Path, documents: list[Document]) -> None:
    destination = graph_path(project)
    temporary = destination.with_suffix(".jsonl.tmp")
    serialized = "\n".join(
        json.dumps(record, ensure_ascii=False, sort_keys=True)
        for record in build_graph_records(project, documents)
    ) + "\n"
    temporary.write_text(serialized, encoding="utf-8")
    temporary.replace(destination)


def write_state(project: Path, documents: list[Document], stats: dict[str, Any]) -> None:
    """Write portable freshness and provenance metadata for the generated index."""
    destination = state_path(project)
    graph_records = build_graph_records(project, documents)
    source_digest = hashlib.sha256(
        "\n".join(f"{document.path}\0{document.digest}" for document in documents).encode("utf-8")
    ).hexdigest()
    indexer_digest = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()
    state = {
        "schema_version": "1",
        "freshness": {
            "indexed_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
            "source_digest": source_digest,
            "documents": len(documents),
            "changed": stats["changed"],
            "removed": stats["removed"],
        },
        "artifacts": {
            "database": ".agents/generated/index.sqlite3",
            "graph": ".agents/generated/graph.jsonl",
            "graph_nodes": sum(record.get("record") == "node" for record in graph_records),
            "graph_edges": sum(record.get("record") == "edge" for record in graph_records),
        },
        "provenance": {
            "indexer": ".agents/scripts/index_project.py",
            "indexer_sha256": indexer_digest,
            "hash_algorithm": "sha256",
            "search_engine": "sqlite-fts5",
        },
    }
    temporary = destination.with_suffix(".json.tmp")
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    temporary.replace(destination)


def _connect_database(path: Path) -> sqlite3.Connection:
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def require_fts5(connection: Any) -> None:
    """Prove that the active SQLite connection can create an FTS5 table."""
    try:
        connection.execute("CREATE VIRTUAL TABLE temp.__agents_fts5_check USING fts5(content)")
        connection.execute("DROP TABLE temp.__agents_fts5_check")
    except sqlite3.OperationalError as error:
        raise IndexerError(
            "SQLite FTS5 is required for .agents search but is unavailable in this Python build"
        ) from error


def _create_schema(connection: sqlite3.Connection) -> None:
    require_fts5(connection)
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS documents (
            node_id TEXT PRIMARY KEY,
            path TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            hash TEXT NOT NULL,
            size INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS chunks (
            chunk_id TEXT PRIMARY KEY,
            document_id TEXT NOT NULL REFERENCES documents(node_id) ON DELETE CASCADE,
            ordinal INTEGER NOT NULL,
            heading TEXT NOT NULL,
            content TEXT NOT NULL,
            start_line INTEGER NOT NULL,
            end_line INTEGER NOT NULL,
            UNIQUE(document_id, ordinal)
        );
        """
    )
    connection.execute(
        """
        CREATE VIRTUAL TABLE IF NOT EXISTS chunks_fts USING fts5(
            chunk_id UNINDEXED,
            path UNINDEXED,
            title,
            heading,
            content,
            tokenize = 'unicode61 remove_diacritics 2'
        )
        """
    )


def _insert_document(connection: sqlite3.Connection, document: Document) -> None:
    document_id = stable_node_id("file", document.path)
    connection.execute(
        "INSERT INTO documents(node_id, path, title, hash, size) VALUES (?, ?, ?, ?, ?)",
        (document_id, document.path, document.title, document.digest, document.size),
    )
    for chunk in chunk_document(document):
        connection.execute(
            """
            INSERT INTO chunks(
                chunk_id, document_id, ordinal, heading, content, start_line, end_line
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                chunk.chunk_id,
                document_id,
                chunk.ordinal,
                chunk.heading,
                chunk.content,
                chunk.start_line,
                chunk.end_line,
            ),
        )
        connection.execute(
            "INSERT INTO chunks_fts(chunk_id, path, title, heading, content) VALUES (?, ?, ?, ?, ?)",
            (chunk.chunk_id, document.path, document.title, chunk.heading, chunk.content),
        )


def index_repository(project: Path) -> dict[str, Any]:
    """Build the SQLite FTS index for a project and return machine-readable statistics."""
    project = project.resolve()
    documents = discover_documents(project)
    documents_by_path = {document.path: document for document in documents}
    output_directory = generated_directory(project)
    output_directory.mkdir(parents=True, exist_ok=True)
    path = database_path(project)
    existing_hashes: dict[str, str] = {}
    if path.is_file():
        try:
            with _connect_database(path) as connection:
                require_fts5(connection)
                schema_version = connection.execute(
                    "SELECT value FROM metadata WHERE key = 'schema_version'"
                ).fetchone()
                if schema_version is None or schema_version["value"] != "1":
                    raise IndexerError("Existing index has an unsupported schema version")
                existing_hashes = {
                    row["path"]: row["hash"]
                    for row in connection.execute("SELECT path, hash FROM documents ORDER BY path")
                }
        except sqlite3.DatabaseError as error:
            raise IndexerError(f"Existing index at {path} is unreadable: {error}") from error

    changed_documents = [
        document
        for document in documents
        if existing_hashes.get(document.path) != document.digest
    ]
    removed_paths = sorted(set(existing_hashes) - set(documents_by_path))
    unchanged_count = len(documents) - len(changed_documents)
    if (
        path.is_file()
        and graph_path(project).is_file()
        and state_path(project).is_file()
        and not changed_documents
        and not removed_paths
    ):
        return {
            "indexed": len(documents),
            "changed": 0,
            "removed": 0,
            "unchanged": unchanged_count,
            "no_op": True,
        }

    with _connect_database(path) as connection:
        _create_schema(connection)
        connection.execute(
            "INSERT OR REPLACE INTO metadata(key, value) VALUES ('schema_version', '1')"
        )
        for relative_path in [*removed_paths, *(document.path for document in changed_documents)]:
            connection.execute("DELETE FROM chunks_fts WHERE path = ?", (relative_path,))
            connection.execute("DELETE FROM documents WHERE path = ?", (relative_path,))
        for document in changed_documents:
            _insert_document(connection, document)

    write_graph(project, documents)
    stats = {
        "indexed": len(documents),
        "changed": len(changed_documents),
        "removed": len(removed_paths),
        "unchanged": unchanged_count,
        "no_op": False,
    }
    write_state(project, documents, stats)
    return stats


def validate_repository(project: Path) -> list[str]:
    """Return structural index errors; an empty list means the generated state is valid."""
    project = project.resolve()
    errors: list[str] = []
    path = database_path(project)
    graph = graph_path(project)
    database_documents: dict[str, str] = {}
    if not path.is_file():
        errors.append(f"missing SQLite index: {path}")
    else:
        try:
            with _connect_database(path) as connection:
                require_fts5(connection)
                schema_version = connection.execute(
                    "SELECT value FROM metadata WHERE key = 'schema_version'"
                ).fetchone()
                if schema_version is None or schema_version["value"] != "1":
                    errors.append("SQLite metadata schema_version must be 1")
                database_documents = {
                    row["path"]: row["hash"]
                    for row in connection.execute("SELECT path, hash FROM documents ORDER BY path")
                }
                chunk_count = connection.execute("SELECT COUNT(*) AS count FROM chunks").fetchone()["count"]
                fts_count = connection.execute("SELECT COUNT(*) AS count FROM chunks_fts").fetchone()["count"]
                if chunk_count != fts_count:
                    errors.append(
                        f"SQLite chunk count {chunk_count} does not match FTS row count {fts_count}"
                    )
        except (sqlite3.DatabaseError, IndexerError) as error:
            errors.append(f"unreadable SQLite index: {error}")

    records: list[dict[str, Any]] = []
    if not graph.is_file():
        errors.append(f"missing graph JSONL: {graph}")
    else:
        for line_number, line in enumerate(graph.read_text(encoding="utf-8").splitlines(), start=1):
            try:
                record = json.loads(line)
            except json.JSONDecodeError as error:
                errors.append(f"graph line {line_number} is invalid JSON: {error.msg}")
                continue
            if not isinstance(record, dict):
                errors.append(f"graph line {line_number} must be a JSON object")
                continue
            records.append(record)

    meta_records = [record for record in records if record.get("record") == "meta"]
    if len(meta_records) != 1 or meta_records[0].get("schema_version") != "1":
        errors.append("graph must contain exactly one schema_version 1 meta record")

    nodes: dict[str, dict[str, Any]] = {}
    for record in records:
        if record.get("record") != "node":
            continue
        node_id = record.get("id")
        if not isinstance(node_id, str) or not node_id:
            errors.append("graph node has a missing or invalid id")
            continue
        if node_id in nodes:
            errors.append(f"duplicate graph node id {node_id}")
        nodes[node_id] = record
        for key in ("kind", "path", "title", "hash"):
            if not isinstance(record.get(key), str) or not record[key]:
                errors.append(f"graph node {node_id} has a missing or invalid {key}")

    allowed_edge_types = {"contains", "documents", "imports", "tests"}
    for record in records:
        record_type = record.get("record")
        if record_type in {"meta", "node"}:
            continue
        if record_type != "edge":
            errors.append(f"unknown graph record type {record_type!r}")
            continue
        edge_type = record.get("type")
        source = record.get("source")
        target = record.get("target")
        if edge_type not in allowed_edge_types:
            errors.append(f"graph edge has unsupported type {edge_type!r}")
        if source not in nodes:
            errors.append(f"graph edge {edge_type!r} references missing source node {source}")
        if target not in nodes:
            errors.append(f"graph edge {edge_type!r} references missing target node {target}")

    graph_documents = {
        record["path"]: record.get("hash")
        for record in nodes.values()
        if record.get("kind") == "file" and isinstance(record.get("path"), str)
    }
    if graph_documents != database_documents:
        missing_from_graph = sorted(set(database_documents) - set(graph_documents))
        extra_in_graph = sorted(set(graph_documents) - set(database_documents))
        hash_mismatches = sorted(
            path
            for path in set(graph_documents) & set(database_documents)
            if graph_documents[path] != database_documents[path]
        )
        if missing_from_graph:
            errors.append(f"documents missing from graph: {', '.join(missing_from_graph)}")
        if extra_in_graph:
            errors.append(f"graph files missing from SQLite: {', '.join(extra_in_graph)}")
        if hash_mismatches:
            errors.append(f"document hashes differ between graph and SQLite: {', '.join(hash_mismatches)}")
    return errors


def query_repository(project: Path, query: str, *, limit: int = 10) -> list[dict[str, Any]]:
    """Query FTS5 and return ranked document metadata with highlighted snippets."""
    path = database_path(project.resolve())
    if not path.is_file():
        raise IndexerError(f"Index not found at {path}; run the index command first")
    if not query.strip():
        raise IndexerError("Query text must not be empty")

    with _connect_database(path) as connection:
        require_fts5(connection)
        try:
            rows = connection.execute(
                """
                SELECT
                    path,
                    title,
                    heading,
                    snippet(chunks_fts, 4, '<mark>', '</mark>', ' … ', 18) AS snippet,
                    bm25(chunks_fts, 0.0, 0.0, 2.0, 1.0, 1.0) AS rank
                FROM chunks_fts
                WHERE chunks_fts MATCH ?
                ORDER BY rank ASC, path ASC, chunk_id ASC
                LIMIT ?
                """,
                (query, limit),
            ).fetchall()
        except sqlite3.OperationalError as error:
            raise IndexerError(f"Invalid FTS5 query {query!r}: {error}") from error
    return [
        {
            "path": row["path"],
            "title": row["title"],
            "heading": row["heading"],
            "snippet": row["snippet"],
            "rank": float(row["rank"]),
        }
        for row in rows
    ]


def build_argument_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Build, query, and validate the project-local .agents knowledge index."
    )
    parser.add_argument(
        "--project",
        type=Path,
        default=Path.cwd(),
        help="Project root (default: current working directory)",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("index", help="Incrementally build SQLite FTS5 and graph artifacts")
    query_parser = subparsers.add_parser("query", help="Search indexed document chunks")
    query_parser.add_argument("text", help="FTS5 query text")
    query_parser.add_argument("--limit", type=int, default=10, help="Maximum result chunks (default: 10)")
    subparsers.add_parser("validate", help="Validate SQLite and graph references")
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_argument_parser()
    arguments = parser.parse_args(argv)
    project = arguments.project.resolve()
    if not project.is_dir():
        parser.error(f"project path is not a directory: {project}")

    try:
        if arguments.command == "index":
            payload = {"command": "index", "project": str(project), **index_repository(project)}
        elif arguments.command == "query":
            if arguments.limit < 1:
                raise IndexerError("Query limit must be at least 1")
            results = query_repository(project, arguments.text, limit=arguments.limit)
            payload = {
                "command": "query",
                "project": str(project),
                "query": arguments.text,
                "count": len(results),
                "results": results,
            }
        else:
            errors = validate_repository(project)
            payload = {
                "command": "validate",
                "project": str(project),
                "valid": not errors,
                "errors": errors,
            }
            print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
            return 0 if not errors else 1
    except IndexerError as error:
        print(f"error: {error}", file=sys.stderr)
        return 2

    print(json.dumps(payload, ensure_ascii=False, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
