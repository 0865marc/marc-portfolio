from __future__ import annotations

import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


AGENTS_ROOT = Path(__file__).parents[1]
PROJECT_ROOT = AGENTS_ROOT.parent
DESIGN_VALIDATOR_PATH = AGENTS_ROOT / "scripts" / "validate_design.py"

DESIGN_SPEC = importlib.util.spec_from_file_location(
    "agents_validate_design", DESIGN_VALIDATOR_PATH
)
if DESIGN_SPEC is None or DESIGN_SPEC.loader is None:
    raise RuntimeError(f"Unable to load design validator from {DESIGN_VALIDATOR_PATH}")
validate_design = importlib.util.module_from_spec(DESIGN_SPEC)
sys.modules[DESIGN_SPEC.name] = validate_design
DESIGN_SPEC.loader.exec_module(validate_design)


class CodeGraphContractTests(unittest.TestCase):
    def test_local_index_is_ignored_and_non_code_history_is_excluded(self) -> None:
        config = json.loads((PROJECT_ROOT / "codegraph.json").read_text(encoding="utf-8"))
        gitignore = (PROJECT_ROOT / ".gitignore").read_text(encoding="utf-8").splitlines()

        self.assertEqual(config["exclude"], [".agents/", ".workflow/"])
        self.assertIn(".codegraph/", gitignore)

    def test_retired_manual_index_files_are_absent(self) -> None:
        retired_paths = (
            AGENTS_ROOT / "generated",
            AGENTS_ROOT / "graph",
            AGENTS_ROOT / "scripts" / "index_project.py",
            AGENTS_ROOT / "tests" / "test_index_project.py",
        )

        for path in retired_paths:
            with self.subTest(path=path):
                self.assertFalse(path.exists())


class ReviewProtocolTests(unittest.TestCase):
    def test_knowledge_delta_template_has_bounded_review_shape(self) -> None:
        template_path = AGENTS_ROOT / "tasks" / "knowledge-delta.template.yaml"
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
        design_path = AGENTS_ROOT / "DESIGN.md"
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
