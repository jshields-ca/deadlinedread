// config.js - Game constants for Deadline Dread

export const PLAYER_BASE_SPEED = 2.1;
export const ENEMY_BASE_SPEED_DEFAULT = 1;
export const ENEMY_SPAWN_INTERVAL = 1000;
export const INITIAL_PLAYER_HEALTH = 100;
export const PLAYER_SIZE = 20;
export const ENEMY_BASE_SIZE_DEFAULT = 18;
export const XP_ORB_SIZE = 5;
export const XP_ORB_BASE_VALUE = 30;
export const XP_PER_LEVEL_BASE = 90;
export const ENEMY_DAMAGE_TO_PLAYER = 10;
export const BASE_ENEMY_HEALTH_DEFAULT = 20;
export const PROJECTILE_BASE_SIZE = 5;
export const PROJECTILE_BASE_SPEED = 5;
export const PROJECTILE_BASE_DAMAGE = 10;
export const HOMING_BASE_COOLDOWN = 500;
export const MAX_HOMING_PROJECTILES = 8;
export const HOMING_PROJECTILE_SPREAD_ANGLE = Math.PI / 18;
export const SHIELD_BASE_ORB_COUNT = 1;
export const SHIELD_BASE_ORBIT_RADIUS = 50;
export const SHIELD_BASE_ORBIT_SPEED = 0.05;
export const SHIELD_BASE_DAMAGE = 15;
export const SHIELD_ORB_SIZE = 8;
export const SHIELD_HIT_COOLDOWN = 500;
export const MAX_SHIELD_ORBS = 6;
export const PULSE_BASE_MAX_RADIUS = 75;
export const PULSE_BASE_DAMAGE = 25;
export const PULSE_BASE_COOLDOWN = 3000;
export const PULSE_DURATION = 300;

// --- Enemy Stat Table ---
export const ENEMY_STATS = {
  Standard: {
    color: 'tomato',
    size: ENEMY_BASE_SIZE_DEFAULT,
    baseHealth: BASE_ENEMY_HEALTH_DEFAULT,
    speed: ENEMY_BASE_SPEED_DEFAULT * 0.85,
    xpMultiplier: 1.0,
    damage: 14
  },
  Creep: {
    color: '#FFA500',
    size: ENEMY_BASE_SIZE_DEFAULT * 0.75,
    baseHealth: BASE_ENEMY_HEALTH_DEFAULT * 0.6,
    speed: ENEMY_BASE_SPEED_DEFAULT * 1.3 * 0.85,
    xpMultiplier: 0.8,
    damage: 10
  },
  Tank: {
    color: '#8A2BE2',
    size: ENEMY_BASE_SIZE_DEFAULT * 1.4,
    baseHealth: BASE_ENEMY_HEALTH_DEFAULT * 3.5,
    speed: ENEMY_BASE_SPEED_DEFAULT * 0.5,
    xpMultiplier: 1.5,
    damage: 28
  },
  ScopeCreepBlob: {
    large: {
      color: '#6a5acd',
      size: ENEMY_BASE_SIZE_DEFAULT * 1.5,
      baseHealth: 30,
      speed: ENEMY_BASE_SPEED_DEFAULT * 0.7,
      xpMultiplier: 1.5,
      splitTimeout: 8000,
      damage: 22
    },
    medium: {
      color: '#32cd32',
      size: ENEMY_BASE_SIZE_DEFAULT * 1.0,
      baseHealth: 15,
      speed: ENEMY_BASE_SPEED_DEFAULT * 1.1,
      xpMultiplier: 1.0,
      splitTimeout: 6000,
      damage: 14
    },
    small: {
      color: '#ffd700',
      size: ENEMY_BASE_SIZE_DEFAULT * 0.6,
      baseHealth: 7,
      speed: ENEMY_BASE_SPEED_DEFAULT * 1.6,
      xpMultiplier: 0.7,
      splitTimeout: null,
      damage: 8
    }
  },
  BufferOverflow: {
    color: '#ff4500',
    size: ENEMY_BASE_SIZE_DEFAULT * 1.2,
    baseHealth: BASE_ENEMY_HEALTH_DEFAULT * 4, // increased health
    speed: ENEMY_BASE_SPEED_DEFAULT * 1.4,
    xpMultiplier: 1.8,
    maxOverflows: 3,
    overflowThresholds: [0.75, 0.5, 0.25],
    knockbackImmune: true,
    damage: 18
  },
  BufferOverflowFragment: {
    color: '#ff6347',
    size: ENEMY_BASE_SIZE_DEFAULT * 0.6,
    baseHealth: BASE_ENEMY_HEALTH_DEFAULT * 0.4,
    speed: ENEMY_BASE_SPEED_DEFAULT * 1.8,
    xpMultiplier: 0.5,
    damage: 8
  }
};

// --- Weapon Stat Table ---
export const WEAPON_STATS = {
  homing: {
    baseDamage: PROJECTILE_BASE_DAMAGE,
    baseCooldown: HOMING_BASE_COOLDOWN,
    baseProjectileCount: 1,
    baseProjectileSpeed: PROJECTILE_BASE_SPEED * 0.7,
    maxProjectiles: MAX_HOMING_PROJECTILES,
    spreadAngle: HOMING_PROJECTILE_SPREAD_ANGLE,
    color: 'yellow',
  },
  orbiting: {
    baseDamage: SHIELD_BASE_DAMAGE,
    baseOrbCount: SHIELD_BASE_ORB_COUNT,
    baseOrbitRadius: SHIELD_BASE_ORBIT_RADIUS,
    baseOrbitSpeed: SHIELD_BASE_ORBIT_SPEED,
    color: 'lightblue',
  },
  pulse: {
    baseDamage: PULSE_BASE_DAMAGE,
    baseRadius: PULSE_BASE_MAX_RADIUS,
    baseCooldown: PULSE_BASE_COOLDOWN,
    color: 'magenta',
  },
  codespray: {
    baseDamage: 4,
    baseProjectileCount: 6,
    baseSpread: 45 * Math.PI / 180,
    baseCooldown: 1000,
    baseProjectileRange: 150,
    color: '#00bfff',
  },
}; 