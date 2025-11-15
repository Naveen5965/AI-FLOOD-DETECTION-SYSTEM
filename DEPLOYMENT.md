# Deployment Guide - Flood Detection System

## Prerequisites
- Git installed
- GitHub account
- Account on your chosen platform (Render/Railway/Vercel)

---

## Option 1: Deploy to Render (Recommended - Easiest)

### Steps:

1. **Push your code to GitHub:**
   ```powershell
   # Initialize git if not already done
   git init
   git add .
   git commit -m "Initial commit"
   
   # Create a new repository on GitHub, then:
   git remote add origin https://github.com/YOUR_USERNAME/flood-detection.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to https://render.com and sign up
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the `render.yaml` file
   - Click "Create Web Service"
   - Wait 5-10 minutes for deployment

3. **Access your site:**
   - You'll get a URL like: `https://flood-detection-system.onrender.com`
   - Access the console at: `https://flood-detection-system.onrender.com/static/index.html`

**Pros:** Free tier, auto-deploys on git push, easy setup
**Cons:** Free tier may sleep after inactivity (takes ~30s to wake up)

---

## Option 2: Deploy to Railway

### Steps:

1. **Push code to GitHub** (same as above)

2. **Deploy on Railway:**
   - Go to https://railway.app and sign up
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will auto-detect Python and use `railway.json`
   - Click "Deploy"

3. **Generate domain:**
   - Go to Settings → Generate Domain
   - You'll get: `https://your-app.railway.app`

**Pros:** $5 free credit monthly, fast deployments, great for APIs
**Cons:** Free tier limited to $5/month usage

---

## Option 3: Deploy to Vercel

### Steps:

1. **Install Vercel CLI:**
   ```powershell
   npm install -g vercel
   ```

2. **Deploy:**
   ```powershell
   cd "c:\Users\navee\OneDrive - Bharatividyapeeth\Desktop\Main\Projects\AI for Disaster forecasting & Responses\AI_Flood_Detection_&_Responses_Sytem"
   vercel
   ```

3. **Follow prompts:**
   - Login with GitHub/Email
   - Select project settings
   - Deploy!

**Pros:** Excellent for static sites, edge network, free tier
**Cons:** Serverless functions have 10s timeout on free tier (may be tight for ML models)

---

## Option 4: Deploy with Docker to Any Cloud Provider

### For Azure:

```powershell
# Build and push Docker image
docker build -t flood-detection .
docker tag flood-detection YOUR_REGISTRY.azurecr.io/flood-detection
docker push YOUR_REGISTRY.azurecr.io/flood-detection

# Deploy to Azure Container Instances or App Service
az container create --resource-group myResourceGroup --name flood-detection --image YOUR_REGISTRY.azurecr.io/flood-detection --dns-name-label flood-detection --ports 8000
```

### For Google Cloud Run:

```powershell
# Build and deploy
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/flood-detection
gcloud run deploy flood-detection --image gcr.io/YOUR_PROJECT_ID/flood-detection --platform managed --region us-central1 --allow-unauthenticated
```

### For AWS ECS/Fargate:

```powershell
# Push to ECR and deploy via ECS console
aws ecr create-repository --repository-name flood-detection
docker tag flood-detection:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/flood-detection:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/flood-detection:latest
```

---

## Option 5: Deploy to Heroku (Simple but Paid)

### Steps:

1. **Install Heroku CLI:**
   ```powershell
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Create Procfile:**
   Already created (see below)

3. **Deploy:**
   ```powershell
   heroku login
   heroku create flood-detection-india
   git push heroku main
   heroku open
   ```

**Pros:** Simple, reliable
**Cons:** No free tier anymore (starts at $5/month)

---

## Quick Start - Render (Recommended)

**Just 3 steps:**

1. Create a GitHub account and repository
2. Push your code to GitHub
3. Go to Render.com, connect GitHub, and deploy

Your site will be live at: `https://[your-app-name].onrender.com`

---

## Environment Variables (if needed)

For production, you may want to set:
- `FLOOD_AI_ARTIFACT_DIR`: Path to model artifacts
- `PORT`: Server port (usually auto-set by platform)
- `PYTHON_VERSION`: 3.11 or 3.13

---

## Custom Domain Setup

After deployment, you can add a custom domain:

1. **Render:** Settings → Custom Domain → Add your domain
2. **Railway:** Settings → Domains → Add custom domain
3. **Vercel:** Project Settings → Domains → Add

Then update your DNS records to point to the platform's servers.

---

## Monitoring & Logs

- **Render:** View logs in the dashboard
- **Railway:** Logs tab in project
- **Vercel:** Deployments → View logs

---

## Cost Estimates

- **Render Free:** $0 (with sleep after inactivity)
- **Railway Free:** $5/month credit (pay for overages)
- **Vercel Free:** $0 (100GB bandwidth/month)
- **Heroku:** $5-7/month minimum
- **Azure/AWS/GCP:** ~$10-30/month depending on usage

---

## Troubleshooting

### Build fails on Render/Railway:
- Check that `requirements.txt` is present
- Ensure Python version is compatible (3.11+)

### Model files too large:
- Use Git LFS for .pkl files > 100MB
- Or store models in cloud storage (S3/Azure Blob)

### App crashes on startup:
- Check logs for missing dependencies
- Verify model artifacts are included in deployment

---

## Next Steps After Deployment

1. Test all endpoints
2. Set up monitoring (UptimeRobot, Pingdom)
3. Configure SSL certificate (auto on most platforms)
4. Set up analytics (Google Analytics, Plausible)
5. Configure backup strategy for assessment data
