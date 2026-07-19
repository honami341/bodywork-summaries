from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import html
import re
import shutil

ROOT = Path(__file__).resolve().parents[1]
CONTENT_DIR = ROOT / "content"
SITE_DIR = ROOT / "site"
DIST_DIR = ROOT / "dist"


@dataclass
class Summary:
    title: str
    date: str
    slug: str
    summary: str
    tags: list[str]
    body: str
    source: Path


def parse_frontmatter(text: str) -> tuple