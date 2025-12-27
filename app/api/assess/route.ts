import { NextRequest, NextResponse } from 'next/server';
import { matchDFIs, recommendBlendedStructure } from '@/lib/engines/dfi-matcher';
import { detectGreenwashing } from '@/lib/engines/greenwash-detector';
import { generateKPIRecommendationsAI } from '@/lib/engines/kpi-generator';
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
      // NEW: Total emissions fields (preferred when available)
      totalBaselineEmissions: body.totalBaselineEmissions || undefined,
      totalTargetEmissions: body.totalTargetEmissions || undefined,
      statedReductionPercent: body.statedReductionPercent || undefined,
      transitionStrategy: body.transitionStrategy || '',
      hasPublishedPlan: body.hasPublishedPlan || false,
      thirdPartyVerification: body.thirdPartyVerification || false,
      rawDocumentText: body.rawDocumentText || '', // For greenwashing detection
    };

    // Check for non-African country (immediate ineligibility)
    const africanCountries = ['kenya', 'nigeria', 'south_africa', 'tanzania', 'ghana', 'egypt', 'morocco', 'ethiopia', 'senegal', 'drc', 'uganda', 'rwanda'];
    const isAfricanCountry = africanCountries.includes(project.country.toLowerCase());

    // Check for excluded sectors (fossil fuels)
    const description = (project.description + ' ' + project.transitionStrategy + ' ' + (project.projectType || '')).toLowerCase();
    const isFossilFuel = description.includes('oil drilling') || description.includes('oil exploration') ||
      description.includes('oil production') || description.includes('offshore drilling') ||
      description.includes('petroleum') || description.includes('coal power') ||
      description.includes('coal plant') || description.includes('coal mining') ||
      description.includes('barrels per day') || description.includes('fossil fuel expansion');

    // Run assessments
    const dfiMatches = matchDFIs(project);
    const greenwashingRisk = detectGreenwashing(project);
    const blendedStructure = recommendBlendedStructure(project, dfiMatches);
    const countryProfile = getCountryProfile(project.country);

    // Calculate LMA score (simplified)
    const lmaScore = calculateLMAScore(project);

    // Generate KPI and SPT recommendations using AI (with fallback)
    const kpiRecommendations = await generateKPIRecommendationsAI(project);

    // Apply greenwashing penalty to overall score
    // Greenwashing risk should REDUCE the score, not be a separate metric
    let adjustedScore = lmaScore.overall;
    let greenwashingPenalty = 0;

    if (greenwashingRisk.overallRisk === 'high') {
      // High risk: heavy penalty (30-50 points based on risk score)
      greenwashingPenalty = Math.round(30 + (greenwashingRisk.riskScore / 100) * 20);
    } else if (greenwashingRisk.overallRisk === 'medium') {
      // Medium risk: moderate penalty (10-25 points)
      greenwashingPenalty = Math.round(10 + (greenwashingRisk.riskScore / 100) * 15);
    }
    // Low risk: no penalty

    adjustedScore = Math.max(0, Math.min(100, lmaScore.overall - greenwashingPenalty));

    // Determine eligibility with stricter rules
    let eligibilityStatus: 'eligible' | 'partial' | 'ineligible';
    let ineligibilityReasons: string[] = [];

    // Immediate disqualification conditions
    if (!isAfricanCountry) {
      eligibilityStatus = 'ineligible';
      adjustedScore = 0;
      ineligibilityReasons.push('Project location is not in Africa - TransitionPath Africa only supports African projects');
    } else if (isFossilFuel) {
      eligibilityStatus = 'ineligible';
      adjustedScore = 0;
      ineligibilityReasons.push('Fossil fuel projects are excluded from transition finance');
    } else if (greenwashingRisk.overallRisk === 'high' && greenwashingRisk.riskScore >= 80) {
      eligibilityStatus = 'ineligible';
      ineligibilityReasons.push('High greenwashing risk - significant red flags detected');
    } else if (adjustedScore >= 60 && greenwashingRisk.overallRisk !== 'high') {
      eligibilityStatus = 'eligible';
    } else if (adjustedScore >= 30) {
      eligibilityStatus = 'partial';
    } else {
      eligibilityStatus = 'ineligible';
      ineligibilityReasons.push('Project does not meet minimum transition finance requirements');
    }

    // Build response
    const result = {
      projectName: project.projectName,
      country: project.country,
      countryName: countryProfile?.name || project.country,
      sector: project.sector,
      targetYear: project.targetYear,
      // Include original project data for draft generation
      description: project.description,
      projectType: project.projectType,
      totalCost: project.totalCost,
      debtAmount: project.debtAmount,
      equityAmount: project.equityAmount,
      currentEmissions: project.currentEmissions,
      targetEmissions: project.targetEmissions,
      // NEW: Total emissions fields for accurate draft generation
      totalBaselineEmissions: project.totalBaselineEmissions,
      totalTargetEmissions: project.totalTargetEmissions,
      statedReductionPercent: project.statedReductionPercent,
      transitionStrategy: project.transitionStrategy,
      hasPublishedPlan: project.hasPublishedPlan,
      thirdPartyVerification: project.thirdPartyVerification,
      eligibilityStatus,
      ineligibilityReasons,
      overallScore: adjustedScore, // Now reflects greenwashing penalty
      lmaBaseScore: lmaScore.overall, // Raw LMA score before penalty
      greenwashingPenalty, // Points deducted for greenwashing risk
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
      kpiRecommendations: kpiRecommendations.kpis,
      sptRecommendations: kpiRecommendations.spts,
      frameworksReferenced: kpiRecommendations.frameworksReferenced,
      kpiAiGenerated: kpiRecommendations.aiGenerated,
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

interface LMAFeedbackItem {
  status: 'met' | 'partial' | 'missing';
  description: string;
  action?: string; // What to do if not met
}

function calculateLMAScore(project: ProjectInput): {
  overall: number;
  components: {
    name: string;
    score: number;
    maxScore: number;
    feedback: LMAFeedbackItem[];
  }[];
} {
  const components: { name: string; score: number; maxScore: number; feedback: LMAFeedbackItem[] }[] = [];

  // Component 1: Strategy Alignment (20 points)
  let strategyScore = 0;
  const strategyFeedback: LMAFeedbackItem[] = [];

  if (project.hasPublishedPlan) {
    strategyScore += 10;
    strategyFeedback.push({ status: 'met', description: 'Published transition plan exists' });
  } else {
    strategyFeedback.push({
      status: 'missing',
      description: 'No published transition plan',
      action: 'Publish a board-approved transition strategy document outlining decarbonization pathway, interim targets, and implementation timeline'
    });
  }

  // Check transitionStrategy, description, AND rawDocumentText for SBTi keywords
  // rawDocumentText is a fallback for AI-generated drafts where keywords might not be in structured fields
  const fullText = (project.transitionStrategy + ' ' + project.description + ' ' + (project.rawDocumentText || '')).toLowerCase();

  if (fullText.includes('sbti') || fullText.includes('science-based') || fullText.includes('science based targets')) {
    strategyScore += 5;
    strategyFeedback.push({ status: 'met', description: 'References science-based targets (SBTi)' });
  } else {
    strategyFeedback.push({
      status: 'missing',
      description: 'No SBTi alignment mentioned',
      action: 'Commit to Science Based Targets initiative (SBTi) and submit targets for validation at sciencebasedtargets.org'
    });
  }

  if (fullText.includes('paris') || fullText.includes('1.5') || fullText.includes('1.5°c') || fullText.includes('ndc')) {
    strategyScore += 5;
    strategyFeedback.push({ status: 'met', description: 'Paris Agreement 1.5°C alignment referenced' });
  } else {
    strategyFeedback.push({
      status: 'missing',
      description: 'No Paris Agreement alignment',
      action: 'Demonstrate how project contributes to national NDC targets and Paris Agreement goals'
    });
  }

  components.push({ name: 'Strategy Alignment', score: strategyScore, maxScore: 20, feedback: strategyFeedback });

  // Component 2: Use of Proceeds (20 points)
  let proceedsScore = 0;
  const proceedsFeedback: LMAFeedbackItem[] = [];

  if (project.description.length > 100) {
    proceedsScore += 10;
    proceedsFeedback.push({ status: 'met', description: 'Clear project description provided' });
  } else {
    proceedsFeedback.push({
      status: 'missing',
      description: 'Project description too brief',
      action: 'Provide detailed description of project activities, technologies, and expected environmental outcomes (min. 200 words)'
    });
  }

  if (project.projectType) {
    proceedsScore += 5;
    proceedsFeedback.push({ status: 'met', description: 'Project type specified' });
  } else {
    proceedsFeedback.push({
      status: 'missing',
      description: 'Project type not specified',
      action: 'Categorize project type (e.g., renewable energy, energy efficiency, clean transport, sustainable agriculture)'
    });
  }

  const cleanTerms = ['renewable', 'solar', 'wind', 'efficiency', 'clean', 'green', 'transition', 'decarbonization'];
  if (cleanTerms.some(term => project.description.toLowerCase().includes(term))) {
    proceedsScore += 5;
    proceedsFeedback.push({ status: 'met', description: 'Proceeds clearly support transition activities' });
  } else {
    proceedsFeedback.push({
      status: 'missing',
      description: 'Transition use of proceeds unclear',
      action: 'Clearly articulate how funds will be used for climate transition (renewable energy, efficiency improvements, clean technology)'
    });
  }

  components.push({ name: 'Use of Proceeds', score: proceedsScore, maxScore: 20, feedback: proceedsFeedback });

  // Component 3: Target Ambition (20 points)
  let ambitionScore = 0;
  const ambitionFeedback: LMAFeedbackItem[] = [];

  // PRIORITY: Use total emissions if available (captures all sources incl. Water Treatment, Solar, etc.)
  // Otherwise fall back to Scope 1+2 sum
  let totalCurrent: number;
  let totalTarget: number;
  let emissionsSource: string;

  if (project.totalBaselineEmissions && project.totalBaselineEmissions > 0 &&
      project.totalTargetEmissions && project.totalTargetEmissions > 0) {
    // Use document's stated total emissions (most accurate)
    totalCurrent = project.totalBaselineEmissions;
    totalTarget = project.totalTargetEmissions;
    emissionsSource = 'document totals';
  } else {
    // Fall back to Scope 1+2 calculation
    totalCurrent = project.currentEmissions.scope1 + project.currentEmissions.scope2;
    totalTarget = project.targetEmissions.scope1 + project.targetEmissions.scope2;
    emissionsSource = 'Scope 1+2';
  }

  // Also check if document stated a reduction percentage directly
  let reduction: number | null = null;

  if (project.statedReductionPercent && project.statedReductionPercent > 0) {
    // Use document's stated reduction (most authoritative)
    reduction = project.statedReductionPercent;
  } else if (totalCurrent > 0 && totalTarget > 0) {
    // Calculate from totals
    reduction = ((totalCurrent - totalTarget) / totalCurrent) * 100;
  }

  if (reduction !== null && reduction > 0) {
    if (reduction >= 42) {
      ambitionScore += 15;
      ambitionFeedback.push({ status: 'met', description: `Strong reduction target: ${reduction.toFixed(1)}% (exceeds 1.5°C pathway requirement of 42%)` });
    } else if (reduction >= 25) {
      ambitionScore += 10;
      ambitionFeedback.push({
        status: 'partial',
        description: `Moderate reduction target: ${reduction.toFixed(1)}%`,
        action: `Increase ambition to ≥42% reduction by 2030 to align with SBTi 1.5°C pathway (current gap: ${(42 - reduction).toFixed(1)}%)`
      });
    } else if (reduction > 0) {
      ambitionScore += 5;
      ambitionFeedback.push({
        status: 'partial',
        description: `Weak reduction target: ${reduction.toFixed(1)}%`,
        action: `Target is below science-based threshold. Increase to ≥42% by 2030. Consider additional measures: efficiency upgrades, renewable energy, process changes`
      });
    }
  } else {
    ambitionFeedback.push({
      status: 'missing',
      description: 'No baseline or target emissions data',
      action: 'Conduct GHG inventory (Scope 1 & 2) following GHG Protocol. Set reduction targets aligned with 1.5°C pathway (min. 42% by 2030)'
    });
  }

  if (project.targetYear <= 2030) {
    ambitionScore += 5;
    ambitionFeedback.push({ status: 'met', description: `Near-term target year: ${project.targetYear}` });
  } else if (project.targetYear > 2030 && project.targetYear <= 2050) {
    ambitionFeedback.push({
      status: 'partial',
      description: `Long-term target year: ${project.targetYear}`,
      action: 'Add interim 2030 target alongside long-term goal. DFIs require near-term milestones to track progress'
    });
  } else {
    ambitionFeedback.push({
      status: 'missing',
      description: 'No target year specified',
      action: 'Set target year for emissions reduction (2030 for interim, 2050 for net-zero)'
    });
  }

  components.push({ name: 'Target Ambition', score: ambitionScore, maxScore: 20, feedback: ambitionFeedback });

  // Component 4: Reporting & Verification (20 points)
  let reportingScore = 0;
  const reportingFeedback: LMAFeedbackItem[] = [];

  if (project.thirdPartyVerification) {
    reportingScore += 15;
    reportingFeedback.push({ status: 'met', description: 'Third-party verification in place' });
  } else {
    reportingFeedback.push({
      status: 'missing',
      description: 'No third-party verification',
      action: 'Engage independent verifier (e.g., DNV, KPMG, EY) to verify emissions data and transition claims. Consider obtaining Second Party Opinion for green/transition credentials'
    });
  }

  if (project.currentEmissions.scope3 && project.currentEmissions.scope3 > 0) {
    reportingScore += 5;
    reportingFeedback.push({ status: 'met', description: 'Scope 3 emissions measured and reported' });
  } else {
    const scope3Material = ['manufacturing', 'agriculture', 'mining'].includes(project.sector);
    reportingFeedback.push({
      status: scope3Material ? 'missing' : 'partial',
      description: 'Scope 3 emissions not reported',
      action: scope3Material
        ? 'Scope 3 likely material for your sector. Conduct value chain emissions assessment following GHG Protocol Scope 3 Standard'
        : 'Consider Scope 3 screening to identify material categories (supply chain, product use, etc.)'
    });
  }

  components.push({ name: 'Reporting & Verification', score: reportingScore, maxScore: 20, feedback: reportingFeedback });

  // Component 5: Project Selection (20 points)
  let selectionScore = 0;
  const selectionFeedback: LMAFeedbackItem[] = [];

  // Recognize high-priority transition sectors
  const highPrioritySectors = ['energy', 'agriculture', 'transport', 'manufacturing'];
  const sectorLower = project.sector.toLowerCase();

  if (sectorLower === 'energy') {
    selectionScore += 10;
    selectionFeedback.push({ status: 'met', description: 'Energy sector - high transition relevance and DFI priority' });
  } else if (sectorLower === 'agriculture') {
    selectionScore += 10;
    selectionFeedback.push({ status: 'met', description: 'Agriculture sector - key for climate adaptation and sustainable food systems' });
  } else if (highPrioritySectors.includes(sectorLower)) {
    selectionScore += 8;
    selectionFeedback.push({ status: 'met', description: `${project.sector} sector - recognized transition priority` });
  } else {
    selectionScore += 5;
    selectionFeedback.push({
      status: 'partial',
      description: `${project.sector} sector has transition potential`,
      action: 'Highlight sector-specific decarbonization pathway and alignment with regional transition priorities'
    });
  }

  if (project.totalCost > 0 && project.debtAmount > 0) {
    selectionScore += 5;
    selectionFeedback.push({ status: 'met', description: 'Financing structure clearly defined' });
  } else {
    selectionFeedback.push({
      status: 'missing',
      description: 'Financing structure incomplete',
      action: 'Provide detailed project costs, debt/equity split, and proposed financing structure'
    });
  }

  const equityRatio = project.totalCost > 0 ? project.equityAmount / project.totalCost : 0;
  if (equityRatio >= 0.2) {
    selectionScore += 5;
    selectionFeedback.push({ status: 'met', description: `Adequate equity contribution: ${(equityRatio * 100).toFixed(0)}%` });
  } else if (equityRatio > 0) {
    selectionFeedback.push({
      status: 'partial',
      description: `Low equity contribution: ${(equityRatio * 100).toFixed(0)}%`,
      action: 'Increase equity to ≥20% of project cost. DFIs typically require meaningful sponsor commitment'
    });
  } else {
    selectionFeedback.push({
      status: 'missing',
      description: 'No equity contribution specified',
      action: 'Specify equity contribution (typically 20-30% of project cost required by DFIs)'
    });
  }

  components.push({ name: 'Project Selection', score: selectionScore, maxScore: 20, feedback: selectionFeedback });

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
