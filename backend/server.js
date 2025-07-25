const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Use stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3001;
const DEBUG_SCREENSHOTS = process.env.DEBUG_SCREENSHOTS === 'true';
const DEBUG_HEADLESS = process.env.DEBUG_HEADLESS !== 'false'; // default to headless

// Middleware
app.use(cors());
app.use(express.json());

// Intent scoring keywords
const INTENT_KEYWORDS = {
  high: ['quote', 'how much', 'price', 'cost', 'pm me', 'contact', 'hire', 'book', 'schedule'],
  medium: ['interested', 'need this', 'want this', 'dm me', 'info', 'details', 'available'],
  low: ['nice', 'love this', 'amazing', 'cool', 'awesome', 'great job']
};

// Function to score comment intent
function scoreComment(commentText) {
  const text = commentText.toLowerCase();
  let score = 'low';
  let matchedKeywords = [];

  // Check for high intent keywords
  for (const keyword of INTENT_KEYWORDS.high) {
    if (text.includes(keyword)) {
      score = 'high';
      matchedKeywords.push(keyword);
    }
  }

  // Check for medium intent keywords if not already high
  if (score !== 'high') {
    for (const keyword of INTENT_KEYWORDS.medium) {
      if (text.includes(keyword)) {
        score = 'medium';
        matchedKeywords.push(keyword);
      }
    }
  }

  // Check for low intent keywords if no other matches
  if (matchedKeywords.length === 0) {
    for (const keyword of INTENT_KEYWORDS.low) {
      if (text.includes(keyword)) {
        matchedKeywords.push(keyword);
      }
    }
  }

  return { score, matchedKeywords };
}

// Helper function to auto-scroll and load comments
async function autoScroll(page, maxScrolls = 10) {
  for (let i = 0; i < maxScrolls; i++) {
    await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Scrape TikTok comments
async function scrapeTikTokComments(query) {
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: DEBUG_HEADLESS,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: DEBUG_HEADLESS ? 0 : 100 // slow down when visible for debugging
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    
    // Search TikTok
    const searchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(query)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for search results to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Get video links (top 3)
    const videoLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/video/"]'));
      return links.slice(0, 3).map(link => link.href);
    });

    console.log(`Found ${videoLinks.length} video links:`, videoLinks);

    if (videoLinks.length === 0) {
      console.log('No video links found. The search page might have different selectors or be blocking.');
      if (DEBUG_SCREENSHOTS) {
        await page.screenshot({ path: `search_page_debug_${Date.now()}.png`, fullPage: true });
      }
    }

    const allComments = [];

    // Visit each video and extract comments
    for (const videoUrl of videoLinks) {
      try {
        console.log(`Processing video: ${videoUrl}`);
        await page.goto(videoUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Auto-scroll to load comments progressively
        await autoScroll(page, 15);

        // Optional: Take screenshot for debugging
        if (DEBUG_SCREENSHOTS) {
          await page.screenshot({ path: `tiktok_debug_${Date.now()}.png`, fullPage: true });
        }

        // Extract comments with improved text targeting
        const comments = await page.evaluate((url) => {
          const comments = [];
          
          // Helper function to check if text looks like a username
          function isUsername(text) {
            if (!text || text.length < 2) return true;
            // Usernames are typically short, have special chars, or start with @
            return text.startsWith('@') || 
                   text.length < 3 || 
                   /^[a-zA-Z0-9._]+$/.test(text) ||
                   /^\d+$/.test(text) ||
                   text.includes('🌹') || text.includes('××');
          }
          
          // Helper function to check if text is TikTok UI elements
          function isTikTokUIElement(text) {
            if (!text) return true;
            
            const uiPatterns = [
              // Navigation and buttons
              /^(For You|Following|Upload|LIVE|Profile|More|Log in|Sign up)$/i,
              /TikTok(Search|Log in|For You)/i,
              /^(Search|Explore|Company|Program|Terms|Policies)/i,
              
              // Footer and copyright
              /© \d{4} TikTok/i,
              /Terms & Policies/i,
              /CompanyProgramTerms/i,
              
              // Combined UI text (when elements get concatenated)
              /^(For YouExplore|ExploreFollowing|FollowingUpload|UploadLIVE|LIVEProfile)/i,
              /SearchFor YouExplore/i,
              /ProfileMoreLog in/i,
              
              // Single word UI elements
              /^(TikTok|Search|Explore|Following|Upload|LIVE|Profile|More)$/i,
              
              // Long concatenated strings
              /.*(For YouExplore|CompanyProgram|Terms & Policies).*/i,
              /.*TikTokSearch.*Log in.*/i
            ];
            
            return uiPatterns.some(pattern => pattern.test(text));
          }
          
          // Helper function to check if text is likely a real comment
          function isValidComment(text) {
            if (!text || text.length < 5) return false;
            if (isUsername(text)) return false;
            if (isTikTokUIElement(text)) return false;
            
            // Real comments usually have spaces, punctuation, or common words
            const hasNaturalLanguage = text.includes(' ') || 
                                     text.includes('?') || 
                                     text.includes('!') || 
                                     text.includes('.') ||
                                     /\b(how|what|where|when|why|love|like|nice|great|cost|price|much|this|that|can|will|would|could|should)\b/i.test(text);
            
            // Additional checks for comment-like content
            const hasCommentCharacteristics = 
              // Has sentence structure
              /\b\w+\s+\w+\b/.test(text) ||
              // Has questions or exclamations
              /[?!]/.test(text) ||
              // Has common comment words
              /\b(love|hate|like|want|need|get|see|look|think|feel|know|wow|omg|lol)\b/i.test(text) ||
              // Has emotional expressions
              /\b(amazing|beautiful|gorgeous|awesome|terrible|bad|good|best|worst)\b/i.test(text);
            
            return hasNaturalLanguage && hasCommentCharacteristics && text.length < 500;
          }
          
          // Strategy 1: Follow the exact DOM path provided by user
          // css-dwvbgc-DivCommentMain > DivCommentListContainer > DivCommentObjectWrapper
          let mainCommentContainer = document.querySelector('.css-dwvbgc-DivCommentMain');
          
          console.log(`Found main comment container: ${!!mainCommentContainer}`);
          
          let commentWrappers = [];
          if (mainCommentContainer) {
            // Look for DivCommentListContainer
            const listContainer = mainCommentContainer.querySelector('[class*="DivCommentListContainer"]');
            console.log(`Found list container: ${!!listContainer}`);
            
            if (listContainer) {
              // Get all DivCommentObjectWrapper elements
              commentWrappers = Array.from(listContainer.querySelectorAll('[class*="DivCommentObjectWrapper"]'));
              console.log(`Found ${commentWrappers.length} comment object wrappers`);
            }
          }
          
          // Strategy 2: Fallback - broader search for comment containers
          if (commentWrappers.length === 0) {
            console.log('Fallback: searching for comment wrappers broadly');
            commentWrappers = Array.from(document.querySelectorAll('[class*="DivCommentObjectWrapper"], [class*="CommentObjectWrapper"]'));
            console.log(`Fallback found ${commentWrappers.length} comment wrappers`);
          }
          
          // Extract from comment wrappers following the exact DOM path
          for (let i = 0; i < Math.min(20, commentWrappers.length); i++) {
            const wrapper = commentWrappers[i];
            console.log(`\n--- Processing comment wrapper ${i + 1} ---`);
            
            // Follow the exact path: DivCommentObjectWrapper > DivCommentItemWrapper > DivCommentContentWrapper > comment-level-1 > p
            const itemWrapper = wrapper.querySelector('[class*="DivCommentItemWrapper"]');
            console.log(`Found item wrapper: ${!!itemWrapper}`);
            
            if (!itemWrapper) continue;
            
            const contentWrapper = itemWrapper.querySelector('[class*="DivCommentContentWrapper"]');
            console.log(`Found content wrapper: ${!!contentWrapper}`);
            
            if (!contentWrapper) continue;
            
            const commentLevel = contentWrapper.querySelector('.comment-level-1, [class*="comment-level-1"]');
            console.log(`Found comment-level-1: ${!!commentLevel}`);
            
            if (!commentLevel) continue;
            
            // Get the paragraph with the actual comment text
            const commentParagraph = commentLevel.querySelector('p');
            console.log(`Found comment paragraph: ${!!commentParagraph}`);
            
            if (!commentParagraph) continue;
            
            const commentText = commentParagraph.textContent.trim();
            console.log(`Raw comment text: "${commentText}"`);
            
            // Look for username in the wrapper (usually in a different section)
            let username = 'Unknown';
            const usernameSelectors = [
              '[data-e2e="comment-username"]',
              'a[href*="@"]', 
              '[class*="username"]',
              'a', 
              'strong'
            ];
            
            for (const selector of usernameSelectors) {
              const usernameEl = wrapper.querySelector(selector);
              if (usernameEl && usernameEl.textContent.trim()) {
                const potentialUsername = usernameEl.textContent.trim();
                if (potentialUsername !== commentText) {
                  username = potentialUsername;
                  break;
                }
              }
            }
            
            console.log(`Username: "${username}"`);
            
            // Validate the comment
            if (isValidComment(commentText)) {
              comments.push({
                videoUrl: url,
                commentText: commentText,
                username: username
              });
              console.log(`✅ Added comment: "${commentText.substring(0, 100)}..."`);
            } else {
              console.log(`❌ Rejected comment: failed validation`);
            }
          }
          
          // Strategy 3: Direct search for comment-level-1 elements with paragraphs
          if (comments.length === 0) {
            console.log('Using direct comment-level-1 search strategy');
            const commentElements = document.querySelectorAll('.comment-level-1, [class*="comment-level-1"]');
            console.log(`Found ${commentElements.length} comment-level-1 elements directly`);
            
            for (let i = 0; i < Math.min(15, commentElements.length); i++) {
              const el = commentElements[i];
              
              // Look for paragraph inside comment-level-1 (following the exact structure)
              const paragraph = el.querySelector('p');
              if (paragraph) {
                const text = paragraph.textContent.trim();
                console.log(`Direct comment text from p: "${text.substring(0, 50)}..."`);
                
                if (isValidComment(text)) {
                  comments.push({
                    videoUrl: url,
                    commentText: text,
                    username: 'Unknown'
                  });
                  console.log(`✅ Added direct comment: "${text.substring(0, 50)}..."`);
                }
              } else {
                // Fallback to element text if no paragraph
                const text = el.textContent.trim();
                console.log(`Direct comment text: "${text.substring(0, 50)}..."`);
                
                if (isValidComment(text)) {
                  comments.push({
                    videoUrl: url,
                    commentText: text,
                    username: 'Unknown'
                  });
                  console.log(`✅ Added direct comment: "${text.substring(0, 50)}..."`);
                }
              }
            }
          }
          
          // Strategy 4: Final fallback - Look for any paragraph with TUXText class (like the example)
          if (comments.length === 0) {
            console.log('Using TUXText paragraph search strategy');
            const tuxTextElements = document.querySelectorAll('p.TUXText, p[class*="TUXText"], p[class*="StyledTUXText"]');
            console.log(`Found ${tuxTextElements.length} TUXText paragraphs`);
            
            for (let i = 0; i < Math.min(15, tuxTextElements.length); i++) {
              const el = tuxTextElements[i];
              const text = el.textContent.trim();
              console.log(`TUXText paragraph: "${text.substring(0, 50)}..."`);
              
              if (isValidComment(text) && text.length < 300) {
                comments.push({
                  videoUrl: url,
                  commentText: text,
                  username: 'Unknown'
                });
                console.log(`✅ Added TUXText comment: "${text.substring(0, 50)}..."`);
                
                if (comments.length >= 10) break;
              }
            }
          }
          
          // Strategy 5: Final fallback - Look for any valid text
          if (comments.length === 0) {
            console.log('Using final fallback strategy - looking for any valid text');
            const allTextElements = document.querySelectorAll('p, span, div');
            
            for (let i = 0; i < Math.min(50, allTextElements.length); i++) {
              const el = allTextElements[i];
              const text = el.textContent.trim();
              
              if (isValidComment(text) && text.length < 300) {
                comments.push({
                  videoUrl: url,
                  commentText: text,
                  username: 'Unknown'
                });
                
                if (comments.length >= 10) break;
              }
            }
          }
          
          console.log(`Extracted ${comments.length} valid comments`);
          return comments.slice(0, 15); // Limit to 15 comments per video
        }, videoUrl);

        console.log(`Extracted ${comments.length} comments from ${videoUrl}`);
        allComments.push(...comments);
      } catch (error) {
        console.log(`Error processing video ${videoUrl}:`, error.message);
      }
    }

    return allComments;
  } catch (error) {
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// API Routes
app.get('/api/scrape', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    console.log(`Starting scrape for query: ${query}`);
    
    const comments = await scrapeTikTokComments(query);
    
    // Score each comment
    const scoredComments = comments.map(comment => {
      const { score, matchedKeywords } = scoreComment(comment.commentText);
      return {
        ...comment,
        intentScore: score,
        matchedKeywords
      };
    });

    // Sort by intent score (high -> medium -> low)
    const scoreOrder = { high: 3, medium: 2, low: 1 };
    scoredComments.sort((a, b) => scoreOrder[b.intentScore] - scoreOrder[a.intentScore]);

    console.log(`Found ${scoredComments.length} comments`);
    
    res.json({
      success: true,
      query,
      totalResults: scoredComments.length,
      comments: scoredComments
    });
    
  } catch (error) {
    console.error('Scrape error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to scrape TikTok comments',
      details: error.message 
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Reno Radar backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Scrape endpoint: http://localhost:${PORT}/api/scrape?query=renovation`);
}); 