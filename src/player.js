// Player.js - Player class for Deadline Dread

import { XP_PER_LEVEL_BASE, PLAYER_BASE_SPEED } from './config.js';

class Player {
    constructor(x, y, size, color, health) {
        this.x = x; this.y = y; this.size = size; this.radius = size / 2;
        this.color = color; this.health = health; this.maxHealth = health;
        this.xp = 0; this.level = 1;
        this.xpToNextLevel = XP_PER_LEVEL_BASE;
        this.speedMultiplier = 1;
        this.globalDamageMultiplier = 1; 
        this.xpGainMultiplier = 1;
        this.pickupRadiusMultiplier = 1;
        this.weaponStats = {};
        this.activeWeapons = [];
        this.levelUpCallback = null;
        // --- Add damage cooldown ---
        this.lastDamagedTime = 0;
        this.damageCooldown = 700; // ms
    }
    draw(ctx) { 
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        const barWidth = this.size * 1.5;
        const barHeight = 8;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - barHeight - 5;
        ctx.fillStyle = '#555';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        const healthPercentage = this.health / this.maxHealth;
        ctx.fillStyle = healthPercentage > 0.5 ? 'lime' : (healthPercentage > 0.2 ? 'yellow' : 'red');
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
        ctx.strokeStyle = '#333';
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    update(currentTime, keys, enemies, playerHealthDisplay) { 
        let moveX = 0; let moveY = 0;
        if (keys['w'] || keys['W'] || keys['ArrowUp']) moveY -= 1;
        if (keys['s'] || keys['S'] || keys['ArrowDown']) moveY += 1;
        if (keys['a'] || keys['A'] || keys['ArrowLeft']) moveX -= 1;
        if (keys['d'] || keys['D'] || keys['ArrowRight']) moveX += 1;
        const currentSpeed = PLAYER_BASE_SPEED * this.speedMultiplier;
        if (moveX !== 0 || moveY !== 0) {
            const magnitude = Math.hypot(moveX, moveY);
            this.x += (moveX / magnitude) * currentSpeed;
            this.y += (moveY / magnitude) * currentSpeed;
            this.lastMoveAngle = Math.atan2(moveY, moveX);
        }
        this.activeWeapons.forEach(weapon => weapon.update(currentTime, enemies));
        if (playerHealthDisplay) playerHealthDisplay.textContent = `${Math.max(0, Math.ceil(this.health))} / ${Math.ceil(this.maxHealth)}`;
    }
    takeDamage(amount, setGameState) { 
        const now = performance.now();
        if (now - this.lastDamagedTime < this.damageCooldown) return;
        this.lastDamagedTime = now;
        this.health -= amount;
        if (this.health <= 0) {
            this.health = 0;
            if (setGameState) setGameState('over');
        }
    }
    gainXP(amount) {
        this.xp += amount * this.xpGainMultiplier;
        while (this.xp >= this.xpToNextLevel) {
            this.xp -= this.xpToNextLevel;
            this.levelUp();
        }
        this.updateXpBar && this.updateXpBar();
    }
    levelUp() {
        this.level++;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.15);
        if (this.levelUpCallback) {
            this.levelUpCallback();
        }
        // --- Add: call onLevelUp if defined ---
        if (this.onLevelUp) {
            this.onLevelUp();
        }
    }
    updateXpBar() {
        // This should be handled in main.js with DOM
    }
    addWeapon(WeaponConstructor) { 
        let weaponKey;
        if (WeaponConstructor.name === 'HomingWeapon') {
            weaponKey = 'homing';
        } else if (WeaponConstructor.name === 'OrbitingWeapon') {
            weaponKey = 'orbiting';
        } else if (WeaponConstructor.name === 'PulseWeapon') {
            weaponKey = 'pulse';
        } else if (WeaponConstructor.name === 'CodeSprayWeapon') {
            weaponKey = 'codespray';
        } else {
            weaponKey = WeaponConstructor.name;
        }
        if (!this.weaponStats[weaponKey]) { 
            this.activeWeapons.push(new WeaponConstructor(this, weaponKey));
        } else {
            this.weaponStats[weaponKey].level = (this.weaponStats[weaponKey].level || 0) + 1;
        }
    }
}

export default Player; 