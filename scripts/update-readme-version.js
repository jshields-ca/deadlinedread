#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get version from package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const version = packageJson.version;

// Read README.md
const readmePath = path.join(__dirname, '..', 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Update version badge
const versionBadgeRegex = /\[!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-([^-]+)-green\.svg\)\]\([^)]+\)/;
const newVersionBadge = `[![Version](https://img.shields.io/badge/version-${version}-green.svg)](https://github.com/yourusername/deadlinedread/releases)`;

if (versionBadgeRegex.test(readmeContent)) {
  readmeContent = readmeContent.replace(versionBadgeRegex, newVersionBadge);
  console.log(`✅ Updated README.md version badge to ${version}`);
} else {
  console.log('⚠️  Version badge not found in README.md');
}

// Write updated README.md
fs.writeFileSync(readmePath, readmeContent);

console.log(`🎮 README.md updated for Deadline Dread v${version}`); 