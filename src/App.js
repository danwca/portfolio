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
    return `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/docs/${path}`;
};

// Fetch the list of markdown files in the docs folder
const fetchDocsFileList = async () => {
    const { githubaccount, repository } = config;
    const url = `https://api.github.com/repos/${githubaccount}/${repository}/contents/docs`;
    try {
        const response = await axios.get(url);
        return response.data
            .filter(file => file.name.endsWith('.md')) // Filter only markdown files
            .map(file => file.path.replace('docs/', '')); // Remove 'docs/' prefix
    } catch (error) {
        console.error('Error fetching docs file list:', error);
        return [];
    }
};

const App = () => {
    const [content, setContent] = useState(null);
    const [fileList, setFileList] = useState([]);
    const theme = useSelector(state => state.theme);
    useEffect(() => {
        // Fetch the list of markdown files in the docs folder
        fetchDocsFileList().then(files => {
			console.log(files);
            setFileList(files);
            if (files.length > 0) {
                // Load the first markdown file by default
                loadMarkdownFile(files[0]);
            }
        });
    }, []);

    const loadMarkdownFile = async (path) => {
        const markdownUrl = getMarkdownUrl(path);

        // Fetch and process the markdown file
        axios.get(markdownUrl)
            .then(async (response) => {
                if (!response.data) {
                    throw new Error('Markdown file is empty or invalid');
                }
                const markdownContent = response.data;

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
    };

    return (
        <div className="App" style={theme}>
            {/* File list navigation */}
            <div className="file-list">
                {fileList.map(file => (
                    <button key={file} onClick={() => loadMarkdownFile(file)}>
                        {file}
                    </button>
                ))}
            </div>

            {/* Markdown content */}
            {content ? content : <p>Loading...</p>}
        </div>
    );
};

export default App;