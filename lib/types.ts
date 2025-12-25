// TransitionPath Africa - Core Type Definitions

// ============================================
// ENUMS & CONSTANTS
// ============================================

// LIMITATION: Only 7 countries currently supported with full data (country profiles, DFI eligibility, NDC targets).
// Unsupported countries will default to 'kenya' during document extraction.
export const AFRICAN_COUNTRIES = [
  'kenya', 'nigeria', 'south_africa', 'tanzania', 'ghana', 'egypt', 'morocco'
] as const;
export type AfricanCountry = typeof AFRICAN_COUNTRIES[number];

export const SECTORS = [
  'energy', 'mining', 'agriculture', 'transport', 'manufacturing'
] as const;
export type Sector = typeof SECTORS[number];

export const DFI_IDS = [
  'ifc', 'afdb', 'fmo', 'deg', 'bii', 'proparco', 'dfc'
] as const;
export type DFIId = typeof DFI_IDS[number];

export type RiskLevel = 'low' | 'medium' | 'high';
export type EligibilityStatus = 'eligible' | 'partial' | 'ineligible';

// ============================================
// PROJECT INPUT SCHEMA
// ============================================

export interface EmissionsData {
  scope1: number;  // tCO2e/year
  scope2: number;
  scope3?: number;
}

export interface ProjectTimeline {
  constructionStart?: string;
  operationsStart?: string;
  projectLife: number; // years
}

export interface ProjectInput {
  // Basic Info
  projectName: string;
  country: AfricanCountry;
  sector: Sector;
  projectType: string;
  description: string;

  // Financials (USD)
  totalCost: number;
  debtAmount: number;
  equityAmount: number;

  // Transition Info
  currentEmissions: EmissionsData;
  targetEmissions: EmissionsData;
  targetYear: number;

  // Strategy
  transitionStrategy: string;
  hasPublishedPlan: boolean;
  thirdPartyVerification: boolean;

  // Project Details
  technology?: string;
  timeline?: ProjectTimeline;
}

// ============================================
// LMA FRAMEWORK
// ============================================

export interface LMAComponent {
  id: number;
  name: string;
  description: string;
  maxScore: number;
  criteria: LMACriterion[];
}

export interface LMACriterion {
  id: string;
  description: string;
  weight: number;
  checkFn?: (project: ProjectInput) => CriterionResult;
}

export interface CriterionResult {
  met: boolean;
  score: number;
  feedback: string;
}

export interface ComponentScore {
  componentId: number;
  componentName: string;
  score: number;
  maxScore: number;
  percentage: number;
  criteria: CriterionResult[];
  feedback: string[];
}

// ============================================
// DFI DATABASE
// ============================================

export interface DFI {
  id: DFIId;
  name: string;
  fullName: string;
  country: string;
  minSize?: number;
  maxSize?: number;
  maxParticipation?: number;
  loanTenor?: string;
  eligibleCountries: AfricanCountry[] | 'all';
  eligibleSectors: Sector[] | 'all';
  keyRequirements: string[];
  climateTarget?: string;
  specialPrograms?: string[];
  notes?: string;
  sourceUrl?: string;
}

export interface DFIMatch {
  dfi: DFI;
  matchScore: number;
  matchReasons: string[];
  concerns: string[];
  recommendedRole: 'senior' | 'subordinated' | 'mezzanine' | 'equity' | 'guarantee';
  estimatedSize?: {
    min: number;
    max: number;
  };
}

// ============================================
// COUNTRY PROFILES
// ============================================

export interface CountryProfile {
  id: AfricanCountry;
  name: string;
  region: 'east_africa' | 'west_africa' | 'southern_africa' | 'north_africa';
  regulatoryFramework: string;
  legalSystem: 'common_law' | 'civil_law' | 'mixed';
  relevantLaws: string[];
  currency: string;
  currencyCode: string;
  fxConsiderations: string[];
  exchangeControlNotes?: string;
  gridOperator?: string;
  ppaFramework?: string;
  renewableTargets?: string;
  sovereignRating?: string;
  politicalRiskLevel: RiskLevel;
  ndcTarget?: string;
  ndcBaselineYear?: number;
  ndcTargetYear?: number;
  specialConsiderations?: string[];
}

// ============================================
// SECTOR & KPIs
// ============================================

export interface SectorPathway {
  sector: Sector;
  description: string;
  transitionPath: string;
  sbtiAligned: boolean;
  parisAligned: boolean;
  typicalProjectTypes: string[];
}

export interface KPI {
  id: string;
  name: string;
  unit: string;
  sector: Sector;
  description: string;
  isScienceBased: boolean;
  ambitionGuidance: string;
  dataRequirements: string[];
}

export interface KPIRecommendation {
  kpi: KPI;
  relevanceScore: number;
  baselineValue?: number;
  suggestedTarget?: number;
  rationale: string;
}

// ============================================
// GREENWASHING DETECTION
// ============================================

export interface RedFlag {
  id: string;
  category: 'commitment' | 'scope' | 'ambition' | 'verification' | 'technology' | 'baseline';
  severity: RiskLevel;
  description: string;
  recommendation: string;
}

export interface GreenwashingAssessment {
  overallRisk: RiskLevel;
  riskScore: number;
  redFlags: RedFlag[];
  positiveIndicators: string[];
  recommendations: string[];
}

// ============================================
// SBTI & PARIS ALIGNMENT
// ============================================

export interface SBTiAssessment {
  scope1Aligned: boolean;
  scope2Aligned: boolean;
  scope3Aligned: boolean;
  scope3MaterialCategories: string[];
  targetMethodology?: 'linear' | 'low_carbon_share' | 'asset_decarbonization';
  supplierEngagementRequired: boolean;
  feedback: string[];
}

export interface ParisAlignment {
  article2_1c_aligned: boolean;
  article4_ndcAligned: boolean;
  article6_carbonMarket?: boolean;
  article9_climateFinance: boolean;
  article13_transparency: boolean;
  feedback: string[];
}

// ============================================
// TARGET AMBITION ASSESSMENT
// ============================================

export interface TargetAmbitionAssessment {
  isAmbitious: boolean;
  actualReduction: number;
  requiredReduction: number;
  gap: number;
  sectorBenchmarks: SectorBenchmarkComparison[];
  feedback: string[];
}

export interface SectorBenchmarkComparison {
  metric: string;
  unit: string;
  projectValue?: number | string;
  benchmark2030: number | string;
  benchmark2050: number | string;
  status: 'exceeds' | 'meets' | 'below' | 'not_assessed';
  source: string;
}

// ============================================
// BLENDED FINANCE STRUCTURE
// ============================================

export interface BlendedStructure {
  seniorDebt: {
    percentage: number;
    sources: string[];
    estimatedRate?: string;
  };
  subordinatedDebt?: {
    percentage: number;
    sources: string[];
  };
  mezzanine?: {
    percentage: number;
    sources: string[];
  };
  equity: {
    percentage: number;
    sources: string[];
  };
  guarantees?: {
    type: string;
    provider: string;
    coverage: string;
  }[];
  diagram?: string;
}

// ============================================
// ASSESSMENT OUTPUT
// ============================================

export interface AssessmentResult {
  projectName: string;
  country: AfricanCountry;
  sector: Sector;
  eligibilityStatus: EligibilityStatus;
  overallScore: number;
  components: {
    strategyAlignment: ComponentScore;
    useOfProceeds: ComponentScore;
    projectSelection: ComponentScore;
    proceedsManagement: ComponentScore;
    reporting: ComponentScore;
  };
  sbtiAssessment: SBTiAssessment;
  parisAlignment: ParisAlignment;
  targetAmbition: TargetAmbitionAssessment;
  recommendedKPIs: KPIRecommendation[];
  greenwashingRisk: GreenwashingAssessment;
  requiredImprovements: string[];
  suggestedEnhancements: string[];
  eligibleDFIs: DFIMatch[];
  recommendedStructure: BlendedStructure;
  nextSteps: string[];
  assessmentDate: string;
  assessmentVersion: string;
}

// ============================================
// API TYPES
// ============================================

export interface AssessmentRequest {
  projectName: string;
  country: string;
  sector: string;
  projectType: string;
  description: string;
  totalCost: number;
  debtAmount: number;
  equityAmount: number;
  currentEmissions: EmissionsData;
  targetEmissions: EmissionsData;
  targetYear: number;
  transitionStrategy: string;
  hasPublishedPlan: boolean;
  thirdPartyVerification: boolean;
}

export interface SearchRequest {
  query: string;
  filters?: {
    clauseType?: string[];
    country?: string[];
    sector?: string[];
  };
  limit?: number;
}

export interface SearchResult {
  content: string;
  score: number;
  source: string;
  metadata: {
    clauseType?: string;
    documentType?: string;
    country?: string;
  };
}
