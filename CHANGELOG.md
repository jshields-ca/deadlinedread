# Deadline Dread Changelog

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