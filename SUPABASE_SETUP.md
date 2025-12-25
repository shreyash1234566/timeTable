# Supabase Setup Guide

## 🚀 Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub, Google, or email
4. Create a new project
5. Wait for it to initialize (~2 minutes)

---

## 🗄️ Step 2: Create Database Table

Go to **SQL Editor** and run this query:

```sql
CREATE TABLE progress (
  id INT PRIMARY KEY DEFAULT 1,
  data JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(id)
);

-- Insert default row
INSERT INTO progress (id, data) VALUES (1, '{}');
```

---

## 🔑 Step 3: Get Your Keys

1. Click **Settings** (bottom left)
2. Go to **API**
3. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

---

## 📝 Step 4: Add Keys to .env

Create a `.env` file in your project root:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🔐 Step 5: Enable Row Level Security (Optional but Recommended)

In Supabase Dashboard:
1. Go to **Authentication → Policies**
2. Click **New Policy** on `progress` table
3. Enable anon read/write access for development

```sql
-- Development only (allow all)
CREATE POLICY "Allow public access" ON progress
FOR ALL USING (true) WITH CHECK (true);
```

---

## 🧪 Step 6: Test Locally

```bash
npm install
npm start
```

Visit `http://localhost:3000/progress.html`

Test by:
- Adding tasks
- Saving progress
- Refresh page → data should persist ✅

---

## 🌐 Step 7: Deploy to Vercel

1. **Add environment variables to Vercel**:
   - Go to your Vercel project settings
   - Click **Environment Variables**
   - Add:
     - `SUPABASE_URL`
     - `SUPABASE_KEY`

2. **Deploy**:
   ```bash
   git add .
   git commit -m "Add Supabase integration"
   git push
   ```

3. Vercel auto-deploys! ✅

---

## ✅ Verification Checklist

- [ ] Supabase account created
- [ ] `progress` table created
- [ ] `.env` file added with credentials
- [ ] `.env` added to `.gitignore` ✓ (already done)
- [ ] `npm install` ran successfully
- [ ] Local testing works (data persists)
- [ ] Vercel env vars set
- [ ] Deployed to Vercel
- [ ] Live app working at `https://your-domain.vercel.app`

---

## 🐛 Troubleshooting

**"Failed to load data"**
- Check `.env` file exists with correct keys
- Restart server: `npm start`
- Check browser console for errors

**"SUPABASE_URL is missing"**
- Create `.env` file with credentials
- Restart terminal/server

**"Rows not saving"**
- Check Supabase Dashboard → progress table
- Ensure `progress` table exists
- Run the SQL query above again

**Permission denied error**
- Enable Row Level Security policies (Step 5)
- Or temporarily disable RLS for development

---

## 🎯 You're Ready!

Your app now has:
- ✅ Persistent data storage
- ✅ Automatic backups
- ✅ Production-ready database
- ✅ Free tier support (up to 500MB)

Happy tracking! 🚀
