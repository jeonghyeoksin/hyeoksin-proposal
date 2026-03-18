import React, { useState, useEffect } from 'react';
import { BrainCircuit, Key } from 'lucide-react';

const Header: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('custom_gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('custom_gemini_api_key', apiKey.trim());
      setIsSaved(true);
      alert('API Key가 저장되었습니다. 이제 배포 환경에서도 사용할 수 있습니다.');
    } else {
      localStorage.removeItem('custom_gemini_api_key');
      setIsSaved(false);
      alert('API Key가 삭제되었습니다.');
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 py-3 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-3 sm:gap-0">
      <div className="flex items-center space-x-3 w-full sm:w-auto justify-center sm:justify-start">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-200 shrink-0">
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
      
      <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
        <div className="relative flex items-center w-full sm:w-auto">
          <Key className="absolute left-3 w-4 h-4 text-slate-400" />
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Gemini API Key 입력"
            className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-64 transition-all"
          />
        </div>
        <button
          onClick={handleSave}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors shrink-0 ${
            isSaved 
              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
          }`}
        >
          {isSaved ? '적용됨' : '적용'}
        </button>
      </div>
    </header>
  );
};

export default Header;