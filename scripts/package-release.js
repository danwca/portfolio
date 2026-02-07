const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Configuration
const version = '0.2.0';
const outputFileName = `portfolio-v${version}.zip`;
const outputPath = path.join(__dirname, '..', outputFileName);

// Files and directories to include
const filesToInclude = [
    'build',
    'docs',
    'public',
    'src',
    'scripts',
    'config',
    'RELEASE_NOTES_v0.2.0.md',
    'README.md',
    'LICENSE',
    'package.json',
    'package-lock.json',
    'config-overrides.js',
    '.gitignore'
];

// Create a file to stream archive data to
const output = fs.createWriteStream(outputPath);
const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
});

// Listen for all archive data to be written
output.on('close', function () {
    console.log(`\n✓ Package created successfully!`);
    console.log(`  File: ${outputFileName}`);
    console.log(`  Size: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  Location: ${outputPath}`);
});

// Handle warnings
archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
    } else {
        throw err;
    }
});

// Handle errors
archive.on('error', function (err) {
    throw err;
});

// Pipe archive data to the file
archive.pipe(output);

console.log(`Creating release package v${version}...`);
console.log('Including files:');

// Add files and directories
filesToInclude.forEach(item => {
    const itemPath = path.join(__dirname, '..', item);

    if (fs.existsSync(itemPath)) {
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory()) {
            console.log(`  + ${item}/ (directory)`);
            archive.directory(itemPath, item);
        } else {
            console.log(`  + ${item}`);
            archive.file(itemPath, { name: item });
        }
    } else {
        console.log(`  - ${item} (not found, skipping)`);
    }
});

// Finalize the archive
archive.finalize();
