# Enhanced WebScraper v2.0

## Overview

The WebScraper has been significantly enhanced to be more **lightweight** and **detailed**. The new version provides comprehensive content extraction with optimized performance and extensive metadata.

## Key Improvements

### 🚀 Lightweight Features

- **Reduced HTTP Overhead**: Optimized request headers and timeout settings
- **Memory Efficient**: Content length limits and streaming capabilities
- **Faster Processing**: Parallel extraction and reduced parsing time
- **Smart Content Detection**: Advanced scoring algorithm for main content
- **Error Resilience**: Better error handling with specific error types

### 📊 Detailed Extraction

- **Rich Metadata**: Domain, language, content type, canonical URLs
- **Media Detection**: Images and videos with metadata
- **Performance Metrics**: Scraping time, word count, reading time estimates
- **Content Quality Scoring**: Algorithm-based quality assessment (0-100)
- **Enhanced Date Parsing**: Multiple date format support
- **Author Detection**: Multiple strategies for author identification
- **SEO Data**: Keywords, descriptions, and Open Graph metadata

## Configuration Options

```javascript
const scraper = new WebScraper({
  timeout: 15000,              // Request timeout (default: 15s)
  maxContentLength: 1024 * 1024, // Max content size (default: 1MB)
  maxRedirects: 3,             // Max redirects (default: 3)
  userAgent: 'Custom UA'       // Custom user agent (optional)
});
```

## Enhanced Response Format

```javascript
{
  url: "https://example.com",
  title: "Page Title",
  description: "Page description",
  content: "Main content text...",
  author: "Author Name",
  publishDate: "2025-06-25T10:00:00.000Z",
  
  // Rich metadata
  domain: "example.com",
  language: "en",
  keywords: ["keyword1", "keyword2"],
  canonical: "https://example.com/canonical",
  type: "article",
  
  // Media assets
  images: [
    {
      url: "https://example.com/image.jpg",
      alt: "Image description",
      width: "300",
      height: "200"
    }
  ],
  videos: ["https://youtube.com/embed/..."],
  
  // Performance analytics
  performance: {
    scrapingTime: 1250,        // Time taken to scrape (ms)
    wordCount: 845,            // Number of words
    readingTime: 5,            // Estimated reading time (minutes)
    contentQuality: 85         // Quality score (0-100)
  },
  
  scrapedAt: "2025-06-25T10:00:00.000Z"
}
```

## New API Endpoints

### GET /api/scrape/stats

Get scraper capabilities and configuration:

```bash
curl http://localhost:3001/api/scrape/stats
```

### POST /api/scrape/validate

Validate a URL without scraping:

```bash
curl -X POST http://localhost:3001/api/scrape/validate \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Enhanced /api/scrape/url

The main scraping endpoint now returns detailed metadata and performance metrics.

## Content Quality Scoring

The scraper includes an intelligent content quality scoring system:

- **Length Score** (0-50): Based on word count
- **Structure Score** (0-20): Sentence and paragraph structure
- **Formatting Score** (0-15): Proper capitalization and formatting
- **Threshold Score** (0-15): Minimum content requirements

## Performance Optimizations

1. **Parallel Processing**: Metadata extraction runs in parallel
2. **Smart Content Detection**: Advanced algorithm to identify main content
3. **Reduced Memory Usage**: Content limits and efficient parsing
4. **Faster Network Requests**: Optimized headers and reduced timeouts
5. **Improved Error Handling**: Specific error types for better debugging

## Usage Examples

### Basic Scraping

```javascript
const scraper = new WebScraper();
const result = await scraper.scrapeUrl('https://example.com');
console.log(`Quality: ${result.performance.contentQuality}%`);
```

### Performance Monitoring

```javascript
const startTime = Date.now();
const result = await scraper.scrapeUrl(url);
console.log(`Scraping took: ${result.performance.scrapingTime}ms`);
console.log(`Reading time: ${result.performance.readingTime} minutes`);
```

### Content Analysis

```javascript
const result = await scraper.scrapeUrl(url);
if (result.performance.contentQuality > 70) {
  console.log('High-quality content detected');
  console.log(`Images: ${result.images.length}`);
  console.log(`Language: ${result.language}`);
  console.log(`Type: ${result.type}`);
}
```

## Testing

Run the test script to see the scraper in action:

```bash
node test_scraper.js
```

This will demonstrate all the new features with various test URLs and show detailed extraction results.

## Blocked Content

The scraper automatically avoids:

- Non-HTML file types (PDF, DOC, etc.)
- Local/localhost URLs
- Malformed URLs
- Content exceeding size limits

## Error Handling

Enhanced error messages with context:

- Network timeouts with timing information
- Content quality issues with metrics
- Validation failures with specific reasons
- Performance bottlenecks with timing data
