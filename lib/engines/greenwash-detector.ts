// Greenwashing Detector Engine

import type {
  ProjectInput,
  RedFlag,
  GreenwashingAssessment,
  RiskLevel
} from '../types';

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
      // Claims of 99%+ reduction, "guaranteed" returns, "zero" operational costs
      return text.includes('99') || text.includes('100%') ||
        text.includes('guaranteed') || text.includes('no risk') ||
        text.includes('zero cost') || text.includes('500%') ||
        text.includes('unlimited');
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
      return (text.includes('proprietary') || text.includes('secret') || text.includes('confidential')) &&
        !project.thirdPartyVerification;
    },
    description: 'Claims based on proprietary/secret technology without independent verification',
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
    pattern: (project) => !project.thirdPartyVerification,
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
      // Only trigger if there's explicit mention of document having inconsistencies
      // NOT if it mentions inconsistency in general context (e.g., "we address potential inconsistencies")
      const hasIssue = (text.includes('this document') || text.includes('the document') || text.includes('our document')) &&
        (text.includes('inconsistenc') || text.includes('discrepanc') || text.includes('contradicts'));
      const hasMathIssue = text.includes('mathematically impossible') || text.includes('does not add up');
      return hasIssue || hasMathIssue;
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
      return (text.includes('no online presence') || text.includes('no attachment') ||
        text.includes('cannot be verified') || text.includes('unverifiable')) &&
        (text.includes('audit') || text.includes('verification') || text.includes('certified'));
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
      return text.includes('however') && (text.includes('states') || text.includes('claims')) &&
        (text.includes('reduction') || text.includes('emission') || text.includes('tonne'));
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
      // Only trigger if project explicitly involves artisanal mining operations
      // Not if it's mentioned in due diligence context (e.g., "we do not use artisanal mining")
      const hasArtisanal = text.includes('artisanal') && text.includes('mining');
      const isNegated = text.includes('no artisanal') || text.includes('not artisanal') ||
        text.includes('avoid artisanal') || text.includes('exclude artisanal');
      return hasArtisanal && !isNegated;
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
    check: (p) => p.thirdPartyVerification,
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

export function detectGreenwashing(project: ProjectInput): GreenwashingAssessment {
  const redFlags: RedFlag[] = [];
  const positiveIndicators: string[] = [];

  for (const pattern of RED_FLAG_PATTERNS) {
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
