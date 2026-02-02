# Design Description: Web Page Template Function

## 1. Design Requirements
The portfolio application requires a flexible system to control the layout and appearance of pages on a per-file basis, without code changes.

*   **Dynamic Layouts**: The system must verify the "template" request and load different React wrapper components (e.g., a "Standard" layout with sidebar vs. a "Full Width" landing page).
*   **Metadata Control**: It must allow setting page-specific metadata (Title, Theme colors) directly from the Markdown file.
*   **Fallback Mechanism**: If no template is specified, it should default to a configured standard template to ensure stability.
*   **Extensibility**: Developers should be able to add new templates just by adding a JavaScript file, with no deeper wiring required.

## 2. Design Architecture

### The "System Component" Pattern
To effectively "communicate" metadata from a static Markdown file to the React runtime, the system uses a special component named `page`.

1.  **Parsing Phase**:
    *   `App.js` scans the Markdown for component tags `<!-- name ... -->`.
    *   When it encounters `<!-- page ... -->`, it loads `src/components/system/page.js`.
    *   It calls the static `parseParameters(content)` method on that component.
    *   **`page.js`** expects the content to be a **JSON string**. It parses this JSON and returns it as an object.

2.  **State Merging**:
    *   The returned object is merged into a global `pageParams` state for that page load.
    *   Keys like `template`, `title`, and `theme` are extracted.

3.  **Template Resolution**:
    *   `App.js` determines the template name in this order:
        1.  `pageParams.template` (from the Markdown file)
        2.  `config.defaultTemplate` (from `config.json`)
        3.  `"default"` (Hardcoded fallback)
    *   It dynamically imports the matching file from `src/templates/[name].js`.

4.  **Rendering**:
    *   The selected Template Component is rendered as the root.
    *   Top-level variables (Title, Pagination) are passed as props (`variables`).
    *   The actual transformed Markdown content is passed as `children`.

## 3. Usage Guide

### Defining a Template in Markdown
To assign a specific template or title to a markdown page, add the `page` component block at the top of your file. The content **must be valid JSON**.

**Example `about.md`**:
```markdown
<!-- page
{
    "template": "portfolio",
    "title": "About Me - The Developer",
    "customHeader": true
}
-->

# Hello World
This content will be rendered inside the "portfolio" template.
```

### Using Variables in Templates
Template components receive the JSON data via the `variables` prop.

```javascript
// src/templates/portfolio.js
const PortfolioTemplate = ({ children, variables }) => {
    return (
        <div className="portfolio-layout">
            <h1>{variables.title}</h1> {/* Renders "About Me - The Developer" */}
            <div className="content">
                {children}
            </div>
        </div>
    );
};
```

## 4. Setup & Extension

### How to Create a New Template
1.  **Create the File**: Add a new React component in `src/templates/`.
    *   Naming convention: `src/templates/my-new-layout.js`.
2.  **Implement the Interface**:
    ```javascript
    import React from 'react';

    const MyNewLayout = ({ children, variables }) => {
        return (
            <div className="my-new-layout">
                {/* Your Custom Header/Sidebar */}
                <header>Special Layout: {variables.title}</header>
                
                {/* The Markdown Content */}
                <main>{children}</main>
            </div>
        );
    };

    export default MyNewLayout;
    ```
3.  **Use It**: In your Markdown file, set `"template": "my-new-layout"`.

### Configuring the Default Template
You can change the default template for the entire repository by editing `config/config.[repo].json`:

```json
{
  "defaultTemplate": "my-new-layout",
  ...
}
```

## 5. Potential Issues & Improvements
*   **JSON Fragility**: The `page` component relies on strict JSON syntax inside the HTML comment. A single trailing comma or missing quote will break the parsing logic. *Improvement: Use YAML or a more forgiving parser.*
*   **Security check**: `page.js` just does `JSON.parse`. It should validate that the output is a flat object to prevent pollution.
