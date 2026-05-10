
export interface WordMatch {
  word1: string;
  word2: string;
  isMatch: boolean;
  index1: number;
  index2: number;
}

export interface WordConnection {
  word1: string;
  word2: string;
  index1: number;
  index2: number;
  isMatch: boolean;
}

export interface WordVisualizationProps {
  text1: string;
  text2: string;
  fileName1: string;
  fileName2: string;
}

export interface ProcessedTexts {
  connections: WordConnection[];
  words1Length: number;
  words2Length: number;
}
