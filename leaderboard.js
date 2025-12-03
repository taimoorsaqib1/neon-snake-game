// Leaderboard System using Firebase Realtime Database
class LeaderboardSystem {
    constructor() {
        this.db = null;
        this.playerName = this.loadPlayerName();
        this.currentPeriod = 'all-time'; // 'all-time', 'daily', 'weekly'
        this.leaderboardData = {
            'all-time': [],
            'daily': [],
            'weekly': []
        };
        this.initFirebase();
    }

    initFirebase() {
        // Firebase configuration for Neon Snake Game
        const firebaseConfig = {
            apiKey: "AIzaSyCmJw4cIbjbKR66GCB0wiYB9tyo4RuBbMw",
            authDomain: "neon-snake-game.firebaseapp.com",
            databaseURL: "https://neon-snake-game-default-rtdb.firebaseio.com",
            projectId: "neon-snake-game",
            storageBucket: "neon-snake-game.firebasestorage.app",
            messagingSenderId: "691332382544",
            appId: "1:691332382544:web:11c61d98e1c857d5357655"
        };

        try {
            // Initialize Firebase
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                this.db = firebase.database();
                this.setupListeners();
                console.log('Firebase initialized successfully');
            } else {
                console.warn('Firebase SDK not loaded. Leaderboard will use local storage only.');
                this.useFallbackMode();
            }
        } catch (error) {
            console.error('Firebase initialization error:', error);
            this.useFallbackMode();
        }
    }

    useFallbackMode() {
        // Fallback to localStorage if Firebase is not available
        this.loadLocalLeaderboard();
    }

    setupListeners() {
        if (!this.db) return;

        // Listen for all-time leaderboard updates
        this.db.ref('leaderboard/all-time').orderByChild('score').limitToLast(100).on('value', (snapshot) => {
            this.leaderboardData['all-time'] = this.processSnapshot(snapshot);
            if (this.currentPeriod === 'all-time') {
                this.displayLeaderboard();
            }
        });

        // Listen for daily leaderboard updates
        const today = this.getDateKey();
        this.db.ref(`leaderboard/daily/${today}`).orderByChild('score').limitToLast(100).on('value', (snapshot) => {
            this.leaderboardData['daily'] = this.processSnapshot(snapshot);
            if (this.currentPeriod === 'daily') {
                this.displayLeaderboard();
            }
        });

        // Listen for weekly leaderboard updates
        const week = this.getWeekKey();
        this.db.ref(`leaderboard/weekly/${week}`).orderByChild('score').limitToLast(100).on('value', (snapshot) => {
            this.leaderboardData['weekly'] = this.processSnapshot(snapshot);
            if (this.currentPeriod === 'weekly') {
                this.displayLeaderboard();
            }
        });
    }

    processSnapshot(snapshot) {
        const scores = [];
        snapshot.forEach((childSnapshot) => {
            scores.push({
                id: childSnapshot.key,
                ...childSnapshot.val()
            });
        });
        // Sort by score descending
        return scores.sort((a, b) => b.score - a.score);
    }

    getDateKey() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    getWeekKey() {
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const days = Math.floor((now - startOfYear) / (24 * 60 * 60 * 1000));
        const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
        return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
    }

    async submitScore(score, playerName = null) {
        const name = playerName || this.playerName || 'Anonymous';

        if (!this.playerName && playerName) {
            this.savePlayerName(playerName);
        }

        const scoreData = {
            name: name,
            score: score,
            timestamp: Date.now(),
            date: new Date().toISOString()
        };

        if (this.db) {
            try {
                // Submit to all-time leaderboard
                await this.db.ref('leaderboard/all-time').push(scoreData);

                // Submit to daily leaderboard
                const today = this.getDateKey();
                await this.db.ref(`leaderboard/daily/${today}`).push(scoreData);

                // Submit to weekly leaderboard
                const week = this.getWeekKey();
                await this.db.ref(`leaderboard/weekly/${week}`).push(scoreData);

                console.log('Score submitted successfully');
                return true;
            } catch (error) {
                console.error('Error submitting score:', error);
                this.saveLocalScore(scoreData);
                return false;
            }
        } else {
            // Fallback to local storage
            this.saveLocalScore(scoreData);
            return true;
        }
    }

    saveLocalScore(scoreData) {
        const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
        localScores.push(scoreData);
        localScores.sort((a, b) => b.score - a.score);
        // Keep only top 100
        const topScores = localScores.slice(0, 100);
        localStorage.setItem('localLeaderboard', JSON.stringify(topScores));
        this.leaderboardData['all-time'] = topScores;
        this.displayLeaderboard();
    }

    loadLocalLeaderboard() {
        const localScores = JSON.parse(localStorage.getItem('localLeaderboard') || '[]');
        this.leaderboardData['all-time'] = localScores;
        this.displayLeaderboard();
    }

    savePlayerName(name) {
        this.playerName = name;
        localStorage.setItem('playerName', name);
    }

    loadPlayerName() {
        return localStorage.getItem('playerName') || '';
    }

    switchPeriod(period) {
        this.currentPeriod = period;
        this.displayLeaderboard();

        // Update active button
        document.querySelectorAll('.period-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-period="${period}"]`)?.classList.add('active');
    }

    displayLeaderboard() {
        const container = document.getElementById('leaderboardList');
        if (!container) return;

        const scores = this.leaderboardData[this.currentPeriod] || [];

        if (scores.length === 0) {
            container.innerHTML = `
                <div class="no-scores">
                    <p>No scores yet. Be the first!</p>
                </div>
            `;
            return;
        }

        // Display top 10
        const topScores = scores.slice(0, 10);
        container.innerHTML = topScores.map((entry, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
            const isCurrentPlayer = entry.name === this.playerName;

            return `
                <div class="leaderboard-entry ${isCurrentPlayer ? 'current-player' : ''} ${rank <= 3 ? 'top-three' : ''}">
                    <div class="rank">
                        ${medal || `#${rank}`}
                    </div>
                    <div class="player-name">${this.escapeHtml(entry.name)}</div>
                    <div class="player-score">${entry.score}</div>
                </div>
            `;
        }).join('');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLeaderboard() {
        const modal = document.getElementById('leaderboardModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.displayLeaderboard();
        }
    }

    hideLeaderboard() {
        const modal = document.getElementById('leaderboardModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showNamePrompt(score, callback) {
        const modal = document.getElementById('namePromptModal');
        const scoreDisplay = document.getElementById('promptScore');

        if (modal && scoreDisplay) {
            scoreDisplay.textContent = score;
            modal.classList.remove('hidden');

            const input = document.getElementById('playerNameInput');
            if (input) {
                input.value = this.playerName || '';
                input.focus();
            }

            // Store callback for later use
            this.namePromptCallback = callback;
        }
    }

    submitName() {
        const input = document.getElementById('playerNameInput');
        const name = input?.value.trim() || 'Anonymous';

        // Validate name
        if (name.length > 20) {
            alert('Name must be 20 characters or less');
            return;
        }

        const modal = document.getElementById('namePromptModal');
        if (modal) {
            modal.classList.add('hidden');
        }

        if (this.namePromptCallback) {
            this.namePromptCallback(name);
            this.namePromptCallback = null;
        }
    }

    skipName() {
        const modal = document.getElementById('namePromptModal');
        if (modal) {
            modal.classList.add('hidden');
        }

        if (this.namePromptCallback) {
            this.namePromptCallback(this.playerName || 'Anonymous');
            this.namePromptCallback = null;
        }
    }

    getPlayerRank(score) {
        const scores = this.leaderboardData[this.currentPeriod] || [];
        const rank = scores.filter(entry => entry.score > score).length + 1;
        return rank;
    }

    isTopScore(score) {
        const scores = this.leaderboardData['all-time'] || [];
        return scores.length < 10 || score > scores[9]?.score || 0;
    }
}

// Initialize leaderboard system
let leaderboard;
window.addEventListener('DOMContentLoaded', () => {
    leaderboard = new LeaderboardSystem();
});
