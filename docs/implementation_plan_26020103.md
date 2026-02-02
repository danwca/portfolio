# Implementation Report: Navigation System
**Date:** 2026-02-01
**Sequence:** 03
**Status:** Completed

## 1. Summary
Implemented the dual-strategy navigation system.
1.  **Curated**: `_sidebar.md` support.
2.  **Auto**: GitHub Tree API fallback.

## 2. Changes
### Code
*   **`src/utils/navigation.js`**: Core logic to fetch `_sidebar.md`, parse it, or fall back to `getRepoTree` (Tree API) and parse that.
*   **`src/utils/github.js`**: Added `getRepoTree(path)` to resolve URLs to accurate Repository API endpoints.
*   **`src/App.js`**: Injected `fetchNavigation` into `initApp` life-cycle.
*   **`src/templates/Article.js`**: Added UI to render the sidebar list.

## 3. Verification & Usage
### Test A: Curated Sidebar (Default)
1.  Push `docs/_sidebar.md` to GitHub.
2.  Visit `/docs/article_demo`.
3.  **Result**: You see the links defined in `_sidebar.md`.

### Test B: Auto-Discovery
1.  Delete `docs/_sidebar.md` from GitHub.
2.  Visit `/docs/article_demo`.
3.  **Result**: You see a list of ALL files in the `docs` folder, auto-generated from the Tree API.

## 4. Issues Encountered & Resolved
During verification, we encountered and fixed the following:
*   **Template Selection Logic**: The application defaulted to the global default template for files in the root URL space.
    *   *Fix*: Implemented **Frontmatter Parsing** (`front-matter` package). Users can now specify `template: Article` in the markdown file to force a specific layout.
*   **Navigation Path Resolution**: The sidebar was initially missing for root files because the logic treated `filename.md` as a section name.
    *   *Fix*: Updated `App.js` to explicitly detect the Root Section (`""`) when no path segment matches a configured section.
*   **Visual Artifacts**: Raw frontmatter was rendering as text.
    *   *Fix*: The Frontmatter parser now strips metadata from the body before rendering.
