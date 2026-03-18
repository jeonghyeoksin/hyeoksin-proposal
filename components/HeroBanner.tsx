import React from 'react';

const HeroBanner: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-12 rounded-2xl overflow-hidden shadow-2xl relative aspect-video animate-fade-in-up">
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=2070&auto=format&fit=crop" 
        alt="Business Proposal" 
        className="absolute inset-0 w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent"></div>
      
      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-center p-10 sm:p-16 lg:p-20">
        <div className="inline-flex items-center space-x-2 bg-indigo-600/20 backdrop-blur-sm border border-indigo-500/30 px-4 py-2 rounded-full w-fit mb-6">
          <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></span>
          <span className="text-indigo-100 text-sm font-medium tracking-wide">AI-Powered Business Solutions</span>
        </div>
        
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight mb-6 drop-shadow-lg">
          혁신 제안서 AI
        </h1>
        
        <p className="text-lg sm:text-xl text-slate-200 max-w-xl leading-relaxed drop-shadow-md">
          단 몇 번의 클릭으로 완벽하게 구조화된 비즈니스 제안서를 완성하세요. 
          AI가 당신의 아이디어를 설득력 있는 문서와 시각 자료로 변환합니다.
        </p>
      </div>
    </div>
  );
};

export default HeroBanner;
