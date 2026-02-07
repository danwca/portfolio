// Enhanced App.js with new markdown parser integration
// This file contains the new initApp function that will replace the old one

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Provider } from 'react-redux';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import store from './store/theme';
import { getRepoFileUrl } from './utils/github';
import { config } from './utils/config';
import { fetchNavigation } from './utils/navigation';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import {
    parseMarkdownFile,
    mergePageConfig,
    parseSections,
    parseComponents,
    interpolateVariables,
    resolveComponentProps
} from './utils/markdownParser';
import { loadComponent as loadRegistryComponent, validateComponentProps } from './components/registry/ComponentRegistry';

// Dynamic template loading (keep existing)
const loadTemplate = async (templateName) => {
    try {
        const templateModule = await import(`./templates/${templateName}.js`);
        return templateModule.default;
    } catch (error) {
        console.warn(`No custom driver for template ${templateName}, using global default.`);
        const globalDefault = await import('./templates/default.js');
        return globalDefault.default;
    }
};

// Helper to process markdown links (keep existing)
const processMarkdownLinks = async (markdownContent, currentFilePath) => {
    const { githubaccount, repository } = await config;

    const getCurrentDir = (filePath) => {
        const lastSlashIndex = filePath.lastIndexOf('/');
        return lastSlashIndex >= 0 ? filePath.substring(0, lastSlashIndex + 1) : '';
    };

    const resolveRelativePath = (linkPath) => {
        const currentDir = getCurrentDir(currentFilePath);
        let fullPath;
        if (linkPath.startsWith('./')) {
            fullPath = currentDir + linkPath.substring(2);
        } else if (linkPath.startsWith('../')) {
            let dir = currentDir;
            let path = linkPath;
            while (path.startsWith('../')) {
                dir = dir.substring(0, dir.lastIndexOf('/', dir.length - 2) + 1);
                path = path.substring(3);
            }
            fullPath = dir + path;
        } else {
            fullPath = currentDir + linkPath;
        }
        return fullPath;
    };

    const replaceAsync = async (str, regex, asyncFn) => {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            promises.push(asyncFn(match, ...args));
            return match;
        });
        const data = await Promise.all(promises);
        return str.replace(regex, () => data.shift());
    };

    let processedContent = await replaceAsync(markdownContent, /!\[([^\]]*)\]\(([^)]+)\)/g, async (match, altText, linkPath) => {
        if (/^(https?:\/|data:)/.test(linkPath)) return match;
        const absoluteVirtualPath = resolveRelativePath(linkPath);
        const rawUrl = await getRepoFileUrl(absoluteVirtualPath);
        return `![${altText}](${rawUrl})`;
    });

    processedContent = await replaceAsync(processedContent, /\[([^\]]+)\]\(([^)]+)\)/g, async (match, linkText, linkPath) => {
        if (/^(https?:|\/|#)/.test(linkPath)) return match;
        if (linkPath.endsWith('.md')) return match;
        const absoluteVirtualPath = resolveRelativePath(linkPath);
        const rawUrl = await getRepoFileUrl(absoluteVirtualPath);
        return `[${linkText}](${rawUrl})`;
    });

    return processedContent;
};

// Render component parts (text and components mixed)
const renderComponentParts = async (parts, data) => {
    const rendered = [];

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];

        if (part.type === 'text') {
            // Interpolate variables in text
            const interpolated = interpolateVariables(part.content, data);
            rendered.push(
                <ReactMarkdown
                    key={`text-${i}`}
                    rehypePlugins={[rehypeRaw, config.allowScripts !== true ? rehypeSanitize : null].filter(Boolean)}
                >
                    {interpolated}
                </ReactMarkdown>
            );
        } else if (part.type === 'component') {
            // Load and render component
            const ComponentClass = await loadRegistryComponent(part.name);

            if (!ComponentClass) {
                rendered.push(
                    <div key={`error-${i}`} style={{ color: 'red', padding: '10px', border: '1px solid red' }}>
                        Component {part.name} not found
                    </div>
                );
                continue;
            }

            // Resolve props with data
            const resolvedProps = resolveComponentProps(part.props, data);

            // Validate props
            const validation = validateComponentProps(part.name, resolvedProps);
            if (!validation.valid) {
                console.error(`Component ${part.name} validation errors:`, validation.errors);
            }
            if (validation.warnings.length > 0) {
                console.warn(`Component ${part.name} warnings:`, validation.warnings);
            }

            // Render component
            rendered.push(
                <ComponentClass key={`comp-${i}`} {...resolvedProps}>
                    {part.children}
                </ComponentClass>
            );
        }
    }

    return rendered;
};

// NEW Enhanced initApp function
export const initAppEnhanced = async () => {
    const path = window.location.pathname.replace(new RegExp(`^/${config.repository}`), '').replace(/^\//, '') || config.homefile || 'README.md';
    const RepoFileUrl = await getRepoFileUrl(path);

    try {
        const response = await axios.get(RepoFileUrl);
        if (!response.data) {
            throw new Error('Markdown file is empty or invalid');
        }

        // Process markdown links
        const markdownContent = await processMarkdownLinks(response.data, path);

        // Parse markdown file into settings and pages
        const { settingsPage, pages } = parseMarkdownFile(markdownContent);

        console.log('[Enhanced Parser] Settings:', settingsPage);
        console.log('[Enhanced Parser] Pages:', pages);

        // Get requested page ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        let pageId = urlParams.get('page') || window.location.hash.substring(1);

        // Default to first page if no ID specified
        const currentPage = pages.find(p => p.id === pageId) || pages[0];

        if (!currentPage) {
            throw new Error('No pages found in markdown file');
        }

        console.log('[Enhanced Parser] Current Page:', currentPage);

        // Merge settings with page frontmatter
        const pageConfig = mergePageConfig(settingsPage, currentPage.frontmatter);

        console.log('[Enhanced Parser] Merged Config:', pageConfig);

        // Parse sections from page body
        const { sections, mainContent } = parseSections(currentPage.body);

        console.log('[Enhanced Parser] Sections:', Object.keys(sections));
        console.log('[Enhanced Parser] Main Content Length:', mainContent.length);

        // Prepare data for interpolation
        const data = {
            ...pageConfig.data,
            ...(settingsPage?.sharedData || {})
        };

        // Render sections
        const renderedSections = {};
        for (const [sectionName, sectionContent] of Object.entries(sections)) {
            const parts = parseComponents(sectionContent);
            renderedSections[sectionName] = await renderComponentParts(parts, data);
        }

        // Render main content
        const mainParts = parseComponents(mainContent);
        const renderedMain = await renderComponentParts(mainParts, data);

        // Update document title
        document.title = pageConfig.title || config.defaultTitle || 'My Portfolio';

        // Determine template
        const templateName = pageConfig.template || config.defaultTemplate || 'default';
        const Template = await loadTemplate(templateName);

        // Fetch navigation
        const parts = path.split('/');
        const firstSegment = parts[0];
        const sectionKey = (config.sections && config.sections[firstSegment]) ? firstSegment : '';
        const navigationData = await fetchNavigation(sectionKey);

        // Render the page
        const root = createRoot(document.getElementById('root'));
        root.render(
            <Provider store={store}>
                <Template
                    variables={{
                        ...pageConfig,
                        currentPageId: currentPage.id,
                        totalPages: pages.length,
                        navigation: navigationData,
                        layout: pageConfig.layout
                    }}
                    sections={renderedSections}
                >
                    {renderedMain}
                </Template>
            </Provider>
        );

        console.log('[Enhanced Parser] Page rendered successfully');

    } catch (error) {
        console.error('Error loading markdown file:', error);

        const root = createRoot(document.getElementById('root'));
        root.render(
            <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>
                <h1>404 - Content Not Found</h1>
                <p>Unable to fetch the content for this page.</p>
                <p style={{ color: '#666', fontSize: '0.9em' }}>
                    Error: {error.message}
                </p>
                <p>
                    <strong>Note:</strong> Since this application fetches content from GitHub,
                    ensure that the file <code>{path}</code> exists in the <code>main</code> branch of your repository.
                    <br />
                    Newly created local files must be pushed to GitHub to be visible.
                </p>
            </div>
        );
    }
};
