# 🎮 Deadline Dread

[![Version](https://img.shields.io/badge/version-2.0.9-green.svg)](https://github.com/yourusername/deadlinedread/releases)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/jshields-ca/deadlinedread/actions)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen.svg)](https://dev.scootr.ca/deadlinedread/)
[![Made with Vite](https://img.shields.io/badge/made%20with-Vite-646CFF.svg)](https://vitejs.dev/)

> A survivors-like bullet hell game set in a nightmarish world for web developers. Survive the onslaught of... 'features'!

## 🎯 Live Demo

**[Play Deadline Dread Now](https://dev.scootr.ca/deadlinedread/)**

## 🎮 About

Deadline Dread is a web-based survivor/bullet hell game where you play as a developer fighting against an endless wave of bugs, feature requests, and scope creep. Use your arsenal of weapons and upgrades to survive as long as possible in this developer-themed nightmare!

## ✨ Features

### 🎯 Core Gameplay
- **Survivor-style combat** with auto-attacking weapons
- **Progressive difficulty** - enemies scale with your level
- **Level-up system** with unique upgrade choices
- **Multiple weapon types** with different mechanics
- **XP and progression** system

### 🔫 Weapons Arsenal
- **Homing Weapon** - Smart projectiles that track enemies
- **Orbiting Weapon** - Protective orbs that circle around you
- **Pulse Weapon** - Area damage bursts
- **Code Spray** - Shotgun-style weapon with range mechanics

### 👾 Enemy Types
- **Basic Bugs** - Standard enemies
- **Scope Creep Blob** - Splits into smaller enemies when destroyed
- **Buffer Overflow** - Creates fragment enemies when damaged
- **Feature Requests** - Various enemy behaviors and patterns

### 🎨 Visual & Audio
- **Retro-style graphics** with developer-themed aesthetics
- **Smooth animations** and particle effects
- **Randomized, on-theme canvas backgrounds** for each run
- **Weapon limit (4) for strategic builds**
- **Enhanced readability:** glow, borders, and dynamic text contrast
- **Responsive design** that adapts to screen size
- **Dark theme** optimized for developer eyes

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jshields-ca/deadlinedread.git
   cd deadlinedread
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to play!

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready for deployment.

## 🎮 How to Play

### Controls
- **W, A, S, D** - Move your character
- **Auto-attack** - Weapons fire automatically
- **Mouse** - Click to select upgrades during level-ups

### Gameplay
1. **Survive** - Avoid enemies and collect XP orbs
2. **Level Up** - Gain XP to unlock new weapons and upgrades
3. **Choose Wisely** - Select upgrades that complement your playstyle
4. **Adapt** - Enemy difficulty increases over time

### Tips
- **Stay mobile** - Keep moving to avoid enemy swarms
- **Collect XP** - Prioritize XP orbs to level up faster
- **Plan upgrades** - Choose upgrades that work well together
- **Watch your health** - Don't get cornered by enemies

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Graphics**: HTML5 Canvas
- **Deployment**: Static hosting
- **Version Control**: Git with automated releases

## 📁 Project Structure

```
deadlinedread/
├── src/
│   ├── main.js          # Main game loop and initialization
│   ├── player.js        # Player class and mechanics
│   ├── enemy.js         # Enemy types and spawning logic
│   ├── weapons.js       # Weapon classes and projectile system
│   ├── upgrades.js      # Upgrade system and definitions
│   ├── config.js        # Game configuration and constants
│   └── style.css        # Game styling and UI
├── public/              # Static assets
├── dist/                # Production build output
├── index.html           # Main HTML file
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
└── CHANGELOG.md         # Release history
```

## 🔄 Development Workflow

This project follows a structured development and release process:

1. **Development** - Code changes and testing
2. **Versioning** - Increment version numbers (patch/minor/major)
3. **Changelog** - Update `CHANGELOG.md` with changes
4. **Release** - Automated releases with `release-it`
5. **Deployment** - Build and deploy to live server

See our [Development Workflow](https://linear.app/scootr-ca/document/deadline-dread-development-and-release-workflow-0bde7df83629) for detailed process documentation.

## �� Version History

- For a complete version history and detailed release notes, see [CHANGELOG.md](CHANGELOG.md).

## 🤝 Contributing

While this is primarily a personal project, suggestions and feedback are welcome! Feel free to:

- Report bugs or issues
- Suggest new features or improvements
- Share gameplay feedback
- Fork and experiment with your own modifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **[Live Demo](https://dev.scootr.ca/deadlinedread/)**
- **[Changelog](CHANGELOG.md)**
- **[Project Planning](https://linear.app/scootr-ca/document/deadline-dread-development-plan-da18adc60a99)**
- **[Author's Website](https://scootr.ca)**

---

**Made with ❤️ for the developer community from Winnipeg, MB, Canada**

*Survive the backlog, one bug at a time!* 
