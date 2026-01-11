// LMA Component Evaluation Types
// Each of the 5 components has equal 20-point max score (total: 100)

export type LMAComponentType = 'strategy' | 'proceeds' | 'selection' | 'management' | 'reporting';

export interface SubScore {
  criterion: string;
  maxPoints: number;
  points: number;
  status: 'met' | 'partial' | 'missing';
  evidence: string;      // Specific quote from document
  reasoning: string;     // AI explanation for the score
}

export interface KeyQuote {
  quote: string;
  relevance: string;
}

export interface LMAComponentEvaluation {
  component: LMAComponentType;
  componentName: string;
  maxScore: 20;
  score: number;         // 0-20
  confidence: number;    // 0-100, AI's confidence in the evaluation
  subScores: SubScore[];
  overallReasoning: string;
  improvements: string[];
  keyQuotes: KeyQuote[];
}

export interface ComponentSections {
  strategy: string;       // Sections about transition strategy, plans, targets
  useOfProceeds: string;  // Sections about fund allocation, eligible activities
  selection: string;      // Sections about project criteria, governance
  management: string;     // Sections about fund tracking, accounting
  reporting: string;      // Sections about disclosure, verification, audits
}

export interface ProjectContext {
  projectName: string;
  country: string;
  sector: string;
  projectType?: string;
  description?: string;
}

export interface ExtractedFields {
  projectName?: string;
  country?: string;
  sector?: string;
  projectType?: string;
  description?: string;
  financingNeeded?: number;
  debtAmount?: number;
  equityAmount?: number;
  currentScope1?: number;
  currentScope2?: number;
  currentScope3?: number;
  targetScope1?: number;
  targetScope2?: number;
  targetScope3?: number;
  totalBaselineEmissions?: number;
  totalTargetEmissions?: number;
  transitionPlan?: string;
  verificationStatus?: string;
  climateTargets?: string;
  statedReductionPercent?: number;
  targetYear?: number;
}

export interface LMAEvaluationRequest {
  extractedFields: ExtractedFields;
  componentSection: string;
  projectContext: ProjectContext;
  rawDocumentText?: string;  // Optional full document for additional context
}

export interface LMAEvaluationResult {
  success: boolean;
  components: LMAComponentEvaluation[];
  totalScore: number;       // Sum of all component scores (0-100)
  eligibility: 'eligible' | 'partial' | 'ineligible';
  overallReasoning: string;
  timestamp: string;
  error?: string;
}

export interface AggregatedLMAScore {
  totalScore: number;
  eligibility: 'eligible' | 'partial' | 'ineligible';
  componentBreakdown: {
    component: LMAComponentType;
    componentName: string;
    score: number;
    maxScore: 20;
    percentage: number;
  }[];
  strengths: string[];
  weaknesses: string[];
  topImprovements: string[];
}

// Component metadata with criteria definitions
export const LMA_COMPONENTS = {
  strategy: {
    name: 'Entity-level Transition Strategy',
    maxScore: 20 as const,
    criteria: [
      { id: 'published_plan', name: 'Published transition plan', maxPoints: 5, description: 'Is there a documented, public transition plan?' },
      { id: 'paris_alignment', name: 'Paris Agreement alignment', maxPoints: 5, description: 'Does it target 1.5°C or well-below 2°C?' },
      { id: 'economy_wide', name: 'Economy-wide coverage', maxPoints: 5, description: 'Does it cover the entire entity, not just this project?' },
      { id: 'third_party', name: 'Third-party verification', maxPoints: 5, description: 'Is the strategy verified by an independent party?' }
    ]
  },
  proceeds: {
    name: 'Use of Proceeds',
    maxScore: 20 as const,
    criteria: [
      { id: 'eligible_activities', name: 'Eligible transition activities', maxPoints: 7, description: 'Proceeds used exclusively for eligible transition activities' },
      { id: 'quantifiable', name: 'Quantifiable emissions reductions', maxPoints: 7, description: 'Expected emissions reductions are quantified' },
      { id: 'no_lockin', name: 'No carbon lock-in', maxPoints: 6, description: 'Avoids lock-in of carbon-intensive assets' }
    ]
  },
  selection: {
    name: 'Project Evaluation & Selection',
    maxScore: 20 as const,
    criteria: [
      { id: 'criteria_defined', name: 'Clear selection criteria', maxPoints: 7, description: 'Project selection criteria are clearly defined' },
      { id: 'sectoral_pathway', name: 'Sectoral decarbonization alignment', maxPoints: 7, description: 'Aligned with sectoral decarbonization pathway' },
      { id: 'governance', name: 'Governance structure', maxPoints: 6, description: 'Governance structure for project selection exists' }
    ]
  },
  management: {
    name: 'Management of Proceeds',
    maxScore: 20 as const,
    criteria: [
      { id: 'tracking', name: 'Dedicated tracking system', maxPoints: 10, description: 'Dedicated account or tracking system for proceeds' },
      { id: 'unallocated', name: 'Unallocated proceeds process', maxPoints: 10, description: 'Process for managing unallocated proceeds defined' }
    ]
  },
  reporting: {
    name: 'Reporting',
    maxScore: 20 as const,
    criteria: [
      { id: 'annual_commitment', name: 'Annual reporting commitment', maxPoints: 7, description: 'Commitment to annual reporting on use of proceeds' },
      { id: 'emissions_reporting', name: 'Emissions impact reporting', maxPoints: 7, description: 'Reporting on expected and achieved emissions reductions' },
      { id: 'external_review', name: 'External verification', maxPoints: 6, description: 'External review/verification of reports' }
    ]
  }
} as const;
