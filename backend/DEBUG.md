# 🔍 Debug Guide: TikTok Scraping

## Quick Test Commands

### 1. **Start Backend** (Terminal 1)
```bash
cd backend
npm start
```

### 2. **Test Individual Endpoint** (Terminal 2)
```bash
# Test health
curl http://localhost:3001/health

# Test scraping
curl "http://localhost:3001/api/scrape?query=kitchen%20renovation"
```

### 3. **Run Test Script** (Terminal 2)
```bash
cd backend
node test-scraping.js
```

---

## 🐛 Enable Debug Mode

### Screenshots & Enhanced Logging
```bash
# Windows PowerShell
$env:DEBUG_SCREENSHOTS = "true"
npm start

# Linux/Mac
DEBUG_SCREENSHOTS=true npm start

# Or use the npm script:
npm run debug
```

### Visual Debugging (Non-Headless)
```bash
# See the browser in action
npm run debug:visual

# Manual environment variables:
# Windows PowerShell
$env:DEBUG_SCREENSHOTS = "true"
$env:DEBUG_HEADLESS = "false"
npm start
```

This will:
- Save screenshots of TikTok pages to help debug DOM issues
- Show detailed logging of what selectors are finding
- Open visible browser windows (when DEBUG_HEADLESS=false)

---

## 📊 What to Look For

### ✅ **Success Indicators**
```
Found 3 video links: [urls...]
Processing video: https://tiktok.com/@user/video/123
Found 15 comment elements using selectors
Extracted 12 comments from [url]
Found 25 comments
```

### ❌ **Problem Indicators**
```
Found 0 video links
Found 0 comment elements using selectors
Extracted 0 comments from [url]
```

---

## 🛠️ Troubleshooting Steps

### **Issue: No Video Links Found**
1. Enable `DEBUG_SCREENSHOTS=true`
2. Check `search_page_debug_*.png` 
3. TikTok may be showing different selectors or blocking

**Fix:** Update video link selector in `server.js`:
```js
// Try these alternatives:
document.querySelectorAll('a[href*="@"]')
document.querySelectorAll('div[data-e2e="search_top-item"] a')
```

### **Issue: No Comments Found**
1. Check `tiktok_debug_*.png` screenshots
2. Look for actual comment elements in the DOM
3. Comments might be in shadow DOM or different selectors

**Fix:** The code already has 5 fallback strategies, but you can add more:
```js
// Add to the selector strategies:
commentElements = document.querySelectorAll('div[class*="comment"]');
commentElements = document.querySelectorAll('[aria-label*="comment"]');
```

### **Issue: TikTok Blocking Requests**
- Use different user agents
- Add random delays
- Consider using residential proxies

---

## 🔧 Quick Fixes to Try

### 1. **Increase Scroll Depth**
In `server.js`, change:
```js
await autoScroll(page, 25); // was 15
```

### 2. **Add More Wait Time**
```js
await new Promise(resolve => setTimeout(resolve, 5000)); // was 3000
```

### 3. **Try Non-Headless Mode**
```js
browser = await puppeteer.launch({ 
  headless: false, // See what's happening
  args: ['--no-sandbox', '--disable-setuid-sandbox']
});
```

---

## 📋 Expected Output

**Successful scrape should show:**
```json
{
  "success": true,
  "query": "kitchen renovation",
  "totalResults": 15,
  "comments": [
    {
      "videoUrl": "https://tiktok.com/@user/video/123",
      "commentText": "How much would this cost?",
      "username": "potential_client",
      "intentScore": "high",
      "matchedKeywords": ["how much", "cost"]
    }
  ]
}
```

---

## 🚨 Common TikTok Changes

TikTok frequently updates their selectors. If scraping stops working:

1. **Check console logs** for what selectors are failing
2. **Take screenshots** to see actual page structure  
3. **Update selectors** in the multiple fallback strategies
4. **Consider rate limiting** - TikTok may temporarily block rapid requests

The current implementation has 5 fallback strategies, so it should be resilient to most changes! 