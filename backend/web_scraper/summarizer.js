const { pipeline } = require('@xenova/transformers');

class AISummarizer {
  constructor() {
    this.summarizer = null;
    this.model = process.env.AI_MODEL || 'Xenova/distilbart-cnn-12-6';
    this.isInitialized = false;
    this.useFallback = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      console.log(`🤖 Initializing local AI model: ${this.model}`);
      console.log('📦 This may take a moment on first run to download the model...');
      
      // Try to initialize the summarization pipeline with local model
      this.summarizer = await pipeline('summarization', this.model, {
        progress_callback: (data) => {
          if (data.status === 'progress') {
            console.log(`📥 Downloading: ${data.file} - ${Math.round(data.progress || 0)}%`);
          }
        }
      });
      
      this.isInitialized = true;
      this.useFallback = false;
      
      console.log('✅ AI summarizer initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize AI summarizer:', error.message);
      console.log('🔄 Falling back to extractive summarization...');
      
      // Enable fallback mode
      this.useFallback = true;
      this.isInitialized = true;
      
      console.log('✅ Fallback summarizer ready');
    }
  }

  /**
   * Summarize text content in podcast/audiobook style
   * @param {Object} scrapedData - The scraped content object
   * @returns {Promise<Object>} - Summarized content in podcast format
   */
  async summarizeForPodcast(scrapedData) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const { title, content, author, url } = scrapedData;
      
      // Split content into chunks if it's too long (model has token limits)
      const chunks = this.splitTextIntoChunks(content, 800); // Smaller chunks for local model
      const summaries = [];

      console.log(`📝 Processing ${chunks.length} chunks for summarization...`);

      // Summarize each chunk
      for (const chunk of chunks) {
        if (chunk.trim().length < 50) continue; // Skip very short chunks
        
        const summary = await this.summarizeChunk(chunk);
        if (summary) {
          summaries.push(summary);
        }
      }

      // Combine summaries and format for podcast
      const combinedSummary = summaries.join(' ');
      const podcastContent = await this.formatAsPodcast(combinedSummary, title, author, url);

      return {
        originalTitle: title,
        originalAuthor: author,
        originalUrl: url,
        originalWordCount: content.split(/\s+/).length,
        podcast: {
          title: `Hanasu Presents: ${title}`,
          intro: podcastContent.intro,
          mainContent: podcastContent.mainContent,
          outro: podcastContent.outro,
          fullScript: podcastContent.fullScript,
          estimatedReadTime: this.calculateReadTime(podcastContent.fullScript),
          segments: podcastContent.segments
        },
        summary: {
          brief: await this.createBriefSummary(combinedSummary),
          keyPoints: await this.extractKeyPoints(combinedSummary),
          wordCount: combinedSummary.split(/\s+/).length
        },
        model: this.model,
        processedAt: new Date().toISOString()
      };

    } catch (error) {
      throw new Error(`Summarization failed: ${error.message}`);
    }
  }

  /**
   * Summarize a single text chunk using local model or fallback
   */
  async summarizeChunk(text) {
    try {
      const cleanedText = this.preprocessText(text);
      
      if (cleanedText.length < 100) {
        return cleanedText;
      }

      // Use AI model if available, otherwise use fallback
      if (!this.useFallback && this.summarizer) {
        const result = await this.summarizer(cleanedText, {
          max_length: Math.min(130, Math.floor(cleanedText.length / 3)),
          min_length: 30,
          do_sample: false
        });

        return result[0].summary_text;
      } else {
        // Fallback: extractive summarization
        return this.extractiveSummary(cleanedText);
      }
    } catch (error) {
      console.error('Error summarizing chunk:', error);
      // Return extractive summary as fallback
      return this.extractiveSummary(text);
    }
  }

  /**
   * Extractive summarization fallback method
   */
  extractiveSummary(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Score sentences by position and length
    const scoredSentences = sentences.map((sentence, index) => {
      const positionScore = index < 3 ? 2 : 1; // Favor early sentences
      const lengthScore = sentence.length > 50 && sentence.length < 200 ? 2 : 1;
      return {
        sentence: sentence.trim(),
        score: positionScore + lengthScore,
        index
      };
    });

    // Sort by score and take top sentences
    const topSentences = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, Math.min(3, sentences.length))
      .sort((a, b) => a.index - b.index); // Restore original order

    return topSentences.map(s => s.sentence).join('. ') + '.';
  }

  /**
   * Preprocess text for the model
   */
  preprocessText(text) {
    return text
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/[^\w\s.,!?;:()\-"']/g, '') // Remove special characters but keep punctuation
      .trim()
      .substring(0, 1000); // Limit input length for local model
  }

  /**
   * Format summary as podcast-style content
   */
  async formatAsPodcast(summary, title, author, url) {
    const intro = `Welcome to Hanasu! Today we're diving into "${title}"${author ? ` by ${author}` : ''}. Let's break down the key insights from this piece.`;
    
    const segments = await this.createPodcastSegments(summary);
    
    const mainContent = segments.map((segment, index) => {
      return `Segment ${index + 1}: ${segment.title}\n\n${segment.content}`;
    }).join('\n\n---\n\n');

    const outro = `That wraps up our exploration of "${title}". To read the full article, you can visit the original source. Thanks for listening to Hanasu, where we transform written content into digestible audio experiences!`;

    const fullScript = `${intro}\n\n${mainContent}\n\n${outro}`;

    return {
      intro,
      mainContent,
      outro,
      fullScript,
      segments
    };
  }

  /**
   * Create podcast segments from summary
   */
  async createPodcastSegments(summary) {
    // Split summary into logical segments
    const sentences = summary.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const segments = [];
    
    // Group sentences into segments of 3-4 sentences each
    for (let i = 0; i < sentences.length; i += 3) {
      const segmentSentences = sentences.slice(i, i + 3);
      const segmentText = segmentSentences.join('. ').trim() + '.';
      
      // Generate a title for this segment (simplified approach)
      const segmentTitle = this.generateSegmentTitle(segmentText);
      
      segments.push({
        title: segmentTitle,
        content: segmentText,
        order: segments.length + 1
      });
    }

    return segments;
  }

  /**
   * Generate a title for a podcast segment
   */
  generateSegmentTitle(text) {
    const words = text.split(' ');
    const importantWords = words.filter(word => 
      word.length > 4 && 
      !['that', 'this', 'with', 'from', 'they', 'were', 'been', 'have', 'will', 'would', 'could', 'should'].includes(word.toLowerCase())
    );
    
    return importantWords.slice(0, 3).join(' ').replace(/[^\w\s]/g, '') || 'Key Points';
  }

  /**
   * Create a brief summary using local model or fallback
   */
  async createBriefSummary(text) {
    if (text.length < 200) return text;
    
    try {
      if (!this.useFallback && this.summarizer) {
        const result = await this.summarizer(text, {
          max_length: 80,
          min_length: 20,
          do_sample: false
        });

        return result[0].summary_text;
      } else {
        // Fallback to extractive summary
        return this.extractiveSummary(text).substring(0, 200) + '...';
      }
    } catch (error) {
      // Fallback to simple truncation
      return text.substring(0, 200) + '...';
    }
  }

  /**
   * Extract key points from text
   */
  async extractKeyPoints(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    // Take every other sentence as key points, up to 5 points
    const keyPoints = sentences
      .filter((_, index) => index % 2 === 0)
      .slice(0, 5)
      .map(point => point.trim() + '.');

    return keyPoints;
  }

  /**
   * Split text into manageable chunks for local model
   */
  splitTextIntoChunks(text, maxWords = 800) {
    const words = text.split(/\s+/);
    const chunks = [];
    
    for (let i = 0; i < words.length; i += maxWords) {
      const chunk = words.slice(i, i + maxWords).join(' ');
      chunks.push(chunk);
    }
    
    return chunks;
  }

  /**
   * Calculate estimated reading time
   */
  calculateReadTime(text) {
    const wordsPerMinute = 150; // Average reading speed
    const wordCount = text.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    
    return {
      minutes,
      wordCount,
      description: `${minutes} minute${minutes !== 1 ? 's' : ''} read`
    };
  }

  /**
   * Get model information
   */
  getModelInfo() {
    return {
      model: this.useFallback ? 'extractive-fallback' : this.model,
      type: this.useFallback ? 'Extractive Summarization' : 'Local Transformer Model',
      description: this.useFallback 
        ? 'Fallback extractive summarization when AI model unavailable'
        : 'DistilBART CNN - Lightweight summarization model running locally',
      capabilities: ['text summarization', 'content compression', 'podcast formatting'],
      languages: ['English'],
      isLocal: true,
      requiresApiKey: false,
      isInitialized: this.isInitialized,
      usingFallback: this.useFallback
    };
  }
}

module.exports = AISummarizer;
