import React, { useEffect, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Routes, useParams } from "react-router-dom";
import config from "./config.json";

// Dynamic template loading
const loadTemplate = async (templateName) => {
    try {
        const templateModule = await import(`./templates/${templateName}.js`);
        return templateModule.default;
    } catch (error) {
        console.warn(`No custom driver for template ${templateName}, using global default.`);
        const globalDefault = await import("./templates/default.js");
        return globalDefault.default;
    }
};

// Parse markdown content
const parseMarkdown = (markdown) => {
    const pageParamsRegex = /<!-- page: ([\s\S]*?) -->/;
    const pageParamsMatch = markdown.match(pageParamsRegex);
    let pageParams = {};

    if (pageParamsMatch) {
        try {
            pageParams = JSON.parse(pageParamsMatch[1].trim());
        } catch (error) {
            console.error("Error parsing page parameters:", error);
        }
    }

    const body = markdown.replace(pageParamsRegex, "").trim();
    const sections = [];
    const componentRegex = /<!-- component:(\w+\.\w+) -->([\s\S]*?)<!-- \/component -->/g;

    let lastIndex = 0;
    let match;
    while ((match = componentRegex.exec(body)) !== null) {
        if (match.index > lastIndex) {
            sections.push({
                type: "markdown",
                content: body.slice(lastIndex, match.index),
            });
        }
        sections.push({
            type: "component",
            name: match[1],
            content: match[2].trim(),
        });
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < body.length) {
        sections.push({
            type: "markdown",
            content: body.slice(lastIndex),
        });
    }

    return { pageParams, sections };
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


// Main App component
const App = () => {
    const [content, setContent] = useState(null);
    const [markdownFiles, setMarkdownFiles] = useState([]);
    const { docsPath } = config;
    const theme = useSelector((state) => state.theme);

    // Fetch the list of markdown files from the repository
    useEffect(() => {
        axios.get(`${docsPath}/`) // Fetch the directory listing (requires GitHub API or a custom endpoint)
            .then((response) => {
                const files = response.data
                    .filter((file) => file.name.endsWith(".md")) // Filter markdown files
                    .map((file) => file.name);
                setMarkdownFiles(files);
            })
            .catch((error) => {
                console.error("Error fetching markdown files:", error);
            });
    }, [docsPath]);

    // Fetch and process a specific markdown file
    const fetchMarkdownFile = async (filename) => {
        try {
            const response = await axios.get(`${docsPath}/${filename}`);
            if (!response.data) {
                throw new Error("Markdown file is empty or invalid");
            }

            const markdownContent = response.data;
            const { pageParams, sections } = parseMarkdown(markdownContent);

            const templateName = pageParams.template || config.defaultTemplate;
            const Template = await loadTemplate(templateName);
            if (!Template) {
                throw new Error("Template not found");
            }

            const parsedSections = await Promise.all(
                sections.map(async (section) => {
                    if (!section) return null;

                    if (section.type === "markdown") {
                        return {
                            type: "markdown",
                            content: <ReactMarkdown>{section.content}</ReactMarkdown>,
                        };
                    } else if (section.type === "component") {
                        let [category, componentName] = section.name.split(".");
                        if (componentName === undefined) {
                            componentName = category;
                        }
                        const Component = await loadComponent(`${category}/${componentName}`);
                        if (!Component) {
                            return {
                                type: "error",
                                content: `Component ${section.name} not found`,
                            };
                        }
                        return {
                            type: "component",
                            content: <Component content={section.content} />,
                        };
                    }
                    return null;
                })
            );

            const filteredSections = parsedSections.filter((section) => section !== null);

            setContent(
                <Template variables={pageParams}>
                    {filteredSections.map((section, index) => (
                        <React.Fragment key={index}>{section.content}</React.Fragment>
                    ))}
                </Template>
            );
        } catch (error) {
            console.error("Error loading markdown file:", error);
            setContent(<div>Error loading markdown file: {error.message}</div>);
        }
    };

    return (
        <Router>
            <div className="App" style={theme}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <div>
                                <h1>Available Markdown Files</h1>
                                <ul>
                                    {markdownFiles.map((file, index) => (
                                        <li key={index}>
                                            <a href={`/${file.replace(".md", "")}`}>{file}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        }
                    />
                    <Route
                        path="/:filename"
                        element={<MarkdownPage fetchMarkdownFile={fetchMarkdownFile} />}
                    />
                </Routes>
            </div>
        </Router>
    );
};

// Component to handle individual markdown files
const MarkdownPage = ({ fetchMarkdownFile }) => {
    const { filename } = useParams();
    const [content, setContent] = useState(null);

    useEffect(() => {
        fetchMarkdownFile(`${filename}.md`).then(() => setContent(content));
    }, [filename, fetchMarkdownFile]);

    return content ? content : <p>Loading...</p>;
};

export default App;