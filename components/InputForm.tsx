import React, { useState } from 'react';
import { ProposalInput } from '../types';
import { parseFile } from '../services/fileParser';
import { generateProposalPlan } from '../services/geminiService';
import { FileText, Loader2, Contact, UploadCloud, Sparkles, Wand2, Building2, Lightbulb } from 'lucide-react';

interface Props {
  onSubmit: (data: ProposalInput) => void;
  isLoading: boolean;
}

const PROPOSAL_TYPES = [
  "온라인 마케팅 제안서",
  "사업 제안서",
  "서비스 제안서",
  "제품 소개서",
  "협력/제휴 제안서",
  "행사/기획 제안서",
  "기타 (직접 입력)"
];

const InputForm: React.FC<Props> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ProposalInput>({
    myCompanyName: '',
    clientCompanyName: '',
    clientIndustry: '',
    proposalType: PROPOSAL_TYPES[0],
    clientCurrentSituation: '',
    objective: '',
    proposalPlan: '',
    referenceContent: '',
    businessCardFile: null,
    myCompanyLogoFile: null,
    clientMainImageFile: null,
    monthlyBudget: '',
    proposedService: '',
    mustIncludeContent: '',
  });

  const [customProposalType, setCustomProposalType] = useState('');
  const [isPlanning, setIsPlanning] = useState(false);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProposalTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, proposalType: value }));
  };

  const handlePlanGeneration = async () => {
    const { myCompanyName, clientCompanyName, clientIndustry, proposalType, clientCurrentSituation, monthlyBudget, proposedService } = formData;
    const finalType = proposalType === "기타 (직접 입력)" ? customProposalType : proposalType;

    if (!myCompanyName || !clientCompanyName || !clientIndustry || !finalType) {
      alert("내 업체명, 클라이언트 업체명, 산업 분야, 제안서 종류를 모두 입력해주세요.");
      return;
    }

    setIsPlanning(true);
    try {
      const result = await generateProposalPlan({
        myCompanyName,
        clientCompanyName,
        clientIndustry,
        proposalType: finalType,
        clientCurrentSituation,
        monthlyBudget,
        proposedService
      });
      setFormData(prev => ({
        ...prev,
        objective: result.objective,
        proposalPlan: result.plan
      }));
    } catch (error) {
      console.error(error);
      alert("기획안 생성 중 오류가 발생했습니다.");
    } finally {
      setIsPlanning(false);
    }
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

  const handleClientMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, clientMainImageFile: file }));
    }
  };

  const handleFillExample = () => {
    setFormData(prev => ({
        ...prev,
        myCompanyName: '넥스트 웨이브 솔루션',
        clientCompanyName: '퓨처 리테일',
        clientIndustry: '이커머스 및 유통',
        proposalType: '사업 제안서',
        clientCurrentSituation: '기존 오프라인 매장 중심에서 온라인으로 전환 중이나, 낮은 전환율과 높은 이탈률로 인해 성장이 정체된 상황임.',
        monthlyBudget: '500만원',
        proposedService: 'AI 기반 개인화 마케팅 자동화 솔루션',
        mustIncludeContent: '1. 당사만의 독자적인 AI 알고리즘 기술력 강조\n2. 타사 대비 30% 저렴한 유지보수 비용\n3. 24시간 실시간 모니터링 서비스 포함',
        objective: '고객 이탈률 20% 감소 및 재구매율 15% 상승',
        proposalPlan: '1. AI 챗봇 도입을 통한 상담 자동화\n2. 초개인화 추천 엔진 구축\n3. 구매 여정 최적화 및 간편 결제 도입',
        referenceContent: `[현황 분석]
현재 퓨처 리테일의 온라인 쇼핑몰은 방문자 수는 많으나, 장바구니 이탈률이 65%에 달함.
고객 상담 센터의 대기 시간이 평균 10분 이상으로 고객 불만 증가.
개인화된 추천 시스템의 부재로 인한 교차 판매 기회 상실.`
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      proposalType: formData.proposalType === "기타 (직접 입력)" ? customProposalType : formData.proposalType
    };
    onSubmit(finalData);
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
            <div className="space-y-2">
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
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">월 예산 (선택)</label>
              <input
                type="text"
                name="monthlyBudget"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 500만원, 협의 가능 등"
                value={formData.monthlyBudget}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">제안할 서비스 (선택)</label>
              <input
                type="text"
                name="proposedService"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 인스타그램 광고 대행, 홈페이지 제작 등"
                value={formData.proposedService}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">제안서 종류</label>
              <div className="space-y-2">
                <select
                  name="proposalType"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white"
                  value={formData.proposalType}
                  onChange={handleProposalTypeChange}
                >
                  {PROPOSAL_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {formData.proposalType === "기타 (직접 입력)" && (
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                    placeholder="제안서 종류를 직접 입력하세요"
                    value={customProposalType}
                    onChange={(e) => setCustomProposalType(e.target.value)}
                    required
                  />
                )}
              </div>
            </div>
         </div>

         <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">클라이언트 현재 상황 (선택)</label>
            <textarea
              name="clientCurrentSituation"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm"
              placeholder="클라이언트가 현재 겪고 있는 문제점이나 상황을 입력하면 더 정확한 기획이 가능합니다."
              value={formData.clientCurrentSituation}
              onChange={handleChange}
            />
         </div>

         <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">꼭 작성해야 될 내용 (선택)</label>
            <textarea
              name="mustIncludeContent"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm"
              placeholder="제안서에 반드시 포함되어야 하는 핵심 강점이나 필수 요구사항을 입력하세요."
              value={formData.mustIncludeContent}
              onChange={handleChange}
            />
         </div>

         <div className="flex justify-center py-2">
            <button
              type="button"
              onClick={handlePlanGeneration}
              disabled={isPlanning || isLoading}
              className="flex items-center px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg hover:shadow-indigo-200 disabled:bg-slate-400"
            >
              {isPlanning ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Lightbulb className="w-5 h-5 mr-2" />}
              핵심 목표 및 제안서 기획 생성 (AI)
            </button>
         </div>

         {/* Section 2: Details */}
         <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">핵심 목표 (Objective)</label>
              <input
                type="text"
                name="objective"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
                placeholder="예: 3개월 내 매출 300% 성장을 위한 초격차 마케팅 전략"
                value={formData.objective}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">제안서 기획 (Plan)</label>
              <textarea
                name="proposalPlan"
                rows={4}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm text-sm"
                placeholder="제안서의 목차나 핵심 전략을 입력하세요. (위 버튼을 클릭하여 AI가 자동으로 기획하게 할 수 있습니다)"
                value={formData.proposalPlan}
                onChange={handleChange}
              />
            </div>
         </div>

         <hr className="border-slate-100" />

         {/* Section 3: Files */}
         <div className="space-y-2">
            <label className="flex items-center text-sm font-bold text-slate-700">
                참고 자료 (선택)
                <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">AI가 참고하여 작성합니다</span>
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
                rows={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition disabled:bg-slate-50 text-sm"
                placeholder="파일 내용을 자동으로 불러오거나, 이곳에 직접 제안서에 들어갈 핵심 내용을 붙여넣으세요. (선택 사항)"
                value={formData.referenceContent}
                onChange={handleChange}
                disabled={isParsingFile}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                             <div className="text-sm font-medium text-slate-700 truncate">
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
                <label className="text-sm font-bold text-slate-700">클라이언트 메인 이미지 (선택)</label>
                <div className="relative border border-slate-200 rounded-lg p-3 flex items-center bg-slate-50 hover:bg-white transition h-[72px]">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleClientMainImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                    />
                    <div className="flex items-center w-full">
                        <div className="w-10 h-10 bg-white rounded border border-slate-200 flex items-center justify-center mr-3">
                            <UploadCloud className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                             <div className="text-sm font-medium text-slate-700 truncate">
                                 {formData.clientMainImageFile ? formData.clientMainImageFile.name : "메인 이미지 업로드"}
                             </div>
                             <div className="text-xs text-slate-500 truncate">
                                 {formData.clientMainImageFile ? "제안서 표지에 사용됩니다." : "클릭하여 선택"}
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
                             <div className="text-sm font-medium text-slate-700 truncate">
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
            disabled={isLoading || isParsingFile || isPlanning}
            className={`w-full flex items-center justify-center px-8 py-4 rounded-xl text-white font-bold text-lg shadow-xl transition transform hover:-translate-y-1 active:scale-95 ${
            (isLoading || isParsingFile || isPlanning) ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-indigo-500/30'
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
