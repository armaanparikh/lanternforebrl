
import AudioTranscriber from "@/components/AudioTranscriber";
import { Lightbulb } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Lightbulb className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent mb-3 tracking-tight">
            LANTERN
          </h1>
          
          <p className="text-lg text-slate-600 mb-6 font-medium">
            Language Analysis of Text Retell Networks
          </p>
          
          <div className="flex justify-center mb-4">
            <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-1 hover:shadow-2xl transition-all duration-300 hover:scale-[1.01]">
          <AudioTranscriber />
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-slate-400">
            Education and Brain Sciences Research Lab
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
