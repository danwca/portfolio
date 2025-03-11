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
    const componentRegex = /<!--\s*component:([a-zA-Z0-9_\-\.]+)\s*-->(.*?)<!--\s*\/component\s*-->/sg;

    // 分解 markdown 内容
    let lastIndex = 0;
    let match;
    while ((match = componentRegex.exec(body)) !== null) {
        // 普通 markdown 内容
		console.log('matching component:', match);
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
    const [mdcontent, setMdcontent] = useState([]);

    useEffect(() => {
        const { templatesPath, docsPath } = config;

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
                        const content = [];
                        const componentPromises = sections.map((section) => {
                            if (section.type === 'markdown') {
                                content.push(
                                    <ReactMarkdown key={content.length}>
                                        {section.content}
                                    </ReactMarkdown>
                                );
                                return Promise.resolve();
                            } else if (section.type === 'component') {
                                // 动态加载组件
                                let [category, componentName] = section.name.split('.');
                                console.log('component: ', section, ' : ', category, ' - ', componentName);
								if (componentName === undefined) {
									componentName = category;
									//category = category;
								}								
                                return import(`./components/${category}/${componentName}`)
                                    .then((module) => {
                                        const Component = module.default;
                                        content.push(
                                            <Component key={content.length} content={section.content} />
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
            {mdcontent.length > 0 ? (
                <div>{mdcontent}</div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default App;