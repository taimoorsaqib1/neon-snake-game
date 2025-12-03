# Leaderboard System Setup Guide

## Overview
I've implemented a comprehensive leaderboard system for your Neon Snake game! Here's what's been added:

### Features
✅ **Global Leaderboard** - All-time top scores
✅ **Daily Leaderboard** - Today's best scores  
✅ **Weekly Leaderboard** - This week's champions
✅ **Real-time Updates** - Scores update live via Firebase
✅ **Player Names** - Players can enter their names
✅ **Beautiful UI** - Matches your neon aesthetic
✅ **LocalStorage Fallback** - Works even without Firebase

## Files Created/Modified

### New Files:
1. **leaderboard.js** - Complete leaderboard system with Firebase integration
2. **leaderboard.css** - Styling for leaderboard UI
3. **LEADERBOARD_SETUP.md** - This file

### Modified Files:
1. **index.html** - Added leaderboard button, modals, and Firebase SDK
2. **game.js** - Needs manual update (see below)

## Setup Instructions

### Step 1: Update index.html
Add this line after the existing `<link rel="stylesheet" href="style.css">` (around line 20):
```html
<link rel="stylesheet" href="leaderboard.css">
```

### Step 2: Set Up Firebase (FREE)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or use existing project
3. Enter project name (e.g., "neon-snake-game")
4. Disable Google Analytics (optional)
5. Click "Create Project"

#### Enable Realtime Database:
1. In Firebase Console, click "Realtime Database" in left menu
2. Click "Create Database"
3. Choose location closest to your users
4. Start in **Test Mode** (we'll secure it later)
5. Click "Enable"

#### Get Your Config:
1. Click the gear icon ⚙️ next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon `</>`
5. Register your app (name: "Neon Snake")
6. Copy the `firebaseConfig` object

#### Update leaderboard.js:
Open `leaderboard.js` and replace lines 11-18 with your Firebase config:
```javascript
const firebaseConfig = {
    apiKey: "YOUR_ACTUAL_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

### Step 3: Update game.js

Open `game.js` and find the `gameOver()` method (around line 880). Replace it with:

```javascript
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
```

### Step 4: Secure Your Firebase Database (IMPORTANT!)

After testing, update your Firebase Realtime Database rules:

1. Go to Firebase Console → Realtime Database → Rules
2. Replace with these rules:

```json
{
  "rules": {
    "leaderboard": {
      ".read": true,
      "all-time": {
        ".write": "!data.exists()",
        "$scoreId": {
          ".validate": "newData.hasChildren(['name', 'score', 'timestamp', 'date']) && newData.child('name').isString() && newData.child('name').val().length <= 20 && newData.child('score').isNumber() && newData.child('score').val() >= 0"
        }
      },
      "daily": {
        "$date": {
          ".write": "!data.exists()",
          "$scoreId": {
            ".validate": "newData.hasChildren(['name', 'score', 'timestamp', 'date']) && newData.child('name').isString() && newData.child('name').val().length <= 20 && newData.child('score').isNumber() && newData.child('score').val() >= 0"
          }
        }
      },
      "weekly": {
        "$week": {
          ".write": "!data.exists()",
          "$scoreId": {
            ".validate": "newData.hasChildren(['name', 'score', 'timestamp', 'date']) && newData.child('name').isString() && newData.child('name').val().length <= 20 && newData.child('score').isNumber() && newData.child('score').val() >= 0"
          }
        }
      }
    }
  }
}
```

These rules:
- Allow anyone to read scores
- Only allow new scores to be added (not modified/deleted)
- Validate score data format
- Limit name length to 20 characters
- Ensure scores are positive numbers

## How It Works

### For Players:
1. Play the game normally
2. When game ends, if they got a top-10 score, they'll see a name prompt
3. Enter name and submit (or skip to use saved name)
4. Click the 🏆 LEADERBOARD button to view rankings
5. Switch between All Time, Daily, and Weekly leaderboards

### For You:
- Scores are automatically submitted to Firebase
- Leaderboards update in real-time
- Works offline with localStorage fallback
- No backend server needed - Firebase handles everything!

## Testing

1. Open your game in a browser
2. Play and get a score
3. Check if the name prompt appears
4. Submit your score
5. Click the leaderboard button
6. Verify your score appears

## Troubleshooting

### Leaderboard button not showing:
- Check browser console for errors
- Verify `leaderboard.css` is linked in HTML
- Clear browser cache

### Scores not saving:
- Check Firebase Console → Realtime Database
- Verify your config in `leaderboard.js`
- Check browser console for Firebase errors
- Ensure database rules allow writes

### Name prompt not appearing:
- Check that `game.js` was updated correctly
- Verify `leaderboard.js` is loaded before `game.js` in HTML
- Check browser console for JavaScript errors

## Cost

Firebase Realtime Database FREE tier includes:
- 1 GB stored data
- 10 GB/month downloaded
- 100 simultaneous connections

This is MORE than enough for a snake game leaderboard! You'd need thousands of daily players to exceed this.

## Privacy Policy Update

Add this to your privacy.html:

```html
<h2>Leaderboard Data</h2>
<p>When you submit a score to our leaderboard, we collect:</p>
<ul>
    <li>Your chosen display name</li>
    <li>Your score</li>
    <li>Timestamp of submission</li>
</ul>
<p>This data is stored in Firebase Realtime Database and is publicly visible on the leaderboard. We do not collect any personally identifiable information.</p>
```

## Next Steps

After the leaderboard is working, consider adding:
1. **Share Score** - Let players share their scores on social media
2. **Achievements** - Award badges for milestones
3. **Player Profiles** - Track individual player stats
4. **Tournaments** - Special limited-time competitions
5. **Rewards** - Give bonuses for top rankings

## Support

If you encounter any issues:
1. Check the browser console (F12) for errors
2. Verify all files are uploaded to Netlify
3. Test locally first before deploying
4. Check Firebase Console for database activity

Enjoy your new leaderboard system! 🎮🏆
