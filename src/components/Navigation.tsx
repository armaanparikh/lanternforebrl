
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Mic, FileText, Headphones, Home } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: Home,
      description: 'Return to LANTERN home'
    },
    {
      path: '/simple-transcriber',
      label: 'Audio Transcriber',
      icon: Mic,
      description: 'Local Whisper transcription'
    },
    {
      path: '/audio-transcription',
      label: 'Analysis Pipeline',
      icon: Headphones,
      description: 'Full transcription and co-occurrence analysis workflow'
    },
    {
      path: '/document-comparison',
      label: 'Document Comparison',
      icon: FileText,
      description: 'Compare transcription versions'
    }
  ];

  return (
    <div className="mb-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link key={item.path} to={item.path}>
              <Card className={`p-4 transition-all hover:shadow-md cursor-pointer ${
                isActive ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
              }`}>
                <div className="flex items-center gap-3">
                  <Icon className={`h-6 w-6 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
                  <div>
                    <h3 className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                      {item.label}
                    </h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
