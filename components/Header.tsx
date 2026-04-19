import React, { useState, useEffect } from 'react';
import { BrainCircuit, Key, ShieldCheck, HelpCircle, X, CheckCircle2, FileText, Image as ImageIcon, Clipboard, History, Coins, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { patchNotes } from '../src/constants/patchNotes';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

const Header: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [hasPlatformKey, setHasPlatformKey] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('custom_gemini_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsSaved(true);
    }

    const checkPlatformKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasPlatformKey(hasKey);
      }
    };
    checkPlatformKey();
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

  const handleOpenPlatformKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      setHasPlatformKey(true);
    }
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 py-3 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-3 sm:gap-4 md:gap-6">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-3">
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

          {/* API Cost Info (Mobile Only hidden, shown in desktop) */}
          <div className="hidden lg:flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 ml-4">
             <Coins className="w-3.5 h-3.5 text-amber-500" />
             <div className="flex flex-col">
               <span className="text-[10px] font-bold text-slate-400 leading-none">EST. API COST</span>
               <span className="text-xs font-bold text-slate-700 leading-tight">₩100 ~ ₩300</span>
             </div>
             <div className="group relative">
               <AlertCircle className="w-3 h-3 text-slate-300 cursor-help" />
               <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                 이미지 생성 개수 및 원고 분량에 따라 오차가 발생할 수 있습니다.
               </div>
             </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          {/* API Cost Info (Tablet/Mobile fallback) */}
          <div className="flex lg:hidden items-center space-x-1 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-100 mr-1">
             <Coins className="w-3.5 h-3.5 text-amber-500" />
             <span className="text-xs font-bold text-slate-700">₩100~300</span>
          </div>

          <button
            onClick={() => setShowPatchNotes(true)}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg transition-all bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
          >
            <History className="w-3.5 h-3.5" />
            <span>패치노트</span>
          </button>

          <button
            onClick={() => setShowHowTo(true)}
            className="flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg transition-all bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>사용방법</span>
          </button>

          {window.aistudio && (
            <button
              onClick={handleOpenPlatformKey}
              className={`flex items-center space-x-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${
                hasPlatformKey 
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                  : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
              }`}
              title="AI Studio 플랫폼 키 선택 (이미지 생성 권한 해결)"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{hasPlatformKey ? '플랫폼 키 연결됨' : '이미지 생성 권한 설정'}</span>
              <span className="md:hidden">{hasPlatformKey ? '연결됨' : '권한'}</span>
            </button>
          )}

          <div className="relative flex items-center w-full sm:w-auto max-w-[150px] sm:max-w-none">
            <Key className="absolute left-3 w-4 h-4 text-slate-400" />
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsSaved(false);
              }}
              placeholder="Gemini API Key"
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-48 transition-all"
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

      {/* How to Use Modal */}
      <AnimatePresence>
        {showHowTo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden"
            >
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <div className="flex items-center space-x-3">
                  <HelpCircle className="w-6 h-6" />
                  <h2 className="text-xl font-bold">혁신 제안서 AI 사용방법</h2>
                </div>
                <button 
                  onClick={() => setShowHowTo(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-8 max-h-[70vh] overflow-y-auto space-y-8">
                <section className="space-y-4">
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-lg">
                    <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full text-sm">1</span>
                    <h3>API Key 설정 (필수)</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed pl-9">
                    상단 헤더의 입력창에 <strong className="text-indigo-600">Gemini API Key</strong>를 입력하고 '적용' 버튼을 눌러주세요. 
                    이미지 생성이 안 될 경우 '이미지 생성 권한 설정' 버튼을 통해 플랫폼 키를 연결해야 합니다.
                  </p>
                </section>
  
                <section className="space-y-4">
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-lg">
                    <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full text-sm">2</span>
                    <h3>제안서 정보 입력</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-9">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
                      <FileText className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">기본 정보 및 기획</h4>
                        <p className="text-xs text-slate-500">회사명, 제안 유형 입력 후 <strong className="text-indigo-600">AI 기획 생성</strong> 버튼을 눌러 핵심 전략을 수립하세요.</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
                      <ImageIcon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm mb-1">시각 자료 (선택)</h4>
                        <p className="text-xs text-slate-500">로고나 명함, 참고 자료를 업로드하여 제안서의 퀄리티를 높이세요.</p>
                      </div>
                    </div>
                  </div>
                </section>
  
                <section className="space-y-4">
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-lg">
                    <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full text-sm">3</span>
                    <h3>AI 자동 생성</h3>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed pl-9">
                    '제안서 생성하기' 버튼을 누르면 AI가 <strong className="text-indigo-600">원고 작성, 인포그래픽 생성, 표지 디자인</strong>을 순차적으로 진행합니다. 
                    약 1~2분 정도 소요되며 진행 상황을 실시간으로 확인할 수 있습니다.
                  </p>
                </section>
  
                <section className="space-y-4">
                  <div className="flex items-center space-x-2 text-indigo-600 font-bold text-lg">
                    <span className="flex items-center justify-center w-7 h-7 bg-indigo-100 rounded-full text-sm">4</span>
                    <h3>미리보기 및 활용</h3>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between pl-9">
                    <div className="flex items-center space-x-3">
                      <Clipboard className="w-5 h-5 text-indigo-600" />
                      <span className="text-sm font-medium text-indigo-900 leading-tight">완성된 제안서를 클립보드에 복사하여 구글 Docs나 워드에 붙여넣으세요.</span>
                    </div>
                  </div>
                </section>
              </div>
  
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowHowTo(false)}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                  확인했습니다
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patch Notes Modal */}
      <AnimatePresence>
        {showPatchNotes && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden"
            >
              <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
                <div className="flex items-center space-x-3">
                  <History className="w-6 h-6" />
                  <h2 className="text-xl font-bold">패치노트 (Update History)</h2>
                </div>
                <button 
                  onClick={() => setShowPatchNotes(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6">
                {patchNotes.map((note, index) => (
                  <div key={note.version} className="relative pl-6 border-l-2 border-indigo-100 group">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-500 transition-colors group-hover:bg-indigo-500"></div>
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-lg font-black text-slate-800">{note.version}</span>
                       <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">{note.date}</span>
                    </div>
                    <ul className="space-y-2">
                      {note.items.map((item, idx) => (
                        <li key={idx} className="text-slate-600 text-sm flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 mr-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setShowPatchNotes(false)}
                  className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300 transition-all"
                >
                  닫기
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;