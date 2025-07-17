// upgrades.js - Upgrades logic for Deadline Dread
import { XP_ORB_BASE_VALUE, XP_PER_LEVEL_BASE, SHIELD_BASE_ORB_COUNT, MAX_HOMING_PROJECTILES } from './config.js';
import { OrbitingWeapon, PulseWeapon, HomingWeapon, CodeSprayWeapon } from './weapons.js';

let baseAvailableUpgrades = [];

function defineBaseUpgrades() {
    baseAvailableUpgrades = [
        { id: 'hp_up', name: 'Robust Health', description: '+20 Max Health, Heal 20', apply: (p) => { p.maxHealth += 20; p.health = Math.min(p.maxHealth, p.health + 20); } },
        { id: 'speed_up', name: 'Agile Agility', description: '+10% Movement Speed', apply: (p) => { p.speedMultiplier *= 1.1; } },
        { id: 'global_damage_up', name: 'Refactor Ray', description: '+15% Global Damage', apply: (p) => { p.globalDamageMultiplier *= 1.15; } },
        { id: 'xp_gain_up', name: 'Fast Learner', description: '+10% XP Gain', apply: (p) => { p.xpGainMultiplier *= 1.1; } },
        { id: 'pickup_radius_up', name: 'Wider Net', description: '+20% XP Orb Pickup Radius', apply: (p) => { p.pickupRadiusMultiplier *= 1.2; } },
        { id: 'get_shield', name: 'CSS Flexbox Shield', description: 'Gain orbiting shields', apply: (p) => { p.addWeapon(OrbitingWeapon); p.weaponStats[OrbitingWeapon.weaponKey] = { level: p.weaponStats[OrbitingWeapon.weaponKey].level, orbCount: 1, damageMultiplier: 1, orbitRadiusMultiplier: 1, orbitSpeedMultiplier: 1 }; }, unique: true, weaponClass: OrbitingWeapon },
        { id: 'get_pulse', name: 'Automated Linter', description: 'Gain an AoE pulse weapon', apply: (p) => { p.addWeapon(PulseWeapon); p.weaponStats[PulseWeapon.weaponKey] = { level: p.weaponStats[PulseWeapon.weaponKey].level, damageMultiplier: 1, radiusMultiplier: 1, cooldownMultiplier: 1 }; }, unique: true, weaponClass: PulseWeapon },
        { id: 'get_codespray', name: 'Code Spray', description: 'Gain a shotgun-style code spray weapon', apply: (p) => { p.addWeapon(CodeSprayWeapon); p.weaponStats[CodeSprayWeapon.weaponKey] = { level: p.weaponStats[CodeSprayWeapon.weaponKey].level, projectileCount: 6, spread: 45, damageMultiplier: 1, cooldown: 1000, projectileRange: 150, doubleBarrel: false }; }, unique: true, weaponClass: CodeSprayWeapon },
        // --- Increase weapon upgrade weight by duplicating weapon grants ---
        { id: 'get_shield_dup', name: 'CSS Flexbox Shield', description: 'Gain orbiting shields', apply: (p) => { p.addWeapon(OrbitingWeapon); p.weaponStats[OrbitingWeapon.weaponKey] = { level: p.weaponStats[OrbitingWeapon.weaponKey].level, orbCount: 1, damageMultiplier: 1, orbitRadiusMultiplier: 1, orbitSpeedMultiplier: 1 }; }, unique: true, weaponClass: OrbitingWeapon },
        { id: 'get_pulse_dup', name: 'Automated Linter', description: 'Gain an AoE pulse weapon', apply: (p) => { p.addWeapon(PulseWeapon); p.weaponStats[PulseWeapon.weaponKey] = { level: p.weaponStats[PulseWeapon.weaponKey].level, damageMultiplier: 1, radiusMultiplier: 1, cooldownMultiplier: 1 }; }, unique: true, weaponClass: PulseWeapon },
        { id: 'get_codespray_dup', name: 'Code Spray', description: 'Gain a shotgun-style code spray weapon', apply: (p) => { p.addWeapon(CodeSprayWeapon); p.weaponStats[CodeSprayWeapon.weaponKey] = { level: p.weaponStats[CodeSprayWeapon.weaponKey].level, projectileCount: 6, spread: 45, damageMultiplier: 1, cooldown: 1000, projectileRange: 150, doubleBarrel: false }; }, unique: true, weaponClass: CodeSprayWeapon },
        { id: 'homing_add_projectile', name: '+1 Homing Bolt', description: `Fire an additional homing bolt (Max ${MAX_HOMING_PROJECTILES})`, 
          requiresWeapon: HomingWeapon, 
          isMaxed: (p) => p.weaponStats[HomingWeapon.weaponKey] && p.weaponStats[HomingWeapon.weaponKey].projectileCount >= MAX_HOMING_PROJECTILES,
          apply: (p) => { if(p.weaponStats[HomingWeapon.weaponKey]) { p.weaponStats[HomingWeapon.weaponKey].projectileCount++; } } },
        { id: 'homing_damage_up', name: 'Sharper Bolts', description: '+10% Homing Damage', requiresWeapon: HomingWeapon, apply: (p) => { if(p.weaponStats[HomingWeapon.weaponKey]) { p.weaponStats[HomingWeapon.weaponKey].damageMultiplier *= 1.1; } } },
        { id: 'homing_speed_up', name: 'Faster Bolts', description: '+10% Homing Projectile Speed', requiresWeapon: HomingWeapon, apply: (p) => { if(p.weaponStats[HomingWeapon.weaponKey]) { p.weaponStats[HomingWeapon.weaponKey].projectileSpeedMultiplier *= 1.1; } } },
        { id: 'homing_attack_speed_up', name: 'Rapid Fire', description: '+10% Homing Attack Speed', requiresWeapon: HomingWeapon, apply: (p) => { if(p.weaponStats[HomingWeapon.weaponKey]) { p.weaponStats[HomingWeapon.weaponKey].attackSpeedMultiplier *= 0.9; } } },
        { id: 'shield_add_orb', name: '+1 Shield Orb', description: `Gain an additional shield orb (Max ${SHIELD_BASE_ORB_COUNT})`, 
          requiresWeapon: OrbitingWeapon, 
          isMaxed: (p) => p.weaponStats[OrbitingWeapon.weaponKey] && p.weaponStats[OrbitingWeapon.weaponKey].orbCount >= SHIELD_BASE_ORB_COUNT,
          apply: (p) => { if(p.weaponStats[OrbitingWeapon.weaponKey]) { p.weaponStats[OrbitingWeapon.weaponKey].orbCount++; } } },
        { id: 'shield_damage_up', name: 'Sharper Shields', description: '+10% Shield Damage', requiresWeapon: OrbitingWeapon, apply: (p) => { if(p.weaponStats[OrbitingWeapon.weaponKey]) { p.weaponStats[OrbitingWeapon.weaponKey].damageMultiplier *= 1.1; } } },
        { id: 'shield_radius_up', name: 'Wider Orbit', description: '+10% Shield Orbit Radius', requiresWeapon: OrbitingWeapon, apply: (p) => { if(p.weaponStats[OrbitingWeapon.weaponKey]) { p.weaponStats[OrbitingWeapon.weaponKey].orbitRadiusMultiplier *= 1.1; } } },
        { id: 'shield_orbit_speed_up', name: 'Faster Orbit', description: '+10% Shield Orbit Speed', requiresWeapon: OrbitingWeapon, apply: (p) => { if(p.weaponStats[OrbitingWeapon.weaponKey]) { p.weaponStats[OrbitingWeapon.weaponKey].orbitSpeedMultiplier *= 1.1; } } },
        { id: 'pulse_damage_up', name: 'Pulse Power', description: '+10% Pulse Damage', requiresWeapon: PulseWeapon, apply: (p) => { if(p.weaponStats[PulseWeapon.weaponKey]) { p.weaponStats[PulseWeapon.weaponKey].damageMultiplier *= 1.1; } } },
        { id: 'pulse_radius_up', name: 'Pulse Range', description: '+10% Pulse Radius', requiresWeapon: PulseWeapon, apply: (p) => { if(p.weaponStats[PulseWeapon.weaponKey]) { p.weaponStats[PulseWeapon.weaponKey].radiusMultiplier *= 1.1; } } },
        { id: 'pulse_cooldown_up', name: 'Pulse Cooldown', description: '-10% Pulse Cooldown', requiresWeapon: PulseWeapon, apply: (p) => { if(p.weaponStats[PulseWeapon.weaponKey]) { p.weaponStats[PulseWeapon.weaponKey].cooldownMultiplier *= 0.9; } } },
        { id: 'codespray_projectile_count', name: 'More Spray', description: '+1 Code Spray Projectile', requiresWeapon: CodeSprayWeapon, apply: (p) => { if(p.weaponStats[CodeSprayWeapon.weaponKey]) { p.weaponStats[CodeSprayWeapon.weaponKey].projectileCount++; } } },
        { id: 'codespray_double_barrel', name: 'Double Barrel', description: 'Double the number of Code Spray projectiles', requiresWeapon: CodeSprayWeapon, unique: true, apply: (p) => { if(p.weaponStats[CodeSprayWeapon.weaponKey]) { p.weaponStats[CodeSprayWeapon.weaponKey].projectileCount *= 2; } }, weaponClass: CodeSprayWeapon },
        { id: 'codespray_spread', name: 'Wider Spray', description: '+10° Code Spray Spread', requiresWeapon: CodeSprayWeapon, apply: (p) => { if(p.weaponStats[CodeSprayWeapon.weaponKey]) { p.weaponStats[CodeSprayWeapon.weaponKey].spreadAngle += 10 * Math.PI / 180; } } },
        { id: 'codespray_damage', name: 'Sharper Spray', description: '+2 Code Spray Damage', requiresWeapon: CodeSprayWeapon, apply: (p) => { if(p.weaponStats[CodeSprayWeapon.weaponKey]) { p.weaponStats[CodeSprayWeapon.weaponKey].damage += 2; } } },
        { id: 'codespray_range', name: 'Longer Spray', description: '+30 Code Spray Range', requiresWeapon: CodeSprayWeapon, apply: (p) => { if(p.weaponStats[CodeSprayWeapon.weaponKey]) { p.weaponStats[CodeSprayWeapon.weaponKey].projectileRange += 30; } } },
    ];
}

export { defineBaseUpgrades, baseAvailableUpgrades }; 