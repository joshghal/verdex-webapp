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
