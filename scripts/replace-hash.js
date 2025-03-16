const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '../build');
const indexPath = path.join(buildDir, 'index.html');
const notFoundPath = path.join(buildDir, '404.html');

// Read index.html to extract the correct paths
const indexHtml = fs.readFileSync(indexPath, 'utf8');

// Regular expressions to match the script and link tags
const jsRegex = /<script.*?src="(\/portfolio\/static\/js\/main\.[a-f0-9]+\.js)".*?><\/script>/;
const cssRegex = /<link.*?href="(\/portfolio\/static\/css\/main\.[a-f0-9]+\.css)".*?>/;

const jsMatch = indexHtml.match(jsRegex);
const cssMatch = indexHtml.match(cssRegex);

if (!jsMatch || !cssMatch) {
    console.error('Failed to find JavaScript or CSS paths in index.html.');
    process.exit(1);
}

const jsPath = jsMatch[1];
const cssPath = cssMatch[1];

console.log('JavaScript path:', jsPath);
console.log('CSS path:', cssPath);

// Read 404.html and replace placeholders
let notFoundHtml = fs.readFileSync(notFoundPath, 'utf8');
notFoundHtml = notFoundHtml.replace('%JS_PATH%', '/portfolio/static/js/notFound.[contenthash].js');
notFoundHtml = notFoundHtml.replace('%CSS_PATH%', cssPath);

// Write the updated 404.html
fs.writeFileSync(notFoundPath, notFoundHtml, 'utf8');
console.log('Updated 404.html with correct paths.');