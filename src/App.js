import './app.css';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import config from './config.json';
import { useSelector } from "react-redux";

// 动态加载模板
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

// 加载模板的静态资源
const loadTemplateAssets = (templateName) => {
    const cssPath = `${process.env.PUBLIC_URL}/${templateName}/styles.css`;
    const jsPath = `${process.env.PUBLIC_URL}/${templateName}/script.js`;

    // 动态加载 CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cssPath;
    document.head.appendChild(link);

    // 动态加载 JS
    const script = document.createElement('script');
    script.src = jsPath;
    document.body.appendChild(script);
};

// 动态加载组件
const loadComponent = async (componentPath) => {
    try {
        const module = await import(`./components/${componentPath}`);
        return module.default;
    } catch (error) {
        console.error(`Error loading component ${componentPath}:`, error);
        return null;
    }
};

// 解析 markdown 文件
const parseMarkdown = (markdown) => {
    // 提取 <!-- page: ... --> 中的参数
    const pageParamsRegex = /<!-- page: ([\s\S]*?) -->/;
    const pageParamsMatch = markdown.match(pageParamsRegex);
    let pageParams = {};

    if (pageParamsMatch) {
        try {
            // 将注释块中的内容解析为 JSON 对象
            pageParams = JSON.parse(pageParamsMatch[1].trim());
        } catch (error) {
            console.error('Error parsing page parameters:', error);
        }
    }

    // 提取组件和 markdown 内容
    const body = markdown.replace(pageParamsRegex, '').trim();
    const sections = [];
    const componentRegex = /<!-- component:(\w+\.\w+) -->([\s\S]*?)<!-- \/component -->/g;

    // 分解 markdown 内容
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

const App = () => {
    const [content, setContent] = useState(null);
    const { docsPath } = config;
    const theme = useSelector(state => state.theme);

    useEffect(() => {
        // 加载 markdown 文件
        axios.get(`${docsPath}/example.md`)
            .then(async (response) => {
                if (!response.data) {
                    throw new Error('Markdown file is empty or invalid');
                }
                const markdownContent = response.data;

                // 解析 markdown 文件
                const { pageParams, sections } = parseMarkdown(markdownContent);

                // 动态加载模板
                const templateName = pageParams.template || config.defaultTemplate;
                const Template = await loadTemplate(templateName);
                if (!Template) {
                    throw new Error('Template not found');
                }

                // 加载模板的静态资源
                //loadTemplateAssets(templateName);

                // 解析各个部分
                const parsedSections = await Promise.all(
                    sections.map(async (section) => {
                        if (!section) return null;

                        if (section.type === 'markdown') {
                            return {
                                type: 'markdown',
                                content: <ReactMarkdown>{section.content}</ReactMarkdown>,
                            };
                        } else if (section.type === 'component') {
                            // 动态加载组件
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

                // 过滤掉 null 值
                const filteredSections = parsedSections.filter(section => section !== null);

                // 设置页面内容
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