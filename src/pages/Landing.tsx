
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Lightbulb, ArrowRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Logo/Icon */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative p-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="h-20 w-20 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-6">
            <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent tracking-tight">
              LANTERN
            </h1>
            <p className="text-2xl text-slate-600 font-medium">
              Language Analysis of Text Retell Networks
            </p>
          </div>

          {/* Divider */}
          <div className="flex justify-center">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>

          {/* Subtitle */}
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Audio transcription and linguistic analysis for research
          </p>

          {/* Start Button */}
          <div className="pt-8">
            <Link to="/audio-transcription">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-12 py-7 rounded-full transition-all duration-300 hover:shadow-2xl hover:scale-105 text-white font-semibold"
              >
                Start Analysis
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-16">
            <p className="text-sm text-slate-400">
              Education and Brain Sciences Research Lab
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
