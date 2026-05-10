
import React from 'react';
import { WordMatch } from '@/types/wordComparison';

interface WordPairRowProps {
  pair: WordMatch;
  index: number;
}

const WordPairRow = ({ pair, index }: WordPairRowProps) => {
  const isEmpty1 = !pair.word1 || !pair.word1.trim();
  const isEmpty2 = !pair.word2 || !pair.word2.trim();
  const isMatch = pair.isMatch;
  
  let bgColor = 'bg-gray-50';
  let borderColor = 'border-gray-200';
  
  if (isMatch) {
    bgColor = 'bg-green-50';
    borderColor = 'border-green-200';
  } else {
    bgColor = 'bg-red-50';
    borderColor = 'border-red-200';
  }
  
  return (
    <div className={`grid grid-cols-2 gap-2 p-2 rounded border ${bgColor} ${borderColor}`}>
      <div className="text-sm break-words">
        <span className="text-xs text-gray-500 mr-2">{index + 1}.</span>
        {!isEmpty1 ? (
          <span className="text-gray-900">
            {pair.word1}
          </span>
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </div>
      <div className="text-sm break-words">
        <span className="text-xs text-gray-500 mr-2">{index + 1}.</span>
        {!isEmpty2 ? (
          <span className="text-gray-900">
            {pair.word2}
          </span>
        ) : (
          <span className="text-gray-400 italic">—</span>
        )}
      </div>
    </div>
  );
};

export default WordPairRow;
