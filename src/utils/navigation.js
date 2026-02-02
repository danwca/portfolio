import axios from 'axios';
import { getRepoFileUrl, getRepoTree } from './github';
import { config } from './config';

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
const parseTree = (treeData, repoFolder, sectionKey) => {
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

        // Path Rewrite Logic: Repo Path -> URL Path
        // If repoFolder is "docs" and sectionKey is "", "docs/foo.md" -> "foo.md"
        // If repoFolder is "posts" and sectionKey is "blog", "posts/bar.md" -> "blog/bar.md"

        let linkPath = item.path;
        if (repoFolder) {
            // Create a regex to replace the folder prefix at the start of the string
            const prefixRegex = new RegExp(`^${repoFolder}/`);
            if (sectionKey) {
                // Replace "folder/" with "section/"
                linkPath = linkPath.replace(prefixRegex, `${sectionKey}/`);
            } else {
                // Section is root, just remove "folder/"
                linkPath = linkPath.replace(prefixRegex, '');
            }
        }

        // Ensure leading slash for absolute routing
        if (!linkPath.startsWith('/')) {
            linkPath = '/' + linkPath;
        }

        nav.push({
            title: title,
            path: linkPath,
            type: 'link'
        });
    });

    return nav;
};

export const fetchNavigation = async (sectionPath) => {
    const resolvedConfig = await config;
    console.log(`[Navigation] Fetching for section: "${sectionPath}"`);

    // Resolve the repo folder for this section to help with path rewriting
    let repoFolder = null;
    if (resolvedConfig.sections) {
        if (resolvedConfig.sections[sectionPath]) {
            const sec = resolvedConfig.sections[sectionPath];
            repoFolder = typeof sec === 'string' ? sec : sec.folder;
        } else if (sectionPath === "" && resolvedConfig.sections[""]) {
            const sec = resolvedConfig.sections[""];
            repoFolder = typeof sec === 'string' ? sec : sec.folder;
        }
    } else {
        // Legacy fallback
        repoFolder = resolvedConfig.docsfolder;
    }


    // 1. Try to fetch _sidebar.md
    try {
        // Fix for logic: if sectionPath is empty (root), path should be just "_sidebar.md"
        // If sectionPath is "docs", path should be "docs/_sidebar.md"
        // But getRepoFileUrl might handle prefixes.
        // Let's use robust concatenation.
        const sidebarPath = sectionPath ? `${sectionPath}/_sidebar.md` : '_sidebar.md';
        const sidebarUrl = await getRepoFileUrl(sidebarPath);
        console.log(`[Navigation] Sidebar URL: ${sidebarUrl}`);

        const response = await axios.get(sidebarUrl);
        if (response.data) {
            console.log(`[Navigation] Sidebar found.`);
            return {
                type: 'sidebar',
                items: parseSidebar(response.data)
            };
        }
    } catch (e) {
        console.warn(`[Navigation] Sidebar not found at ${sectionPath || 'root'}/_sidebar.md`);
    }

    // 2. Fallback: GitHub Tree API
    try {
        const treeApiUrl = await getRepoTree(sectionPath);
        console.log(`[Navigation] Tree API URL: ${treeApiUrl}`);

        const response = await axios.get(treeApiUrl);
        if (response.data) {
            console.log(`[Navigation] Tree data fetched:`, response.data);
            return {
                type: 'auto',
                items: parseTree(response.data, repoFolder, sectionPath)
            };
        }
    } catch (e) {
        console.error("[Navigation] Failed to fetch tree:", e);
        return { type: 'none', items: [] };
    }

    return { type: 'none', items: [] };
};
