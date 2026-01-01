import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { searchDocuments } from '@/lib/pinecone';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

// Current year and quarter - ALL dates in draft must be >= this
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_QUARTER = Math.ceil((new Date().getMonth() + 1) / 3); // Q1=1, Q2=2, Q3=3, Q4=4

// Draft-specific API keys from environment variables (with fallback)
const DRAFT_API_KEYS = [
  process.env.GROQ_API_KEY_DRAFT_MAIN || '',
  process.env.GROQ_API_KEY_DRAFT_BACKUP || '',
].filter(key => key.length > 0);

interface DraftRequest {
  projectName: string;
  country: string;
  countryName: string;
  sector: string;
  targetYear?: number;
  description?: string;
  projectType?: string;
  totalCost?: number;
  debtAmount?: number;
  equityAmount?: number;
  currentEmissions?: { scope1: number; scope2: number; scope3?: number };
  targetEmissions?: { scope1: number; scope2: number; scope3?: number };
  totalBaselineEmissions?: number;
  totalTargetEmissions?: number;
  statedReductionPercent?: number;
  transitionStrategy?: string;
  hasPublishedPlan?: boolean;
  thirdPartyVerification?: boolean;
  eligibilityStatus: string;
  overallScore: number;
  lmaComponents: {
    name: string;
    score: number;
    maxScore: number;
    feedback: {
      status: string;
      description: string;
      action?: string;
    }[];
  }[];
  kpiRecommendations?: {
    name: string;
    unit: string;
    description: string;
    suggestedTarget: string;
    source?: string;
    rationale?: string;
  }[];
  sptRecommendations?: {
    name: string;
    baseline: string;
    target: string;
    marginImpact: string;
    verificationMethod?: string;
    source?: string;
  }[];
  greenwashingRisk: {
    level: string;
    score: number;
    redFlags: { description: string; recommendation: string }[];
    positiveIndicators: string[];
  };
  dfiMatches: {
    id: string;
    name: string;
    fullName: string;
    matchScore: number;
    matchReasons: string[];
    concerns: string[];
    recommendedRole: string;
    estimatedSize?: { min: number; max: number };
    climateTarget?: string;
    specialPrograms?: string[];
  }[];
  relevantClauses?: {
    id: string;
    content: string;
    metadata: {
      clauseType?: string;
      source?: string;
    };
    advice?: {
      relevanceSummary: string;
      howToApply: string;
      keyConsiderations: string[];
      suggestedModifications?: string;
    };
  }[];
  nextSteps: string[];
  countryInfo?: {
    region: string;
    legalSystem: string;
    currency: string;
    sovereignRating?: string;
    politicalRisk: string;
    ndcTarget?: string;
  };
  // NEW: Transition Loan Specific Fields (AI-generated if not provided)
  transitionPlan?: {
    shortTermTargets?: { year: number; target: string }[];
    mediumTermTargets?: { year: number; target: string }[];
    longTermTargets?: { year: number; target: string }[];
    sectorPathway?: string;
    taxonomyAlignment?: string[];
  };
  phaseOutCommitments?: {
    asset: string;
    currentCapacity?: string;
    phaseOutDate: string;
    replacementPlan?: string;
  }[];
  useOfProceedsCategories?: {
    category: string;
    allocation: number;
    eligibilityCriteria?: string;
  }[];
  governanceFramework?: {
    boardOversight?: boolean;
    climateCommittee?: boolean;
    executiveIncentives?: boolean;
    disclosureCommitments?: string[];
  };
  externalReview?: {
    preSigning?: { provider?: string; type: string };
    annual?: { provider?: string; type: string };
    methodology?: string[];
  };
}

// Prepared data for all phases
interface PreparedData {
  projectName: string;
  countryName: string;
  sector: string;
  targetYear: number;
  description: string;
  projectType: string;
  transitionStrategy: string;
  // Emissions
  scope1Baseline: number;
  scope2Baseline: number;
  scope3Baseline: number;
  scope1Target: number;
  scope2Target: number;
  scope3Target: number;
  totalBaseline: number;
  totalTarget: number;
  reductionPercent: number;
  // Financing
  totalCost: number;
  debtAmount: number;
  equityAmount: number;
  debtPercent: number;
  equityPercent: number;
  // DFI
  primaryDFI: DraftRequest['dfiMatches'][0] | null;
  // Assessment status
  overallScore: number;
  eligibilityStatus: string;
  passingItems: string[];
  failedItems: { component: string; issue: string; action: string }[];
  positiveIndicators: string[];
  redFlags: { description: string; recommendation: string }[];
  // KPIs and TPTs (Transition Performance Targets)
  kpis: DraftRequest['kpiRecommendations'];
  tpts: DraftRequest['sptRecommendations']; // Renamed from spts to tpts for transition loans
  // Clauses
  clauses: {
    id: string;
    type: string;
    source: string;
    content: string;
    howToApply: string;
  }[];
  // Country info
  countryInfo: DraftRequest['countryInfo'];
  // NEW: Transition Loan Specific Data
  transitionPlan: {
    shortTermTargets: { year: number; target: string }[];
    mediumTermTargets: { year: number; target: string }[];
    longTermTargets: { year: number; target: string }[];
    sectorPathway: string;
    taxonomyAlignment: string[];
  };
  useOfProceedsCategories: {
    category: string;
    allocation: number;
    eligibilityCriteria: string;
  }[];
  governanceFramework: {
    boardOversight: boolean;
    climateCommittee: boolean;
    executiveIncentives: boolean;
  };
  externalReview: {
    preSigning: string;
    annual: string;
    methodology: string[];
  };
}

async function callGroqAPI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  maxTokens: number = 4000,
  temperature: number = 0.3
): Promise<{ success: boolean; content?: string; error?: string }> {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Groq API] Error ${response.status}: ${errorText.substring(0, 500)}`);
      return {
        success: false,
        error: `API error ${response.status}: ${errorText.substring(0, 200)}`,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return { success: false, error: 'No content in response' };
    }

    return { success: true, content };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function callWithFallback(
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4000,
  temperature: number = 0.3
): Promise<{ success: boolean; content?: string; error?: string }> {
  for (const apiKey of DRAFT_API_KEYS) {
    const result = await callGroqAPI(systemPrompt, userPrompt, apiKey, maxTokens, temperature);
    if (result.success) {
      return result;
    }
    if (result.error?.includes('429') || result.error?.includes('5')) {
      console.log('Falling back to next API key...');
      continue;
    }
    console.log('Error with current key, trying next:', result.error);
  }
  return { success: false, error: 'All API keys exhausted' };
}

// ============================================================================
// LMA GUIDE CONTEXT RETRIEVAL - RAG for Transition Loan Guidance
// ============================================================================

interface LMAGuideContext {
  content: string;
  chunks: {
    id: string;
    content: string;
    section?: string;
    score: number;
  }[];
}

/**
 * Retrieves relevant sections from the vectorized LMA Guide to Transition Loans
 * Uses semantic search to find the most relevant guidance for the project
 */
async function retrieveLMAGuideContext(
  projectContext: {
    sector: string;
    projectType: string;
    description: string;
  },
  maxChunks: number = 5
): Promise<LMAGuideContext> {
  try {
    // Build a search query combining project context
    const searchQuery = `transition loan ${projectContext.sector} ${projectContext.projectType} credible transition plan TPT verification use of proceeds`;

    console.log('[RAG] Generating embedding for LMA Guide search...');
    const queryEmbedding = await generateEmbedding(searchQuery);

    console.log('[RAG] Searching for relevant LMA Guide sections...');
    const results = await searchDocuments(queryEmbedding, {
      topK: maxChunks,
      filter: {
        documentType: { $eq: 'guide' }
      }
    });

    if (results.length === 0) {
      console.log('[RAG] No LMA Guide chunks found, using default guidance');
      return {
        content: '',
        chunks: []
      };
    }

    console.log(`[RAG] Retrieved ${results.length} LMA Guide chunks`);

    // Format chunks for context
    const chunks = results.map(r => ({
      id: r.id,
      content: r.content,
      section: r.metadata.section,
      score: r.score
    }));

    // Build formatted context string
    const formattedContent = chunks
      .map((chunk, i) => {
        const sectionLabel = chunk.section ? `[${chunk.section}]` : `[Section ${i + 1}]`;
        return `${sectionLabel}\n${chunk.content.substring(0, 800)}${chunk.content.length > 800 ? '...' : ''}`;
      })
      .join('\n\n---\n\n');

    return {
      content: formattedContent,
      chunks
    };
  } catch (error) {
    console.error('[RAG] Failed to retrieve LMA Guide context:', error);
    return {
      content: '',
      chunks: []
    };
  }
}

// ============================================================================
// PHASE 1: ANALYZE - Extract structured requirements
// ============================================================================
async function phase1Analyze(data: PreparedData, lmaGuideContext?: LMAGuideContext): Promise<{
  success: boolean;
  plan?: {
    keywordsRequired: Record<string, string[]>;
    dataToInclude: string[];
    itemsToFix: string[];
    itemsToPreserve: string[];
    greenwashingFixes: string[];
  };
  error?: string;
}> {
  // Include LMA Guide context if available
  const lmaContext = lmaGuideContext?.content
    ? `\n\nLMA GUIDE TO TRANSITION LOANS REFERENCE:\n${lmaGuideContext.content}\n\nUse the above LMA guidance to inform your analysis and ensure compliance.`
    : '';

  const systemPrompt = `You are an LMA compliance analyst specializing in transition loans. Analyze the assessment results and output a JSON plan.
${lmaContext}

CRITICAL RULES:
- Output ONLY valid JSON, no markdown or explanation
- All years must be >= ${CURRENT_YEAR} (current year)
- Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}. Do NOT plan for Q1-Q${CURRENT_QUARTER - 1} of ${CURRENT_YEAR} - those quarters are in the past!
- For ${CURRENT_YEAR}, only use Q${CURRENT_QUARTER} or later. For future years, any quarter is acceptable.
- Never suggest past dates like 2023 or 2024
- Follow LMA Guide to Transition Loans requirements for credible transition plans

Output this exact JSON structure:
{
  "keywordsRequired": {
    "projectDescription": ["list of keywords that MUST appear in Project Description section"],
    "transitionStrategy": ["list of keywords that MUST appear in Transition Strategy section"]
  },
  "dataToInclude": ["list of specific data points with exact numbers"],
  "itemsToFix": ["list of failed items that need corrective language"],
  "itemsToPreserve": ["list of passing items - DO NOT change language that achieved these"],
  "greenwashingFixes": ["list of specific changes to avoid greenwashing"]
}`;

  const userPrompt = `Analyze this assessment and create a compliance plan:

PROJECT: ${data.projectName} (${data.countryName}, ${data.sector})
SCORE: ${data.overallScore}/100

FAILED ITEMS (must fix):
${data.failedItems.map(f => `- ${f.component}: ${f.issue}`).join('\n')}

PASSING ITEMS (must preserve):
${data.passingItems.join('\n')}

RED FLAGS (greenwashing):
${data.redFlags.map(r => `- ${r.description}: ${r.recommendation}`).join('\n')}

POSITIVE INDICATORS (reinforce):
${data.positiveIndicators.join('\n')}

EXACT DATA TO USE:
- Scope 1: ${data.scope1Baseline} → ${data.scope1Target} tCO2e/year
- Scope 2: ${data.scope2Baseline} → ${data.scope2Target} tCO2e/year
- Scope 3: ${data.scope3Baseline} → ${data.scope3Target} tCO2e/year
- Total: ${data.totalBaseline} → ${data.totalTarget} tCO2e (${data.reductionPercent}% reduction)
- Budget: USD ${data.totalCost.toLocaleString()}
- Debt: USD ${data.debtAmount.toLocaleString()} (${data.debtPercent}%)
- Equity: USD ${data.equityAmount.toLocaleString()} (${data.equityPercent}%)

DATE CONSTRAINT: All dates must be ${CURRENT_YEAR} or later. Target year: ${data.targetYear}
QUARTER CONSTRAINT: Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}. For current year, only Q${CURRENT_QUARTER}-Q4 are valid. Past quarters (Q1-Q${CURRENT_QUARTER - 1} of ${CURRENT_YEAR}) cannot be used.

Create JSON plan with keywords for Project Description and Transition Strategy sections.`;

  console.log('[Phase 1: ANALYZE] Starting...');
  const result = await callWithFallback(systemPrompt, userPrompt, 1500, 0.2);

  if (!result.success) {
    return { success: false, error: result.error };
  }

  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = result.content || '';
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    const plan = JSON.parse(jsonStr.trim());
    console.log('[Phase 1: ANALYZE] Complete');
    return { success: true, plan };
  } catch {
    console.error('[Phase 1: ANALYZE] Failed to parse JSON:', result.content?.substring(0, 200));
    // Return a default plan if parsing fails
    return {
      success: true,
      plan: {
        keywordsRequired: {
          projectDescription: ['SBTi', 'Science Based Targets', 'Paris Agreement', 'NDC'],
          transitionStrategy: ['1.5°C pathway', 'science-based targets', 'Scope 3', 'transition plan'],
        },
        dataToInclude: [
          `Total budget: USD ${data.totalCost.toLocaleString()}`,
          `Scope 3 emissions: ${data.scope3Baseline} tCO2e/year`,
          `Reduction target: ${data.reductionPercent}%`,
        ],
        itemsToFix: data.failedItems.map(f => f.issue),
        itemsToPreserve: data.passingItems,
        greenwashingFixes: data.redFlags.map(r => r.recommendation),
      },
    };
  }
}

// ============================================================================
// PHASE 2A: GENERATE Sections 1-5 (Narrative + Financial)
// ============================================================================
async function phase2GenerateSections1to5(
  data: PreparedData,
  plan: NonNullable<Awaited<ReturnType<typeof phase1Analyze>>['plan']>,
  lmaGuideContext?: LMAGuideContext
): Promise<{ success: boolean; content?: string; error?: string }> {
  // Include LMA Guide context if available
  const lmaContext = lmaGuideContext?.content
    ? `\n\nLMA GUIDE TO TRANSITION LOANS REFERENCE:\n${lmaGuideContext.content}\n\nAPPLY this official LMA guidance when writing sections. Reference specific requirements.`
    : '';

  const systemPrompt = `You are an LMA transition loan document writer. Generate sections 1-5 of a professional draft.
${lmaContext}

ABSOLUTE RULES - COMPLIANCE:
1. ALL years must be ${CURRENT_YEAR} or later. NEVER use ${CURRENT_YEAR - 1}, ${CURRENT_YEAR - 2}, or earlier years.
2. Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}. For ${CURRENT_YEAR}, only use Q${CURRENT_QUARTER}, Q${Math.min(CURRENT_QUARTER + 1, 4)}, Q${Math.min(CURRENT_QUARTER + 2, 4)}, Q4. NEVER use past quarters (Q1-Q${CURRENT_QUARTER - 1} of ${CURRENT_YEAR}).
3. Use "95%" not "100%" for any percentage targets
4. Be factual and measured - avoid superlatives

ANTI-GREENWASHING RULES - CRITICAL:
**BANNED WORDS/PHRASES (will trigger red flags):**
- NEVER use: "various", "to be determined", "TBD", "TBC", "to be confirmed"
- NEVER use: "99%", "100%", "guaranteed", "no risk", "zero cost", "500%", "unlimited"
- NEVER use vague commitments: "aspire to", "intend to", "aim to", "explore", "consider", "may" (without specific year)
- NEVER use: "revolutionary", "unprecedented", "transformative", "world-leading", "best-in-class", "first-of-its-kind"

**REQUIRED ELEMENTS (must include to pass LMA assessment):**
- Project description MUST be detailed (>200 words) with SPECIFIC activities and outcomes
- MUST include: "SBTi", "Science Based Targets", "Paris Agreement", "NDC", "1.5°C pathway"
- MUST include specific target years (2030, 2035, 2050)
- MUST include Scope 1, Scope 2, AND Scope 3 emissions with actual numbers
- MUST reference "published transition strategy" or "board-approved transition plan"
- MUST mention "third-party verification" or "independent verification"
- MUST use specific percentages (e.g., "42% reduction by 2030") not vague terms

**INSTEAD OF VAGUE LANGUAGE, USE:**
- "Various activities" → List specific activities: "solar panel installation, energy efficiency upgrades, and waste heat recovery"
- "TBD" → Use actual number or "to be verified by Q${CURRENT_QUARTER} ${CURRENT_YEAR}"
- "Aspire to reduce" → "Will reduce by X% by [year], verified by [verifier]"
- "May achieve" → "Target: X% reduction, with interim milestones in [years]"

KEYWORDS TO INCLUDE:
- In Project Description: ${plan.keywordsRequired.projectDescription?.join(', ') || 'SBTi, Science Based Targets, Paris Agreement, NDC'}
- In Transition Strategy: ${plan.keywordsRequired.transitionStrategy?.join(', ') || '1.5°C pathway, science-based targets, Scope 3'}

ITEMS TO PRESERVE (do not change language):
${plan.itemsToPreserve?.join('\n') || 'None'}

Output: Clean markdown for sections 1-5 only.`;

  const userPrompt = `Generate sections 1-5 for: ${data.projectName}

## EXACT DATA TO USE (do not change these numbers):
| Metric | Value |
|--------|-------|
| Total Budget | USD ${data.totalCost.toLocaleString()} |
| Debt | USD ${data.debtAmount.toLocaleString()} (${data.debtPercent}%) |
| Equity | USD ${data.equityAmount.toLocaleString()} (${data.equityPercent}%) |
| Scope 1 Baseline | ${data.scope1Baseline} tCO2e/year |
| Scope 2 Baseline | ${data.scope2Baseline} tCO2e/year |
| Scope 3 Baseline | ${data.scope3Baseline} tCO2e/year |
| Scope 1 Target | ${data.scope1Target} tCO2e/year |
| Scope 2 Target | ${data.scope2Target} tCO2e/year |
| Scope 3 Target | ${data.scope3Target} tCO2e/year |
| Total Reduction | ${data.reductionPercent}% |
| Target Year | ${data.targetYear} |
| Country | ${data.countryName} |
| Sector | ${data.sector} |

## PROJECT CONTEXT:
${data.description || 'Agricultural processing facility with solar drying systems'}
${data.transitionStrategy || ''}

## DFI TARGET:
${data.primaryDFI ? `${data.primaryDFI.fullName} - ${data.primaryDFI.recommendedRole}` : 'General DFI engagement'}

## GENERATE THESE 5 SECTIONS:

### 1. EXECUTIVE SUMMARY
- Project overview with key metrics table
- Include total budget prominently
- State SBTi and Paris alignment
- Keep factual, avoid exaggeration

### 2. PROJECT DESCRIPTION
**MUST include these keywords:** SBTi, Science Based Targets, Paris Agreement, NDC
- Detailed description of project activities
- Timeline table (all dates ${CURRENT_YEAR}+, starting from Q${CURRENT_QUARTER} ${CURRENT_YEAR} at earliest)
- Environmental outcomes expected

### 3. TRANSITION STRATEGY
**MUST include these keywords:** 1.5°C pathway, science-based targets, Scope 3
- Full emissions table with Scope 1, 2, AND 3
- Decarbonization roadmap
- Alignment statement: "aligned with the Paris Agreement 1.5°C pathway"

### 4. FINANCING STRUCTURE
- Financing table with debt/equity split
- Cost breakdown
- DFI engagement strategy

### 5. USE OF PROCEEDS & TRANSITION ELIGIBILITY

**Per LMA Guide to Transition Loans (October 2025)**

**5.1 Eligible Transition Activities**
Define specific use of proceeds categories:
- Category 1: [Primary transition activity] - [X]% allocation
- Category 2: [Secondary activity] - [X]% allocation
- Category 3: [Supporting activity] - [X]% allocation

**5.2 Eligibility Criteria**
For each category, specify:
- Alignment with transition pathway
- Environmental benefit expected
- Exclusion criteria (what funds CANNOT be used for)

**5.3 Key Terms and Conditions**

**CRITICAL FORMATTING:**
- Each clause/term MUST be a bullet point (•)
- Key terms/keywords within each clause MUST be **bolded**
- Structure each bullet as: "**Key Term Name**: Description..."
- Reference LMA Guide to Transition Loans where applicable

Include these elements:
- **Standard LMA Terms**: repayment schedules, interest rates, default provisions
- **Margin Ratchet Mechanism**: tied to TPT (Transition Performance Target) achievement
- **Reporting Covenant**: annual transition progress reporting requirements
- **TPT Definitions**: specific transition metrics and measurement methods
- **Proceeds Tracking**: ring-fencing and allocation reporting

${data.clauses.length > 0 ? `
## RELEVANT LMA CLAUSES TO ADAPT (from assessment):
${data.clauses.map((c, i) => `
**${i + 1}. ${c.type}** (Source: ${c.source})
Clause ID: ${c.id}
How to Apply: ${c.howToApply}
`).join('\n')}

For Section 5:
- Adapt each relevant clause above for this specific project
- Format as bullet points (•) with **bolded** key terms
- Include margin ratchet tied to the project's TPTs (Transition Performance Targets)
- Reference "per LMA Guide to Transition Loans" where applicable

Example format:
• **Margin Ratchet Mechanism**: A reduction in the interest margin will be triggered by achieving specific TPT targets, as verified by third-party reports. The **margin reduction** will be 5-15 basis points per year for each TPT met.
• **Transition Reporting Covenant**: The borrower will prepare an annual **Transition Progress Report**, verifying performance against TPTs and use of proceeds allocation. Reports will be verified by a qualified third party, per **LMA Guide to Transition Loans**.
` : ''}`;

  console.log('[Phase 2A: GENERATE 1-5] Starting...');
  const result = await callWithFallback(systemPrompt, userPrompt, 4000, 0.35);
  console.log('[Phase 2A: GENERATE 1-5] Complete');
  return result;
}

// ============================================================================
// PHASE 2B: GENERATE Sections 6-10 (Technical + Implementation)
// ============================================================================
async function phase2GenerateSections6to10(
  data: PreparedData,
  plan: NonNullable<Awaited<ReturnType<typeof phase1Analyze>>['plan']>,
  lmaGuideContext?: LMAGuideContext
): Promise<{ success: boolean; content?: string; error?: string }> {
  // Include LMA Guide context if available - particularly important for sections 6-10
  const lmaContext = lmaGuideContext?.content
    ? `\n\nLMA GUIDE TO TRANSITION LOANS - OFFICIAL REFERENCE:\n${lmaGuideContext.content}\n\nCRITICAL: Apply this official LMA guidance throughout. Sections 6 (Credible Transition Plan), 8 (TPT Mechanism), and 9 (External Review) must follow LMA requirements precisely.`
    : '';

  const systemPrompt = `You are an LMA transition loan document writer following the LMA Guide to Transition Loans (October 2025). Generate sections 6-10 of a professional transition loan draft.
${lmaContext}

TRANSITION LOAN REQUIREMENTS (per LMA Guide to Transition Loans):
- This is a TRANSITION loan, not a green loan or SLL
- Must include a CREDIBLE TRANSITION PLAN with short/medium/long-term targets
- Use TPTs (Transition Performance Targets), not SPTs
- Reference sector-specific benchmarks (SBTi, ACT, TPI)
- Include governance framework for transition oversight
- Include external review requirements (SPO + annual verification)

ABSOLUTE RULES - COMPLIANCE:
1. ALL years must be ${CURRENT_YEAR} or later. NEVER use ${CURRENT_YEAR - 1}, ${CURRENT_YEAR - 2}, or earlier.
2. Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}. For ${CURRENT_YEAR}, only use Q${CURRENT_QUARTER}-Q4. NEVER use past quarters (Q1-Q${CURRENT_QUARTER - 1} of ${CURRENT_YEAR}).
3. Use "95%" not "100%" for percentage targets
4. Be factual - avoid superlatives
5. All KPI baselines must have actual numbers, not placeholders
6. Reference "LMA Guide to Transition Loans" in appropriate sections

ANTI-GREENWASHING RULES - CRITICAL:
**BANNED WORDS/PHRASES (will trigger red flags):**
- NEVER use: "various", "to be determined", "TBD", "TBC", "to be confirmed", "to be established"
- NEVER use: "99%", "100%", "guaranteed", "no risk", "zero cost", "500%", "unlimited"
- NEVER use vague commitments: "aspire to", "intend to", "aim to", "explore", "consider", "may" (without specific year)
- NEVER use: "revolutionary", "unprecedented", "transformative", "world-leading", "best-in-class"

**REQUIRED ELEMENTS FOR LMA COMPLIANCE:**
- Section 6: MUST include specific short/medium/long-term targets with YEARS and PERCENTAGES
- Section 7: KPIs MUST have actual baseline numbers (e.g., "12,500 tCO2e/year"), not placeholders
- Section 8: TPTs MUST reference SBTi 1.5°C pathway with specific reduction targets
- Section 9: MUST include "third-party verification", "independent verifier", specific verifier names (DNV, KPMG, EY)
- Section 9: MUST mention "Second Party Opinion (SPO)" from recognized provider
- Section 10: MUST include specific timeline starting from Q${CURRENT_QUARTER} ${CURRENT_YEAR}

**INSTEAD OF VAGUE LANGUAGE, USE:**
- "To be established" → "Established by Q${CURRENT_QUARTER} ${CURRENT_YEAR}" or use actual value
- "To be determined" → Use specific number from project data
- "Various measures" → List 3-5 specific measures with expected outcomes

GREENWASHING FIXES TO APPLY (CRITICAL):
${plan.greenwashingFixes?.join('\n') || 'None'}

IMPORTANT: Section 9 (Risk Mitigation & External Review) MUST provide concrete, actionable solutions for EVERY red flag.
Do NOT just list the issues - provide SPECIFIC mitigation strategies with timelines.

Output: Clean markdown for sections 6-10 only.`;

  const kpiTable = data.kpis?.map(kpi =>
    `| ${kpi.name} | ${kpi.unit} | ${kpi.suggestedTarget} |`
  ).join('\n') || '| GHG Emissions | tCO2e/year | 45% reduction |';

  // TPT (Transition Performance Targets) table - renamed from SPT for transition loans
  const tptTable = data.tpts?.map(tpt =>
    `| ${tpt.name} | ${tpt.baseline} | ${tpt.target} | ${tpt.marginImpact} |`
  ).join('\n') || '| Emissions Reduction | Baseline | Target | ±5-15 bps |';

  // Transition plan data for Section 6
  const transitionPlanTable = `
| Timeframe | Target | Key Actions |
|-----------|--------|-------------|
${data.transitionPlan.shortTermTargets.map(t => `| Short-term (${t.year}) | ${t.target} | Immediate measures |`).join('\n')}
${data.transitionPlan.mediumTermTargets.map(t => `| Medium-term (${t.year}) | ${t.target} | Technology transition |`).join('\n')}
${data.transitionPlan.longTermTargets.map(t => `| Long-term (${t.year}) | ${t.target} | Full decarbonization |`).join('\n')}
`;

  // Use of proceeds table
  const useOfProceedsTable = data.useOfProceedsCategories.map(c =>
    `| ${c.category} | ${c.allocation}% | ${c.eligibilityCriteria} |`
  ).join('\n');

  const userPrompt = `Generate sections 6-10 for: ${data.projectName}

## PROJECT DATA:
- Country: ${data.countryName}
- Sector: ${data.sector}
- Target Year: ${data.targetYear}
- Primary DFI: ${data.primaryDFI?.name || 'General'}
- Sector Pathway: ${data.transitionPlan.sectorPathway}
- Taxonomy Alignment: ${data.transitionPlan.taxonomyAlignment.join(', ')}

## TRANSITION PLAN DATA (for Section 6):
${transitionPlanTable}

## GOVERNANCE FRAMEWORK:
- Board Oversight: ${data.governanceFramework.boardOversight ? 'Yes' : 'To be established'}
- Climate Committee: ${data.governanceFramework.climateCommittee ? 'Yes' : 'To be established'}
- Executive Incentives: ${data.governanceFramework.executiveIncentives ? 'Yes' : 'To be established'}

## USE OF PROCEEDS CATEGORIES:
| Category | Allocation | Eligibility Criteria |
|----------|------------|---------------------|
${useOfProceedsTable}

## KPI DATA (for Section 7):
| KPI | Unit | Target |
|-----|------|--------|
${kpiTable}

## TPT DATA (for Section 8 - Transition Performance Targets):
| TPT | Baseline | Target | Margin Impact |
|-----|----------|--------|---------------|
${tptTable}

## EXTERNAL REVIEW REQUIREMENTS (for Section 9):
- Pre-Signing: ${data.externalReview.preSigning}
- Annual Verification: ${data.externalReview.annual}
- Methodology: ${data.externalReview.methodology.join(', ')}

## RED FLAGS TO MITIGATE (CRITICAL - MUST ADDRESS EACH ONE):
${data.redFlags.length > 0 ? data.redFlags.map(r => `- **${r.description}**\n  Recommendation: ${r.recommendation}`).join('\n') : 'None identified'}

## GENERATE THESE 5 SECTIONS:

### 6. CREDIBLE TRANSITION PLAN

**Per LMA Guide to Transition Loans (October 2025) - MANDATORY SECTION**

**6.1 Decarbonization Pathway**
| Timeframe | Year Range | Target | Key Actions |
|-----------|-----------|--------|-------------|
| Short-term | ${CURRENT_YEAR}-${CURRENT_YEAR + 2} | [15-20% reduction] | Immediate efficiency measures |
| Medium-term | ${CURRENT_YEAR + 3}-2035 | [40-50% reduction] | Technology transition, renewable deployment |
| Long-term | 2036-${data.targetYear > 2040 ? data.targetYear : 2050} | [Net zero/80%+ reduction] | Full decarbonization |

**6.2 Sector Pathway Alignment**
- Benchmark: [SBTi 1.5°C sector pathway / ACT methodology / TPI benchmark]
- Methodology: Science Based Targets initiative
- Alignment statement: "This transition plan is aligned with [pathway]"

**6.3 Governance Framework**
- Board-level climate oversight: [Yes/To be established by Q_ ${CURRENT_YEAR}]
- Climate/Sustainability Committee: [Yes/To be established]
- Executive incentives linked to transition targets: [Yes/To be established]
- Disclosure commitments: [TCFD / CDP / Other]

**6.4 Just Transition Considerations** (if applicable)
- Workforce transition plans
- Community impact mitigation
- Stakeholder engagement

### 7. KPI FRAMEWORK
- Detailed KPI table with baselines (use real numbers, not "TBD")
- Measurement methodology (GHG Protocol, ISO 14064, etc.)
- Reporting frequency (quarterly monitoring, annual reporting)

### 8. TPT MECHANISM (TRANSITION PERFORMANCE TARGETS)

**Per LMA Guide to Transition Loans - TPTs differ from SLL SPTs**

TPTs must demonstrate:
1. **Ambition**: Aligned with Paris Agreement 1.5°C pathway
2. **Materiality**: Core to borrower's transition strategy
3. **Measurability**: Quantifiable with credible methodology
4. **Verification**: Third-party assurance required

- TPT table with annual milestones (years ${CURRENT_YEAR}-${data.targetYear})
- Margin adjustment mechanics (±5-15 bps typical range)
- Verification requirements
- Grace period for remediation
- Consequences of TPT miss (margin step-up OR sustainability event trigger)

### 9. RISK MITIGATION & EXTERNAL REVIEW (CRITICAL SECTION - RESOLVE ALL RED FLAGS)
**THIS SECTION MUST PROVIDE CONCRETE SOLUTIONS FOR EACH RED FLAG IDENTIFIED ABOVE**

For EACH red flag:
1. State the specific issue identified
2. Provide a CONCRETE mitigation strategy (not vague promises)
3. Define a monitoring mechanism to track resolution
4. Set a timeline for resolution (using Q${CURRENT_QUARTER} ${CURRENT_YEAR} or later)

Format as a detailed table:
| Red Flag | Mitigation Strategy | Monitoring Mechanism | Resolution Timeline |

The draft should demonstrate that ALL greenwashing concerns have been addressed with actionable plans.

**9.2 External Review & Verification Requirements**

Per LMA Guide to Transition Loans:

| Review Type | Timing | Provider | Scope |
|-------------|--------|----------|-------|
| Second Party Opinion (SPO) | Pre-signing | [To be appointed] | Transition strategy credibility |
| Annual Verification | Annually | [To be appointed] | TPT performance, use of proceeds |
| GHG Audit | Annually | [Accredited verifier] | Scope 1, 2, 3 emissions |

**Verification Methodology:**
- GHG Protocol for emissions
- SBTi methodology for target alignment
- ISO 14064 for verification standards

### 10. DFI ROADMAP & ANNEXES

**10.1 DFI Submission Roadmap**
- Documentation checklist for ${data.primaryDFI?.name || 'DFI'} submission
- Timeline (starting Q${CURRENT_QUARTER} ${CURRENT_YEAR} - current quarter)
- Key milestones (only Q${CURRENT_QUARTER}-Q4 for ${CURRENT_YEAR}, any quarter for future years)

**10.2 Annexes**
- Term sheet summary
- TPT calculation methodologies
- Eligible transition activities list
- Glossary of terms (TPT, SPO, GHG Protocol, etc.)`;

  console.log('[Phase 2B: GENERATE 6-10] Starting...');
  const result = await callWithFallback(systemPrompt, userPrompt, 3500, 0.35);
  console.log('[Phase 2B: GENERATE 6-10] Complete');
  return result;
}

// ============================================================================
// PHASE 3: REVIEW - Quality check, greenwashing removal, year validation
// ============================================================================
async function phase3Review(
  draft: string,
  data: PreparedData
): Promise<{ success: boolean; content?: string; error?: string }> {
  const systemPrompt = `You are a greenwashing auditor and document reviewer. Review and clean the draft to pass LMA compliance checks.

YOUR TASKS:

1. FIX YEARS AND QUARTERS:
   - Any year < ${CURRENT_YEAR} → "${CURRENT_YEAR}"
   - Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}
   - "Q1 ${CURRENT_YEAR}", "Q2 ${CURRENT_YEAR}", etc. before Q${CURRENT_QUARTER} → "Q${CURRENT_QUARTER} ${CURRENT_YEAR}"
   - Keep Q${CURRENT_QUARTER}-Q4 ${CURRENT_YEAR} and all future year quarters as-is

2. REMOVE/REPLACE GREENWASHING RED FLAG TRIGGERS:
   **REPLACE these words (they trigger red flags):**
   - "100%" → "95%"
   - "99%" → "95%"
   - "guaranteed" → "targeted" or "projected"
   - "no risk" → "managed risk profile"
   - "zero cost" → "optimized cost structure"
   - "revolutionary" → "improved"
   - "unprecedented" → "significant"
   - "transformative" → "meaningful"
   - "complete elimination" → "substantial reduction"
   - "zero emissions" → "near-zero emissions" or "0 tCO2e/year"
   - "first-of-its-kind" → REMOVE entirely
   - "world-leading" → REMOVE entirely
   - "best-in-class" → REMOVE entirely
   - "unlimited" → specific capacity number

   **REPLACE vague terms:**
   - "various" → list specific items (3-5)
   - "to be determined" / "TBD" → use actual number from data or "by Q${CURRENT_QUARTER} ${CURRENT_YEAR}"
   - "to be established" → "established by Q${CURRENT_QUARTER} ${CURRENT_YEAR}"
   - "to be confirmed" → use actual value
   - "aspire to" → "will achieve"
   - "intend to" → "committed to"
   - "aim to" → "target:"
   - "explore" → "implement"
   - "may" (without year) → "will by [year]"

3. VERIFY DATA ACCURACY:
   - Scope 3 must show: ${data.scope3Baseline} tCO2e/year
   - Total budget must show: USD ${data.totalCost.toLocaleString()}
   - Reduction must show: ${data.reductionPercent}%

4. ENSURE REQUIRED ELEMENTS ARE PRESENT:
   - MUST contain: "SBTi" or "Science Based Targets"
   - MUST contain: "Paris Agreement"
   - MUST contain: "1.5°C" or "1.5 degrees"
   - MUST contain: "NDC" or "Nationally Determined Contribution"
   - MUST contain: "Scope 1", "Scope 2", AND "Scope 3"
   - MUST contain: "third-party verification" or "independent verification"
   - MUST contain: "published transition strategy" or "transition plan"
   - If any are missing, ADD them in appropriate sections

5. VERIFY DESCRIPTION LENGTH:
   - Section 2 (Project Description) MUST be at least 200 words
   - If too short, expand with specific project activities and outcomes
   - Never leave vague descriptions - always be specific

6. REMOVE DEBUG/META SECTIONS:
   - Do NOT include "REQUIRED DATA" sections in output
   - Do NOT include "PASSING ITEMS" sections in output
   - Do NOT include any verification checklists in the final document
   - The output should only contain sections 1-10 of the draft

7. FIX VAGUE TARGETS:
   - "near-zero emissions" → "0 tCO2e/year"
   - "near-zero" → actual number (0 or close to 0)

Output: The complete cleaned draft in markdown format. Preserve sections 1-10 ONLY. Do NOT include any meta/debug sections.`;

  const userPrompt = `Review and clean this draft document:

---
${draft}
---

[VERIFICATION CHECKLIST - DO NOT INCLUDE IN OUTPUT]
- Total Budget: USD ${data.totalCost.toLocaleString()}
- Scope 1: ${data.scope1Baseline} → ${data.scope1Target} tCO2e/year
- Scope 2: ${data.scope2Baseline} → ${data.scope2Target} tCO2e/year
- Scope 3: ${data.scope3Baseline} → ${data.scope3Target} tCO2e/year
- Reduction: ${data.reductionPercent}%
- Minimum year allowed: ${CURRENT_YEAR}
[END CHECKLIST]

Return ONLY the cleaned document (sections 1-10). Do NOT include any checklist or meta sections.`;

  console.log('[Phase 3: REVIEW] Starting...');
  const result = await callWithFallback(systemPrompt, userPrompt, 6000, 0.2);
  console.log('[Phase 3: REVIEW] Complete');
  return result;
}

// ============================================================================
// MAIN HANDLER
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body: DraftRequest = await request.json();
    const startTime = Date.now();

    // ========================================================================
    // PREPARE DATA
    // ========================================================================
    const {
      projectName,
      countryName,
      sector,
      targetYear = 2030,
      description = '',
      projectType = '',
      totalCost = 0,
      debtAmount = 0,
      equityAmount = 0,
      currentEmissions,
      targetEmissions,
      totalBaselineEmissions,
      totalTargetEmissions,
      statedReductionPercent,
      transitionStrategy = '',
      overallScore,
      eligibilityStatus,
      lmaComponents,
      kpiRecommendations,
      sptRecommendations,
      greenwashingRisk,
      dfiMatches,
      relevantClauses,
      countryInfo,
    } = body;

    // Calculate financing
    const actualTotalCost = totalCost > 0 ? totalCost : 1000000;
    const actualDebtAmount = debtAmount > 0 ? debtAmount : Math.round(actualTotalCost * 0.8);
    const actualEquityAmount = equityAmount > 0 ? equityAmount : actualTotalCost - actualDebtAmount;
    const debtPercent = Math.round((actualDebtAmount / actualTotalCost) * 100);
    const equityPercent = 100 - debtPercent;

    // Calculate emissions
    const hasEmissionsData = currentEmissions && (currentEmissions.scope1 > 0 || currentEmissions.scope2 > 0);
    const scope1Baseline = hasEmissionsData ? currentEmissions.scope1 : (sector === 'agriculture' ? 135 : 200);
    const scope2Baseline = hasEmissionsData ? currentEmissions.scope2 : (sector === 'agriculture' ? 0 : 50);
    // ALWAYS provide Scope 3 - estimate if not available
    const scope3Baseline = currentEmissions?.scope3 || (sector === 'agriculture' ? 350 : 800);

    const totalBaseline = (totalBaselineEmissions && totalBaselineEmissions > 0)
      ? totalBaselineEmissions
      : scope1Baseline + scope2Baseline + scope3Baseline;

    const hasTargetData = targetEmissions && (targetEmissions.scope1 > 0 || targetEmissions.scope2 > 0);
    const scope1Target = hasTargetData ? targetEmissions.scope1 : Math.round(scope1Baseline * 0.15);
    const scope2Target = hasTargetData ? targetEmissions.scope2 : 0;
    const scope3Target = targetEmissions?.scope3 || Math.round(scope3Baseline * 0.7);

    const totalTarget = (totalTargetEmissions && totalTargetEmissions > 0)
      ? totalTargetEmissions
      : scope1Target + scope2Target + scope3Target;

    const reductionPercent = (statedReductionPercent && statedReductionPercent > 0)
      ? Math.round(statedReductionPercent)
      : (totalBaseline > 0 ? Math.round(((totalBaseline - totalTarget) / totalBaseline) * 100) : 45);

    // Extract passing and failed items
    const passingItems: string[] = [];
    const failedItems: { component: string; issue: string; action: string }[] = [];

    lmaComponents.forEach(comp => {
      comp.feedback.forEach(fb => {
        if (fb.status === 'met') {
          passingItems.push(`✓ ${comp.name}: ${fb.description}`);
        } else {
          failedItems.push({
            component: comp.name,
            issue: fb.description,
            action: fb.action || 'Address in draft',
          });
        }
      });
    });

    // Prepare clause data
    const clauses = relevantClauses?.slice(0, 4).map(clause => ({
      id: clause.id,
      type: clause.metadata.clauseType?.replace(/_/g, ' ') || 'General',
      source: clause.metadata.source || 'LMA Standard',
      content: clause.content.substring(0, 300),
      howToApply: clause.advice?.howToApply || 'Apply standard template',
    })) || [];

    // Ensure target year is valid
    const validTargetYear = Math.max(targetYear, CURRENT_YEAR);

    // Generate AI-estimated transition plan if not provided
    const defaultTransitionPlan = {
      shortTermTargets: [
        { year: CURRENT_YEAR + 1, target: '15% emissions reduction from baseline' },
        { year: CURRENT_YEAR + 2, target: '25% emissions reduction from baseline' },
      ],
      mediumTermTargets: [
        { year: 2030, target: '42% emissions reduction (SBTi 1.5°C aligned)' },
        { year: 2035, target: '60% emissions reduction' },
      ],
      longTermTargets: [
        { year: 2050, target: 'Net zero emissions' },
      ],
      sectorPathway: `SBTi 1.5°C ${sector} sector pathway`,
      taxonomyAlignment: ['Paris Agreement', 'African Union Climate Strategy'],
    };

    // Default use of proceeds categories based on sector
    const defaultUseOfProceeds = [
      { category: 'Technology & Equipment', allocation: 50, eligibilityCriteria: 'Low-carbon technology deployment' },
      { category: 'Energy Efficiency', allocation: 30, eligibilityCriteria: 'Energy reduction measures' },
      { category: 'Capacity Building', allocation: 20, eligibilityCriteria: 'Training and transition support' },
    ];

    const preparedData: PreparedData = {
      projectName,
      countryName,
      sector,
      targetYear: validTargetYear,
      description,
      projectType,
      transitionStrategy,
      scope1Baseline,
      scope2Baseline,
      scope3Baseline,
      scope1Target,
      scope2Target,
      scope3Target,
      totalBaseline,
      totalTarget,
      reductionPercent,
      totalCost: actualTotalCost,
      debtAmount: actualDebtAmount,
      equityAmount: actualEquityAmount,
      debtPercent,
      equityPercent,
      primaryDFI: dfiMatches?.[0] || null,
      overallScore,
      eligibilityStatus,
      passingItems,
      failedItems,
      positiveIndicators: greenwashingRisk.positiveIndicators || [],
      redFlags: greenwashingRisk.redFlags || [],
      kpis: kpiRecommendations,
      tpts: sptRecommendations, // Renamed from spts to tpts for transition loans
      clauses,
      countryInfo,
      // NEW: Transition Loan Specific Data (use provided or AI-generated defaults)
      transitionPlan: body.transitionPlan ? {
        shortTermTargets: body.transitionPlan.shortTermTargets || defaultTransitionPlan.shortTermTargets,
        mediumTermTargets: body.transitionPlan.mediumTermTargets || defaultTransitionPlan.mediumTermTargets,
        longTermTargets: body.transitionPlan.longTermTargets || defaultTransitionPlan.longTermTargets,
        sectorPathway: body.transitionPlan.sectorPathway || defaultTransitionPlan.sectorPathway,
        taxonomyAlignment: body.transitionPlan.taxonomyAlignment || defaultTransitionPlan.taxonomyAlignment,
      } : defaultTransitionPlan,
      useOfProceedsCategories: (body.useOfProceedsCategories || defaultUseOfProceeds).map(c => ({
        category: c.category,
        allocation: c.allocation,
        eligibilityCriteria: c.eligibilityCriteria || 'Eligible transition activity',
      })),
      governanceFramework: {
        boardOversight: body.governanceFramework?.boardOversight ?? false,
        climateCommittee: body.governanceFramework?.climateCommittee ?? false,
        executiveIncentives: body.governanceFramework?.executiveIncentives ?? false,
      },
      externalReview: body.externalReview ? {
        preSigning: body.externalReview.preSigning?.type || 'Second Party Opinion (SPO) to be obtained',
        annual: body.externalReview.annual?.type || 'Annual third-party verification',
        methodology: body.externalReview.methodology || ['GHG Protocol', 'SBTi'],
      } : {
        preSigning: 'Second Party Opinion (SPO) to be obtained',
        annual: 'Annual third-party verification',
        methodology: ['GHG Protocol', 'SBTi', 'ISO 14064'],
      },
    };

    console.log(`[Draft Generator] Starting 3-phase generation for: ${projectName}`);

    // ========================================================================
    // RAG: RETRIEVE LMA GUIDE CONTEXT
    // ========================================================================
    console.log('[Draft Generator] Retrieving LMA Guide to Transition Loans context...');
    const lmaGuideContext = await retrieveLMAGuideContext({
      sector: preparedData.sector,
      projectType: preparedData.projectType,
      description: preparedData.description,
    });

    if (lmaGuideContext.chunks.length > 0) {
      console.log(`[Draft Generator] Retrieved ${lmaGuideContext.chunks.length} LMA Guide chunks for context`);
    } else {
      console.log('[Draft Generator] No LMA Guide context available, using default guidance');
    }

    // ========================================================================
    // PHASE 1: ANALYZE
    // ========================================================================
    const phase1Result = await phase1Analyze(preparedData, lmaGuideContext);
    if (!phase1Result.success || !phase1Result.plan) {
      return NextResponse.json(
        { success: false, error: `Phase 1 failed: ${phase1Result.error}` },
        { status: 500 }
      );
    }

    // ========================================================================
    // PHASE 2: GENERATE (parallel)
    // ========================================================================
    const [sections1to5Result, sections6to10Result] = await Promise.all([
      phase2GenerateSections1to5(preparedData, phase1Result.plan, lmaGuideContext),
      phase2GenerateSections6to10(preparedData, phase1Result.plan, lmaGuideContext),
    ]);

    if (!sections1to5Result.success) {
      return NextResponse.json(
        { success: false, error: `Phase 2A failed: ${sections1to5Result.error}` },
        { status: 500 }
      );
    }

    if (!sections6to10Result.success) {
      return NextResponse.json(
        { success: false, error: `Phase 2B failed: ${sections6to10Result.error}` },
        { status: 500 }
      );
    }

    // Combine sections
    const combinedDraft = `# ${projectName}
## LMA Transition Loan Project Draft

**Generated:** ${new Date().toISOString().split('T')[0]}
**Country:** ${countryName}
**Sector:** ${sector.charAt(0).toUpperCase() + sector.slice(1)}
**Target DFI:** ${preparedData.primaryDFI?.name || 'General'}

---

${sections1to5Result.content}

---

${sections6to10Result.content}
`;

    // ========================================================================
    // PHASE 3: REVIEW
    // ========================================================================
    const reviewResult = await phase3Review(combinedDraft, preparedData);

    const finalDraft = reviewResult.success ? reviewResult.content : combinedDraft;
    const totalTime = Date.now() - startTime;

    console.log(`[Draft Generator] Complete in ${totalTime}ms (3 phases)`);

    return NextResponse.json({
      success: true,
      draft: finalDraft,
      metadata: {
        generatedAt: new Date().toISOString(),
        targetDFI: preparedData.primaryDFI?.name || 'General',
        projectName,
        sector,
        country: countryName,
        generationTime: totalTime,
        phases: {
          analyze: 'complete',
          generate: 'complete',
          review: reviewResult.success ? 'complete' : 'skipped',
        },
        ragContext: {
          lmaGuideChunksUsed: lmaGuideContext.chunks.length,
          chunkIds: lmaGuideContext.chunks.map(c => c.id),
          contextAvailable: lmaGuideContext.chunks.length > 0,
        },
      },
    });
  } catch (error) {
    console.error('Draft generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate draft',
      },
      { status: 500 }
    );
  }
}
