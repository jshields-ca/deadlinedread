#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('📚 Deadline Dread - Documentation Sync Helper');
console.log('=============================================');
console.log('🔄 Syncing version references across all documentation files...');

const filesToCheck = [
  { path: 'README.md', description: 'Project README' },
  { path: 'CHANGELOG.md', description: 'Release changelog' },
  { path: 'package.json', description: 'Package configuration' },
  { path: 'LICENSE', description: 'MIT License' },
  { path: 'index.html', description: 'Main HTML file' },
  { path: 'CONTRIBUTING.md', description: 'Contributing guidelines' },
  { path: 'CODE_OF_CONDUCT.md', description: 'Code of Conduct' },
  { path: 'SECURITY.md', description: 'Security policy' }
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

// --- Version Sync Logic ---
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
const packageVersion = packageJson.version;
let updated = false;

// --- README.md ---
const readmePath = path.join(__dirname, '..', 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');
const readmeVersionMatch = readmeContent.match(/version-([^-]+)-green/);
const readmeVersion = readmeVersionMatch ? readmeVersionMatch[1] : 'NOT_FOUND';
if (readmeVersion !== packageVersion) {
  readmeContent = readmeContent.replace(/version-[^-]+-green/g, `version-${packageVersion}-green`);
  fs.writeFileSync(readmePath, readmeContent, 'utf8');
  console.log(`📝 Updated README.md version to ${packageVersion}`);
  updated = true;
}

// --- index.html ---
const indexPath = path.join(__dirname, '..', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
const indexTitleMatch = indexContent.match(/Prototype V([\d.]+)/i);
const indexFooterMatch = indexContent.match(/Prototype Version ([\d.]+)/i);
const indexVersion = indexTitleMatch ? indexTitleMatch[1] : (indexFooterMatch ? indexFooterMatch[1] : 'NOT_FOUND');
if (indexVersion !== packageVersion) {
  indexContent = indexContent.replace(/Prototype V[\d.]+/i, `Prototype V${packageVersion}`);
  indexContent = indexContent.replace(/Prototype Version [\d.]+/, `Prototype Version ${packageVersion}`);
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`📝 Updated index.html version to ${packageVersion}`);
  updated = true;
}

// --- CHANGELOG.md ---
const changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
let changelogContent = fs.readFileSync(changelogPath, 'utf8');
const changelogVersionMatch = changelogContent.match(/## \[([\d.]+)\]/);
const changelogVersion = changelogVersionMatch ? changelogVersionMatch[1] : 'NOT_FOUND';
if (changelogVersion !== packageVersion) {
  // Insert a stub entry for the new version at the top
  changelogContent = changelogContent.replace(
    /(# Deadline Dread Changelog\n)/,
    `$1\n## [${packageVersion}] - ${new Date().toISOString().slice(0, 10)}\n### Added\n- _Describe this release here_\n\n`
  );
  fs.writeFileSync(changelogPath, changelogContent, 'utf8');
  console.log(`📝 Updated CHANGELOG.md version to ${packageVersion}`);
  updated = true;
}

// --- Final Check ---
const finalReadme = fs.readFileSync(readmePath, 'utf8');
const finalIndex = fs.readFileSync(indexPath, 'utf8');
const finalChangelog = fs.readFileSync(changelogPath, 'utf8');
const finalReadmeVersion = finalReadme.match(/version-([^-]+)-green/)?.[1];
const finalIndexVersion = finalIndex.match(/Prototype V([\d.]+)/i)?.[1] || finalIndex.match(/Prototype Version ([\d.]+)/)?.[1];
const finalChangelogVersion = finalChangelog.match(/## \[([\d.]+)\]/)?.[1];

console.log('\n📊 Version Status:');
console.log(`📦 Package Version: ${packageVersion}`);
console.log(`📖 README Version: ${finalReadmeVersion || 'NOT_FOUND'}`);
console.log(`🌐 Index Version: ${finalIndexVersion || 'NOT_FOUND'}`);
console.log(`📝 Changelog Version: ${finalChangelogVersion || 'NOT_FOUND'}`);

if (
  finalReadmeVersion === packageVersion &&
  finalIndexVersion === packageVersion &&
  finalChangelogVersion === packageVersion
) {
  console.log('\n✅ All versions are now in sync!');
  console.log('\n📚 Documentation files included in sync:');
  filesToCheck.forEach(file => {
    console.log(`   • ${file.path} - ${file.description}`);
  });
  process.exit(0);
} else {
  console.error('\n❌ Version mismatch remains after attempted update. Please check files manually.');
  process.exit(updated ? 0 : 1);
} 