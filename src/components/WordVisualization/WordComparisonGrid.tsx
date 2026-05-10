
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WordMatch } from '@/types/wordComparison';
import WordPairRow from './WordPairRow';

interface WordComparisonGridProps {
  alignedPairs: WordMatch[];
}

const WordComparisonGrid = ({ alignedPairs }: WordComparisonGridProps) => {
  return (
    <ScrollArea className="h-96 border rounded-lg">
      <div className="space-y-1 p-2">
        {alignedPairs.map((pair, index) => (
          <WordPairRow key={index} pair={pair} index={index} />
        ))}
      </div>
    </ScrollArea>
  );
};

export default WordComparisonGrid;
