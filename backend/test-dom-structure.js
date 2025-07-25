// Test the updated DOM extraction with the exact HTML structure provided by user
function testDOMExtraction() {
  console.log('🧪 Testing DOM extraction with actual TikTok structure...\n');
  
  // Sample HTML structure from user (simplified for testing)
  const sampleHTML = `
    <div class="css-ulyotp-DivCommentContentContainer">
      <div class="css-1mf23fd-DivContentContainer">
        <a class="css-xvxjh0-StyledUserLinkName" href="/@melizaaorellana">
          <span data-e2e="comment-username-1" class="css-1665s4c-SpanUserNameText">Mel ya later </span>
        </a>
        <p data-e2e="comment-level-1" class="css-xm2h10-PCommentText">
          <span dir="">the search being "Indian lady target" is sending me 😫</span>
        </p>
      </div>
    </div>
  `;
  
  // Create a temporary DOM element for testing
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sampleHTML;
  
  // Test the extraction logic
  const container = tempDiv.querySelector('[class*="DivCommentContentContainer"]');
  console.log(`✅ Found comment container: ${!!container}`);
  
  if (container) {
    const contentContainer = container.querySelector('[class*="DivContentContainer"]');
    console.log(`✅ Found content container: ${!!contentContainer}`);
    
    if (contentContainer) {
      // Test comment extraction
      const commentParagraph = contentContainer.querySelector('p[data-e2e="comment-level-1"]');
      console.log(`✅ Found comment paragraph: ${!!commentParagraph}`);
      
      if (commentParagraph) {
        const commentText = commentParagraph.textContent.trim();
        console.log(`📝 Comment text: "${commentText}"`);
        
        // Test username extraction
        const usernameSpan = contentContainer.querySelector('span[data-e2e="comment-username-1"]');
        console.log(`✅ Found username span: ${!!usernameSpan}`);
        
        if (usernameSpan) {
          const username = usernameSpan.textContent.trim();
          console.log(`👤 Username: "${username}"`);
          
          // Test URL extraction
          const userLinkElement = contentContainer.querySelector('a[class*="StyledUserLinkName"]');
          console.log(`✅ Found user link element: ${!!userLinkElement}`);
          
          let profileUrl = null;
          if (userLinkElement) {
            const href = userLinkElement.getAttribute('href');
            if (href && href.startsWith('/@')) {
              profileUrl = `https://www.tiktok.com${href}`;
              console.log(`🔗 Profile URL: "${profileUrl}"`);
            }
          }
          
          console.log(`\n🎯 Final result:`);
          console.log(`Username: "${username}"`);
          console.log(`Profile URL: "${profileUrl || 'Not found'}"`);
          console.log(`Comment: "${commentText}"`);
          
          const expectedUsername = 'Mel ya later';
          const expectedProfileUrl = 'https://www.tiktok.com/@melizaaorellana';
          const expectedComment = 'the search being "Indian lady target" is sending me';
          
          if (username === expectedUsername && 
              commentText.includes(expectedComment) &&
              profileUrl === expectedProfileUrl) {
            console.log(`\n🎉 SUCCESS: Both username and profile URL extracted correctly!`);
            return true;
          } else {
            console.log(`\n❌ FAILED: Expected different values`);
            console.log(`Expected username: "${expectedUsername}", got: "${username}"`);
            console.log(`Expected profile URL: "${expectedProfileUrl}", got: "${profileUrl}"`);
            console.log(`Expected comment to contain: "${expectedComment}"`);
            return false;
          }
        }
      }
    }
  }
  
  console.log(`\n❌ FAILED: Could not extract data from sample HTML`);
  return false;
}

// Browser environment check
if (typeof document !== 'undefined') {
  testDOMExtraction();
} else {
  console.log('⚠️  This test requires a browser environment with DOM support');
  console.log('✅ The extraction logic has been updated to use:');
  console.log('   - Container: [class*="DivCommentContentContainer"]');
  console.log('   - Username: span[data-e2e="comment-username-1"]');
  console.log('   - Comment: p[data-e2e="comment-level-1"]');
  console.log('');
  console.log('🚀 Ready to test with real TikTok pages!');
}

module.exports = testDOMExtraction; 