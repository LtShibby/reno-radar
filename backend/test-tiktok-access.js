const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function testTikTokAccess() {
  console.log('🧪 Testing TikTok access and selectors...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Show browser for manual inspection
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      slowMo: 500
    });
    
    const page = await browser.newPage();
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log('1. Testing TikTok search page...');
    
    // Go to search page
    const searchUrl = 'https://www.tiktok.com/search?q=kitchen%20renovation';
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit more for dynamic content
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take screenshot
    await page.screenshot({ path: 'test_search_page.png', fullPage: true });
    console.log('📸 Search page screenshot saved as test_search_page.png');
    
    // Check what we can find
    const searchPageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        videoLinks: document.querySelectorAll('a[href*="/video/"]').length,
        userLinks: document.querySelectorAll('a[href*="/@"]').length,
        totalLinks: document.querySelectorAll('a').length,
        bodyText: document.body.textContent.substring(0, 300),
        // Look for common search result patterns
        searchResults: document.querySelectorAll('[class*="search"], [class*="result"], [class*="item"]').length,
        // Check for any blocked/error content
        isBlocked: document.body.textContent.includes('blocked') || 
                  document.body.textContent.includes('unavailable') ||
                  document.body.textContent.includes('not available'),
        hasLoginPrompt: document.body.textContent.includes('Log in') || 
                       document.body.textContent.includes('Sign up')
      };
    });
    
    console.log('\n📊 Search page analysis:');
    console.log(JSON.stringify(searchPageInfo, null, 2));
    
    // If we found video links, try visiting one
    if (searchPageInfo.videoLinks > 0) {
      console.log('\n2. Testing video page access...');
      
      const firstVideoLink = await page.evaluate(() => {
        const link = document.querySelector('a[href*="/video/"]');
        return link ? link.href : null;
      });
      
      if (firstVideoLink) {
        console.log(`Visiting: ${firstVideoLink}`);
        await page.goto(firstVideoLink, { waitUntil: 'networkidle2', timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Scroll to load comments
        await page.evaluate(() => {
          for (let i = 0; i < 10; i++) {
            window.scrollBy(0, window.innerHeight);
          }
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        await page.screenshot({ path: 'test_video_page.png', fullPage: true });
        console.log('📸 Video page screenshot saved as test_video_page.png');
        
        const videoPageInfo = await page.evaluate(() => {
          return {
            title: document.title,
            url: window.location.href,
            specificCommentContainers: document.querySelectorAll('div.css-1i7ohvi-DivCommentItemContainer').length,
            anyCommentContainers: document.querySelectorAll('div[class*="CommentItem"], div[class*="CommentContainer"]').length,
            commentTexts: document.querySelectorAll('p[data-e2e="comment-level-1"]').length,
            userLinks: document.querySelectorAll('a[href^="/@"]').length,
            // Sample class names to see patterns
            sampleClasses: Array.from(document.querySelectorAll('div[class*="Comment"]')).slice(0, 5).map(el => el.className)
          };
        });
        
        console.log('\n📊 Video page analysis:');
        console.log(JSON.stringify(videoPageInfo, null, 2));
      }
    } else {
      console.log('\n❌ No video links found on search page');
    }
    
    console.log('\n✅ Test complete! Check the screenshots to see what TikTok is showing.');
    console.log('Press Ctrl+C when you\'re done inspecting the browser window.');
    
    // Keep browser open for manual inspection
    await new Promise(resolve => {
      process.on('SIGINT', () => {
        console.log('\n👋 Closing browser...');
        resolve();
      });
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

if (require.main === module) {
  testTikTokAccess();
}

module.exports = testTikTokAccess; 