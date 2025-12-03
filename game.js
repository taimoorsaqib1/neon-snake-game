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
        warning: '#ffff00',
        shrinkWall: '#ff6600'
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
        shrinkDuration: 6000,
        shrinkAmount: 5,
        shrinkChance: 0.1,
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

    playMoveSound() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.frequency.setValueAtTime(150, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

        osc.type = 'sine';
        osc.start(now);
        osc.stop(now + 0.05);
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

// Game State
class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        this.snake = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.food = { x: 0, y: 0 };
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.gameLoop = null;
        this.speed = CONFIG.initialSpeed;
        this.isPaused = false;
        this.particles = [];
        this.lastMoveTime = 0;
        this.lastFrameTime = 0;

        // Twist mechanics
        this.obstacles = [];
        this.speedBoostActive = false;
        this.speedBoostEndTime = 0;
        this.blurActive = false;
        this.blurEndTime = 0;
        this.portals = [];
        this.portalEndTime = 0;
        this.shrinkActive = false;
        this.shrinkEndTime = 0;
        this.shrinkBounds = { minX: 0, minY: 0, maxX: CONFIG.gridSize, maxY: CONFIG.gridSize };

        this.audio = new AudioSystem();

        this.updateHighScoreDisplay();
        this.setupEventListeners();
    }

    setupCanvas() {
        const size = CONFIG.gridSize * CONFIG.tileSize;
        this.canvas.width = size;
        this.canvas.height = size;
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (e.code === 'Space') {
            e.preventDefault();
            this.togglePause();
            return;
        }

        if (this.isPaused) return;

        const key = e.key.toLowerCase();
        const prevDirection = { ...this.nextDirection };
        const newDirection = { ...this.nextDirection };

        if ((key === 'arrowup' || key === 'w') && this.direction.y === 0) {
            e.preventDefault(); // Prevent page scroll
            newDirection.x = 0;
            newDirection.y = -1;
        } else if ((key === 'arrowdown' || key === 's') && this.direction.y === 0) {
            e.preventDefault(); // Prevent page scroll
            newDirection.x = 0;
            newDirection.y = 1;
        } else if ((key === 'arrowleft' || key === 'a') && this.direction.x === 0) {
            e.preventDefault(); // Prevent page scroll
            newDirection.x = -1;
            newDirection.y = 0;
        } else if ((key === 'arrowright' || key === 'd') && this.direction.x === 0) {
            e.preventDefault(); // Prevent page scroll
            newDirection.x = 1;
            newDirection.y = 0;
        }

        if (newDirection.x !== prevDirection.x || newDirection.y !== prevDirection.y) {
            this.audio.playMoveSound();
        }

        this.nextDirection = newDirection;
    }

    togglePause() {
        if (!this.gameLoop) return;

        this.isPaused = !this.isPaused;
        if (!this.isPaused) {
            this.update();
        }
    }

    start() {
        document.getElementById('gameOverlay').classList.add('hidden');
        this.audio.playStartSound();
        this.initGame();
        this.update();
    }

    restart() {
        document.getElementById('gameOverOverlay').classList.add('hidden');
        this.audio.playStartSound();
        this.initGame();
        this.update();
    }

    initGame() {
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
        this.isPaused = false;
        this.particles = [];
        this.lastMoveTime = 0;
        this.lastFrameTime = 0;

        // Reset twists
        this.obstacles = [];
        this.speedBoostActive = false;
        this.speedBoostEndTime = 0;
        this.blurActive = false;
        this.blurEndTime = 0;
        this.portals = [];
        this.portalEndTime = 0;
        this.shrinkActive = false;
        this.shrinkEndTime = 0;
        this.shrinkBounds = { minX: 0, minY: 0, maxX: CONFIG.gridSize, maxY: CONFIG.gridSize };

        this.updateScore();
        this.spawnFood();
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
        } while ((this.isSnakePosition(newFood.x, newFood.y) ||
            this.isObstaclePosition(newFood.x, newFood.y) ||
            this.isPortalPosition(newFood.x, newFood.y)) &&
            attempts < maxAttempts);

        this.food = newFood;
    }

    spawnObstacle() {
        let newObstacle;
        let attempts = 0;
        const maxAttempts = 100;

        do {
            newObstacle = {
                x: Math.floor(Math.random() * CONFIG.gridSize),
                y: Math.floor(Math.random() * CONFIG.gridSize),
                spawnTime: Date.now()
            };
            attempts++;
        } while ((this.isSnakePosition(newObstacle.x, newObstacle.y) ||
            this.isObstaclePosition(newObstacle.x, newObstacle.y) ||
            this.isPortalPosition(newObstacle.x, newObstacle.y) ||
            (newObstacle.x === this.food.x && newObstacle.y === this.food.y)) &&
            attempts < maxAttempts);

        this.obstacles.push(newObstacle);
    }

    spawnPortals() {
        this.portals = [];
        let attempts = 0;
        const maxAttempts = 100;

        // Spawn first portal
        let portal1;
        do {
            portal1 = {
                x: Math.floor(Math.random() * CONFIG.gridSize),
                y: Math.floor(Math.random() * CONFIG.gridSize)
            };
            attempts++;
        } while ((this.isSnakePosition(portal1.x, portal1.y) ||
            this.isObstaclePosition(portal1.x, portal1.y) ||
            (portal1.x === this.food.x && portal1.y === this.food.y)) &&
            attempts < maxAttempts);

        // Spawn second portal (far from first)
        let portal2;
        attempts = 0;
        do {
            portal2 = {
                x: Math.floor(Math.random() * CONFIG.gridSize),
                y: Math.floor(Math.random() * CONFIG.gridSize)
            };
            const distance = Math.abs(portal2.x - portal1.x) + Math.abs(portal2.y - portal1.y);
            attempts++;
        } while ((this.isSnakePosition(portal2.x, portal2.y) ||
            this.isObstaclePosition(portal2.x, portal2.y) ||
            (portal2.x === this.food.x && portal2.y === this.food.y) ||
            (portal2.x === portal1.x && portal2.y === portal1.y) ||
            Math.abs(portal2.x - portal1.x) + Math.abs(portal2.y - portal1.y) < 10) &&
            attempts < maxAttempts);

        this.portals = [portal1, portal2];
        this.portalEndTime = Date.now() + CONFIG.twists.portalDuration;
    }

    activateShrink() {
        const shrink = CONFIG.twists.shrinkAmount;
        this.shrinkBounds = {
            minX: shrink,
            minY: shrink,
            maxX: CONFIG.gridSize - shrink,
            maxY: CONFIG.gridSize - shrink
        };
        this.shrinkActive = true;
        this.shrinkEndTime = Date.now() + CONFIG.twists.shrinkDuration;
    }

    isSnakePosition(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }

    isObstaclePosition(x, y) {
        return this.obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
    }

    isPortalPosition(x, y) {
        return this.portals.some(portal => portal.x === x && portal.y === y);
    }

    showWarning(message) {
        const warningEl = document.getElementById('twistWarning');
        const textEl = document.getElementById('warningText');

        textEl.textContent = message;
        warningEl.classList.remove('hidden');

        setTimeout(() => {
            warningEl.classList.add('hidden');
        }, CONFIG.twists.warningDuration);
    }

    activateTwists() {
        const twistsToActivate = [];

        // Determine which twists will activate
        if (Math.random() < CONFIG.twists.obstacleSpawnChance) {
            twistsToActivate.push({ type: 'obstacle', message: '⚠️ OBSTACLE INCOMING!' });
        }

        if (Math.random() < CONFIG.twists.speedBoostChance) {
            twistsToActivate.push({ type: 'speed', message: '⚡ SPEED BOOST!' });
        }

        if (Math.random() < CONFIG.twists.blurChance) {
            twistsToActivate.push({ type: 'blur', message: '👁️ VISION BLUR!' });
        }

        if (Math.random() < CONFIG.twists.portalChance && this.portals.length === 0) {
            twistsToActivate.push({ type: 'portal', message: '🌀 PORTALS OPENING!' });
        }

        if (Math.random() < CONFIG.twists.shrinkChance && !this.shrinkActive) {
            twistsToActivate.push({ type: 'shrink', message: '📦 ARENA SHRINKING!' });
        }

        // Activate twists with warnings
        twistsToActivate.forEach((twist, index) => {
            setTimeout(() => {
                this.showWarning(twist.message);

                setTimeout(() => {
                    switch (twist.type) {
                        case 'obstacle':
                            this.spawnObstacle();
                            break;
                        case 'speed':
                            this.speedBoostActive = true;
                            this.speedBoostEndTime = Date.now() + CONFIG.twists.speedBoostDuration;
                            break;
                        case 'blur':
                            this.blurActive = true;
                            this.blurEndTime = Date.now() + CONFIG.twists.blurDuration;
                            break;
                        case 'portal':
                            this.spawnPortals();
                            break;
                        case 'shrink':
                            this.activateShrink();
                            break;
                    }
                    this.audio.playPowerUpSound();
                }, CONFIG.twists.warningDuration);
            }, index * 200); // Stagger warnings if multiple twists
        });
    }

    updateTwists(currentTime) {
        const now = Date.now();

        // Remove expired obstacles
        this.obstacles = this.obstacles.filter(obstacle =>
            now - obstacle.spawnTime < CONFIG.twists.obstacleLifetime
        );

        // Check speed boost expiration
        if (this.speedBoostActive && now >= this.speedBoostEndTime) {
            this.speedBoostActive = false;
        }

        // Check blur expiration
        if (this.blurActive && now >= this.blurEndTime) {
            this.blurActive = false;
        }

        // Check portal expiration
        if (this.portals.length > 0 && now >= this.portalEndTime) {
            this.portals = [];
        }

        // Check shrink expiration
        if (this.shrinkActive && now >= this.shrinkEndTime) {
            this.shrinkActive = false;
            this.shrinkBounds = { minX: 0, minY: 0, maxX: CONFIG.gridSize, maxY: CONFIG.gridSize };
        }
    }

    getCurrentSpeed() {
        if (this.speedBoostActive) {
            return this.speed / CONFIG.twists.speedBoostMultiplier;
        }
        return this.speed;
    }

    checkPortalCollision(x, y) {
        if (this.portals.length !== 2) return { x, y };

        if (x === this.portals[0].x && y === this.portals[0].y) {
            return { x: this.portals[1].x, y: this.portals[1].y };
        } else if (x === this.portals[1].x && y === this.portals[1].y) {
            return { x: this.portals[0].x, y: this.portals[0].y };
        }

        return { x, y };
    }

    update(currentTime = 0) {
        if (!this.lastFrameTime) {
            this.lastFrameTime = currentTime;
            this.lastMoveTime = currentTime;
        }

        this.gameLoop = requestAnimationFrame((time) => this.update(time));

        if (this.isPaused) {
            this.lastFrameTime = currentTime;
            this.lastMoveTime = currentTime;
            return;
        }

        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        this.updateTwists(currentTime);
        this.updateParticles();
        this.draw();

        const currentSpeed = this.getCurrentSpeed();
        if (currentTime - this.lastMoveTime < currentSpeed) {
            return;
        }

        this.lastMoveTime = currentTime;
        this.direction = { ...this.nextDirection };

        let head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;

        // Check portal teleportation
        const teleported = this.checkPortalCollision(head.x, head.y);
        head.x = teleported.x;
        head.y = teleported.y;

        // Check wall collision (considering shrink)
        const bounds = this.shrinkActive ? this.shrinkBounds : { minX: 0, minY: 0, maxX: CONFIG.gridSize, maxY: CONFIG.gridSize };
        if (head.x < bounds.minX || head.x >= bounds.maxX || head.y < bounds.minY || head.y >= bounds.maxY) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.isSnakePosition(head.x, head.y)) {
            this.gameOver();
            return;
        }

        // Check obstacle collision
        if (this.isObstaclePosition(head.x, head.y)) {
            this.gameOver();
            return;
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
        if (this.blurActive) {
            this.ctx.filter = `blur(${CONFIG.twists.blurAmount}px)`;
        } else {
            this.ctx.filter = 'none';
        }

        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawGrid();
        this.drawShrinkWalls();
        this.drawObstacles();
        this.drawPortals();
        this.drawFood();
        this.drawParticles();
        this.drawSnake();

        this.ctx.filter = 'none';
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

    drawShrinkWalls() {
        if (!this.shrinkActive) return;

        const shrink = CONFIG.twists.shrinkAmount;
        this.ctx.fillStyle = CONFIG.colors.shrinkWall + '40';
        this.ctx.strokeStyle = CONFIG.colors.shrinkWall;
        this.ctx.lineWidth = 3;

        // Draw danger zones
        // Top
        this.ctx.fillRect(0, 0, this.canvas.width, shrink * CONFIG.tileSize);
        // Bottom
        this.ctx.fillRect(0, (CONFIG.gridSize - shrink) * CONFIG.tileSize, this.canvas.width, shrink * CONFIG.tileSize);
        // Left
        this.ctx.fillRect(0, 0, shrink * CONFIG.tileSize, this.canvas.height);
        // Right
        this.ctx.fillRect((CONFIG.gridSize - shrink) * CONFIG.tileSize, 0, shrink * CONFIG.tileSize, this.canvas.height);

        // Draw border
        this.ctx.strokeRect(
            shrink * CONFIG.tileSize,
            shrink * CONFIG.tileSize,
            (CONFIG.gridSize - shrink * 2) * CONFIG.tileSize,
            (CONFIG.gridSize - shrink * 2) * CONFIG.tileSize
        );
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
});
