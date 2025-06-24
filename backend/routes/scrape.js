const express = require('express');
const WebScraper = require('../web_scraper');
const AISummarizer = require('../web_scraper/summarizer');

const router = express.Router();
const scraper = new WebScraper();
const summarizer = new AISummarizer();

/**
 * POST /api/scrape/url
 * Scrape a URL and return summarized content in podcast format
 */
router.post('/url', async (req, res) => {
  try {
    const { url } = req.body;

    // Validation
    if (!url) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'URL is required'
      });
    }

    if (!scraper.isValidUrl(url)) {
      return res.status(400).json({
        error: 'Invalid URL',
        message: 'Please provide a valid HTTP or HTTPS URL'
      });
    }

    console.log(`🔍 Starting to scrape: ${url}`);

    // Scrape the URL
    const scrapedData = await scraper.scrapeUrl(url);
    
    if (!scrapedData.content || scrapedData.content.length < 100) {
      return res.status(400).json({
        error: 'Insufficient content',
        message: 'The webpage does not contain enough text content to summarize'
      });
    }

    console.log(`📝 Content scraped successfully. Word count: ${scrapedData.wordCount}`);

    // Summarize content for podcast format
    const podcastContent = await summarizer.summarizeForPodcast(scrapedData);

    console.log(`🎙️ Podcast content generated successfully`);

    res.json({
      success: true,
      data: podcastContent,
      metadata: {
        processingTime: new Date().toISOString(),
        originalWordCount: scrapedData.wordCount,
        summaryWordCount: podcastContent.summary.wordCount
      }
    });

  } catch (error) {
    console.error('Error in /scrape/url:', error);
    
    if (error.message.includes('timeout')) {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'The website took too long to respond'
      });
    }
    
    if (error.message.includes('Network Error') || error.message.includes('ENOTFOUND')) {
      return res.status(502).json({
        error: 'Network error',
        message: 'Unable to reach the specified URL'
      });
    }

    res.status(500).json({
      error: 'Processing failed',
      message: error.message
    });
  }
});

/**
 * POST /api/scrape/batch
 * Scrape multiple URLs and return summarized content
 */
router.post('/batch', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({
        error: 'Invalid input',
        message: 'URLs array is required and must contain at least one URL'
      });
    }

    if (urls.length > 5) {
      return res.status(400).json({
        error: 'Too many URLs',
        message: 'Maximum 5 URLs allowed per batch request'
      });
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      
      try {
        if (!scraper.isValidUrl(url)) {
          errors.push({ url, error: 'Invalid URL format' });
          continue;
        }

        console.log(`🔍 Processing URL ${i + 1}/${urls.length}: ${url}`);
        
        const scrapedData = await scraper.scrapeUrl(url);
        
        if (scrapedData.content.length < 100) {
          errors.push({ url, error: 'Insufficient content' });
          continue;
        }

        const podcastContent = await summarizer.summarizeForPodcast(scrapedData);
        results.push(podcastContent);

      } catch (error) {
        console.error(`Error processing ${url}:`, error.message);
        errors.push({ url, error: error.message });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        errors,
        summary: {
          total: urls.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Error in /scrape/batch:', error);
    res.status(500).json({
      error: 'Batch processing failed',
      message: error.message
    });
  }
});

/**
 * GET /api/scrape/test
 * Test endpoint to verify the service is working
 */
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Hanasu scraping service is operational',
    features: [
      'Web scraping',
      'AI summarization',
      'Podcast formatting',
      'Batch processing'
    ],
    models: {
      summarization: 'sshleifer/distilbart-cnn-12-6'
    },
    timestamp: new Date().toISOString()
  });
});

// Get model information
router.get('/model-info', (req, res) => {
  try {
    const summarizer = new AISummarizer();
    const modelInfo = summarizer.getModelInfo();
    
    res.json({
      success: true,
      data: modelInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get model information',
      details: error.message
    });
  }
});

// Health check with model status
router.get('/health', async (req, res) => {
  try {
    const summarizer = new AISummarizer();
    const modelInfo = summarizer.getModelInfo();
    
    res.json({
      success: true,
      status: 'healthy',
      model: {
        name: modelInfo.model,
        isLocal: modelInfo.isLocal,
        initialized: modelInfo.isInitialized,
        requiresApiKey: modelInfo.requiresApiKey
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: error.message
    });
  }
});

module.exports = router;
