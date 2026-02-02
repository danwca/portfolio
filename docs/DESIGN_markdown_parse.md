# Design Description: Markdown Parse Function

## 1. Design Overview
The Markdown Parsing function is the core content transformation engine of the portfolio application. It turns static markdown files from GitHub into rich, interactive React applications.

Key Capabilities:
*   **Split Pages**: Breaks a single markdown file into multiple "pages" (slides/sections) using separators.
*   **Embed Components**: Replaces special HTML comments `<!-- Component -->` with actual React components (e.g., `<ContactForm />`, `<Education />`).
*   **Resolve Links**: Automatically rewrites relative links (images, links) to point to the correct raw GitHub URL.
*   **Parameter Injection**: Allows markdown to pass data (JSON params) to React components.

## 2. Parsing Logic

The parsing pipeline consists of 4 distinct stages, executed sequentially in `src/App.js` (`initApp`):

### Stage 1: Link Pre-processing (`processMarkdownLinks`)
Before parsing structure, the raw text is scanned to fix broken relative links.
*   **Input**: `![Image](./assets/img.png)`
*   **Logic**: Regex scan detects `./` or `../` in image/link sources.
*   **Output**: `![Image](https://raw.githubusercontent.com/.../assets/img.png)`
*   **Why**: GitHub Pages serves the app from `root`, but the markdown expects to be relative to its file location.

### Stage 2: Page Splitting (`parseMarkdown`)
The content is divided into logical "pages" (useful for pagination or slides).
*   **Separator**: `===` (Triple equals or more)
*   **Regex**: `/^\s*={3,}\s*(?:\[([^\]]+)\])?\s*={3,}\s*$/gm`
*   **Feature**: Supports optional Page IDs: `=== [my-page-id] ===`.
*   **Output**: An array of `Page` objects `{ id, content }`.

### Stage 3: Section/Component Extraction (`parsePageContent`)
Each "page" is further split into mixed chunks of standard Markdown and Special Components.
*   **Regex**: `/<!--\s*([\w.]+)\s*(?:-->)?([\s\S]*?)\s*(?:\/-->|<!--\s*\/\1\s*-->)/g`
*   **Component Syntax**: `<!-- ComponentName --> Params/Content <!-- /ComponentName -->`
*   **Output**: An ordered array of sections:
    ```javascript
    [
      { type: 'markdown', content: "# Hello World..." },
      { type: 'component', name: 'ContactForm', content: "{ ...params... }" },
      { type: 'markdown', content: "Thanks for reading." }
    ]
    ```

### Stage 4: Rendering (`renderMarkdown` logic)
*   **Markdown Sections**: Rendered via `<ReactMarkdown rehypePlugins={[rehypeRaw]}>`. This allows HTML inside markdown (vital for legacy styling).
*   **Component Sections**: 
    1.  Dynamically requested via `require(./components/${name}.js)`.
    2.  If the component exports `parseParameters(content)`, the content string is parsed (usually as JSON) and merged into global `pageParams`.
    3.  The React Component is instantiated with `content` and `pageParams` passed as props.

## 3. Usage Guide

### Writing Standard Markdown
Write standard markdown as usual. It supports GFM (GitHub Flavored Markdown).
```markdown
# Title
## Subtitle
- List item 1
- [Link](https://google.com)
![Image](./img.png)
```

### Creating Pages
Use triple equals to separate content into pages.
```markdown
# Page 1
Content...

=== [page-2] ===

# Page 2
Content...
```

### Embedding Components
Use HTML comments to trigger React components. The content inside the block is passed to the component.

**Example: Contact Form**
```markdown
## Get in Touch

<!-- Get In Touch.ContactForm -->
{
  "email": "me@example.com"
}
<!-- /Get In Touch.ContactForm -->
```

**Example: System Configuration (Metadata)**
```markdown
<!-- system.page -->
{
    "title": "My Portfolio",
    "template": "default"
}
<!-- /system.page -->
```

## 4. Setup & Extension

### Dependencies
The parser relies on these key libraries in `package.json`:
*   `react-markdown`: Core parser.
*   `rehype-raw`: Plugin to enable raw HTML parsing.
*   `axios`: To fetch the raw content.

### Extension: Adding a New Component Parser
If you create a component that needs complex non-JSON parsing (e.g., CSV or YAML), implement `parseParameters`.

1.  **Create Component**: `src/components/MyChart.js`
2.  **Add Parser**:
    ```javascript
    export const parseParameters = (csvContent) => {
        // Custom logic to turn CSV string into object
        const data = parseCSV(csvContent);
        return { chartData: data };
    };
    
    const MyChart = ({ pageParams }) => {
        return <Chart data={pageParams.chartData} />;
    };
    export default MyChart;
    ```
3.  **Use in Markdown**:
    ```markdown
    <!-- MyChart -->
    Jan,10
    Feb,20
    <!-- /MyChart -->
    ```

### Limitations & Issues
1.  **Regex Fragility**: The component regex is strict. Extra spaces or typos in the closing tag (`<!-- /Name -->`) often cause parsing failure.
2.  **Security**: `recursiveMerge` in `App.js` merges component params into the global scope. A malicious component could overwrite global system flags easily.
3.  **No Scoping**: `pageParams` is global for the page. If two charts need different data, they might conflict if they both try to write to `pageParams.data`.
