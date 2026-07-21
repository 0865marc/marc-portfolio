# Project graph and search index

The generated graph and SQLite index are two projections of the same deterministic document scan. Their authored contract is documented here and in [schema.md](schema.md).

## Artifacts

- `.agents/generated/index.sqlite3`: document metadata, chunks, and SQLite FTS5 table.
- `.agents/generated/graph.jsonl`: stable nodes followed by typed edges.
- `.agents/generated/state.json`: freshness counts, source digest, and indexer provenance.

All three are generated and versioned together so a fresh checkout can query without a full initial re-index. The manual graph/schema documentation stays under `.agents/graph/`.

## Stable identity

Node IDs use `<kind>:<first-24-hex-of-sha256>`. The hash input is `kind`, normalized project-relative path, and an optional semantic fragment separated by NUL bytes. File IDs therefore survive content changes and absolute checkout changes. Markdown heading fragments use normalized heading slugs plus deterministic duplicate suffixes.

Content hashes are full SHA-256 values and are not node IDs. They drive incremental replacement of changed documents.

## Node kinds

- `project`: the repository root and aggregate source hash.
- `file`: each included UTF-8 document with path, title, and content hash.
- `heading`: each Markdown heading with path anchor, level, line, title, and heading hash.

## Edge types

- `contains`: project → file and Markdown file → heading.
- `documents`: Markdown file → locally linked file.
- `imports`: source file → resolvable local source import.
- `tests`: conventional test filename → matching source file.

Import/link extraction is intentionally conservative and dependency-free. It does not replace a language server or TypeScript/Python parser. Unresolved package imports and external links produce no edge.

## Incremental and validation behaviour

A scan sorts paths, computes SHA-256, compares the SQLite `documents` table, and replaces only added/changed/removed documents and their FTS rows. When all hashes match and every generated artifact exists, the database is not written.

`validate` checks schema versions, SQLite/FTS chunk parity, JSONL syntax, unique/required node fields, allowed edge types, edge references, and graph/SQLite file hash parity. It exits non-zero on failures.

## Search boundary

FTS5 uses Unicode tokenization with diacritic removal and BM25 ranking over title, heading, and content. Results are chunk-level and include highlighted snippets. This is local lexical retrieval. A future hybrid layer may add vectors keyed by the current stable document/chunk IDs, but FTS5 must remain usable without a network or optional model.
