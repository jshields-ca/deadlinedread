// weapons.js - Weapon and subclasses for Deadline Dread
import { PROJECTILE_BASE_SIZE, PROJECTILE_BASE_SPEED, PROJECTILE_BASE_DAMAGE, HOMING_BASE_COOLDOWN, MAX_HOMING_PROJECTILES, HOMING_PROJECTILE_SPREAD_ANGLE, SHIELD_BASE_ORB_COUNT, SHIELD_BASE_ORBIT_RADIUS, SHIELD_BASE_ORBIT_SPEED, SHIELD_BASE_DAMAGE, SHIELD_ORB_SIZE, SHIELD_HIT_COOLDOWN, PULSE_BASE_MAX_RADIUS, PULSE_BASE_DAMAGE, PULSE_BASE_COOLDOWN, PULSE_DURATION, XP_ORB_SIZE, XP_ORB_BASE_VALUE, WEAPON_STATS } from './config.js';

// --- Weapon base class ---
class Weapon {
    constructor(player, weaponKey) { 
        this.player = player;
        this.weaponKey = weaponKey; 
        this.lastAttackTime = 0;
    }
    update(currentTime, enemies) {} 
    draw(ctx) {} 
}

// --- Homing Weapon: Fires homing projectiles at nearest enemy ---
class HomingWeapon extends Weapon {
    static weaponKey = 'homing';
    constructor(player, weaponKey = 'homing') {
        super(player, weaponKey);
        this.stats = WEAPON_STATS.homing;
    }
    update(currentTime, enemies) { 
        const stats = this.player.weaponStats[this.weaponKey];
        if (!stats) { console.error("HomingWeaponStats not found for player!"); return; } 
        const currentCooldown = this.stats.baseCooldown * stats.attackSpeedMultiplier;
        if (currentTime - this.lastAttackTime > currentCooldown) {
            this.shoot(enemies, stats);
            this.lastAttackTime = currentTime;
        }
    }
    shoot(enemies, stats) {
        if (enemies.length === 0) return;
        let closestEnemy = null; let minDistance = Infinity;
        enemies.forEach(enemy => {
            const d = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (d < minDistance) { minDistance = d; closestEnemy = enemy; }
        });
        if (closestEnemy) {
            const baseAngle = Math.atan2(closestEnemy.y - this.player.y, closestEnemy.x - this.player.x);
            const projDamage = this.stats.baseDamage * this.player.globalDamageMultiplier * stats.damageMultiplier;
            const projSpeed = this.stats.baseProjectileSpeed * stats.projectileSpeedMultiplier;
            const numProjectiles = stats.projectileCount;
            const angleStep = numProjectiles > 1 ? this.stats.spreadAngle : 0;
            const startAngle = baseAngle - (angleStep * (numProjectiles - 1)) / 2;
            for (let i = 0; i < numProjectiles; i++) {
                const angle = startAngle + i * angleStep;
                if (this.player.spawnProjectile) {
                    this.player.spawnProjectile(this.player.x, this.player.y, PROJECTILE_BASE_SIZE, this.stats.color, angle, projDamage, projSpeed, undefined, { homing: true, turnRate: 0.12, enemies });
                }
            }
        }
    }
}

// --- Orbiting Weapon: Orbs orbit the player, damaging on contact ---
class OrbitingWeapon extends Weapon {
    static weaponKey = 'orbiting';
    constructor(player, weaponKey = 'orbiting') {
        super(player, weaponKey);
        this.stats = WEAPON_STATS.orbiting;
        this.angle = 0;
        this.orbs = []; 
        this.lastHitTimes = new Map(); 
    }
    update(currentTime, enemies) {
        const stats = this.player.weaponStats[this.weaponKey];
        if (!stats) { console.error("OrbitingWeaponStats not found for player!"); return; }
        this.angle += this.stats.baseOrbitSpeed * stats.orbitSpeedMultiplier; 
        this.orbs = [];
        if (stats.orbCount === 0) return; 
        const angleIncrement = (Math.PI * 2) / stats.orbCount;
        for (let i = 0; i < stats.orbCount; i++) {
            const currentAngle = this.angle + i * angleIncrement;
            this.orbs.push({
                x: this.player.x + Math.cos(currentAngle) * (this.stats.baseOrbitRadius * stats.orbitRadiusMultiplier),
                y: this.player.y + Math.sin(currentAngle) * (this.stats.baseOrbitRadius * stats.orbitRadiusMultiplier)
            });
        }
        const currentDamage = this.stats.baseDamage * this.player.globalDamageMultiplier * stats.damageMultiplier;
        this.orbs.forEach(orb => {
            for (let i = enemies.length - 1; i >= 0; i--) {
                const enemy = enemies[i];
                const distance = Math.hypot(orb.x - enemy.x, orb.y - enemy.y);
                if (distance < SHIELD_ORB_SIZE + enemy.radius) {
                    const lastHit = this.lastHitTimes.get(enemy);
                    if (!lastHit || currentTime - lastHit > SHIELD_HIT_COOLDOWN) {
                        this.lastHitTimes.set(enemy, currentTime);
                        if (enemy.takeDamage(currentDamage, enemies)) {
                            if (this.player.spawnXPOrb) {
                                this.player.spawnXPOrb(enemy.x, enemy.y, XP_ORB_SIZE, '#76c7c0', XP_ORB_BASE_VALUE * enemy.xpMultiplier);
                            }
                            enemies.splice(i, 1);
                        }
                    }
                }
            }
        });
        this.lastHitTimes.forEach((time, enemy) => {
            if (currentTime - time > SHIELD_HIT_COOLDOWN + 100) { 
                const enemyExists = enemies.includes(enemy); 
                if (!enemyExists) this.lastHitTimes.delete(enemy);
            }
        });
    }
    draw(ctx) {
        const stats = this.player.weaponStats[this.weaponKey];
        if (!stats || stats.orbCount === 0) return;
        ctx.fillStyle = this.stats.color;
        this.orbs.forEach(orb => {
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, SHIELD_ORB_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
        });
    }
}

// --- Pulse Weapon: Periodically emits a damaging AoE pulse ---
class PulseWeapon extends Weapon {
    static weaponKey = 'pulse';
    constructor(player, weaponKey = 'pulse') {
        super(player, weaponKey);
        this.stats = WEAPON_STATS.pulse;
        this.isPulsing = false;
        this.pulseStartTime = 0;
        this.currentPulseVisualRadius = 0; 
        this.enemiesHitThisPulse = new Set();
    }
    update(currentTime, enemies) {
        const stats = this.player.weaponStats[this.weaponKey];
        if (!stats) { console.error("PulseWeaponStats not found for player!"); return; }
        const currentCooldown = this.stats.baseCooldown * stats.cooldownMultiplier;
        const currentMaxRadius = this.stats.baseRadius * stats.radiusMultiplier;
        if (this.isPulsing) {
            const pulseProgress = (currentTime - this.pulseStartTime) / PULSE_DURATION;
            if (pulseProgress >= 1) {
                this.isPulsing = false;
                this.currentPulseVisualRadius = 0;
            } else {
                this.currentPulseVisualRadius = currentMaxRadius * pulseProgress; 
                this.checkCollisions(enemies, currentMaxRadius); 
            }
        } else if (currentTime - this.lastAttackTime > currentCooldown) {
            this.isPulsing = true;
            this.lastAttackTime = currentTime;
            this.pulseStartTime = currentTime;
            this.currentPulseVisualRadius = 0;
            this.enemiesHitThisPulse.clear();
        }
    }
    checkCollisions(enemies, effectiveRadius) {
        if (!this.isPulsing) return;
        const stats = this.player.weaponStats[this.weaponKey];
        if (!stats) return;
        const currentDamage = this.stats.baseDamage * this.player.globalDamageMultiplier * stats.damageMultiplier;
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (!this.enemiesHitThisPulse.has(enemy)) {
                const distance = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
                if (distance <= effectiveRadius) { 
                    this.enemiesHitThisPulse.add(enemy);
                    if (enemy.takeDamage(currentDamage, enemies)) {
                        if (this.player.spawnXPOrb) {
                            this.player.spawnXPOrb(enemy.x, enemy.y, XP_ORB_SIZE, '#76c7c0', XP_ORB_BASE_VALUE * enemy.xpMultiplier);
                        }
                        enemies.splice(i, 1);
                    }
                }
            }
        }
    }
    draw(ctx) {
        const stats = this.player.weaponStats[this.weaponKey];
        if (!stats) return;
        if (this.isPulsing) {
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.beginPath();
            ctx.arc(this.player.x, this.player.y, this.currentPulseVisualRadius, 0, Math.PI * 2);
            ctx.fillStyle = this.stats.color;
            ctx.fill();
            ctx.restore();
        }
    }
}

// --- Code Spray Weapon: Shotgun-style, fires a spread of projectiles ---
class CodeSprayWeapon extends Weapon {
    static weaponKey = 'codespray';
    constructor(player, weaponKey = 'codespray') {
        super(player, weaponKey);
        this.stats = WEAPON_STATS.codespray;
    }
    update(currentTime, enemies) {
        const stats = this.player.weaponStats[this.weaponKey];
        if (!stats) { console.error("CodeSprayWeaponStats not found for player!"); return; }
        const currentCooldown = stats.cooldown || this.stats.baseCooldown;
        if (!this.lastAttackTime) this.lastAttackTime = 0;
        // Only fire if at least one enemy is in range
        let enemyInRange = false;
        const range = stats.projectileRange || this.stats.baseProjectileRange;
        for (const enemy of enemies) {
            if (Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y) <= range) {
                enemyInRange = true;
                break;
            }
        }
        if (enemyInRange && (currentTime - this.lastAttackTime > currentCooldown)) {
            this.shoot(enemies, stats);
            this.lastAttackTime = currentTime;
        }
    }
    shoot(enemies, stats) {
        // Find the closest enemy in range
        let closestEnemy = null;
        let minDist = stats.projectileRange || this.stats.baseProjectileRange;
        for (const enemy of enemies) {
            const d = Math.hypot(enemy.x - this.player.x, enemy.y - this.player.y);
            if (d < minDist) { minDist = d; closestEnemy = enemy; }
        }
        let angle;
        if (closestEnemy) {
            angle = Math.atan2(closestEnemy.y - this.player.y, closestEnemy.x - this.player.x);
        } else {
            angle = this.player.lastMoveAngle !== undefined ? this.player.lastMoveAngle : 0;
        }
        const numProjectiles = stats.projectileCount || this.stats.baseProjectileCount;
        const spread = (stats.spreadAngle || this.stats.baseSpread);
        const projSpeed = stats.projectileSpeed || 14;
        const projRange = stats.projectileRange || this.stats.baseProjectileRange;
        const projDamage = stats.damage || this.stats.baseDamage;
        const startAngle = angle - spread / 2;
        for (let i = 0; i < numProjectiles; i++) {
            const theta = startAngle + (spread * i) / (numProjectiles - 1);
            if (this.player.spawnProjectile) {
                this.player.spawnProjectile(this.player.x, this.player.y, 5, this.stats.color, theta, projDamage, projSpeed, projRange);
            }
        }
    }
    draw(ctx) {
        // No persistent visual needed
    }
}

class Projectile {
    constructor(x, y, radius, color, angle, damage, speed, maxRange, options = {}) {
        this.x = x; this.y = y; this.radius = radius; this.color = color;
        this.damage = damage;
        this.velocityX = Math.cos(angle) * speed;
        this.velocityY = Math.sin(angle) * speed;
        this.maxRange = maxRange;
        this.distanceTraveled = 0;
        // Homing logic
        this.homing = options.homing || false;
        this.turnRate = options.turnRate || 0.1;
        this.enemies = options.enemies || null;
        this.speed = speed;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
    update() {
        // Smooth homing logic
        if (this.homing && this.enemies && this.enemies.length > 0) {
            let closestEnemy = null;
            let minDist = Infinity;
            for (const enemy of this.enemies) {
                const d = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (d < minDist) { minDist = d; closestEnemy = enemy; }
            }
            if (closestEnemy) {
                const desiredAngle = Math.atan2(closestEnemy.y - this.y, closestEnemy.x - this.x);
                const currentAngle = Math.atan2(this.velocityY, this.velocityX);
                let delta = desiredAngle - currentAngle;
                // Normalize angle to [-PI, PI]
                while (delta > Math.PI) delta -= 2 * Math.PI;
                while (delta < -Math.PI) delta += 2 * Math.PI;
                const newAngle = currentAngle + Math.sign(delta) * Math.min(Math.abs(delta), this.turnRate);
                this.velocityX = Math.cos(newAngle) * this.speed;
                this.velocityY = Math.sin(newAngle) * this.speed;
            }
        }
        this.x += this.velocityX;
        this.y += this.velocityY;
        if (this.maxRange !== undefined) {
            this.distanceTraveled += Math.hypot(this.velocityX, this.velocityY);
            if (this.distanceTraveled > this.maxRange) {
                this.toRemove = true;
            }
        }
    }
}

export { Weapon, HomingWeapon, OrbitingWeapon, PulseWeapon, CodeSprayWeapon, Projectile }; 