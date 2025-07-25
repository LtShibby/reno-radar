# 🚄 Railway Backend Deployment Guide

## **Step 1: Deploy Backend to Railway**

### **A. Create Railway Account & Project**
1. Go to [railway.app](https://railway.app) and sign up
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Connect your GitHub account and select `reno-radar` repo
4. Railway will detect multiple services - **choose the `backend` folder**

### **B. Configure Railway Project**
1. In Railway dashboard, click your project
2. Go to **Settings** → **Environment**
3. Add these environment variables:
   ```
   NODE_ENV=production
   PORT=3001
   ```
4. Optional debugging variables (don't use in production):
   ```
   DEBUG_SCREENSHOTS=false
   DEBUG_HEADLESS=true
   ```

### **C. Deploy**
1. Railway will automatically deploy from your `backend/railway.toml` config
2. Wait for deployment to complete (2-3 minutes)
3. Copy your Railway app URL (something like `https://your-app-name.railway.app`)

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

## **Step 3: Test Full Application**

### **A. Test Backend Health**
Visit: `https://your-railway-app-name.railway.app/health`

Should return:
```json
{"status":"OK","timestamp":"2024-01-20T..."}
```

### **B. Test Scraping API**
Visit: `https://your-railway-app-name.railway.app/api/scrape?query=renovation`

Should return JSON with comments array.

### **C. Test Frontend**
1. Visit your Vercel URL
2. Enter a search query (e.g., "kitchen renovation")
3. Verify it connects to Railway backend and displays results

---

## **Troubleshooting**

### **Railway Issues:**
- **Build fails**: Check `backend/package.json` has all dependencies
- **App crashes**: Check Railway logs in dashboard
- **Timeout errors**: Puppeteer needs time - normal for first requests

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

## **Quick Commands**
```bash
# Test locally first
cd backend && npm start
cd frontend && npm run dev

# Check Railway deployment
curl https://your-railway-app.railway.app/health
``` 