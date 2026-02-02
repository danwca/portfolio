import './app.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useSelector, Provider } from 'react-redux';
import { createRoot } from 'react-dom/client'; // Use createRoot from react-dom/client
import store from './store/theme'; // Ensure the Redux store is imported
import { getRepoFileUrl } from './utils/github'; // Import the function
import { config } from './utils/config'; // Import the config
import { fetchNavigation } from './utils/navigation'; // Import navigation
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import fm from 'front-matter'; // Import front-matter parser

// Dynamic template loading
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


// Dynamic component loading
const loadComponent = async (componentPath) => {
    try {
        const module = await import(`./components/${componentPath}`);
        return module.default;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        return null;
    }
};

const parseMarkdown = (markdown) => {
    // First split by page separators (=== with optional page ID)
    const pageRegex = /^\s*={3,}\s*(?:\[([^\]]+)\])?\s*={3,}\s*$/gm;
    const pages = [];
    let lastIndex = 0;
    let match;

    // Split the markdown into pages
    while ((match = pageRegex.exec(markdown)) !== null) {
        if (match.index > lastIndex) {
            pages.push({
                content: markdown.slice(lastIndex, match.index).trim(),
                id: match[1] || `page-${pages.length + 1}` // Default ID if not specified
            });
        }
        lastIndex = match.index + match[0].length;
    }

    // Add the last page if there's remaining content
    if (lastIndex < markdown.length) {
        pages.push({
            content: markdown.slice(lastIndex).trim(),
            id: `page-${pages.length + 1}`
        });
    }

    // If no page separators found, treat the whole content as a single page
    if (pages.length === 0) {
        pages.push({
            content: markdown.trim(),
            id: 'page-1'
        });
    }

    return pages;
};


// Helper function to parse page content into sections
const parsePageContent = (content) => {
    const sections = [];
    const componentRegex = /<!--\s*([\w.]+)\s*(?:-->)?([\s\S]*?)\s*(?:\/-->|<!--\s*\/\1\s*-->)/g;
    let lastIndex = 0;
    let match;

    while ((match = componentRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
            sections.push({
                type: 'markdown',
                content: content.slice(lastIndex, match.index),
            });
        }

        const [fullMatch, componentName, componentContent] = match;
        const [componentGroup, component] = componentName.includes('.')
            ? componentName.split('.')
            : ['system', componentName];

        sections.push({
            type: 'component',
            name: `${componentGroup}.${component}`,
            content: componentContent.trim(),
        });

        lastIndex = match.index + fullMatch.length;
    }

    if (lastIndex < content.length) {
        sections.push({
            type: 'markdown',
            content: content.slice(lastIndex),
        });
    }

    return sections;
};



// Parse markdown file
const renderMarkdown = (sections) => {
}

const recursiveMerge = (target, source) => {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                recursiveMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
            console.log('recursiveMerge in page.js : ', key, source[key], target[key]);
        }
    }
    //target.test ="here works";
};


// Add this function to process markdown links
const processMarkdownLinks = async (markdownContent, currentFilePath) => {
    // Get the base GitHub raw URL. We cannot pre-calculate it fully because it depends on sections now.
    // However, for relative links within a file, we largely just need to resolve them relative to the current file.

    const { githubaccount, repository } = await config;
    const baseRepoUrl = `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/`;

    // We need to resolve the current file's directory relative to repo root.
    // currentFilePath comes from App.js -> getPathFromUrl(). 
    // If getPathFromUrl returns "docs/intro.md", then directory is "docs/".
    // If getRepoFileUrl logic added a prefix (e.g. "docs/"), that logic is hidden inside getRepoFileUrl.
    // CRITICAL: App.js passes the "virtual path" or the "resolved path"? 
    // Let's assume App.js now passes the RESOLVED REPO PATH. 

    const getCurrentDir = (filePath) => {
        const lastSlashIndex = filePath.lastIndexOf('/');
        return lastSlashIndex >= 0 ? filePath.substring(0, lastSlashIndex + 1) : '';
    };

    // If currentFilePath is "intro.md" but it effectively lives in "docs/intro.md" due to root mapping,
    // we need to know that.
    // Ideally, App.js should pass the FULL REPO PATH to this function.
    // For now, let's assume currentFilePath IS the full repo path (resolved by App.js + getRepoFileUrl logic).

    // Wait, processMarkdownLinks is called with `path`. In App.js:
    // const path = await getPathFromUrl();
    // ... processMarkdownLinks(data, path);

    // If `getPathFromUrl` returns the "browser path" (virtual), we might be missing the "docs/" prefix 
    // if it was added implicitly by `getRepoFileUrl`.

    // FIX: We need to ask `getRepoFileUrl` for the full path of the current file to know where we are.
    // But getRepoFileUrl returns a full URL. Let's parse it if needed, or better, 
    // let's rely on getRepoFileUrl helper to resolve relative paths too? No, that's async and messy in regex.

    // Quick fix: Re-resolve the current folder using the same logic as getRepoFileUrl
    // OR, assume we only support relative links that work if we simply append them to the current "virtual directory".
    // But if the image is in `docs/img.png` and we are at `/intro` (virtual) mapping to `docs/intro`,
    // valid markdown is `![img](img.png)`. 
    // If we resolve `img.png` relative to `/` -> `/img.png`. 
    // getRepoFileUrl(`/img.png`) -> `docs/img.png` (via root mapping). Correct.

    // So we just need to construct the absolute path and pass it to getRepoFileUrl?
    // Yes.

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

    // Helper to replace async
    const replaceAsync = async (str, regex, asyncFn) => {
        const promises = [];
        str.replace(regex, (match, ...args) => {
            promises.push(asyncFn(match, ...args));
            return match;
        });
        const data = await Promise.all(promises);
        return str.replace(regex, () => data.shift());
    }

    // Rewrite logic to use async replacement to call getRepoFileUrl
    let processedContent = await replaceAsync(markdownContent, /!\[([^\]]*)\]\(([^)]+)\)/g, async (match, altText, linkPath) => {
        if (/^(https?:|\/|data:)/.test(linkPath)) return match;

        const absoluteVirtualPath = resolveRelativePath(linkPath);
        // Now resolve this virtual path to a real GitHub URL
        const rawUrl = await getRepoFileUrl(absoluteVirtualPath);
        return `![${altText}](${rawUrl})`;
    });

    processedContent = await replaceAsync(processedContent, /\[([^\]]+)\]\(([^)]+)\)/g, async (match, linkText, linkPath) => {
        if (/^(https?:|\/)/.test(linkPath)) return match;
        if (linkPath.endsWith('.md')) return match;

        const absoluteVirtualPath = resolveRelativePath(linkPath);
        const rawUrl = await getRepoFileUrl(absoluteVirtualPath);
        return `[${linkText}](${rawUrl})`;
    });

    return processedContent;
};

// Extract path from URL
export const getPathFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const { homefile, repository } = await config;
    let path = urlParams.get('path'); // Get the path from the query parameter

    const homepagefile = homefile || 'README.md';

    if (!path) {
        // If no query parameter, extract the path from the URL
        const fullPath = window.location.pathname; // e.g., "/portfolio/path/to/file.md"

        // Remove the repository path from the full path
        const pathWithoutRepository = fullPath.replace(new RegExp(`^/${repository}`), '');

        // Remove leading slash and default to 'example.md' if no path is provided
        path = pathWithoutRepository.replace(/^\//, '') || homepagefile;
    }
    //console.log(path,repository, window.location.pathname, config);
    return path;
};


// Initialize the app with the file path, share with 404.js
export const initApp = async () => {
    const { githubaccount, repository } = config;
    const path = await getPathFromUrl();
    const RepoFileUrl = await getRepoFileUrl(path);

    try {
        const response = await axios.get(RepoFileUrl);
        if (!response.data) {
            throw new Error('Markdown file is empty or invalid');
        }

        // Parse Frontmatter
        const parsedContent = fm(response.data);
        const frontmatter = parsedContent.attributes;
        const markdownBody = parsedContent.body;

        const markdownContent = await processMarkdownLinks(markdownBody, path);

        // Parse into pages first
        const pages = parseMarkdown(markdownContent);


        // Get requested page ID from URL (either hash or query param)
        const urlParams = new URLSearchParams(window.location.search);
        let pageId = urlParams.get('page') || window.location.hash.substring(1);
        if (!pageId && pages.length > 0) {
            pageId = pages[0].id; // Default to first page
        }

        // Find the requested page
        const currentPage = pages.find(page => page.id === pageId) || pages[0];

        // Now parse the current page's content into sections
        const sections = parsePageContent(currentPage.content);


        // Rest of your existing initApp logic...
        let pageParams = { ...frontmatter }; // Initialize with frontmatter attributes
        const renderedSections = [];
        let index = 0;



        for (const section of sections) {
            if (section.type === 'markdown') {
                const DebugMarkdown = ({ children }) => {
                    // Determine plugins based on config
                    const plugins = [rehypeRaw];
                    if (config.allowScripts !== true) {
                        plugins.push(rehypeSanitize);
                    }

                    const rendered = <ReactMarkdown rehypePlugins={plugins}>{children}</ReactMarkdown>;

                    return rendered;
                };

                // Usage with section index
                renderedSections.push({
                    type: 'markdown',
                    content: <DebugMarkdown sectionIndex={index}>{section.content}</DebugMarkdown>,
                });
            } else if (section.type === 'component') {
                // Load and execute the component
                const [componentGroup, componentName] = section.name.split('.');

                const ComponentModule = await require(`./components/${componentGroup}/${componentName}.js`);
                if (!ComponentModule || !ComponentModule.default) {
                    renderedSections.push({
                        type: 'error',
                        content: `Component ${section.name} not found`,
                    });
                    continue;
                }

                console.log(section.name, ' loaded ', ComponentModule);
                // Check if the component has a `parseParameters` function
                if (ComponentModule.parseParameters) {
                    const params = ComponentModule.parseParameters(section.content);
                    recursiveMerge(pageParams, params); // Merge params into pageParams
                    console.log(section.name, ' hello parseParameters : ', pageParams, params);
                } else {
                    console.log(section.name, 'does not have parseParameters')
                }
                if (ComponentModule.default) {
                    console.log(section.name, ' have page function')
                } else {
                    console.log(section.name, ' does not have page function')
                }

                const Component = ComponentModule.default; // Get the default export (the component itself)

                // Render the component and capture its output
                const componentOutput = (
                    <Provider store={store}>
                        <Component
                            content={section.content}
                            pageParams={pageParams} // Pass pageParams as a Map
                        />
                    </Provider>
                );

                console.log(section.name, " returns ", componentOutput);
                console.log(section.name, " params ", pageParams);

                // Add the rendered component output to the sections
                renderedSections.push({
                    type: 'component',
                    content: componentOutput,
                });
            }
            index++;
        }

        // Update the document title if a title is provided in the markdown file
        const title = currentPage.title || pageParams.title || config.defaultTitle || 'My Portfolio';
        document.title = title;

        // Determine the current section from URL path
        // (We need to do this again or reuse logic, simple way is to check path prefix)
        // Note: 'path' here is the virtual path from URL (e.g. docs/intro)

        // Determine the current section from URL path
        const parts = path.split('/');
        const firstSegment = parts[0];
        let sectionTemplate = null;
        let sectionKey = "";

        // Check if the first segment is a valid section
        if (config.sections && config.sections[firstSegment]) {
            sectionKey = firstSegment;
        }

        // Fetch Navigation for this section
        // Now we pass the correct section key (e.g., "docs" or "")
        // navigation.js handles resolving key -> folder
        const navigationData = await fetchNavigation(sectionKey);
        console.log('[App] Navigation Data:', navigationData);

        if (config.sections) {
            if (config.sections[firstSegment]) {
                const sec = config.sections[firstSegment];
                if (typeof sec === 'object' && sec.template) {
                    sectionTemplate = sec.template;
                }
            } else if (config.sections[""]) {
                const sec = config.sections[""];
                if (typeof sec === 'object' && sec.template) {
                    sectionTemplate = sec.template;
                }
            }
        }

        // Use page-specific template if defined, then section template, then global default
        const templateName = currentPage.template || pageParams.template || sectionTemplate || config.defaultTemplate;

        console.log('[App] Template Selection Logic:', {
            path,
            firstSegment,
            'config.sections': config.sections,
            sectionTemplate,
            'pageParams.template': pageParams.template,
            'currentPage.template': currentPage.template,
            'config.defaultTemplate': config.defaultTemplate,
            'FINAL DECISION': templateName
        });

        const Template = await loadTemplate(templateName);

        // Render the content
        const root = createRoot(document.getElementById('root'));
        root.render(
            <Provider store={store}>
                <Template variables={{
                    ...pageParams,
                    currentPageId: currentPage.id,
                    totalPages: pages.length,
                    navigation: navigationData // Pass navigation data
                }}>
                    {renderedSections.map((section, index) => (
                        <React.Fragment key={index}>
                            {section.content}
                        </React.Fragment>
                    ))}
                </Template>
            </Provider>
        );

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

// Construct GitHub raw URL for markdown files
const getMarkdownUrl = (path) => {
    const { githubaccount, repository } = config;
    return `https://api.github.com/repos/${githubaccount}/${repository}/contents/docs/${path}`;
};



// Main App component, share with 404.js
const App = () => {
    const theme = useSelector((state) => {
        //console.log('Redux State:', state);
        return state;
    });

    useEffect(() => {
        // Extract the path from the URL
        //const path = getPathFromUrl();

        // Initialize the app with the path
        initApp();
    }, []);

    return (
        <div className="App" style={theme.theme}>
            <div id="root">
                <p>Loading...</p>
            </div>
        </div>
    );
};

// Render the app with the Provider
const root = createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
        <App />
    </Provider>
);

// Export App for regular process
export default App;