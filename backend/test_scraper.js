const WebScraper = require('./web_scraper');

// Create scraper instance with optimized settings
const scraper = new WebScraper({
  timeout: 10000,
  maxContentLength: 512 * 1024, // 512KB limit for testing
  maxRedirects: 2
});

async function testScraper() {
  console.log('🚀 Testing the enhanced WebScraper...\n');
  
  // Show scraper capabilities
  console.log('📊 Scraper Statistics:');
  console.log(JSON.stringify(scraper.getStats(), null, 2));
  console.log('\n');

  // Test URLs
  const testUrls = [
    'https://example.com',
    'https://httpbin.org/html', // Simple HTML test
    'invalid-url',
    'https://github.com/features'
  ];

  for (const url of testUrls) {
    console.log(`\n🔍 Testing URL: ${url}`);
    console.log('─'.repeat(50));
    
    // Validate URL first
    const isValid = scraper.isValidUrl(url);
    console.log(`✅ URL Valid: ${isValid}`);
    
    if (!isValid) {
      console.log('❌ Skipping invalid URL\n');
      continue;
    }

    try {
      const startTime = Date.now();
      const result = await scraper.scrapeUrl(url);
      const endTime = Date.now();
      
      console.log(`🎯 Scraping Results:`);
      console.log(`   Title: ${result.title}`);
      console.log(`   Domain: ${result.domain}`);
      console.log(`   Language: ${result.language}`);
      console.log(`   Content Type: ${result.type}`);
      console.log(`   Author: ${result.author || 'Not found'}`);
      console.log(`   Publish Date: ${result.publishDate || 'Not found'}`);
      console.log(`   Word Count: ${result.performance.wordCount}`);
      console.log(`   Reading Time: ${result.performance.readingTime} min`);
      console.log(`   Content Quality: ${result.performance.contentQuality}%`);
      console.log(`   Scraping Time: ${result.performance.scrapingTime}ms`);
      console.log(`   Images Found: ${result.images.length}`);
      console.log(`   Videos Found: ${result.videos.length}`);
      console.log(`   Keywords: ${result.keywords.join(', ') || 'None'}`);
      
      if (result.description) {
        console.log(`   Description: ${result.description.substring(0, 100)}...`);
      }
      
      if (result.content) {
        console.log(`   Content Preview: ${result.content.substring(0, 150)}...`);
      }
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n✅ Test completed!');
}

// Run the test
testScraper().catch(console.error);
