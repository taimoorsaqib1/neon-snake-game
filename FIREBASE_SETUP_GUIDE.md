# 🔥 Firebase Setup Guide for Neon Snake Game

## 📊 Current Status

✅ **Completed:**
- Leaderboard UI is working
- Game integration is complete (`game.js` updated)
- Responsive design tested (PC & Laptop screens)
- Google AdSense slots are in place

⚠️ **Needs Configuration:**
- Firebase credentials (follow steps below)

---

## 🚀 Step-by-Step Firebase Setup

### **Step 1: Create Firebase Project** (5 minutes)

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/
   - Sign in with your Google account

2. **Create New Project**
   - Click **"Add project"** or **"Create a project"**
   - Project name: `neon-snake-game` (or any name you prefer)
   - Click **Continue**

3. **Google Analytics** (Optional)
   - Toggle OFF "Enable Google Analytics" (not needed for this game)
   - Click **Create project**
   - Wait 30-60 seconds for setup
   - Click **Continue**

---

### **Step 2: Enable Realtime Database** (3 minutes)

1. **Navigate to Database**
   - In the left sidebar, find **"Build"** section
   - Click **"Realtime Database"**

2. **Create Database**
   - Click **"Create Database"** button
   
3. **Choose Location**
   - Select region closest to your users:
     - `us-central1` - United States
     - `europe-west1` - Belgium  
     - `asia-southeast1` - Singapore
   - Click **Next**

4. **Security Rules**
   - Select **"Start in test mode"** (we'll secure it later)
   - Click **Enable**
   - Database will be created in ~10 seconds

5. **Note Your Database URL**
   - You'll see it at the top: `https://YOUR-PROJECT-ID-default-rtdb.firebaseio.com/`
   - Keep this page open!

---

### **Step 3: Register Web App & Get Config** (3 minutes)

1. **Open Project Settings**
   - Click the **⚙️ gear icon** next to "Project Overview" (top left)
   - Click **"Project settings"**

2. **Add Web App**
   - Scroll down to **"Your apps"** section
   - Click the **`</>`** icon (Web platform)

3. **Register App**
   - App nickname: `Neon Snake Web`
   - ❌ **Don't check** "Also set up Firebase Hosting"
   - Click **"Register app"**

4. **Copy Configuration**
   - You'll see a code snippet with `firebaseConfig`
   - **COPY THE ENTIRE firebaseConfig OBJECT**
   - It looks like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "neon-snake-game.firebaseapp.com",
  databaseURL: "https://neon-snake-game-default-rtdb.firebaseio.com",
  projectId: "neon-snake-game",
  storageBucket: "neon-snake-game.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

5. **Save It**
   - Copy this to a text file temporarily
   - Click **"Continue to console"**

---

### **Step 4: Update Your Game Code** (2 minutes)

1. **Open `leaderboard.js`**
   - Find lines 18-25 (the firebaseConfig section)
   - It currently has placeholder values like `YOUR_API_KEY`

2. **Replace with Your Config**
   - Delete lines 18-25
   - Paste your actual Firebase config
   - Save the file

**Before:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    // ... placeholder values
};
```

**After:**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxx",
    authDomain: "neon-snake-game.firebaseapp.com",
    // ... your actual values
};
```

---

### **Step 5: Test the Leaderboard** (2 minutes)

1. **Refresh Your Game**
   - Open: http://localhost:8000/index.html
   - Open browser console (F12)
   - Look for: `Firebase initialized successfully`

2. **Play the Game**
   - Click "START GAME"
   - Play until game over
   - Get a score > 0

3. **Check Name Prompt**
   - After game over, a modal should appear asking for your name
   - Enter your name
   - Click "Submit Score"

4. **View Leaderboard**
   - Click the 🏆 **LEADERBOARD** button
   - You should see your score!

5. **Verify in Firebase**
   - Go back to Firebase Console
   - Click "Realtime Database"
   - You should see data under `leaderboard/all-time/`, `daily/`, and `weekly/`

---

### **Step 6: Secure Your Database** (5 minutes) ⚠️ IMPORTANT!

**After testing works, secure your database to prevent abuse:**

1. **Go to Database Rules**
   - Firebase Console → Realtime Database → **Rules** tab

2. **Replace Rules**
   - Delete the current test mode rules
   - Paste these secure rules:

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

3. **Publish Rules**
   - Click **"Publish"**
   - Rules are now active!

**What these rules do:**
- ✅ Anyone can **read** scores (view leaderboard)
- ✅ Anyone can **add new** scores
- ❌ Nobody can **modify or delete** existing scores
- ✅ Validates score format (name, score, timestamp, date)
- ✅ Limits name to 20 characters
- ✅ Ensures scores are positive numbers

---

## 🎯 Testing Checklist

After setup, verify everything works:

- [ ] Firebase initialized successfully (check console)
- [ ] Play game and get score > 0
- [ ] Name prompt appears after game over
- [ ] Score submits successfully
- [ ] Leaderboard shows your score
- [ ] All three periods work (All Time, Daily, Weekly)
- [ ] Data appears in Firebase Console
- [ ] Security rules are published

---

## 🐛 Troubleshooting

### **"Firebase SDK not loaded"**
- Check internet connection
- Verify Firebase SDK scripts in `index.html` (lines 183-184)
- Clear browser cache

### **"Permission denied" errors**
- Check database rules in Firebase Console
- Make sure you're in "Test mode" initially
- Verify `databaseURL` in config is correct

### **Scores not appearing**
- Open browser console (F12) and check for errors
- Verify Firebase config is correct in `leaderboard.js`
- Check Firebase Console → Realtime Database → Data tab

### **Name prompt not showing**
- Make sure score is > 0
- Check that `leaderboard.js` is loaded before `game.js` in HTML
- Verify browser console for JavaScript errors

---

## 💰 Firebase Pricing (FREE Tier)

Your game will use Firebase's **FREE Spark Plan**:

- ✅ 1 GB stored data
- ✅ 10 GB/month downloaded  
- ✅ 100 simultaneous connections

**This is MORE than enough!** You'd need thousands of daily players to exceed this.

---

## 📱 Next Steps

Once Firebase is working:

1. **Deploy Your Game**
   - Use Netlify, Vercel, or GitHub Pages
   - Google Ads will only work on live HTTPS sites

2. **Monitor Usage**
   - Check Firebase Console → Usage tab
   - Set up budget alerts if needed

3. **Add Features**
   - Share scores on social media
   - Add achievements
   - Create tournaments

---

## 📞 Need Help?

If you encounter issues:
1. Check browser console (F12) for error messages
2. Verify Firebase Console shows your database
3. Test with a fresh browser/incognito window
4. Check that all files are saved

---

**Good luck! 🎮🏆**
