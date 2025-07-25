# 🚀 Deployment Guide

## Frontend Deployment (Vercel)

### Step 1: Fix Vercel Root Directory

The error you encountered happens because Vercel looks for Next.js in the root directory, but our app is in the `frontend` folder.

**Fix in Vercel Dashboard:**
1. Go to your Vercel project settings
2. Navigate to "General" → "Root Directory"
3. Set Root Directory to: `frontend`
4. Click "Save"
5. Redeploy the project

### Step 2: Environment Variables

Add this environment variable in Vercel:

**Key:** `NEXT_PUBLIC_BACKEND_URL`  
**Value:** `https://your-ngrok-url.ngrok.io` (see backend setup below)

---

## Backend Deployment (Local + Ngrok)

### Step 1: Start Backend Locally

```bash
cd backend
npm start
```

Backend runs on `http://localhost:3001`

### Step 2: Expose Backend with Ngrok

1. **Install Ngrok:** https://ngrok.com/download
2. **Create account and get auth token**
3. **Expose backend:**
   ```bash
   ngrok http 3001
   ```
4. **Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### Step 3: Update Frontend Environment Variable

In Vercel dashboard:
1. Go to project settings → Environment Variables
2. Update `NEXT_PUBLIC_BACKEND_URL` to your Ngrok URL
3. Redeploy frontend

---

## 🔧 Complete Setup Checklist

### ✅ **Frontend (Vercel)**
- [ ] Set Root Directory to `frontend`
- [ ] Add `NEXT_PUBLIC_BACKEND_URL` environment variable
- [ ] Deploy successfully

### ✅ **Backend (Local)**
- [ ] Backend running on `localhost:3001`
- [ ] Ngrok exposing backend publicly
- [ ] Test scraping endpoint: `https://your-ngrok-url.ngrok.io/api/scrape?query=test`

### ✅ **Integration Test**
- [ ] Frontend can call backend through Ngrok
- [ ] Search functionality works end-to-end
- [ ] Comments are properly extracted and displayed

---

## 🛠️ Troubleshooting

### **Frontend Won't Build**
- Ensure Root Directory is set to `frontend` in Vercel
- Check that `frontend/package.json` exists and has Next.js dependency

### **Backend Connection Fails**
- Verify Ngrok is running and URL is correct
- Check CORS settings in backend
- Ensure environment variable is set in Vercel

### **No Comments Found**
- Check backend logs for TikTok selectors
- Use debug mode: `npm run debug:visual`
- TikTok may have changed their DOM structure

---

## 📱 Testing Your Deployment

1. **Visit your Vercel URL**
2. **Try searching for:** "kitchen renovation"
3. **Check that comments appear** (not UI elements)
4. **Test CSV export functionality**
5. **Verify responsive design on mobile**

---

## 🔄 Development Workflow

### Making Changes:
1. **Frontend changes:** Push to GitHub → Auto-deploy to Vercel
2. **Backend changes:** Restart local server (Ngrok URL stays same)
3. **Environment changes:** Update in Vercel dashboard → Redeploy

### Monitoring:
- **Frontend:** Vercel dashboard for deployment logs
- **Backend:** Local terminal for API logs
- **Ngrok:** Ngrok dashboard for request monitoring 