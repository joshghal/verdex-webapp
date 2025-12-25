// DFI Matcher Engine

import type {
  ProjectInput,
  DFI,
  DFIMatch,
  BlendedStructure
} from '../types';

import { DFI_DATABASE, getMatchingDFIs } from '../data/dfis';
import { getCountryProfile } from '../data/countries';

export function matchDFIs(project: ProjectInput): DFIMatch[] {
  const potentialDFIs = getMatchingDFIs(project.country, project.sector, project.totalCost);
  const matches: DFIMatch[] = potentialDFIs.map(dfi => scoreDFIMatch(dfi, project));
  matches.sort((a, b) => b.matchScore - a.matchScore);
  return matches.slice(0, 5);
}

function scoreDFIMatch(dfi: DFI, project: ProjectInput): DFIMatch {
  let score = 0;
  const reasons: string[] = [];
  const concerns: string[] = [];

  if (dfi.eligibleCountries === 'all' || dfi.eligibleCountries.includes(project.country)) {
    score += 25;
    reasons.push(`Active in ${project.country}`);
  }

  if (dfi.eligibleSectors === 'all' || dfi.eligibleSectors.includes(project.sector)) {
    score += 25;
    reasons.push(`Funds ${project.sector} sector`);
  }

  const sizeScore = scoreSizeMatch(dfi, project.totalCost);
  score += sizeScore.points;
  if (sizeScore.reason) reasons.push(sizeScore.reason);
  if (sizeScore.concern) concerns.push(sizeScore.concern);

  if (dfi.climateTarget) {
    score += 15;
    reasons.push(`Climate commitment: ${dfi.climateTarget}`);
  }

  const programScore = scoreSpecialPrograms(dfi, project);
  score += programScore.points;
  if (programScore.reason) reasons.push(programScore.reason);

  const role = determineRole(dfi, project);
  const estimatedSize = estimateDFIContribution(dfi, project);

  return {
    dfi,
    matchScore: Math.min(100, score),
    matchReasons: reasons,
    concerns,
    recommendedRole: role,
    estimatedSize
  };
}

function scoreSizeMatch(dfi: DFI, projectSize: number): { points: number; reason?: string; concern?: string } {
  if (dfi.minSize && projectSize < dfi.minSize) {
    return {
      points: 0,
      concern: `Project size ($${(projectSize / 1_000_000).toFixed(1)}M) below DFI minimum ($${(dfi.minSize / 1_000_000).toFixed(1)}M)`
    };
  }

  if (dfi.minSize && dfi.maxSize) {
    if (projectSize >= dfi.minSize && projectSize <= dfi.maxSize) {
      return { points: 20, reason: 'Project size in optimal range' };
    }
  }

  if (dfi.maxParticipation) {
    const maxDFIAmount = projectSize * (dfi.maxParticipation / 100);
    if (maxDFIAmount >= 10_000_000) {
      return { points: 15, reason: `Can participate up to $${(maxDFIAmount / 1_000_000).toFixed(1)}M (${dfi.maxParticipation}%)` };
    }
  }

  return { points: 10 };
}

function scoreSpecialPrograms(dfi: DFI, project: ProjectInput): { points: number; reason?: string } {
  if (!dfi.specialPrograms) return { points: 0 };

  const sector = project.sector;

  for (const program of dfi.specialPrograms) {
    const programLower = program.toLowerCase();

    if (sector === 'energy' && (programLower.includes('energy') || programLower.includes('power'))) {
      return { points: 15, reason: `Relevant program: ${program}` };
    }

    if (programLower.includes('climate') || programLower.includes('green')) {
      return { points: 15, reason: `Climate program available: ${program}` };
    }

    if (project.totalCost < 25_000_000 && programLower.includes('sme')) {
      return { points: 15, reason: `SME program available: ${program}` };
    }

    if (programLower.includes('africa')) {
      return { points: 10, reason: `Africa-focused program: ${program}` };
    }
  }

  return { points: 5, reason: 'Multiple financing programs available' };
}

function determineRole(dfi: DFI, project: ProjectInput): 'senior' | 'subordinated' | 'mezzanine' | 'equity' | 'guarantee' {
  if (project.totalCost > 100_000_000) {
    return 'senior';
  }

  if (dfi.id === 'dfc') {
    return 'guarantee';
  }

  if (dfi.id === 'bii' && project.equityAmount / project.totalCost > 0.3) {
    return 'equity';
  }

  const countryProfile = getCountryProfile(project.country);
  if (countryProfile?.politicalRiskLevel === 'high') {
    return 'subordinated';
  }

  if (project.totalCost > 25_000_000) {
    return 'mezzanine';
  }

  return 'senior';
}

function estimateDFIContribution(dfi: DFI, project: ProjectInput): { min: number; max: number } {
  let maxContribution: number;

  if (dfi.maxParticipation) {
    maxContribution = project.totalCost * (dfi.maxParticipation / 100);
  } else if (dfi.maxSize) {
    maxContribution = Math.min(dfi.maxSize, project.totalCost * 0.25);
  } else {
    maxContribution = project.totalCost * 0.25;
  }

  const minContribution = dfi.minSize || Math.max(3_000_000, maxContribution * 0.3);

  return {
    min: Math.round(minContribution),
    max: Math.round(maxContribution)
  };
}

export function recommendBlendedStructure(project: ProjectInput, dfiMatches: DFIMatch[]): BlendedStructure {
  const structure: BlendedStructure = {
    seniorDebt: { percentage: 0, sources: [] },
    subordinatedDebt: { percentage: 0, sources: [] },
    equity: { percentage: 0, sources: [] }
  };

  const equityRatio = project.equityAmount / project.totalCost;
  const debtRatio = project.debtAmount / project.totalCost;

  structure.equity.percentage = Math.round(equityRatio * 100);
  structure.equity.sources.push('Project sponsor');

  const equityDFIs = dfiMatches.filter(m => m.recommendedRole === 'equity');
  if (equityDFIs.length > 0) {
    structure.equity.sources.push(...equityDFIs.map(m => m.dfi.name));
  }

  const seniorDFIs = dfiMatches.filter(m => m.recommendedRole === 'senior');
  const subDFIs = dfiMatches.filter(m => m.recommendedRole === 'subordinated' || m.recommendedRole === 'mezzanine');
  const guaranteeDFIs = dfiMatches.filter(m => m.recommendedRole === 'guarantee');

  if (seniorDFIs.length > 0) {
    structure.seniorDebt.percentage = Math.round(debtRatio * 60);
    structure.seniorDebt.sources = ['Commercial banks', ...seniorDFIs.map(m => m.dfi.name)];
    structure.seniorDebt.estimatedRate = '6-9% USD';
  } else {
    structure.seniorDebt.percentage = Math.round(debtRatio * 50);
    structure.seniorDebt.sources = ['Commercial banks'];
  }

  if (subDFIs.length > 0) {
    structure.subordinatedDebt = {
      percentage: Math.round(debtRatio * 40),
      sources: subDFIs.map(m => m.dfi.name)
    };
  }

  if (guaranteeDFIs.length > 0) {
    structure.guarantees = guaranteeDFIs.map(m => ({
      type: 'Political Risk Insurance',
      provider: m.dfi.name,
      coverage: 'Up to 90% of senior debt'
    }));
  }

  return structure;
}
