import { NextRequest, NextResponse } from 'next/server';

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
  // KPIs and SPTs
  kpis: DraftRequest['kpiRecommendations'];
  spts: DraftRequest['sptRecommendations'];
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
// PHASE 1: ANALYZE - Extract structured requirements
// ============================================================================
async function phase1Analyze(data: PreparedData): Promise<{
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
  const systemPrompt = `You are an LMA compliance analyst. Analyze the assessment results and output a JSON plan.

CRITICAL RULES:
- Output ONLY valid JSON, no markdown or explanation
- All years must be >= ${CURRENT_YEAR} (current year)
- Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}. Do NOT plan for Q1-Q${CURRENT_QUARTER - 1} of ${CURRENT_YEAR} - those quarters are in the past!
- For ${CURRENT_YEAR}, only use Q${CURRENT_QUARTER} or later. For future years, any quarter is acceptable.
- Never suggest past dates like 2023 or 2024

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
  plan: NonNullable<Awaited<ReturnType<typeof phase1Analyze>>['plan']>
): Promise<{ success: boolean; content?: string; error?: string }> {
  const systemPrompt = `You are an LMA transition loan document writer. Generate sections 1-5 of a professional draft.

ABSOLUTE RULES:
1. ALL years must be ${CURRENT_YEAR} or later. NEVER use ${CURRENT_YEAR - 1}, ${CURRENT_YEAR - 2}, or earlier years.
2. Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}. For ${CURRENT_YEAR}, only use Q${CURRENT_QUARTER}, Q${Math.min(CURRENT_QUARTER + 1, 4)}, Q${Math.min(CURRENT_QUARTER + 2, 4)}, Q4. NEVER use past quarters (Q1-Q${CURRENT_QUARTER - 1} of ${CURRENT_YEAR}).
3. Use "95%" not "100%" for any percentage targets
4. Never say "To be established" or "TBD" - always use specific numbers provided
5. Be factual and measured - avoid superlatives like "revolutionary", "unprecedented", "transformative"
6. Use realistic language: "improved" not "revolutionary", "significant" not "unprecedented"

KEYWORDS TO INCLUDE:
- In Project Description: ${plan.keywordsRequired.projectDescription?.join(', ') || 'SBTi, Paris Agreement, NDC'}
- In Transition Strategy: ${plan.keywordsRequired.transitionStrategy?.join(', ') || '1.5°C, science-based, Scope 3'}

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

### 5. KEY TERMS AND CONDITIONS

**CRITICAL FORMATTING FOR SECTION 5:**
- Each clause/term MUST be a bullet point (•)
- Key terms/keywords within each clause MUST be **bolded**
- Structure each bullet as: "**Key Term Name**: Description of the term and conditions..."
- Examples of keywords to bold: **Margin Ratchet**, **Reporting Covenant**, **KPI Definitions**, **Default Provisions**, **Interest Rate**, **Repayment Schedule**, **Sustainability Compliance Certificate**, **Third-Party Verification**

Include these elements:
- **Standard LMA Terms**: repayment schedules, interest rates, default provisions
- **Margin Ratchet Mechanism**: tied to KPI achievement (if applicable)
- **Reporting Covenant**: annual sustainability compliance requirements
- **KPI Definitions**: specific metrics and measurement methods

${data.clauses.length > 0 ? `
## RELEVANT LMA CLAUSES TO ADAPT (from assessment):
${data.clauses.map((c, i) => `
**${i + 1}. ${c.type}** (Source: ${c.source})
Clause ID: ${c.id}
How to Apply: ${c.howToApply}
`).join('\n')}

For Section 5 (KEY TERMS AND CONDITIONS):
- Adapt each relevant clause above for this specific project
- Format as bullet points (•) with **bolded** key terms
- Include margin ratchet tied to the project's SPTs
- Include reporting covenant requirements
- Reference the clause sources (e.g., "per LMA Sustainability-Linked Loan Principles")

Example format for Section 5:
• **Margin Ratchet Mechanism**: A reduction in the interest margin will be triggered by achieving [specific KPI targets], as verified by third-party reports. The **margin reduction** will be [X-Y] basis points per year for each KPI met.
• **Reporting Covenant**: The borrower will prepare an annual **Sustainability Compliance Certificate**, verifying performance against KPIs, including [list metrics]. The report will be audited by a qualified sustainability auditor, as per **LMA Sustainability-Linked Loan Principles**.
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
  plan: NonNullable<Awaited<ReturnType<typeof phase1Analyze>>['plan']>
): Promise<{ success: boolean; content?: string; error?: string }> {
  const systemPrompt = `You are an LMA transition loan document writer. Generate sections 6-10 of a professional draft.

ABSOLUTE RULES:
1. ALL years must be ${CURRENT_YEAR} or later. NEVER use ${CURRENT_YEAR - 1}, ${CURRENT_YEAR - 2}, or earlier.
2. Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}. For ${CURRENT_YEAR}, only use Q${CURRENT_QUARTER}-Q4. NEVER use past quarters (Q1-Q${CURRENT_QUARTER - 1} of ${CURRENT_YEAR}).
3. Use "95%" not "100%" for percentage targets
4. Never say "To be established" - use specific numbers
5. Be factual - avoid superlatives like "revolutionary", "unprecedented"
6. All KPI baselines must have actual numbers, not placeholders

GREENWASHING FIXES TO APPLY (CRITICAL):
${plan.greenwashingFixes?.join('\n') || 'None'}

IMPORTANT: Section 8 (Risk Mitigation) MUST provide concrete, actionable solutions for EVERY red flag.
Do NOT just list the issues - provide SPECIFIC mitigation strategies with timelines.

Output: Clean markdown for sections 6-10 only.`;

  const kpiTable = data.kpis?.map(kpi =>
    `| ${kpi.name} | ${kpi.unit} | ${kpi.suggestedTarget} |`
  ).join('\n') || '| GHG Emissions | tCO2e/year | 45% reduction |';

  const sptTable = data.spts?.map(spt =>
    `| ${spt.name} | ${spt.baseline} | ${spt.target} | ${spt.marginImpact} |`
  ).join('\n') || '| Emissions Reduction | Baseline | Target | ±5 bps |';

  const userPrompt = `Generate sections 6-10 for: ${data.projectName}

## PROJECT DATA:
- Country: ${data.countryName}
- Sector: ${data.sector}
- Target Year: ${data.targetYear}
- Primary DFI: ${data.primaryDFI?.name || 'General'}

## KPI DATA:
| KPI | Unit | Target |
|-----|------|--------|
${kpiTable}

## SPT DATA:
| SPT | Baseline | Target | Margin Impact |
|-----|----------|--------|---------------|
${sptTable}

## RED FLAGS TO MITIGATE (CRITICAL - MUST ADDRESS EACH ONE):
${data.redFlags.length > 0 ? data.redFlags.map(r => `- **${r.description}**\n  Recommendation: ${r.recommendation}`).join('\n') : 'None identified'}

## GENERATE THESE 5 SECTIONS:

### 6. KPI FRAMEWORK
- Detailed KPI table with baselines (use real numbers, not "TBD")
- Measurement methodology
- Reporting frequency

### 7. SPT MECHANISM
- SPT table with annual milestones (years ${CURRENT_YEAR}-${data.targetYear})
- Margin adjustment mechanics
- Verification requirements

### 8. RISK MITIGATION (CRITICAL SECTION - RESOLVE ALL RED FLAGS)
**THIS SECTION MUST PROVIDE CONCRETE SOLUTIONS FOR EACH RED FLAG IDENTIFIED ABOVE**

For EACH red flag:
1. State the specific issue identified
2. Provide a CONCRETE mitigation strategy (not vague promises)
3. Define a monitoring mechanism to track resolution
4. Set a timeline for resolution (using Q${CURRENT_QUARTER} ${CURRENT_YEAR} or later)

Format as a detailed table:
| Red Flag | Mitigation Strategy | Monitoring Mechanism | Resolution Timeline |

The draft should demonstrate that ALL greenwashing concerns have been addressed with actionable plans.

### 9. DFI ROADMAP
- Documentation checklist for ${data.primaryDFI?.name || 'DFI'} submission
- Timeline (starting Q${CURRENT_QUARTER} ${CURRENT_YEAR} - current quarter)
- Key milestones (only Q${CURRENT_QUARTER}-Q4 for ${CURRENT_YEAR}, any quarter for future years)

### 10. ANNEXES
- Term sheet summary
- Calculation methodologies
- Glossary of terms`;

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
  const systemPrompt = `You are a greenwashing auditor and document reviewer. Review and clean the draft.

YOUR TASKS:
1. FIX YEARS AND QUARTERS: Replace any date before current quarter
   - Any year < ${CURRENT_YEAR} → "${CURRENT_YEAR}"
   - Current quarter is Q${CURRENT_QUARTER} ${CURRENT_YEAR}
   - "Q1 ${CURRENT_YEAR}", "Q2 ${CURRENT_YEAR}", etc. before Q${CURRENT_QUARTER} → "Q${CURRENT_QUARTER} ${CURRENT_YEAR}"
   - Keep Q${CURRENT_QUARTER}-Q4 ${CURRENT_YEAR} and all future year quarters as-is

2. REMOVE EXAGGERATED LANGUAGE:
   - "100%" → "95%"
   - "revolutionary" → "improved"
   - "unprecedented" → "significant"
   - "transformative" → "meaningful"
   - "complete elimination" → "substantial reduction"
   - "zero emissions" → "near-zero emissions"
   - Remove "first-of-its-kind", "world-leading", "best-in-class"

3. VERIFY DATA ACCURACY:
   - Scope 3 must show: ${data.scope3Baseline} tCO2e/year
   - Total budget must show: USD ${data.totalCost.toLocaleString()}
   - Reduction must show: ${data.reductionPercent}%

4. PRESERVE COMPLIANCE KEYWORDS:
   - Keep all instances of: SBTi, Paris Agreement, 1.5°C, NDC, science-based, Scope 3
   - These keywords are required for LMA scoring

5. CHECK REALISTIC CLAIMS:
   - All projections should be achievable
   - Timelines should be reasonable
   - No promises without evidence

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
      spts: sptRecommendations,
      clauses,
      countryInfo,
    };

    console.log(`[Draft Generator] Starting 3-phase generation for: ${projectName}`);

    // ========================================================================
    // PHASE 1: ANALYZE
    // ========================================================================
    const phase1Result = await phase1Analyze(preparedData);
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
      phase2GenerateSections1to5(preparedData, phase1Result.plan),
      phase2GenerateSections6to10(preparedData, phase1Result.plan),
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
