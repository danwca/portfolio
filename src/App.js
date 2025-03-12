import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import frontMatter from 'front-matter';
import config from './config.json';

// 动态加载模板
const loadTemplate = async (templateName) => {
    try {
        // 尝试加载模板的驱动文件
        const templateModule = await import(`./templates/${templateName}.js`);
        return templateModule.default;
    } catch (error) {
        // 如果模板没有驱动文件，则使用全局的 default.js
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

// 加载模板的默认变量
const loadTemplateVariables = async (templateName) => {
    try {
        const response = await import(`./templates/${templateName}/tempvars.md`);
        const { attributes } = frontMatter(response.data);
        return attributes;
    } catch (error) {
        console.error(`Error loading template variables for ${templateName}:`, error);
        return {};
    }
};


// 动态加载组件
const loadComponent = async (section) => {

};


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
    const [content, setContent] = useState(null);
    const { docsPath } = config;

    useEffect(() => {
        // 加载 markdown 文件
        axios.get(`${docsPath}/example.md`)
            .then(async (response) => {
                const markdownContent = response.data;

                // 解析 markdown 文件
                const { attributes, sections } = parseMarkdown(markdownContent);

                // 动态加载模板
                const templateName = attributes.template || config.defaultTemplate;
                const Template = await loadTemplate(templateName);
                if (!Template) {
                    throw new Error('Template not found');
                }

                // 加载模板的静态资源
                loadTemplateAssets(templateName);

                // 加载模板的默认变量
                const templateVariables = await loadTemplateVariables(templateName);

                // 合并模板变量
                const variables = {
                    ...templateVariables,
                    ...attributes,
                };

                // 解析各个部分
                const parsedSections = await Promise.all(
                    sections.map(async (section) => {
                        if (section.type === 'markdown') {
                            return {
                                type: 'markdown',
                                content: <ReactMarkdown>{section.content}</ReactMarkdown>,
                            };
                        } else if (section.type === 'component') {
                                // 动态加载组件
                                let [category, componentName] = section.name.split('.');
                                console.log('component: ', section, ' : ', category, ' - ', componentName);
								if (componentName === undefined) {
									componentName = category;
									//category = category;
								}								
                                console.log('loading component: ', `./components/${category}/${componentName}`);
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
                        return null;
                    })
                );

                // 设置页面内容
                setContent(
                    <Template variables={variables}>
                        {parsedSections.map((section, index) => (
                            <React.Fragment key={index}>
                                {section.content}
                            </React.Fragment>
                        ))}
                    </Template>
                );
            })
            .catch((error) => {
                console.error('Error loading markdown file:', error);
                setContent(<div>Error loading markdown file</div>);
            });
    }, []);

    return (
        <div>
            {content ? content : <p>Loading...</p>}
        </div>
    );
};

export default App;