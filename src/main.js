// Deadline Dread - Game Prototype V1.6.2
// All game logic from the original HTML <script> is now here.

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const startScreen = document.getElementById('startScreen');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const levelUpScreen = document.getElementById('levelUpScreen');
  const upgradeOptionsContainer = document.getElementById('upgradeOptionsContainer');
  const startButton = document.getElementById('startButton');
  const restartButton = document.getElementById('restartButton');
  const playerHealthDisplay = document.getElementById('playerHealth');
  const gameTimerDisplay = document.getElementById('gameTimer');
  const timeSurvivedDisplay = document.getElementById('timeSurvived');
  const playerLevelDisplay = document.getElementById('playerLevel');
  const levelReachedDisplay = document.getElementById('levelReachedDisplay');
  const xpBarElement = document.getElementById('xpBar');

  // --- Game Settings ---
  const PLAYER_BASE_SPEED = 3;
  const ENEMY_BASE_SPEED_DEFAULT = 1; // Default if ENEMY_BASE_SPEED is undefined
  const ENEMY_SPAWN_INTERVAL = 1000; 
  const INITIAL_PLAYER_HEALTH = 100;
  const PLAYER_SIZE = 20;
  const ENEMY_BASE_SIZE_DEFAULT = 18; // Default if ENEMY_BASE_SIZE is undefined
  const XP_ORB_SIZE = 5;
  const XP_ORB_BASE_VALUE = 20;
  const XP_PER_LEVEL_BASE = 100;
  const ENEMY_DAMAGE_TO_PLAYER = 10;
  const BASE_ENEMY_HEALTH_DEFAULT = 20; // Default if BASE_ENEMY_HEALTH is undefined

  // Homing Weapon Settings
  const PROJECTILE_BASE_SIZE = 5; 
  const PROJECTILE_BASE_SPEED = 7;
  const PROJECTILE_BASE_DAMAGE = 10;
  const HOMING_BASE_COOLDOWN = 500;
  const MAX_HOMING_PROJECTILES = 8;
  const HOMING_PROJECTILE_SPREAD_ANGLE = Math.PI / 18; 

  // Shield Weapon Settings
  const SHIELD_BASE_ORB_COUNT = 1;
  const SHIELD_BASE_ORBIT_RADIUS = 50;
  const SHIELD_BASE_ORBIT_SPEED = 0.05; 
  const SHIELD_BASE_DAMAGE = 15;
  const SHIELD_ORB_SIZE = 8;
  const SHIELD_HIT_COOLDOWN = 500; 
  const MAX_SHIELD_ORBS = 6;

  // Pulse Weapon Settings
  const PULSE_BASE_MAX_RADIUS = 75;
  const PULSE_BASE_DAMAGE = 25;
  const PULSE_BASE_COOLDOWN = 3000; 
  const PULSE_DURATION = 300; 

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
  let baseAvailableUpgrades = []; 

  // --- Utility ---
  function formatTime(totalSeconds) { 
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  function updateTimerDisplay(timeInSeconds) { 
       gameTimerDisplay.textContent = formatTime(timeInSeconds);
  }

  // --- Base Weapon Class ---
  class Weapon {
      constructor(player, weaponKey) { 
          this.player = player;
          this.weaponKey = weaponKey; 
          this.lastAttackTime = 0;
      }
      update(currentTime, enemies) {} 
      draw(ctx) {} 
  }

  // --- Homing Weapon ---
  class HomingWeapon extends Weapon {
      constructor(player) {
          super(player, 'HomingWeaponStats');
      }

      update(currentTime, enemies) { 
          const stats = this.player.weaponStats[this.weaponKey];
           if (!stats) { console.error("HomingWeaponStats not found for player!"); return; } 
          const currentCooldown = (typeof HOMING_BASE_COOLDOWN !== 'undefined' ? HOMING_BASE_COOLDOWN : 500) * stats.attackSpeedMultiplier;
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
              const projDamage = (typeof PROJECTILE_BASE_DAMAGE !== 'undefined' ? PROJECTILE_BASE_DAMAGE : 10) * this.player.globalDamageMultiplier * stats.damageMultiplier;
              const projSpeed = (typeof PROJECTILE_BASE_SPEED !== 'undefined' ? PROJECTILE_BASE_SPEED : 7) * stats.projectileSpeedMultiplier;
              
              const numProjectiles = stats.projectileCount;
              const angleStep = numProjectiles > 1 ? (typeof HOMING_PROJECTILE_SPREAD_ANGLE !== 'undefined' ? HOMING_PROJECTILE_SPREAD_ANGLE : Math.PI/18) : 0;
              const startAngle = baseAngle - (angleStep * (numProjectiles - 1)) / 2;

              for (let i = 0; i < numProjectiles; i++) {
                  const angle = startAngle + i * angleStep;
                  projectiles.push(new Projectile(this.player.x, this.player.y, (typeof PROJECTILE_BASE_SIZE !== 'undefined' ? PROJECTILE_BASE_SIZE : 5) , 'yellow', angle, projDamage, projSpeed));
              }
          }
      }
  }

  // --- Orbiting Weapon ---
  class OrbitingWeapon extends Weapon {
      constructor(player) {
          super(player, 'OrbitingWeaponStats');
          this.angle = 0;
          this.orbs = []; 
          this.lastHitTimes = new Map(); 
      }

      update(currentTime, enemies) {
          const stats = this.player.weaponStats[this.weaponKey];
          if (!stats) { console.error("OrbitingWeaponStats not found for player!"); return; }
          this.angle += (typeof SHIELD_BASE_ORBIT_SPEED !== 'undefined' ? SHIELD_BASE_ORBIT_SPEED : 0.05) * stats.orbitSpeedMultiplier; 
          this.orbs = [];
          if (stats.orbCount === 0) return; 

          const angleIncrement = (Math.PI * 2) / stats.orbCount;
          for (let i = 0; i < stats.orbCount; i++) {
              const currentAngle = this.angle + i * angleIncrement;
              this.orbs.push({
                  x: this.player.x + Math.cos(currentAngle) * ((typeof SHIELD_BASE_ORBIT_RADIUS !== 'undefined' ? SHIELD_BASE_ORBIT_RADIUS : 50) * stats.orbitRadiusMultiplier),
                  y: this.player.y + Math.sin(currentAngle) * ((typeof SHIELD_BASE_ORBIT_RADIUS !== 'undefined' ? SHIELD_BASE_ORBIT_RADIUS : 50) * stats.orbitRadiusMultiplier)
              });
          }
          
          const currentDamage = (typeof SHIELD_BASE_DAMAGE !== 'undefined' ? SHIELD_BASE_DAMAGE : 15) * this.player.globalDamageMultiplier * stats.damageMultiplier;
          this.orbs.forEach(orb => {
              for (let i = enemies.length - 1; i >= 0; i--) {
                  const enemy = enemies[i];
                  const distance = Math.hypot(orb.x - enemy.x, orb.y - enemy.y);
                  if (distance < (typeof SHIELD_ORB_SIZE !== 'undefined' ? SHIELD_ORB_SIZE : 8) + enemy.radius) {
                      const lastHit = this.lastHitTimes.get(enemy);
                      if (!lastHit || currentTime - lastHit > (typeof SHIELD_HIT_COOLDOWN !== 'undefined' ? SHIELD_HIT_COOLDOWN : 500)) {
                          this.lastHitTimes.set(enemy, currentTime);
                          if (enemy.takeDamage(currentDamage)) {
                              xpOrbs.push(new XPOrb(enemy.x, enemy.y, XP_ORB_SIZE, '#76c7c0', XP_ORB_BASE_VALUE * enemy.xpMultiplier));
                              enemies.splice(i, 1);
                          }
                      }
                  }
              }
          });

          this.lastHitTimes.forEach((time, enemy) => {
              if (currentTime - time > (typeof SHIELD_HIT_COOLDOWN !== 'undefined' ? SHIELD_HIT_COOLDOWN : 500) + 100) { 
                  const enemyExists = enemies.includes(enemy); 
                  if (!enemyExists) this.lastHitTimes.delete(enemy);
              }
          });
      }

      draw(ctx) {
          const stats = this.player.weaponStats[this.weaponKey];
          if (!stats || stats.orbCount === 0) return;
          ctx.fillStyle = 'lightblue';
          this.orbs.forEach(orb => {
              ctx.beginPath();
              ctx.arc(orb.x, orb.y, (typeof SHIELD_ORB_SIZE !== 'undefined' ? SHIELD_ORB_SIZE : 8), 0, Math.PI * 2);
              ctx.fill();
              ctx.closePath();
          });
      }
  }

  // --- Pulse Weapon ---
  class PulseWeapon extends Weapon {
      constructor(player) {
          super(player, 'PulseWeaponStats');
          this.isPulsing = false;
          this.pulseStartTime = 0;
          this.currentPulseVisualRadius = 0; 
          this.enemiesHitThisPulse = new Set();
      }

      update(currentTime, enemies) {
          const stats = this.player.weaponStats[this.weaponKey];
          if (!stats) { console.error("PulseWeaponStats not found for player!"); return; }
          const currentCooldown = (typeof PULSE_BASE_COOLDOWN !== 'undefined' ? PULSE_BASE_COOLDOWN : 3000) * stats.cooldownMultiplier;
          const currentMaxRadius = (typeof PULSE_BASE_MAX_RADIUS !== 'undefined' ? PULSE_BASE_MAX_RADIUS : 75) * stats.radiusMultiplier;

          if (this.isPulsing) {
              const pulseProgress = (currentTime - this.pulseStartTime) / (typeof PULSE_DURATION !== 'undefined' ? PULSE_DURATION : 300);
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
          const currentDamage = (typeof PULSE_BASE_DAMAGE !== 'undefined' ? PULSE_BASE_DAMAGE : 25) * this.player.globalDamageMultiplier * stats.damageMultiplier;

          for (let i = enemies.length - 1; i >= 0; i--) {
              const enemy = enemies[i];
              if (!this.enemiesHitThisPulse.has(enemy)) {
                  const distance = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);
                  if (distance <= effectiveRadius) { 
                      this.enemiesHitThisPulse.add(enemy);
                      if (enemy.takeDamage(currentDamage)) {
                          xpOrbs.push(new XPOrb(enemy.x, enemy.y, XP_ORB_SIZE, '#76c7c0', XP_ORB_BASE_VALUE * enemy.xpMultiplier));
                          enemies.splice(i, 1);
                      }
                  }
              }
          }
      }

      draw(ctx) {
          if (this.isPulsing) {
              const pulseProgress = (performance.now() - this.pulseStartTime) / (typeof PULSE_DURATION !== 'undefined' ? PULSE_DURATION : 300);
              const alpha = Math.max(0, 1 - (pulseProgress * pulseProgress)); 
              
              ctx.beginPath();
              ctx.arc(this.player.x, this.player.y, this.currentPulseVisualRadius, 0, Math.PI * 2);
              ctx.strokeStyle = `rgba(100, 255, 255, ${alpha})`; 
              ctx.lineWidth = 4; 
              ctx.stroke();
              ctx.closePath();
              ctx.lineWidth = 1; 
          }
      }
  }

  // --- Projectile Class ---
  class Projectile { 
      constructor(x, y, radius, color, angle, damage, speed) {
          this.x = x; this.y = y; this.radius = radius; this.color = color;
          this.damage = damage;
          this.velocityX = Math.cos(angle) * speed;
          this.velocityY = Math.sin(angle) * speed;
      }
      draw() { 
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.closePath();
      }
      update() { 
          this.x += this.velocityX;
          this.y += this.velocityY;
      }
  }

  // --- Player Class ---
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
          this.addWeapon(HomingWeapon); 
      }

      draw() { 
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
      update(currentTime) { 
           let moveX = 0; let moveY = 0;
          if (keys['w'] || keys['W'] || keys['ArrowUp']) moveY -= 1;
          if (keys['s'] || keys['S'] || keys['ArrowDown']) moveY += 1;
          if (keys['a'] || keys['A'] || keys['ArrowLeft']) moveX -= 1;
          if (keys['d'] || keys['D'] || keys['ArrowRight']) moveX += 1;

          const currentSpeed = (typeof PLAYER_BASE_SPEED !== 'undefined' ? PLAYER_BASE_SPEED : 3) * this.speedMultiplier;
          if (moveX !== 0 && moveY !== 0) {
              const magnitude = Math.hypot(moveX, moveY);
              this.x += (moveX / magnitude) * currentSpeed;
              this.y += (moveY / magnitude) * currentSpeed;
          } else {
              this.x += moveX * currentSpeed;
              this.y += moveY * currentSpeed;
          }

          this.x = Math.max(this.radius, Math.min(canvas.width - this.radius, this.x));
          this.y = Math.max(this.radius, Math.min(canvas.height - this.radius, this.y));
          
          this.activeWeapons.forEach(weapon => weapon.update(currentTime, enemies));
          playerHealthDisplay.textContent = Math.max(0, Math.ceil(this.health));
      }
      takeDamage(amount) { 
           this.health -= amount;
          if (this.health <= 0) {
              this.health = 0;
              setGameState('over');
          }
      }
      gainXP(amount) { 
          this.xp += amount * this.xpGainMultiplier;
          if (this.xp >= this.xpToNextLevel) {
              this.levelUp();
          }
          this.updateXpBar();
      }
      levelUp() { 
          this.level++;
          this.xp -= this.xpToNextLevel; 
          while (this.xp < 0) this.xp = 0; 
          this.xpToNextLevel = Math.floor((typeof XP_PER_LEVEL_BASE !== 'undefined' ? XP_PER_LEVEL_BASE : 100) * Math.pow(1.25, this.level - 1)); 
          playerLevelDisplay.textContent = this.level;
          setGameState('leveling_up'); 
      }
      updateXpBar() { 
           const xpPercentage = Math.max(0, Math.min(100, (this.xp / this.xpToNextLevel) * 100)); 
          xpBarElement.style.width = `${xpPercentage}%`;
      }

      addWeapon(WeaponConstructor) { 
          const weaponKey = WeaponConstructor.name + "Stats"; 
          
          if (!this.weaponStats[weaponKey]) { 
              this.activeWeapons.push(new WeaponConstructor(this));
              if (WeaponConstructor === HomingWeapon) {
                  this.weaponStats[weaponKey] = { level: 1, projectileCount: 1, damageMultiplier: 1, attackSpeedMultiplier: 1, projectileSpeedMultiplier: 1 };
              } else if (WeaponConstructor === OrbitingWeapon) {
                  this.weaponStats[weaponKey] = { level: 1, orbCount: (typeof SHIELD_BASE_ORB_COUNT !== 'undefined' ? SHIELD_BASE_ORB_COUNT : 1), damageMultiplier: 1, orbitRadiusMultiplier: 1, orbitSpeedMultiplier: 1 };
              } else if (WeaponConstructor === PulseWeapon) {
                  this.weaponStats[weaponKey] = { level: 1, damageMultiplier: 1, radiusMultiplier: 1, cooldownMultiplier: 1 };
              }
              console.log(`${WeaponConstructor.name} added with stats:`, this.weaponStats[weaponKey]);
          } else {
              // This case should ideally not be hit if "unique: true" for "get_weapon" upgrades works.
              this.weaponStats[weaponKey].level = (this.weaponStats[weaponKey].level || 0) + 1;
              console.warn(`${WeaponConstructor.name} already exists, level incremented via addWeapon. This might indicate an issue with 'unique' upgrade logic. Level: ${this.weaponStats[weaponKey].level}`);
          }
      }
  }

  // --- Enemy Class (Modified with defensive checks) ---
  class Enemy { 
       constructor(x, y, type = 'Standard') {
          this.x = x; this.y = y; this.type = type;
          this.xpMultiplier = 1; 

          const currentEnemyBaseSize = (typeof ENEMY_BASE_SIZE !== 'undefined' ? ENEMY_BASE_SIZE : ENEMY_BASE_SIZE_DEFAULT);
          const currentBaseEnemyHealth = (typeof BASE_ENEMY_HEALTH !== 'undefined' ? BASE_ENEMY_HEALTH : BASE_ENEMY_HEALTH_DEFAULT);
          const currentEnemyBaseSpeed = (typeof ENEMY_BASE_SPEED !== 'undefined' ? ENEMY_BASE_SPEED : ENEMY_BASE_SPEED_DEFAULT);

          switch (type) {
              case 'Creep':
                  this.size = currentEnemyBaseSize * 0.75;
                  this.color = '#FFA500'; 
                  this.baseHealth = currentBaseEnemyHealth * 0.6;
                  this.speed = currentEnemyBaseSpeed * 1.6; 
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
                  this.speed = currentEnemyBaseSpeed;
                  this.xpMultiplier = 1;
                  break;
          }
          this.radius = this.size / 2;
          
          const playerLevelFactor = (player && typeof player.level === 'number') ? player.level * 0.1 : 0;
          const timeFactor = (typeof elapsedGameTime === 'number') ? elapsedGameTime * 0.01 : 0;

          this.health = this.baseHealth * (1 + playerLevelFactor + timeFactor);
          if (isNaN(this.health) || this.health <=0) { 
              this.health = currentBaseEnemyHealth; // Fallback
          }
          this.maxHealth = this.health;
      }

      draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.closePath();

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
      }

      takeDamage(amount) {
          this.health -= amount;
          return this.health <= 0;
      }
  }
  class XPOrb { 
      constructor(x, y, radius, color, value) { 
          this.x = x; this.y = y; this.radius = radius; this.color = color; this.value = value;
      }
      draw() { 
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
          ctx.closePath();
      }
  }

  // --- Event Listeners ---
  window.addEventListener('keydown', (e) => { keys[e.key] = true; });
  window.addEventListener('keyup', (e) => { keys[e.key] = false; });
  startButton.addEventListener('click', startGame);
  restartButton.addEventListener('click', startGame);
  window.addEventListener('resize', () => { resizeCanvas(); /* Potentially redraw or adjust player pos */ });

  // --- Upgrades Definition ---
  function defineBaseUpgrades() { 
       baseAvailableUpgrades = [ 
          { id: 'hp_up', name: 'Robust Health', description: '+20 Max Health, Heal 20', apply: (p) => { p.maxHealth += 20; p.health = Math.min(p.maxHealth, p.health + 20); } },
          { id: 'speed_up', name: 'Agile Agility', description: '+10% Movement Speed', apply: (p) => { p.speedMultiplier *= 1.1; } },
          { id: 'global_damage_up', name: 'Refactor Ray', description: '+15% Global Damage', apply: (p) => { p.globalDamageMultiplier *= 1.15; } },
          { id: 'xp_gain_up', name: 'Fast Learner', description: '+10% XP Gain', apply: (p) => { p.xpGainMultiplier *= 1.1; } },
          { id: 'pickup_radius_up', name: 'Wider Net', description: '+20% XP Orb Pickup Radius', apply: (p) => { p.pickupRadiusMultiplier *= 1.2; } },
          
          { id: 'get_shield', name: 'CSS Flexbox Shield', description: 'Gain orbiting shields', apply: (p) => { p.addWeapon(OrbitingWeapon); }, unique: true, weaponClass: OrbitingWeapon }, 
          { id: 'get_pulse', name: 'Automated Linter', description: 'Gain an AoE pulse weapon', apply: (p) => { p.addWeapon(PulseWeapon); }, unique: true, weaponClass: PulseWeapon },

          { id: 'homing_add_projectile', name: '+1 Homing Bolt', description: `Fire an additional homing bolt (Max ${typeof MAX_HOMING_PROJECTILES !== 'undefined' ? MAX_HOMING_PROJECTILES : 8})`, 
            requiresWeapon: HomingWeapon, 
            isMaxed: (p) => p.weaponStats.HomingWeaponStats && p.weaponStats.HomingWeaponStats.projectileCount >= (typeof MAX_HOMING_PROJECTILES !== 'undefined' ? MAX_HOMING_PROJECTILES : 8),
            apply: (p) => { if(p.weaponStats.HomingWeaponStats) p.weaponStats.HomingWeaponStats.projectileCount++; } },
          { id: 'homing_damage_up', name: 'Sharper Bolts', description: '+10% Homing Damage', requiresWeapon: HomingWeapon, apply: (p) => { if(p.weaponStats.HomingWeaponStats) p.weaponStats.HomingWeaponStats.damageMultiplier *= 1.1; } },
          { id: 'homing_attack_speed_up', name: 'Faster Homing Fire', description: '-10% Homing Cooldown', requiresWeapon: HomingWeapon, apply: (p) => { if(p.weaponStats.HomingWeaponStats) p.weaponStats.HomingWeaponStats.attackSpeedMultiplier *= 0.9; } },
          { id: 'homing_projectile_speed_up', name: 'Swifter Bolts', description: '+10% Homing Bolt Speed', requiresWeapon: HomingWeapon, apply: (p) => { if(p.weaponStats.HomingWeaponStats) p.weaponStats.HomingWeaponStats.projectileSpeedMultiplier *= 1.1; } },

          { id: 'shield_add_orb', name: 'Add Flex Item', description: `+1 Shield Orb (Max ${typeof MAX_SHIELD_ORBS !== 'undefined' ? MAX_SHIELD_ORBS : 6})`, 
            requiresWeapon: OrbitingWeapon, 
            isMaxed: (p) => p.weaponStats.OrbitingWeaponStats && p.weaponStats.OrbitingWeaponStats.orbCount >= (typeof MAX_SHIELD_ORBS !== 'undefined' ? MAX_SHIELD_ORBS : 6),
            apply: (p) => { if(p.weaponStats.OrbitingWeaponStats) p.weaponStats.OrbitingWeaponStats.orbCount++; } },
          { id: 'shield_damage_up', name: 'Hardened Shields', description: '+20% Shield Damage', requiresWeapon: OrbitingWeapon, apply: (p) => { if(p.weaponStats.OrbitingWeaponStats) p.weaponStats.OrbitingWeaponStats.damageMultiplier *= 1.2; } },
          { id: 'shield_orbit_radius_up', name: 'Wider Perimeter', description: '+10% Shield Orbit Radius', requiresWeapon: OrbitingWeapon, apply: (p) => { if(p.weaponStats.OrbitingWeaponStats) p.weaponStats.OrbitingWeaponStats.orbitRadiusMultiplier *= 1.1; } },
          { id: 'shield_orbit_speed_up', name: 'Faster Rotation', description: '+15% Shield Orbit Speed', requiresWeapon: OrbitingWeapon, apply: (p) => { if(p.weaponStats.OrbitingWeaponStats) p.weaponStats.OrbitingWeaponStats.orbitSpeedMultiplier *= 1.15; } },

          { id: 'pulse_damage_up', name: 'Stronger Linter', description: '+20% Pulse Damage', requiresWeapon: PulseWeapon, apply: (p) => { if(p.weaponStats.PulseWeaponStats) p.weaponStats.PulseWeaponStats.damageMultiplier *= 1.20; } },
          { id: 'pulse_radius_up', name: 'Wider Linting Scope', description: '+15% Pulse Radius', requiresWeapon: PulseWeapon, apply: (p) => { if(p.weaponStats.PulseWeaponStats) p.weaponStats.PulseWeaponStats.radiusMultiplier *= 1.15; } },
          { id: 'pulse_cooldown_down', name: 'Faster Linting', description: '-10% Pulse Cooldown', requiresWeapon: PulseWeapon, apply: (p) => { if(p.weaponStats.PulseWeaponStats) p.weaponStats.PulseWeaponStats.cooldownMultiplier *= 0.90; } }
      ];
  }

  // --- Game Logic ---
  function initializeGame() { 
      resizeCanvas();
      // defineBaseUpgrades() is called in DOMContentLoaded now
      player = new Player(canvas.width / 2, canvas.height / 2, PLAYER_SIZE, 'cyan', INITIAL_PLAYER_HEALTH);
      enemies = []; projectiles = []; xpOrbs = []; keys = {};
      lastEnemySpawnTime = 0; 
      
      gameStartTime = performance.now(); 
      elapsedGameTime = 0; 
      timeAccumulator = 0;
      
      playerHealthDisplay.textContent = INITIAL_PLAYER_HEALTH;
      updateTimerDisplay(0);
      playerLevelDisplay.textContent = player.level;
      player.updateXpBar();
  }

  function spawnEnemy() { 
      let spawnX, spawnY;
      const edge = Math.floor(Math.random() * 4);
      const effectiveEnemyBaseSize = typeof ENEMY_BASE_SIZE !== 'undefined' ? ENEMY_BASE_SIZE : ENEMY_BASE_SIZE_DEFAULT;
      switch (edge) { 
          case 0: spawnX = Math.random() * canvas.width; spawnY = -effectiveEnemyBaseSize * 1.5; break;
          case 1: spawnX = Math.random() * canvas.width; spawnY = canvas.height + effectiveEnemyBaseSize * 1.5; break;
          case 2: spawnX = -effectiveEnemyBaseSize * 1.5; spawnY = Math.random() * canvas.height; break;
          case 3: spawnX = canvas.width + effectiveEnemyBaseSize * 1.5; spawnY = Math.random() * canvas.height; break;
      }

      const rand = Math.random();
      let typeToSpawn;
      let spawnCount = 1;

      const creepChance = 0.15 + (elapsedGameTime / 300); 
      const tankChance = 0.05 + (elapsedGameTime / 600); 

      if (rand < tankChance && elapsedGameTime > 30) { 
          typeToSpawn = 'Tank';
      } else if (rand < tankChance + creepChance) { 
          typeToSpawn = 'Creep';
          spawnCount = Math.floor(Math.random() * 3) + 2; 
      } else { 
          typeToSpawn = 'Standard';
      }

      for (let i = 0; i < spawnCount; i++) {
          let finalX = spawnX + (Math.random() - 0.5) * 30 * (spawnCount > 1 ? 1 : 0);
          let finalY = spawnY + (Math.random() - 0.5) * 30 * (spawnCount > 1 ? 1 : 0);
          enemies.push(new Enemy(finalX, finalY, typeToSpawn));
      }
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
                      xpOrbs.push(new XPOrb(e.x, e.y, XP_ORB_SIZE, '#76c7c0', XP_ORB_BASE_VALUE * e.xpMultiplier));
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
              player.takeDamage(ENEMY_DAMAGE_TO_PLAYER);
              enemies.splice(i, 1); 
          }
      }
      // Player vs XP Orb
      const currentPickupRadius = (player.radius + XP_ORB_SIZE + 15) * player.pickupRadiusMultiplier;
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
      
      if (!baseAvailableUpgrades || baseAvailableUpgrades.length === 0) { // Check if upgrades are defined
          console.error("baseAvailableUpgrades is not defined or empty! Resuming game.");
          setGameState('playing');
          return;
      }

      let possibleUpgrades = baseAvailableUpgrades.filter(upgrade => {
          if (!player || !player.weaponStats) return false; 

          const weaponKey = upgrade.requiresWeapon ? upgrade.requiresWeapon.name + "Stats" : null;
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
      choices = possibleUpgrades.slice(0, 3);
      
      if (choices.length === 0) {
          console.warn("No specific upgrades available after filtering. Offering fallback.");
          let fallbackUpgrade = baseAvailableUpgrades.find(u => u.id === 'hp_up');
          if (fallbackUpgrade) { choices.push(fallbackUpgrade); } 
          else { console.error("CRITICAL: Fallback 'hp_up' upgrade not found! Resuming game."); setGameState('playing'); return; }
      }

      choices.forEach(upgrade => {
          if (!upgrade || typeof upgrade.name !== 'string' || typeof upgrade.description !== 'string' || typeof upgrade.apply !== 'function') {
              console.error("Invalid upgrade object in choices:", upgrade, "Skipping."); 
              return; 
          }
          const button = document.createElement('button');
          button.classList.add('upgrade-button');
          button.innerHTML = `<h4>${upgrade.name}</h4><p>${upgrade.description}</p>`;
          button.onclick = () => {
              if (player) upgrade.apply(player); 
              if (player) player.updateXpBar();
              if (player) playerHealthDisplay.textContent = Math.max(0, Math.ceil(player.health));
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
          
          if (oldState === 'start' || oldState === 'over') {
              initializeGame(); 
          } else if (oldState === 'leveling_up') {
              gameStartTime = now; 
          }
          if (player && oldState !== 'playing') { 
              player.activeWeapons.forEach(w => w.lastAttackTime = now); 
          }
          gameLoop(now); 
      } else if (newState === 'over') {
          gameOverScreen.style.display = 'flex';
          levelUpScreen.style.display = 'none';
          timeSurvivedDisplay.textContent = formatTime(elapsedGameTime);
          levelReachedDisplay.textContent = player ? player.level : 1;
          if (animationFrameId) cancelAnimationFrame(animationFrameId);
      } else if (newState === 'leveling_up') {
          if(!player) { 
              console.error("Leveling up without player object! Resuming game.");
              setGameState('playing');
              return;
          }
          levelUpScreen.style.display = 'flex';
          if (animationFrameId) cancelAnimationFrame(animationFrameId); 
          timeAccumulator += now - gameStartTime; 
          displayLevelUpOptions();
      }
  }

  function startGame() { 
      setGameState('playing');
  }

  function gameLoop(currentTime) { 
      if (currentGameState !== 'playing') return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!lastEnemySpawnTime || currentTime - lastEnemySpawnTime > ENEMY_SPAWN_INTERVAL) {
          spawnEnemy();
          lastEnemySpawnTime = currentTime;
      }

      xpOrbs.forEach(orb => orb.draw());
      
      projectiles.forEach((p, i) => { 
           p.update();
           p.draw();
           if (p.x < -10 || p.x > canvas.width + 10 || p.y < -10 || p.y > canvas.height + 10) { 
              projectiles.splice(i, 1);
          }
      });

      if (player) { 
          player.update(currentTime); 
          player.draw(); 
          player.activeWeapons.forEach(w => w.draw(ctx)); 
      }
      enemies.forEach(enemy => { if (player) enemy.update(player); enemy.draw(); });

      handleCollisions();
      updateHUD(currentTime); 

      animationFrameId = requestAnimationFrame(gameLoop);
  }

  // At the end, call your game setup:
  resizeCanvas();
  defineBaseUpgrades();
  setGameState('start');
});