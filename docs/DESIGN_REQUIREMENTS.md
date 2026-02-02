# Design Requirements: GitHub Static Content Engine

## 1. Project Overview
This project is a **Client-Side Content Engine** designed to transform any GitHub repository into a feature-rich, static website hosted on GitHub Pages.

Derived from the `personal-portfolio` reference implementation, this engine abstracts the specific "portfolio" logic into a generic system. It allows users to maintain a website—whether a corporate site, an online book, a blog, or a portfolio—simply by managing Markdown files in their repository.

**Core Philosophy: "Repository as Database"**
*   The GitHub Repository is the database (Content).
*   The React App is the viewer (Presentation).
*   The two are loosely coupled via the GitHub Raw Content API.

## 2. High-Level Architecture
The system operates as a **zeroless-build** Single Page Application (SPA). "Zeroless-build" means that while the core engine is built once, **content updates do not require rebuilding or deploying the application.**

### 2.1 The Workflow
1.  **User Action**: User pushes a new `docs/guide.md` file to their GitHub repository.
2.  **Live Update**: The change is immediately available on the website (e.g., `/guide`) without any CI/CD build pipeline trigger for the site itself.
3.  **Client Logic**:
    *   Visitor loads `https://user.github.io/repo/guide`.
    *   GitHub Pages returns `404.html` (which loads the Engine).
    *   Engine parses URL `/repo/guide`.
    *   Engine fetches `config.json` to map paths to Sections.
    *   Engine fetches `raw.githubusercontent.com/.../guide.md`.
    *   Engine renders the content into the generic template.

## 3. Functional Requirements

### 3.1 Generic Content Management
*   **Markdown-Driven**: The system MUST support rendering standard Markdown files as full HTML pages.
*   **Static Assets**: Support relative referencing of images and files within the repo (e.g., `![diagram](../assets/diag.png)`), automatically rewriting them to valid CDN URLs.

### 3.2 Site Organization (Section Architecture)
*   **Config-Driven Structure**: The site structure is defined in a site-wide `config.json`, not hardcoded in React.
    *   Example: `{ "sections": { "products": "docs/products", "blog": "posts/2023" } }`
*   **Section Templates**: Each section can define a default template family (e.g., the "Blog" section uses the "Article" template, while "Products" uses a "Showcase" template).
*   **Navigation Generation**: The engine should be able to generate navigation menus (Tables of Contents) based on the file structure of a Section.

### 3.3 Extensible Component System
*   **Embedded Components**: Allow inserting interactive widgets into static Markdown via HTML comments.
*   **Pre-defined Library**: Provide a standard library of components suitable for various domains (Charts, Code Blocks, Image Galleries).

### 3.4 Flexible Template System
*   **Template Sets**: A "Theme" is a collection of related templates (e.g., `Home`, `SectionIndex`, `Detail`, `404`).
*   **Home Page Distinction**: The root URL (`/`) often requires a vastly different layout (Landing Page) compared to internal content pages. The engine must support a dedicated `Home` template.
*   **Layout Choice**: Pages must be able to override their section's default template via metadata (e.g., `<!-- page { "template": "landing" } -->`).

### 3.5 Navigation & Discovery
*   **Dual Strategy**: To support both curated and auto-discovered content, the system employs a two-layer strategy:
    1.  **Curated (`_sidebar.md`)**: Checks for a `_sidebar.md` file in the section root. If present, it renders this as the authoritative menu. This allows manual ordering and grouping.
    2.  **Auto-Discovery (GitHub Tree API)**: If no sidebar exists, the system falls back to the **GitHub Tree API**. It fetches the file tree for the section's folder and auto-generates a navigation menu based on the directory structure.
*   **Fallback Justification**: The Tree API provides a "magic" zero-config experience (just add files), while the Sidebar provides necessary control for professional publications.

## 4. Non-Functional Requirements

### 4.1 Deployment & Maintenance
*   **Zero-Maintenance Content**: Non-technical users should be able to update the site content via the GitHub Web Interface.
*   **Hosting**: Strict compatibility with standard GitHub Pages.

### 4.2 Performance
*   **Caching**: Implement aggressive client-side caching to prevent fetching the same Markdown file multiple times.
*   **Rate Limits**: Gracefully handle potential GitHub API rate limits.

## 5. Extension Policy & Security

### 5.1 Content Sanitization (Implemented)
To prevent Cross-Site Scripting (XSS) from untrusted content, the engine strictly sanitizes all rendered Markdown and HTML.
*   **Mechanism**: Uses `rehype-sanitize` to strip `<script>`, `<iframe>`, `<object>`, and dangerous attributes (e.g., `onload`, `javascript:` links).
*   **Configuration**: 
    *   `allowScripts: false` (Default) -> Sanitization Enabled.
    *   `allowScripts: true` (Opt-in) -> Sanitization Disabled. USE WITH CAUTION.

### 5.2 Code vs. Content Separation
*   **Content Repo**: Contains *static* assets (Markdown, JSON, Images).
*   **Engine**: Contains *executable* logic (React components, Templates).
*   **Policy**: The engine DOES NOT load or execute .js files referenced in the Content Repo unless `allowScripts` is strictly enabled and logic is added to support it (currently scope is limited to inline HTML scripts).

## 6. Use Cases

### 6.1 Company Website
*   **Structure**: Home (Landing), Products (Section), Services (Section), About, Contact.
*   **Key Needs**: Professional `Home` template, "Feature Grid" components, Contact Form integration.

### 6.2 Online Book / Documentation
*   **Structure**: Hierarchical Sections (Part 1 -> Chapter 1).
*   **Key Needs**: Sidebar navigation (generated from file tree), "Next/Previous" pagination buttons, heavy reliance on code syntax highlighting.

### 6.3 Personal Blog
*   **Structure**: Reverse-chronological feed of Markdown files in a `posts/` folder.
*   **Key Needs**: "Feed" Template (listing summaries), Tags/Categories support.
