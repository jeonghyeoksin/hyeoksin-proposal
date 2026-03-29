import React, { useState, useEffect } from 'react';
import { BrainCircuit, Key, ShieldCheck, HelpCircle, X, CheckCircle2, FileText, Image as ImageIcon, Download } from 'lucide-react';

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
          {/* How to Use Button */}
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
              <span>{hasPlatformKey ? '플랫폼 키 연결됨' : '이미지 생성 권한 설정'}</span>
            </button>
          )}

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

      {/* How to Use Modal */}
      {showHowTo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-scale-in">
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
                      <h4 className="font-bold text-slate-800 text-sm mb-1">기본 정보</h4>
                      <p className="text-xs text-slate-500">회사명, 클라이언트명, 제안 유형 등을 입력합니다.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start space-x-3">
                    <ImageIcon className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm mb-1">시각 자료</h4>
                      <p className="text-xs text-slate-500">로고나 명함 이미지를 업로드하여 제안서에 포함시킵니다.</p>
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
                  <h3>미리보기 및 다운로드</h3>
                </div>
                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-between pl-9">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-900">완성된 제안서를 Word(.docx) 파일로 즉시 다운로드하세요.</span>
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
          </div>
        </div>
      )}
    </>
  );
};

export default Header;