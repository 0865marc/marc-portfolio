from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


SCRIPT_PATH = Path(__file__).parents[1] / "scripts" / "index_project.py"
DESIGN_VALIDATOR_PATH = Path(__file__).parents[1] / "scripts" / "validate_design.py"
SPEC = importlib.util.spec_from_file_location("agents_index_project", SCRIPT_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Unable to load indexer from {SCRIPT_PATH}")
index_project = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = index_project
SPEC.loader.exec_module(index_project)

DESIGN_SPEC = importlib.util.spec_from_file_location("agents_validate_design", DESIGN_VALIDATOR_PATH)
if DESIGN_SPEC is None or DESIGN_SPEC.loader is None:
    raise RuntimeError(f"Unable to load design validator from {DESIGN_VALIDATOR_PATH}")
validate_design = importlib.util.module_from_spec(DESIGN_SPEC)
sys.modules[DESIGN_SPEC.name] = validate_design
DESIGN_SPEC.loader.exec_module(validate_design)


class StableNodeIdTests(unittest.TestCase):
    def test_node_ids_are_deterministic_and_namespaced(self) -> None:
        first = index_project.stable_node_id("file", "src/App.tsx")
        second = index_project.stable_node_id("file", "src/./App.tsx")
        heading = index_project.stable_node_id("heading", "src/App.tsx", "Overview")

        self.assertEqual(first, "file:9b366825d86e80fb7958bef7")
        self.assertEqual(second, first)
        self.assertNotEqual(heading, first)


class DiscoveryTests(unittest.TestCase):
    def test_discovery_excludes_generated_vendor_workflow_secret_and_binary_paths(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            project = Path(temp_dir)
            included = {
                "README.md": "# Fixture portfolio\n",
                "src/App.tsx": "export default function App() { return null }\n",
                ".agents/context/project.md": "# Project context\n",
            }
            excluded = {
                ".git/config": "private repository metadata\n",
                ".workflow/plan.md": "historical workflow\n",
                "node_modules/pkg/index.js": "vendor code\n",
                "dist/index.html": "generated output\n",
                ".agents/generated/graph.jsonl": "generated graph\n",
                ".hermes.md": "operator-local agent policy\n",
                ".env": "TOKEN=secret\n",
                ".env.local": "TOKEN=secret\n",
                "credentials.json": "{}\n",
                "config/secrets.yaml": "token: private\n",
                "src/__pycache__/module.pyc": "cache\n",
            }

            for relative_path, content in {**included, **excluded}.items():
                destination = project / relative_path
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text(content, encoding="utf-8")
            binary = project / "public" / "portrait.png"
            binary.parent.mkdir(parents=True, exist_ok=True)
            binary.write_bytes(b"\x89PNG\r\n\x1a\n\x00binary")

            paths = {document.path for document in index_project.discover_documents(project)}

            self.assertEqual(paths, set(included))


class SearchIndexTests(unittest.TestCase):
    def test_missing_fts5_fails_with_an_explicit_requirement_error(self) -> None:
        class MissingFtsConnection:
            def execute(self, _statement: str) -> None:
                raise index_project.sqlite3.OperationalError("no such module: fts5")

        with self.assertRaisesRegex(index_project.IndexerError, "FTS5 is required.*unavailable"):
            index_project.require_fts5(MissingFtsConnection())

    def test_fts_query_returns_ranked_metadata_and_highlighted_snippet(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            project = Path(temp_dir)
            source = project / "src" / "summary.txt"
            source.parent.mkdir(parents=True)
            source.write_text(
                "Marc maintains a reliable portfolio for distributed systems.\n",
                encoding="utf-8",
            )
            (project / "README.md").write_text("# Fixture\n\nUnrelated introduction.\n", encoding="utf-8")

            stats = index_project.index_repository(project)
            results = index_project.query_repository(project, "portfolio")

            self.assertEqual(stats["indexed"], 2)
            self.assertEqual(results[0]["path"], "src/summary.txt")
            self.assertEqual(results[0]["title"], "summary")
            self.assertIn("<mark>portfolio</mark>", results[0]["snippet"])
            self.assertIsInstance(results[0]["rank"], float)

    def test_incremental_hash_scan_is_a_database_no_op_until_content_changes(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            project = Path(temp_dir)
            source = project / "src" / "summary.txt"
            source.parent.mkdir(parents=True)
            source.write_text("Reliable portfolio systems.\n", encoding="utf-8")

            first = index_project.index_repository(project)
            index_path = index_project.database_path(project)
            first_mtime = index_path.stat().st_mtime_ns
            second = index_project.index_repository(project)
            second_mtime = index_path.stat().st_mtime_ns

            self.assertEqual(first["changed"], 1)
            self.assertEqual(second["changed"], 0)
            self.assertEqual(second["unchanged"], 1)
            self.assertTrue(second["no_op"])
            self.assertEqual(second_mtime, first_mtime)

            source.write_text("Reliable portfolio systems with MQTT.\n", encoding="utf-8")
            third = index_project.index_repository(project)

            self.assertEqual(third["changed"], 1)
            self.assertFalse(third["no_op"])
            self.assertEqual(index_project.query_repository(project, "MQTT")[0]["path"], "src/summary.txt")


class GraphTests(unittest.TestCase):
    def test_graph_contains_heading_documentation_import_and_test_edges(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            project = Path(temp_dir)
            files = {
                "README.md": "# Fixture\n\nSee [the app](src/app.py) and [context](.agents/context/project.md).\n\n## Architecture\n",
                ".agents/context/project.md": "# Project context\n",
                "src/app.py": "from .helper import format_name\n",
                "src/helper.py": "def format_name(value):\n    return value\n",
                "tests/test_app.py": "from src.app import format_name\n",
            }
            for relative_path, content in files.items():
                destination = project / relative_path
                destination.parent.mkdir(parents=True, exist_ok=True)
                destination.write_text(content, encoding="utf-8")

            index_project.index_repository(project)
            records = [
                json.loads(line)
                for line in index_project.graph_path(project).read_text(encoding="utf-8").splitlines()
            ]
            nodes = {record["id"]: record for record in records if record["record"] == "node"}
            edges = {
                (record["type"], record["source"], record["target"])
                for record in records
                if record["record"] == "edge"
            }
            readme_id = index_project.stable_node_id("file", "README.md")
            app_id = index_project.stable_node_id("file", "src/app.py")
            helper_id = index_project.stable_node_id("file", "src/helper.py")
            context_id = index_project.stable_node_id("file", ".agents/context/project.md")
            test_id = index_project.stable_node_id("file", "tests/test_app.py")
            project_id = index_project.stable_node_id("project", ".")

            self.assertIn(project_id, nodes)
            self.assertIn(index_project.stable_node_id("heading", "README.md", "architecture"), nodes)
            self.assertIn(("contains", project_id, readme_id), edges)
            self.assertIn(("documents", readme_id, app_id), edges)
            self.assertIn(("documents", readme_id, context_id), edges)
            self.assertIn(("imports", app_id, helper_id), edges)
            self.assertIn(("tests", test_id, app_id), edges)

    def test_validation_reports_broken_graph_references(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            project = Path(temp_dir)
            (project / "README.md").write_text("# Fixture\n", encoding="utf-8")
            index_project.index_repository(project)

            self.assertEqual(index_project.validate_repository(project), [])

            with index_project.graph_path(project).open("a", encoding="utf-8") as graph_file:
                graph_file.write(
                    json.dumps(
                        {
                            "record": "edge",
                            "type": "documents",
                            "source": index_project.stable_node_id("file", "README.md"),
                            "target": "file:missing",
                        }
                    )
                    + "\n"
                )

            errors = index_project.validate_repository(project)

            self.assertTrue(any("missing target node file:missing" in error for error in errors), errors)


class CliTests(unittest.TestCase):
    def test_index_query_validate_cli_and_provenance_state(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            project = Path(temp_dir)
            (project / "README.md").write_text(
                "# Fixture portfolio\n\nSearchable infrastructure notes.\n",
                encoding="utf-8",
            )

            indexed = subprocess.run(
                [sys.executable, str(SCRIPT_PATH), "--project", str(project), "index"],
                check=False,
                capture_output=True,
                text=True,
            )
            queried = subprocess.run(
                [sys.executable, str(SCRIPT_PATH), "--project", str(project), "query", "infrastructure"],
                check=False,
                capture_output=True,
                text=True,
            )
            validated = subprocess.run(
                [sys.executable, str(SCRIPT_PATH), "--project", str(project), "validate"],
                check=False,
                capture_output=True,
                text=True,
            )

            self.assertEqual(indexed.returncode, 0, indexed.stderr)
            self.assertEqual(queried.returncode, 0, queried.stderr)
            self.assertEqual(validated.returncode, 0, validated.stderr)
            self.assertEqual(json.loads(queried.stdout)["results"][0]["path"], "README.md")
            self.assertTrue(json.loads(validated.stdout)["valid"])
            state = json.loads(index_project.state_path(project).read_text(encoding="utf-8"))
            self.assertEqual(state["schema_version"], "1")
            self.assertEqual(state["provenance"]["indexer"], ".agents/scripts/index_project.py")
            self.assertEqual(len(state["provenance"]["indexer_sha256"]), 64)


class ReviewProtocolTests(unittest.TestCase):
    def test_knowledge_delta_template_has_bounded_review_shape(self) -> None:
        template_path = Path(__file__).parents[1] / "tasks" / "knowledge-delta.template.yaml"
        template = template_path.read_text(encoding="utf-8")

        required_fields = (
            "schema_version: 1",
            "task_id:",
            "review_status: pending",
            "knowledge_delta:",
            "  added_nodes: []",
            "  changed_nodes: []",
            "  deprecated_nodes: []",
            "  adr_needed: false",
            "  design_changed: false",
            "  stale_knowledge: []",
            "reviewed_by:",
            "reviewed_at:",
        )
        for field in required_fields:
            with self.subTest(field=field):
                self.assertIn(field, template)
        self.assertNotIn("conversation", template.casefold())
        self.assertNotIn("secret", template.casefold())


class DesignValidatorTests(unittest.TestCase):
    def test_repository_design_is_structurally_valid_and_broken_refs_fail(self) -> None:
        design_path = Path(__file__).parents[1] / "DESIGN.md"
        self.assertEqual(validate_design.validate_design(design_path), [])

        with tempfile.TemporaryDirectory() as temp_dir:
            broken = Path(temp_dir) / "DESIGN.md"
            broken.write_text(
                "---\nversion: alpha\nname: Broken\ncolors:\n  primary: \"#000000\"\n"
                "components:\n  button:\n    backgroundColor: \"{colors.missing}\"\n---\n"
                "## Overview\n\n## Colors\n\n## Colors\n\n## Typography\n",
                encoding="utf-8",
            )

            errors = validate_design.validate_design(broken)

            self.assertTrue(any("broken token reference" in error for error in errors), errors)
            self.assertTrue(any("duplicate section" in error for error in errors), errors)


if __name__ == "__main__":
    unittest.main()
