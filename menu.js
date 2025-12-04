// Menu System for Neon Snake Game

class MenuSystem {
    constructor() {
        this.currentPage = null;
        this.settings = {
            soundEffects: true,
            music: true,
            difficulty: 'normal',
            theme: 'neon'
        };

        this.init();
        this.loadSettings();
    }

    init() {
        // Create main menu
        this.createMainMenu();

        // Create pages
        this.createAboutPage();
        this.createHowToPlayPage();
        this.createSettingsPage();

        // Show main menu on load
        this.showMainMenu();
    }

    createMainMenu() {
        const mainMenu = document.createElement('div');
        mainMenu.className = 'main-menu';
        mainMenu.id = 'mainMenu';

        mainMenu.innerHTML = `
            <div class="menu-container">
                <div class="menu-logo">
                    <h1>
                        <span class="neon-text">NEON</span>
                        <span class="snake-text">SNAKE</span>
                    </h1>
                    <p class="menu-tagline">A Modern Classic</p>
                </div>
                
                <nav class="menu-nav">
                    <button class="menu-btn primary" onclick="menuSystem.startGame()">
                        <span>🎮 PLAY GAME</span>
                    </button>
                    <button class="menu-btn" onclick="menuSystem.showPage('howToPlay')">
                        <span>📖 HOW TO PLAY</span>
                    </button>
                    <button class="menu-btn" onclick="menuSystem.showPage('settings')">
                        <span>⚙️ SETTINGS</span>
                    </button>
                    <button class="menu-btn" onclick="leaderboard?.showLeaderboard()">
                        <span>🏆 LEADERBOARD</span>
                    </button>
                    <button class="menu-btn" onclick="menuSystem.showPage('about')">
                        <span>👤 ABOUT</span>
                    </button>
                </nav>
            </div>
        `;

        document.body.appendChild(mainMenu);
    }

    createAboutPage() {
        const aboutPage = document.createElement('div');
        aboutPage.className = 'menu-page';
        aboutPage.id = 'aboutPage';

        aboutPage.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <h2 class="page-title">About</h2>
                    <button class="page-close" onclick="menuSystem.closePage()">✕</button>
                </div>
                
                <div class="page-content">
                    <div class="about-section">
                        <h2>🎮 About the Game</h2>
                        <p>
                            <span class="highlight">Neon Snake</span> is a modern reimagining of the classic snake game, 
                            featuring stunning neon graphics, smooth gameplay, and exciting power-ups. Navigate through 
                            an ever-changing playfield, collect food, and avoid obstacles to achieve the highest score!
                        </p>
                        
                        <div class="about-info">
                            <div class="info-card">
                                <h4>🎨 Visual Design</h4>
                                <p>Vibrant neon aesthetics with dynamic particle effects and smooth animations</p>
                            </div>
                            <div class="info-card">
                                <h4>🎯 Gameplay</h4>
                                <p>Classic snake mechanics enhanced with modern twists and challenges</p>
                            </div>
                            <div class="info-card">
                                <h4>🏆 Leaderboards</h4>
                                <p>Compete globally with daily, weekly, and all-time rankings</p>
                            </div>
                            <div class="info-card">
                                <h4>📱 Responsive</h4>
                                <p>Optimized for desktop, tablet, and mobile devices</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="about-section">
                        <h2>👨‍💻 About the Developer</h2>
                        <p>
                            Hi! My name is <span class="highlight">Taimoor Saqib</span>. I'm a Software Engineer 
                            currently working as an LLM Engineer at Turing. This is one of my side projects—an 
                            attempt to reimagine the classic Snake game with a few extra twists that might sound 
                            frustrating at first, but ultimately enhance the old game into something new and exciting!
                        </p>
                        
                        <div class="info-card" style="margin-top: 20px;">
                            <h4>Taimoor Saqib</h4>
                            <p><strong>Role:</strong> Software Engineer & LLM Engineer at Turing</p>
                            <p><strong>Project Goal:</strong> Transform the classic Snake game with modern twists and challenges</p>
                            <p><strong>Tech Stack:</strong> HTML5 Canvas, JavaScript, CSS3, Firebase</p>
                        </div>
                        
                        <p style="margin-top: 20px; text-align: center; font-style: italic; opacity: 0.8;">
                            Thank you for playing! I hope you enjoy this modern take on a timeless classic. 🎮
                        </p>
                        
                        <!-- Social Links Placeholder -->
                        <!--
                        <div class="social-links">
                            <a href="#" class="social-link" title="GitHub" target="_blank">
                                <span>💻</span>
                            </a>
                            <a href="#" class="social-link" title="Twitter" target="_blank">
                                <span>🐦</span>
                            </a>
                            <a href="#" class="social-link" title="LinkedIn" target="_blank">
                                <span>💼</span>
                            </a>
                            <a href="#" class="social-link" title="Website" target="_blank">
                                <span>🌐</span>
                            </a>
                        </div>
                        -->
                    </div>
                    
                    <div class="about-section">
                        <h2>📜 Version & Credits</h2>
                        <p><strong>Version:</strong> 1.0.0</p>
                        <p><strong>Last Updated:</strong> December 2025</p>
                        <p><strong>Technologies:</strong> HTML5 Canvas, JavaScript, CSS3, Firebase</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(aboutPage);
    }

    createHowToPlayPage() {
        const howToPlayPage = document.createElement('div');
        howToPlayPage.className = 'menu-page';
        howToPlayPage.id = 'howToPlayPage';

        howToPlayPage.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <h2 class="page-title">How to Play</h2>
                    <button class="page-close" onclick="menuSystem.closePage()">✕</button>
                </div>
                
                <div class="page-content">
                    <h2>🎯 Objective</h2>
                    <p>
                        Control the snake to eat food and grow longer. Avoid hitting walls, obstacles, 
                        and your own tail. The game gets progressively harder as your score increases!
                    </p>
                    
                    <h2>🎮 Controls</h2>
                    <ul>
                        <li><kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> Arrow Keys - Move the snake</li>
                        <li><kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd> WASD Keys - Alternative movement</li>
                        <li><kbd>SPACE</kbd> Spacebar - Pause/Resume game</li>
                    </ul>
                    
                    <h2>🍎 Game Elements</h2>
                    <h3>Food</h3>
                    <ul>
                        <li><span class="highlight">Regular Food</span> - Increases your score and makes the snake grow</li>
                        <li>Each food item increases your score and slightly increases game speed</li>
                    </ul>
                    
                    <h3>Obstacles</h3>
                    <ul>
                        <li><span class="highlight">Static Obstacles</span> - Avoid these barriers that appear randomly</li>
                        <li>Hitting an obstacle ends the game</li>
                    </ul>
                    
                    <h3>Special Features</h3>
                    <ul>
                        <li><span class="highlight">Portals</span> - Teleport between connected portal pairs</li>
                        <li><span class="highlight">Shrinking Walls</span> - The playfield temporarily shrinks, increasing difficulty</li>
                        <li><span class="highlight">Visual Effects</span> - Blur effects and other visual twists add challenge</li>
                    </ul>
                    
                    <h2>💡 Tips & Strategies</h2>
                    <ul>
                        <li>Plan your path ahead - don't just react to immediate threats</li>
                        <li>Use the center of the grid when possible to maximize escape routes</li>
                        <li>Watch for twist warnings to prepare for upcoming challenges</li>
                        <li>Portals can be used strategically to escape tight situations</li>
                        <li>During shrink events, stay near the center to avoid wall collisions</li>
                        <li>The game speeds up as you score more - practice makes perfect!</li>
                    </ul>
                    
                    <h2>🏆 Scoring</h2>
                    <ul>
                        <li>Each food item increases your score</li>
                        <li>Your high score is saved locally</li>
                        <li>Compete on global leaderboards (daily, weekly, and all-time)</li>
                        <li>Submit your score with a name to appear on the leaderboard</li>
                    </ul>
                    
                    <h2>📱 Mobile Play</h2>
                    <p>
                        On mobile devices, swipe in the direction you want the snake to move. 
                        The game is fully responsive and optimized for touch controls.
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(howToPlayPage);
    }

    createSettingsPage() {
        const settingsPage = document.createElement('div');
        settingsPage.className = 'menu-page';
        settingsPage.id = 'settingsPage';

        settingsPage.innerHTML = `
            <div class="page-container">
                <div class="page-header">
                    <h2 class="page-title">Settings</h2>
                    <button class="page-close" onclick="menuSystem.closePage()">✕</button>
                </div>
                
                <div class="page-content">
                    <div class="settings-group">
                        <h3>🔊 Audio Settings</h3>
                        
                        <div class="setting-item">
                            <span class="setting-label">Sound Effects</span>
                            <div class="setting-control">
                                <div class="toggle-switch ${this.settings.soundEffects ? 'active' : ''}" 
                                     id="soundEffectsToggle" 
                                     onclick="menuSystem.toggleSetting('soundEffects')">
                                </div>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <span class="setting-label">Background Music</span>
                            <div class="setting-control">
                                <div class="toggle-switch ${this.settings.music ? 'active' : ''}" 
                                     id="musicToggle" 
                                     onclick="menuSystem.toggleSetting('music')">
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <h3>🎮 Game Settings</h3>
                        
                        <div class="setting-item">
                            <span class="setting-label">Difficulty</span>
                            <div class="setting-control">
                                <select class="select-dropdown" id="difficultySelect" 
                                        onchange="menuSystem.changeDifficulty(this.value)">
                                    <option value="easy" ${this.settings.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                                    <option value="normal" ${this.settings.difficulty === 'normal' ? 'selected' : ''}>Normal</option>
                                    <option value="hard" ${this.settings.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="setting-item">
                            <span class="setting-label">Visual Theme</span>
                            <div class="setting-control">
                                <select class="select-dropdown" id="themeSelect" 
                                        onchange="menuSystem.changeTheme(this.value)">
                                    <option value="neon" ${this.settings.theme === 'neon' ? 'selected' : ''}>Neon (Default)</option>
                                    <option value="classic" ${this.settings.theme === 'classic' ? 'selected' : ''}>Classic</option>
                                    <option value="dark" ${this.settings.theme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div class="settings-group">
                        <h3>ℹ️ Information</h3>
                        <p style="margin: 0; opacity: 0.8;">
                            Settings are automatically saved to your browser's local storage.
                            Changes will take effect immediately or on the next game start.
                        </p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(settingsPage);
    }

    showMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.remove('hidden');
        }

        // Hide game overlay if it exists
        const gameOverlay = document.getElementById('gameOverlay');
        if (gameOverlay) {
            gameOverlay.classList.add('hidden');
        }
    }

    hideMainMenu() {
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.add('hidden');
        }
    }

    showPage(pageId) {
        this.currentPage = pageId;
        const page = document.getElementById(`${pageId}Page`);
        if (page) {
            page.classList.add('active');
        }
    }

    closePage() {
        if (this.currentPage) {
            const page = document.getElementById(`${this.currentPage}Page`);
            if (page) {
                page.classList.remove('active');
            }
            this.currentPage = null;
        }
    }

    startGame() {
        this.hideMainMenu();

        // Show the game's start overlay
        const gameOverlay = document.getElementById('gameOverlay');
        if (gameOverlay) {
            gameOverlay.classList.remove('hidden');
        }
    }

    // Settings Management
    toggleSetting(setting) {
        this.settings[setting] = !this.settings[setting];
        this.saveSettings();

        // Update UI
        const toggle = document.getElementById(`${setting}Toggle`);
        if (toggle) {
            toggle.classList.toggle('active');
        }

        // Apply setting
        this.applySettings();
    }

    changeDifficulty(difficulty) {
        this.settings.difficulty = difficulty;
        this.saveSettings();
        this.applySettings();
    }

    changeTheme(theme) {
        this.settings.theme = theme;
        this.saveSettings();
        this.applySettings();
    }

    applySettings() {
        // Apply sound effects setting
        if (window.game && window.game.audio) {
            window.game.audio.enabled = this.settings.soundEffects;
        }

        // Apply difficulty (would need to be implemented in game.js)
        if (window.game) {
            switch (this.settings.difficulty) {
                case 'easy':
                    // Could adjust CONFIG values for easier gameplay
                    break;
                case 'hard':
                    // Could adjust CONFIG values for harder gameplay
                    break;
                default:
                    // Normal difficulty
                    break;
            }
        }

        // Apply theme (could add different color schemes)
        // This would require additional implementation
    }

    saveSettings() {
        try {
            localStorage.setItem('neonSnakeSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('neonSnakeSettings');
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                this.applySettings();
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
        }
    }

    // Add method to return to main menu from game
    returnToMainMenu() {
        // Reset game if needed
        if (window.game) {
            window.game.isPaused = true;
        }

        // Hide game overlays
        const gameOverlay = document.getElementById('gameOverlay');
        const gameOverOverlay = document.getElementById('gameOverOverlay');

        if (gameOverlay) gameOverlay.classList.add('hidden');
        if (gameOverOverlay) gameOverOverlay.classList.add('hidden');

        // Show main menu
        this.showMainMenu();
    }
}

// Initialize menu system when DOM is loaded
let menuSystem;
document.addEventListener('DOMContentLoaded', () => {
    menuSystem = new MenuSystem();
});

// Add ESC key handler to return to menu
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menuSystem) {
        if (menuSystem.currentPage) {
            menuSystem.closePage();
        } else if (window.game && !window.game.isRunning) {
            menuSystem.returnToMainMenu();
        }
    }
});
