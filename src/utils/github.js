import { config } from './config'; // Import the config

export async function getRepoFileUrl(path) {
    // Get the configuration (cached after the first call)
    const { repository, githubaccount, docsfolder } = await config;

    // Construct the full path using docsfolder and the provided path
    const fullPath = `${docsfolder}/${path}`;

	console.log(fullPath);
    // Construct the GitHub API URL
    const repoFileUrl = `https://api.github.com/repos/${githubaccount}/${repository}/contents/${fullPath}`;
	console.log(repoFileUrl);
    return repoFileUrl;
}