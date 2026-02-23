import React from 'react';
import { Sparkles, BrainCircuit } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 py-4 px-6 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200">
           <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <div>
           <h1 className="text-xl font-bold text-slate-800 tracking-tight">혁신 제안서 AI</h1>
           <div className="flex items-center text-xs text-slate-500 font-medium">
             <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
             개발자 정혁신
           </div>
        </div>
      </div>
    </header>
  );
};

export default Header;