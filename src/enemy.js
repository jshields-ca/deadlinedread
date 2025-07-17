// enemy.js - Enemy, XPOrb, and spawnEnemy for Deadline Dread
import { ENEMY_BASE_SIZE_DEFAULT, BASE_ENEMY_HEALTH_DEFAULT, ENEMY_BASE_SPEED_DEFAULT, XP_ORB_SIZE, XP_ORB_BASE_VALUE } from './config.js';

let enemies = [];

class Enemy {
    constructor(x, y, type = 'Standard', splitLevel = null) {
        this.x = x; this.y = y; this.type = type;
        this.xpMultiplier = 1; 
        this.splitLevel = splitLevel; // For Scope Creep Blob: 'large', 'medium', 'small'
        this.splitTimer = null;
        this.splitTimeout = null;
        this.hasSplit = false;
        const currentEnemyBaseSize = ENEMY_BASE_SIZE_DEFAULT;
        const currentBaseEnemyHealth = BASE_ENEMY_HEALTH_DEFAULT;
        const currentEnemyBaseSpeed = ENEMY_BASE_SPEED_DEFAULT;
        switch (type) {
            case 'Creep':
                this.size = currentEnemyBaseSize * 0.75;
                this.color = '#FFA500'; 
                this.baseHealth = currentBaseEnemyHealth * 0.6;
                this.speed = currentEnemyBaseSpeed * 1.3 * 0.85; // 15% slower
                this.xpMultiplier = 0.8;
                break;
            case 'Tank':
                this.size = currentEnemyBaseSize * 1.4;
                this.color = '#8A2BE2'; 
                this.baseHealth = currentBaseEnemyHealth * 3.5;
                this.speed = currentEnemyBaseSpeed * 0.5; 
                this.xpMultiplier = 1.5;
                break;
            case 'Standard':
            default:
                this.size = currentEnemyBaseSize;
                this.color = 'tomato';
                this.baseHealth = currentBaseEnemyHealth;
                this.speed = currentEnemyBaseSpeed * 0.85; // 15% slower
                this.xpMultiplier = 1;
                break;
            case 'ScopeCreepBlob':
                if (splitLevel === 'large') {
                    this.size = currentEnemyBaseSize * 1.5;
                    this.color = '#6a5acd'; // purple
                    this.baseHealth = 30;
                    this.speed = currentEnemyBaseSpeed * 0.7;
                    this.xpMultiplier = 1.5;
                    this.splitTimeout = 8000;
                } else if (splitLevel === 'medium') {
                    this.size = currentEnemyBaseSize * 1.0;
                    this.color = '#32cd32'; // green
                    this.baseHealth = 15;
                    this.speed = currentEnemyBaseSpeed * 1.1;
                    this.xpMultiplier = 1.0;
                    this.splitTimeout = 6000;
                } else if (splitLevel === 'small') {
                    this.size = currentEnemyBaseSize * 0.6;
                    this.color = '#ffd700'; // gold
                    this.baseHealth = 7;
                    this.speed = currentEnemyBaseSpeed * 1.6;
                    this.xpMultiplier = 0.7;
                    this.splitTimeout = null;
                } else {
                    this.size = currentEnemyBaseSize * 1.5;
                    this.color = '#6a5acd';
                    this.baseHealth = 30;
                    this.speed = currentEnemyBaseSpeed * 0.7;
                    this.xpMultiplier = 1.5;
                    this.splitTimeout = 8000;
                }
                break;
        }
        this.radius = this.size / 2;
        this.health = this.baseHealth;
        this.maxHealth = this.health;
        if (type === 'ScopeCreepBlob' && this.splitTimeout) {
            this.splitTimer = performance.now();
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        if (this.type === 'ScopeCreepBlob') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = '#222';
            ctx.beginPath();
            ctx.arc(-this.radius/3, -this.radius/4, this.radius/7, 0, Math.PI*2);
            ctx.arc(this.radius/3, -this.radius/4, this.radius/7, 0, Math.PI*2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, this.radius/6, this.radius/4, 0, Math.PI);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
        }
        const barWidth = this.size * 1.2;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - barHeight - 3;
        ctx.fillStyle = '#400';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        const healthPercentage = this.health > 0 ? this.health / this.maxHealth : 0;
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }
    update(targetPlayer) {
        if(!targetPlayer) return; 
        const dx = targetPlayer.x - this.x;
        const dy = targetPlayer.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
            this.x += (dx / distance) * this.speed; 
            this.y += (dy / distance) * this.speed;
        }
        if (this.type === 'ScopeCreepBlob' && this.splitTimeout && !this.hasSplit) {
            if (performance.now() - this.splitTimer > this.splitTimeout) {
                this.split();
            }
        }
    }
    takeDamage(amount) {
        this.health -= amount;
        if (this.type === 'ScopeCreepBlob' && this.health <= 0 && !this.hasSplit) {
            this.split();
            return false;
        }
        return this.health <= 0;
    }
    split() {
        if (this.hasSplit) return;
        this.hasSplit = true;
        if (window && window.Audio) {
            try {
                const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7bfa.mp3');
                audio.volume = 0.3;
                audio.onerror = function() { /* ignore missing audio */ };
                const playPromise = audio.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(() => {/* ignore playback errors */});
                }
            } catch (e) { /* ignore */ }
        }
        if (this.splitLevel === 'large') {
            for (let i = 0; i < 2; i++) {
                enemies.push(new Enemy(this.x + (Math.random()-0.5)*30, this.y + (Math.random()-0.5)*30, 'ScopeCreepBlob', 'medium'));
            }
        } else if (this.splitLevel === 'medium') {
            for (let i = 0; i < 2; i++) {
                enemies.push(new Enemy(this.x + (Math.random()-0.5)*20, this.y + (Math.random()-0.5)*20, 'ScopeCreepBlob', 'small'));
            }
        }
        const idx = enemies.indexOf(this);
        if (idx !== -1) enemies.splice(idx, 1);
        // xpOrbs.push(new XPOrb(this.x, this.y, XP_ORB_SIZE, '#76c7c0', XP_ORB_BASE_VALUE * (this.xpMultiplier || 1))); // This line was removed as per the new_code
    }
}

class XPOrb {
    constructor(x, y, radius, color, value) {
        this.x = x; this.y = y; this.radius = radius; this.color = color; this.value = value;
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
    }
}

function spawnEnemy(enemies, elapsedGameTime, canvas, player) {
    let spawnX, spawnY;
    const edge = Math.floor(Math.random() * 4);
    const effectiveEnemyBaseSize = ENEMY_BASE_SIZE_DEFAULT;
    switch (edge) {
        case 0: spawnX = Math.random() * canvas.width; spawnY = -effectiveEnemyBaseSize * 1.5; break;
        case 1: spawnX = Math.random() * canvas.width; spawnY = canvas.height + effectiveEnemyBaseSize * 1.5; break;
        case 2: spawnX = -effectiveEnemyBaseSize * 1.5; spawnY = Math.random() * canvas.height; break;
        case 3: spawnX = canvas.width + effectiveEnemyBaseSize * 1.5; spawnY = Math.random() * canvas.height; break;
    }
    const rand = Math.random();
    let typeToSpawn;
    // --- Increase spawnCount with player level ---
    let spawnCount = 1;
    let playerLevel = player && player.level ? player.level : 1;
    const creepChance = 0.15 + (elapsedGameTime / 300); 
    const tankChance = 0.05 + (elapsedGameTime / 600); 
    const scopeCreepChance = 0.07 + (elapsedGameTime / 500);
    if (rand < scopeCreepChance && elapsedGameTime > 20) {
        typeToSpawn = 'ScopeCreepBlob';
    } else if (rand < tankChance && elapsedGameTime > 30) { 
        typeToSpawn = 'Tank';
    } else if (rand < tankChance + creepChance) { 
        typeToSpawn = 'Creep';
        spawnCount = Math.floor(Math.random() * 3) + 2 + Math.floor(playerLevel / 7); // +1 every 7 levels
    } else { 
        typeToSpawn = 'Standard';
        spawnCount = 1 + Math.floor(playerLevel / 10); // +1 every 10 levels
    }
    for (let i = 0; i < spawnCount; i++) {
        let finalX = spawnX + (Math.random() - 0.5) * 30 * (spawnCount > 1 ? 1 : 0);
        let finalY = spawnY + (Math.random() - 0.5) * 30 * (spawnCount > 1 ? 1 : 0);
        if (typeToSpawn === 'ScopeCreepBlob') {
            enemies.push(new Enemy(finalX, finalY, 'ScopeCreepBlob', 'large'));
        } else {
            enemies.push(new Enemy(finalX, finalY, typeToSpawn));
        }
    }
}

export { Enemy, XPOrb, spawnEnemy }; 