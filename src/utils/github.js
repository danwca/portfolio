import { config } from './config';

export async function getRepoFileUrl(path) {
    // Get the configuration
    const { repository, githubaccount, sections } = await config;

    // Normalize the path to prevent directory traversal and absolute paths
    const normalizePath = (inputPath) => {
        // Remove leading/trailing slashes and spaces
        let normalized = inputPath.replace(/^\/+|\/+$/g, '').trim();

        // Replace multiple slashes with single slash
        normalized = normalized.replace(/\/+/g, '/');

        // Remove any attempts at absolute paths or parent directory traversal
        normalized = normalized.replace(/^(\.\.\/|\.\/|\/)+/g, '');

        return normalized;
    };

    const normalizedPath = normalizePath(path);
    let fullPath = normalizedPath;

    // Section Logic
    if (sections) {
        // 1. Check for specific section match
        const parts = normalizedPath.split('/');
        const firstSegment = parts[0];

        if (firstSegment && sections[firstSegment]) {
            // Found a match. The config value could be a string (legacy) or an object (new).
            const sectionConfig = sections[firstSegment];
            const folderName = typeof sectionConfig === 'string' ? sectionConfig : sectionConfig.folder;

            const repoFolder = normalizePath(folderName);

            // Replace the first segment (virtual section) with the repo folder
            parts[0] = repoFolder;
            fullPath = parts.join('/');

        } else {
            // No specific section found in path prefix. Check for default/root section.
            if (sections[""]) {
                const rootConfig = sections[""];
                const rootFolder = normalizePath(typeof rootConfig === 'string' ? rootConfig : rootConfig.folder);

                // If rootFolder is present, prepend it
                fullPath = `${rootFolder}/${normalizedPath}`;
            }
        }
    } else {
        // Fallback for legacy config (if any)
        const { docsfolder } = await config;
        if (docsfolder) {
            const normalizedDocsFolder = normalizePath(docsfolder);
            fullPath = `${normalizedDocsFolder}/${normalizedPath}`;
        }
    }

    // Clean up
    fullPath = fullPath.replace(/\/+/g, '/');

    // Construct the GitHub raw content URL
    const repoFileUrl = `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/${fullPath}`;

    return repoFileUrl;
}