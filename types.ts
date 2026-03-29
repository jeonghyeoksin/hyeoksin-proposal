export enum ProposalStep {
  IDLE = 'IDLE',
  GENERATING_TEXT = 'GENERATING_TEXT',
  GENERATING_INFOGRAPHICS = 'GENERATING_INFOGRAPHICS',
  GENERATING_COVER = 'GENERATING_COVER',
  COMPILING = 'COMPILING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface ProposalInput {
  myCompanyName: string;
  clientCompanyName: string;
  clientIndustry: string;
  proposalType: string;
  clientCurrentSituation?: string;
  objective: string;
  proposalPlan: string;
  referenceContent: string;
  businessCardFile: File | null;
  myCompanyLogoFile: File | null;
  clientMainImageFile: File | null;
  monthlyBudget?: string;
  proposedService?: string;
  mustIncludeContent?: string;
}

export interface InfographicData {
  id: string;
  prompt: string;
  imageBase64: string;
  positionIndex: number; // Insert after which paragraph
}

export interface GeneratedContent {
  rawText: string;
  paragraphs: string[];
  coverImageBase64: string | null;
  infographics: InfographicData[];
  businessCardImageBase64: string | null;
  myCompanyLogoBase64: string | null;
}