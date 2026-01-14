// Greenwashing Detector Engine
// Enhanced with EU Taxonomy DNSH (Do No Significant Harm) integration

import type {
  ProjectInput,
  RedFlag,
  GreenwashingAssessment,
  RiskLevel,
  DNSHAssessment
} from '../types';

import {
  evaluateGreenwashingWithAI,
  aiScoreToGreenwashPenalty,
  type AIGreenwashResult,
  type ProjectDataForGreenwash
} from './ai-greenwash-evaluator';

import {
  evaluateDNSH,
  dnshToGreenwashPenalty
} from './dnsh-evaluator';

// Enhanced assessment type with AI fields and DNSH integration
export interface EnhancedGreenwashingAssessment extends GreenwashingAssessment {
  aiEvaluationUsed: boolean;
  aiScore?: number;
  aiRiskLevel?: AIGreenwashResult['riskLevel'];
  aiConfidence?: number;
  aiBreakdown?: AIGreenwashResult['components'];
  aiSummary?: string;
  aiTopConcerns?: string[];
  aiPositiveFindings?: string[];
  combinedPenalty: number;
  // DNSH (Do No Significant Harm) integration - EU Taxonomy Article 17
  dnshAssessment?: DNSHAssessment;
  dnshPenalty?: number;
}

const RED_FLAG_PATTERNS: {
  id: string;
  category: RedFlag['category'];
  severity: RiskLevel;
  pattern: (project: ProjectInput) => boolean;
  description: string;
  recommendation: string;
}[] = [
  // ELIGIBILITY RED FLAGS (immediate disqualification)
  {
    id: 'fossil_sector',
    category: 'technology',
    severity: 'high',
    pattern: (project) => {
      const desc = (project.description + ' ' + project.transitionStrategy + ' ' + project.projectType).toLowerCase();
      const fossilTerms = ['oil drilling', 'oil exploration', 'oil production', 'offshore drilling',
        'petroleum', 'natural gas extraction', 'coal mining', 'coal power', 'coal plant',
        'barrels per day', 'fossil fuel expansion', 'new oil wells', 'gas field'];
      return fossilTerms.some(term => desc.includes(term));
    },
    description: 'Project involves fossil fuel extraction/expansion - NOT ELIGIBLE for transition finance',
    recommendation: 'Fossil fuel expansion projects cannot be financed under transition frameworks'
  },
  {
    id: 'coal_project',
    category: 'technology',
    severity: 'high',
    pattern: (project) => {
      const desc = (project.description + ' ' + project.projectType).toLowerCase();
      return desc.includes('coal') && (desc.includes('power') || desc.includes('plant') || desc.includes('generation') || desc.includes('mining'));
    },
    description: 'Coal projects are explicitly excluded from all transition taxonomies',
    recommendation: 'Coal cannot be financed under any legitimate green/transition framework'
  },
  // GREENWASHING RED FLAGS
  {
    id: 'exaggerated_claims',
    category: 'ambition',
    severity: 'high',
    pattern: (project) => {
      const text = (project.description + ' ' + project.transitionStrategy).toLowerCase();
      // Only flag ACTUAL exaggerated claims, not legitimate uses of numbers
      // "100% renewable" is legitimate; "100% guaranteed returns" is not
      // "99% reduction" might be exaggerated; "ISO 14064-1:2019" is not
      const hasExaggeratedReduction = /\b(99|100)\s*%\s*(reduction|decrease|cut)/.test(text);
      const hasGuaranteed = text.includes('guaranteed return') || text.includes('guaranteed profit') ||
        text.includes('guaranteed success') || text.includes('risk-free');
      const hasZeroCost = text.includes('zero cost') || text.includes('no cost');
      const hasUnrealistic = text.includes('500%') || text.includes('1000%') ||
        text.includes('unlimited return') || text.includes('unlimited profit');
      return hasExaggeratedReduction || hasGuaranteed || hasZeroCost || hasUnrealistic;
    },
    description: 'Exaggerated or unrealistic claims detected - potential greenwashing',
    recommendation: 'Remove exaggerated claims and provide realistic, verifiable projections'
  },
  {
    id: 'proprietary_unverified',
    category: 'verification',
    severity: 'high',
    pattern: (project) => {
      const text = (project.description + ' ' + project.transitionStrategy).toLowerCase();
      const fullText = (project.rawDocumentText || text).toLowerCase();

      // Only flag if "proprietary/secret" is used with unverified CLAIMS
      // Not just technology names like "proprietary EcoMax technology"
      const hasSecretClaim = (text.includes('secret formula') || text.includes('secret method') ||
        text.includes('confidential methodology') || text.includes('proprietary methodology') ||
        text.includes('proprietary calculation') || text.includes('proprietary data'));

      // Check if document has verification commitments (even if boolean flag is false)
      const hasVerificationCommitment = fullText.includes('third-party verification') ||
        fullText.includes('independent auditor') || fullText.includes('dnv') ||
        fullText.includes('kpmg') || fullText.includes('annual verification') ||
        fullText.includes('second party opinion');

      return hasSecretClaim && !project.thirdPartyVerification && !hasVerificationCommitment;
    },
    description: 'Claims based on proprietary/secret methodology without independent verification',
    recommendation: 'Provide third-party verification for all technology and emissions claims'
  },
  {
    id: 'vague_description',
    category: 'commitment',
    severity: 'medium',
    pattern: (project) => {
      // Very short or vague descriptions
      return project.description.length < 50 ||
        project.description.toLowerCase().includes('various') ||
        project.description.toLowerCase().includes('to be determined') ||
        project.description.toLowerCase().includes('tbd');
    },
    description: 'Project description is too vague or incomplete',
    recommendation: 'Provide detailed project description with specific activities and expected outcomes'
  },
  {
    id: 'missing_financials',
    category: 'commitment',
    severity: 'medium',
    pattern: (project) => {
      return project.totalCost === 0 || (project.debtAmount === 0 && project.equityAmount === 0);
    },
    description: 'Missing or incomplete financial information',
    recommendation: 'Provide detailed project costs and financing structure'
  },
  {
    id: 'vague_commitment',
    category: 'commitment',
    severity: 'high',
    pattern: (project) => {
      const strategy = project.transitionStrategy.toLowerCase();
      const vagueTerms = ['aspire', 'intend', 'aim to', 'explore', 'consider', 'may'];
      const hasVague = vagueTerms.some(term => strategy.includes(term));
      const hasTimeline = /\b20\d{2}\b/.test(strategy);
      return hasVague && !hasTimeline;
    },
    description: 'Vague commitments without specific timelines',
    recommendation: 'Add specific, time-bound targets with measurable milestones'
  },
  {
    id: 'no_timeline',
    category: 'commitment',
    severity: 'medium',
    pattern: (project) => project.targetYear === 0 || project.targetYear > 2050,
    description: 'Missing or unreasonably distant target timeline',
    recommendation: 'Set target year aligned with Paris Agreement (2030 interim, 2050 net-zero)'
  },
  {
    id: 'no_published_plan',
    category: 'commitment',
    severity: 'high',
    pattern: (project) => !project.hasPublishedPlan,
    description: 'No published transition plan or strategy',
    recommendation: 'Publish entity-level transition strategy aligned with science-based pathways'
  },
  {
    id: 'missing_scope3',
    category: 'scope',
    severity: 'high',
    pattern: (project) => {
      const materialSectors = ['manufacturing', 'agriculture', 'mining'];
      return materialSectors.includes(project.sector) &&
        (!project.currentEmissions.scope3 || project.currentEmissions.scope3 === 0);
    },
    description: 'Missing Scope 3 emissions for sector where they are likely material',
    recommendation: 'Conduct Scope 3 assessment - likely represents significant portion of footprint'
  },
  {
    id: 'below_bau',
    category: 'ambition',
    severity: 'high',
    pattern: (project) => {
      const totalCurrent = project.currentEmissions.scope1 + project.currentEmissions.scope2;
      const totalTarget = project.targetEmissions.scope1 + project.targetEmissions.scope2;
      const reduction = ((totalCurrent - totalTarget) / totalCurrent) * 100;
      const yearsToTarget = project.targetYear - new Date().getFullYear();
      const annualReduction = reduction / yearsToTarget;
      return annualReduction < 2;
    },
    description: 'Target trajectory appears below business-as-usual',
    recommendation: 'Increase ambition - current targets may be achieved through normal efficiency gains'
  },
  {
    id: 'weak_targets',
    category: 'ambition',
    severity: 'medium',
    pattern: (project) => {
      const totalCurrent = project.currentEmissions.scope1 + project.currentEmissions.scope2;
      const totalTarget = project.targetEmissions.scope1 + project.targetEmissions.scope2;
      const reduction = ((totalCurrent - totalTarget) / totalCurrent) * 100;
      return project.targetYear <= 2030 && reduction < 25;
    },
    description: 'Reduction target insufficient for 2030 milestone',
    recommendation: 'SBTi requires ~42% reduction by 2030 for 1.5°C alignment'
  },
  {
    id: 'no_verification',
    category: 'verification',
    severity: 'medium',
    pattern: (project) => {
      // Check explicit boolean flag
      if (project.thirdPartyVerification) return false;

      // Also check document text for explicit verification statements
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy).toLowerCase();
      const hasExplicitVerification =
        text.includes('third-party verification has been completed') ||
        text.includes('third party verification has been completed') ||
        text.includes('independent verifier confirming') ||
        text.includes('verified by dnv') ||
        text.includes('verified by kpmg') ||
        text.includes('verified by ey') ||
        text.includes('verified by deloitte') ||
        text.includes('spo') && text.includes('completed') ||
        text.includes('second party opinion') && text.includes('obtained');

      // Only flag if no verification AND no explicit statement
      return !hasExplicitVerification;
    },
    description: 'No third-party verification of transition claims',
    recommendation: 'Engage independent verifier (SBTi, second-party opinion, or assurance provider)'
  },
  {
    id: 'fossil_lockin',
    category: 'technology',
    severity: 'high',
    pattern: (project) => {
      const desc = project.description.toLowerCase();
      const lockInTerms = ['new coal', 'coal expansion', 'new diesel', 'expand fossil', 'new oil'];
      return lockInTerms.some(term => desc.includes(term));
    },
    description: 'Project may lock in carbon-intensive infrastructure',
    recommendation: 'Avoid investments in assets with >20 year life that lock in fossil fuels'
  },
  {
    id: 'missing_baseline',
    category: 'baseline',
    severity: 'high',
    pattern: (project) => project.currentEmissions.scope1 === 0 && project.currentEmissions.scope2 === 0,
    description: 'No baseline emissions data provided',
    recommendation: 'Establish robust emissions baseline with third-party verification'
  },
  // DOCUMENT INCONSISTENCY RED FLAGS
  // These patterns check rawDocumentText if available (preserves original document issues)
  // IMPORTANT: Only trigger on ACTUAL issues, not mentions in due diligence context
  {
    id: 'explicit_inconsistency',
    category: 'verification',
    severity: 'high',
    pattern: (project) => {
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy).toLowerCase();
      // Only trigger on ACTUAL statements of inconsistency, not mentions in positive/preventive context
      // e.g., "document has inconsistencies" = bad, "ensure consistency" = good
      const negativePatterns = [
        'document contains inconsistenc',
        'document has inconsistenc',
        'found inconsistenc',
        'identified inconsistenc',
        'noted discrepanc',
        'contains discrepanc',
        'figures contradict',
        'numbers contradict',
        'data contradicts'
      ];
      const hasNegativePattern = negativePatterns.some(p => text.includes(p));
      const hasMathIssue = text.includes('mathematically impossible') || text.includes('does not add up') ||
        text.includes('numbers do not match') || text.includes('figures do not match');
      // Exempt if it's in positive context (ensuring, maintaining, addressing consistency)
      const positiveContext = text.includes('ensure consistenc') || text.includes('maintain consistenc') ||
        text.includes('address any inconsistenc') || text.includes('resolve any inconsistenc') ||
        text.includes('prevent inconsistenc');
      return (hasNegativePattern || hasMathIssue) && !positiveContext;
    },
    description: 'Document contains explicit inconsistencies or contradictions',
    recommendation: 'Resolve all internal inconsistencies before submitting - this is a major red flag for DFIs'
  },
  {
    id: 'unrealistic_payback',
    category: 'commitment',
    severity: 'high',
    pattern: (project) => {
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy).toLowerCase();
      // Look for signs of unrealistic financial projections
      return (text.includes('payback') && text.includes('year')) &&
        (text.includes('impossible') || text.includes('unrealistic'));
    },
    description: 'Financial projections appear unrealistic or impossible',
    recommendation: 'Provide realistic financial model with achievable repayment schedule'
  },
  {
    id: 'ownership_exceeds_100',
    category: 'verification',
    severity: 'high',
    pattern: (project) => {
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy).toLowerCase();
      // Only trigger if ownership/equity explicitly exceeds 100%, not general mentions
      const hasOwnershipIssue = (text.includes('ownership') || text.includes('equity') || text.includes('stake') || text.includes('shareholding')) &&
        (text.includes('115%') || text.includes('120%') || text.includes('totals exceed 100'));
      return hasOwnershipIssue;
    },
    description: 'Ownership structure or allocations exceed 100%',
    recommendation: 'Correct ownership/allocation errors - fundamental data integrity issue'
  },
  {
    id: 'unverifiable_verification',
    category: 'verification',
    severity: 'high',
    pattern: (project) => {
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy).toLowerCase();
      // Only trigger if there's explicit statement that claimed credentials cannot be verified
      // NOT standard legal disclaimers or procedural language
      const unverifiablePatterns = [
        'audit cannot be verified',
        'verification cannot be confirmed',
        'certification cannot be verified',
        'credentials cannot be verified',
        'auditor has no online presence',
        'verifier has no online presence',
        'no record of certification',
        'certification not found',
        'unverifiable audit',
        'unverifiable certification'
      ];
      const hasUnverifiable = unverifiablePatterns.some(p => text.includes(p));
      // Exempt if document mentions pending verification or future verification
      const pendingContext = text.includes('verification will be') || text.includes('verification to be') ||
        text.includes('audit will be') || text.includes('certification pending');
      return hasUnverifiable && !pendingContext;
    },
    description: 'Claimed verification or certification cannot be verified',
    recommendation: 'Provide verifiable third-party credentials from recognized auditors (DNV, KPMG, EY, etc.)'
  },
  {
    id: 'conflicting_numbers',
    category: 'baseline',
    severity: 'high',
    pattern: (project) => {
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy).toLowerCase();
      // Only trigger on explicit conflicting statements, not standard narrative text
      // e.g., "The document states X however claims Y" = conflict
      // e.g., "We will reduce emissions; however, baseline is high" = not a conflict
      const conflictPatterns = [
        'however, the document states',
        'however, it claims',
        'but states a different',
        'contradicts the stated',
        'does not match the stated',
        'inconsistent with stated',
        'differs from the claimed'
      ];
      return conflictPatterns.some(p => text.includes(p));
    },
    description: 'Conflicting emissions or reduction figures within document',
    recommendation: 'Ensure all emissions figures are consistent throughout the document'
  },
  {
    id: 'artisanal_mining_risk',
    category: 'technology',
    severity: 'medium',
    pattern: (project) => {
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy + ' ' + project.projectType).toLowerCase();
      // Only trigger if project EXPLICITLY involves artisanal mining operations
      // Not if it's mentioned in due diligence context (ensuring no artisanal mining)
      const hasArtisanal = text.includes('artisanal') && text.includes('mining');
      if (!hasArtisanal) return false;

      // Extensive list of negation/due diligence contexts that should NOT trigger
      const dueDiligencePatterns = [
        'no artisanal', 'not artisanal', 'avoid artisanal', 'exclude artisanal',
        'prohibit artisanal', 'prevent artisanal', 'free from artisanal',
        'does not involve artisanal', 'does not include artisanal',
        'does not source from artisanal', 'does not use artisanal',
        'ensure no artisanal', 'ensures no artisanal', 'ensuring no artisanal',
        'without artisanal', 'zero artisanal', 'eliminate artisanal',
        'artisanal mining risk', 'artisanal mining due diligence',
        'artisanal mining standards', 'artisanal mining compliance',
        'oecd due diligence', 'responsible mineral', 'conflict-free',
        'traceability', 'supply chain due diligence'
      ];
      const isDueDiligenceContext = dueDiligencePatterns.some(p => text.includes(p));
      return !isDueDiligenceContext;
    },
    description: 'Artisanal mining operations carry elevated ESG and supply chain risks',
    recommendation: 'Demonstrate compliance with OECD Due Diligence Guidance for responsible mineral supply chains'
  },
  {
    id: 'cobalt_drc_risk',
    category: 'technology',
    severity: 'medium',
    pattern: (project) => {
      const text = (project.rawDocumentText || project.description + ' ' + project.transitionStrategy + ' ' + project.projectType).toLowerCase();
      // Only trigger if project EXPLICITLY involves DRC cobalt operations in the text
      // Company names like "Kinshasa Mining" should NOT trigger this if project is in another country
      // Must have explicit mention of sourcing cobalt from DRC/Congo
      const explicitDRCCobalt = text.includes('cobalt') &&
        (text.includes('drc cobalt') || text.includes('congolese cobalt') ||
         text.includes('cobalt from drc') || text.includes('cobalt from congo') ||
         text.includes('cobalt sourced from') && (text.includes('drc') || text.includes('congo')));
      // Check if it's negated (due diligence context)
      const isNegated = text.includes('not from drc') || text.includes('not from congo') ||
        text.includes('no drc') || text.includes('avoid drc');
      return explicitDRCCobalt && !isNegated;
    },
    description: 'DRC cobalt mining has high ESG risk (child labor, conflict minerals)',
    recommendation: 'Demonstrate full supply chain traceability and compliance with responsible mining standards'
  }
];

const POSITIVE_PATTERNS: {
  check: (project: ProjectInput) => boolean;
  indicator: string;
}[] = [
  {
    check: (p) => p.hasPublishedPlan,
    indicator: 'Published transition strategy exists'
  },
  {
    check: (p) => {
      // Check boolean flag
      if (p.thirdPartyVerification) return true;

      // Also check document text for explicit verification statements
      const text = (p.rawDocumentText || p.description + ' ' + p.transitionStrategy).toLowerCase();
      return text.includes('third-party verification has been completed') ||
        text.includes('third party verification has been completed') ||
        text.includes('independent verifier confirming') ||
        text.includes('verified by dnv') ||
        text.includes('verified by kpmg') ||
        text.includes('verified by ey') ||
        text.includes('verified by deloitte') ||
        (text.includes('spo') && text.includes('completed')) ||
        (text.includes('second party opinion') && text.includes('obtained'));
    },
    indicator: 'Third-party verification in place'
  },
  {
    check: (p) => {
      const strategy = p.transitionStrategy.toLowerCase();
      return strategy.includes('sbti') || strategy.includes('science-based');
    },
    indicator: 'Aligned with science-based targets'
  },
  {
    check: (p) => {
      const strategy = p.transitionStrategy.toLowerCase();
      return strategy.includes('paris') || strategy.includes('1.5');
    },
    indicator: 'References Paris Agreement alignment'
  },
  {
    check: (p) => {
      const total = p.currentEmissions.scope1 + p.currentEmissions.scope2;
      const target = p.targetEmissions.scope1 + p.targetEmissions.scope2;
      return ((total - target) / total) * 100 >= 42;
    },
    indicator: 'Ambitious reduction target (>42%)'
  },
  {
    check: (p) => p.currentEmissions.scope3 !== undefined && p.currentEmissions.scope3 > 0,
    indicator: 'Scope 3 emissions measured'
  },
  {
    check: (p) => p.targetYear <= 2030,
    indicator: 'Near-term target year (by 2030)'
  }
];

/**
 * Check if document is a Verdex-generated draft
 * These drafts contain "red flags identified" sections that are DOCUMENTATION
 * of original issues, not current project deficiencies
 */
function isVerdexGeneratedDraft(project: ProjectInput): boolean {
  const text = (project.rawDocumentText || '').toLowerCase();
  const isVerdex = text.includes('generated by verdex') ||
    text.includes('ai-generated draft') ||
    text.includes('verdex - verified green finance') ||
    text.includes('lma transition loan project draft');

  if (isVerdex) {
    console.log('[Greenwash] Detected Verdex-generated draft - applying context-aware rules');
  }
  return isVerdex;
}

/**
 * Check if the document has a risk mitigation section that DOCUMENTS past red flags
 * These should not be counted as current issues
 */
function hasRiskMitigationDocumentation(project: ProjectInput): boolean {
  const text = (project.rawDocumentText || '').toLowerCase();
  return text.includes('the following red flags have been identified') ||
    text.includes('risk mitigation & external review') ||
    text.includes('9.1 risk mitigation') ||
    text.includes('the concrete mitigation strategies');
}

export function detectGreenwashing(project: ProjectInput): GreenwashingAssessment {
  const redFlags: RedFlag[] = [];
  const positiveIndicators: string[] = [];

  // Debug: Check if rawDocumentText is available
  const hasDocText = !!project.rawDocumentText && project.rawDocumentText.length > 0;
  console.log(`[Greenwash] rawDocumentText available: ${hasDocText} (${project.rawDocumentText?.length || 0} chars)`);

  // Detect if this is a Verdex-generated draft with documented red flags
  const isVerdexDraft = isVerdexGeneratedDraft(project);
  const hasRiskDocumentation = hasRiskMitigationDocumentation(project);
  console.log(`[Greenwash] Verdex draft: ${isVerdexDraft}, Has risk docs: ${hasRiskDocumentation}`);

  // Patterns to skip for Verdex drafts (these are documented, not current issues)
  const skipPatternsForDrafts = [
    'no_published_plan',
    'missing_baseline',
    'missing_scope3',
    'missing_financials',
    'no_verification',
    'vague_description'
  ];

  for (const pattern of RED_FLAG_PATTERNS) {
    // Skip certain patterns for Verdex drafts with risk documentation
    if (isVerdexDraft && hasRiskDocumentation && skipPatternsForDrafts.includes(pattern.id)) {
      continue;
    }

    if (pattern.pattern(project)) {
      redFlags.push({
        id: pattern.id,
        category: pattern.category,
        severity: pattern.severity,
        description: pattern.description,
        recommendation: pattern.recommendation
      });
    }
  }

  for (const positive of POSITIVE_PATTERNS) {
    if (positive.check(project)) {
      positiveIndicators.push(positive.indicator);
    }
  }

  // For Verdex drafts, add positive indicators based on documented compliance
  if (isVerdexDraft) {
    const text = (project.rawDocumentText || '').toLowerCase();
    if (text.includes('lma compliance statements')) {
      if (!positiveIndicators.includes('Published transition strategy exists')) {
        positiveIndicators.push('Published transition strategy exists');
      }
    }
    if (text.includes('annual verification') || text.includes('third-party verification')) {
      if (!positiveIndicators.includes('Third-party verification in place')) {
        positiveIndicators.push('Third-party verification commitment');
      }
    }
    if (text.includes('sbti') || text.includes('science based targets')) {
      if (!positiveIndicators.includes('Aligned with science-based targets')) {
        positiveIndicators.push('Aligned with science-based targets');
      }
    }
    if (text.includes('paris agreement') || text.includes('1.5°c')) {
      if (!positiveIndicators.includes('References Paris Agreement alignment')) {
        positiveIndicators.push('References Paris Agreement alignment');
      }
    }
  }

  const riskScore = calculateRiskScore(redFlags, positiveIndicators);

  let overallRisk: RiskLevel;
  if (riskScore >= 70) {
    overallRisk = 'high';
  } else if (riskScore >= 40) {
    overallRisk = 'medium';
  } else {
    overallRisk = 'low';
  }

  const recommendations = generateRecommendations(redFlags, overallRisk);

  return {
    overallRisk,
    riskScore,
    redFlags,
    positiveIndicators,
    recommendations
  };
}

function calculateRiskScore(redFlags: RedFlag[], positiveIndicators: string[]): number {
  let score = 0;

  for (const flag of redFlags) {
    switch (flag.severity) {
      case 'high':
        score += 25;
        break;
      case 'medium':
        score += 15;
        break;
      case 'low':
        score += 5;
        break;
    }
  }

  score -= positiveIndicators.length * 10;
  return Math.max(0, Math.min(100, score));
}

function generateRecommendations(redFlags: RedFlag[], overallRisk: RiskLevel): string[] {
  const recommendations: string[] = [];

  const highSeverity = redFlags.filter(f => f.severity === 'high');
  highSeverity.forEach(flag => {
    recommendations.push(`[CRITICAL] ${flag.recommendation}`);
  });

  const mediumSeverity = redFlags.filter(f => f.severity === 'medium');
  mediumSeverity.slice(0, 3).forEach(flag => {
    recommendations.push(flag.recommendation);
  });

  if (overallRisk === 'high') {
    recommendations.push('Consider engaging transition finance advisor before proceeding');
    recommendations.push('Significant improvements needed before DFI submission');
  } else if (overallRisk === 'medium') {
    recommendations.push('Address key concerns to strengthen transition credentials');
  }

  return recommendations;
}

/**
 * Enhanced greenwashing detection with AI and DNSH integration
 * Combines rule-based detection, AI analysis, and EU Taxonomy DNSH screening
 *
 * Environment variable: GREENWASH_DETECTION_MODE
 * Options:
 *   - 'rule'      : Rule-based pattern matching only (default, fast, no API calls)
 *   - 'ai'        : AI-powered evaluation only (requires ASI1_API_KEY_GREENWASH)
 *   - 'hybrid'    : Both AI + rule-based combined (60% AI / 40% rules)
 *
 * DNSH evaluation runs in parallel when document text is available.
 * Combined penalty: 50% AI/rule-based + 30% rules + 20% DNSH
 */
export async function detectGreenwashingEnhanced(
  project: ProjectInput,
  documentText?: string
): Promise<EnhancedGreenwashingAssessment> {
  // First, run rule-based detection
  const ruleBasedResult = detectGreenwashing(project);

  // Check detection mode from environment (default: rule-based for speed)
  const mode = (process.env.GREENWASH_DETECTION_MODE || 'rule').toLowerCase();

  // If no document text, return rule-based only (no DNSH either)
  if (!documentText || documentText.length < 100) {
    console.log('[Greenwash Detector] No document text provided, using rule-based only');
    return {
      ...ruleBasedResult,
      aiEvaluationUsed: false,
      combinedPenalty: calculatePenaltyFromRiskScore(ruleBasedResult.riskScore)
    };
  }

  // Run DNSH evaluation in parallel with AI evaluation (if enabled)
  // DNSH always runs when document text is available
  let dnshResult: DNSHAssessment | undefined;
  let dnshPenalty = 0;

  try {
    console.log('[Greenwash Detector] Running DNSH (EU Taxonomy Article 17) evaluation...');
    dnshResult = await evaluateDNSH(project, documentText);
    dnshPenalty = dnshToGreenwashPenalty(dnshResult.normalizedScore);
    console.log(`[Greenwash Detector] DNSH: ${dnshResult.overallStatus}, Score: ${dnshResult.normalizedScore}/100, Penalty: ${dnshPenalty}`);
  } catch (error) {
    console.error('[Greenwash Detector] DNSH evaluation failed:', error);
    // Continue without DNSH - it's an enhancement, not a requirement
  }

  if (mode === 'rule') {
    console.log('[Greenwash Detector] Mode: rule-based (DNSH evaluated separately)');
    const ruleBasedPenalty = calculatePenaltyFromRiskScore(ruleBasedResult.riskScore);
    // DNSH is a SEPARATE score, not part of greenwashing penalty
    // LMA score and DNSH score are displayed independently
    const combinedPenalty = ruleBasedPenalty;

    return {
      ...ruleBasedResult,
      aiEvaluationUsed: false,
      combinedPenalty,
      // DNSH is still returned for separate display, but doesn't affect LMA score
      dnshAssessment: dnshResult,
      dnshPenalty: dnshResult ? dnshPenalty : undefined
    };
  }

  // Prepare project data for AI evaluation
  const projectData: ProjectDataForGreenwash = {
    projectName: project.projectName || 'Unknown Project',
    sector: project.sector || 'unknown',
    description: project.description || '',
    transitionStrategy: project.transitionStrategy || '',
    targetYear: project.targetYear || 2030,
    currentEmissions: project.currentEmissions || { scope1: 0, scope2: 0 },
    targetEmissions: project.targetEmissions || { scope1: 0, scope2: 0 },
    totalCost: project.totalCost || 0,
    hasPublishedPlan: project.hasPublishedPlan || false,
    thirdPartyVerification: project.thirdPartyVerification || false
  };

  // Run AI evaluation
  console.log('[Greenwash Detector] Running AI-enhanced evaluation...');
  const aiResult = await evaluateGreenwashingWithAI(documentText, projectData);

  if (!aiResult.success) {
    console.log('[Greenwash Detector] AI evaluation failed, using rule-based only');
    return {
      ...ruleBasedResult,
      aiEvaluationUsed: false,
      combinedPenalty: calculatePenaltyFromRiskScore(ruleBasedResult.riskScore)
    };
  }

  // Calculate penalties based on mode
  const aiPenalty = aiScoreToGreenwashPenalty(aiResult.totalScore);
  const ruleBasedPenalty = calculatePenaltyFromRiskScore(ruleBasedResult.riskScore);

  // Determine final penalty based on mode (DNSH is separate, not part of greenwashing penalty)
  let combinedPenalty: number;
  if (mode === 'ai') {
    // AI-only mode: just AI penalty (DNSH displayed separately)
    combinedPenalty = aiPenalty;
    console.log(`[Greenwash Detector] Mode: AI (DNSH separate), Penalty: ${combinedPenalty}`);
  } else {
    // Hybrid mode: 60% AI + 40% rule-based (DNSH displayed separately)
    combinedPenalty = Math.round(aiPenalty * 0.6 + ruleBasedPenalty * 0.4);
    console.log(`[Greenwash Detector] Mode: hybrid (DNSH separate), AI: ${aiResult.totalScore}/100, Rule-based: ${ruleBasedResult.riskScore}, DNSH: ${dnshResult?.normalizedScore || 'N/A'}, Combined penalty: ${combinedPenalty}`);
  }

  // Determine combined risk level
  let combinedRiskLevel: RiskLevel;
  if (combinedPenalty >= 15) {
    combinedRiskLevel = 'high';
  } else if (combinedPenalty >= 6) {
    combinedRiskLevel = 'medium';
  } else {
    combinedRiskLevel = 'low';
  }

  // Merge AI concerns into recommendations if not already present
  const enhancedRecommendations = mode === 'ai' ? [] : [...ruleBasedResult.recommendations];
  aiResult.topConcerns.forEach(concern => {
    if (!enhancedRecommendations.some(r => r.toLowerCase().includes(concern.toLowerCase().substring(0, 20)))) {
      enhancedRecommendations.push(`[AI] ${concern}`);
    }
  });

  // Merge AI positive findings into positive indicators
  const enhancedPositiveIndicators = mode === 'ai' ? [] : [...ruleBasedResult.positiveIndicators];
  aiResult.positiveFindings.forEach(finding => {
    if (!enhancedPositiveIndicators.some(p => p.toLowerCase().includes(finding.toLowerCase().substring(0, 20)))) {
      enhancedPositiveIndicators.push(finding);
    }
  });

  return {
    overallRisk: combinedRiskLevel,
    riskScore: ruleBasedResult.riskScore,
    redFlags: ruleBasedResult.redFlags,
    positiveIndicators: enhancedPositiveIndicators,
    recommendations: enhancedRecommendations.slice(0, 8),
    aiEvaluationUsed: true,
    aiScore: aiResult.totalScore,
    aiRiskLevel: aiResult.riskLevel,
    aiConfidence: aiResult.confidence,
    aiBreakdown: aiResult.components,
    aiSummary: aiResult.summary,
    aiTopConcerns: aiResult.topConcerns,
    aiPositiveFindings: aiResult.positiveFindings,
    combinedPenalty,
    // DNSH (EU Taxonomy Article 17) integration
    dnshAssessment: dnshResult,
    dnshPenalty: dnshResult ? dnshPenalty : undefined
  };
}

/**
 * Convert rule-based risk score (0-100, higher=more risk) to penalty
 */
function calculatePenaltyFromRiskScore(riskScore: number): number {
  if (riskScore >= 70) return 20; // High risk
  if (riskScore >= 40) return 10; // Medium risk
  if (riskScore >= 20) return 5;  // Low-medium risk
  return 0; // Low risk
}
