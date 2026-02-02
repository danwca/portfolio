# Issue Report: Navigation Link Correction
**Date:** 2026-02-01
**Status:** In Progress

## 1. Issue Description
When using the "Auto-Discovery" feature (GitHub Tree API fallback), the generated navigation links reflect the **Repository File Structure**, not the **Web Application URL Structure**.

*   **Observed Behavior**:
    *   Repo Structure: `docs/article_demo.md`
    *   Section Config: `"": { "folder": "docs" }` (Root maps to docs)
    *   Generated Link: `http://localhost:3000/docs/article_demo.md`
    *   Problem: The user wants `http://localhost:3000/article_demo.md` (hiding the `docs` folder).

## 2. Root Cause
The `src/utils/navigation.js` utility takes the `path` directly from the GitHub Tree API response.
*   The Tree API returns the full path relative to the repo root (e.g., `docs/article_demo.md`).
*   The application renders this as a link `href`.
*   The application does not apply the reverse-mapping (Repo Path -> URL Path) before rendering.

## 3. Proposed Solution
Modify `src/utils/navigation.js` to implement **Path Normalization**:
1.  Import the application `config`.
2.  Determine the `repoFolder` associated with the current `sectionKey`.
3.  In `parseTree`, perform a string replacement:
    *   **Logic**: `LinkPath = RepoPath.replace(RepoFolder + '/', SectionKey + '/')`
    *   **Example (Root)**:
        *   RepoPath: `docs/article_demo.md`
        *   RepoFolder: `docs`
        *   SectionKey: `` (Empty string)
        *   Result: `article_demo.md`
    *   **Example (Blog)**:
        *   RepoPath: `posts/welcome.md`
        *   RepoFolder: `posts`
        *   SectionKey: `blog`
        *   Result: `blog/welcome.md`

## 4. Verification
*   Visit Root URL (`/`).
*   Verify links in sidebar do NOT contain `docs/`.
*   Clicking a link works and keeps you in the correct URL space.
