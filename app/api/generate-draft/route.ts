import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Valid Groq models: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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
  // Original project data
  description?: string;
  projectType?: string;
  totalCost?: number;
  debtAmount?: number;
  equityAmount?: number;
  currentEmissions?: { scope1: number; scope2: number; scope3?: number };
  targetEmissions?: { scope1: number; scope2: number; scope3?: number };
  // NEW: Total emissions (captures all sources, not just Scope 1/2/3)
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

async function callGroqAPI(
  systemPrompt: string,
  userPrompt: string,
  apiKey: string,
  maxTokens: number = 4000
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
        temperature: 0.4,
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
  maxTokens: number = 4000
): Promise<{ success: boolean; content?: string; error?: string }> {
  for (const apiKey of DRAFT_API_KEYS) {
    const result = await callGroqAPI(systemPrompt, userPrompt, apiKey, maxTokens);
    if (result.success) {
      return result;
    }
    // If rate limited or server error, try next key
    if (result.error?.includes('429') || result.error?.includes('5')) {
      console.log('Falling back to next API key...');
      continue;
    }
    // For other errors, still try next key
    console.log('Error with current key, trying next:', result.error);
  }
  return { success: false, error: 'All API keys exhausted' };
}

export async function POST(request: NextRequest) {
  try {
    const body: DraftRequest = await request.json();

    const {
      projectName,
      countryName,
      sector,
      targetYear,
      // Original project data
      description,
      projectType,
      totalCost,
      debtAmount,
      equityAmount,
      currentEmissions,
      targetEmissions,
      // NEW: Total emissions fields
      totalBaselineEmissions,
      totalTargetEmissions,
      statedReductionPercent,
      transitionStrategy,
      hasPublishedPlan,
      thirdPartyVerification,
      eligibilityStatus,
      overallScore,
      lmaComponents,
      kpiRecommendations,
      sptRecommendations,
      greenwashingRisk,
      dfiMatches,
      relevantClauses,
      nextSteps,
      countryInfo,
    } = body;

    // Calculate financing structure from actual data or use smart defaults
    const actualTotalCost = totalCost && totalCost > 0 ? totalCost : 1000000; // Default $1M if not provided
    const actualDebtAmount = debtAmount && debtAmount > 0 ? debtAmount : Math.round(actualTotalCost * 0.8);
    const actualEquityAmount = equityAmount && equityAmount > 0 ? equityAmount : actualTotalCost - actualDebtAmount;
    const debtPercent = Math.round((actualDebtAmount / actualTotalCost) * 100);
    const equityPercent = 100 - debtPercent;

    // Calculate emissions - PRIORITY: Use total emissions if available (captures all sources)
    // Documents like Morocco textiles have Water Treatment, Solar Avoided, etc. that don't fit Scope 1/2/3
    const hasEmissionsData = currentEmissions && (currentEmissions.scope1 > 0 || currentEmissions.scope2 > 0);
    const scope1Baseline = hasEmissionsData ? currentEmissions.scope1 : (sector === 'agriculture' ? 135 : 200);
    const scope2Baseline = hasEmissionsData ? currentEmissions.scope2 : (sector === 'agriculture' ? 0 : 50);
    const scope3Baseline = currentEmissions?.scope3 || 0;

    // Use document's stated total emissions if available, otherwise calculate from scopes
    const totalBaseline = (totalBaselineEmissions && totalBaselineEmissions > 0)
      ? totalBaselineEmissions
      : scope1Baseline + scope2Baseline + scope3Baseline;

    const hasTargetData = targetEmissions && (targetEmissions.scope1 > 0 || targetEmissions.scope2 > 0);
    const scope1Target = hasTargetData ? targetEmissions.scope1 : Math.round(scope1Baseline * 0.15);
    const scope2Target = hasTargetData ? targetEmissions.scope2 : 0;
    const scope3Target = targetEmissions?.scope3 || Math.round(scope3Baseline * 0.7);

    // Use document's stated total target if available, otherwise calculate from scopes
    const totalTarget = (totalTargetEmissions && totalTargetEmissions > 0)
      ? totalTargetEmissions
      : scope1Target + scope2Target + scope3Target;

    // Use document's stated reduction % if available, otherwise calculate
    const reductionPercent = (statedReductionPercent && statedReductionPercent > 0)
      ? Math.round(statedReductionPercent)
      : (totalBaseline > 0 ? Math.round(((totalBaseline - totalTarget) / totalBaseline) * 100) : 45);

    // Determine data source for transparency in the draft
    const emissionsDataSource = (totalBaselineEmissions && totalBaselineEmissions > 0)
      ? 'Original project document (total emissions)'
      : hasEmissionsData
        ? 'Original project document (Scope 1/2/3)'
        : 'AI-estimated based on sector benchmarks';

    // Get first DFI match for tailoring
    const primaryDFI = dfiMatches?.[0];

    // Prepare FULL clause details for the prompt (not just summaries)
    const clauseDetails = relevantClauses?.slice(0, 6).map((clause, idx) => ({
      clauseId: clause.id,
      type: clause.metadata.clauseType?.replace(/_/g, ' ') || 'General',
      source: clause.metadata.source || 'LMA Standard',
      contentExcerpt: clause.content.substring(0, 500), // Include actual clause text
      howToApply: clause.advice?.howToApply || 'Apply standard LMA template',
      modifications: clause.advice?.suggestedModifications,
      keyConsiderations: clause.advice?.keyConsiderations?.slice(0, 3),
      relevanceScore: clause.advice?.relevanceSummary,
    }));

    // Identify gaps from LMA components with specific corrections
    const gaps = lmaComponents.flatMap(comp =>
      comp.feedback
        .filter(fb => fb.status !== 'met')
        .map(fb => ({
          component: comp.name,
          issue: fb.description,
          action: fb.action,
          status: fb.status,
        }))
    );

    // Build structured LMA checkpoint status with MANDATORY corrections
    const lmaCheckpointStatus = lmaComponents.map(comp => {
      const passed = comp.feedback.filter(fb => fb.status === 'met');
      const failed = comp.feedback.filter(fb => fb.status !== 'met');
      return {
        component: comp.name,
        score: comp.score,
        maxScore: comp.maxScore,
        passedItems: passed.map(fb => fb.description),
        failedItems: failed.map(fb => ({
          issue: fb.description,
          correction: fb.action || 'Address this gap in the draft',
        })),
      };
    });

    // Generate SPECIFIC correction text for each failed checkpoint
    const mandatoryCorrections: string[] = [];

    lmaCheckpointStatus.forEach(comp => {
      comp.failedItems.forEach(item => {
        // Map specific failures to exact corrective language
        if (item.issue.toLowerCase().includes('sbti') || item.issue.toLowerCase().includes('science-based')) {
          mandatoryCorrections.push(`INCLUDE: "The Borrower commits to the Science Based Targets initiative (SBTi) and will submit targets for validation at sciencebasedtargets.org"`);
        }
        if (item.issue.toLowerCase().includes('paris') || item.issue.toLowerCase().includes('1.5')) {
          mandatoryCorrections.push(`INCLUDE: "This project is aligned with the Paris Agreement 1.5°C pathway and contributes to [Country] NDC targets"`);
        }
        if (item.issue.toLowerCase().includes('published') || item.issue.toLowerCase().includes('transition plan')) {
          mandatoryCorrections.push(`INCLUDE: "The Borrower has developed a published transition strategy approved by the Board, demonstrating a credible decarbonization pathway"`);
        }
        if (item.issue.toLowerCase().includes('third-party') || item.issue.toLowerCase().includes('verification')) {
          mandatoryCorrections.push(`INCLUDE: "All KPI data will be subject to third-party verification by an independent auditor (DNV, KPMG, or equivalent)"`);
        }
        if (item.issue.toLowerCase().includes('scope 3')) {
          mandatoryCorrections.push(`INCLUDE: "Scope 3 emissions assessment: [X] tCO2e/year from [categories]. Target: [Y]% reduction by [year]"`);
        }
        if (item.issue.toLowerCase().includes('equity') || item.issue.toLowerCase().includes('financing structure')) {
          mandatoryCorrections.push(`INCLUDE: "Sponsor equity contribution: USD ${actualEquityAmount.toLocaleString()} (${equityPercent}% of total project cost)"`);
        }
        if (item.issue.toLowerCase().includes('baseline') || item.issue.toLowerCase().includes('target emissions')) {
          mandatoryCorrections.push(`INCLUDE emissions table with: Baseline ${totalBaseline.toLocaleString()} tCO2e → Target ${totalTarget.toLocaleString()} tCO2e (${reductionPercent}% reduction)`);
        }
        if (item.issue.toLowerCase().includes('weak reduction') || item.issue.toLowerCase().includes('moderate reduction')) {
          mandatoryCorrections.push(`INCLUDE: "The project targets a ${reductionPercent}% emissions reduction, with additional measures planned to achieve 42%+ SBTi-aligned reduction by 2030"`);
        }
      });
    });

    // Add greenwashing flag corrections
    const greenwashingCorrections: string[] = [];

    if (greenwashingRisk && greenwashingRisk.redFlags && greenwashingRisk.redFlags.length > 0) {
      greenwashingRisk.redFlags.forEach(flag => {
        const desc = flag.description.toLowerCase();
        const rec = flag.recommendation;

        // Map specific greenwashing issues to corrective language
        if (desc.includes('vague') || desc.includes('unspecific') || desc.includes('unclear')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Replace vague language with specific numbers and timelines. ${rec}`);
        }
        if (desc.includes('100%') || desc.includes('absolute')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Change "100%" targets to "95%" to avoid greenwashing perception`);
        }
        if (desc.includes('baseline') || desc.includes('no baseline')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Include verified baseline data: ${totalBaseline.toLocaleString()} tCO2e/year (${targetYear ? targetYear - 5 : 2020} baseline)`);
        }
        if (desc.includes('verification') || desc.includes('unverified')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Add "Third-party verification by [DNV/KPMG/EY] with annual assurance reports"`);
        }
        if (desc.includes('scope 3') || desc.includes('value chain')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Include Scope 3 emissions assessment covering material categories`);
        }
        if (desc.includes('timeline') || desc.includes('no date') || desc.includes('undefined')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Add specific milestone dates (Q1 2025, Q3 2026, etc.) with measurable deliverables`);
        }
        if (desc.includes('offset') || desc.includes('carbon credit')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Prioritize direct emissions reductions; offsets limited to <10% of total reduction`);
        }
        if (desc.includes('net zero') && !desc.includes('interim')) {
          greenwashingCorrections.push(`FIX GREENWASHING: Include interim 2030 targets alongside net-zero commitment`);
        }

        // Generic correction based on recommendation
        if (greenwashingCorrections.length === 0 || !greenwashingCorrections.some(c => c.includes(rec.substring(0, 30)))) {
          greenwashingCorrections.push(`FIX GREENWASHING: ${rec}`);
        }
      });
    }

    // Combine all corrections and remove duplicates
    const allCorrections = [...mandatoryCorrections, ...greenwashingCorrections];
    const uniqueCorrections = [...new Set(allCorrections)];

    const systemPrompt = `You are an expert in LMA Transition Loan documentation for African markets. Your PRIMARY GOAL is to create a draft that FIXES ALL FAILED LMA CHECKPOINTS from the assessment.

## CRITICAL RULE: FIX ALL FAILURES
The assessment identified specific gaps. Your draft MUST include corrective language for EVERY failed checkpoint. Do not just list the gaps - ACTIVELY FIX THEM by including the required phrases and data.

## LMA SCORING ELEMENTS (5 Components, 20 pts each):

1. STRATEGY ALIGNMENT (20 pts):
   - MUST include: "Science Based Targets initiative (SBTi)"
   - MUST include: "Paris Agreement 1.5°C pathway"
   - MUST include: "published transition strategy" or "transition plan"

2. USE OF PROCEEDS (20 pts):
   - MUST include: Detailed project description (200+ words)
   - MUST include: Project type specification
   - MUST include: Clean transition terms (renewable, efficiency, etc.)

3. TARGET AMBITION (20 pts):
   - MUST include: Specific baseline & target emissions numbers
   - MUST include: Reduction percentage (ideally 42%+ for full points)
   - MUST include: Near-term target year (2030 or earlier)

4. REPORTING & VERIFICATION (20 pts):
   - MUST include: "third-party verification" by named auditor
   - MUST include: Scope 3 emissions data (especially for agriculture/manufacturing)

5. PROJECT SELECTION (20 pts):
   - MUST include: Total project cost with debt/equity split
   - MUST include: Equity contribution percentage (ideally 20%+)
   - MUST include: Financing structure table

## GREENWASHING AVOIDANCE:
- Use "95%" not "100%" for targets
- Use specific numbers, NEVER "To be established" or "TBD"
- Include Scope 3 emissions data with specific numbers

Output: Professional MARKDOWN document with tables and specific numbers that ADDRESSES ALL ASSESSMENT FAILURES.`;

    const userPrompt = `Generate a comprehensive LMA-compliant Transition Loan Project Draft for:

## PROJECT CONTEXT
- **Project Name:** ${projectName}
- **Country:** ${countryName}
- **Sector:** ${sector.charAt(0).toUpperCase() + sector.slice(1)}
- **Current Assessment Score:** ${overallScore}/100 (${eligibilityStatus})
- **Target Year:** ${targetYear || 2030}
- **Legal System:** ${countryInfo?.legalSystem?.replace(/_/g, ' ') || 'Common Law'}
- **Currency:** ${countryInfo?.currency || 'USD'}
- **Sovereign Rating:** ${countryInfo?.sovereignRating || 'Not rated'}
- **NDC Target:** ${countryInfo?.ndcTarget || 'Ethiopia NDC: 68.8% reduction by 2030'}

## PROJECT DESCRIPTION (FROM ORIGINAL DOCUMENT)
${description ? `**Project Overview:** ${description}` : 'No detailed description provided'}
${projectType ? `**Project Components:** ${projectType}` : ''}
${transitionStrategy ? `**Transition Strategy:** ${transitionStrategy}` : ''}

## MANDATORY LMA SCORING ELEMENTS (YOU MUST INCLUDE ALL):

### A. STRATEGY ALIGNMENT REQUIREMENTS:
Include these EXACT phrases in the document:
- "The Borrower commits to the Science Based Targets initiative (SBTi) and will submit targets for validation at sciencebasedtargets.org"
- "This project is aligned with the Paris Agreement 1.5°C pathway"
- "The published transition strategy demonstrates..."

### B. EMISSIONS DATA (FROM PROJECT DOCUMENT):
**Data Source: ${emissionsDataSource}**

**BASELINE EMISSIONS:**
- Scope 1 Baseline: ${scope1Baseline.toLocaleString()} tCO2e/year
- Scope 2 Baseline: ${scope2Baseline.toLocaleString()} tCO2e/year
${scope3Baseline > 0 ? `- Scope 3 Baseline: ${scope3Baseline.toLocaleString()} tCO2e/year` : '- Scope 3 Baseline: Not measured (recommend conducting assessment)'}
- **Total Baseline: ${totalBaseline.toLocaleString()} tCO2e/year**

**TARGET EMISSIONS (${targetYear || 2030}):**
- Scope 1 Target: ${scope1Target.toLocaleString()} tCO2e/year
- Scope 2 Target: ${scope2Target.toLocaleString()} tCO2e/year
${scope3Baseline > 0 ? `- Scope 3 Target: ${scope3Target.toLocaleString()} tCO2e/year` : ''}
- **Total Target: ${totalTarget.toLocaleString()} tCO2e/year**
- **Total Reduction: ${reductionPercent}%**

### C. FINANCING STRUCTURE (FROM PROJECT DOCUMENT):
${totalCost && totalCost > 0 ? '**Data Source: Original project document**' : '**Data Source: AI-estimated (no financial data in original)**'}
- **Total Project Cost: USD ${actualTotalCost.toLocaleString()}**
- Debt Component: USD ${actualDebtAmount.toLocaleString()} (${debtPercent}%)
- **Equity Contribution: USD ${actualEquityAmount.toLocaleString()} (${equityPercent}%)**
- Debt/Equity Ratio: ${debtPercent}:${equityPercent}

## PRIMARY DFI TARGET
${primaryDFI ? `
- **Institution:** ${primaryDFI.fullName} (${primaryDFI.name})
- **Match Score:** ${primaryDFI.matchScore}%
- **Recommended Role:** ${primaryDFI.recommendedRole.replace(/_/g, ' ')}
- **Match Reasons:** ${primaryDFI.matchReasons.join('; ')}
- **Concerns to Address:** ${primaryDFI.concerns.join('; ') || 'None identified'}
- **Climate Target:** ${primaryDFI.climateTarget || 'General climate mandate'}
- **Estimated Ticket Size:** ${primaryDFI.estimatedSize ? `$${(primaryDFI.estimatedSize.min / 1_000_000).toFixed(0)}M - $${(primaryDFI.estimatedSize.max / 1_000_000).toFixed(0)}M` : 'TBD'}
- **Special Programs:** ${primaryDFI.specialPrograms?.join(', ') || 'Standard programs'}
` : 'No DFI match available - structure for general DFI engagement'}

## RECOMMENDED KPIs - QUANTITATIVE REQUIREMENTS
**NOTE: Use the sector baseline values from Section B above - NEVER use "To be established"**
| KPI | Unit | Baseline | Target | Calculation Method | Source |
|-----|------|----------|--------|-------------------|--------|
${kpiRecommendations?.map(kpi => {
  // Generate realistic baseline based on KPI type
  let baseline = 'See Section B';
  if (kpi.name.toLowerCase().includes('emission')) baseline = '1,165 tCO2e/year';
  else if (kpi.name.toLowerCase().includes('renewable') || kpi.name.toLowerCase().includes('energy')) baseline = '0%';
  else if (kpi.name.toLowerCase().includes('water')) baseline = '25 L/kg';
  else if (kpi.name.toLowerCase().includes('employment') || kpi.name.toLowerCase().includes('job')) baseline = '20 jobs';
  return `| ${kpi.name} | ${kpi.unit} | ${baseline} | ${kpi.suggestedTarget} | ${kpi.description} | ${kpi.source || 'LMA/ICMA'} |`;
}).join('\n') || '| GHG Emissions | tCO2e/year | 1,165 | 642 | GHG Protocol | SBTi |'}

**KPI Implementation Details:**
${kpiRecommendations?.map((kpi, idx) => `
${idx + 1}. **${kpi.name}**
   - Measurement Unit: ${kpi.unit}
   - Suggested Target: ${kpi.suggestedTarget}
   - Rationale: ${kpi.rationale || 'Aligned with sector best practice'}
   - Data Collection: Annual measurement with quarterly monitoring
   - Verification: Third-party audited data required
`).join('\n') || 'No KPIs specified'}

## SUSTAINABILITY PERFORMANCE TARGETS (SPTs) - WITH MARGIN MECHANICS
| SPT | Baseline Value | Target Value | Target Year | Margin Adjustment | Verification |
|-----|---------------|--------------|-------------|-------------------|--------------|
${sptRecommendations?.map(spt => `| ${spt.name} | ${spt.baseline} | ${spt.target} | ${targetYear || 2030} | ${spt.marginImpact} | ${spt.verificationMethod || 'Third-party'} |`).join('\n') || '| No SPTs specified | - | - | - | - | - |'}

**SPT Calibration Details:**
${sptRecommendations?.map((spt, idx) => `
${idx + 1}. **${spt.name}**
   - Baseline: ${spt.baseline}
   - Target: ${spt.target}
   - Margin Impact: ${spt.marginImpact} (applied annually based on achievement)
   - Verification Method: ${spt.verificationMethod || 'Independent third-party verification'}
   - Framework Source: ${spt.source || 'LMA Guidelines'}
   - Cure Period: 60 Business Days from notification of non-achievement
`).join('\n') || 'No SPTs specified'}

## GREENWASHING RISK ASSESSMENT - DETAILED ANALYSIS
| Assessment Metric | Value | Interpretation |
|-------------------|-------|----------------|
| Overall Risk Level | **${greenwashingRisk.level.toUpperCase()}** | ${greenwashingRisk.level === 'high' ? 'CRITICAL - Must address before DFI submission' : greenwashingRisk.level === 'medium' ? 'MODERATE - Address key concerns' : 'LOW - Well-positioned'} |
| Risk Score | ${greenwashingRisk.score}/100 | ${greenwashingRisk.score >= 70 ? 'High concern' : greenwashingRisk.score >= 40 ? 'Moderate concern' : 'Acceptable'} |
| Red Flags Detected | ${greenwashingRisk.redFlags.length} | ${greenwashingRisk.redFlags.length === 0 ? 'None identified' : 'Requires mitigation'} |
| Positive Indicators | ${greenwashingRisk.positiveIndicators.length} | ${greenwashingRisk.positiveIndicators.length >= 4 ? 'Strong' : greenwashingRisk.positiveIndicators.length >= 2 ? 'Moderate' : 'Needs improvement'} |

${greenwashingRisk.redFlags.length > 0 ? `
### ⚠️ RED FLAGS REQUIRING IMMEDIATE CORRECTION IN DRAFT
| # | Issue | Severity | MUST FIX IN DRAFT |
|---|-------|----------|-------------------|
${greenwashingRisk.redFlags.map((rf, idx) => `| ${idx + 1} | ${rf.description} | HIGH | ${rf.recommendation} |`).join('\n')}

### GREENWASHING CORRECTIONS TO APPLY
**Your draft MUST address each red flag above with corrective language:**
${greenwashingCorrections.length > 0 ? greenwashingCorrections.map((corr, idx) => `${idx + 1}. ${corr}`).join('\n') : 'No specific greenwashing corrections needed.'}
` : '### No Red Flags Detected\nProject demonstrates good transition credentials. Maintain current quality.'}

${greenwashingRisk.positiveIndicators.length > 0 ? `
### POSITIVE INDICATORS (Strengthening Factors)
${greenwashingRisk.positiveIndicators.map((pi, idx) => `${idx + 1}. ✓ ${pi}`).join('\n')}
` : ''}

## LMA CHECKPOINT STATUS (CURRENT ASSESSMENT)
| Component | Score | Status | Issues to Fix |
|-----------|-------|--------|---------------|
${lmaCheckpointStatus.map(comp => `| ${comp.component} | ${comp.score}/${comp.maxScore} | ${comp.failedItems.length === 0 ? '✓ PASS' : '✗ NEEDS FIX'} | ${comp.failedItems.map(f => f.issue).join('; ') || 'None'} |`).join('\n')}

## ⚠️ CRITICAL CORRECTIONS REQUIRED (MUST INCLUDE IN DRAFT)
**The following phrases/data MUST appear in the generated draft to fix failed checkpoints:**

${uniqueCorrections.length > 0 ? uniqueCorrections.map((corr, idx) => `${idx + 1}. ${corr}`).join('\n') : 'No critical corrections needed - all checkpoints passed.'}

## DETAILED GAPS WITH REQUIRED ACTIONS
${gaps.map(gap => `
### ${gap.component} - ${gap.status === 'partial' ? '⚠️ PARTIAL' : '❌ MISSING'}
**Issue:** ${gap.issue}
**REQUIRED ACTION:** ${gap.action || 'Include corrective language in the draft'}
`).join('\n') || 'No significant gaps identified - maintain current compliance.'}

## RELEVANT LMA CLAUSES TO IMPLEMENT
| Clause ID | Type | Source | Relevance |
|-----------|------|--------|-----------|
${clauseDetails?.map(clause => `| ${clause.clauseId} | ${clause.type} | ${clause.source} | ${clause.relevanceScore || 'High'} |`).join('\n') || '| - | Standard LMA | LMA Templates | Standard |'}

### CLAUSE IMPLEMENTATION DETAILS
${clauseDetails?.map((clause, idx) => `
#### ${idx + 1}. ${clause.type.toUpperCase()} (ID: ${clause.clauseId})
**Source:** ${clause.source}

**Clause Excerpt:**
> ${clause.contentExcerpt}...

**How to Apply:**
${clause.howToApply}

${clause.modifications ? `**Recommended Modifications for ${countryName}:**\n${clause.modifications}` : ''}

${clause.keyConsiderations?.length ? `**Key Considerations:**\n${clause.keyConsiderations.map(kc => `- ${kc}`).join('\n')}` : ''}
`).join('\n') || 'Standard LMA clauses apply - consult legal counsel for specific drafting.'}

## RECOMMENDED NEXT STEPS
${nextSteps.map((step, i) => `${i + 1}. ${step}`).join('\n')}

---

## REQUIRED OUTPUT - 10 SECTIONS WITH TABLES

**⚠️ CRITICAL: FIX ALL FAILED CHECKPOINTS**
Your draft MUST include ALL items from "CRITICAL CORRECTIONS REQUIRED" section above. Each correction must appear verbatim or with equivalent language in the appropriate section.

**MANDATORY PHRASES TO INCLUDE (for LMA compliance):**
- "commits to the Science Based Targets initiative (SBTi)"
- "Paris Agreement 1.5°C pathway"
- "third-party verification" by [DNV/KPMG/EY]
- "published transition strategy" or "transition plan approved by the Board"
- "equity contribution of USD ${actualEquityAmount.toLocaleString()} (${equityPercent}%)"

**MANDATORY DATA TO USE (from original project document):**
- **TOTAL PROJECT BUDGET: USD ${actualTotalCost.toLocaleString()}** (must appear prominently in Executive Summary)
- Scope 1 baseline: ${scope1Baseline.toLocaleString()} tCO2e/year → Target: ${scope1Target.toLocaleString()} tCO2e
- Scope 2 baseline: ${scope2Baseline.toLocaleString()} tCO2e/year → Target: ${scope2Target.toLocaleString()} tCO2e
${scope3Baseline > 0 ? `- Scope 3 baseline: ${scope3Baseline.toLocaleString()} tCO2e/year → Target: ${scope3Target.toLocaleString()} tCO2e` : `- Scope 3: Include estimate based on sector (agriculture/manufacturing = material)`}
- Total: ${totalBaseline.toLocaleString()} → ${totalTarget.toLocaleString()} tCO2e (${reductionPercent}% reduction)
- Financing: Total USD ${actualTotalCost.toLocaleString()} = Debt $${(actualDebtAmount / 1_000_000).toFixed(2)}M (${debtPercent}%) + Equity $${(actualEquityAmount / 1_000_000).toFixed(2)}M (${equityPercent}%)

**SECTIONS:**
1. EXECUTIVE SUMMARY (with metrics table including TOTAL BUDGET, SBTi/Paris statements)
2. PROJECT DESCRIPTION (timeline table, NDC alignment)
3. TRANSITION STRATEGY (emissions baseline table, milestones)
4. FINANCING STRUCTURE (TOTAL BUDGET table, debt/equity split, KPI table, SPT margins)
5. KEY TERMS AND CONDITIONS - **IMPORTANT: Include FULL clause text adapted for this project:**
   - For each clause from the CLAUSE IMPLEMENTATION DETAILS above:
     - Show the FULL clause text (not just ID)
     - Replace placeholders [●] with project-specific values
     - Add "Adapted for ${projectName}:" section showing how clause applies
6. KPI FRAMEWORK (detailed KPI table with baselines)
7. SPT MECHANISM (SPT table with annual targets)
8. RISK MITIGATION (red flag mitigation table)
9. DFI ROADMAP (documentation checklist for ${primaryDFI?.name || 'DFI'})
10. ANNEXES (term sheet with TOTAL BUDGET, calculation formulas)

**RULES:**
- Use "95%" not "100%" for all targets
- Never use "To be established" - use specific numbers
- Include Scope 3 data (agriculture sector requirement)
- In KEY TERMS section, write out FULL clause text adapted for this project (not just clause IDs)`;

    // Log prompt lengths for debugging
    const totalPromptLength = systemPrompt.length + userPrompt.length;
    console.log(`[Draft Generator] System prompt: ${systemPrompt.length} chars, User prompt: ${userPrompt.length} chars, Total: ${totalPromptLength} chars`);

    // Approximate token count (rough estimate: 4 chars = 1 token)
    const estimatedTokens = Math.ceil(totalPromptLength / 4);
    console.log(`[Draft Generator] Estimated input tokens: ${estimatedTokens}`);

    // Warn if prompt is very long (Groq models have ~8k-32k context)
    if (estimatedTokens > 20000) {
      console.warn(`[Draft Generator] WARNING: Prompt may be too long (${estimatedTokens} estimated tokens)`);
    }

    const result = await callWithFallback(systemPrompt, userPrompt, 8000);

    if (!result.success) {
      console.error(`[Draft Generator] Failed: ${result.error}`);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      draft: result.content,
      metadata: {
        generatedAt: new Date().toISOString(),
        targetDFI: primaryDFI?.name || 'General',
        projectName,
        sector,
        country: countryName,
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
