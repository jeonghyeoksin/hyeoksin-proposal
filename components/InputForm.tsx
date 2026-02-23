import React, { useState } from 'react';
import { ProposalInput } from '../types';
import { parseFile } from '../services/fileParser';
import { FileText, Loader2, Contact, UploadCloud, Sparkles, Wand2, Building2 } from 'lucide-react';

interface Props {
  onSubmit: (data: ProposalInput) => void;
  isLoading: boolean;
}

const InputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProposalInput>({
    myCompanyName: '',
    clientCompanyName: '',
    clientIndustry: '',
    proposalType: '',
    objective: '',
    referenceContent: '',
    businessCardFile: null,
    myCompanyLogoFile: null,
  });

  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (file) {
       setIsParsingFile(true);
       setFileName(file.name);
       try {
         const text = await parseFile(file);
         setFormData(prev => ({ ...prev, referenceContent: text }));
       } catch (error) {
         console.error(error);
         alert("파일을 읽어오는 중 오류가 발생했습니다. (지원 형식: PDF, DOCX, TXT, MD)");
         setFileName(null);
       } finally {
         setIsParsingFile(false);
       }
     }
  };

  const handleBusinessCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, businessCardFile: file }));
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, myCompanyLogoFile: file }));
    }
  };

  const handleFillExample = () => {
    setFormData(prev => ({
        ...prev,
        myCompanyName: '넥스트 웨이브 솔루션',
        clientCompanyName: '퓨처 리테일',
        clientIndustry: '이커머스 및 유통',
        proposalType: 'AI 기반 고객 경험 혁신 제안서',
        objective: '고객 이탈률 20% 감소 및 재구매율 15% 상승',
        referenceContent: `[현황 분석]
현재 퓨처 리테일의 온라인 쇼핑몰은 방문자 수는 많으나, 장바구니 이탈률이 65%에 달함.
고객 상담 센터의 대기 시간이 평균 10분 이상으로 고객 불만 증가.
개인화된 추천 시스템의 부재로 인한 교차 판매 기회 상실.

[제안 솔루션]
1. AI 챗봇 '퓨처봇' 도입: 24시간 실시간 상담 및 단순 문의 80% 자동화.
2. 초개인화 추천 엔진: 고객 행동 데이터를 분석하여 메인 화면 및 장바구니 페이지에서 맞춤 상품 추천.
3. 구매 여정 최적화: UX/UI 개편을 통해 결제 단계 축소 및 간편 결제 도입.

[기대 효과]
- 상담원 업무 부하 50% 감소 및 고부가가치 업무 집중.
- 개인화 추천을 통한 객단가(AOV) 10% 상승 예상.
- 고객 만족도(CSAT) 4.5점으로 개선 목표.`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-8 relative overflow-hidden">
       {/* Background decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2 opacity-60"></div>
      
      <div className="border-b border-slate-100 pb-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 border-l-4 border-indigo-600 pl-4 flex items-center">
                제안서 설정
                <Sparkles className="w-5 h-5 text-indigo-500 ml-2" />
            </h2>
            <p className="text-slate-500 text-sm mt-2 pl-5">
                필요한 정보를 입력하면 AI가 전문적인 제안서를 작성해줍니다.
            </p>
        </div>
        <button 
            type="button"
            onClick={handleFillExample}
            className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 text-sm font-bold rounded-lg hover:bg-indigo-100 transition"
        >
            <Wand2 className="w-4 h-4 mr-2" />
            예시 데이터 채우기
        </button>
      </div>

      <div className="space-y-6 animate-fade-in">
         {/* Section 1: Basic Info */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">내 업체명</label>
              <input
                type="text"
                name="myCompanyName"
                autoFocus
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 넥스트 이노베이션"
                value={formData.myCompanyName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">클라이언트 업체명</label>
              <input
                type="text"
                name="clientCompanyName"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 태양 물산"
                value={formData.clientCompanyName}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-700">클라이언트 산업 분야</label>
              <input
                type="text"
                name="clientIndustry"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 제조, 유통, IT 플랫폼 등"
                value={formData.clientIndustry}
                onChange={handleChange}
              />
            </div>
         </div>

         {/* Section 2: Details */}
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">제안서 종류</label>
              <input
                type="text"
                name="proposalType"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 디지털 마케팅 연간 대행 제안서"
                value={formData.proposalType}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">핵심 목표 (Objective)</label>
              <input
                type="text"
                name="objective"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 매출 200% 증대"
                value={formData.objective}
                onChange={handleChange}
              />
            </div>
         </div>

         <hr className="border-slate-100" />

         {/* Section 3: Files */}
         <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-slate-700">
                참고 자료 (필수)
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">AI가 100% 반영합니다</span>
            </label>
            <div className="space-y-3">
                <div className="relative group">
                    <input 
                        type="file" 
                        accept=".txt,.md,.pdf,.docx,.doc"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        disabled={isParsingFile || isLoading}
                    />
                    <div className="flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-lg group-hover:bg-slate-50 group-hover:border-indigo-400 transition">
                        <UploadCloud className="w-5 h-5 text-slate-400 mr-2 group-hover:text-indigo-500" />
                        <span className="text-sm text-slate-500 group-hover:text-indigo-600 font-medium">
                            {isParsingFile ? '파일 분석 중...' : '클릭하여 파일 업로드 (PDF, DOCX, TXT)'}
                        </span>
                    </div>
                </div>
                {fileName && !isParsingFile && (
                    <div className="flex items-center text-xs text-green-600 font-medium bg-green-50 p-2 rounded">
                        <FileText className="w-3 h-3 mr-1" />
                        <span>{fileName} 내용이 로드되었습니다.</span>
                    </div>
                )}
                <textarea
                name="referenceContent"
                rows={8}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-50 text-sm"
                placeholder="파일 내용을 자동으로 불러오거나, 이곳에 직접 제안서에 들어갈 핵심 내용을 붙여넣으세요. (이 내용을 바탕으로 제안서가 작성됩니다)"
                value={formData.referenceContent}
                onChange={handleChange}
                disabled={isParsingFile}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">내 업체 로고 (선택)</label>
                <div className="relative border border-slate-200 rounded-lg p-3 flex items-center bg-slate-50 hover:bg-white transition h-[72px]">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                    />
                    <div className="flex items-center w-full">
                        <div className="w-10 h-10 bg-white rounded border border-slate-200 flex items-center justify-center mr-3">
                            <Building2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                             <div className="text-sm font-medium text-slate-700">
                                 {formData.myCompanyLogoFile ? formData.myCompanyLogoFile.name : "로고 이미지 업로드"}
                             </div>
                             <div className="text-xs text-slate-500 truncate">
                                 {formData.myCompanyLogoFile ? "표지 상단에 삽입됩니다." : "클릭하여 선택"}
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">명함 이미지 (선택)</label>
                <div className="relative border border-slate-200 rounded-lg p-3 flex items-center bg-slate-50 hover:bg-white transition h-[72px]">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleBusinessCardChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                    />
                    <div className="flex items-center w-full">
                        <div className="w-10 h-10 bg-white rounded border border-slate-200 flex items-center justify-center mr-3">
                            <Contact className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                             <div className="text-sm font-medium text-slate-700">
                                 {formData.businessCardFile ? formData.businessCardFile.name : "명함 이미지 업로드"}
                             </div>
                             <div className="text-xs text-slate-500 truncate">
                                 {formData.businessCardFile ? "제안서 마지막에 삽입됩니다." : "클릭하여 선택"}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <button
            type="submit"
            disabled={isLoading || isParsingFile}
            className={`w-full flex items-center justify-center px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl transition transform hover:-translate-y-1 active:scale-95 ${
            (isLoading || isParsingFile) ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'
            }`}
        >
            {isLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : null}
            {isLoading ? '혁신적인 제안서 생성 중...' : '제안서 자동 생성 시작'}
        </button>
      </div>
    </form>
  );
};

export default InputForm;