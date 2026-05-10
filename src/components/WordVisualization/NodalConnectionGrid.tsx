import React, { useEffect, useState, useRef } from 'react';
import { WordConnection } from '@/types/wordComparison';
import { ScrollArea } from '@/components/ui/scroll-area';

interface NodalConnectionGridProps {
  connections: WordConnection[];
  fileName1: string;
  fileName2: string;
}

interface ConnectionLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  connection: WordConnection;
}

const NodalConnectionGrid = ({ connections, fileName1, fileName2 }: NodalConnectionGridProps) => {
  const [connectionLines, setConnectionLines] = useState<ConnectionLine[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const text1Words = connections
    .filter(conn => conn.word1)
    .sort((a, b) => a.index1 - b.index1);
  
  const text2Words = connections
    .filter(conn => conn.word2)
    .sort((a, b) => a.index2 - b.index2);

  // Calculate dynamic height based on word count
  const maxWords = Math.max(text1Words.length, text2Words.length);
  const containerHeight = Math.max(800, maxWords * 60 + 200); // 60px per word + padding

  // Update connection lines when component mounts or connections change
  useEffect(() => {
    const updateConnectionLines = () => {
      if (!containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newLines: ConnectionLine[] = [];
      
      connections
        .filter(conn => conn.isMatch && conn.word1 && conn.word2)
        .forEach((conn) => {
          const word1Element = document.getElementById(`word1-${conn.index1}`);
          const word2Element = document.getElementById(`word2-${conn.index2}`);
          
          if (word1Element && word2Element) {
            const rect1 = word1Element.getBoundingClientRect();
            const rect2 = word2Element.getBoundingClientRect();
            
            // Calculate positions relative to the container
            const startX = rect1.right - containerRect.left;
            const startY = rect1.top + rect1.height / 2 - containerRect.top;
            const endX = rect2.left - containerRect.left;
            const endY = rect2.top + rect2.height / 2 - containerRect.top;
            
            newLines.push({
              startX,
              startY,
              endX,
              endY,
              connection: conn
            });
          }
        });
      
      setConnectionLines(newLines);
    };

    // Initial update
    const timer = setTimeout(updateConnectionLines, 100);
    
    // Update on scroll or resize
    const handleUpdate = () => {
      setTimeout(updateConnectionLines, 50);
    };
    
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [connections]);

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Fixed headers */}
      <div className="flex justify-between items-center p-8 border-b bg-white/80 backdrop-blur-sm">
        <div>
          <h3 className="text-xl font-bold text-blue-700 mb-2">{fileName1}</h3>
          <p className="text-sm text-blue-600">{text1Words.length} words</p>
        </div>
        
        <div className="text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-gray-200">
            <div className="flex gap-6 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{connections.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {connections.filter(c => c.isMatch).length}
                </div>
                <div className="text-xs text-gray-600">Connected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {connections.filter(c => !c.isMatch).length}
                </div>
                <div className="text-xs text-gray-600">Unmatched</div>
              </div>
            </div>
            <div className="mt-2 text-sm font-semibold text-gray-700">
              Connection Rate: {connections.length > 0 ? 
                ((connections.filter(c => c.isMatch).length / connections.length) * 100).toFixed(1) 
                : 0}%
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-green-700 mb-2">{fileName2}</h3>
          <p className="text-sm text-green-600">{text2Words.length} words</p>
        </div>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="w-full h-[calc(100vh-200px)]">
        <div 
          ref={containerRef}
          className="relative w-full p-8" 
          style={{ height: `${containerHeight}px` }}
        >
          {/* Text 1 words - left side with varied positioning */}
          <div className="absolute left-8 top-8 w-1/3">
            {text1Words.map((conn, idx) => (
              <div
                key={`t1-${conn.index1}`}
                id={`word1-${conn.index1}`}
                className={`
                  relative p-3 mb-4 rounded-xl text-sm border-2 transition-all duration-300 
                  hover:scale-110 hover:z-30 cursor-pointer shadow-lg backdrop-blur-sm
                  ${conn.isMatch 
                    ? 'bg-green-100/80 border-green-400 text-green-800 hover:bg-green-200/90' 
                    : 'bg-red-100/80 border-red-400 text-red-800 hover:bg-red-200/90'
                  }
                `}
                style={{
                  marginLeft: `${Math.sin(idx * 0.3) * 40 + 20}px`,
                  transform: `rotate(${Math.sin(idx * 0.2) * 2}deg)`,
                  top: `${idx * 60}px`
                }}
              >
                <span className="text-xs text-gray-500 mr-2 font-mono">
                  {conn.index1 + 1}
                </span>
                <span className="font-medium">{conn.word1}</span>
              </div>
            ))}
          </div>

          {/* Text 2 words - right side with varied positioning */}
          <div className="absolute right-8 top-8 w-1/3">
            {text2Words.map((conn, idx) => (
              <div
                key={`t2-${conn.index2}`}
                id={`word2-${conn.index2}`}
                className={`
                  relative p-3 mb-4 rounded-xl text-sm border-2 transition-all duration-300 
                  hover:scale-110 hover:z-30 cursor-pointer shadow-lg backdrop-blur-sm
                  ${conn.isMatch 
                    ? 'bg-green-100/80 border-green-400 text-green-800 hover:bg-green-200/90' 
                    : 'bg-red-100/80 border-red-400 text-red-800 hover:bg-red-200/90'
                  }
                `}
                style={{
                  marginRight: `${Math.cos(idx * 0.3) * 40 + 20}px`,
                  transform: `rotate(${Math.cos(idx * 0.2) * 2}deg)`,
                  top: `${idx * 60}px`
                }}
              >
                <span className="text-xs text-gray-500 mr-2 font-mono">
                  {conn.index2 + 1}
                </span>
                <span className="font-medium">{conn.word2}</span>
              </div>
            ))}
          </div>

          {/* Dynamic connection lines using SVG overlay */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <marker
                id="arrowhead"
                markerWidth="12"
                markerHeight="8"
                refX="11"
                refY="4"
                orient="auto"
              >
                <polygon
                  points="0 0, 12 4, 0 8"
                  fill="#10b981"
                  opacity="0.8"
                />
              </marker>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
                <stop offset="50%" stopColor="#34d399" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.8"/>
              </linearGradient>
            </defs>
            
            {connectionLines.map((line, idx) => {
              const midX = (line.startX + line.endX) / 2;
              const midY = (line.startY + line.endY) / 2 + Math.sin(idx * 0.5) * 30;
              
              return (
                <g key={`connection-${line.connection.index1}-${line.connection.index2}`}>
                  {/* Main connection line */}
                  <path
                    d={`M ${line.startX} ${line.startY} Q ${midX} ${midY} ${line.endX} ${line.endY}`}
                    stroke="url(#connectionGradient)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="6,3"
                    filter="url(#glow)"
                    className="animate-pulse"
                    style={{
                      animationDuration: `${2 + (idx % 3)}s`,
                      animationDelay: `${idx * 0.1}s`
                    }}
                  />
                  
                  {/* Connection points */}
                  <circle
                    cx={line.startX}
                    cy={line.startY}
                    r="4"
                    fill="#10b981"
                    opacity="0.9"
                    className="animate-pulse"
                    style={{
                      animationDuration: `${1.5 + (idx % 2)}s`,
                      animationDelay: `${idx * 0.05}s`
                    }}
                  />
                  <circle
                    cx={line.endX}
                    cy={line.endY}
                    r="4"
                    fill="#10b981"
                    opacity="0.9"
                    className="animate-pulse"
                    style={{
                      animationDuration: `${1.5 + (idx % 2)}s`,
                      animationDelay: `${idx * 0.05}s`
                    }}
                  />
                  
                  {/* Optional: Add word labels on hover */}
                  <text
                    x={midX}
                    y={midY - 10}
                    textAnchor="middle"
                    fontSize="10"
                    fill="#059669"
                    opacity="0.7"
                    className="font-mono"
                  >
                    {line.connection.word1}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </ScrollArea>
    </div>
  );
};

export default NodalConnectionGrid;
