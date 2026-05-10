import { WordMatch, ProcessedTexts, WordConnection } from '@/types/wordComparison';
import { normalizeWord, cleanText, mapExpandedToContraction, splitCompoundWords } from './textProcessing';

// Simplified SequenceMatcher that focuses on exact word-by-word matching like Python
class SequenceMatcher {
  private a: string[];
  private b: string[];

  constructor(a: string[], b: string[]) {
    this.a = a;
    this.b = b;
  }

  // Generate opcodes that match Python's behavior exactly
  getOpcodes(): Array<{tag: string, i1: number, i2: number, j1: number, j2: number}> {
    const opcodes: Array<{tag: string, i1: number, i2: number, j1: number, j2: number}> = [];
    
    let i = 0; // Position in array a
    let j = 0; // Position in array b
    
    while (i < this.a.length || j < this.b.length) {
      // Check for exact matches
      if (i < this.a.length && j < this.b.length && this.a[i] === this.b[j]) {
        // Find the length of the matching sequence
        let matchStart_i = i;
        let matchStart_j = j;
        
        while (i < this.a.length && j < this.b.length && this.a[i] === this.b[j]) {
          i++;
          j++;
        }
        
        opcodes.push({
          tag: 'equal',
          i1: matchStart_i,
          i2: i,
          j1: matchStart_j,
          j2: j
        });
      } else {
        // Handle mismatches - find next matching point or end
        let mismatchStart_i = i;
        let mismatchStart_j = j;
        
        // Look ahead to find the next matching point
        let nextMatch_i = -1;
        let nextMatch_j = -1;
        
        // Simple lookahead for next match within a reasonable window
        for (let lookahead_i = i; lookahead_i < Math.min(this.a.length, i + 10); lookahead_i++) {
          for (let lookahead_j = j; lookahead_j < Math.min(this.b.length, j + 10); lookahead_j++) {
            if (this.a[lookahead_i] === this.b[lookahead_j]) {
              nextMatch_i = lookahead_i;
              nextMatch_j = lookahead_j;
              break;
            }
          }
          if (nextMatch_i !== -1) break;
        }
        
        // If we found a next match, advance to it
        if (nextMatch_i !== -1 && nextMatch_j !== -1) {
          i = nextMatch_i;
          j = nextMatch_j;
        } else {
          // No match found, advance to end
          i = this.a.length;
          j = this.b.length;
        }
        
        // Create replace operation for the mismatch
        if (mismatchStart_i < i || mismatchStart_j < j) {
          opcodes.push({
            tag: 'replace',
            i1: mismatchStart_i,
            i2: Math.min(i, this.a.length),
            j1: mismatchStart_j,
            j2: Math.min(j, this.b.length)
          });
        }
      }
    }
    
    console.log('Generated opcodes:', opcodes);
    return opcodes;
  }
}

export const processTexts = (text1: string, text2: string): ProcessedTexts => {
  console.log('Processing texts using Python SequenceMatcher logic - Original inputs:', {
    text1Length: text1.length,
    text2Length: text2.length,
    text1Preview: text1.substring(0, 100),
    text2Preview: text2.substring(0, 100)
  });

  // Keep original words exactly as they appear in the uploaded files
  const originalWords1 = text1.split(/\s+/).filter(w => w.trim().length > 0);
  const originalWords2 = text2.split(/\s+/).filter(w => w.trim().length > 0);
  
  console.log('Original words extracted:', {
    originalWords1Length: originalWords1.length,
    originalWords2Length: originalWords2.length,
    firstFewWords1: originalWords1.slice(0, 10),
    firstFewWords2: originalWords2.slice(0, 10)
  });

  // Create processed versions for comparison AND display (exactly like Python)
  const processedWordsWithIndex1: { word: string; originalIndex: number; displayWord: string }[] = [];
  const processedWordsWithIndex2: { word: string; originalIndex: number; displayWord: string }[] = [];
  
  originalWords1.forEach((word, index) => {
    const processed = splitCompoundWords(mapExpandedToContraction(cleanText(word)));
    const normalized = normalizeWord(processed);
    if (normalized.length > 0) {
      processedWordsWithIndex1.push({
        word: normalized,
        originalIndex: index,
        displayWord: normalized // Display the processed word without punctuation
      });
    }
  });
  
  originalWords2.forEach((word, index) => {
    const processed = splitCompoundWords(mapExpandedToContraction(cleanText(word)));
    const normalized = normalizeWord(processed);
    if (normalized.length > 0) {
      processedWordsWithIndex2.push({
        word: normalized,
        originalIndex: index,
        displayWord: normalized // Display the processed word without punctuation
      });
    }
  });
  
  const processedWords1 = processedWordsWithIndex1.map(item => item.word);
  const processedWords2 = processedWordsWithIndex2.map(item => item.word);
  
  console.log('Processed words for comparison:', {
    processedWords1Length: processedWords1.length,
    processedWords2Length: processedWords2.length,
    firstFewProcessed1: processedWords1.slice(0, 10),
    firstFewProcessed2: processedWords2.slice(0, 10)
  });
  
  // Use SequenceMatcher exactly like Python's visualize_comparison.py
  const matcher = new SequenceMatcher(processedWords1, processedWords2);
  const opcodes = matcher.getOpcodes();
  
  console.log('SequenceMatcher opcodes:', opcodes.slice(0, 10));
  
  // Create connections based on opcodes (exactly like Python visualization)
  const connections: WordConnection[] = [];
  
  for (const opcode of opcodes) {
    const { tag, i1, i2, j1, j2 } = opcode;
    
    if (tag === 'equal') {
      // Matching words - create green connections
      for (let i = 0; i < (i2 - i1); i++) {
        const index1 = i1 + i;
        const index2 = j1 + i;
        
        if (index1 < processedWordsWithIndex1.length && index2 < processedWordsWithIndex2.length) {
          connections.push({
            word1: processedWordsWithIndex1[index1].displayWord,
            word2: processedWordsWithIndex2[index2].displayWord,
            index1: processedWordsWithIndex1[index1].originalIndex,
            index2: processedWordsWithIndex2[index2].originalIndex,
            isMatch: true
          });
        }
      }
    } else if (tag === 'replace') {
      // Different words - create red connections
      const maxRange = Math.max(i2 - i1, j2 - j1);
      for (let i = 0; i < maxRange; i++) {
        const index1 = i1 + i;
        const index2 = j1 + i;
        
        const word1 = index1 < i2 && index1 < processedWordsWithIndex1.length ? processedWordsWithIndex1[index1].displayWord : '';
        const word2 = index2 < j2 && index2 < processedWordsWithIndex2.length ? processedWordsWithIndex2[index2].displayWord : '';
        
        if (word1 || word2) {
          connections.push({
            word1,
            word2,
            index1: word1 ? (index1 < processedWordsWithIndex1.length ? processedWordsWithIndex1[index1].originalIndex : -1) : -1,
            index2: word2 ? (index2 < processedWordsWithIndex2.length ? processedWordsWithIndex2[index2].originalIndex : -1) : -1,
            isMatch: false
          });
        }
      }
    } else if (tag === 'delete') {
      // Words only in text1 - unmatched
      for (let i = i1; i < i2; i++) {
        if (i < processedWordsWithIndex1.length) {
          connections.push({
            word1: processedWordsWithIndex1[i].displayWord,
            word2: '',
            index1: processedWordsWithIndex1[i].originalIndex,
            index2: -1,
            isMatch: false
          });
        }
      }
    } else if (tag === 'insert') {
      // Words only in text2 - unmatched
      for (let j = j1; j < j2; j++) {
        if (j < processedWordsWithIndex2.length) {
          connections.push({
            word1: '',
            word2: processedWordsWithIndex2[j].displayWord,
            index1: -1,
            index2: processedWordsWithIndex2[j].originalIndex,
            isMatch: false
          });
        }
      }
    }
  }
  
  console.log('Word connections created using Python SequenceMatcher logic:', {
    connectionsLength: connections.length,
    matchedConnections: connections.filter(c => c.isMatch).length,
    unmatchedConnections: connections.filter(c => !c.isMatch).length,
    matchingEfficiency: `${((connections.filter(c => c.isMatch).length / connections.length) * 100).toFixed(1)}%`,
    sampleConnections: connections.slice(0, 10).map(c => ({
      word1: c.word1,
      word2: c.word2,
      isMatch: c.isMatch,
      positions: `${c.index1 + 1} -> ${c.index2 + 1}`
    }))
  });
  
  return { 
    connections, 
    words1Length: originalWords1.length, 
    words2Length: originalWords2.length 
  };
};

export const compareTextsLikePython = (text1: string, text2: string) => {
  // Use the exact same processing pipeline as processTexts() to ensure consistency
  const originalWords1 = text1.split(/\s+/).filter(w => w.trim().length > 0);
  const originalWords2 = text2.split(/\s+/).filter(w => w.trim().length > 0);
  
  // Process each word individually (same as processTexts)
  const words1 = originalWords1.map(word => {
    const processed = splitCompoundWords(mapExpandedToContraction(cleanText(word)));
    return normalizeWord(processed);
  }).filter(w => w.length > 0);
  
  const words2 = originalWords2.map(word => {
    const processed = splitCompoundWords(mapExpandedToContraction(cleanText(word)));
    return normalizeWord(processed);
  }).filter(w => w.length > 0);
  
  // Use SequenceMatcher for analysis (like Python's compare_texts function)
  const matcher = new SequenceMatcher(words1, words2);
  const opcodes = matcher.getOpcodes();
  
  // Count matches from opcodes
  let numMatches = 0;
  for (const opcode of opcodes) {
    if (opcode.tag === 'equal') {
      numMatches += opcode.i2 - opcode.i1;
    }
  }
  
  const totalWords = Math.max(words1.length, words2.length);
  const differentWords = ((words1.length + words2.length) - 2 * numMatches) / 2;
  
  // Calculate sequence similarity using normalized text
  const normalizedText1 = words1.join(' ');
  const normalizedText2 = words2.join(' ');
  const sequenceSimilarity = calculateSequenceSimilarity(normalizedText1, normalizedText2);
  
  // Word order similarity
  const wordOrderSimilarity = totalWords > 0 ? numMatches / totalWords : 0;
  
  console.log('compareTextsLikePython results:', {
    originalWords1Length: originalWords1.length,
    originalWords2Length: originalWords2.length,
    processedWords1Length: words1.length,
    processedWords2Length: words2.length,
    totalWords,
    numMatches,
    differentWords,
    wordOrderSimilarity,
    sequenceSimilarity
  });
  
  return {
    totalWords,
    numMatches,
    differentWords,
    sequenceSimilarity,
    wordOrderSimilarity
  };
};

const calculateSequenceSimilarity = (text1: string, text2: string): number => {
  const len1 = text1.length;
  const len2 = text2.length;
  
  if (len1 === 0 && len2 === 0) return 1.0;
  if (len1 === 0 || len2 === 0) return 0.0;
  
  // Simple character-level LCS for sequence similarity
  const dp: number[][] = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const lcsLength = dp[len1][len2];
  return (2.0 * lcsLength) / (len1 + len2);
};
