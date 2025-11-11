import { useState, useCallback } from 'react';
import { pipeline } from '@huggingface/transformers';

let extractorInstance: any = null;

export const useBertKeywords = () => {
  const [isExtracting, setIsExtracting] = useState(false);

  const extractKeywords = useCallback(async (text: string, topic: string): Promise<string[]> => {
    setIsExtracting(true);
    
    try {
      // Initialize the feature extraction pipeline if not already done
      if (!extractorInstance) {
        extractorInstance = await pipeline(
          'feature-extraction',
          'Xenova/all-MiniLM-L6-v2',
          { device: 'wasm' }
        );
      }

      // Split text into sentences and extract meaningful words
      const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 3); // Filter out short words

      // Get unique important words (simple keyword extraction)
      const uniqueWords = [...new Set(words)];
      
      // Filter out common words (simple stopword removal)
      const stopwords = ['that', 'this', 'with', 'from', 'have', 'been', 'were', 'their', 'what', 'when', 'where', 'which', 'about', 'would', 'there', 'these', 'those'];
      const keywords = uniqueWords
        .filter(word => !stopwords.includes(word))
        .slice(0, 10); // Limit to top 10 keywords

      return keywords;
    } catch (error) {
      console.error('BERT keyword extraction error:', error);
      return [];
    } finally {
      setIsExtracting(false);
    }
  }, []);

  return { extractKeywords, isExtracting };
};
