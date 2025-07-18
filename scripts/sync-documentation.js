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
  { path: 'LICENSE', description: 'MIT License' }
];

console.log('\n📋 Documentation Status:');
filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, '..', file.path);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const lastModified = stats.mtime.toLocaleDateString();
    console.log(`✅ ${file.description} (${file.path}) - Last modified: ${lastModified}`);
  } else {
    console.log(`❌ ${file.description} (${file.path}) - MISSING`);
  }
});

// Check version consistency
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const readmeContent = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8');
  
  const packageVersion = packageJson.version;
  const readmeVersionMatch = readmeContent.match(/version-([^-]+)-green/);
  const readmeVersion = readmeVersionMatch ? readmeVersionMatch[1] : 'NOT_FOUND';
  
  console.log('\n🔢 Version Check:');
  console.log(`📦 Package.json version: ${packageVersion}`);
  console.log(`📖 README.md version: ${readmeVersion}`);
  
  if (packageVersion === readmeVersion) {
    console.log('✅ Versions are in sync!');
  } else {
    console.log('⚠️  Versions are out of sync!');
    console.log('💡 Run: npm run update-readme-version');
  }
} catch (error) {
  console.log('❌ Error checking versions:', error.message);
}

// Check for recent changes in CHANGELOG
try {
  const changelogContent = fs.readFileSync(path.join(__dirname, '..', 'CHANGELOG.md'), 'utf8');
  const latestVersionMatch = changelogContent.match(/## \[([^\]]+)\]/);
  const latestChangelogVersion = latestVersionMatch ? latestVersionMatch[1] : 'NOT_FOUND';
  
  console.log(`📝 Latest CHANGELOG version: ${latestChangelogVersion}`);
} catch (error) {
  console.log('❌ Error reading CHANGELOG:', error.message);
}

console.log('\n📋 Next Steps:');
console.log('1. Update Linear project doc with latest changes');
console.log('2. Ensure README features list matches current game state');
console.log('3. Update version history in README if needed');
console.log('4. Check that all links in README are working');

console.log('\n�� Happy coding!'); 