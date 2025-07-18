# Deadline Dread Changelog

All notable changes to this project will be documented in this file.

## [3.0.0] - 2024-07-18

### 🚀 Major Changes
- **Clean Slate Release**: Reset all previous tags and releases to start fresh with a new versioning scheme
- **Workflow Improvements**: Stabilized release workflow and documentation sync scripts for reliable, automated releases
- **Line Ending Consistency**: Added .gitattributes to enforce consistent line endings across all platforms
- **Documentation Cleanup**: Removed version history from README.md, now centralized in CHANGELOG.md only

### 🔧 Technical Improvements
- Automated version reference sync in release-it workflow
- Robust sync script that handles version mismatches gracefully
- Unique artifact names in CI/CD to prevent upload conflicts
- Normalized line endings (LF) for cross-platform compatibility

---

## Previous Development History

### Version 2.x Series (2024-07-18)

#### [2.0.9] - 2024-07-18
- Further improvements to release workflow and documentation sync scripts

#### [2.0.8] - 2024-07-18
- Automated documentation and version reference sync in release workflow

#### [2.0.7] - 2024-07-18
- Version reference sync for release workflow

#### [2.0.6] - 2024-07-18
- Automated documentation and version reference sync in release workflow

#### [2.0.5] - 2024-07-18
- Version reference sync and unique artifact names in CI

#### [2.0.4] - 2024-07-18
- Version reference sync for release workflow

#### [2.0.3] - 2024-07-18
- Version reference sync for release workflow

#### [2.0.2] - 2024-07-18
- Version reference sync for release workflow

#### [2.0.1] - 2024-07-18
- Minor fixes and version sync for release workflow test

#### [2.0.0] - 2024-07-18

##### 🎮 Major Systems Overhaul
- **Modular Enemy System**: Complete refactor of enemy spawning and behavior management
- **Weapon System Redesign**: Implemented weapon limits and improved weapon mechanics
- **Upgrade System**: New modular upgrade system for player progression
- **Background System**: Dynamic canvas backgrounds with multiple themes (blueprint, code, circuit)

##### ⚡ Gameplay Improvements
- **Weapon Limits**: Implemented maximum weapon count to balance gameplay
- **Enhanced Enemy AI**: Improved enemy movement patterns and spawning logic
- **Player Progression**: Refined level-up system and XP mechanics
- **Visual Polish**: Enhanced particle effects and visual feedback

##### 🔧 Technical Improvements
- **Code Modularity**: Separated concerns into dedicated modules (enemy.js, weapons.js, upgrades.js)
- **Performance Optimization**: Improved rendering and collision detection
- **Build System**: Enhanced Vite configuration for better development workflow
- **Code Organization**: Better separation of game logic and rendering systems

### Version 1.x Series (2024-07-17)

#### [1.8.0] - 2024-07-17

##### 🎯 New Enemy Type
- **Buffer Overflow Enemy**: Introduced new enemy type with unique overflow mechanics
- **Fragment System**: When destroyed, Buffer Overflow enemies split into smaller fragments
- **Cascading Damage**: Fragments can create additional challenges for players
- **Visual Design**: Distinct visual appearance to differentiate from other enemy types

##### 🎮 Gameplay Impact
- **Increased Difficulty**: More complex enemy patterns and multiple targets
- **Strategic Considerations**: Players must manage multiple threats simultaneously
- **Progressive Challenge**: Fragments add layers of complexity to combat encounters

#### [1.7.5] - 2024-07-17
- Level up system and player boundary fixes

#### [1.7.4] - 2024-07-17
- UI improvements and footer updates

#### [1.7.3] - 2024-07-17
- Player movement and enemy spawning fixes

#### [1.7.2] - 2024-07-17

##### 🐛 Critical Bug Fix
- **Weapon Minification Issue**: Fixed critical bug where weapons were not functioning properly after build process
- **Build Process**: Resolved issues with weapon code being incorrectly minified or compressed
- **Production Stability**: Ensured weapons work correctly in both development and production environments
- **Code Integrity**: Maintained weapon functionality through the build pipeline

##### 📈 Impact
- **Gameplay Restoration**: Weapons now function properly in all environments
- **Build Reliability**: Improved confidence in production builds
- **Player Experience**: Fixed core gameplay mechanics that were broken

#### [1.7.1] - 2024-07-17

##### 🎮 Gameplay Fixes
- **Player Movement**: Improved player movement responsiveness and boundary handling
- **Enemy Spawning**: Fixed enemy spawning patterns and timing issues
- **Collision Detection**: Enhanced collision detection accuracy between player, weapons, and enemies
- **Performance Optimization**: Improved frame rate and smoothness during intense combat

##### 🎨 UI Improvements
- **Interface Polish**: Enhanced visual feedback and user interface elements
- **Display Fixes**: Corrected various display issues and visual glitches
- **User Experience**: Improved overall game feel and responsiveness
- **Visual Consistency**: Standardized UI elements and styling

#### [1.7.0] - 2024-07-17

##### 🔫 New Weapon System
- **Code Spray Weapon**: Introduced shotgun-style weapon that fires multiple projectiles in a spread pattern
- **Weapon Variety**: Added strategic depth with different weapon types and firing patterns
- **Combat Enhancement**: Provided players with more tactical options for different situations
- **Visual Effects**: Enhanced weapon animations and projectile visuals

##### 👾 New Enemy Type
- **Scope Creep Blob**: Introduced new enemy with unique splitting mechanics
- **Splitting Behavior**: When damaged, Scope Creep Blob splits into smaller enemies
- **Progressive Challenge**: Creates increasingly complex combat scenarios
- **Strategic Depth**: Requires players to consider when and how to engage

##### 🏗️ Technical Architecture
- **Modular Codebase**: Refactored code into separate, maintainable modules
- **Code Organization**: Improved separation of concerns and code structure
- **Maintainability**: Enhanced code readability and development workflow
- **Scalability**: Better foundation for adding new features and content

---

## 🎯 Key Features Summary

### Enemy Types
- **Basic Bugs**: Standard enemy units
- **Scope Creep Blob**: Splitting enemy with progressive challenge
- **Buffer Overflow**: Fragment-based enemy with cascading damage
- **Feature Requests**: Additional enemy variety

### Weapons
- **Homing Weapon**: Auto-targeting projectiles
- **Orbiting Weapon**: Rotating defensive weapons
- **Pulse Weapon**: Burst-fire weapon system
- **Code Spray**: Shotgun-style spread weapon

### Visual & Audio
- **Retro-style Graphics**: Classic arcade aesthetic
- **Dynamic Backgrounds**: Randomized canvas themes (blueprint, code, circuit)
- **Particle Effects**: Enhanced visual feedback
- **Responsive UI**: Clean, modern interface

### Gameplay Systems
- **Survivor-style Combat**: Progressive difficulty scaling
- **Level-up System**: Player progression mechanics
- **XP Progression**: Experience-based advancement
- **Modular Architecture**: Scalable codebase foundation

### Technical Stack
- **Modular JavaScript**: Organized, maintainable codebase
- **Vite Build System**: Fast development and optimized builds
- **Automated Releases**: Streamlined deployment workflow
- **Cross-platform**: Consistent experience across devices

---

*This changelog preserves the complete development history while marking the start of a new, clean versioning scheme.* 