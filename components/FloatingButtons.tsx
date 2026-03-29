import React, { useState } from 'react';
import { ExternalLink, AlertCircle, X, Mail } from 'lucide-react';

const FloatingButtons: React.FC = () => {
  const [showMaintenance, setShowMaintenance] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end space-y-3 z-[60]">
      {/* Maintenance Info Tooltip/Modal */}
      {showMaintenance && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xl p-5 mb-2 w-72 animate-fade-in-up">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center text-indigo-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="font-bold">오류 및 유지보수</span>
            </div>
            <button 
              onClick={() => setShowMaintenance(false)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            업데이트나 유지보수가 필요할 경우 아래 이메일로 어떤 부분이 필요한지 상세하게 작성 후 보내주세요.
          </p>
          <div className="flex items-center justify-center p-2 bg-slate-50 rounded-lg border border-slate-100">
            <Mail className="w-4 h-4 text-slate-400 mr-2" />
            <span className="text-sm font-medium text-slate-800">info@nextin.ai.kr</span>
          </div>
        </div>
      )}

      {/* Innovation AI Platform Button */}
      <a 
        href="https://hyeoksinai.com" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center space-x-2 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 group"
      >
        <span className="font-semibold text-sm">혁신AI 플랫폼 바로가기</span>
        <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
      </a>

      {/* Error & Maintenance Button */}
      <button 
        onClick={() => setShowMaintenance(!showMaintenance)}
        className="flex items-center space-x-2 bg-white text-slate-700 border border-slate-200 px-5 py-3 rounded-full shadow-lg hover:bg-slate-50 transition-all hover:scale-105 active:scale-95"
      >
        <AlertCircle className="w-4 h-4 text-indigo-600" />
        <span className="font-semibold text-sm">오류 및 유지보수</span>
      </button>
    </div>
  );
};

export default FloatingButtons;
