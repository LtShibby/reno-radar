# 🏠 Reno Radar

A lean MVP SaaS app that helps renovation contractors find leads by scraping TikTok comments on videos related to home renovation. The app surfaces comments that indicate high buyer intent and displays them in a table for manual outreach.

## 🔧 Tech Stack

- **Frontend**: Next.js 14 + React + TailwindCSS
- **Backend**: Node.js + Express + Puppeteer (with stealth plugin)
- **Data**: In-memory (no database needed for MVP)
- **Hosting**: Frontend on Vercel; Backend runs locally via Ngrok

## 🚀 Quick Start

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   The backend will run on `http://localhost:3001`

4. Test the health endpoint:
   ```bash
   curl http://localhost:3001/health
   ```

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.local.example .env.local
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

   The frontend will run on `http://localhost:3000`

## 🚀 Deployment

For detailed deployment instructions, see **[DEPLOYMENT.md](DEPLOYMENT.md)**

### Quick Deploy Summary:
1. **Frontend (Vercel):** Set Root Directory to `frontend`
2. **Backend (Local + Ngrok):** Expose via `ngrok http 3001`
3. **Connect:** Set `NEXT_PUBLIC_BACKEND_URL` to Ngrok URL in Vercel

## 📡 API Endpoints

### `GET /api/scrape?query=<term>`

Scrapes TikTok for comments related to the query term.

**Parameters:**
- `query` (string): Search term (e.g., "kitchen renovation")

**Response:**
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

### `GET /health`

Health check endpoint.

## 🎯 Features

- **Search Form**: Enter service type to scan TikTok
- **Results Table**: Display comments with:
  - Clickable TikTok video URLs
  - Comment text
  - Intent scoring (High/Medium/Low)
  - Matched keywords
  - Mark as contacted checkbox
- **Export**: Download results as CSV
- **Responsive**: Mobile-friendly design

## 🔍 Intent Scoring

Comments are automatically scored based on keyword matches:

- **High Intent**: "quote", "how much", "price", "cost", "pm me", "contact", "hire"
- **Medium Intent**: "interested", "need this", "want this", "dm me", "info"
- **Low Intent**: "nice", "love this", "amazing", "cool", "awesome"

## ⚠️ Important Notes

- Runs without TikTok login (public content only)
- Backend must be exposed via Ngrok for production
- Manual review required - no auto-messaging
- Respects TikTok's robots.txt and rate limits

## 🛠️ Development

### Project Structure

```
reno-radar/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # App router pages
│   │   ├── components/ # React components
│   │   └── types/     # TypeScript definitions
│   └── package.json
├── backend/           # Express API
│   ├── server.js      # Main server file
│   └── package.json
└── README.md
```

### Adding New Features

1. **New Intent Keywords**: Update `INTENT_KEYWORDS` in `backend/server.js`
2. **UI Improvements**: Modify components in `frontend/src/components/`
3. **New Endpoints**: Add routes in `backend/server.js`

## 📝 License

MIT License - feel free to modify and distribute.

---

🚀 **Ready to find renovation leads!** Start the backend, then the frontend, and begin scanning TikTok for potential clients. 