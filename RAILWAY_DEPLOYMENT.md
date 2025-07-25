# 🚄 Railway Backend Deployment Guide

## **Step 1: Deploy Backend to Railway**

### **A. Create Railway Account & Project**
1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select `reno-radar` repo
4. **🚨 CRITICAL**: Railway will initially fail because it's a monorepo - this is expected!

### **B. Fix Railway Project Settings**

**🎯 STEP 1: Set Root Directory (MOST IMPORTANT)**
1. In Railway dashboard, click your project
2. Go to **Settings** → **Service Settings** 
3. **Set "Root Directory" to `backend`** ← This is the key fix!
4. Click **Save** - Railway will now find the Dockerfile

**🎯 STEP 2: Add Environment Variables**
1. Still in Settings, go to **Environment** tab
2. Add these environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   DEBUG_HEADLESS=true
   DEBUG_SCREENSHOTS=false
   ```

### **C. Deploy**
1. After setting the Root Directory to `backend`, Railway will **automatically redeploy**
2. Railway will now detect and use `backend/Dockerfile` 
3. Docker ensures all Puppeteer dependencies are properly installed
4. Wait for deployment to complete (3-5 minutes for first build)
5. Copy your Railway app URL (something like `https://your-app-name.railway.app`)

---

## **Step 2: Update Frontend for Production**

### **A. Configure Backend URL in Vercel**
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   ```
   NEXT_PUBLIC_BACKEND_URL=https://your-railway-app-name.railway.app
   ```
4. **Important**: Replace with your actual Railway URL from Step 1C

### **B. Redeploy Frontend**
1. In Vercel dashboard, go to **Deployments**
2. Click **"Redeploy"** on the latest deployment
3. Or push any change to GitHub to trigger auto-deployment

---

## **Step 3: Verify Setup**

### **✅ Quick Checklist:**
- [ ] Root Directory set to `backend` in Railway Service Settings
- [ ] Environment variables added (NODE_ENV, PORT, etc.)
- [ ] Deployment shows "Building..." then "Success"
- [ ] Railway URL is accessible

---

## **Step 4: Test Full Application**

### **A. Test Backend Health**
Visit: `https://your-railway-app-name.railway.app/health`

Should return:
```json
{"status":"OK","timestamp":"2024-01-20T..."}
```

### **B. Test Scraping API**
Visit: `https://your-railway-app-name.railway.app/api/scrape?query=tiles`

Should return JSON with comments array.

### **C. Test Frontend**
1. Visit your Vercel URL
2. Enter a search query (e.g., "kitchen renovation")
3. Verify it connects to Railway backend and displays results

---

## **Troubleshooting**

### **🚨 Monorepo Issues:**
- **"No build plan found"**: Set Root Directory to `backend` in Service Settings
- **Nixpacks confusion**: Solved by Root Directory + Dockerfile detection
- **Initial deployment fails**: Expected behavior - fix with Root Directory setting

### **Railway Issues:**
- **Docker build fails**: Check `backend/Dockerfile` syntax and dependencies
- **Puppeteer crashes**: Fixed with proper Chrome/Chromium dependencies in Docker
- **App crashes**: Check Railway logs in dashboard - Docker provides better error messages
- **Timeout errors**: Puppeteer needs time - normal for first requests (especially with Docker)

### **CORS Issues:**
- Verify Vercel URL is allowed in `backend/server.js` corsOptions
- Check Railway logs for CORS errors

### **Environment Variables:**
- Railway: Set `NODE_ENV=production`
- Vercel: Set `NEXT_PUBLIC_BACKEND_URL=https://your-railway-url`

---

## **Costs**
- **Railway**: Free tier includes 500 hours/month
- **Vercel**: Free tier perfect for this app
- **Total**: $0/month for MVP usage

---

## **Local Docker Testing (Optional)**

Test the Docker build locally before deploying:

```bash
# Build Docker image
cd backend
docker build -t reno-radar-backend .

# Run Docker container
docker run -p 3001:3001 reno-radar-backend

# Test the containerized app
curl http://localhost:3001/health
```

---

## **Quick Commands**
```bash
# Test locally (without Docker)
cd backend && npm start
cd frontend && npm run dev

# Test Docker build locally
cd backend && docker build -t reno-radar-backend .

# Check Railway deployment
curl https://your-railway-app.railway.app/health
``` 