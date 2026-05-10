
import React from 'react';
import { WordVisualizationProps } from '@/types/wordComparison';
import { processTexts } from '@/utils/wordMatching';
import NodalConnectionGrid from './WordVisualization/NodalConnectionGrid';

const WordVisualization = ({ text1, text2, fileName1, fileName2 }: WordVisualizationProps) => {
  const { connections, words1Length, words2Length } = processTexts(text1, text2);

  return (
    <NodalConnectionGrid 
      connections={connections} 
      fileName1={fileName1}
      fileName2={fileName2}
    />
  );
};

export default WordVisualization;
