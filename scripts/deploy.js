const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ghpages = require('gh-pages');

// Function to run a command
function runCommand(command) {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit' });
}

// Function to set homepage in package.json
function setHomepage(homepage) {
  const packageJsonPath = path.join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Update homepage
  packageJson.homepage = homepage;

  // Save package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

  console.log(`Set homepage to: ${homepage}`);
}

// Function to deploy to a repository
function deployToRepo(configPath) {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Generate homepage from customDomain or repository
  const homepage = config.customDomain
    ? `https://${config.customDomain}`
    : `https://${config.githubaccount}.github.io/${config.repository}`;

  // Set homepage
  setHomepage(homepage);

  // Build the app
  runCommand('npm run build');

  // Prepare config.json (excluding customDomain)
  const { customDomain, dns, ...configWithoutSensitiveFields } = config;
  const buildConfigPath = path.join(__dirname, '../build/config.json');
  fs.writeFileSync(buildConfigPath, JSON.stringify(configWithoutSensitiveFields, null, 2));

  // Copy CNAME file to the build directory (if customDomain exists)
  if (config.customDomain) {
    const cnamePath = path.join(__dirname, '../public/CNAME');
    fs.writeFileSync(cnamePath, config.customDomain);
  }

  // Deploy the build directory
  ghpages.publish('build', {
    branch: 'gh-pages',
    repo: `https://github.com/${config.githubaccount}/${config.repository}.git`,
    dotfiles: true, // Include dotfiles (e.g., CNAME)
  }, (err) => {
    if (err) console.error(err);
    else console.log(`Deployed to ${config.repository} successfully!`);
  });
}

// Function to create config.json for localhost
function createLocalhostConfig() {
  const localhostConfigPath = path.join(__dirname, '../config/config.localhost.json');
  if (fs.existsSync(localhostConfigPath)) {
    const localhostConfig = JSON.parse(fs.readFileSync(localhostConfigPath, 'utf8'));

    // Prepare config.json for localhost
    const { customDomain, dns, ...configWithoutSensitiveFields } = localhostConfig;
    const buildConfigPath = path.join(__dirname, '../build/config.json');
    fs.writeFileSync(buildConfigPath, JSON.stringify(configWithoutSensitiveFields, null, 2));

    console.log('Created config.json for localhost.');
  } else {
    console.error('config.localhost.json not found in the config folder');
  }
}

// Main function
function main() {
  // Get all config files in the config folder (excluding config.localhost.json)
  const configDir = path.join(__dirname, '../config');
  const configFiles = fs.readdirSync(configDir).filter(
    (file) => file.startsWith('config.') && file.endsWith('.json') && file !== 'config.localhost.json'
  );

  if (configFiles.length === 0) {
    console.error('No config files found in the config folder');
    process.exit(1);
  }

  // Deploy to all repositories
  for (const configFile of configFiles) {
    const configPath = path.join(configDir, configFile);
    deployToRepo(configPath);
  }

  // Recover for localhost
  console.log('Recovering for localhost...');
  setHomepage('http://localhost:3000');
  createLocalhostConfig(); // Create config.json for localhost
  runCommand('npm run build');
}

main();