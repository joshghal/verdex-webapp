// AI-Enhanced Greenwashing Evaluator
// Based on: ICMA Green Bond Principles, EU Taxonomy, SBTi, TCFD, Climate Bonds Initiative

import { evaluateGreenwashComponent } from '../ai/greenwash-api-handler';

// ============================================================================
// TYPES
// ============================================================================

export interface GreenwashComponentEvaluation {
  component: 'claimCredibility' | 'documentConsistency' | 'commitmentStrength' | 'verificationAdequacy';
  componentName: string;
  maxScore: 25;
  score: number;
  confidence: number;
  findings: {
    criterion: string;
    maxPoints: number;
    points: number;
    status: 'strong' | 'adequate' | 'weak' | 'missing';
    evidence: string;
    concern?: string;
  }[];
  overallAssessment: string;
  recommendations: string[];
}

export interface AIGreenwashResult {
  success: boolean;
  totalScore: number; // 0-100 (higher = less greenwashing risk)
  riskLevel: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
  confidence: number;
  components: GreenwashComponentEvaluation[];
  summary: string;
  topConcerns: string[];
  positiveFindings: string[];
}

export interface ProjectDataForGreenwash {
  projectName: string;
  sector: string;
  description: string;
  transitionStrategy: string;
  targetYear: number;
  currentEmissions: { scope1: number; scope2: number; scope3?: number };
  targetEmissions: { scope1: number; scope2: number; scope3?: number };
  totalCost: number;
  hasPublishedPlan: boolean;
  thirdPartyVerification: boolean;
}

// ============================================================================
// REFERENCE DOCUMENTATION
// ============================================================================

const FRAMEWORK_REFERENCES = `
## Reference Standards (for evaluation):

### SBTi (Science Based Targets initiative)
- 1.5°C alignment requires ~4.2% annual emissions reduction
- Near-term targets: 5-10 years from base year
- Must cover Scope 1, 2, and material Scope 3
- Targets must be validated by SBTi

### ICMA Green Bond Principles
- Clear Use of Proceeds with eligible categories
- Process for Project Evaluation and Selection
- Management of Proceeds with tracking
- Annual Reporting with impact metrics

### EU Taxonomy (Regulation 2020/852)
- Substantial contribution to climate objectives
- Do No Significant Harm (DNSH) to other objectives
- Minimum social safeguards compliance
- Technical screening criteria alignment

### TCFD Recommendations
- Governance: Board oversight of climate risks
- Strategy: Climate impacts on business
- Risk Management: Climate risk identification
- Metrics & Targets: Scope 1, 2, 3 emissions
`;

// ============================================================================
// COMPONENT PROMPTS
// ============================================================================

const COMPONENT_PROMPTS = {
  claimCredibility: `You are an expert greenwashing analyst evaluating CLAIM CREDIBILITY.
${FRAMEWORK_REFERENCES}

CONTEXT: This may be a DRAFT proposal document. Proposed targets ("will reduce by X%") are appropriate
for drafts. Evaluate if targets are realistic and aligned with standards, not whether they're achieved.

## Evaluate Claim Credibility (25 points max):

1. Emissions Reduction Realism (10 points):
   - Strong (10): Reduction targets align with SBTi benchmarks (~4.2%/year for 1.5°C) or 25-50% by 2030
   - Adequate (5-9): Targets are reasonable for the sector
   - Weak (1-4): Targets unrealistic (99%+, or <5% over many years)
   - Missing (0): No reduction targets stated

2. Timeline Feasibility (8 points):
   - Strong (8): Timeline with milestones (2030, 2035, 2050 are standard)
   - Adequate (4-7): Timeline exists but milestones unclear
   - Weak (1-3): No clear timeline or >2050 only
   - Missing (0): No timeline

3. Cost-Benefit Coherence (7 points):
   - Strong (7): Financial projections stated and reasonable
   - Adequate (4-6): Some financial info but incomplete
   - Weak (1-3): Financial claims inconsistent
   - Missing (0): No financial information

NOTE: Only flag truly unrealistic claims (99%, guaranteed, zero risk). Standard ambitious targets (28-45% reduction by 2030) are credible.

Return JSON:
{
  "component": "claimCredibility",
  "componentName": "Claim Credibility",
  "maxScore": 25,
  "score": <0-25>,
  "confidence": <0-100>,
  "findings": [{"criterion": "...", "maxPoints": X, "points": <0-X>, "status": "strong|adequate|weak|missing", "evidence": "<max 30 words>", "concern": "<if weak/missing, max 20 words>"}],
  "overallAssessment": "<1 sentence>",
  "recommendations": ["<max 15 words each>"]
}`,

  documentConsistency: `You are an expert greenwashing analyst evaluating DOCUMENT CONSISTENCY.
${FRAMEWORK_REFERENCES}

CONTEXT: This may be a DRAFT proposal document. Evaluate internal consistency, not whether data is verified.

## Evaluate Document Consistency (25 points max):

1. Numerical Consistency (10 points):
   - Strong (10): Numbers (emissions, costs, percentages) are internally consistent
   - Adequate (5-9): Minor discrepancies but overall coherent
   - Weak (1-4): Significant numerical contradictions
   - Missing (0): Insufficient data

2. Narrative Alignment (8 points):
   - Strong (8): Coherent narrative throughout
   - Adequate (4-7): Minor inconsistencies
   - Weak (1-3): Conflicting claims
   - Missing (0): No coherent narrative

3. Baseline Integrity (7 points):
   - Strong (7): Baseline data stated with methodology (GHG Protocol, etc.)
   - Adequate (4-6): Baseline exists but methodology unclear
   - Weak (1-3): Baseline data seems questionable or unverified
   - Missing (0): No baseline data provided

IMPORTANT: Check if Scope 1+2+3 totals match stated totals, if reduction percentages are mathematically correct.

Return JSON:
{
  "component": "documentConsistency",
  "componentName": "Document Consistency",
  "maxScore": 25,
  "score": <0-25>,
  "confidence": <0-100>,
  "findings": [{"criterion": "...", "maxPoints": X, "points": <0-X>, "status": "strong|adequate|weak|missing", "evidence": "<max 30 words>", "concern": "<if weak/missing, max 20 words>"}],
  "overallAssessment": "<1 sentence>",
  "recommendations": ["<max 15 words each>"]
}`,

  commitmentStrength: `You are an expert greenwashing analyst evaluating COMMITMENT STRENGTH.
${FRAMEWORK_REFERENCES}

CONTEXT: This may be a DRAFT proposal document. Commitment language ("will achieve", "committed to", "target:")
is APPROPRIATE for drafts and should be scored as STRONG. Only flag truly vague language without specifics.

## Evaluate Commitment Strength (25 points max):

1. Specificity (10 points):
   - Strong (10): Specific numbers, dates, and metrics (e.g., "42% reduction by 2030", "will achieve X by Y")
   - Adequate (5-9): Some specifics but minor gaps
   - Weak (1-4): Vague language WITHOUT any specifics ("aim to" with no numbers/dates)
   - Missing (0): No commitments at all

2. Accountability (8 points):
   - Strong (8): Governance structure mentioned (board oversight, committee, named parties) - proposed counts
   - Adequate (4-7): Some accountability mentioned
   - Weak (1-3): Vague references only
   - Missing (0): No accountability mentioned

3. Measurability (7 points):
   - Strong (7): KPIs defined with methodology (GHG Protocol, ISO 14064, SBTi)
   - Adequate (4-6): Some KPIs mentioned
   - Weak (1-3): Vague metrics
   - Missing (0): No measurable indicators

NOTE: In draft/proposal documents, "will" and "committed to" with specific targets IS strong commitment.
Only flag "aspire", "explore", "consider" if they lack specific numbers AND dates.

Return JSON:
{
  "component": "commitmentStrength",
  "componentName": "Commitment Strength",
  "maxScore": 25,
  "score": <0-25>,
  "confidence": <0-100>,
  "findings": [{"criterion": "...", "maxPoints": X, "points": <0-X>, "status": "strong|adequate|weak|missing", "evidence": "<max 30 words>", "concern": "<if weak/missing, max 20 words>"}],
  "overallAssessment": "<1 sentence>",
  "recommendations": ["<max 15 words each>"]
}`,

  verificationAdequacy: `You are an expert greenwashing analyst evaluating VERIFICATION & TRANSPARENCY.
${FRAMEWORK_REFERENCES}

CONTEXT: This may be a DRAFT proposal document. Verification COMMITMENTS ("will engage", "annual verification
by independent auditor") should be scored as STRONG. A draft cannot have completed verification yet.

## Evaluate Verification Adequacy (25 points max):

1. Third-Party Verification (10 points):
   - Strong (10): Verification by credible provider - either completed OR committed ("will engage DNV", "annual third-party verification")
   - Adequate (5-9): General verification mentioned without specific provider
   - Weak (1-4): Self-verification only
   - Missing (0): No verification mentioned at all

2. Reporting Framework (8 points):
   - Strong (8): References recognized standards (GHG Protocol, TCFD, CDP, GRI, ISO 14064, SBTi)
   - Adequate (4-7): Some standards mentioned
   - Weak (1-3): No standard framework
   - Missing (0): No reporting framework

3. Disclosure Completeness (7 points):
   - Strong (7): Scope 1, 2, 3 emissions disclosed; methodology stated
   - Adequate (4-6): Most aspects disclosed
   - Weak (1-3): Significant gaps
   - Missing (0): Minimal disclosure

CREDIBLE VERIFIERS (commitment to any = STRONG): DNV, Bureau Veritas, SGS, KPMG, EY, Deloitte, PwC, Sustainalytics, CICERO, ISS ESG, SBTi

Return JSON:
{
  "component": "verificationAdequacy",
  "componentName": "Verification & Transparency",
  "maxScore": 25,
  "score": <0-25>,
  "confidence": <0-100>,
  "findings": [{"criterion": "...", "maxPoints": X, "points": <0-X>, "status": "strong|adequate|weak|missing", "evidence": "<max 30 words>", "concern": "<if weak/missing, max 20 words>"}],
  "overallAssessment": "<1 sentence>",
  "recommendations": ["<max 15 words each>"]
}`
};

// ============================================================================
// EVALUATION FUNCTIONS
// ============================================================================

/**
 * Evaluate a single greenwashing component with AI
 */
async function evaluateSingleGreenwashComponent(
  component: keyof typeof COMPONENT_PROMPTS,
  documentText: string,
  projectData: ProjectDataForGreenwash
): Promise<GreenwashComponentEvaluation | null> {
  const systemPrompt = COMPONENT_PROMPTS[component];

  try {
    const result = await evaluateGreenwashComponent<GreenwashComponentEvaluation>(
      systemPrompt,
      documentText,
      projectData
    );

    if (result.success && result.data) {
      return {
        ...result.data,
        maxScore: 25 as const,
        score: Math.min(Math.max(result.data.score || 0, 0), 25)
      };
    }
  } catch (error) {
    console.error(`[AI Greenwash] Evaluation failed for ${component}:`, error);
  }

  return null;
}

/**
 * Calculate risk level from score
 */
function calculateRiskLevel(score: number): AIGreenwashResult['riskLevel'] {
  if (score >= 80) return 'low';
  if (score >= 60) return 'medium-low';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'medium-high';
  return 'high';
}

/**
 * Evaluate all 4 greenwashing components in parallel
 */
export async function evaluateGreenwashingWithAI(
  documentText: string,
  projectData: ProjectDataForGreenwash
): Promise<AIGreenwashResult> {
  console.log('[AI Greenwash] Starting AI-powered greenwashing evaluation...');

  const componentTypes: (keyof typeof COMPONENT_PROMPTS)[] = [
    'claimCredibility',
    'documentConsistency',
    'commitmentStrength',
    'verificationAdequacy'
  ];

  // Evaluate all components in parallel
  const results = await Promise.all(
    componentTypes.map(comp => evaluateSingleGreenwashComponent(comp, documentText, projectData))
  );

  // Filter out failed evaluations
  const successfulResults = results.filter((r): r is GreenwashComponentEvaluation => r !== null);

  if (successfulResults.length === 0) {
    console.log('[AI Greenwash] All AI evaluations failed, returning error result');
    return {
      success: false,
      totalScore: 0,
      riskLevel: 'high',
      confidence: 0,
      components: [],
      summary: 'AI greenwashing evaluation failed - using rule-based fallback',
      topConcerns: [],
      positiveFindings: []
    };
  }

  // Calculate total score
  const totalScore = successfulResults.reduce((sum, r) => sum + r.score, 0);
  const maxPossibleScore = successfulResults.length * 25;
  const normalizedScore = Math.round((totalScore / maxPossibleScore) * 100);

  // Calculate average confidence
  const avgConfidence = Math.round(
    successfulResults.reduce((sum, r) => sum + r.confidence, 0) / successfulResults.length
  );

  // Extract top concerns (weak/missing findings)
  const topConcerns: string[] = [];
  successfulResults.forEach(comp => {
    comp.findings
      .filter(f => f.status === 'weak' || f.status === 'missing')
      .forEach(f => {
        if (f.concern) topConcerns.push(`${comp.componentName}: ${f.concern}`);
      });
  });

  // Extract positive findings (strong findings)
  const positiveFindings: string[] = [];
  successfulResults.forEach(comp => {
    comp.findings
      .filter(f => f.status === 'strong')
      .forEach(f => {
        positiveFindings.push(`${f.criterion}: ${f.evidence}`);
      });
  });

  // Generate summary
  const riskLevel = calculateRiskLevel(normalizedScore);
  const summary = `AI greenwashing analysis: ${normalizedScore}/100 (${riskLevel} risk). ` +
    `Evaluated ${successfulResults.length}/4 components with ${avgConfidence}% average confidence.`;

  console.log(`[AI Greenwash] Complete: ${normalizedScore}/100, ${riskLevel} risk`);

  return {
    success: true,
    totalScore: normalizedScore,
    riskLevel,
    confidence: avgConfidence,
    components: successfulResults,
    summary,
    topConcerns: topConcerns.slice(0, 5),
    positiveFindings: positiveFindings.slice(0, 5)
  };
}

/**
 * Convert AI greenwash score to penalty (inverse relationship)
 * Higher AI score = less greenwashing = lower penalty
 */
export function aiScoreToGreenwashPenalty(aiScore: number): number {
  // AI score 0-100 where higher = less greenwashing risk
  // Convert to penalty: 0-100 where higher = more penalty
  // But cap penalty at 20 to not overwhelm LMA score

  if (aiScore >= 80) return 0; // Low risk = no penalty
  if (aiScore >= 60) return 3; // Medium-low risk = small penalty
  if (aiScore >= 40) return 6; // Medium risk = moderate penalty
  if (aiScore >= 20) return 12; // Medium-high risk = significant penalty
  return 20; // High risk = maximum penalty
}
