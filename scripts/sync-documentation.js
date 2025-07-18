#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📚 Deadline Dread - Documentation Sync Helper');
console.log('=============================================');

// Check if key files exist and are up to date
const filesToCheck = [
  { path: 'README.md', description: 'Project README' },
  { path: 'CHANGELOG.md', description: 'Release changelog' },
  { path: 'package.json', description: 'Package configuration' },
  { path: 'LICENSE', description: 'MIT License' },
  { path: 'index.html', description: 'Main HTML file' }
];

console.log('\n📋 Documentation Status:');
let missingFiles = false;
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file.path);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime.toLocaleDateString();
    console.log(`✅ ${file.description} (${file.path}) - Last modified: ${lastModified}`);
  } else {
    console.log(`❌ ${file.description} (${file.path}) - MISSING`);
    missingFiles = true;
  }
});
if (missingFiles) {
  console.error('❌ One or more required files are missing.');
  process.exit(1);
}

// Check version consistency
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const readmeContent = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  const indexContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const changelogContent = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');

  const packageVersion = packageJson.version;
  const readmeVersionMatch = readmeContent.match(/version-([^-]+)-green/);
  const readmeVersion = readmeVersionMatch ? readmeVersionMatch[1] : 'NOT_FOUND';
  const indexTitleMatch = indexContent.match(/Prototype V([\d.]+)/i);
  const indexFooterMatch = indexContent.match(/Prototype Version ([\d.]+)/i);
  const indexVersion = indexTitleMatch ? indexTitleMatch[1] : (indexFooterMatch ? indexFooterMatch[1] : 'NOT_FOUND');
  const changelogVersionMatch = changelogContent.match(/## \[([\d.]+)\]/);
  const changelogVersion = changelogVersionMatch ? changelogVersionMatch[1] : 'NOT_FOUND';

  let allMatch = true;
  console.log('\n🔢 Version Check:');
  console.log(`📦 package.json version: ${packageVersion}`);
  console.log(`📖 README.md version: ${readmeVersion}`);
  console.log(`📝 index.html version: ${indexVersion}`);
  console.log(`🗒️  CHANGELOG.md version: ${changelogVersion}`);

  if (packageVersion !== readmeVersion) {
    console.error(`❌ README.md version (${readmeVersion}) does not match package.json (${packageVersion})`);
    allMatch = false;
  }
  if (packageVersion !== indexVersion) {
    console.error(`❌ index.html version (${indexVersion}) does not match package.json (${packageVersion})`);
    allMatch = false;
  }
  if (packageVersion !== changelogVersion) {
    console.error(`❌ CHANGELOG.md version (${changelogVersion}) does not match package.json (${packageVersion})`);
    allMatch = false;
  }
  if (!allMatch) {
    console.error('❌ Version mismatch detected. Please update all version references before releasing.');
    process.exit(1);
  } else {
    console.log('✅ All versions are in sync!');
  }
} catch (error) {
  console.error('❌ Error checking versions:', error.message);
  process.exit(1);
}

console.log('\nAll documentation and version checks passed. Ready for release!'); 