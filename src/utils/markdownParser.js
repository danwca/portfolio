// Enhanced Markdown Parser with Settings Page and Component Injection Support
import fm from 'front-matter';

/**
 * Parse markdown file into pages with settings page support
 * @param {string} markdown - Raw markdown content
 * @returns {Object} - { settingsPage, pages }
 */
export const parseMarkdownFile = (markdown) => {
    // Split by page separators (4 or more = characters)
    const pageRegex = /^\s*={4,}\s*$/gm;
    const pageParts = [];
    let lastIndex = 0;
    let match;

    while ((match = pageRegex.exec(markdown)) !== null) {
        if (match.index > lastIndex) {
            pageParts.push(markdown.slice(lastIndex, match.index).trim());
        }
        lastIndex = match.index + match[0].length;
    }

    // Add the last page if there's remaining content
    if (lastIndex < markdown.length) {
        pageParts.push(markdown.slice(lastIndex).trim());
    }

    // If no page separators found, treat the whole content as a single page
    if (pageParts.length === 0) {
        pageParts.push(markdown.trim());
    }

    // Parse each page part
    let settingsPage = null;
    const pages = [];

    pageParts.forEach((part, index) => {
        const parsed = fm(part);
        const frontmatter = parsed.attributes;
        const body = parsed.body;

        // Check if this is a settings page
        if (frontmatter.type === 'settings') {
            settingsPage = {
                defaultTemplate: frontmatter.defaultTemplate,
                defaultLayout: frontmatter.defaultLayout,
                sharedData: frontmatter.sharedData || {},
                components: frontmatter.components || [],
                ...frontmatter
            };
        } else {
            // Regular page
            pages.push({
                id: frontmatter.id || `page-${pages.length + 1}`,
                frontmatter,
                body,
                index
            });
        }
    });

    return { settingsPage, pages };
};

/**
 * Merge settings page data with page frontmatter
 * @param {Object} settingsPage - Settings page data
 * @param {Object} pageFrontmatter - Page frontmatter
 * @returns {Object} - Merged configuration
 */
export const mergePageConfig = (settingsPage, pageFrontmatter) => {
    if (!settingsPage) return pageFrontmatter;

    const merged = {
        template: pageFrontmatter.template || settingsPage.defaultTemplate,
        layout: pageFrontmatter.layout || settingsPage.defaultLayout,
        components: [...(settingsPage.components || []), ...(pageFrontmatter.components || [])],
        data: {
            ...(settingsPage.sharedData || {}),
            ...(pageFrontmatter.data || {})
        },
        ...pageFrontmatter
    };

    return merged;
};

/**
 * Parse sections from markdown content using ::: syntax
 * @param {string} content - Markdown content
 * @returns {Object} - { sections, mainContent }
 */
export const parseSections = (content) => {
    const sectionRegex = /^:::+\s+section\s+([a-zA-Z0-9-]+)\s*\n([\s\S]*?)^:::+\s*$/gm;
    const sections = {};
    let mainContent = content;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
        const [fullMatch, sectionName, sectionContent] = match;
        sections[sectionName] = sectionContent.trim();
        // Remove section from main content
        mainContent = mainContent.replace(fullMatch, '');
    }

    return {
        sections,
        mainContent: mainContent.trim()
    };
};

/**
 * Parse component injection syntax {{ComponentName param="value"}}
 * @param {string} content - Markdown content
 * @returns {Array} - Array of content parts (text and components)
 */
export const parseComponents = (content) => {
    // Match {{ComponentName param="value"}} or {{ComponentName}}content{{/ComponentName}}
    const componentRegex = /\{\{([A-Z][a-zA-Z0-9]*)\s*([^}]*?)\s*\}\}([\s\S]*?)\{\{\/\1\}\}|\{\{([A-Z][a-zA-Z0-9]*)\s*([^}]*?)\s*\}\}/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
        // Add text before component
        if (match.index > lastIndex) {
            parts.push({
                type: 'text',
                content: content.slice(lastIndex, match.index)
            });
        }

        // Determine if it's a block component or inline component
        if (match[1]) {
            // Block component: {{ComponentName}}content{{/ComponentName}}
            parts.push({
                type: 'component',
                name: match[1],
                props: parseComponentProps(match[2]),
                children: match[3]
            });
        } else {
            // Inline component: {{ComponentName param="value"}}
            parts.push({
                type: 'component',
                name: match[4],
                props: parseComponentProps(match[5]),
                children: null
            });
        }

        lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < content.length) {
        parts.push({
            type: 'text',
            content: content.slice(lastIndex)
        });
    }

    return parts.length > 0 ? parts : [{ type: 'text', content }];
};

/**
 * Parse component props from string
 * @param {string} propsString - Props string like 'param1="value1" param2="value2"'
 * @returns {Object} - Props object
 */
export const parseComponentProps = (propsString) => {
    if (!propsString || !propsString.trim()) return {};

    const props = {};
    // Match param="value" or param=value or param={variable}
    const propRegex = /([a-zA-Z][a-zA-Z0-9]*)=(?:"([^"]*)"|([a-zA-Z][a-zA-Z0-9]*)|\{([^}]+)\})/g;
    let match;

    while ((match = propRegex.exec(propsString)) !== null) {
        const [, key, quotedValue, bareValue, variableValue] = match;
        if (quotedValue !== undefined) {
            props[key] = quotedValue;
        } else if (bareValue !== undefined) {
            props[key] = bareValue;
        } else if (variableValue !== undefined) {
            props[key] = { __variable: variableValue };
        }
    }

    return props;
};

/**
 * Interpolate variables in content using {{variableName}} syntax
 * @param {string} content - Content with variables
 * @param {Object} data - Data object
 * @returns {string} - Content with interpolated variables
 */
export const interpolateVariables = (content, data) => {
    if (!content || !data) return content;

    // Match {{variableName}} but not {{ComponentName ...}}
    const variableRegex = /\{\{([a-z][a-zA-Z0-9.]*)\}\}/g;

    return content.replace(variableRegex, (match, varPath) => {
        // Support dot notation: data.field.subfield
        const value = varPath.split('.').reduce((obj, key) => obj?.[key], data);
        return value !== undefined ? value : match;
    });
};

/**
 * Resolve component prop variables
 * @param {Object} props - Component props
 * @param {Object} data - Data object
 * @returns {Object} - Props with resolved variables
 */
export const resolveComponentProps = (props, data) => {
    const resolved = {};

    for (const [key, value] of Object.entries(props)) {
        if (value && typeof value === 'object' && value.__variable) {
            // Resolve variable reference
            const varPath = value.__variable;
            const resolvedValue = varPath.split('.').reduce((obj, k) => obj?.[k], data);
            resolved[key] = resolvedValue;
        } else {
            resolved[key] = value;
        }
    }

    return resolved;
};

export default {
    parseMarkdownFile,
    mergePageConfig,
    parseSections,
    parseComponents,
    parseComponentProps,
    interpolateVariables,
    resolveComponentProps
};
