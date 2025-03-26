# Multi-Page Markdown System Design

## Overview
This system extends a React-based markdown renderer to support both single-page and multi-page documents from a single markdown file, with automatic mode detection and seamless rendering.

## File Structure
```
src/
├── App.js                # Main application logic (modified)
├── components/
│   └── system/
│       └── Pagination.js # Pagination component
├── utils/
│   ├── config.js         # Configuration settings
│   └── github.js         # GitHub URL utilities
```

## Markdown File Format

### Multi-page Format
```markdown
<!-- system.template -->
default
<!-- /system.template -->

<!-- system.multipage -->
true
<!-- /system.multipage -->

===[page-1]===
# Page 1 Content
...

===[page-2]===
# Page 2 Content
...
```

### Single-page Format (Default)
```markdown
# Document Title
<!-- components go here -->
...
```

## Configuration Options
- `multipage`: Boolean flag to enable multi-page mode (default: false)
- `template`: Template name for document rendering
- Other custom parameters as needed

## System Modes

### 1. Single-Page Mode (Default)
- Combines all content after the first page (parameters page)
- No pagination controls shown
- Simple document structure

### 2. Multi-Page Mode
- Requires explicit `multipage: true` parameter
- Shows pagination controls
- Each page between `===` markers is rendered separately
- Supports page-specific parameters

## Key Functions

### 1. `parseMarkdown` (Updated)
```javascript
const parseMarkdown = (markdown) => {
    const pageRegex = /^\s*={3,}\s*(?:\[([^\]]+)\])?\s*={3,}\s*$/gm;
    const pages = [];
    let lastIndex = 0;
    let match;
    
    while ((match = pageRegex.exec(markdown)) !== null) {
        if (match.index > lastIndex) {
            pages.push({
                content: markdown.slice(lastIndex, match.index).trim(),
                id: match[1] || `page-${pages.length + 1}`
            });
        }
        lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < markdown.length) {
        pages.push({
            content: markdown.slice(lastIndex).trim(),
            id: `page-${pages.length + 1}`
        });
    }
    
    return pages;
};
```

### 2. `initApp` Flow Changes
1. **Initial Load**:
   - Fetch markdown content
   - Parse into potential pages
   - Process first page for parameters

2. **Mode Detection**:
   ```javascript
   const isMultiPage = pageParams.multipage === true;
   ```

3. **Content Processing**:
   - Single-page: Combine all content
   - Multi-page: Isolate current page content

4. **Rendering**:
   - Apply appropriate template
   - Inject pagination controls if needed

## Key Code Snippets

### Mode Handling
```javascript
if (!isMultiPage) {
    // Combine all pages into one (except the first page which contains params)
    currentContent = rawPages.slice(1).map(p => p.content).join('\n\n');
    allPages = [{ id: 'single-page', content: currentContent }];
} else {
    // Multi-page mode - use the requested page or default to first
    if (!pageId && rawPages.length > 0) {
        pageId = rawPages[0].id;
    }
    const currentPage = rawPages.find(page => page.id === pageId) || rawPages[0];
    currentContent = currentPage.content;
    allPages = rawPages;
}
```

### Pagination Integration
```javascript
pageParams.currentPageId = isMultiPage ? pageId : 'single-page';
pageParams.totalPages = isMultiPage ? allPages.length : 1;
pageParams.isMultiPage = isMultiPage;
```

## Considerations

1. **Backward Compatibility**:
   - Existing single-page documents work without modification
   - New `multipage` parameter is optional

2. **Performance**:
   - Only renders the current page in multi-page mode
   - Still processes all content in single-page mode

3. **URL Handling**:
   - Supports both query parameters (`?page=page-2`) and hash fragments (`#page-2`)
   - Maintains existing path parameter functionality

4. **Error Handling**:
   - Gracefully falls back to single-page mode if parsing fails
   - Shows 404 for invalid page requests in multi-page mode

5. **Extensibility**:
   - Page-specific parameters can be added to any page
   - Template system works for both modes

## Additional Recommendations

1. **Caching**:
   - Consider caching parsed page structure for better performance

2. **SEO Considerations**:
   - Add meta tags for multi-page documents
   - Consider server-side rendering for critical pages

3. **Transition Effects**:
   - Could add page transition animations for multi-page mode

4. **Deep Linking**:
   - Ensure all pages are directly accessible via URL
   - Consider adding anchor links within pages

This design provides a flexible system that can handle both simple documents and complex multi-page presentations while maintaining clean markdown authoring and efficient rendering.