const ghpages = require('gh-pages');
const fs = require('fs');
const path = require('path');

// Read package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Get the list of repositories
const repositories = packageJson.repositories;

if (!repositories || !Array.isArray(repositories) || repositories.length === 0) {
  console.error('No repositories found in package.json');
  process.exit(1);
}

// Path to config.json in the build folder
const buildConfigPath = path.join(__dirname, '../build/config.json');

// Function to update config.json with repository information
function updateConfig(repoUrl) {
  // Parse the repository URL to extract the GitHub account and repository name
  const repoMatch = repoUrl.match(/github\.com[:/]([^/]+)\/([^/]+)\.git/);
  if (!repoMatch) {
    console.error(`Invalid repository URL format: ${repoUrl}`);
    return false;
  }

  const githubAccount = repoMatch[1];
  const repository = repoMatch[2];

  // Check if a repository-specific config file exists in the src folder
  const repoConfigPath = path.join(__dirname, `../config.${repository}.json`);

  if (fs.existsSync(repoConfigPath)) {
    // If a repository-specific config exists, copy it to the build folder
    fs.copyFileSync(repoConfigPath, buildConfigPath);
    console.log(`Copied repository-specific config (config.${repository}.json) to build/config.json`);
  } else {
    // If no repository-specific config exists, read the default config.json
    const defaultConfigPath = path.join(__dirname, '../public/config.json');
    if (!fs.existsSync(defaultConfigPath)) {
      console.error(`Default config.json not found in src folder`);
      return false;
    }

    // Read the default config.json
    const config = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));

    // Update the repository and githubaccount fields
    config.repository = repository;
    config.githubaccount = githubAccount;

    // Write the updated config to the build folder
    fs.writeFileSync(buildConfigPath, JSON.stringify(config, null, 2));
    console.log(`Updated config.json for repository: ${repository}, GitHub account: ${githubAccount}`);
  }

  return true;
}

// Function to deploy to a single repository
function deployToRepo(repoUrl) {
  return new Promise((resolve, reject) => {
    // Update config.json before deployment
    if (!updateConfig(repoUrl)) {
      reject(new Error(`Failed to update config.json for ${repoUrl}`));
      return;
    }

    // Proceed with deployment
    ghpages.publish(
      'build', // The folder containing your built frontend app
      {
        repo: repoUrl,
        dotfiles: true,
      },
      (err) => {
        if (err) {
          console.error(`Failed to deploy to ${repoUrl}:`, err);
          reject(err);
        } else {
          console.log(`Successfully deployed to ${repoUrl}`);
          resolve();
        }
      }
    );
  });
}

// Deploy to all repositories
async function deployToAllRepos() {
  for (const repoUrl of repositories) {
    try {
      await deployToRepo(repoUrl);
    } catch (error) {
      console.error(`Deployment to ${repoUrl} failed:`, error);
    }
  }
}

deployToAllRepos();