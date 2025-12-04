// Game Configuration
const CONFIG = {
    gridSize: 30,
    tileSize: 24,
    initialSpeed: 150,
    speedIncrease: 5,
    minSpeed: 50,
    fps: 60,
    colors: {
        snakeHead: '#00f3ff',
        snakeBody: '#b026ff',
        food: '#ff0080',
        foodGlow: '#ff00ff',
        grid: 'rgba(0, 243, 255, 0.05)',
        obstacle: '#ff3333',
        obstacleGlow: '#ff6666',
        portal: '#00ff88',
        portalGlow: '#00ffaa',
        warning: '#ffff00'
    },
    twists: {
        obstacleLifetime: 5000,
        obstacleSpawnChance: 0.15,
        speedBoostDuration: 4000,
        speedBoostMultiplier: 1.5,
        speedBoostChance: 0.2,
        blurDuration: 3000,
        blurChance: 0.15,
        blurAmount: 8,
        portalDuration: 8000,
        portalChance: 0.12,
        warningDuration: 1000
    }
};

// Audio System
class AudioSystem {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.enabled = true;
        this.initAudio();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.3;
        } catch (e) {
            console.warn('Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    playEatSound() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

        osc.type = 'square';
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playGameOverSound() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        for (let i = 0; i < 3; i++) {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            const startFreq = 300 - (i * 50);
            const endFreq = 100 - (i * 20);

            osc.frequency.setValueAtTime(startFreq, now + (i * 0.1));
            osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.5 + (i * 0.1));

            gain.gain.setValueAtTime(0.15, now + (i * 0.1));
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6 + (i * 0.1));

            osc.type = 'sawtooth';
            osc.start(now + (i * 0.1));
            osc.stop(now + 0.6 + (i * 0.1));
        }
    }

    playStartSound() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const notes = [261.63, 329.63, 392.00, 523.25];

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.frequency.setValueAtTime(freq, now + (i * 0.1));
            gain.gain.setValueAtTime(0.2, now + (i * 0.1));
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15 + (i * 0.1));

            osc.type = 'triangle';
            osc.start(now + (i * 0.1));
            osc.stop(now + 0.15 + (i * 0.1));
        });
    }

    playPowerUpSound() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.2);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

        osc.type = 'triangle';
        osc.start(now);
        osc.stop(now + 0.25);
    }
}

// Main Game Class
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.audio = new AudioSystem();

        this.canvas.width = CONFIG.gridSize * CONFIG.tileSize;
        this.canvas.height = CONFIG.gridSize * CONFIG.tileSize;

        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = { x: 0, y: 0 };
        this.score = 0;
        this.speed = CONFIG.initialSpeed;
        this.gameLoop = null;
        this.lastMoveTime = 0;
        this.particles = [];
        this.controlsSetup = false;
        this.isGameOver = false;  // NEW: Flag to prevent multiple game over calls
        this.isPaused = false;  // NEW: Pause flag

        // Game twists
        this.obstacles = [];
        this.portals = [];
        this.speedBoostActive = false;
        this.speedBoostEndTime = 0;
        this.blurActive = false;
        this.blurEndTime = 0;

        // High score
        this.highScore = this.loadHighScore();
        this.updateHighScoreDisplay();

        this.init();
        this.setupControls();
    }

    init() {
        const center = Math.floor(CONFIG.gridSize / 2);
        this.snake = [
            { x: center, y: center },
            { x: center - 1, y: center },
            { x: center - 2, y: center }
        ];

        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.speed = CONFIG.initialSpeed;
        this.particles = [];
        this.obstacles = [];
        this.portals = [];
        this.speedBoostActive = false;
        this.blurActive = false;
        this.isGameOver = false;  // Reset game over flag
        this.isPaused = false;  // Reset pause flag

        this.spawnFood();
        this.updateScore();
    }

    setupControls() {
        // Only set up controls once
        if (this.controlsSetup) return;
        this.controlsSetup = true;

        document.addEventListener('keydown', (e) => {
            // Don't intercept keys if user is typing in an input field
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }

            // Handle pause with space bar
            if (e.key === ' ' || e.key === 'Spacebar') {
                if (this.gameLoop && !this.isGameOver) {
                    this.togglePause();
                    e.preventDefault();
                }
                return;
            }

            // Don't allow other controls when paused or game not running
            if (!this.gameLoop || this.isPaused) return;

            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: -1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction.y === 0) {
                        this.nextDirection = { x: 0, y: 1 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: -1, y: 0 };
                    }
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction.x === 0) {
                        this.nextDirection = { x: 1, y: 0 };
                    }
                    e.preventDefault();
                    break;
            }
        });
    }

    togglePause() {
        this.isPaused = !this.isPaused;

        if (this.isPaused) {
            console.log('Game Paused');
        } else {
            console.log('Game Resumed');
            // Reset lastMoveTime to prevent sudden jump
            this.lastMoveTime = performance.now();
        }
    }

    start() {
        this.init();
        document.getElementById('gameOverOverlay').classList.add('hidden');
        this.audio.playStartSound();
        this.lastMoveTime = performance.now();
        this.loop();
    }

    loop() {
        // CRITICAL: Stop loop if game is over or paused
        if (this.isGameOver) return;
        if (this.isPaused) {
            this.gameLoop = requestAnimationFrame(() => this.loop());
            return;
        }

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastMoveTime;

        const currentSpeed = this.speedBoostActive ?
            this.speed / CONFIG.twists.speedBoostMultiplier :
            this.speed;

        if (deltaTime >= currentSpeed) {
            this.update();
            this.lastMoveTime = currentTime;
        }

        this.updateParticles();
        this.draw();

        this.gameLoop = requestAnimationFrame(() => this.loop());
    }

    update() {
        this.direction = { ...this.nextDirection };

        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };

        // Check wall collision
        if (head.x < 0 || head.x >= CONFIG.gridSize ||
            head.y < 0 || head.y >= CONFIG.gridSize) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        // Check obstacle collision
        if (this.obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
            this.gameOver();
            return;
        }

        // Check portal collision
        const portalIndex = this.portals.findIndex(p => p.x === head.x && p.y === head.y);
        if (portalIndex !== -1) {
            const otherPortalIndex = portalIndex === 0 ? 1 : 0;
            if (this.portals[otherPortalIndex]) {
                head.x = this.portals[otherPortalIndex].x;
                head.y = this.portals[otherPortalIndex].y;
                this.audio.playPowerUpSound();
            }
        }

        this.snake.unshift(head);

        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.spawnFood();
            this.createParticles(head.x, head.y);
            this.audio.playEatSound();

            this.activateTwists();

            if (this.speed > CONFIG.minSpeed) {
                this.speed = Math.max(CONFIG.minSpeed, this.speed - CONFIG.speedIncrease);
            }
        } else {
            this.snake.pop();
        }

        this.updateTwists();
    }

    spawnFood() {
        let newFood;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            newFood = {
                x: Math.floor(Math.random() * CONFIG.gridSize),
                y: Math.floor(Math.random() * CONFIG.gridSize)
            };
            attempts++;
        } while (
            attempts < maxAttempts && (
                this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
                this.obstacles.some(obs => obs.x === newFood.x && obs.y === newFood.y) ||
                this.portals.some(portal => portal.x === newFood.x && portal.y === newFood.y)
            )
        );

        this.food = newFood;
    }

    activateTwists() {
        // Spawn obstacles - now spawns 5 at once with warning
        if (Math.random() < CONFIG.twists.obstacleSpawnChance && this.obstacles.length === 0) {
            // Show warning first
            this.showWarning('OBSTACLES INCOMING!');

            // Spawn 5 obstacles after warning
            setTimeout(() => {
                // Don't spawn if game is over
                if (this.isGameOver) return;

                const obstaclesToSpawn = 5;
                for (let i = 0; i < obstaclesToSpawn; i++) {
                    let newObstacle;
                    let attempts = 0;

                    do {
                        newObstacle = {
                            x: Math.floor(Math.random() * CONFIG.gridSize),
                            y: Math.floor(Math.random() * CONFIG.gridSize),
                            spawnTime: Date.now()
                        };
                        attempts++;
                    } while (
                        attempts < 50 && (
                            this.snake.some(s => s.x === newObstacle.x && s.y === newObstacle.y) ||
                            (this.food.x === newObstacle.x && this.food.y === newObstacle.y) ||
                            this.obstacles.some(o => o.x === newObstacle.x && o.y === newObstacle.y)
                        )
                    );

                    if (attempts < 50) {
                        this.obstacles.push(newObstacle);
                    }
                }
            }, CONFIG.twists.warningDuration);
        }

        // Speed boost
        if (Math.random() < CONFIG.twists.speedBoostChance) {
            this.showWarning('SPEED BOOST!');
            this.speedBoostActive = true;
            this.speedBoostEndTime = Date.now() + CONFIG.twists.speedBoostDuration;
        }

        // Blur effect
        if (Math.random() < CONFIG.twists.blurChance) {
            this.showWarning('BLUR INCOMING!');
            setTimeout(() => {
                if (this.isGameOver) return;
                this.blurActive = true;
                this.blurEndTime = Date.now() + CONFIG.twists.blurDuration;
            }, CONFIG.twists.warningDuration);
        }

        // Spawn portals
        if (Math.random() < CONFIG.twists.portalChance && this.portals.length === 0) {
            this.showWarning('PORTALS ACTIVATED!');
            const portal1 = this.getRandomEmptyPosition();
            const portal2 = this.getRandomEmptyPosition();

            if (portal1 && portal2) {
                this.portals = [
                    { ...portal1, spawnTime: Date.now() },
                    { ...portal2, spawnTime: Date.now() }
                ];
            }
        }
    }

    showWarning(text) {
        const warningElement = document.getElementById('twistWarning');
        const warningText = document.getElementById('warningText');

        if (warningElement && warningText) {
            warningText.textContent = text;
            warningElement.classList.remove('hidden');

            setTimeout(() => {
                warningElement.classList.add('hidden');
            }, CONFIG.twists.warningDuration);
        }
    }

    getRandomEmptyPosition() {
        let position;
        let attempts = 0;

        do {
            position = {
                x: Math.floor(Math.random() * CONFIG.gridSize),
                y: Math.floor(Math.random() * CONFIG.gridSize)
            };
            attempts++;
        } while (
            attempts < 50 && (
                this.snake.some(s => s.x === position.x && s.y === position.y) ||
                (this.food.x === position.x && this.food.y === position.y) ||
                this.obstacles.some(o => o.x === position.x && o.y === position.y) ||
                this.portals.some(p => p.x === position.x && p.y === position.y)
            )
        );

        return attempts < 50 ? position : null;
    }

    updateTwists() {
        const now = Date.now();

        // Remove expired obstacles
        this.obstacles = this.obstacles.filter(obs =>
            now - obs.spawnTime < CONFIG.twists.obstacleLifetime
        );

        // Remove expired portals
        this.portals = this.portals.filter(portal =>
            now - portal.spawnTime < CONFIG.twists.portalDuration
        );

        // Deactivate speed boost
        if (this.speedBoostActive && now > this.speedBoostEndTime) {
            this.speedBoostActive = false;
        }

        // Deactivate blur
        if (this.blurActive && now > this.blurEndTime) {
            this.blurActive = false;
        }
    }

    createParticles(x, y) {
        const centerX = x * CONFIG.tileSize + CONFIG.tileSize / 2;
        const centerY = y * CONFIG.tileSize + CONFIG.tileSize / 2;

        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const velocity = 2 + Math.random() * 2;

            this.particles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * velocity,
                vy: Math.sin(angle) * velocity,
                life: 1,
                size: 2 + Math.random() * 3,
                color: CONFIG.colors.food
            });
        }
    }

    updateParticles() {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            return particle.life > 0;
        });
    }

    draw() {
        try {
            // Safety check
            if (!this.ctx || !this.canvas) {
                console.error('Canvas context lost!');
                return;
            }

            if (this.blurActive) {
                this.ctx.filter = `blur(${CONFIG.twists.blurAmount}px)`;
            } else {
                this.ctx.filter = 'none';
            }

            this.ctx.fillStyle = '#0a0a0f';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            this.drawGrid();
            this.drawObstacles();
            this.drawPortals();
            this.drawFood();
            this.drawParticles();
            this.drawSnake();

            this.ctx.filter = 'none';
        } catch (error) {
            console.error('Draw error:', error);
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = CONFIG.colors.grid;
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= CONFIG.gridSize; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * CONFIG.tileSize, 0);
            this.ctx.lineTo(i * CONFIG.tileSize, this.canvas.height);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.moveTo(0, i * CONFIG.tileSize);
            this.ctx.lineTo(this.canvas.width, i * CONFIG.tileSize);
            this.ctx.stroke();
        }
    }

    drawObstacles() {
        const now = Date.now();

        this.obstacles.forEach(obstacle => {
            const x = obstacle.x * CONFIG.tileSize;
            const y = obstacle.y * CONFIG.tileSize;
            const centerX = x + CONFIG.tileSize / 2;
            const centerY = y + CONFIG.tileSize / 2;

            const timeAlive = now - obstacle.spawnTime;
            const lifeRatio = timeAlive / CONFIG.twists.obstacleLifetime;
            const opacity = lifeRatio > 0.8 ? (1 - lifeRatio) * 5 : 1;

            const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, CONFIG.tileSize);
            gradient.addColorStop(0, CONFIG.colors.obstacleGlow + Math.floor(opacity * 128).toString(16).padStart(2, '0'));
            gradient.addColorStop(0.5, CONFIG.colors.obstacleGlow + Math.floor(opacity * 64).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, CONFIG.colors.obstacleGlow + '00');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 5, y - 5, CONFIG.tileSize + 10, CONFIG.tileSize + 10);

            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = CONFIG.colors.obstacle;
            this.ctx.fillStyle = CONFIG.colors.obstacle;
            this.ctx.globalAlpha = opacity;
            this.ctx.fillRect(x + 4, y + 4, CONFIG.tileSize - 8, CONFIG.tileSize - 8);
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
        });
    }

    drawPortals() {
        this.portals.forEach(portal => {
            const x = portal.x * CONFIG.tileSize;
            const y = portal.y * CONFIG.tileSize;
            const centerX = x + CONFIG.tileSize / 2;
            const centerY = y + CONFIG.tileSize / 2;

            const pulseSize = Math.sin(Date.now() / 150) * 3 + 10;

            const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, CONFIG.tileSize);
            gradient.addColorStop(0, CONFIG.colors.portalGlow + '80');
            gradient.addColorStop(0.5, CONFIG.colors.portalGlow + '40');
            gradient.addColorStop(1, CONFIG.colors.portalGlow + '00');

            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x - 5, y - 5, CONFIG.tileSize + 10, CONFIG.tileSize + 10);

            this.ctx.shadowBlur = 25;
            this.ctx.shadowColor = CONFIG.colors.portal;
            this.ctx.fillStyle = CONFIG.colors.portal;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });
    }

    drawFood() {
        const x = this.food.x * CONFIG.tileSize;
        const y = this.food.y * CONFIG.tileSize;
        const centerX = x + CONFIG.tileSize / 2;
        const centerY = y + CONFIG.tileSize / 2;

        const pulseSize = Math.sin(Date.now() / 200) * 2 + 8;

        const gradient = this.ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, CONFIG.tileSize);
        gradient.addColorStop(0, CONFIG.colors.foodGlow + '80');
        gradient.addColorStop(0.5, CONFIG.colors.foodGlow + '40');
        gradient.addColorStop(1, CONFIG.colors.foodGlow + '00');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 5, y - 5, CONFIG.tileSize + 10, CONFIG.tileSize + 10);

        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = CONFIG.colors.food;
        this.ctx.fillStyle = CONFIG.colors.food;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * CONFIG.tileSize;
            const y = segment.y * CONFIG.tileSize;

            if (index === 0) {
                const gradient = this.ctx.createRadialGradient(
                    x + CONFIG.tileSize / 2,
                    y + CONFIG.tileSize / 2,
                    0,
                    x + CONFIG.tileSize / 2,
                    y + CONFIG.tileSize / 2,
                    CONFIG.tileSize
                );

                const headColor = this.speedBoostActive ? '#ffff00' : CONFIG.colors.snakeHead;
                gradient.addColorStop(0, headColor);
                gradient.addColorStop(1, CONFIG.colors.snakeBody);

                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = headColor;
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 2, y + 2, CONFIG.tileSize - 4, CONFIG.tileSize - 4);
                this.ctx.shadowBlur = 0;

                this.ctx.fillStyle = '#ffffff';
                const eyeSize = 3;
                if (this.direction.x === 1) {
                    this.ctx.fillRect(x + CONFIG.tileSize - 8, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + CONFIG.tileSize - 8, y + CONFIG.tileSize - 8, eyeSize, eyeSize);
                } else if (this.direction.x === -1) {
                    this.ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + 5, y + CONFIG.tileSize - 8, eyeSize, eyeSize);
                } else if (this.direction.y === -1) {
                    this.ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                    this.ctx.fillRect(x + CONFIG.tileSize - 8, y + 5, eyeSize, eyeSize);
                } else {
                    this.ctx.fillRect(x + 5, y + CONFIG.tileSize - 8, eyeSize, eyeSize);
                    this.ctx.fillRect(x + CONFIG.tileSize - 8, y + CONFIG.tileSize - 8, eyeSize, eyeSize);
                }
            } else {
                const opacity = 1 - (index / this.snake.length) * 0.3;
                const gradient = this.ctx.createLinearGradient(x, y, x + CONFIG.tileSize, y + CONFIG.tileSize);
                gradient.addColorStop(0, CONFIG.colors.snakeBody + Math.floor(opacity * 255).toString(16).padStart(2, '0'));
                gradient.addColorStop(1, CONFIG.colors.snakeHead + Math.floor(opacity * 200).toString(16).padStart(2, '0'));

                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 3, y + 3, CONFIG.tileSize - 6, CONFIG.tileSize - 6);
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            this.ctx.globalAlpha = 1;
        });
    }

    updateScore() {
        document.getElementById('score').textContent = this.score;

        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
            this.updateHighScoreDisplay();
        }
    }

    updateHighScoreDisplay() {
        document.getElementById('highScore').textContent = this.highScore;
    }

    saveHighScore() {
        localStorage.setItem('snakeHighScore', this.highScore.toString());
    }

    loadHighScore() {
        const saved = localStorage.getItem('snakeHighScore');
        return saved ? parseInt(saved, 10) : 0;
    }

    gameOver() {
        // Prevent multiple game over calls
        if (this.isGameOver) return;
        this.isGameOver = true;

        // Stop the game loop immediately
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }

        this.audio.playGameOverSound();

        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverOverlay').classList.remove('hidden');

        // Submit score to leaderboard
        if (typeof leaderboard !== 'undefined' && this.score > 0) {
            // Check if this is a top score
            const isTopScore = leaderboard.isTopScore(this.score);

            if (isTopScore) {
                // Show name prompt for top scores
                setTimeout(() => {
                    leaderboard.showNamePrompt(this.score, (name) => {
                        leaderboard.submitScore(this.score, name);
                    });
                }, 1500);
            } else {
                // Auto-submit with saved name for non-top scores
                leaderboard.submitScore(this.score);
            }
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();

    // Connect start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            document.getElementById('gameOverlay').classList.add('hidden');
            game.start();
        });
    }

    // Connect restart button - returns to main menu
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            // Return to main menu instead of restarting immediately
            if (typeof menuSystem !== 'undefined') {
                document.getElementById('gameOverOverlay').classList.add('hidden');
                menuSystem.returnToMainMenu();
            } else {
                // Fallback: restart the game if menu system not available
                game.start();
            }
        });
    }
});
