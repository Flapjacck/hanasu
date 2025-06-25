const axios = require('axios');
const cheerio = require('cheerio');

class WebScraper {
  constructor(options = {}) {
    this.userAgent = options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';
    this.timeout = options.timeout || 15000; // Reduced from 30s for faster response
    this.maxContentLength = options.maxContentLength || 1024 * 1024; // 1MB limit
    this.maxRedirects = options.maxRedirects || 3; // Reduced redirects
  }

  /**
   * Scrape content from a URL with lightweight and detailed extraction
   * @param {string} url - The URL to scrape
   * @param {Object} options - Additional options for scraping
   * @returns {Promise<Object>} - Scraped content object
   */
  async scrapeUrl(url, options = {}) {
    const startTime = Date.now();
    
    try {
      // Validate URL first (lightweight check)
      if (!this.isValidUrl(url)) {
        throw new Error('Invalid URL provided');
      }
      
      // Make optimized HTTP request
      const response = await axios.get(url, {
        headers: {
          'User-Agent': this.userAgent,
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
        },
        timeout: this.timeout,
        maxRedirects: this.maxRedirects,
        maxContentLength: this.maxContentLength,
        responseType: 'text',
        validateStatus: (status) => status < 400 // Accept redirects
      });

      // Parse HTML with optimized settings
      const $ = cheerio.load(response.data, {
        normalizeWhitespace: true,
        decodeEntities: true
      });
      
      // Extract all data in parallel for better performance
      const [
        title,
        description,
        content,
        author,
        publishDate,
        metadata
      ] = await Promise.all([
        this.extractTitle($),
        this.extractDescription($),
        this.extractMainContent($),
        this.extractAuthor($),
        this.extractPublishDate($),
        this.extractMetadata($, url)
      ]);

      const processedContent = this.processContent(content);
      const scrapingTime = Date.now() - startTime;

      return {
        url,
        title,
        description,
        content: processedContent.text,
        author,
        publishDate,
        ...metadata,
        performance: {
          scrapingTime,
          wordCount: processedContent.wordCount,
          readingTime: processedContent.readingTime,
          contentQuality: processedContent.quality
        },
        scrapedAt: new Date().toISOString()
      };

    } catch (error) {
      const scrapingTime = Date.now() - startTime;
      throw new Error(`Scraping failed after ${scrapingTime}ms: ${error.message}`);
    }
  }

  /**
   * Extract page title with fallback chain
   */
  extractTitle($) {
    const selectors = [
      'meta[property="og:title"]',
      'meta[name="twitter:title"]',
      'title',
      'h1',
      '.entry-title',
      '.post-title',
      '.article-title'
    ];

    for (const selector of selectors) {
      const text = $(selector).first().attr('content') || $(selector).first().text().trim();
      if (text && text.length > 0) {
        return text.substring(0, 200); // Limit title length
      }
    }
    
    return 'Untitled';
  }

  /**
   * Extract page description with multiple sources
   */
  extractDescription($) {
    const selectors = [
      'meta[name="description"]',
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="summary"]',
      '.excerpt',
      '.summary'
    ];

    for (const selector of selectors) {
      const text = $(selector).first().attr('content') || $(selector).first().text().trim();
      if (text && text.length > 10) {
        return text.substring(0, 500); // Limit description length
      }
    }
    
    return '';
  }

  /**
   * Extract main content with improved algorithm
   */
  extractMainContent($) {
    // Remove unwanted elements more aggressively
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .social-share, .comments, .sidebar, .menu, .navigation, iframe, object, embed').remove();
    
    // Content selectors prioritized by likelihood of containing main content
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.post-content',
      '.entry-content',
      '.article-content',
      '.article-body',
      '.content',
      'main',
      '.post-body',
      '.story-body',
      '.text-content',
      '#content'
    ];

    let bestContent = '';
    let maxScore = 0;
    
    // Score each potential content area
    for (const selector of contentSelectors) {
      const elements = $(selector);
      elements.each((i, element) => {
        const $el = $(element);
        const text = $el.text().trim();
        const paragraphs = $el.find('p').length;
        const links = $el.find('a').length;
        const images = $el.find('img').length;
        
        // Scoring algorithm based on content characteristics
        let score = text.length * 0.1; // Base score from text length
        score += paragraphs * 50; // Bonus for paragraphs
        score -= links * 10; // Penalty for too many links (navigation)
        score += Math.min(images * 20, 100); // Bonus for images (capped)
        
        if (score > maxScore && text.length > 100) {
          maxScore = score;
          bestContent = text;
        }
      });
    }

    // Fallback: extract from paragraphs if no main content found
    if (!bestContent || bestContent.length < 200) {
      const paragraphs = $('p').map((i, el) => $(el).text().trim()).get();
      bestContent = paragraphs
        .filter(p => p.length > 20) // Filter out short paragraphs
        .join(' ');
    }

    return bestContent;
  }

  /**
   * Extract author information with multiple strategies
   */
  extractAuthor($) {
    const authorSelectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      'meta[name="twitter:creator"]',
      '.author',
      '.byline',
      '.author-name',
      '.post-author',
      '[rel="author"]',
      '.writer'
    ];

    for (const selector of authorSelectors) {
      const author = $(selector).first().attr('content') || $(selector).first().text().trim();
      if (author && author.length > 0 && author.length < 100) {
        return author.replace(/^by\s+/i, '').trim(); // Remove "by" prefix
      }
    }
    
    return '';
  }

  /**
   * Extract publish date with improved parsing
   */
  extractPublishDate($) {
    const dateSelectors = [
      'meta[property="article:published_time"]',
      'meta[name="publication_date"]',
      'meta[name="date"]',
      'time[datetime]',
      'time[pubdate]',
      '.published-date',
      '.post-date',
      '.date',
      '.publish-date'
    ];

    for (const selector of dateSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const dateStr = element.attr('content') || 
                       element.attr('datetime') || 
                       element.attr('title') ||
                       element.text().trim();
        
        if (dateStr) {
          const date = this.parseDate(dateStr);
          if (date) return date;
        }
      }
    }

    return '';
  }

  /**
   * Parse date string to ISO format
   */
  parseDate(dateStr) {
    try {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1990) {
        return date.toISOString();
      }
    } catch (e) {
      // Try common date patterns
      const patterns = [
        /(\d{4})-(\d{2})-(\d{2})/,
        /(\d{2})\/(\d{2})\/(\d{4})/,
        /(\w+)\s+(\d{1,2}),?\s+(\d{4})/
      ];
      
      for (const pattern of patterns) {
        const match = dateStr.match(pattern);
        if (match) {
          try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
    return null;
  }

  /**
   * Extract detailed metadata
   */
  extractMetadata($, url) {
    const urlObj = new URL(url);
    
    return {
      domain: urlObj.hostname,
      language: this.extractLanguage($),
      keywords: this.extractKeywords($),
      images: this.extractImages($, url),
      videos: this.extractVideos($),
      canonical: this.extractCanonical($),
      type: this.extractContentType($)
    };
  }

  /**
   * Extract page language
   */
  extractLanguage($) {
    return $('html').attr('lang') || 
           $('meta[http-equiv="content-language"]').attr('content') || 
           $('meta[name="language"]').attr('content') || 
           'en';
  }

  /**
   * Extract keywords
   */
  extractKeywords($) {
    const keywords = $('meta[name="keywords"]').attr('content');
    if (keywords) {
      return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0);
    }
    return [];
  }

  /**
   * Extract image URLs
   */
  extractImages($, baseUrl) {
    const images = [];
    const seen = new Set();
    
    $('img').each((i, el) => {
      const src = $(el).attr('src') || $(el).attr('data-src');
      if (src && !seen.has(src)) {
        seen.add(src);
        try {
          const fullUrl = new URL(src, baseUrl).href;
          images.push({
            url: fullUrl,
            alt: $(el).attr('alt') || '',
            width: $(el).attr('width') || null,
            height: $(el).attr('height') || null
          });
        } catch (e) {
          // Skip invalid URLs
        }
      }
    });
    
    return images.slice(0, 10); // Limit to first 10 images
  }

  /**
   * Extract video URLs
   */
  extractVideos($) {
    const videos = [];
    $('video source, iframe[src*="youtube"], iframe[src*="vimeo"]').each((i, el) => {
      const src = $(el).attr('src');
      if (src) {
        videos.push(src);
      }
    });
    return videos;
  }

  /**
   * Extract canonical URL
   */
  extractCanonical($) {
    return $('link[rel="canonical"]').attr('href') || '';
  }

  /**
   * Extract content type
   */
  extractContentType($) {
    const ogType = $('meta[property="og:type"]').attr('content');
    if (ogType) return ogType;
    
    // Infer from structure
    if ($('article').length > 0) return 'article';
    if ($('.product, [itemtype*="Product"]').length > 0) return 'product';
    if ($('.recipe, [itemtype*="Recipe"]').length > 0) return 'recipe';
    
    return 'webpage';
  }

  /**
   * Process and analyze content
   */
  processContent(content) {
    if (!content) return { text: '', wordCount: 0, readingTime: 0, quality: 0 };
    
    // Clean up the content
    const cleanContent = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
      .trim();

    const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 wpm
    
    // Calculate content quality score (0-100)
    let quality = 0;
    quality += Math.min(wordCount / 10, 50); // Length score (max 50)
    quality += cleanContent.split('.').length > 5 ? 20 : 0; // Sentence structure
    quality += cleanContent.match(/[A-Z][a-z]+/g) ? 15 : 0; // Proper capitalization
    quality += wordCount > 100 ? 15 : 0; // Minimum content threshold
    
    return {
      text: cleanContent,
      wordCount,
      readingTime,
      quality: Math.min(Math.round(quality), 100)
    };
  }

  /**
   * Validate if URL is scrapeable with detailed checks
   */
  isValidUrl(url) {
    try {
      const urlObj = new URL(url);
      
      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        return false;
      }
      
      // Check for common non-scrapeable domains
      const blockedDomains = [
        'localhost',
        '127.0.0.1',
        '0.0.0.0'
      ];
      
      if (blockedDomains.some(domain => urlObj.hostname.includes(domain))) {
        return false;
      }
      
      // Check for file extensions that aren't HTML
      const path = urlObj.pathname.toLowerCase();
      const nonHtmlExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar', '.exe', '.dmg'];
      if (nonHtmlExtensions.some(ext => path.endsWith(ext))) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get scraper statistics and health check
   */
  getStats() {
    return {
      version: '2.0.0',
      features: [
        'Lightweight HTTP requests',
        'Detailed metadata extraction',
        'Content quality scoring',
        'Reading time estimation',
        'Image and video detection',
        'Multi-language support',
        'Performance monitoring'
      ],
      limits: {
        timeout: this.timeout,
        maxContentLength: this.maxContentLength,
        maxRedirects: this.maxRedirects
      }
    };
  }
}

module.exports = WebScraper;
