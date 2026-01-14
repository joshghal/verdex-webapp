// DNSH (Do No Significant Harm) Evaluator
// Integrated into greenwash detection as "Environmental Harm Screening"
//
// REGULATORY SOURCES:
// - EU Taxonomy Regulation 2020/852, Article 17 (DNSH criteria)
//   https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R0852
// - EU Taxonomy Climate Delegated Act 2021/2139 (technical screening criteria)
//   https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32021R2139
// - EU Platform on Sustainable Finance DNSH Technical Guidance (2022)
//   https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en
//
// AFRICA CONTEXT SOURCES:
// - African Development Bank Climate Safeguards (2022)
//   https://www.afdb.org/en/topics-and-sectors/topics/climate-change
// - IPCC AR6 Africa Chapter for regional climate vulnerabilities
//   https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-9/

import { callAI } from '../ai/api-handler';
import type {
  ProjectInput,
  Sector,
  DNSHObjective,
  DNSHCriterionResult,
  DNSHAssessment,
  DNSHStatus
} from '../types';

// Sector-specific DNSH weight adjustments
// Based on EU Taxonomy technical screening criteria for each sector
const SECTOR_DNSH_WEIGHTS: Record<Sector, Partial<Record<DNSHObjective, number>>> = {
  energy: {
    climate_mitigation: 1.5,  // Primary objective for energy
    pollution_prevention: 1.2
  },
  mining: {
    water_resources: 1.5,  // Mining is water-intensive
    biodiversity: 1.5,     // Land disturbance
    pollution_prevention: 1.3
  },
  agriculture: {
    water_resources: 1.3,
    biodiversity: 1.5,     // Land use change
    circular_economy: 1.2  // Waste management
  },
  transport: {
    climate_mitigation: 1.3,
    pollution_prevention: 1.2  // Air quality
  },
  manufacturing: {
    pollution_prevention: 1.3,
    circular_economy: 1.3,
    water_resources: 1.2
  }
};

// System prompt grounded in actual EU Taxonomy Article 17
// Updated to distinguish between FIXABLE gaps and FUNDAMENTAL incompatibility
const DNSH_SYSTEM_PROMPT = `You are an expert in EU Taxonomy DNSH (Do No Significant Harm) assessment.

## Legal Basis: EU Taxonomy Regulation 2020/852, Article 17

An economic activity shall be considered to cause SIGNIFICANT HARM to:

1. **CLIMATE CHANGE MITIGATION** (Article 17.1.a)
   - If the activity leads to significant greenhouse gas emissions
   - Consider: GHG intensity, fossil fuel dependency, emissions trajectory

2. **CLIMATE CHANGE ADAPTATION** (Article 17.1.b)
   - If the activity leads to increased adverse impact of current/expected climate
   - Consider: Physical climate risks, adaptation measures, vulnerability

3. **SUSTAINABLE USE OF WATER AND MARINE RESOURCES** (Article 17.1.c)
   - If the activity is detrimental to good status of water bodies
   - Consider: Water consumption, discharge quality, water stress context

4. **TRANSITION TO CIRCULAR ECONOMY** (Article 17.1.d)
   - If the activity leads to significant inefficiencies in materials use
   - Consider: Waste generation, recyclability, durability, end-of-life

5. **POLLUTION PREVENTION AND CONTROL** (Article 17.1.e)
   - If the activity leads to significant increase in emissions to air, water, land
   - Consider: Pollutant releases, hazardous substances, best available techniques

6. **PROTECTION OF BIODIVERSITY AND ECOSYSTEMS** (Article 17.1.f)
   - If the activity is significantly harmful to good condition of ecosystems
   - Consider: Protected areas, habitat loss, species impact, deforestation

## CRITICAL: Distinguish FIXABLE vs FUNDAMENTAL Issues

### FUNDAMENTALLY INCOMPATIBLE (no workaround possible):
- Fossil fuel extraction/expansion (oil, gas, coal)
- Deforestation or primary forest clearing
- Projects that INCREASE net emissions substantially
- Activities in protected areas without legal exception
- Coal power generation or coal mining

For these: Do NOT give improvement recommendations. State clearly that the project type is incompatible with EU Taxonomy.

### FIXABLE GAPS (recommendations appropriate):
- Missing environmental assessments (can be added)
- Inadequate water management (can be improved)
- Lack of adaptation planning (can be developed)
- Insufficient pollution controls (can be installed)
- Biodiversity impact not assessed (can be studied)

For these: Provide actionable recommendations.

## African Context Considerations
- Many African countries have limited environmental monitoring infrastructure
- Climate adaptation is particularly critical given regional vulnerabilities
- Biodiversity hotspots: Congo Basin, Great Rift Valley, Cape Floristic Region
- Water stress: Sahel, North Africa, Horn of Africa

## Scoring Guide
For each criterion, score 0-4:
- 4 = No harm (clear evidence of safeguards or non-applicability)
- 3 = Minimal risk (minor concerns with adequate mitigation)
- 2 = Potential harm (moderate concerns, some mitigation)
- 1 = Likely harm (significant concerns, inadequate mitigation)
- 0 = Significant harm (clear evidence of harm, no mitigation)

Return JSON format:
{
  "criteria": [
    {
      "objective": "climate_mitigation|climate_adaptation|water_resources|circular_economy|pollution_prevention|biodiversity",
      "objectiveName": "Full name of objective",
      "status": "no_harm|potential_harm|significant_harm|not_assessed",
      "score": 0-4,
      "evidence": "Max 40 words of evidence from document",
      "concern": "If harm detected, describe in max 25 words",
      "isFundamentallyIncompatible": true/false,
      "recommendation": "If fixable: actionable recommendation. If fundamentally incompatible: null"
    }
  ],
  "isFundamentallyIncompatible": true/false,
  "incompatibilityReason": "If fundamentally incompatible, explain why in one sentence. Otherwise null.",
  "summary": "One sentence overall assessment",
  "keyRisks": ["Top 2-3 environmental risks identified"],
  "recommendations": ["ONLY for fixable issues. Empty array if fundamentally incompatible."]
}`;

/**
 * Evaluate project against EU Taxonomy DNSH criteria
 * Uses AI for deep document analysis with rule-based fallback
 */
export async function evaluateDNSH(
  project: ProjectInput,
  documentText: string
): Promise<DNSHAssessment> {
  const userPrompt = buildDNSHPrompt(project, documentText);

  try {
    const result = await callAI({
      systemPrompt: DNSH_SYSTEM_PROMPT,
      userPrompt,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 2000
    });

    if (result.success && result.parsed?.criteria) {
      return processAIResult(result.parsed, project.sector);
    }

    console.log('[DNSH Evaluator] AI evaluation failed, using rule-based fallback');
    return getRuleBasedDNSH(project, documentText);

  } catch (error) {
    console.error('[DNSH Evaluator] Error:', error);
    return getRuleBasedDNSH(project, documentText);
  }
}

function buildDNSHPrompt(project: ProjectInput, documentText: string): string {
  return `Assess DNSH compliance for this African ${project.sector} project.

## Project Details
- **Name**: ${project.projectName}
- **Country**: ${project.country}
- **Sector**: ${project.sector}
- **Type**: ${project.projectType || 'Not specified'}
- **Description**: ${project.description}

## Transition Strategy
${project.transitionStrategy || 'Not provided'}

## Emissions Data
- Baseline: ${project.totalBaselineEmissions || project.currentEmissions.scope1 + project.currentEmissions.scope2} tCO2e/year
- Target: ${project.totalTargetEmissions || project.targetEmissions.scope1 + project.targetEmissions.scope2} tCO2e/year
- Target Year: ${project.targetYear}

## Full Document Text (for evidence extraction)
${documentText.substring(0, 10000)}

---
Evaluate against all 6 DNSH objectives. Be specific about evidence found in the document.
Focus on practical environmental harms, not theoretical risks.`;
}

function processAIResult(
  parsed: {
    criteria: DNSHCriterionResult[];
    summary: string;
    keyRisks: string[];
    recommendations: string[];
    isFundamentallyIncompatible?: boolean;
    incompatibilityReason?: string;
  },
  sector: Sector
): DNSHAssessment {
  const criteria = parsed.criteria || [];

  // Validate and normalize criteria
  const normalizedCriteria = criteria.map(c => ({
    objective: c.objective,
    objectiveName: c.objectiveName || getObjectiveName(c.objective),
    status: validateStatus(c.status),
    score: Math.max(0, Math.min(4, c.score || 0)),
    maxScore: 4 as const,
    evidence: c.evidence || '',
    concern: c.concern,
    isFundamentallyIncompatible: c.isFundamentallyIncompatible || false,
    // Only include recommendation if NOT fundamentally incompatible
    recommendation: c.isFundamentallyIncompatible ? undefined : c.recommendation
  }));

  // Check if any criterion is fundamentally incompatible
  const hasFundamentalIncompatibility = parsed.isFundamentallyIncompatible ||
    normalizedCriteria.some(c => c.isFundamentallyIncompatible);

  // Apply sector weights
  const weights = SECTOR_DNSH_WEIGHTS[sector] || {};
  let weightedTotal = 0;
  let maxWeightedTotal = 0;

  normalizedCriteria.forEach(c => {
    const weight = weights[c.objective] || 1;
    weightedTotal += c.score * weight;
    maxWeightedTotal += 4 * weight;
  });

  const totalScore = normalizedCriteria.reduce((sum, c) => sum + c.score, 0);
  const normalizedScore = maxWeightedTotal > 0
    ? Math.round((weightedTotal / maxWeightedTotal) * 100)
    : Math.round((totalScore / 24) * 100);

  // Determine overall status
  const hasSignificantHarm = normalizedCriteria.some(c => c.status === 'significant_harm');
  const hasPotentialHarm = normalizedCriteria.some(c => c.status === 'potential_harm');

  let overallStatus: 'compliant' | 'partial' | 'non_compliant';
  if (hasSignificantHarm || hasFundamentalIncompatibility) {
    overallStatus = 'non_compliant';
  } else if (hasPotentialHarm || normalizedScore < 75) {
    overallStatus = 'partial';
  } else {
    overallStatus = 'compliant';
  }

  return {
    overallStatus,
    totalScore,
    normalizedScore,
    criteria: normalizedCriteria,
    summary: parsed.summary || 'DNSH assessment completed',
    keyRisks: parsed.keyRisks || [],
    // Only include recommendations if NOT fundamentally incompatible
    recommendations: hasFundamentalIncompatibility ? [] : (parsed.recommendations || []),
    isFundamentallyIncompatible: hasFundamentalIncompatibility,
    incompatibilityReason: parsed.incompatibilityReason || undefined
  };
}

function validateStatus(status: string): DNSHStatus {
  const valid: DNSHStatus[] = ['no_harm', 'potential_harm', 'significant_harm', 'not_assessed'];
  return valid.includes(status as DNSHStatus) ? status as DNSHStatus : 'not_assessed';
}

function getObjectiveName(objective: DNSHObjective): string {
  const names: Record<DNSHObjective, string> = {
    climate_mitigation: 'Climate Change Mitigation',
    climate_adaptation: 'Climate Change Adaptation',
    water_resources: 'Water & Marine Resources',
    circular_economy: 'Circular Economy',
    pollution_prevention: 'Pollution Prevention',
    biodiversity: 'Biodiversity & Ecosystems'
  };
  return names[objective] || objective;
}

/**
 * Rule-based fallback when AI is unavailable
 * Based on keyword analysis and project characteristics
 * Now distinguishes between fixable gaps and fundamental incompatibility
 */
function getRuleBasedDNSH(project: ProjectInput, documentText: string): DNSHAssessment {
  const text = (documentText + ' ' + project.description + ' ' + project.transitionStrategy).toLowerCase();
  const criteria: DNSHCriterionResult[] = [];

  // Detect fundamentally incompatible activities
  const isFossilFuelProject = text.includes('coal mining') || text.includes('oil drilling') ||
    text.includes('oil extraction') || text.includes('natural gas extraction') ||
    text.includes('petroleum') || text.includes('crude oil') ||
    text.includes('coal power') || text.includes('fossil fuel expansion');
  const isDeforestationProject = text.includes('deforest') || text.includes('forest clear') ||
    text.includes('land clearing') || text.includes('primary forest');
  const isProtectedAreaViolation = text.includes('protected area') && text.includes('develop');

  const isFundamentallyIncompatible = isFossilFuelProject || isDeforestationProject || isProtectedAreaViolation;

  let incompatibilityReason: string | undefined;
  if (isFossilFuelProject) {
    incompatibilityReason = 'Fossil fuel extraction/expansion is fundamentally incompatible with EU Taxonomy climate objectives. No mitigation measures can change this classification.';
  } else if (isDeforestationProject) {
    incompatibilityReason = 'Deforestation or primary forest clearing is fundamentally incompatible with EU Taxonomy biodiversity objectives.';
  } else if (isProtectedAreaViolation) {
    incompatibilityReason = 'Development in protected areas without legal exception is fundamentally incompatible with EU Taxonomy.';
  }

  // 1. Climate Mitigation
  const hasEmissionsReduction = text.includes('emission') && (text.includes('reduc') || text.includes('target'));
  criteria.push({
    objective: 'climate_mitigation',
    objectiveName: 'Climate Change Mitigation',
    status: isFossilFuelProject ? 'significant_harm' : hasEmissionsReduction ? 'no_harm' : 'potential_harm',
    score: isFossilFuelProject ? 0 : hasEmissionsReduction ? 4 : 2,
    maxScore: 4,
    evidence: isFossilFuelProject ? 'Fossil fuel activity detected' : hasEmissionsReduction ? 'Emissions reduction targets present' : 'Limited emissions information',
    concern: isFossilFuelProject ? 'Fossil fuel activities lead to significant GHG emissions' : undefined,
    isFundamentallyIncompatible: isFossilFuelProject,
    recommendation: isFossilFuelProject ? undefined : 'Quantify GHG reduction targets with verified baseline'
  });

  // 2. Climate Adaptation
  const hasAdaptation = text.includes('adapt') || text.includes('resilien') || text.includes('climate risk');
  criteria.push({
    objective: 'climate_adaptation',
    objectiveName: 'Climate Change Adaptation',
    status: hasAdaptation ? 'no_harm' : 'potential_harm',
    score: hasAdaptation ? 3 : 2,
    maxScore: 4,
    evidence: hasAdaptation ? 'Climate adaptation measures mentioned' : 'No explicit adaptation planning found',
    recommendation: hasAdaptation ? 'Document specific adaptation measures' : 'Include climate risk assessment and adaptation plan'
  });

  // 3. Water Resources
  const waterIntensiveSectors: Sector[] = ['mining', 'agriculture', 'manufacturing'];
  const isWaterIntensive = waterIntensiveSectors.includes(project.sector);
  const hasWaterMeasures = text.includes('water') && (text.includes('efficienc') || text.includes('recycl') || text.includes('conserv'));
  criteria.push({
    objective: 'water_resources',
    objectiveName: 'Water & Marine Resources',
    status: isWaterIntensive && !hasWaterMeasures ? 'potential_harm' : 'no_harm',
    score: isWaterIntensive && !hasWaterMeasures ? 2 : 3,
    maxScore: 4,
    evidence: hasWaterMeasures ? 'Water management measures identified' : isWaterIntensive ? 'Water-intensive sector without clear water management' : 'Low water impact expected',
    recommendation: isWaterIntensive && !hasWaterMeasures ? 'Include water efficiency and recycling measures' : undefined
  });

  // 4. Circular Economy
  const hasCircular = text.includes('recycl') || text.includes('waste') || text.includes('circular') || text.includes('reuse');
  criteria.push({
    objective: 'circular_economy',
    objectiveName: 'Circular Economy',
    status: hasCircular ? 'no_harm' : 'potential_harm',
    score: hasCircular ? 3 : 2,
    maxScore: 4,
    evidence: hasCircular ? 'Circular economy practices mentioned' : 'No waste management or recycling mentioned',
    recommendation: hasCircular ? undefined : 'Include waste management and material efficiency plans'
  });

  // 5. Pollution Prevention
  const pollutingSectors: Sector[] = ['mining', 'manufacturing', 'energy'];
  const isPolluting = pollutingSectors.includes(project.sector);
  const hasPollutionControl = text.includes('emission control') || text.includes('air quality') || text.includes('pollution') && text.includes('prevent');
  criteria.push({
    objective: 'pollution_prevention',
    objectiveName: 'Pollution Prevention',
    status: isPolluting && !hasPollutionControl ? 'potential_harm' : 'no_harm',
    score: isPolluting && !hasPollutionControl ? 2 : 3,
    maxScore: 4,
    evidence: hasPollutionControl ? 'Pollution control measures identified' : isPolluting ? 'Industrial activity without explicit pollution controls' : 'Low pollution risk expected',
    recommendation: isPolluting && !hasPollutionControl ? 'Document emission controls and pollution prevention measures' : undefined
  });

  // 6. Biodiversity
  const hasBiodiversity = text.includes('biodiversity') || text.includes('ecosystem') || text.includes('protected area') || text.includes('environmental impact');
  criteria.push({
    objective: 'biodiversity',
    objectiveName: 'Biodiversity & Ecosystems',
    status: isDeforestationProject ? 'significant_harm' : hasBiodiversity ? 'no_harm' : 'not_assessed',
    score: isDeforestationProject ? 0 : hasBiodiversity ? 3 : 2,
    maxScore: 4,
    evidence: isDeforestationProject ? 'Deforestation or land clearing detected' : hasBiodiversity ? 'Biodiversity considerations addressed' : 'No biodiversity assessment found',
    concern: isDeforestationProject ? 'Land clearing causes significant ecosystem harm' : undefined,
    isFundamentallyIncompatible: isDeforestationProject,
    recommendation: isDeforestationProject ? undefined : hasBiodiversity ? undefined : 'Include environmental impact assessment'
  });

  const totalScore = criteria.reduce((sum, c) => sum + c.score, 0);
  const normalizedScore = Math.round((totalScore / 24) * 100);
  const hasSignificantHarm = criteria.some(c => c.status === 'significant_harm');
  const hasPotentialHarm = criteria.some(c => c.status === 'potential_harm');

  // Generate summary based on compatibility
  let summary: string;
  if (isFundamentallyIncompatible) {
    summary = 'Project type is fundamentally incompatible with EU Taxonomy DNSH requirements.';
  } else if (hasSignificantHarm) {
    summary = 'Significant environmental harm detected - requires major remediation.';
  } else if (hasPotentialHarm) {
    summary = 'Potential harm identified - improvements recommended for DNSH compliance.';
  } else {
    summary = 'No significant harm detected - project appears DNSH compliant.';
  }

  return {
    overallStatus: hasSignificantHarm || isFundamentallyIncompatible ? 'non_compliant' : hasPotentialHarm ? 'partial' : 'compliant',
    totalScore,
    normalizedScore,
    criteria,
    summary,
    keyRisks: criteria.filter(c => c.concern).map(c => c.concern!),
    // Only include recommendations for fixable issues
    recommendations: isFundamentallyIncompatible ? [] : criteria.filter(c => c.recommendation).map(c => c.recommendation!).slice(0, 3),
    isFundamentallyIncompatible,
    incompatibilityReason
  };
}

/**
 * Convert DNSH score to greenwashing penalty contribution
 * Used when integrating DNSH into the combined greenwash score
 */
export function dnshToGreenwashPenalty(dnshNormalizedScore: number): number {
  // DNSH score 0-100 where higher = less harm
  // Penalty is inverse: lower DNSH score = higher penalty
  // Aligned with scoring methodology: Partial (50-79) → 5-12 penalty, Non-compliant (<50) → 12-25 penalty
  if (dnshNormalizedScore >= 83) return 0;   // Fully Compliant - no penalty
  if (dnshNormalizedScore >= 70) return 5;   // Mostly Compliant - minor penalty
  if (dnshNormalizedScore >= 50) return 10;  // Partial - moderate penalty (61 falls here)
  if (dnshNormalizedScore >= 25) return 18;  // Non-compliant - significant penalty
  return 25;  // Severe harm - maximum penalty
}
