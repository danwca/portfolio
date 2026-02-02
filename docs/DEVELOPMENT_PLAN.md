# Development Plan: Generic Content Engine

## 1. Gap Analysis
The current codebase is a strong foundation but specialized for a single-folder "Portfolio" structure.

| Feature | Current State | Required State | Gap |
| :--- | :--- | :--- | :--- |
| **Configuration** | Flat defaults (`docsfolder`, `homefile`). | Section-based (`sections: { "blog": "posts/" }`). | **RESOLVED** (v26020101) |
| **Routing** | Simple path stripping. Assumes one root. | Section-aware. Must map URL prefix to different repo folders. | **RESOLVED** (v26020101) |
| **Templates** | `default` and `portfolio`. | `Home`, `Article`, `Blog`, `Book`. | **RESOLVED** (v26020102) |
| **Template Logic** | Page > Global Default. | Page > Section Default > Global Default. | **RESOLVED** (v26020102) |
| **Navigation** | Hardcoded/Manual Links. | Auto-generated Sidebars (for Books/Docs). | **RESOLVED** (v26020103) |

## 2. Phased Implementation Plan

### Phase 1: Core Engine Refactor (Routing & Config)
**Goal**: Enable the "Repository as Database" flexibility.
1.  **Update Config Schema**:
    *   Deprecate single `docsfolder`.
    *   Add `sections` map: `{ urlPath: repoFolder }`.
2.  **Rewire `App.js` Routing**:
    *   Update `getPathFromUrl` to match URL path against config sections.
    *   Resolve the correct entry file (e.g., `/docs` -> `docs/index.md`).

### Phase 2: Template System Expansion
**Goal**: Support diverse content types (Company, Blog, Book).
1.  **Implement Template Families**:
    *   `src/templates/Home.js`: specialized landing page layout.
    *   `src/templates/Article.js`: Standard documentation layout with Sidebar area.
    *   `src/templates/SectionIndex.js`: List view for blogs/news.
2.  **Update Selection Logic**:
    *   Modify `initApp` to determine the "Current Section" and use its configured template if the page doesn't specify one.

### Phase 3: Navigation & Sidebars (The "Book" Requirement)
**Goal**: Enable hierarchical navigation for Docs and Books.
*   **Decision**: Use a **`_sidebar.md`** approach.
    *   Each section can have a `_sidebar.md` file.
    *   The Engine fetches this file to render the navigation menu.
    *   *Why*: Avoids GitHub API rate limits and complex recursion logic. Matches other tools like docsify/VuePress.

### Phase 4: Extension Policy Enforcement
**Goal**: Security.
*   Add `allowScripts` flag to config.
*   If `false` (default), simply do not load any `.js` files from the content repo, only `.md` / `.json`.
*   **Impl**: Implemented `rehype-sanitize` to strip scripts from Markdown/HTML. 
    **RESOLVED** (v26020104)

## 3. Immediate Next Steps
1.  **Refactor `getPathFromUrl`** in `src/App.js` to support multi-folder routing.
2.  **Create `src/templates/Article.js`** as a proof-of-concept for the Documentation use case.
## 6. Suggestions for Next Revision (v0.3.0+)
1.  **Search Functionality**: Implement client-side search (using Lunr.js or FlexSearch) to index the fetched content.
2.  **SEO Improvements**: Dynamically update `<meta>` tags (description, og:image) based on the current page's Frontmatter.
3.  **Performance Check**: Implement code-splitting for Template components to correct the "loading all templates" behavior if it exists.
4.  **Offline Support**: Turn the app into a PWA (Progressive Web App) to allow reading documentation offline.
5.  **Commenting**: Integrate a lightweight commenting system (like Giscus or Utterances) for the Blog section.
