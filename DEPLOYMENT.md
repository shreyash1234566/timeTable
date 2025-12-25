# AFCAT Progress Tracker - Vercel Deployment Guide

## 🚀 Quick Deployment Steps

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/afcat-tracker.git
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Click **"Deploy"**
5. Wait for deployment to complete ✅

### Step 3: Access Your App
Your deployment URL will be shown (e.g., `https://afcat-tracker-xyz.vercel.app`)

---

## 📝 What's Included

- **Frontend**: `progress.html` - Clean, responsive UI
- **Backend**: `api/progress.js` - Node.js Express API
- **Configuration**: `vercel.json` - Vercel deployment config
- **Auto-Detection**: API URL automatically detects localhost vs production

---

## ⚠️ Important Notes

### Data Storage
- Data is saved to `/tmp` on Vercel (temporary storage)
- **Data persists during deployment, but resets when Vercel restarts the serverless function**
- For permanent storage, upgrade to Postgres/MongoDB (optional)

### To Add Database (Optional)
Replace `/tmp/progress-data.json` with a database:

**Option A: Using Vercel Postgres**
```bash
npm install @vercel/postgres
```

**Option B: Using MongoDB**
```bash
npm install mongoose
```

Then update `api/progress.js` to use your database instead of file storage.

---

## 🔧 Local Development

```bash
npm install
npm start
```

Open `http://localhost:3000/progress.html`

---

## 📱 Features

✅ 30-day progress tracking  
✅ Daily tasks and todo management  
✅ Time logging (morning/evening/night)  
✅ Mock test scores with statistics  
✅ Import/Export functionality  
✅ Offline support with localStorage  
✅ Responsive design (mobile-friendly)  

---

## 🐛 Troubleshooting

**"Failed to save progress"**
- Check browser console (F12 → Console)
- Verify API URL is correct in Network tab

**"CORS error"**
- Fixed! The `cors` middleware now auto-detects your domain

**Data not persisting**
- This is normal on Vercel's serverless. Implement database storage for persistence.

---

## 📚 Next Steps

1. **Add Database** (for persistent data)
2. **Add Authentication** (protect your data)
3. **Mobile App** (React Native)
4. **Analytics Dashboard** (track progress charts)

---

**Happy tracking! 🎯**
