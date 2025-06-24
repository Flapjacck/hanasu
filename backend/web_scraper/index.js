const axios = require('axios');
const cheerio = require('cheerio');

class WebScraper {
  constructor() {
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
  }

  /**
   * Scrape content from a URL
   * @param {string} url - The URL to scrape
   * @returns {Promise<Object>} - Scraped content object
   */
  async scrapeUrl(url) {
    try {
      // Validate URL
      const urlObj = new URL(url);
      
      // Make HTTP request
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive',
        },
        timeout: 30000, // 30 second timeout
        maxRedirects: 5
      });

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: Failed to fetch content`);
      }

      // Parse HTML
      const $ = cheerio.load(response.data);
      
      // Extract metadata
      const title = this.extractTitle($);
      const description = this.extractDescription($);
      const content = this.extractMainContent($);
      const author = this.extractAuthor($);
      const publishDate = this.extractPublishDate($);

      return {
        url,
        title,
        description,
        content,
        author,
        publishDate,
        wordCount: content.split(/\s+/).length,
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }

  /**
   * Extract page title
   */
  extractTitle($) {
    return $('title').first().text().trim() ||
           $('h1').first().text().trim() ||
           $('meta[property="og:title"]').attr('content') ||
           'Untitled';
  }

  /**
   * Extract page description
   */
  extractDescription($) {
    return $('meta[name="description"]').attr('content') ||
           $('meta[property="og:description"]').attr('content') ||
           $('meta[name="twitter:description"]').attr('content') ||
           '';
  }

  /**
   * Extract main content from the page
   */
  extractMainContent($) {
    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share, .comments').remove();
    
    // Try different content selectors in order of preference
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.content',
      'main',
      '.post-body',
      '.story-body'
    ];

    let content = '';
    
    for (const selector of contentSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        content = element.text().trim();
        if (content.length > 100) { // Ensure we have substantial content
          break;
        }
      }
    }

    // Fallback: extract all paragraph text
    if (!content || content.length < 100) {
      content = $('p').map((i, el) => $(el).text().trim()).get().join(' ');
    }

    // Clean up the content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
      .trim();

    return content;
  }

  /**
   * Extract author information
   */
  extractAuthor($) {
    return $('meta[name="author"]').attr('content') ||
           $('meta[property="article:author"]').attr('content') ||
           $('.author').first().text().trim() ||
           $('.byline').first().text().trim() ||
           '';
  }

  /**
   * Extract publish date
   */
  extractPublishDate($) {
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="publication_date"]',
      'time[datetime]',
      '.published-date',
      '.post-date'
    ];

    for (const selector of dateSelectors) {
      const element = $(selector);
      if (element.length > 0) {
        return element.attr('content') || element.attr('datetime') || element.text().trim();
      }
    }

    return '';
  }

  /**
   * Validate if URL is scrapeable
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
}

module.exports = WebScraper;
