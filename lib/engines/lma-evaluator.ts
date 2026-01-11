// LMA Component Evaluation Engine
// Orchestrates parallel evaluation of all 5 LMA components using AI

import { evaluateLMAComponent } from '../ai/lma-api-handler';
import {
  LMAComponentEvaluation,
  LMAComponentType,
  LMAEvaluationResult,
  AggregatedLMAScore,
  ComponentSections,
  ExtractedFields,
  ProjectContext,
  LMA_COMPONENTS
} from '../../app/api/lma/types';

// Reference to official LMA Transition Loan document
const LMA_REFERENCE = `
IMPORTANT: Base your evaluation on the LMA (Loan Market Association) Transition Finance Principles.
Reference document: https://www.lma.eu.com/application/files/8017/6121/0645/Guide_to_Transition_Loans_-_16_October_2025.pdf
`;

// System prompts for each component evaluation
// NOTE: These prompts are designed to evaluate DRAFT documents where commitments ("will", "committed to")
// should be scored the same as completed actions, since drafts propose future actions.
const COMPONENT_PROMPTS: Record<LMAComponentType, string> = {
  strategy: `You are an expert evaluator for LMA (Loan Market Association) Transition Finance.
${LMA_REFERENCE}

IMPORTANT CONTEXT: You are evaluating a DRAFT transition loan document. Commitments and planned actions
("will engage", "committed to", "plan to") should be scored as FULLY MET, not partial. A draft document
cannot claim actions are already completed - it proposes commitments.

Evaluate the Entity-level Transition Strategy component (20 points max).

## Criteria to Evaluate:
1. Published transition plan (5 points): Is there a documented transition plan/strategy?
   - Full (5): Document presents a clear transition plan/strategy (this document itself counts, OR mentions entity has one)
   - Partial (2-4): Vague or incomplete strategy
   - Missing (0-1): No strategy evident

2. Paris Agreement alignment (5 points): Does it target 1.5°C or well-below 2°C?
   - Full (5): Explicit reference to 1.5°C, Paris Agreement, SBTi-aligned targets, or NDC
   - Partial (2-4): General climate targets without specific alignment
   - Missing (0-1): No climate alignment mentioned

3. Economy-wide coverage (5 points): Does it cover the entire entity, not just this project?
   - Full (5): Strategy applies to entire organization/entity OR project is clearly part of broader entity strategy
   - Partial (2-4): Covers multiple operations but not comprehensive
   - Missing (0-1): Only isolated project with no entity context

4. Third-party verification (5 points): Is verification addressed?
   - Full (5): Explicit mention of third-party verification - either completed, planned, or committed ("will engage", "annual verification")
   - Partial (2-4): Self-assessment only
   - Missing (0-1): No verification mentioned at all

IMPORTANT: Keep all text CONCISE (max 50 words per field). No lengthy explanations.

Return a JSON object with this exact structure:
{
  "component": "strategy",
  "componentName": "Entity-level Transition Strategy",
  "maxScore": 20,
  "score": <total score 0-20>,
  "confidence": <0-100>,
  "subScores": [
    {
      "criterion": "Published transition plan",
      "maxPoints": 5,
      "points": <0-5>,
      "status": "met" | "partial" | "missing",
      "evidence": "<short quote, max 30 words>",
      "reasoning": "<brief reason, max 20 words>"
    }
  ],
  "overallReasoning": "<1 sentence summary>",
  "improvements": ["<short action, max 15 words each>"],
  "keyQuotes": [{"quote": "<max 30 words>", "relevance": "<max 15 words>"}]
}`,

  proceeds: `You are an expert evaluator for LMA (Loan Market Association) Transition Finance.
${LMA_REFERENCE}

IMPORTANT CONTEXT: You are evaluating a DRAFT transition loan document. Commitments ("will be used for",
"allocated to") should be scored as FULLY MET. The document proposes how proceeds WILL be used.

Evaluate the Use of Proceeds component (20 points max).

## Criteria to Evaluate:
1. Eligible transition activities (7 points): Are proceeds allocated to eligible transition activities?
   - Full (7): Clear eligible activities defined (renewable energy, efficiency, clean tech, emissions reduction)
   - Partial (3-6): Some eligible activities but vague or incomplete
   - Missing (0-2): No clear definition of eligible activities

2. Quantifiable emissions reductions (7 points): Are expected emissions reductions quantified?
   - Full (7): Specific numbers/percentages for emissions reductions (e.g., "28% reduction", "12,000 tCO2e")
   - Partial (3-6): General reduction goals without specific quantification
   - Missing (0-2): No quantified emissions reduction expectations

3. No carbon lock-in (6 points): Does it avoid lock-in of carbon-intensive assets?
   - Full (6): No fossil fuel investments AND proceeds restricted to transition activities
   - Partial (2-5): Avoids fossil fuels but restrictions unclear
   - Missing (0-1): Risk of carbon lock-in

   NOTE: Award FULL points if document restricts funds to "eligible transition activities" or similar.

IMPORTANT: Keep all text CONCISE (max 50 words per field). No lengthy explanations.

Return JSON:
{
  "component": "proceeds",
  "componentName": "Use of Proceeds",
  "maxScore": 20,
  "score": <0-20>,
  "confidence": <0-100>,
  "subScores": [{"criterion": "...", "maxPoints": 7, "points": <0-7>, "status": "met|partial|missing", "evidence": "<max 30 words>", "reasoning": "<max 20 words>"}],
  "overallReasoning": "<1 sentence>",
  "improvements": ["<max 15 words each>"],
  "keyQuotes": [{"quote": "<max 30 words>", "relevance": "<max 15 words>"}]
}`,

  selection: `You are an expert evaluator for LMA (Loan Market Association) Transition Finance.
${LMA_REFERENCE}

IMPORTANT CONTEXT: You are evaluating a DRAFT transition loan document. Proposed governance structures
and selection criteria should be scored as FULLY MET if clearly described, even if not yet implemented.

Evaluate the Project Evaluation & Selection component (20 points max).

## Criteria to Evaluate:
1. Clear selection criteria (7 points): Are project selection criteria defined?
   - Full (7): Explicit eligibility criteria for projects/activities
   - Partial (3-6): Some criteria but incomplete
   - Missing (0-2): No criteria defined

2. Sectoral decarbonization alignment (7 points): Is it aligned with sectoral decarbonization pathway?
   - Full (7): References SBTi, Paris Agreement, NDC, sectoral pathways, or 1.5°C alignment
   - Partial (3-6): General decarbonization without specific pathway reference
   - Missing (0-2): No sectoral alignment

3. Governance structure (6 points): Is there a governance structure described?
   - Full (6): Board oversight, committee, or approval process mentioned (proposed counts)
   - Partial (2-5): Some governance but incomplete
   - Missing (0-1): No governance mentioned

IMPORTANT: Keep all text CONCISE (max 50 words per field).

Return JSON:
{
  "component": "selection",
  "componentName": "Project Evaluation & Selection",
  "maxScore": 20,
  "score": <0-20>,
  "confidence": <0-100>,
  "subScores": [{"criterion": "...", "maxPoints": 7, "points": <0-7>, "status": "met|partial|missing", "evidence": "<max 30 words>", "reasoning": "<max 20 words>"}],
  "overallReasoning": "<1 sentence>",
  "improvements": ["<max 15 words each>"],
  "keyQuotes": [{"quote": "<max 30 words>", "relevance": "<max 15 words>"}]
}`,

  management: `You are an expert evaluator for LMA (Loan Market Association) Transition Finance.
${LMA_REFERENCE}

IMPORTANT CONTEXT: You are evaluating a DRAFT transition loan document. Proposed fund management
mechanisms should be scored as FULLY MET if clearly described ("will establish", "dedicated account").

Evaluate the Management of Proceeds component (20 points max).

## Criteria to Evaluate:
1. Dedicated tracking system (10 points): Is fund tracking addressed?
   - Full (10): Mentions dedicated account, segregated funds, sub-account, or tracking system (proposed counts)
   - Partial (4-9): General financial management without specific tracking
   - Missing (0-3): No tracking mentioned

2. Unallocated proceeds process (10 points): Is unallocated proceeds management addressed?
   - Full (10): Policy for temporary funds described (treasury, eligible investments, etc.)
   - Partial (4-9): Some fund management but process unclear
   - Missing (0-3): No process for unallocated proceeds

IMPORTANT: Keep all text CONCISE (max 50 words per field).

Return JSON:
{
  "component": "management",
  "componentName": "Management of Proceeds",
  "maxScore": 20,
  "score": <0-20>,
  "confidence": <0-100>,
  "subScores": [{"criterion": "...", "maxPoints": 10, "points": <0-10>, "status": "met|partial|missing", "evidence": "<max 30 words>", "reasoning": "<max 20 words>"}],
  "overallReasoning": "<1 sentence>",
  "improvements": ["<max 15 words each>"],
  "keyQuotes": [{"quote": "<max 30 words>", "relevance": "<max 15 words>"}]
}`,

  reporting: `You are an expert evaluator for LMA (Loan Market Association) Transition Finance.
${LMA_REFERENCE}

IMPORTANT CONTEXT: You are evaluating a DRAFT transition loan document. Reporting COMMITMENTS
("will report annually", "committed to verification") should be scored as FULLY MET - the document
proposes future reporting, it cannot have already reported.

Evaluate the Reporting component (20 points max).

## Criteria to Evaluate:
1. Annual reporting commitment (7 points): Is annual reporting addressed?
   - Full (7): Commitment to annual/regular reporting on proceeds/impact ("will report", "annual reporting")
   - Partial (3-6): Some reporting mentioned but frequency unclear
   - Missing (0-2): No reporting commitment

2. Emissions impact reporting (7 points): Will emissions reductions be reported?
   - Full (7): Commitment to report emissions/impact metrics (KPIs, tCO2e reductions, etc.)
   - Partial (3-6): General impact reporting without emissions specifics
   - Missing (0-2): No emissions reporting

3. External verification (6 points): Is external verification addressed?
   - Full (6): Commitment to third-party/external verification, audit, or SPO ("will engage", "annual verification")
   - Partial (2-5): Internal review only
   - Missing (0-1): No verification mentioned

IMPORTANT: Keep all text CONCISE (max 50 words per field).

Return JSON:
{
  "component": "reporting",
  "componentName": "Reporting",
  "maxScore": 20,
  "score": <0-20>,
  "confidence": <0-100>,
  "subScores": [{"criterion": "...", "maxPoints": 7, "points": <0-7>, "status": "met|partial|missing", "evidence": "<max 30 words>", "reasoning": "<max 20 words>"}],
  "overallReasoning": "<1 sentence>",
  "improvements": ["<max 15 words each>"],
  "keyQuotes": [{"quote": "<max 30 words>", "relevance": "<max 15 words>"}]
}`
};

// Minimum confidence threshold to trust AI evaluation
const MIN_CONFIDENCE_THRESHOLD = 30;

/**
 * Keyword-based fallback evaluation for when AI fails or returns low confidence
 */
function keywordBasedFallback(
  component: LMAComponentType,
  componentSection: string,
  extractedFields: ExtractedFields,
  _projectContext: ProjectContext // Prefixed with _ to indicate intentionally unused
): LMAComponentEvaluation {
  const componentMeta = LMA_COMPONENTS[component];
  const fullText = (componentSection + ' ' + (extractedFields.description || '') + ' ' + (extractedFields.transitionPlan || '')).toLowerCase();

  let score = 0;
  const subScores: LMAComponentEvaluation['subScores'] = [];
  const improvements: string[] = [];

  switch (component) {
    case 'strategy': {
      // Published plan (5 pts)
      const hasPlan = extractedFields.transitionPlan || fullText.includes('transition plan') || fullText.includes('climate strategy');
      subScores.push({
        criterion: 'Published transition plan',
        maxPoints: 5,
        points: hasPlan ? 5 : 0,
        status: hasPlan ? 'met' : 'missing',
        evidence: hasPlan ? 'Transition plan reference found' : '',
        reasoning: hasPlan ? 'Document references transition plan' : 'No published transition plan found'
      });
      if (hasPlan) score += 5;
      else improvements.push('Publish a board-approved transition strategy document');

      // Paris alignment (5 pts)
      const parisAligned = fullText.includes('paris') || fullText.includes('1.5') || fullText.includes('ndc') || fullText.includes('sbti');
      subScores.push({
        criterion: 'Paris Agreement alignment',
        maxPoints: 5,
        points: parisAligned ? 5 : 0,
        status: parisAligned ? 'met' : 'missing',
        evidence: parisAligned ? 'Paris/1.5°C reference found' : '',
        reasoning: parisAligned ? 'References Paris Agreement or 1.5°C target' : 'No Paris alignment keywords found'
      });
      if (parisAligned) score += 5;
      else improvements.push('Align targets with Paris Agreement 1.5°C pathway');

      // Economy-wide (5 pts)
      const economyWide = fullText.includes('company-wide') || fullText.includes('organization') || fullText.includes('entity-level') || fullText.includes('corporate');
      subScores.push({
        criterion: 'Economy-wide coverage',
        maxPoints: 5,
        points: economyWide ? 5 : 2,
        status: economyWide ? 'met' : 'partial',
        evidence: '',
        reasoning: economyWide ? 'References entity-wide scope' : 'Scope unclear - may be project-level only'
      });
      score += economyWide ? 5 : 2;
      if (!economyWide) improvements.push('Clarify that strategy covers entire organization');

      // Third-party verification (5 pts)
      const verified = extractedFields.verificationStatus || fullText.includes('verif') || fullText.includes('audit') || fullText.includes('third party') || fullText.includes('independent');
      subScores.push({
        criterion: 'Third-party verification',
        maxPoints: 5,
        points: verified ? 5 : 0,
        status: verified ? 'met' : 'missing',
        evidence: verified ? 'Verification reference found' : '',
        reasoning: verified ? 'Third-party verification mentioned' : 'No verification mentioned'
      });
      if (verified) score += 5;
      else improvements.push('Engage independent verifier (DNV, KPMG, EY)');
      break;
    }

    case 'proceeds': {
      // Eligible activities (7 pts)
      const cleanTerms = ['renewable', 'solar', 'wind', 'efficiency', 'clean', 'green', 'transition', 'decarbonization'];
      const hasEligible = cleanTerms.some(term => fullText.includes(term));
      subScores.push({
        criterion: 'Eligible transition activities',
        maxPoints: 7,
        points: hasEligible ? 7 : 2,
        status: hasEligible ? 'met' : 'partial',
        evidence: hasEligible ? 'Clean/transition terms found' : '',
        reasoning: hasEligible ? 'Proceeds support transition activities' : 'Unclear use of proceeds'
      });
      score += hasEligible ? 7 : 2;
      if (!hasEligible) improvements.push('Clearly define eligible transition activities');

      // Quantifiable reductions (7 pts)
      const hasQuantified = extractedFields.statedReductionPercent || extractedFields.totalTargetEmissions || fullText.match(/\d+%/) || fullText.includes('reduction');
      subScores.push({
        criterion: 'Quantifiable emissions reductions',
        maxPoints: 7,
        points: hasQuantified ? 7 : 0,
        status: hasQuantified ? 'met' : 'missing',
        evidence: hasQuantified ? 'Quantified reduction reference found' : '',
        reasoning: hasQuantified ? 'Emissions reductions quantified' : 'No quantified emissions reductions'
      });
      if (hasQuantified) score += 7;
      else improvements.push('Quantify expected emissions reductions with specific targets');

      // No lock-in (6 pts) - check for fossil AND contingency restrictions
      const fossilTerms = ['coal', 'oil', 'gas', 'fossil'];
      const hasFossil = fossilTerms.some(term => fullText.includes(term) && !fullText.includes(`not ${term}`) && !fullText.includes(`no ${term}`));

      // Check for explicit contingency fund restrictions (gives full points if present)
      const hasContingencyRestriction =
        fullText.includes('contingency') && (
          fullText.includes('restricted to eligible') ||
          fullText.includes('restricted to transition') ||
          fullText.includes('restricted to green') ||
          fullText.includes('not be used for carbon') ||
          fullText.includes('not be used for fossil') ||
          fullText.includes('zero carbon lock-in') ||
          fullText.includes('will not be deployed for carbon')
        );

      // Full points if: no fossil fuel OR has explicit contingency restriction
      const noLockInScore = (hasFossil && !hasContingencyRestriction) ? 2 : 6;
      const noLockInStatus = noLockInScore === 6 ? 'met' : 'partial';

      subScores.push({
        criterion: 'No carbon lock-in',
        maxPoints: 6,
        points: noLockInScore,
        status: noLockInStatus,
        evidence: hasContingencyRestriction ? 'Contingency funds restricted to green uses' : '',
        reasoning: noLockInScore === 6
          ? (hasContingencyRestriction ? 'Explicit contingency restrictions in place' : 'No carbon lock-in risk detected')
          : 'Potential lock-in risk - clarify contingency fund usage'
      });
      score += noLockInScore;
      if (noLockInScore < 6) improvements.push('Add explicit restriction on contingency fund usage');
      break;
    }

    case 'selection': {
      // Selection criteria (7 pts)
      const hasCriteria = fullText.includes('criteria') || fullText.includes('selection') || fullText.includes('eligib');
      subScores.push({
        criterion: 'Clear selection criteria',
        maxPoints: 7,
        points: hasCriteria ? 7 : 3,
        status: hasCriteria ? 'met' : 'partial',
        evidence: '',
        reasoning: hasCriteria ? 'Selection criteria referenced' : 'Selection criteria unclear'
      });
      score += hasCriteria ? 7 : 3;
      if (!hasCriteria) improvements.push('Define explicit project selection criteria');

      // Sectoral alignment (7 pts)
      const sectorAligned = fullText.includes('sector') || fullText.includes('pathway') || fullText.includes('iea') || fullText.includes('industry');
      subScores.push({
        criterion: 'Sectoral decarbonization alignment',
        maxPoints: 7,
        points: sectorAligned ? 7 : 3,
        status: sectorAligned ? 'met' : 'partial',
        evidence: '',
        reasoning: sectorAligned ? 'Sectoral pathway reference found' : 'No sectoral pathway alignment'
      });
      score += sectorAligned ? 7 : 3;
      if (!sectorAligned) improvements.push('Reference sectoral decarbonization pathway (IEA, SBTi)');

      // Governance (6 pts)
      const hasGovernance = fullText.includes('governance') || fullText.includes('committee') || fullText.includes('board') || fullText.includes('approval');
      subScores.push({
        criterion: 'Governance structure',
        maxPoints: 6,
        points: hasGovernance ? 6 : 2,
        status: hasGovernance ? 'met' : 'partial',
        evidence: '',
        reasoning: hasGovernance ? 'Governance structure referenced' : 'Governance structure unclear'
      });
      score += hasGovernance ? 6 : 2;
      if (!hasGovernance) improvements.push('Define governance structure for project selection');
      break;
    }

    case 'management': {
      // Tracking system (10 pts)
      const hasTracking = fullText.includes('account') || fullText.includes('tracking') || fullText.includes('segregat') || fullText.includes('dedicat');
      subScores.push({
        criterion: 'Dedicated tracking system',
        maxPoints: 10,
        points: hasTracking ? 10 : 3,
        status: hasTracking ? 'met' : 'partial',
        evidence: '',
        reasoning: hasTracking ? 'Dedicated tracking/account mentioned' : 'No dedicated tracking system described'
      });
      score += hasTracking ? 10 : 3;
      if (!hasTracking) improvements.push('Establish dedicated account or tracking system for proceeds');

      // Unallocated proceeds (10 pts)
      const hasUnallocated = fullText.includes('unallocated') || fullText.includes('temporary') || fullText.includes('treasury') || fullText.includes('hold');
      subScores.push({
        criterion: 'Unallocated proceeds process',
        maxPoints: 10,
        points: hasUnallocated ? 10 : 3,
        status: hasUnallocated ? 'met' : 'partial',
        evidence: '',
        reasoning: hasUnallocated ? 'Unallocated proceeds process mentioned' : 'No process for unallocated proceeds'
      });
      score += hasUnallocated ? 10 : 3;
      if (!hasUnallocated) improvements.push('Define process for managing unallocated proceeds');
      break;
    }

    case 'reporting': {
      // Annual reporting (7 pts)
      const hasAnnual = fullText.includes('annual') || fullText.includes('yearly') || fullText.includes('report');
      subScores.push({
        criterion: 'Annual reporting commitment',
        maxPoints: 7,
        points: hasAnnual ? 7 : 2,
        status: hasAnnual ? 'met' : 'partial',
        evidence: '',
        reasoning: hasAnnual ? 'Reporting commitment mentioned' : 'No annual reporting commitment'
      });
      score += hasAnnual ? 7 : 2;
      if (!hasAnnual) improvements.push('Commit to annual reporting on use of proceeds');

      // Emissions reporting (7 pts)
      const hasEmissionsReport = fullText.includes('emission') || fullText.includes('ghg') || fullText.includes('carbon') || fullText.includes('impact');
      subScores.push({
        criterion: 'Emissions impact reporting',
        maxPoints: 7,
        points: hasEmissionsReport ? 7 : 2,
        status: hasEmissionsReport ? 'met' : 'partial',
        evidence: '',
        reasoning: hasEmissionsReport ? 'Emissions reporting mentioned' : 'No emissions impact reporting'
      });
      score += hasEmissionsReport ? 7 : 2;
      if (!hasEmissionsReport) improvements.push('Plan to report on emissions impacts');

      // External verification (6 pts)
      const hasExternal = fullText.includes('external') || fullText.includes('third party') || fullText.includes('verif') || fullText.includes('audit');
      subScores.push({
        criterion: 'External verification',
        maxPoints: 6,
        points: hasExternal ? 6 : 0,
        status: hasExternal ? 'met' : 'missing',
        evidence: '',
        reasoning: hasExternal ? 'External verification mentioned' : 'No external verification planned'
      });
      if (hasExternal) score += 6;
      else improvements.push('Plan external verification of reports');
      break;
    }
  }

  return {
    component,
    componentName: componentMeta.name,
    maxScore: 20,
    score: Math.min(score, 20),
    confidence: 50, // Medium confidence for keyword-based
    subScores,
    overallReasoning: `Keyword-based evaluation (AI fallback): Score ${score}/20`,
    improvements,
    keyQuotes: []
  };
}

/**
 * Compliance boost patterns - explicit statements that guarantee full points
 * These patterns override AI evaluation if found in the document
 */
const COMPLIANCE_BOOST_PATTERNS: Record<LMAComponentType, { criterion: string; patterns: string[]; boost: number }[]> = {
  strategy: [
    { criterion: 'Economy-wide coverage', patterns: ['entity-level transition strategy covers all operations', 'organization-wide', 'entire corporate entity'], boost: 5 },
    { criterion: 'Third-party verification', patterns: ['third-party verification has been completed', 'independent verifier confirming'], boost: 5 },
  ],
  proceeds: [
    { criterion: 'No carbon lock-in', patterns: ['contingency funds are strictly restricted', 'contingency or reserve funds are strictly restricted', 'zero carbon lock-in risk', 'not be used for carbon-intensive', 'not be used for fossil'], boost: 6 },
  ],
  selection: [
    { criterion: 'Clear selection criteria', patterns: ['formalized selection criteria framework', 'explicit metrics and thresholds'], boost: 7 },
    { criterion: 'Governance structure', patterns: ['dedicated project selection committee', 'committee comprises senior management'], boost: 6 },
  ],
  management: [
    { criterion: 'Dedicated tracking system', patterns: ['dedicated segregated bank account', 'formal tracking system'], boost: 10 },
    { criterion: 'Unallocated proceeds process', patterns: ['unallocated proceeds will be temporarily invested', 'liquid, low-risk instruments'], boost: 10 },
  ],
  reporting: [
    { criterion: 'External verification', patterns: ['external verification is conducted by accredited', 'verification scope explicitly covers'], boost: 6 },
  ],
};

/**
 * Apply compliance boost to AI evaluation if explicit statements are found
 */
function applyComplianceBoost(
  evaluation: LMAComponentEvaluation,
  fullText: string
): LMAComponentEvaluation {
  const patterns = COMPLIANCE_BOOST_PATTERNS[evaluation.component];
  if (!patterns) return evaluation;

  const textLower = fullText.toLowerCase();
  let boosted = false;

  const updatedSubScores = evaluation.subScores.map(subScore => {
    const pattern = patterns.find(p => p.criterion.toLowerCase() === subScore.criterion.toLowerCase());
    if (!pattern) return subScore;

    // Check if any boost pattern is found in the text
    const hasBoostPattern = pattern.patterns.some(p => textLower.includes(p.toLowerCase()));

    if (hasBoostPattern && subScore.points < pattern.boost) {
      boosted = true;
      console.log(`[LMA Evaluator] Compliance boost applied: ${subScore.criterion} ${subScore.points} → ${pattern.boost}`);
      return {
        ...subScore,
        points: pattern.boost,
        status: 'met' as const,
        reasoning: `Explicit compliance statement found - ${subScore.reasoning}`
      };
    }
    return subScore;
  });

  if (boosted) {
    const newScore = Math.min(updatedSubScores.reduce((sum, s) => sum + s.points, 0), 20);
    return {
      ...evaluation,
      subScores: updatedSubScores,
      score: newScore,
      overallReasoning: `${evaluation.overallReasoning} (compliance boost applied)`
    };
  }

  return evaluation;
}

/**
 * Evaluate a single LMA component with AI, falling back to keyword-based if needed
 */
export async function evaluateSingleComponent(
  component: LMAComponentType,
  componentSection: string,
  extractedFields: ExtractedFields,
  projectContext: ProjectContext
): Promise<LMAComponentEvaluation> {
  const systemPrompt = COMPONENT_PROMPTS[component];
  const fullText = (componentSection + ' ' + (extractedFields.description || '') + ' ' + (extractedFields.transitionPlan || '')).toLowerCase();

  try {
    const result = await evaluateLMAComponent<LMAComponentEvaluation>(
      systemPrompt,
      componentSection,
      extractedFields,
      projectContext
    );

    if (result.success && result.data) {
      let aiEvaluation: LMAComponentEvaluation = {
        ...result.data,
        maxScore: 20 as const,
        score: Math.min(Math.max(result.data.score || 0, 0), 20)
      };

      // If AI confidence is too low, fall back to keyword-based
      if (aiEvaluation.confidence < MIN_CONFIDENCE_THRESHOLD) {
        console.log(`[LMA Evaluator] AI confidence too low (${aiEvaluation.confidence}%), using keyword fallback for ${component}`);
        return keywordBasedFallback(component, componentSection, extractedFields, projectContext);
      }

      // Apply compliance boost if explicit statements are found
      aiEvaluation = applyComplianceBoost(aiEvaluation, fullText);

      return aiEvaluation;
    }
  } catch (error) {
    console.error(`[LMA Evaluator] AI evaluation failed for ${component}:`, error);
  }

  // Fall back to keyword-based evaluation if AI fails
  console.log(`[LMA Evaluator] Using keyword fallback for ${component}`);
  return keywordBasedFallback(component, componentSection, extractedFields, projectContext);
}

/**
 * Evaluate all 5 LMA components in parallel
 */
export async function evaluateAllComponents(
  extractedFields: ExtractedFields,
  componentSections: ComponentSections,
  projectContext: ProjectContext
): Promise<LMAEvaluationResult> {
  const components: LMAComponentType[] = ['strategy', 'proceeds', 'selection', 'management', 'reporting'];

  const sectionMap: Record<LMAComponentType, string> = {
    strategy: componentSections.strategy,
    proceeds: componentSections.useOfProceeds,
    selection: componentSections.selection,
    management: componentSections.management,
    reporting: componentSections.reporting
  };

  try {
    // Evaluate all components in parallel
    const evaluations = await Promise.all(
      components.map(component =>
        evaluateSingleComponent(
          component,
          sectionMap[component],
          extractedFields,
          projectContext
        )
      )
    );

    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const eligibility = determineEligibility(totalScore, evaluations);

    return {
      success: true,
      components: evaluations,
      totalScore,
      eligibility,
      overallReasoning: generateOverallReasoning(evaluations, totalScore, eligibility),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      components: [],
      totalScore: 0,
      eligibility: 'ineligible',
      overallReasoning: 'Evaluation failed',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Determine eligibility based on total score and component evaluations
 */
function determineEligibility(
  totalScore: number,
  evaluations: LMAComponentEvaluation[]
): 'eligible' | 'partial' | 'ineligible' {
  // Check for any component with score of 0 (critical failure)
  const hasZeroComponent = evaluations.some(e => e.score === 0);

  if (totalScore >= 60 && !hasZeroComponent) {
    return 'eligible';
  } else if (totalScore >= 30) {
    return 'partial';
  }
  return 'ineligible';
}

/**
 * Generate overall reasoning summary
 */
function generateOverallReasoning(
  evaluations: LMAComponentEvaluation[],
  totalScore: number,
  eligibility: string
): string {
  const strongComponents = evaluations.filter(e => e.score >= 14); // 70%+
  const weakComponents = evaluations.filter(e => e.score < 10); // <50%

  let reasoning = `Total LMA Score: ${totalScore}/100 (${eligibility.toUpperCase()}). `;

  if (strongComponents.length > 0) {
    reasoning += `Strong areas: ${strongComponents.map(c => c.componentName).join(', ')}. `;
  }

  if (weakComponents.length > 0) {
    reasoning += `Areas needing improvement: ${weakComponents.map(c => c.componentName).join(', ')}. `;
  }

  return reasoning;
}

/**
 * Aggregate evaluation results into a summary
 */
export function aggregateEvaluation(
  components: LMAComponentEvaluation[]
): AggregatedLMAScore {
  const totalScore = components.reduce((sum, c) => sum + c.score, 0);

  const componentBreakdown = components.map(c => ({
    component: c.component,
    componentName: c.componentName,
    score: c.score,
    maxScore: 20 as const,
    percentage: Math.round((c.score / 20) * 100)
  }));

  const strengths = components
    .filter(c => c.score >= 14)
    .flatMap(c => c.keyQuotes.map(q => `${c.componentName}: ${q.relevance}`));

  const weaknesses = components
    .filter(c => c.score < 10)
    .map(c => `${c.componentName}: ${c.overallReasoning}`);

  const topImprovements = components
    .flatMap(c => c.improvements)
    .slice(0, 5);

  const eligibility = totalScore >= 60 ? 'eligible' :
    totalScore >= 30 ? 'partial' : 'ineligible';

  return {
    totalScore,
    eligibility,
    componentBreakdown,
    strengths,
    weaknesses,
    topImprovements
  };
}

// Export prompts for individual API endpoints
export { COMPONENT_PROMPTS };
