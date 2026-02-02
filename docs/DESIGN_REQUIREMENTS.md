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

## 4. Non-Functional Requirements

### 4.1 Deployment & Maintenance
*   **Zero-Maintenance Content**: Non-technical users should be able to update the site content via the GitHub Web Interface.
*   **Hosting**: Strict compatibility with standard GitHub Pages.

### 4.2 Performance
*   **Caching**: Implement aggressive client-side caching to prevent fetching the same Markdown file multiple times.
*   **Rate Limits**: Gracefully handle potential GitHub API rate limits.

## 5. Extension Policy: Code vs. Content

### 5.1 Primary Policy: Separation of Concerns
To maintain security and simplicity, the **Content Repository** should ideally contain *only* content (Markdown, Images, JSON configuration). The **Engine Repository** contains the executable code.

### 5.2 Advanced Policy: Script Injection (Optional)
For advanced users who need custom logic (e.g., a specific calculator widget for one page) without forking the Engine:
*   **Mechanism**: The Engine *may* optionally load a `custom.js` file from the Content Repository if enabled in config.
*   **Security Warning**: This introduces **Cross-Site Scripting (XSS)** risks if the Content Repository is not strictly controlled.
*   **Recommendation**:
    *   **Default**: Disabled.
    *   **Enterprise/Trusted Mode**: Allowed only if the user explicitly opts-in via a build-time flag, acknowledging the risk.
    *   **Sandboxing**: Ideally, custom components should run in an isolated environment (like an iframe or Shadow DOM) to prevent access to the main application state.

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
