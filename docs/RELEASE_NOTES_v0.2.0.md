# Release Notes - v0.2.0

**Date:** 2026-02-01
**Revision:** v0.2.0 (Content Engine Transformation)

## 🚀 Major Features
*   **Section-Based Routing**: Support for multiple content roots mapped to different URL prefixes (e.g., `/docs` -> `docs/`, `/blog` -> `posts/`).
*   **Advanced Template System**: 
    *   New `Article` template with Sidebar support.
    *   New `SectionIndex` template support.
    *   **Hierarchy**: Page Frontmatter > Section Config > Global Default.
*   **Navigation System**:
    *   **Curated**: Custom sidebars via `_sidebar.md`.
    *   **Auto-Fallback**: Automatic generation of menus using GitHub Tree API if no sidebar exists.
*   **Security Policies**:
    *   Implemented `allowScripts` configuration.
    *   Default strict sanitization using `rehype-sanitize` to prevent XSS.

## 🐛 Bug Fixes
*   **URL Correction**: Fixed auto-generated links to respect root-mapped sections (removing `/docs/` prefix from root URLs).
*   **Visual Cleanup**: Stripped raw Frontmatter YAML from rendering at the top of pages.
*   **Config Logic**: Fixed `config.json` parsing to support both legacy strings and new object-based section definitions.

## ⚙️ Configuration Changes
*   **New**: `sections` object in `config.json`.
*   **New**: `allowScripts` boolean (default `false`).
*   **Deprecated**: `docsfolder` (still supported as fallback).
