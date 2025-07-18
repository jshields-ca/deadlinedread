# Deadline Dread Changelog

## [2.0.0] - 2024-07-18
### Major
- **Full enemy, weapon, and upgrade system refactor** for modularity, balance, and extensibility
- **Randomized, on-theme canvas backgrounds** (blueprint, code, circuit) for each run
- **Weapon limit (4) for strategic builds**
- **Improved particle effects** for hits, deaths, and Tank deaths (unique shockwave)
- **Enhanced readability:** glow, borders, and dynamic text contrast for all enemies
- **Polish:** removed debug logs, improved code comments, and more

### Gameplay & Balance
- Enemy damage now scales by type/size (Tank, Blob, Buffer Overflow, etc.)
- Homing weapon projectile speed reduced by 30%
- Mutated Standard and other enemy tweaks

### Technical
- All stats centralized in config for easy balancing
- Codebase ready for new weapons, upgrades, and backgrounds

## [1.8.0] - 2024-07-17
### Added
- **New Enemy: Buffer Overflow** - Fast, aggressive enemy that creates smaller "overflow" enemies when damaged
  - Orange-red colored with animated "corrupted data" visual effects
  - Overflows at 75%, 50%, and 25% health thresholds
  - Each overflow creates 2-4 smaller, faster fragment enemies
  - High XP reward (1.8x multiplier) for the challenge
  - Spawns after 45 seconds of gameplay

## [1.7.5] - 2024-07-17
### Fixed
- **Level Up System:** Fixed critical bug where level up screen was not appearing. Added proper levelUpCallback setup.
- **Player Boundaries:** Fixed player movement to properly clamp to canvas boundaries instead of referencing undefined window.canvas.
- **Enemy Spawning:** Increased enemy spawn distance from canvas edge (radius + 2 → radius + 20) to prevent spawning too close to player.
- **Debug Logging:** Added console logs to help track XP gain and level up process.

### Technical
- Player now receives canvas dimensions for proper boundary clamping
- Canvas resize function updates player boundaries when window is resized
- Level up callback properly triggers the level up screen

## [1.7.4] - 2024-07-17
### Changed
- UI update: Only 'Deadline Dread' at the top. Version, status, and links to GitHub and scootr.ca now appear in a smaller footer below the game.

## [1.7.3] - 2024-07-17
### Fixed
- Player is now clamped to the visible game area and cannot move outside the screen.
- Enemies now spawn just outside the visible area (by their radius), not far outside, for all four edges.

## [1.7.2] - 2024-07-17
### Fixed
- Weapons now work on live site (minification bug fixed with static weaponKey).
- All debug logs removed for production.

## [1.7.1]
### Fixed
- Defensive code for rogue weapon keys.
- Upgrade choices always unique and relevant.
- XP bar resets on restart.
- Player damage cooldown bug fixed.
- Audio and favicon errors fixed.

## [1.7.0]
### Added
- New Weapon: Code Spray (shotgun-style, upgrades, range logic).
- Scope Creep Blob enemy (splitting, visuals, sound).
- Modularized codebase (player, enemy, weapons, upgrades, config).
- Health UI always shows current/max health.
- Level up system with callback for UI.
- Enemy scaling with player level.
- Homing weapon: smooth homing, speed balanced.
- Code Spray: projectiles disappear after range, only fires if enemy in range.
- Upgrade system: weapon upgrades weighted, only for unlocked weapons.

### Changed
- Player speed reduced for balance.
- Weapon unlock upgrades set all relevant stats.

### Fixed
- Stat initialization for new weapons/upgrades.
- Upgrades for locked weapons no longer appear.
- Commit/push workflow clarified.

## [1.6.5]
- Previous stable version.

---

For a detailed summary of each release, see the project documentation or GitHub Releases. 