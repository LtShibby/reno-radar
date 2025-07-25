const http = require('http');

// Simple test script to debug TikTok scraping
async function testScraping() {
  const backendUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing TikTok scraping...');
  console.log('Make sure your backend server is running first!');
  console.log('Run: npm start\n');

  const queries = ['kitchen renovation', 'bathroom remodel', 'home renovation'];
  
  for (const query of queries) {
    try {
      console.log(`\n🔍 Testing query: "${query}"`);
      
      const url = `${backendUrl}/api/scrape?query=${encodeURIComponent(query)}`;
      console.log(`Making request to: ${url}`);
      
      // Simple HTTP request using Node.js built-ins
      const response = await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve({ status: res.statusCode, data }));
        });
        req.on('error', reject);
      });
      
      const data = JSON.parse(response.data);
      
      if (data.success) {
        console.log(`✅ Success: Found ${data.totalResults} comments`);
        if (data.comments.length > 0) {
          console.log('Sample comment:', data.comments[0].commentText);
        }
      } else {
        console.log(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('\n🎯 Test complete!');
}

// Run if called directly
if (require.main === module) {
  testScraping();
}

module.exports = testScraping; 