// Quick test to verify comment extraction vs username extraction
function testCommentValidation() {
  console.log('🧪 Testing comment validation logic...\n');
  
  // Test data from your actual results
  const testCases = [
    // These should be rejected as usernames
    { text: 'Vikraman', expected: 'username' },
    { text: 'user4178420625946', expected: 'username' },
    { text: '@IsaShop', expected: 'username' },
    { text: '🌹𝓝.𝔃.𝓑.𝓐××🌹', expected: 'username' },
    { text: 'meng22602260', expected: 'username' },
    
    // These should be rejected as TikTok UI elements
    { text: 'TikTokLog in', expected: 'ui' },
    { text: 'Log in', expected: 'ui' },
    { text: 'For You', expected: 'ui' },
    { text: 'TikTokSearchFor YouExploreFollowingUploadLIVEProfileMoreLog inCompanyProgramTerms & Policies© 2025 TikTok', expected: 'ui' },
    { text: 'For YouExploreFollowingUploadLIVEProfileMore', expected: 'ui' },
    { text: 'Search', expected: 'ui' },
    { text: 'Following', expected: 'ui' },
    { text: 'Upload', expected: 'ui' },
    { text: 'Profile', expected: 'ui' },
    { text: 'Terms & Policies', expected: 'ui' },
    
    // These should be accepted as comments
    { text: 'How much would this cost?', expected: 'comment' },
    { text: 'Love this renovation!', expected: 'comment' },
    { text: 'Can you PM me the details?', expected: 'comment' },
    { text: 'This is amazing work', expected: 'comment' },
    { text: 'Where did you get the tiles from?', expected: 'comment' },
    { text: 'Beautiful! How long did it take?', expected: 'comment' },
    { text: 'I need this for my kitchen', expected: 'comment' },
    { text: 'Wow this looks amazing', expected: 'comment' },
    { text: 'Can you do my bathroom too?', expected: 'comment' }
  ];
  
  // Copy the validation functions from server.js
  function isUsername(text) {
    if (!text || text.length < 2) return true;
    return text.startsWith('@') || 
           text.length < 3 || 
           /^[a-zA-Z0-9._]+$/.test(text) ||
           /^\d+$/.test(text) ||
           text.includes('🌹') || text.includes('××');
  }
  
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
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach(testCase => {
    const isCommentResult = isValidComment(testCase.text);
    
    let actualType;
    if (isCommentResult) {
      actualType = 'comment';
    } else if (isTikTokUIElement(testCase.text)) {
      actualType = 'ui';
    } else if (isUsername(testCase.text)) {
      actualType = 'username';
    } else {
      actualType = 'rejected';
    }
    
    const success = actualType === testCase.expected;
    
    console.log(`${success ? '✅' : '❌'} "${testCase.text}" → ${actualType} (expected: ${testCase.expected})`);
    
    if (success) passed++;
    else failed++;
  });
  
  console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  
  if (failed === 0) {
    console.log('🎉 All tests passed! The comment extraction should now work correctly.');
  } else {
    console.log('⚠️  Some tests failed. The validation logic may need adjustment.');
  }
}

// Run the test
if (require.main === module) {
  testCommentValidation();
}

module.exports = testCommentValidation; 