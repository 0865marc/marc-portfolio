#!/usr/bin/env python3
"""Dependency-free structural checks for this project's Google DESIGN.md file."""

from __future__ import annotations

import argparse
import re
import sys
from collections import Counter
from pathlib import Path


SECTION_ORDER = {
    "Overview": 0,
    "Brand & Style": 0,
    "Colors": 1,
    "Typography": 2,
    "Layout": 3,
    "Layout & Spacing": 3,
    "Elevation": 4,
    "Elevation & Depth": 4,
    "Shapes": 5,
    "Components": 6,
    "Do's and Don'ts": 7,
}
REQUIRED_SECTION_GROUPS = (
    {"Overview", "Brand & Style"},
    {"Colors"},
    {"Typography"},
    {"Layout", "Layout & Spacing"},
    {"Shapes"},
    {"Components"},
    {"Do's and Don'ts"},
)


def _frontmatter_and_body(text: str) -> tuple[list[str], list[str], list[str]]:
    errors: list[str] = []
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return [], lines, ["DESIGN.md must start with YAML front matter"]
    try:
        closing_index = next(
            index for index, line in enumerate(lines[1:], start=1) if line.strip() == "---"
        )
    except StopIteration:
        return lines[1:], [], ["DESIGN.md front matter is missing its closing delimiter"]
    return lines[1:closing_index], lines[closing_index + 1 :], errors


def _token_paths(frontmatter: list[str]) -> set[str]:
    paths: set[str] = set()
    stack: list[tuple[int, str]] = []
    for line in frontmatter:
        match = re.match(r"^(\s*)([A-Za-z0-9_-]+):(?:\s*(.*))?$", line)
        if not match:
            continue
        indent = len(match.group(1))
        key = match.group(2)
        while stack and stack[-1][0] >= indent:
            stack.pop()
        path = ".".join([item[1] for item in stack] + [key])
        paths.add(path)
        if not (match.group(3) or "").strip():
            stack.append((indent, key))
    return paths


def validate_design(path: Path) -> list[str]:
    """Return structural/token-reference errors for a DESIGN.md file."""
    if not path.is_file():
        return [f"DESIGN.md not found: {path}"]
    text = path.read_text(encoding="utf-8")
    frontmatter, body, errors = _frontmatter_and_body(text)
    frontmatter_text = "\n".join(frontmatter)

    if not re.search(r"^version:\s*alpha\s*$", frontmatter_text, re.MULTILINE):
        errors.append("front matter must declare version: alpha")
    if not re.search(r"^name:\s*\S.+$", frontmatter_text, re.MULTILINE):
        errors.append("front matter must declare a non-empty name")
    if not re.search(r"^colors:\s*$", frontmatter_text, re.MULTILINE):
        errors.append("front matter must define colors")

    for line_number, line in enumerate(frontmatter, start=2):
        if re.search(r":\s*#[0-9A-Fa-f]{3,8}\s*$", line):
            errors.append(f"line {line_number}: hex colors must be quoted")
        quoted_color = re.search(r":\s*\"(#[0-9A-Fa-f]+)\"\s*$", line)
        if quoted_color and len(quoted_color.group(1)) not in {4, 7, 9}:
            errors.append(f"line {line_number}: invalid quoted hex color {quoted_color.group(1)}")

    token_paths = _token_paths(frontmatter)
    for reference in sorted(set(re.findall(r"\{([^{}]+)\}", frontmatter_text))):
        if reference not in token_paths:
            errors.append(f"broken token reference {{{reference}}}")

    sections = [
        match.group(1).strip()
        for line in body
        if (match := re.match(r"^##\s+(.+?)\s*$", line)) is not None
    ]
    counts = Counter(sections)
    for section, count in sorted(counts.items()):
        if count > 1:
            errors.append(f"duplicate section: {section}")
    for alternatives in REQUIRED_SECTION_GROUPS:
        if not alternatives.intersection(sections):
            errors.append(f"missing required section: {' or '.join(sorted(alternatives))}")

    known_positions = [SECTION_ORDER[section] for section in sections if section in SECTION_ORDER]
    if known_positions != sorted(known_positions):
        errors.append("canonical DESIGN.md sections are out of order")
    if not any(re.match(r"^###\s+Accessibility\s*$", line) for line in body):
        errors.append("Components must include an Accessibility subsection")
    return errors


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", nargs="?", type=Path, default=Path(".agents/DESIGN.md"))
    arguments = parser.parse_args(argv)
    errors = validate_design(arguments.path)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"OK: {arguments.path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
