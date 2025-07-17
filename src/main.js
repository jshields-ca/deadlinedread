// Deadline Dread - Game Prototype V1.7.0
// Modularized version

import Player from './player.js';
import { Enemy, XPOrb, spawnEnemy } from './enemy.js';
import { Weapon, HomingWeapon, OrbitingWeapon, PulseWeapon, CodeSprayWeapon, Projectile } from './weapons.js';
import { defineBaseUpgrades, baseAvailableUpgrades } from './upgrades.js';
import * as config from './config.js';

// --- Module-level DOM variables ---
let canvas, ctx, startScreen, gameOverScreen, levelUpScreen, upgradeOptionsContainer, startButton, restartButton, playerHealthDisplay, gameTimerDisplay, timeSurvivedDisplay, playerLevelDisplay, levelReachedDisplay, xpBarElement;

// --- Game State ---
let player;
let enemies = [];
let projectiles = [];
let xpOrbs = [];
let keys = {};
let lastEnemySpawnTime = 0;
let animationFrameId;
let currentGameState = 'start';
let gameStartTime;
let elapsedGameTime = 0;
let timeAccumulator = 0;

// --- Utility ---
function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
function updateTimerDisplay(timeInSeconds) {
    gameTimerDisplay.textContent = formatTime(timeInSeconds);
}

// --- Game Logic ---
function initializeGame() {
    resizeCanvas();
    defineBaseUpgrades();
    player = new Player(canvas.width / 2, canvas.height / 2, config.PLAYER_SIZE, 'cyan', config.INITIAL_PLAYER_HEALTH);
    enemies = [];
    projectiles = [];
    xpOrbs = [];
    keys = {};
    lastEnemySpawnTime = 0;
    gameStartTime = performance.now();
    elapsedGameTime = 0;
    timeAccumulator = 0;
    playerHealthDisplay.textContent = `${config.INITIAL_PLAYER_HEALTH} / ${config.INITIAL_PLAYER_HEALTH}`;
    updateTimerDisplay(0);
    playerLevelDisplay.textContent = player.level;
    // --- Reset XP bar visually on game restart ---
    if (xpBarElement) xpBarElement.style.width = '0%';
    player.updateXpBar = function() {
        if (xpBarElement) {
            xpBarElement.style.width = `${Math.min(100, 100 * (player.xp / player.xpToNextLevel))}%`;
        }
    };
    // Weapon/projectile/XP orb helpers
    player.spawnProjectile = function(x, y, radius, color, angle, damage, speed, range) {
        const proj = new Projectile(x, y, radius, color, angle, damage, speed);
        if (range) proj.maxRange = range;
        projectiles.push(proj);
    };
    player.spawnXPOrb = function(x, y, radius, color, value) {
        xpOrbs.push(new XPOrb(x, y, radius, color, value));
    };
    player.addWeapon(HomingWeapon);
    player.weaponStats['homing'] = { level: 1, projectileCount: 1, damageMultiplier: 1, attackSpeedMultiplier: 1, projectileSpeedMultiplier: 1 };
    player.levelUpCallback = () => setGameState('levelup');
    // --- Add: update level display on level up ---
    player.onLevelUp = function() {
        playerLevelDisplay.textContent = player.level;
    };
}

function handleCollisions() {
    if (!player) return;
    // Homing Projectile vs Enemy
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const p = projectiles[i];
        if (!p) { projectiles.splice(i,1); continue;}
        for (let j = enemies.length - 1; j >= 0; j--) {
            const e = enemies[j];
            if (!e) { enemies.splice(j,1); continue;}
            if (Math.hypot(p.x - e.x, p.y - e.y) < p.radius + e.radius) {
                projectiles.splice(i, 1);
                if (e.takeDamage(p.damage)) {
                    xpOrbs.push(new XPOrb(e.x, e.y, config.XP_ORB_SIZE, '#76c7c0', config.XP_ORB_BASE_VALUE * e.xpMultiplier));
                    enemies.splice(j, 1);
                }
                break;
            }
        }
    }
    // Player vs Enemy
    for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (!e) { enemies.splice(i,1); continue;}
        if (Math.hypot(player.x - e.x, player.y - e.y) < player.radius + e.radius) {
            player.takeDamage(config.ENEMY_DAMAGE_TO_PLAYER, setGameState);
            // Do NOT remove the enemy here
        }
    }
    // Player vs XP Orb
    const currentPickupRadius = (player.radius + config.XP_ORB_SIZE + 15) * player.pickupRadiusMultiplier;
    for (let i = xpOrbs.length - 1; i >= 0; i--) {
        const orb = xpOrbs[i];
        if (!orb) { xpOrbs.splice(i,1); continue;}
        if (Math.hypot(player.x - orb.x, player.y - orb.y) < currentPickupRadius) {
            player.gainXP(orb.value);
            xpOrbs.splice(i, 1);
        }
    }
}

function updateHUD(currentTime) {
    if (currentGameState === 'playing' && player) {
        const currentSegmentTime = currentTime - gameStartTime;
        const totalMillisecondsPlayed = currentSegmentTime + timeAccumulator;
        elapsedGameTime = Math.floor(totalMillisecondsPlayed / 1000);
        updateTimerDisplay(elapsedGameTime);
    }
}

function displayLevelUpOptions() {
    upgradeOptionsContainer.innerHTML = '';
    let choices = [];
    if (!baseAvailableUpgrades || baseAvailableUpgrades.length === 0) {
        console.error("baseAvailableUpgrades is not defined or empty! Resuming game.");
        setGameState('playing');
        return;
    }
    // --- Fix: Weapon upgrades filter logic ---
    let possibleUpgrades = baseAvailableUpgrades.filter(upgrade => {
        if (!player || !player.weaponStats) return false;
        // For weapon upgrades, use the correct key (e.g., 'codespray', 'homing', etc.)
        let weaponKey = null;
        if (upgrade.requiresWeapon) {
            if (upgrade.requiresWeapon.name === 'HomingWeapon') weaponKey = 'homing';
            else if (upgrade.requiresWeapon.name === 'OrbitingWeapon') weaponKey = 'orbiting';
            else if (upgrade.requiresWeapon.name === 'PulseWeapon') weaponKey = 'pulse';
            else if (upgrade.requiresWeapon.name === 'CodeSprayWeapon') weaponKey = 'codespray';
            else weaponKey = upgrade.requiresWeapon.name.toLowerCase();
        }
        const weaponStats = weaponKey ? player.weaponStats[weaponKey] : null;
        if (upgrade.unique) {
            if (!upgrade.weaponClass) {
                console.warn(`Upgrade ${upgrade.id} is unique but has no weaponClass defined.`);
                return false;
            }
            const weaponExists = player.activeWeapons.some(w => w instanceof upgrade.weaponClass);
            if (weaponExists) return false;
        }
        if (upgrade.requiresWeapon && !weaponStats) {
            return false;
        }
        if (typeof upgrade.isMaxed === 'function' && upgrade.isMaxed(player)) {
            return false;
        }
        return true;
    });
    possibleUpgrades.sort(() => 0.5 - Math.random());
    // Pick up to 3 unique upgrades by id
    const seenIds = new Set();
    choices = [];
    for (const upgrade of possibleUpgrades) {
        if (!seenIds.has(upgrade.id)) {
            choices.push(upgrade);
            seenIds.add(upgrade.id);
        }
        if (choices.length >= 3) break;
    }
    if (choices.length === 0) {
        console.warn("No specific upgrades available after filtering. Offering fallback.");
        let fallbackUpgrade = baseAvailableUpgrades.find(u => u.id === 'hp_up');
        if (fallbackUpgrade) { choices.push(fallbackUpgrade); }
        else { console.error("CRITICAL: Fallback 'hp_up' upgrade not found! Resuming game."); setGameState('playing'); return; }
    }
    choices.forEach(upgrade => {
        if (!upgrade || typeof upgrade.name !== 'string' || typeof upgrade.description !== 'string' || typeof upgrade.apply !== 'function') {
            return;
        }
        const button = document.createElement('button');
        button.textContent = `${upgrade.name}: ${upgrade.description}`;
        button.onclick = () => {
            if (player) upgrade.apply(player);
            if (player) player.updateXpBar();
            if (player) playerHealthDisplay.textContent = `${Math.max(0, Math.ceil(player.health))} / ${Math.ceil(player.maxHealth)}`;
            // --- Add: update level display after upgrade ---
            if (player && player.onLevelUp) player.onLevelUp();
            setGameState('playing');
        };
        upgradeOptionsContainer.appendChild(button);
    });
    if (upgradeOptionsContainer.childElementCount === 0 && choices.some(c => c)) {
        console.error("No valid upgrade buttons could be created even though choices existed. Resuming game.");
        setGameState('playing');
    } else if (upgradeOptionsContainer.childElementCount === 0) {
        console.warn("No upgrade buttons created (possibly no valid choices). Resuming game.");
        setGameState('playing');
    }
}

function setGameState(newState) {
    const oldState = currentGameState;
    currentGameState = newState;
    const now = performance.now();
    if (newState === 'start') {
        startScreen.style.display = 'flex';
        gameOverScreen.style.display = 'none';
        levelUpScreen.style.display = 'none';
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else if (newState === 'playing') {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        levelUpScreen.style.display = 'none';
        // --- Fix: Accumulate time instead of resetting on level up ---
        if (oldState === 'levelup') {
            // Add the time spent in the last segment to the accumulator
            timeAccumulator += performance.now() - gameStartTime;
        }
        gameStartTime = now;
        animationFrameId = requestAnimationFrame(gameLoop);
    } else if (newState === 'over') {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'flex';
        levelUpScreen.style.display = 'none';
        timeSurvivedDisplay.textContent = formatTime(elapsedGameTime);
        levelReachedDisplay.textContent = player.level;
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
    } else if (newState === 'levelup') {
        startScreen.style.display = 'none';
        gameOverScreen.style.display = 'none';
        levelUpScreen.style.display = 'flex';
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        displayLevelUpOptions();
    }
}

function startGame() {
    initializeGame();
    setGameState('playing');
}

function gameLoop(currentTime) {
    if (currentGameState !== 'playing') return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!lastEnemySpawnTime || currentTime - lastEnemySpawnTime > config.ENEMY_SPAWN_INTERVAL) {
        spawnEnemy(enemies, elapsedGameTime, canvas, player);
        lastEnemySpawnTime = currentTime;
    }
    xpOrbs.forEach(orb => orb.draw(ctx));
    projectiles.forEach((p, i) => {
        // --- Ensure homing projectiles always have current enemies array ---
        if (p.homing) p.enemies = enemies;
        p.update();
        p.draw(ctx);
    });
    // Remove projectiles marked for removal (e.g., exceeded maxRange)
    for (let i = projectiles.length - 1; i >= 0; i--) {
        if (projectiles[i].toRemove) {
            projectiles.splice(i, 1);
        }
    }
    if (player) {
        player.update(currentTime, keys, enemies, playerHealthDisplay);
        player.draw(ctx);
        player.activeWeapons.forEach(w => w.draw(ctx));
    }
    enemies.forEach(enemy => { if (player) enemy.update(player); enemy.draw(ctx); });
    handleCollisions();
    updateHUD(currentTime);
    animationFrameId = requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 900);
    canvas.height = Math.min(window.innerHeight * 0.8, 700);
}

document.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    startScreen = document.getElementById('startScreen');
    gameOverScreen = document.getElementById('gameOverScreen');
    levelUpScreen = document.getElementById('levelUpScreen');
    upgradeOptionsContainer = document.getElementById('upgradeOptionsContainer');
    startButton = document.getElementById('startButton');
    restartButton = document.getElementById('restartButton');
    playerHealthDisplay = document.getElementById('playerHealth');
    gameTimerDisplay = document.getElementById('gameTimer');
    timeSurvivedDisplay = document.getElementById('timeSurvived');
    playerLevelDisplay = document.getElementById('playerLevel');
    levelReachedDisplay = document.getElementById('levelReachedDisplay');
    xpBarElement = document.getElementById('xpBar');
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', startGame);
    window.addEventListener('resize', () => { resizeCanvas(); });
    // Add key event listeners for movement
    window.addEventListener('keydown', (e) => { keys[e.key] = true; });
    window.addEventListener('keyup', (e) => { keys[e.key] = false; });
    resizeCanvas();
    defineBaseUpgrades();
    setGameState('start');
});