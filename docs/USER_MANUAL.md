# User Manual: Generic Content Engine

## 1. Introduction
Welcome to the Generic Content Engine! This system turns your GitHub Repository into a dynamic website. You simply write Markdown files, organized in folders, and the engine handles the rest—navigating, styling, and securing your content.

## 2. Configuration (`config.json`)
Your website is controlled by the `public/config.json` file.

```json
{
  "githubaccount": "your-username",
  "repository": "your-repo-name",
  "defaultTitle": "My Awesome Site",
  "defaultTemplate": "default",
  "allowScripts": false,
  "sections": {
    "docs": {
        "folder": "documentation",
        "template": "Article"
    },
    "blog": {
        "folder": "posts",
        "template": "SectionIndex"
    },
    "": {
        "folder": "docs",
        "template": "default"
    }
  }
}
```

### Key Settings
*   **`sections`**: Maps a URL prefix (e.g., `docs`) to a GitHub folder (e.g., `documentation`).
    *   **Root Section**: Use `""` as the key to map the home URL `/`.
    *   **`template`**: Sets the default layout for all pages in this section.
*   **`allowScripts`**: 
    *   `false` (Default): Removes all `<script>` tags from your content for security.
    *   `true`: Allows scripts to run. Only enable if you trust all contributors.

## 3. Writing Content
### 3.1 Standard Markdown
Write standard markdown. Links between files are automatically handled.
*   `[Link to Page](other-page.md)`
*   `![Image](../images/pic.png)`

### 3.2 Frontmatter (Page Settings)
You can control individual pages by adding "Frontmatter" at the very top of the file (between `---` lines).

```yaml
---
title: My Special Page
template: Article
---

# Page Content
...
```

*   **`title`**: Overrides the browser tab title.
*   **`template`**: Forces a specific layout (e.g., use `Article` layout even if the section defaults to something else).

## 4. Navigation
### 4.1 Auto-Discovery
By default, the engine will list all files in a section if you visit a folder URL (e.g., `/docs/`). This is great for simple notes.

### 4.2 Curated Sidebar (`_sidebar.md`)
To create a custom menu, add a `_sidebar.md` file in your section's folder.

**Example** (`docs/_sidebar.md`):
```markdown
- [Introduction](/intro.md)
- [Installation](/install.md)
- [Advanced](advanced-topic.md)
```
*   **Note**: Use absolute paths (`/intro.md`) for best reliability.
*   Changes to `_sidebar.md` require a `git push` to appear.
