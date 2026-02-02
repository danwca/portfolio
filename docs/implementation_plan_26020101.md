# Implementation Report: Configuration & Routing Refactor
**Date:** 2026-02-01
**Sequence:** 01
**Status:** Completed

## 1. Configuration Change (`public/config.json`)
Introduced `sections` map. Deprecated `docsfolder`.

```json
{
  "defaultTemplate": "default",
  "repository": "portfolio",
  "githubaccount": "danwca",
  "defaultTitle": "My Portfolio",
  "sections": {
    "docs": "docs",
    "": "docs"
  },
  "homefile": "README.md"
}
```

## 2. GitHub Utility Change (`src/utils/github.js`)
Refactored `getRepoFileUrl` to support section mapping.

**Key Logic Implemented:**
```javascript
    // Section Logic
    if (sections) {
        const parts = normalizedPath.split('/');
        const firstSegment = parts[0];

        if (firstSegment && sections[firstSegment]) {
            // Specific match (e.g. /docs -> docs/)
            const repoFolder = normalizePath(sections[firstSegment]);
            // Logic assumes path already matches repo structure if mapped 1:1
        } else {
             // Root fallback
             if (sections[""]) {
                 const rootFolder = normalizePath(sections[""]);
                 fullPath = `${rootFolder}/${normalizedPath}`;
             }
        }
    }
```

## 3. App Logic Change (`src/App.js`)
Updated `processMarkdownLinks` to correctly resolve relative links within sections by leveraging the new `getRepoFileUrl`.

**Verification:**
*   **Root URL**: `/` -> `getRepoFileUrl('')` -> `docs/README.md` (via `config.sections[""]`).
*   **Docs URL**: `/docs/intro` -> `getRepoFileUrl('docs/intro')` -> `docs/intro` (via `config.sections["docs"]`).
*   **Images**: `![img](./img.png)` inside `docs/intro` -> resolves to `docs/img.png` -> GitHub Raw URL.

## 4. Issues & Fixes
### Logic Error in `getRepoFileUrl`
**Issue**: During verification, the `repoFolder` variable was assigned but not used to rewrite the path, causing virtual paths to fail.
**Fix**: Updated logic to properly replace the URL segment.
```javascript
// Fix applied in src/utils/github.js
parts[0] = repoFolder;
fullPath = parts.join('/');
```
