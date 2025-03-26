import './app.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { useSelector, Provider } from 'react-redux';
import { createRoot } from 'react-dom/client'; // Use createRoot from react-dom/client
import store from './store/theme'; // Ensure the Redux store is imported
import { getRepoFileUrl } from './utils/github'; // Import the function
import { config } from './utils/config'; // Import the config
import rehypeRaw from 'rehype-raw';

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
			console.log('recursiveMerge in page.js : ',key, source[key], target[key]);
        }
    }
	//target.test ="here works";
};


// Add this function to process markdown links
const processMarkdownLinks = async (markdownContent, currentFilePath) => {
  // Get the base GitHub raw URL without the file path
  const { githubaccount, repository, docsfolder } = await config;
  const baseRawUrl = `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/${docsfolder ? docsfolder + '/' : ''}`;
  
  // Get the directory of the current file (remove filename if present)
  const getCurrentDir = (filePath) => {
    const lastSlashIndex = filePath.lastIndexOf('/');
    return lastSlashIndex >= 0 ? filePath.substring(0, lastSlashIndex + 1) : '';
  };
  
  const currentDir = getCurrentDir(currentFilePath);

  // Process image links ![alt](path)
  let processedContent = markdownContent.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    (match, altText, linkPath) => {
      // Skip if it's already a full URL or data URI
      if (/^(https?:|\/|data:)/.test(linkPath)) {
        return match;
      }
      
      // Handle different types of relative paths
      let fullPath;
      if (linkPath.startsWith('./')) {
        fullPath = currentDir + linkPath.substring(2);
      } else if (linkPath.startsWith('../')) {
        // Handle parent directory paths
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
      
      // Construct GitHub raw URL
      const rawUrl = baseRawUrl + fullPath;
      console.log(rawUrl, match, currentFilePath );
      return `![${altText}](${rawUrl})`;
    }
  );
  console.log(processedContent);
  // Process regular links [text](path)
  processedContent = processedContent.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (match, linkText, linkPath) => {
      // Skip if it's already a full URL
      if (/^(https?:|\/)/.test(linkPath)) {
        return match;
      }
      
      // Skip markdown file links
      if (linkPath.endsWith('.md')) {
        return match;
      }
      
      // Handle different types of relative paths (same as above)
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
      
      // Construct GitHub raw URL
      const rawUrl = baseRawUrl + fullPath;
      
      return `[${linkText}](${rawUrl})`;
    }
  );
  console.log(processedContent);
  return processedContent;
};

// Extract path from URL
export const getPathFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const { homefile,repository } = await config;
    let path = urlParams.get('path'); // Get the path from the query parameter

	const homepagefile = homefile||'README.md';  
	
    if (!path) {
        // If no query parameter, extract the path from the URL
        const fullPath = window.location.pathname; // e.g., "/portfolio/path/to/file.md"

        // Remove the repository path from the full path
        const pathWithoutRepository = fullPath.replace(new RegExp(`^/${repository}`), '');

        // Remove leading slash and default to 'example.md' if no path is provided
        path = pathWithoutRepository.replace(/^\//, '') || homepagefile;
    }
	console.log(path,repository, window.location.pathname, config);
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

        const markdownContent = await processMarkdownLinks(response.data, path);
        
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
        let pageParams = {};
        const renderedSections = [];
        let index = 0;
        
        for (const section of sections) {
            // Your existing section processing logic...
        }
        
        // Use page-specific template if defined, otherwise use file-wide template
        const templateName = currentPage.template || pageParams.template || config.defaultTemplate;
        const Template = await loadTemplate(templateName);
        
        // Render the content
        const root = createRoot(document.getElementById('root'));
        root.render(
            <Provider store={store}>
                <Template variables={{ ...pageParams, currentPageId: currentPage.id, totalPages: pages.length }}>
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
        // Your existing error handling...
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