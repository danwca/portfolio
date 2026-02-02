import axios from 'axios';
import { getRepoFileUrl, getRepoTree } from './github';

/**
 * Navigation Utility
 * Handles fetching sidebar content or falling back to GitHub Tree API.
 */

// Parse _sidebar.md content (Markdown List) into a structured array
const parseSidebar = (markdown) => {
    const lines = markdown.split('\n');
    const nav = [];
    // Simple parser for "- [Link](url)"
    // Needs to handle nesting? For now, flat list or simple nesting.

    lines.forEach(line => {
        const match = line.match(/^\s*-\s*\[(.*?)\]\((.*?)\)/);
        if (match) {
            nav.push({
                title: match[1],
                path: match[2],
                type: 'link'
            });
        }
    });
    return nav;
};

// Parse GitHub Tree API response into a structured array
const parseTree = (treeData) => {
    // treeData.tree is an array of objects: { path, mode, type, sha, size, url }
    // type: "blob" (file) or "tree" (folder)

    const nav = [];

    // Filter for markdown files
    const validFiles = treeData.tree.filter(item => item.path.endsWith('.md'));

    validFiles.forEach(item => {
        // Construct a simple title from the filename
        const parts = item.path.split('/');
        const filename = parts[parts.length - 1];
        const title = filename.replace('.md', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        nav.push({
            title: title,
            path: item.path, // This is the repo path. We might need to map it back to URL path??
            // Wait, if we use Tree API, we get "docs/intro.md".
            // The app expects URL paths. 
            // If the section "docs" maps to "docs" folder, then URL "docs/intro.md" works.
            type: 'link'
        });
    });

    return nav;
};

export const fetchNavigation = async (sectionPath) => {
    // 1. Try to fetch _sidebar.md
    try {
        const sidebarUrl = await getRepoFileUrl(`${sectionPath}/_sidebar.md`);
        const response = await axios.get(sidebarUrl);
        if (response.data) {
            return {
                type: 'sidebar',
                items: parseSidebar(response.data)
            };
        }
    } catch (e) {
        // Find sidebar failed, proceed to fallback
        // console.warn("Sidebar not found, falling back to Tree API");
    }

    // 2. Fallback: GitHub Tree API
    try {
        const treeApiUrl = await getRepoTree(sectionPath);
        const response = await axios.get(treeApiUrl);
        if (response.data) {
            return {
                type: 'auto',
                items: parseTree(response.data)
            };
        }
    } catch (e) {
        console.error("Failed to fetch navigation tree", e);
        return { type: 'none', items: [] };
    }

    return { type: 'none', items: [] };
};
