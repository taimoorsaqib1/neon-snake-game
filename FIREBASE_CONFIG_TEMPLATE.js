// ============================================
// FIREBASE SETUP INSTRUCTIONS
// ============================================
// Follow these steps to connect your game to Firebase:
//
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Enable Realtime Database (Start in Test Mode)
// 4. Go to Project Settings > Your apps > Web app
// 5. Copy your firebaseConfig object
// 6. Paste it below, replacing the placeholder config

// ============================================
// PASTE YOUR FIREBASE CONFIG HERE
// ============================================
// Replace this entire object with your actual Firebase config:

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// ============================================
// AFTER PASTING YOUR CONFIG:
// ============================================
// 1. Save this file
// 2. Copy the firebaseConfig object above (lines 16-23)
// 3. Open leaderboard.js
// 4. Find lines 18-25 (the firebaseConfig section)
// 5. Replace it with your config
// 6. Save leaderboard.js
// 7. Test your game!

// ============================================
// EXAMPLE (for reference):
// ============================================
/*
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "neon-snake-game.firebaseapp.com",
    databaseURL: "https://neon-snake-game-default-rtdb.firebaseio.com",
    projectId: "neon-snake-game",
    storageBucket: "neon-snake-game.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef123456"
};
*/

// ============================================
// SECURITY RULES (Important!)
// ============================================
// After testing, secure your database:
// 1. Go to Firebase Console > Realtime Database > Rules
// 2. Replace with the rules from LEADERBOARD_SETUP.md
// 3. Publish the rules
