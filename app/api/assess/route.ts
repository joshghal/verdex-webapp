import { NextRequest, NextResponse } from 'next/server';
import { matchDFIs, recommendBlendedStructure } from '@/lib/engines/dfi-matcher';
import { detectGreenwashing } from '@/lib/engines/greenwash-detector';
import { getCountryProfile } from '@/lib/data/countries';
import type { ProjectInput, AfricanCountry, Sector } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.projectName || !body.country || !body.sector) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build ProjectInput
    const project: ProjectInput = {
      projectName: body.projectName,
      country: body.country as AfricanCountry,
      sector: body.sector as Sector,
      projectType: body.projectType || '',
      description: body.description || '',
      totalCost: body.totalCost || 0,
      debtAmount: body.debtAmount || 0,
      equityAmount: body.equityAmount || 0,
      currentEmissions: body.currentEmissions || { scope1: 0, scope2: 0 },
      targetEmissions: body.targetEmissions || { scope1: 0, scope2: 0 },
      targetYear: body.targetYear || 2030,
      transitionStrategy: body.transitionStrategy || '',
      hasPublishedPlan: body.hasPublishedPlan || false,
      thirdPartyVerification: body.thirdPartyVerification || false,
    };

    // Run assessments
    const dfiMatches = matchDFIs(project);
    const greenwashingRisk = detectGreenwashing(project);
    const blendedStructure = recommendBlendedStructure(project, dfiMatches);
    const countryProfile = getCountryProfile(project.country);

    // Calculate LMA score (simplified)
    const lmaScore = calculateLMAScore(project);

    // Determine eligibility
    let eligibilityStatus: 'eligible' | 'partial' | 'ineligible';
    if (lmaScore.overall >= 70 && greenwashingRisk.overallRisk !== 'high') {
      eligibilityStatus = 'eligible';
    } else if (lmaScore.overall >= 50) {
      eligibilityStatus = 'partial';
    } else {
      eligibilityStatus = 'ineligible';
    }

    // Build response
    const result = {
      projectName: project.projectName,
      country: project.country,
      countryName: countryProfile?.name || project.country,
      sector: project.sector,
      eligibilityStatus,
      overallScore: lmaScore.overall,
      lmaComponents: lmaScore.components,
      greenwashingRisk: {
        level: greenwashingRisk.overallRisk,
        score: greenwashingRisk.riskScore,
        redFlags: greenwashingRisk.redFlags,
        positiveIndicators: greenwashingRisk.positiveIndicators,
        recommendations: greenwashingRisk.recommendations,
      },
      dfiMatches: dfiMatches.map(m => ({
        id: m.dfi.id,
        name: m.dfi.name,
        fullName: m.dfi.fullName,
        matchScore: m.matchScore,
        matchReasons: m.matchReasons,
        concerns: m.concerns,
        recommendedRole: m.recommendedRole,
        estimatedSize: m.estimatedSize,
        climateTarget: m.dfi.climateTarget,
        specialPrograms: m.dfi.specialPrograms,
      })),
      blendedStructure,
      countryInfo: countryProfile ? {
        region: countryProfile.region,
        legalSystem: countryProfile.legalSystem,
        currency: countryProfile.currencyCode,
        sovereignRating: countryProfile.sovereignRating,
        politicalRisk: countryProfile.politicalRiskLevel,
        ndcTarget: countryProfile.ndcTarget,
        renewableTargets: countryProfile.renewableTargets,
      } : null,
      nextSteps: generateNextSteps(eligibilityStatus, greenwashingRisk.overallRisk, dfiMatches.length),
      assessmentDate: new Date().toISOString(),
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Assessment error:', error);
    return NextResponse.json(
      { error: 'Assessment failed' },
      { status: 500 }
    );
  }
}

function calculateLMAScore(project: ProjectInput): {
  overall: number;
  components: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string[];
  }[];
} {
  const components: { name: string; score: number; maxScore: number; feedback: string[] }[] = [];

  // Component 1: Strategy Alignment (20 points)
  let strategyScore = 0;
  const strategyFeedback: string[] = [];

  if (project.hasPublishedPlan) {
    strategyScore += 10;
    strategyFeedback.push('Published transition plan exists');
  } else {
    strategyFeedback.push('Missing: Published transition plan');
  }

  if (project.transitionStrategy.toLowerCase().includes('sbti') ||
      project.transitionStrategy.toLowerCase().includes('science-based')) {
    strategyScore += 5;
    strategyFeedback.push('References science-based targets');
  }

  if (project.transitionStrategy.toLowerCase().includes('paris') ||
      project.transitionStrategy.toLowerCase().includes('1.5')) {
    strategyScore += 5;
    strategyFeedback.push('References Paris Agreement alignment');
  }

  components.push({
    name: 'Strategy Alignment',
    score: strategyScore,
    maxScore: 20,
    feedback: strategyFeedback,
  });

  // Component 2: Use of Proceeds (20 points)
  let proceedsScore = 0;
  const proceedsFeedback: string[] = [];

  if (project.description.length > 100) {
    proceedsScore += 10;
    proceedsFeedback.push('Clear project description provided');
  }

  if (project.projectType) {
    proceedsScore += 5;
    proceedsFeedback.push('Project type specified');
  }

  const cleanTerms = ['renewable', 'solar', 'wind', 'efficiency', 'clean', 'green', 'transition'];
  if (cleanTerms.some(term => project.description.toLowerCase().includes(term))) {
    proceedsScore += 5;
    proceedsFeedback.push('Proceeds support transition activities');
  }

  components.push({
    name: 'Use of Proceeds',
    score: proceedsScore,
    maxScore: 20,
    feedback: proceedsFeedback,
  });

  // Component 3: Target Ambition (20 points)
  let ambitionScore = 0;
  const ambitionFeedback: string[] = [];

  const totalCurrent = project.currentEmissions.scope1 + project.currentEmissions.scope2;
  const totalTarget = project.targetEmissions.scope1 + project.targetEmissions.scope2;

  if (totalCurrent > 0 && totalTarget > 0) {
    const reduction = ((totalCurrent - totalTarget) / totalCurrent) * 100;

    if (reduction >= 42) {
      ambitionScore += 15;
      ambitionFeedback.push(`Strong reduction target: ${reduction.toFixed(1)}% (exceeds 1.5°C pathway)`);
    } else if (reduction >= 25) {
      ambitionScore += 10;
      ambitionFeedback.push(`Moderate reduction target: ${reduction.toFixed(1)}%`);
    } else if (reduction > 0) {
      ambitionScore += 5;
      ambitionFeedback.push(`Weak reduction target: ${reduction.toFixed(1)}% (below science-based)`);
    }
  } else {
    ambitionFeedback.push('Missing: Baseline and target emissions data');
  }

  if (project.targetYear <= 2030) {
    ambitionScore += 5;
    ambitionFeedback.push('Near-term target (by 2030)');
  }

  components.push({
    name: 'Target Ambition',
    score: ambitionScore,
    maxScore: 20,
    feedback: ambitionFeedback,
  });

  // Component 4: Reporting & Verification (20 points)
  let reportingScore = 0;
  const reportingFeedback: string[] = [];

  if (project.thirdPartyVerification) {
    reportingScore += 15;
    reportingFeedback.push('Third-party verification in place');
  } else {
    reportingFeedback.push('Missing: Third-party verification');
  }

  if (project.currentEmissions.scope3 && project.currentEmissions.scope3 > 0) {
    reportingScore += 5;
    reportingFeedback.push('Scope 3 emissions measured');
  }

  components.push({
    name: 'Reporting & Verification',
    score: reportingScore,
    maxScore: 20,
    feedback: reportingFeedback,
  });

  // Component 5: Project Selection (20 points)
  let selectionScore = 0;
  const selectionFeedback: string[] = [];

  if (project.sector === 'energy') {
    selectionScore += 10;
    selectionFeedback.push('Energy sector - high transition relevance');
  } else {
    selectionScore += 5;
    selectionFeedback.push('Sector has transition potential');
  }

  if (project.totalCost > 0 && project.debtAmount > 0) {
    selectionScore += 5;
    selectionFeedback.push('Clear financing structure');
  }

  if (project.equityAmount / project.totalCost >= 0.2) {
    selectionScore += 5;
    selectionFeedback.push('Adequate equity contribution');
  }

  components.push({
    name: 'Project Selection',
    score: selectionScore,
    maxScore: 20,
    feedback: selectionFeedback,
  });

  // Calculate overall score
  const overall = components.reduce((sum, c) => sum + c.score, 0);

  return { overall, components };
}

function generateNextSteps(
  eligibility: string,
  greenwashRisk: string,
  dfiCount: number
): string[] {
  const steps: string[] = [];

  if (eligibility === 'eligible') {
    steps.push('Project is well-positioned for transition loan financing');
    steps.push('Prepare detailed term sheet for DFI submissions');
  } else if (eligibility === 'partial') {
    steps.push('Address identified gaps before DFI submission');
  } else {
    steps.push('Significant improvements needed - consider engaging transition advisor');
  }

  if (greenwashRisk === 'high') {
    steps.push('PRIORITY: Address greenwashing red flags before proceeding');
  }

  if (dfiCount > 0) {
    steps.push(`${dfiCount} DFIs identified - begin preliminary discussions`);
  }

  steps.push('Engage legal counsel to prepare LMA-compliant documentation');
  steps.push('Consider second-party opinion for sustainability credentials');

  return steps;
}
