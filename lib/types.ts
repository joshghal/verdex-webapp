// TransitionPath Africa - Core Type Definitions

// ============================================
// ENUMS & CONSTANTS
// ============================================

// LIMITATION: Only 8 countries currently supported with full data (country profiles, DFI eligibility, NDC targets).
// Unsupported countries will default to 'kenya' during document extraction.
export const AFRICAN_COUNTRIES = [
  'kenya', 'nigeria', 'south_africa', 'tanzania', 'ghana', 'egypt', 'morocco', 'ethiopia'
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

  // Total emissions (preferred over scope breakdown when available)
  // These capture all emission sources including those that don't fit Scope 1/2/3 categories
  totalBaselineEmissions?: number;  // Total baseline tCO2e/year
  totalTargetEmissions?: number;    // Total target tCO2e/year
  statedReductionPercent?: number;  // Document's stated reduction %

  // Strategy
  transitionStrategy: string;
  hasPublishedPlan: boolean;
  thirdPartyVerification: boolean;

  // Project Details
  technology?: string;
  timeline?: ProjectTimeline;

  // Raw document text for greenwashing analysis (preserves inconsistencies)
  rawDocumentText?: string;
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
  // LMA 5 Core Components (October 2025 Transition Loan Guide)
  components: {
    transitionStrategy: ComponentScore;       // Component 1
    useOfProceeds: ComponentScore;            // Component 2
    projectSelectionEvaluation: ComponentScore; // Component 3
    managementOfProceeds: ComponentScore;     // Component 4
    reporting: ComponentScore;                // Component 5
  };
  sbtiAssessment: SBTiAssessment;
  parisAlignment: ParisAlignment;
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

// ============================================
// DNSH (DO NO SIGNIFICANT HARM) - EU TAXONOMY
// ============================================

// EU Taxonomy Article 17 - 6 Environmental Objectives
export const DNSH_OBJECTIVES = [
  'climate_mitigation',
  'climate_adaptation',
  'water_resources',
  'circular_economy',
  'pollution_prevention',
  'biodiversity'
] as const;
export type DNSHObjective = typeof DNSH_OBJECTIVES[number];

export const DNSH_OBJECTIVE_NAMES: Record<DNSHObjective, string> = {
  climate_mitigation: 'Climate Change Mitigation',
  climate_adaptation: 'Climate Change Adaptation',
  water_resources: 'Water & Marine Resources',
  circular_economy: 'Circular Economy',
  pollution_prevention: 'Pollution Prevention',
  biodiversity: 'Biodiversity & Ecosystems'
};

export type DNSHStatus = 'no_harm' | 'potential_harm' | 'significant_harm' | 'not_assessed';

export interface DNSHCriterionResult {
  objective: DNSHObjective;
  objectiveName: string;
  status: DNSHStatus;
  score: number;  // 0-4 (4 = no harm, 0 = significant harm)
  maxScore: 4;
  evidence: string;
  concern?: string;
  isFundamentallyIncompatible?: boolean;  // True = no workaround possible
  recommendation?: string;  // Only for fixable issues
}

export interface DNSHAssessment {
  overallStatus: 'compliant' | 'partial' | 'non_compliant';
  totalScore: number;  // 0-24 (sum of 6 objectives)
  normalizedScore: number;  // 0-100 for display
  criteria: DNSHCriterionResult[];
  summary: string;
  keyRisks: string[];
  recommendations: string[];  // Only for fixable issues
  // Fundamental incompatibility - when project type itself is incompatible
  isFundamentallyIncompatible?: boolean;
  incompatibilityReason?: string;  // e.g., "Fossil fuel extraction is incompatible with EU Taxonomy climate objectives"
}

// ============================================
// LOCATION RISK & CLIMATE RESILIENCE
// ============================================

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export interface ClimateRiskMetric {
  indicator: string;
  value: number;
  unit: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  riskLevel: RiskLevel;
  description: string;
}

export interface HistoricalClimateData {
  averageTemperature: number;  // °C
  temperatureVariability: number;  // std dev
  annualPrecipitation: number;  // mm/year
  precipitationVariability: number;
  drySeasonMonths: number[];  // 1-12
  extremeHeatDays: number;  // days > 35°C per year
  droughtRisk: RiskLevel;
  floodRisk: RiskLevel;
}

export type ClimateScenario = 'SSP1-2.6' | 'SSP2-4.5' | 'SSP5-8.5';
export type ProjectionYear = 2030 | 2050;

export interface ClimateProjection {
  scenario: ClimateScenario;
  year: ProjectionYear;
  temperatureChange: number;  // °C above baseline
  precipitationChange: number;  // % change
  extremeEventFrequency: number;  // multiplier
}

export interface SiteIntelligence {
  optimalOperatingMonths: number[];  // 1-12
  operatingContext?: string;  // human-readable (e.g., "year-round", "6-month growing season")
  waterAvailability: 'abundant' | 'moderate' | 'scarce';
  solarPotential?: number;  // kWh/m²/day (for energy projects)
  agriculturalSuitability?: string;  // for agriculture projects
}

// Key insight with decision-relevant context
export interface KeyInsight {
  icon: 'water' | 'sun' | 'temp' | 'calendar' | 'warning' | 'check';
  headline: string;  // e.g., "Irrigation Required"
  detail: string;    // e.g., "545mm annual rainfall is below 800mm threshold for rainfed farming"
  action?: string;   // e.g., "Budget $2,000-4,000/hectare for drip irrigation"
  severity: 'positive' | 'neutral' | 'caution';
  source?: string;   // Citation for transparency, e.g., "FAO Paper 56"
}

export interface LocationRiskAssessment {
  coordinates: GeoCoordinates;
  historicalData: HistoricalClimateData;
  projections: ClimateProjection[];
  riskMetrics: ClimateRiskMetric[];
  overallRiskScore: number;  // 0-100 (higher = more risk)
  keyInsights: KeyInsight[];  // AHAA moments - decision-relevant insights
  resilienceOpportunities: string[];  // Positive framing
  siteIntelligence: SiteIntelligence;
  recommendations: string[];
  dataSource: 'open-meteo';
  assessmentDate: string;
}

// ============================================
// AI CHAT TYPES
// ============================================

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
  suggestedQuestions?: string[];
}

export interface ChatSource {
  id: string;
  clauseType: string;
  preview: string;
  score: number;
}

export interface ChatRequest {
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface ChatResponse {
  response: string;
  sources: ChatSource[];
  suggestedQuestions: string[];
  provider: string;
  error?: string;
}
