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
    const sections = [];

    // Combined regex to handle both formats:
    // 1. <!-- componentgroup.componentname markdown code /-->
    // 2. <!-- componentgroup.componentname --> markdown code <!-- /componentgroup.componentname -->
    const componentRegex = /<!--\s*([\w.]+)\s*(?:-->)?([\s\S]*?)\s*(?:\/-->|<!--\s*\/\1\s*-->)/g;

    let lastIndex = 0;
    let match;

    // Process the markdown content
    while ((match = componentRegex.exec(markdown)) !== null) {
        // Add any markdown content before the component
        if (match.index > lastIndex) {
            sections.push({
                type: 'markdown',
                content: markdown.slice(lastIndex, match.index),
            });
        }

        // Extract component name and content
        const [fullMatch, componentName, content] = match;

        // Parse the component name and group
        const [componentGroup, component] = componentName.includes('.')
            ? componentName.split('.')
            : ['system', componentName]; // Default group is 'system'

        // Add the component section
        sections.push({
            type: 'component',
            name: `${componentGroup}.${component}`,
            content: content.trim(),
        });

        // Update the last index
        lastIndex = match.index + fullMatch.length;
    }

    // Add any remaining markdown content
    if (lastIndex < markdown.length) {
        sections.push({
            type: 'markdown',
            content: markdown.slice(lastIndex),
        });
    }

    return sections;
};

// Construct GitHub raw URL for markdown files
const getMarkdownUrl = (path) => {
    const { githubaccount, repository } = config;
    return `https://api.github.com/repos/${githubaccount}/${repository}/contents/docs/${path}`;
};



const recursiveMerge = (target, source) => {
    for (const key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                if (!target[key]) target[key] = {};
                recursiveMerge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
			console.log('recursiveMerge in page.js : ',key, source[key], target[key]);
        }
    }
	//target.test ="here works";
};

// Initialize the app with the file path
export const initApp = async (path) => {
    const { githubaccount, repository } = config;

    const markdownUrl = getMarkdownUrl(path);

    try {
        // Fetch the markdown file
        const response = await axios.get(markdownUrl);
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
        const sections = parseMarkdown(markdownContent);
		console.log('sections : ', sections)
        // Initialize pageParams
        let pageParams = {};

        // Process sections sequentially
        const renderedSections = [];
        for (const section of sections) {
            if (section.type === 'markdown') {
                // Render markdown content
                renderedSections.push({
                    type: 'markdown',
                    content: <ReactMarkdown>{section.content}</ReactMarkdown>,
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
                }else
				{
					console.log(section.name , 'does not have parseParameters')
				}
				if(ComponentModule.default)
				{
					console.log(section.name , ' have page function')
				}else{
					console.log(section.name , ' does not have page function')
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
        }

        // Update the document title if a title is provided in the markdown file
        const title = pageParams.title || config.defaultTitle || 'My Portfolio';
        document.title = title;

        // Load template after all components have been processed
        const templateName = pageParams.template || config.defaultTemplate;
        const Template = await loadTemplate(templateName);
        if (!Template) {
            throw new Error('Template not found');
        }

        // Render the content
        const root = createRoot(document.getElementById('root'));
        root.render(
            <Provider store={store}>
                <Template variables={pageParams}>
            {renderedSections.map((section, index) => {
                // Log information about the section before rendering
                console.log(`Rendering section ${index}:`, {
                    type: section.type,
                    content: section.content,
                });

                // Wrap each section.content in a monitoring component
                return (
                    <React.Fragment key={index}>
                            {section.content}
                    </React.Fragment>
                );
            })}
                </Template>
            </Provider>
        );
    } catch (error) {
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
    }
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