# Deployment Guide - Flood Detection System

## 🚀 Free Hosting Options

### Option 1: Vercel (Recommended - Easiest)

**Steps:**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project directory:
   ```bash
   vercel
   ```

4. Follow prompts and your site will be live at: `https://your-project.vercel.app`

**Pros:**
- ✅ Free SSL certificate
- ✅ Automatic deployments from GitHub
- ✅ Global CDN
- ✅ Zero configuration needed

---

### Option 2: GitHub Pages + Render

#### Part A: Frontend on GitHub Pages

1. Create a new GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/flood-detection.git
   git push -u origin master
   ```

3. Go to repository Settings → Pages
4. Select branch: `master`, folder: `/web`
5. Your frontend will be live at: `https://yourusername.github.io/flood-detection/`

#### Part B: Backend on Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: flood-detection-api
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api:app --host 0.0.0.0 --port $PORT`
5. Click "Create Web Service"

6. Update `web/app.js` API_BASE to your Render URL:
   ```javascript
   const DEFAULT_API_BASE = 'https://flood-detection-api.onrender.com';
   ```

**Pros:**
- ✅ Completely free
- ✅ Frontend on GitHub's CDN
- ✅ Backend with 750 hours/month free on Render
- ✅ Automatic SSL

---

### Option 3: Railway.app

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Python and deploys
6. Your site will be live at: `https://your-app.railway.app`

**Pros:**
- ✅ $5 free credit monthly
- ✅ Extremely simple deployment
- ✅ Automatic HTTPS

---

### Option 4: PythonAnywhere

1. Sign up at [pythonanywhere.com](https://www.pythonanywhere.com)
2. Upload your code via Files tab
3. Create a new web app (Flask/Django)
4. Configure WSGI file to point to your FastAPI app
5. Your site: `https://yourusername.pythonanywhere.com`

**Pros:**
- ✅ Free tier includes 512MB storage
- ✅ Built-in MySQL database
- ✅ Easy Python environment management

---

### Option 5: Netlify (Frontend) + Render (Backend)

Similar to GitHub Pages + Render, but with Netlify's easier deployment:

1. **Frontend on Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop your `/web` folder
   - Or connect GitHub for automatic deployments
   - Live at: `https://your-site.netlify.app`

2. **Backend on Render:** (same as Option 2 Part B)

---

## 📝 Quick Setup Commands

### Initialize Git (if not already done):
```bash
git init
git add .
git commit -m "Initial deployment setup"
```

### Create GitHub Repository:
```bash
# After creating repo on github.com
git remote add origin https://github.com/Naveen5965/flood-detection.git
git branch -M master
git push -u origin master
```

### Deploy to Vercel:
```bash
npm install -g vercel
vercel login
vercel
```

---

## 🔧 Environment Variables

For production, you may need to set:
- `FLOOD_AI_ARTIFACT_DIR` - Path to ML model artifacts
- `PORT` - Server port (automatically set by most platforms)

---

## 📊 Cost Comparison

| Platform | Free Tier | Bandwidth | Storage | Pros |
|----------|-----------|-----------|---------|------|
| **Vercel** | Unlimited | 100GB/month | 1GB | Easiest, best DX |
| **Render** | 750 hrs/month | 100GB/month | - | Good for APIs |
| **Railway** | $5 credit/month | Fair usage | 1GB | Auto-scaling |
| **PythonAnywhere** | Always free | Limited | 512MB | Python-focused |
| **Netlify** | Unlimited | 100GB/month | 100GB | Great for static |

---

## 🚨 Important Notes

1. **Model Files**: The `.pkl` files are large. Consider:
   - Storing them on GitHub LFS
   - Using cloud storage (AWS S3, Google Cloud Storage)
   - Rebuilding models on deployment

2. **API Base URL**: Update `web/app.js` with your production API URL

3. **CORS**: Already configured in `api.py` for all origins

4. **Database**: Current setup uses in-memory storage. For production, use:
   - PostgreSQL (free on Render, Railway)
   - MongoDB (free on MongoDB Atlas)

---

## 🎯 Recommended Path for Beginners

**Use Vercel** - It's the simplest:
1. `npm install -g vercel`
2. `vercel login`
3. `vercel` (in project directory)
4. Done! 🎉

Your site will be live with:
- Free SSL certificate
- Global CDN
- Automatic deployments
- Custom domain support (optional)
