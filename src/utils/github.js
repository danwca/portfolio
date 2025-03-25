import { config } from './config';

export async function getRepoFileUrl(path) {
    // Get the configuration
    const { repository, githubaccount, docsfolder } = await config;

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

    // Normalize both the docsfolder and provided path
    const normalizedDocsFolder = docsfolder ? normalizePath(docsfolder) : '';
    const normalizedPath = normalizePath(path);

    // Construct the full path safely
    let fullPath;
    if (normalizedDocsFolder) {
        fullPath = `${normalizedDocsFolder}/${normalizedPath}`;
    } else {
        fullPath = normalizedPath;
    }

    // Remove any remaining double slashes that might have been created
    fullPath = fullPath.replace(/\/+/g, '/');

    console.log('Normalized path:', fullPath);
    
    // Construct the GitHub raw content URL
    const repoFileUrl = `https://raw.githubusercontent.com/${githubaccount}/${repository}/main/${fullPath}`;
    console.log('GitHub URL:', repoFileUrl);
    
    return repoFileUrl;
}