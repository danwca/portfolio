import './app.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import config from './config.json';
import { useSelector } from "react-redux";

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

    // Get the base URL of the app (e.g., "https://danwca.github.io/portfolio")
    const baseUrl = window.location.origin + window.location.pathname.split('/').slice(0, -1).join('/');

    // Construct the raw GitHub URL
    // return `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/docs/${path}`;
    return `https://api.github.com/repos/${githubaccount}/${repository}/contents/docs/${path}`;

};
const App = () => {
    const [content, setContent] = useState(null);
    const theme = useSelector(state => state.theme);

    useEffect(() => {
        // Extract the markdown file path from the URL
        // const path = window.location.pathname.replace(/^\//, ''); // Remove leading slash
        //const markdownUrl = getMarkdownUrl(path || 'example.md'); // Default to 'example.md' if no path
		const fullPath = window.location.pathname; // e.g., "/portfolio/path/to/file.md"
		const repositoryPath = config.repository; // e.g., "portfolio"

		// Remove the repository path from the full path
		const pathWithoutRepository = fullPath.replace(new RegExp(`^/${repositoryPath}`), '');
	
		// Remove leading slash and default to 'example.md' if no path is provided
		const path = pathWithoutRepository.replace(/^\//, '') || 'example.md';
	
		// Construct the markdown URL
		const markdownUrl = getMarkdownUrl(path);
		
		
		
        // Fetch and process the markdown file
        axios.get(markdownUrl)
            .then(async (response) => {
                if (!response.data) {
                    throw new Error('Markdown file is empty or invalid');
                }
                //const markdownContent = response.data;

                // Step 2: Fetch the raw content using the download_url
                const downloadUrl = response.data.download_url;
                const markdownResponse = await axios.get(downloadUrl);

                if (!markdownResponse.data) {
                    throw new Error('Markdown file is empty or invalid');
                }

                const markdownContent = markdownResponse.data;
				
				
                // Parse markdown
                const { pageParams, sections } = parseMarkdown(markdownContent);

                // Load template
                const templateName = pageParams.template || config.defaultTemplate;
                const Template = await loadTemplate(templateName);
                if (!Template) {
                    throw new Error('Template not found');
                }

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

                // Set content
                setContent(
                    <Template variables={pageParams}>
                        {filteredSections.map((section, index) => (
                            <React.Fragment key={index}>
                                {section.content}
                            </React.Fragment>
                        ))}
                    </Template>
                );
            })
            .catch((error) => {
                console.error('Error loading markdown file:', error);
                setContent(<div>Error loading markdown file: {error.message}</div>);
            });
    }, []);

    return (
        <div className="App" style={theme}>
            {content ? content : <p>Loading...</p>}
        </div>
    );
};

export default App;