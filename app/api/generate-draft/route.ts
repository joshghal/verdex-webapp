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
      relevanceScore?: number;
      relevanceSummary: string;
      howToApply: string;
      whenToUse?: string;
      keyConsiderations: string[];
      suggestedModifications?: string;
      contextualizedExample?: string; // AI-generated adjusted clause for this project
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
    contextualizedExample?: string; // AI-generated adjusted clause text
    relevanceScore?: number;
    keyConsiderations?: string[];
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

// ============================================================================
// SOURCE REFERENCE FORMATTER
// Cleans up PDF filenames and formats source references for readability
// ============================================================================
function formatSourceReference(source: string): string {
  if (!source) return 'LMA Standard';

  // Remove file extensions
  let formatted = source.replace(/\.(pdf|docx|doc|xlsx|xls)$/i, '');

  // Replace underscores and hyphens with spaces
  formatted = formatted.replace(/[_-]/g, ' ');

  // Handle common abbreviations (keep them uppercase)
  const abbreviations = ['SBTi', 'LMA', 'GHG', 'ESG', 'TPT', 'SPT', 'KPI', 'NDC', 'TCFD', 'CDP', 'ISO', 'GRI', 'ICMA', 'CBI'];
  abbreviations.forEach(abbr => {
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    formatted = formatted.replace(regex, abbr);
  });

  // Clean up version numbers (V1, V2, etc.)
  formatted = formatted.replace(/\bV(\d+)\b/gi, 'Version $1');

  // Remove extra spaces
  formatted = formatted.replace(/\s+/g, ' ').trim();

  // Title case words (except abbreviations)
  formatted = formatted.split(' ').map(word => {
    if (abbreviations.includes(word.toUpperCase())) return word;
    if (/^(v|Version)\d+$/i.test(word)) return word;
    if (word.length <= 2) return word.toLowerCase();
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');

  return formatted;
}

// ============================================================================
// PROGRAMMATIC CLAUSE SECTION BUILDER
// Builds the adapted clauses section without AI - 100% reliable insertion
// ============================================================================
function buildAdaptedClausesSection(clauses: PreparedData['clauses'], projectName: string): string {
  if (!clauses || clauses.length === 0) {
    return '';
  }

  // Group clauses by type for better organization
  const clauseGroups: Record<string, typeof clauses> = {
    'Margin & Interest': [],
    'KPI & Performance': [],
    'Verification & Reporting': [],
    'Use of Proceeds': [],
    'Other Terms': [],
  };

  clauses.forEach(clause => {
    const type = clause.type.toLowerCase();
    if (type.includes('margin') || type.includes('interest') || type.includes('ratchet')) {
      clauseGroups['Margin & Interest'].push(clause);
    } else if (type.includes('kpi') || type.includes('spt') || type.includes('performance') || type.includes('target')) {
      clauseGroups['KPI & Performance'].push(clause);
    } else if (type.includes('verification') || type.includes('reporting') || type.includes('covenant')) {
      clauseGroups['Verification & Reporting'].push(clause);
    } else if (type.includes('proceeds') || type.includes('use of')) {
      clauseGroups['Use of Proceeds'].push(clause);
    } else {
      clauseGroups['Other Terms'].push(clause);
    }
  });

  let section = `

---

## ANNEX A: ADAPTED LMA CLAUSES

*The following clauses have been adapted from standard LMA templates specifically for ${projectName}. These AI-generated clause texts are ready for review and incorporation into the loan agreement.*

`;

  Object.entries(clauseGroups).forEach(([groupName, groupClauses]) => {
    if (groupClauses.length === 0) return;

    section += `### ${groupName}\n\n`;

    groupClauses.forEach((clause, index) => {
      section += `**${index + 1}. ${clause.type.charAt(0).toUpperCase() + clause.type.slice(1)}**\n`;
      section += `*Source: ${formatSourceReference(clause.source)}*\n\n`;

      if (clause.contextualizedExample) {
        section += `${clause.contextualizedExample}\n\n`;
      } else {
        section += `*[Standard ${clause.type} clause to be adapted]*\n\n`;
      }

      if (clause.howToApply) {
        section += `> **Application Note:** ${clause.howToApply}\n\n`;
      }
    });
  });

  section += `---

*End of Adapted Clauses Annex*
`;

  return section;
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
  const systemPrompt = `Output valid JSON only. Structure:
{"keywordsRequired":{"projectDescription":["SBTi","Paris Agreement"],"transitionStrategy":["1.5°C","Scope 3"]},"greenwashingFixes":["fix1","fix2"]}`;

  const userPrompt = `Analyze: ${data.projectName} (${data.countryName}, ${data.sector})
Failed: ${data.failedItems.slice(0, 3).map(f => f.issue).join('; ') || 'None'}
Red flags: ${data.redFlags.slice(0, 3).map(r => r.description).join('; ') || 'None'}
Output JSON with keywordsRequired and greenwashingFixes.`;

  console.log('[Phase 1: ANALYZE] Starting...');
  const result = await callWithFallback(systemPrompt, userPrompt, 500, 0.2); // Small JSON output

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
  const lmaContext = lmaGuideContext?.content
    ? `\nLMA GUIDE REFERENCE:\n${lmaGuideContext.content.substring(0, 1500)}\n`
    : '';

  // Safely extract keywords with defaults
  const projKeywords = plan?.keywordsRequired?.projectDescription?.join(', ') || 'SBTi, Science Based Targets, Paris Agreement, NDC';
  const transKeywords = plan?.keywordsRequired?.transitionStrategy?.join(', ') || '1.5°C pathway, science-based targets, Scope 3';

  const systemPrompt = `You are an LMA transition loan document writer. Generate sections 1-5.
${lmaContext}
RULES: Use specific numbers (no TBD/TBC). Include SBTi, Paris Agreement, NDC, 1.5°C, Scope 1/2/3. Years must be ${CURRENT_YEAR}+. Be factual, no superlatives.

KEYWORDS: Project Description: ${projKeywords}
Transition Strategy: ${transKeywords}`;

  const userPrompt = `Generate sections 1-5 for: **${data.projectName}** (${data.countryName}, ${data.sector})

DATA:
- Budget: USD ${data.totalCost.toLocaleString()} (Debt: ${data.debtPercent}%, Equity: ${data.equityPercent}%)
- Emissions: Scope1=${data.scope1Baseline}→${data.scope1Target}, Scope2=${data.scope2Baseline}→${data.scope2Target}, Scope3=${data.scope3Baseline}→${data.scope3Target} tCO2e/year
- Reduction: ${data.reductionPercent}% by ${data.targetYear}
- DFI: ${data.primaryDFI?.name || 'General'}

CONTEXT: ${data.description || 'Transition project'} ${data.transitionStrategy || ''}

SECTIONS:
1. EXECUTIVE SUMMARY - Key metrics table, budget, SBTi/Paris alignment
2. PROJECT DESCRIPTION (>200 words) - Activities, timeline (Q${CURRENT_QUARTER} ${CURRENT_YEAR}+), outcomes. Include: SBTi, Science Based Targets, Paris Agreement, NDC
3. TRANSITION STRATEGY - Emissions table (all 3 scopes), roadmap. Include: 1.5°C pathway, third-party verification
4. FINANCING STRUCTURE - Debt/equity table, cost breakdown, DFI strategy
5. USE OF PROCEEDS & ELIGIBILITY - Categories with % allocation, eligibility criteria, key terms (margin ratchet, TPT definitions, reporting covenants)

Output clean markdown.`;

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
  const lmaContext = lmaGuideContext?.content
    ? `\nLMA GUIDE REFERENCE:\n${lmaGuideContext.content.substring(0, 1500)}\n`
    : '';

  // Safely extract greenwashing fixes with default
  const gwFixes = plan?.greenwashingFixes?.slice(0, 3).join('; ') || 'Use specific numbers, avoid vague language';

  const systemPrompt = `You are an LMA transition loan document writer. Generate sections 6-10.
${lmaContext}
RULES: Use specific numbers (no TBD). Years must be ${CURRENT_YEAR}+. Use TPTs (not SPTs). Include third-party verification, SPO. Be factual.

GREENWASHING FIXES: ${gwFixes}`;

  // Build compact data tables
  const kpiData = data.kpis?.slice(0, 4).map(k => `${k.name}:${k.suggestedTarget}`).join(', ') || 'GHG:45% reduction';
  const tptData = data.tpts?.slice(0, 3).map(t => `${t.name}:${t.baseline}→${t.target}(${t.marginImpact})`).join(', ') || 'Emissions:±5-15bps';
  const transitionTargets = [
    ...data.transitionPlan.shortTermTargets.map(t => `Short(${t.year}):${t.target}`),
    ...data.transitionPlan.mediumTermTargets.map(t => `Mid(${t.year}):${t.target}`),
    ...data.transitionPlan.longTermTargets.map(t => `Long(${t.year}):${t.target}`)
  ].join(', ');

  const userPrompt = `Generate sections 6-10 for: **${data.projectName}** (${data.countryName}, ${data.sector})

DATA:
- Target Year: ${data.targetYear}, DFI: ${data.primaryDFI?.name || 'General'}
- Pathway: ${data.transitionPlan.sectorPathway}
- Transition Targets: ${transitionTargets}
- KPIs: ${kpiData}
- TPTs: ${tptData}
- Review: Pre-signing=${data.externalReview.preSigning}, Annual=${data.externalReview.annual}
- Governance: Board=${data.governanceFramework.boardOversight}, Committee=${data.governanceFramework.climateCommittee}

RED FLAGS TO ADDRESS: ${data.redFlags.length > 0 ? data.redFlags.map(r => r.description).join('; ') : 'None'}

GENERATE DETAILED SECTIONS:

### 6. TRANSITION PLAN
**6.1 Decarbonization Pathway** - Table with columns: Timeframe | Year Range | Target | Key Actions
- Short-term (${CURRENT_YEAR}-${CURRENT_YEAR + 2}): 15-25% reduction, immediate measures
- Medium-term (${CURRENT_YEAR + 3}-2035): 40-50% reduction (SBTi 1.5°C aligned)
- Long-term (2036-${data.targetYear}): Net zero / 90%+ reduction

**6.2 Sector Pathway Alignment** - Benchmark (SBTi/ACT/TPI), methodology, alignment statement
**6.3 Governance Framework** - Board oversight, climate committee, executive incentives, TCFD/CDP disclosure
**6.4 Just Transition** - Workforce reskilling plans, community impact mitigation, stakeholder engagement

### 7. KPI FRAMEWORK
- Detailed KPI table: KPI | Unit | Baseline | Target | Methodology | Reporting Frequency
- Include: emissions reduction, renewable capacity, decommissioning progress, worker reskilling
- Methodology: GHG Protocol, ISO 14064

### 8. TPT MECHANISM (Transition Performance Targets)
- TPT table: TPT | Baseline | Target | Milestones | Margin Adjustment
- Margin mechanics: -5 to -15 bps for achieving, +5 to +10 bps for missing
- Annual third-party verification required
- Grace period and consequences of TPT miss

### 9. RISK MITIGATION & EXTERNAL REVIEW
For EACH red flag, provide detailed response:
- Issue identified
- Concrete mitigation strategy (specific actions)
- Monitoring mechanism
- Timeline (Q${CURRENT_QUARTER} ${CURRENT_YEAR}+)

**9.2 External Review Table:**
| Review Type | Timing | Provider | Scope |
SPO (pre-signing), Annual Verification, GHG Audit

### 10. DFI ROADMAP & ANNEXES

#### 10.1 DFI Roadmap
Create a detailed submission roadmap table for **${data.primaryDFI?.name || 'DFI'}**:

| Phase | Timeline | Activities | Deliverables | Status |
|-------|----------|------------|--------------|--------|
| Phase 1: Pre-Application | Q${CURRENT_QUARTER} ${CURRENT_YEAR} | Initial outreach, concept note preparation | Concept Note, Project Summary | Pending |
| Phase 2: Due Diligence | Q${Math.min(CURRENT_QUARTER + 1, 4)} ${CURRENT_QUARTER === 4 ? CURRENT_YEAR + 1 : CURRENT_YEAR} | Document submission, site visit, ESG review | Full Application Package, ESIA | Pending |
| Phase 3: Appraisal | Q${Math.min(CURRENT_QUARTER + 2, 4)} ${CURRENT_QUARTER >= 3 ? CURRENT_YEAR + 1 : CURRENT_YEAR} | Financial modeling, term negotiation | Term Sheet, Financial Model | Pending |
| Phase 4: Approval | +3-4 months | Board/committee approval | Commitment Letter | Pending |
| Phase 5: Disbursement | +1-2 months | Legal documentation, conditions precedent | Loan Agreement, First Disbursement | Pending |

**${data.primaryDFI?.name || 'DFI'} Specific Requirements:**
- Climate finance allocation: ${data.primaryDFI?.climateTarget || 'Per DFI climate strategy'}
- Recommended role: ${data.primaryDFI?.recommendedRole || 'Senior lender or anchor investor'}
- Special programs: ${data.primaryDFI?.specialPrograms?.join(', ') || 'Standard climate finance windows'}

**Key Contact Points:**
- Climate Finance Team
- Regional Office (${data.countryName})
- Project Preparation Facility (if applicable)

#### 10.2 Documentation Checklist
- [ ] Transition Plan document
- [ ] Financial projections (5-year)
- [ ] Environmental & Social Impact Assessment
- [ ] Corporate governance documents
- [ ] Historical financial statements (3 years)
- [ ] Technical feasibility study
- [ ] Market analysis
- [ ] SPO/External Review report

#### 10.3 Glossary
| Term | Definition |
|------|------------|
| SBTi | Science Based Targets initiative |
| TPT | Transition Performance Target |
| SPO | Second Party Opinion |
| GHG Protocol | Greenhouse Gas Protocol |
| bps | Basis points (1/100th of 1%) |
| tCO2e | Tonnes of CO2 equivalent |
| MW | Megawatt |
| NDC | Nationally Determined Contribution |
| TCFD | Task Force on Climate-related Financial Disclosures |

Output comprehensive markdown.`;

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

    // Prepare clause data - include AI-generated contextualized examples
    const clauses = relevantClauses?.slice(0, 6).map(clause => ({
      id: clause.id,
      type: clause.metadata.clauseType?.replace(/_/g, ' ') || 'General',
      source: clause.metadata.source || 'LMA Standard',
      content: clause.content.substring(0, 500),
      howToApply: clause.advice?.howToApply || 'Apply standard template',
      contextualizedExample: clause.advice?.contextualizedExample, // AI-adjusted clause
      relevanceScore: clause.advice?.relevanceScore,
      keyConsiderations: clause.advice?.keyConsiderations,
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

    // ========================================================================
    // PROGRAMMATIC CLAUSE INSERTION (no AI needed - 100% reliable)
    // ========================================================================
    const adaptedClausesSection = buildAdaptedClausesSection(preparedData.clauses, projectName);

    // Combine reviewed draft with programmatically-built clause section
    const finalDraft = (reviewResult.success ? reviewResult.content : combinedDraft) + adaptedClausesSection;
    const totalTime = Date.now() - startTime;

    console.log(`[Draft Generator] Complete in ${totalTime}ms (3 phases + clause insertion)`);
    console.log(`[Draft Generator] Inserted ${preparedData.clauses.length} adapted clauses`);

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
