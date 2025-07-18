// enemy.js - Enemy, XPOrb, and spawnEnemy for Deadline Dread
import { ENEMY_BASE_SIZE_DEFAULT, BASE_ENEMY_HEALTH_DEFAULT, ENEMY_BASE_SPEED_DEFAULT, XP_ORB_SIZE, XP_ORB_BASE_VALUE, ENEMY_STATS } from './config.js';

// --- Enemy Types ---
// Standard: Basic enemy, no special mechanics.
// Creep: Faster, weaker enemy.
// Tank: Slow, high-health enemy.
// ScopeCreepBlob: Splits into smaller blobs on death or after a timer (large → medium → small).
// BufferOverflow: Overflows at health thresholds, spawning fast fragments.
// BufferOverflowFragment: Fast, weak, small enemy spawned by BufferOverflow.

let enemies = [];

class Enemy {
    /**
     * Create a new enemy.
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {string} type - Enemy type
     * @param {string|null} splitLevel - For ScopeCreepBlob: 'large', 'medium', 'small'
     */
    constructor(x, y, type = 'Standard', splitLevel = null) {
        this.x = x; this.y = y; this.type = type;
        this.xpMultiplier = 1; 
        this.splitLevel = splitLevel; // For Scope Creep Blob: 'large', 'medium', 'small'
        this.splitTimer = null;
        this.splitTimeout = null;
        this.hasSplit = false;
        // --- Assign stats from ENEMY_STATS ---
        if (type === 'ScopeCreepBlob') {
            const stats = ENEMY_STATS.ScopeCreepBlob[splitLevel || 'large'];
            this.size = stats.size;
            this.color = stats.color;
            this.baseHealth = stats.baseHealth;
            this.speed = stats.speed;
            this.xpMultiplier = stats.xpMultiplier;
            this.splitTimeout = stats.splitTimeout;
            this.damage = stats.damage;
        } else if (type === 'BufferOverflow') {
            const stats = ENEMY_STATS.BufferOverflow;
            this.size = stats.size;
            this.color = stats.color;
            this.baseHealth = stats.baseHealth;
            this.speed = stats.speed;
            this.xpMultiplier = stats.xpMultiplier;
            this.overflowCount = 0;
            this.maxOverflows = stats.maxOverflows;
            this.overflowThresholds = stats.overflowThresholds;
            this.knockbackImmune = stats.knockbackImmune || false;
            this.damage = stats.damage;
        } else if (type === 'BufferOverflowFragment') {
            const stats = ENEMY_STATS.BufferOverflowFragment;
            this.size = stats.size;
            this.color = stats.color;
            this.baseHealth = stats.baseHealth;
            this.speed = stats.speed;
            this.xpMultiplier = stats.xpMultiplier;
            this.damage = stats.damage;
        } else {
            const stats = ENEMY_STATS[type] || ENEMY_STATS.Standard;
            this.size = stats.size;
            this.color = stats.color;
            this.baseHealth = stats.baseHealth;
            this.speed = stats.speed;
            this.xpMultiplier = stats.xpMultiplier;
            this.damage = stats.damage;
        }
        this.radius = this.size / 2;
        this.health = this.baseHealth;
        this.maxHealth = this.health;
        if (type === 'ScopeCreepBlob' && this.splitTimeout) {
            this.splitTimer = performance.now();
        }
    }
    /**
     * Draw the enemy on the canvas.
     * Special visuals for ScopeCreepBlob and BufferOverflow.
     */
    draw(ctx) {
        ctx.save();
        // Add a white glow around the enemy
        ctx.shadowColor = '#fff';
        ctx.shadowBlur = Math.max(8, this.radius * 0.7);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.closePath();
        ctx.shadowBlur = 0;
        // Draw a border (stroke) with a darker version of the enemy color
        ctx.lineWidth = Math.max(2, this.radius * 0.18);
        ctx.strokeStyle = darkenColor(this.color, 0.5);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // --- Scope Creep Blob face and label ---
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
            // Add SCP label by splitLevel
            let textColor = isColorLight(this.color) ? '#111' : '#fff';
            ctx.fillStyle = textColor;
            ctx.font = `${Math.max(8, this.radius * 0.5)}px monospace`;
            ctx.textAlign = 'center';
            let scpLabel = 'SCP';
            if (this.splitLevel === 'large') scpLabel = 'SCP-L';
            else if (this.splitLevel === 'medium') scpLabel = 'SCP-M';
            else if (this.splitLevel === 'small') scpLabel = 'SCP-S';
            ctx.fillText(scpLabel, 0, this.radius * 0.7);
            ctx.restore();
        } else if (this.type === 'BufferOverflow') {
            // --- Buffer Overflow: corrupted data visual ---
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff0000';
            for (let i = 0; i < 3; i++) {
                const angle = (i * Math.PI * 2 / 3) + (performance.now() * 0.001);
                const x = Math.cos(angle) * (this.radius * 0.6);
                const y = Math.sin(angle) * (this.radius * 0.6);
                ctx.fillRect(x - 2, y - 2, 4, 4);
            }
            ctx.fillStyle = isColorLight(this.color) ? '#111' : '#fff';
            ctx.font = `${Math.max(8, this.radius * 0.3)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('BUF', 0, this.radius * 0.2);
            ctx.restore();
        } else if (this.type === 'BufferOverflowFragment') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isColorLight(this.color) ? '#111' : '#fff';
            ctx.font = `${Math.max(8, this.radius * 0.4)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('FRG', 0, this.radius * 0.3);
            ctx.restore();
        } else if (this.type === 'Tank') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isColorLight(this.color) ? '#111' : '#fff';
            ctx.font = `${Math.max(8, this.radius * 0.4)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('TANK', 0, this.radius * 0.3);
            ctx.restore();
        } else if (this.type === 'Creep') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isColorLight(this.color) ? '#111' : '#fff';
            ctx.font = `${Math.max(8, this.radius * 0.4)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText('CRP', 0, this.radius * 0.3);
            ctx.restore();
        } else if (this.type === 'Standard') {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isColorLight(this.color) ? '#111' : '#fff';
            ctx.font = `${Math.max(8, this.radius * 0.4)}px monospace`;
            ctx.textAlign = 'center';
            let label = this.isMutated ? 'MUT' : 'BUG';
            ctx.fillText(label, 0, this.radius * 0.3);
            ctx.restore();
        }
        // --- Health bar ---
        let barWidth = this.size * 1.2;
        const barHeight = 5;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.radius - barHeight - 3;
        ctx.fillStyle = '#400';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        const healthPercentage = this.health > 0 ? this.health / this.maxHealth : 0;
        ctx.fillStyle = 'red';
        ctx.fillRect(barX, barY, barWidth * healthPercentage, barHeight);
    }
    /**
     * Update enemy position and handle special mechanics (splitting, overflow).
     */
    update(targetPlayer, enemiesArray) {
        if(!targetPlayer) return; 
        const dx = targetPlayer.x - this.x;
        const dy = targetPlayer.y - this.y;
        const distance = Math.hypot(dx, dy);
        if (distance > 0) {
            let moveX = (dx / distance) * this.speed;
            let moveY = (dy / distance) * this.speed;
            // --- Creep: add random jitter ---
            if (this.type === 'Creep') {
                const jitterStrength = 0.5; // tweak as needed
                moveX += (Math.random() - 0.5) * jitterStrength;
                moveY += (Math.random() - 0.5) * jitterStrength;
            }
            this.x += moveX;
            this.y += moveY;
        }
        // --- Scope Creep Blob: split after timer ---
        if (this.type === 'ScopeCreepBlob' && this.splitTimeout && !this.hasSplit) {
            if (performance.now() - this.splitTimer > this.splitTimeout) {
                this.split(enemiesArray);
            }
        }
    }
    /**
     * Handle taking damage. Triggers overflow/split mechanics if needed.
     */
    takeDamage(amount, enemiesArray) {
        this.health -= amount;
        // --- Buffer Overflow: overflow at health thresholds ---
        if (this.type === 'BufferOverflow' && this.overflowCount < this.maxOverflows && enemiesArray) {
            const healthPercentage = this.health / this.maxHealth;
            const thresholds = this.overflowThresholds || [0.75, 0.5, 0.25];
            if (healthPercentage <= thresholds[this.overflowCount]) {
                this.overflow(enemiesArray);
            }
        }
        // --- Scope Creep Blob: split on death ---
        if (this.type === 'ScopeCreepBlob' && this.health <= 0 && !this.hasSplit) {
            this.split(enemiesArray);
            return false;
        }
        return this.health <= 0;
    }
    /**
     * Scope Creep Blob: Split into smaller blobs.
     */
    split(enemiesArray) {
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
                enemiesArray.push(new Enemy(this.x + (Math.random()-0.5)*30, this.y + (Math.random()-0.5)*30, 'ScopeCreepBlob', 'medium'));
            }
        } else if (this.splitLevel === 'medium') {
            for (let i = 0; i < 2; i++) {
                enemiesArray.push(new Enemy(this.x + (Math.random()-0.5)*20, this.y + (Math.random()-0.5)*20, 'ScopeCreepBlob', 'small'));
            }
        }
        const idx = enemiesArray.indexOf(this);
        if (idx !== -1) enemiesArray.splice(idx, 1);
    }
    /**
     * Buffer Overflow: Spawn fragment enemies at each overflow threshold.
     */
    overflow(enemiesArray) {
        if (this.overflowCount >= this.maxOverflows) return;
        this.overflowCount++;
        if (window && window.Audio) {
            try {
                const audio = new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_115b9b7bfa.mp3');
                audio.volume = 0.2;
                audio.onerror = function() { /* ignore missing audio */ };
                const playPromise = audio.play();
                if (playPromise && playPromise.catch) {
                    playPromise.catch(() => {/* ignore playback errors */});
                }
            } catch (e) { /* ignore */ }
        }
        // Create smaller "overflow" enemies
        const overflowCount = 2 + this.overflowCount; // More enemies each time it overflows
        for (let i = 0; i < overflowCount; i++) {
            const angle = (i * Math.PI * 2 / overflowCount);
            const distance = 20 + (this.overflowCount * 10);
            const newX = this.x + Math.cos(angle) * distance;
            const newY = this.y + Math.sin(angle) * distance;
            // Create a smaller, faster enemy
            const stats = ENEMY_STATS.BufferOverflowFragment;
            const overflowEnemy = new Enemy(newX, newY, 'BufferOverflowFragment');
            enemiesArray.push(overflowEnemy);
        }
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

// Particle class for hit/death effects
class Particle {
    constructor(x, y, color, size, velocity, lifetime) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.vx = velocity.x;
        this.vy = velocity.y;
        this.lifetime = lifetime;
        this.age = 0;
        this.alpha = 1;
    }
    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.age += dt;
        this.alpha = Math.max(0, 1 - this.age / this.lifetime);
    }
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }
}

// Shockwave class for special effects (expanding, fading ring)
class Shockwave {
    constructor(x, y, color, maxRadius, duration) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.maxRadius = maxRadius;
        this.duration = duration;
        this.age = 0;
    }
    update(dt) {
        this.age += dt;
    }
    draw(ctx) {
        const progress = Math.min(1, this.age / this.duration);
        const radius = this.maxRadius * progress;
        ctx.save();
        ctx.globalAlpha = 0.4 * (1 - progress);
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 6 * (1 - progress) + 2;
        ctx.strokeStyle = this.color;
        ctx.stroke();
        ctx.restore();
    }
    isDone() {
        return this.age >= this.duration;
    }
}

function spawnEnemy(enemies, elapsedGameTime, canvas, player) {
    let spawnX, spawnY;
    const edge = Math.floor(Math.random() * 4);
    const effectiveEnemyBaseSize = ENEMY_BASE_SIZE_DEFAULT;
    let tempEnemy = new Enemy(0, 0); // Use default size for offset
    let offset = tempEnemy.radius + 20; // Further outside the edge to prevent spawning too close
    switch (edge) {
        case 0: spawnX = Math.random() * canvas.width; spawnY = -offset; break; // Top
        case 1: spawnX = Math.random() * canvas.width; spawnY = canvas.height + offset; break; // Bottom
        case 2: spawnX = -offset; spawnY = Math.random() * canvas.height; break; // Left
        case 3: spawnX = canvas.width + offset; spawnY = Math.random() * canvas.height; break; // Right
    }
    // --- Tank Limit ---
    const tankCount = enemies.filter(e => e.type === 'Tank').length;
    // --- Tank Guarantee ---
    if (tankCount < 10 && elapsedGameTime - spawnEnemy.lastTankTime >= 45) {
        spawnEnemy.lastTankTime = elapsedGameTime;
        enemies.push(new Enemy(spawnX, spawnY, 'Tank'));
        return;
    }
    // --- Regular spawn pool (Tank included, but only if < 10 Tanks) ---
    const rand = Math.random();
    let typeToSpawn;
    let spawnCount = 1;
    let playerLevel = player && player.level ? player.level : 1;
    const creepChance = 0.15 + (elapsedGameTime / 300); 
    const tankChance = 0.10 + (elapsedGameTime / 400);
    const scopeCreepChance = 0.07 + (elapsedGameTime / 500);
    const bufferOverflowChance = 0.04 + (elapsedGameTime / 800);
    // Standard spawn rate is now constant (no decrease with player level)
    // let standardChance = 1 - (scopeCreepChance + tankChance + creepChance + bufferOverflowChance);
    // standardChance = Math.max(0.05, standardChance - (playerLevel * 0.01)); // never below 5%
    if (rand < scopeCreepChance && elapsedGameTime > 20) {
        typeToSpawn = 'ScopeCreepBlob';
    } else if (rand < scopeCreepChance + tankChance && elapsedGameTime > 30 && tankCount < 10) {
        typeToSpawn = 'Tank';
    } else if (rand < scopeCreepChance + tankChance + creepChance) {
        typeToSpawn = 'Creep';
        spawnCount = Math.floor(Math.random() * 3) + 2 + Math.floor(playerLevel / 7); // +1 every 7 levels
    } else if (rand < scopeCreepChance + tankChance + creepChance + bufferOverflowChance && elapsedGameTime > 45) {
        typeToSpawn = 'BufferOverflow';
    } else { 
        typeToSpawn = 'Standard';
        // Increase group size as player level increases
        spawnCount = 1 + Math.floor(playerLevel / 10);
    }
    // Mutated Standard: chance increases with player level
    let mutatedStandard = false;
    let mutatedChance = Math.min(0.1 + playerLevel * 0.01, 0.5); // up to 50%
    if (typeToSpawn === 'Standard' && Math.random() < mutatedChance) {
        mutatedStandard = true;
    }
    for (let i = 0; i < spawnCount; i++) {
        let finalX = spawnX + (Math.random() - 0.5) * 30 * (spawnCount > 1 ? 1 : 0);
        let finalY = spawnY + (Math.random() - 0.5) * 30 * (spawnCount > 1 ? 1 : 0);
        if (typeToSpawn === 'ScopeCreepBlob') {
            enemies.push(new Enemy(finalX, finalY, 'ScopeCreepBlob', 'large'));
        } else if (typeToSpawn === 'BufferOverflow') {
            enemies.push(new Enemy(finalX, finalY, 'BufferOverflow'));
        } else if (typeToSpawn === 'Tank' && tankCount < 10) {
            enemies.push(new Enemy(finalX, finalY, 'Tank'));
        } else if (typeToSpawn === 'Standard') {
            // Each Standard has its own chance to mutate
            if (Math.random() < mutatedChance) {
                const enemy = new Enemy(finalX, finalY, 'Standard');
                enemy.size *= 1.2 + Math.random() * 0.5;
                enemy.radius = enemy.size / 2;
                enemy.baseHealth *= 1.5 + Math.random();
                enemy.health = enemy.baseHealth;
                enemy.maxHealth = enemy.baseHealth;
                enemy.speed *= 1.2 + Math.random() * 0.5;
                enemy.color = '#39ff14'; // neon green for visibility
                enemy.xpMultiplier *= 2;
                enemy.isMutated = true;
                enemy.damage *= 1.5; // Increase damage for mutated Standard
                enemies.push(enemy);
            } else {
                enemies.push(new Enemy(finalX, finalY, 'Standard'));
            }
        } else {
            enemies.push(new Enemy(finalX, finalY, typeToSpawn));
        }
    }
}

// Helper to darken a color (supports hex and some named colors)
function darkenColor(color, amount = 0.5) {
    // If hex, darken by amount
    if (color[0] === '#') {
        let num = parseInt(color.slice(1), 16);
        let r = Math.floor(((num >> 16) & 0xFF) * amount);
        let g = Math.floor(((num >> 8) & 0xFF) * amount);
        let b = Math.floor((num & 0xFF) * amount);
        return `rgb(${r},${g},${b})`;
    }
    // Named colors fallback
    const named = {
        tomato: '#b22222', // dark red
        '#FFA500': '#b36b00', // dark orange
        '#8A2BE2': '#4b166b', // dark purple
        '#6a5acd': '#3a2a6a', // dark purple
        '#32cd32': '#1e7a1e', // dark green
        '#ffd700': '#b39b00', // dark gold
        '#ff4500': '#b33100', // dark orange-red
        '#ff6347': '#b23c1a', // dark tomato
        '#39ff14': '#267a0d', // dark neon green
        '#fff': '#888', // fallback for white
    };
    return named[color] || '#222';
}

// Helper to convert named colors to hex
function nameToHex(name) {
    const map = {
        tomato: '#ff6347',
        orange: '#ffa500',
        gold: '#ffd700',
        purple: '#8a2be2',
        green: '#32cd32',
        white: '#fff',
        'neon green': '#39ff14',
        '#FFA500': '#ffa500',
        '#8A2BE2': '#8a2be2',
        '#6a5acd': '#6a5acd',
        '#32cd32': '#32cd32',
        '#ffd700': '#ffd700',
        '#ff4500': '#ff4500',
        '#ff6347': '#ff6347',
        '#39ff14': '#39ff14',
        '#fff': '#fff',
    };
    return map[name] || name;
}
// Helper to determine if a color is light or dark (returns true if light)
function isColorLight(color) {
    // Always convert named colors to hex if possible
    color = nameToHex(color);
    if (color[0] === '#') {
        let num = parseInt(color.slice(1), 16);
        let r = (num >> 16) & 0xFF;
        let g = (num >> 8) & 0xFF;
        let b = num & 0xFF;
        // Perceived brightness formula (lower threshold for more black text)
        return (r * 0.299 + g * 0.587 + b * 0.114) > 150;
    }
    // Fallback: default to dark
    return false;
}

export { Enemy, XPOrb, spawnEnemy, Particle, Shockwave }; 