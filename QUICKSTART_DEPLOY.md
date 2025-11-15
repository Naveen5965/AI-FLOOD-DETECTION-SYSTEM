# 🚀 Deploy in 5 Minutes - Quick Start Guide

## Easiest Method: Render (Free)

### Step 1: Create GitHub Repository (2 minutes)

1. Go to https://github.com/new
2. Repository name: `flood-detection-system`
3. Make it Public
4. Click "Create repository"

### Step 2: Push Your Code (1 minute)

Open PowerShell in your project folder and run:

```powershell
# Initialize git
git init
git add .
git commit -m "Initial deployment"

# Connect to GitHub (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/flood-detection-system.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render (2 minutes)

1. Go to https://render.com/
2. Click "Get Started for Free"
3. Sign up with GitHub
4. Click "New +" → "Web Service"
5. Click "Connect" next to your `flood-detection-system` repository
6. Render auto-detects settings from `render.yaml`
7. Click "Create Web Service"
8. ☕ Wait 5-10 minutes for first deployment

### Step 4: Access Your Website! 🎉

You'll get a URL like:
```
https://flood-detection-system.onrender.com
```

View your console at:
```
https://flood-detection-system.onrender.com/static/index.html
```

---

## Alternative: Railway (Free $5 credit/month)

### Quick Deploy:

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Click "Deploy"
6. Go to Settings → Generate Domain
7. Done! Your app is live

---

## Update Your Deployed App

After making changes:

```powershell
git add .
git commit -m "Updated features"
git push
```

Your site will automatically redeploy! 🚀

---

## Troubleshooting

### Can't push to GitHub?
```powershell
# Set up GitHub authentication
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use GitHub Desktop or authenticate via browser
```

### Deployment fails?
- Check the deployment logs in Render/Railway dashboard
- Ensure all `.pkl` model files are included in git
- Verify `requirements.txt` has all dependencies

### Model files too large for Git?
```powershell
# Install Git LFS
git lfs install
git lfs track "*.pkl"
git add .gitattributes
git add *.pkl
git commit -m "Add model files with LFS"
git push
```

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app/
- **GitHub Help**: https://docs.github.com/

---

## Free Tier Limits

### Render Free:
- ✅ Automatic HTTPS
- ✅ Auto-deploy on push
- ⚠️ Sleeps after 15 min inactivity (takes 30s to wake)
- ✅ 750 hours/month free

### Railway Free:
- ✅ $5 free credit/month
- ✅ No sleep
- ✅ Fast deployments
- ⚠️ Charges after $5 credit

**Recommendation:** Start with Render Free, upgrade later if needed!
