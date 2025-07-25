# 🔧 Troubleshooting TikTok Scraping Issues

## 🚨 When You Get 0 Comments and 0 Video Links

This usually means TikTok has changed their DOM structure or is blocking access.

### 📋 **Quick Diagnosis Steps:**

#### **1. Test TikTok Access**
```bash
cd backend
npm run test:tiktok
```
This will:
- Open a visible browser window
- Navigate to TikTok search page  
- Take screenshots of what we see
- Show detailed debug info
- Keep browser open for manual inspection

#### **2. Enable Full Debug Mode**
```bash
cd backend
npm run debug:visual
```
Then try a search from the frontend and watch what happens in the browser.

#### **3. Check Screenshots**
Debug mode saves screenshots to the backend folder:
- `search_page_*.png` - What the search page looks like
- `video_page_*.png` - What individual video pages look like

---

## 🔍 **Common Issues & Fixes:**

### **Issue 1: TikTok Changed Class Names**
**Symptoms:** 0 containers found, 0 comments extracted
**Solution:** Update selectors in `server.js`

Current selectors:
```javascript
// Search page video links
'a[href*="/video/"]'

// Comment containers  
'div.css-1i7ohvi-DivCommentItemContainer'

// Comment text
'p[data-e2e="comment-level-1"]'

// User links
'a[href^="/@"]'
```

### **Issue 2: TikTok Requires Login**
**Symptoms:** Login prompts, blocked content
**Solution:** 
- Try different user agents
- Add cookies/session handling
- Use residential proxies

### **Issue 3: Rate Limiting/IP Blocking**
**Symptoms:** Empty pages, error messages
**Solution:**
- Wait longer between requests
- Rotate user agents
- Use different IP addresses

### **Issue 4: JavaScript Not Loading**
**Symptoms:** Static content only, no dynamic elements
**Solution:**
- Increase wait times
- Try different `waitUntil` strategies
- Add more scrolling/interaction

---

## 🛠️ **Debug Console Output:**

### **Good Output (Working):**
```
Found 3 video links: [https://tiktok.com/@user/video/123, ...]
Processing video: https://tiktok.com/@user/video/123
Strategy 1: Found 12 containers with specific class
Comment text: "Love this renovation!"
Username: "home_lover_2024" (from span)
Profile URL: "https://www.tiktok.com/@home_lover_2024"
✅ Added comment: "home_lover_2024" → "Love this renovation!"
```

### **Bad Output (Broken):**
```
Page debug info: { videoLinks: 0, userLinks: 0, isBlocked: true }
Found 0 video links: []
No video links found. Check the search_page_*.png screenshot
```

---

## 🔄 **Quick Fixes to Try:**

### **1. Update User Agents**
In `server.js`, add newer user agents:
```javascript
const userAgents = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
];
```

### **2. Try Different Search URLs**
```javascript
// Instead of search, try trending or specific hashtags
const searchUrl = 'https://www.tiktok.com/tag/renovation';
const searchUrl = 'https://www.tiktok.com/discover';
```

### **3. Add More Wait Time**
```javascript
// Increase wait times
await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
```

### **4. Update Comment Selectors**
Look for new patterns in screenshots and update:
```javascript
// Try broader selectors
document.querySelectorAll('div[class*="Comment"]')
document.querySelectorAll('[data-e2e*="comment"]')
```

---

## 📞 **When All Else Fails:**

1. **Check TikTok's robots.txt**: https://www.tiktok.com/robots.txt
2. **Try different regions** with VPN
3. **Use TikTok's official API** (if available)
4. **Switch to alternative platforms** (Instagram Reels, YouTube Shorts)

---

## 🎯 **Testing Strategy:**

1. **Run `npm run test:tiktok`** to see what's happening
2. **Check screenshots** to understand TikTok's current structure  
3. **Update selectors** based on what you see
4. **Test with debug mode** to verify changes
5. **Gradually increase complexity** (start with simple text extraction)

Remember: TikTok changes frequently, so expect to update selectors regularly! 🔄 