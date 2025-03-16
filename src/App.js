import './app.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import config from './config.json';
import { useSelector, Provider } from 'react-redux';
import { createRoot } from 'react-dom/client'; // Use createRoot from react-dom/client
import store from './store/theme'; // Ensure the Redux store is imported

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

// Load template assets (CSS and JS)
const loadTemplateAssets = (templateName) => {
    const cssPath = `${process.env.PUBLIC_URL}/${templateName}/styles.css`;
    const jsPath = `${process.env.PUBLIC_URL}/${templateName}/script.js`;

    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement('script');
    script.src = jsPath;
    document.body.appendChild(script);
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

// Parse markdown file
const parseMarkdown = (markdown) => {
    // Extract <!-- page: ... --> parameters
    const pageParamsRegex = /<!-- page: ([\s\S]*?) -->/;
    console.log("check input:", markdown);
    const pageParamsMatch = markdown.match(pageParamsRegex);
    let pageParams = {};

    if (pageParamsMatch) {
        try {
            pageParams = JSON.parse(pageParamsMatch[1].trim());
        } catch (error) {
            console.error('Error parsing page parameters:', error);
        }
    }

    // Extract sections (markdown or component blocks)
    const body = markdown.replace(pageParamsRegex, '').trim();
    const sections = [];
    const componentRegex = /<!-- component:(\w+\.\w+) -->([\s\S]*?)<!-- \/component -->/g;

    let lastIndex = 0;
    let match;
    while ((match = componentRegex.exec(body)) !== null) {
        if (match.index > lastIndex) {
            sections.push({
                type: 'markdown',
                content: body.slice(lastIndex, match.index),
            });
        }
        sections.push({
            type: 'component',
            name: match[1],
            content: match[2].trim(),
        });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < body.length) {
        sections.push({
            type: 'markdown',
            content: body.slice(lastIndex),
        });
    }

    return { pageParams, sections };
};

// Construct GitHub raw URL for markdown files
const getMarkdownUrl = (path) => {
    const { githubaccount, repository } = config;
    return `https://api.github.com/repos/${githubaccount}/${repository}/contents/docs/${path}`;
};

// Initialize the app with the file path
export const initApp = (path) => {
    const { githubaccount, repository } = config;

    const markdownUrl = getMarkdownUrl(path);

    // Fetch and process the markdown file
    axios.get(markdownUrl)
        .then(async (response) => {
            if (!response.data) {
                throw new Error('Markdown file is empty or invalid');
            }

            // Fetch the raw content using the download_url
            const downloadUrl = response.data.download_url;
            const markdownResponse = await axios.get(downloadUrl);

            if (!markdownResponse.data) {
                throw new Error('Markdown file is empty or invalid');
            }

            const markdownContent = markdownResponse.data;

            // Parse markdown
            const { pageParams, sections } = parseMarkdown(markdownContent);

            // Debug: Print page parameters
            console.log('Page Parameters:', pageParams);
			// Update the document title if a title is provided in the markdown file
			if (pageParams.title) {
				document.title = pageParams.title;
			} else {
				document.title = config.defaultTitle || 'My Portfolio'; // Fallback to a default title
			}
            
			// Load template
            const templateName = pageParams.template || config.defaultTemplate;
            const Template = await loadTemplate(templateName);
            if (!Template) {
                throw new Error('Template not found');
            }

            // Debug: Print template
            console.log('Template:', Template);

            // Parse sections
            const parsedSections = await Promise.all(
                sections.map(async (section) => {
                    if (!section) return null;

                    if (section.type === 'markdown') {
                        return {
                            type: 'markdown',
                            content: <ReactMarkdown>{section.content}</ReactMarkdown>,
                        };
                    } else if (section.type === 'component') {
                        // Load component
                        let [category, componentName] = section.name.split('.');
                        if (componentName === undefined) {
                            componentName = category;
                        }
                        const Component = await loadComponent(`${category}/${componentName}`);
                        if (!Component) {
                            return {
                                type: 'error',
                                content: `Component ${section.name} not found`,
                            };
                        }
                        return {
                            type: 'component',
                            content: <Component content={section.content} />,
                        };
                    }
                    return null;
                })
            );

            // Filter out null values
            const filteredSections = parsedSections.filter(section => section !== null);

            // Debug: Print filtered sections
            console.log('Filtered Sections:', filteredSections);

            // Render the content
            const root = createRoot(document.getElementById('root'));
            root.render(
                <Provider store={store}>
                    <Template variables={pageParams}>
                        {filteredSections.map((section, index) => {
                            // Debug: Print section information
                            console.log(`Section ${index}:`, section);

                            return (
                                <React.Fragment key={index}>
                                    {section.content}
                                </React.Fragment>
                            );
                        })}
                    </Template>
                </Provider>
            );
        })
        .catch((error) => {
            console.error('Error loading markdown file:', error);
            const root = createRoot(document.getElementById('root'));
            root.render(
                <Provider store={store}>
                    <div className="error-page">
                        <h1>404 - Page Not Found</h1>
                        <p>The requested page does not exist.</p>
                    </div>
                </Provider>
            );
        });
};

// Extract path from URL
export const getPathFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    let path = urlParams.get('path'); // Get the path from the query parameter

    if (!path) {
        // If no query parameter, extract the path from the URL
        const fullPath = window.location.pathname; // e.g., "/portfolio/path/to/file.md"
        const repositoryPath = config.repository; // e.g., "portfolio"

        // Remove the repository path from the full path
        const pathWithoutRepository = fullPath.replace(new RegExp(`^/${repositoryPath}`), '');

        // Remove leading slash and default to 'example.md' if no path is provided
        path = pathWithoutRepository.replace(/^\//, '') || 'killer-abhi.md';
    }

    return path;
};

// Main App component
const App = () => {
    const theme = useSelector((state) => {
        console.log('Redux State:', state);
        return state;
    });

    useEffect(() => {
        // Extract the path from the URL
        const path = getPathFromUrl();
        console.log('App path:', path);

        // Initialize the app with the path
        initApp(path);
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