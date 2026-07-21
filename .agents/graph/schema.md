# Generated index schema

Schema version: `1`.

## Graph JSONL

The first line is a metadata record:

```json
{"record":"meta","schema_version":"1"}
```

Node records require `record`, `id`, `kind`, `path`, `title`, and `hash`. Heading nodes also include `level` and `line`.

```json
{"record":"node","id":"file:…","kind":"file","path":"src/App.tsx","title":"App","hash":"<sha256>"}
```

Edge records require `record`, `type`, `source`, and `target`. Both endpoints must reference node IDs in the same file.

```json
{"record":"edge","type":"imports","source":"file:…","target":"file:…"}
```

Records are serialized with sorted JSON keys. Nodes are ordered by ID; edges are ordered by type, source, and target. No timestamp is stored in the graph, so identical sources produce identical JSONL.

## SQLite

`metadata`

- `key TEXT PRIMARY KEY`
- `value TEXT NOT NULL`
- Current required entry: `schema_version = 1`

`documents`

- `node_id TEXT PRIMARY KEY`
- `path TEXT UNIQUE NOT NULL`
- `title TEXT NOT NULL`
- `hash TEXT NOT NULL`
- `size INTEGER NOT NULL`

`chunks`

- `chunk_id TEXT PRIMARY KEY`
- `document_id TEXT` foreign key to `documents` with cascade delete
- `ordinal INTEGER`
- `heading TEXT`
- `content TEXT`
- `start_line INTEGER`
- `end_line INTEGER`
- Unique `(document_id, ordinal)`

`chunks_fts` is an FTS5 virtual table with unindexed `chunk_id`/`path` metadata and indexed `title`, `heading`, and `content` columns. The tokenizer is `unicode61 remove_diacritics 2`.

## Freshness state

`state.json` contains:

- schema version;
- last successful UTC index timestamp;
- aggregate source digest and document/change counts;
- generated artifact paths and graph counts;
- logical indexer path, indexer SHA-256, hash algorithm, and search engine.

The timestamp is provenance only. Source and indexer hashes determine whether the projection corresponds to current inputs.
