// QUICK SETUP - Copy and paste these changes

// ============================================
// 1. ADD TO index.html (after line 20)
// ============================================
// Find this line:
//     <link rel="stylesheet" href="style.css">
// 
// Add this right after it:
//     <link rel="stylesheet" href="leaderboard.css">


// ============================================
// 2. REPLACE gameOver() method in game.js
// ============================================
// Find the gameOver() method (around line 880) and replace it with this:

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


// ============================================
// 3. UPDATE Firebase Config in leaderboard.js
// ============================================
// Find lines 11-18 in leaderboard.js and replace with YOUR Firebase config:

const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Get your config from: https://console.firebase.google.com/
// Project Settings → Your apps → Web app → Config


// ============================================
// 4. DONE!
// ============================================
// Upload all files to Netlify and test!
