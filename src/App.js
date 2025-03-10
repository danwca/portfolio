import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import frontMatter from 'front-matter';
import ReactDOMServer from 'react-dom/server';
import config from './config.json';

// 解析 markdown 文件
const parseMarkdown = (markdown) => {
    const { attributes, body } = frontMatter(markdown);
    const sections = [];
    const componentRegex = /<!-- component:(\w+\.\w+) -->([\s\S]*?)<!-- \/component -->/g;

    // 分解 markdown 内容
    let lastIndex = 0;
    let match;
    while ((match = componentRegex.exec(body)) !== null) {
        // 普通 markdown 内容
        if (match.index > lastIndex) {
            sections.push({
                type: 'markdown',
                content: body.slice(lastIndex, match.index),
            });
        }
        // component 内容
        sections.push({
            type: 'component',
            name: match[1],
            content: match[2].trim(),
        });
        lastIndex = match.index + match[0].length;
    }
    // 剩余的普通 markdown 内容
    if (lastIndex < body.length) {
        sections.push({
            type: 'markdown',
            content: body.slice(lastIndex),
        });
    }

    return { attributes, sections };
};

const App = () => {
    const [mdcontent, setMdcontent] = useState('');
    const [templateVariables, setTemplateVariables] = useState({});

    useEffect(() => {
        const { templatesPath, componentsPath, docsPath, defaultTemplate } = config;

        // 加载模板默认变量
        axios.get(`${templatesPath}/template.md`)
            .then((response) => {
                const templateDefaults = frontMatter(response.data).attributes;

                // 加载 markdown 文件
                axios.get(`${docsPath}/example.md`)
                    .then((response) => {
                        const markdownContent = response.data;

                        // 解析 markdown 文件
                        const { attributes, sections } = parseMarkdown(markdownContent);

                        // 合并模板变量
                        const variables = {
                            ...templateDefaults,
                            ...attributes,
                        };

                        // 解析各个部分
                        let content = '';
                        const componentPromises = sections.map((section) => {
                            if (section.type === 'markdown') {
                                content += <ReactMarkdown>{section.content}</ReactMarkdown>;
                                return Promise.resolve();
                            } else if (section.type === 'component') {
                                // 动态加载组件
                                const [category, componentName] = section.name.split('.');
                                return import(`./components/${category}/${componentName}`)
                                    .then((module) => {
                                        const Component = module.default;
                                        content += ReactDOMServer.renderToString(
                                            React.createElement(Component, { content: section.content })
                                        );
                                    })
                                    .catch((error) => {
                                        console.error('Error loading component:', error);
                                    });
                            }
                            return Promise.resolve();
                        });

                        // 等待所有组件加载完成
                        Promise.all(componentPromises).then(() => {
                            // 设置模板变量
                            setTemplateVariables(variables);

                            // 设置页面内容
                            setMdcontent(content);
                        });
                    })
                    .catch((error) => {
                        console.error('Error loading markdown file:', error);
                    });
            })
            .catch((error) => {
                console.error('Error loading template defaults:', error);
            });
    }, []);

    return (
        <div>
            {mdcontent ? (
                <div>{mdcontent}</div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default App;