'use client';

import { useState } from 'react';

// Feature flag for AI Greenwash Section
const SHOW_AI_GREENWASH_SECTION = false;

// Short labels for DNSH objectives (for compact view)
const DNSH_SHORT_LABELS: Record<string, string> = {
  'climate_mitigation': 'Mitigation',
  'climate_adaptation': 'Adaptation',
  'water_resources': 'Water',
  'circular_economy': 'Circular',
  'pollution_prevention': 'Pollution',
  'biodiversity': 'Biodiversity',
  // Fallback for full names
  'Climate Change Mitigation': 'Mitigation',
  'Climate Change Adaptation': 'Adaptation',
  'Water & Marine Resources': 'Water',
  'Sustainable Use of Water and Marine Resources': 'Water',
  'Circular Economy': 'Circular',
  'Transition to Circular Economy': 'Circular',
  'Pollution Prevention': 'Pollution',
  'Pollution Prevention and Control': 'Pollution',
  'Biodiversity & Ecosystems': 'Biodiversity',
  'Protection of Biodiversity and Ecosystems': 'Biodiversity',
};

// Custom icons for each DNSH objective
const DNSH_ICONS: Record<string, React.ReactNode> = {
  'climate_mitigation': (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'climate_adaptation': (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'water_resources': (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0L12 2.69z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M8 14a4 4 0 0 0 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'circular_economy': (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M21 12a9 9 0 0 1-9 9m0 0a9 9 0 0 1-9-9m9 9v-3m0-15a9 9 0 0 1 9 9m-9-9a9 9 0 0 0-9 9m9-9v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 9l3-3 3 3M15 15l-3 3-3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'pollution_prevention': (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7 7-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  'biodiversity': (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
      <path d="M12 22V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 12s2.5-4 7-4 7 4 7 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 8c-1.5-2.5-1-5 1-7 2 2 2.5 4.5 1 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 15c-2 0-3 1.5-3 3s2 3 3 3M16 15c2 0 3 1.5 3 3s-2 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
};

// Get icon for a DNSH objective
const getDNSHIcon = (objective: string): React.ReactNode => {
  const key = objective.toLowerCase().replace(/[^a-z_]/g, '_').replace(/__+/g, '_');
  for (const [k, icon] of Object.entries(DNSH_ICONS)) {
    if (key.includes(k) || k.includes(key.split('_')[0])) return icon;
  }
  // Fallback mapping
  if (objective.toLowerCase().includes('mitigation')) return DNSH_ICONS['climate_mitigation'];
  if (objective.toLowerCase().includes('adaptation')) return DNSH_ICONS['climate_adaptation'];
  if (objective.toLowerCase().includes('water')) return DNSH_ICONS['water_resources'];
  if (objective.toLowerCase().includes('circular')) return DNSH_ICONS['circular_economy'];
  if (objective.toLowerCase().includes('pollution')) return DNSH_ICONS['pollution_prevention'];
  if (objective.toLowerCase().includes('biodiversity') || objective.toLowerCase().includes('ecosystem')) return DNSH_ICONS['biodiversity'];
  return DNSH_ICONS['climate_mitigation']; // Default
};

interface GreenwashingRiskData {
  level: string;
  score: number;
  redFlags: { description: string; recommendation: string; severity: string }[];
  positiveIndicators: string[];
  recommendations: string[];
  aiEvaluationUsed?: boolean;
  aiScore?: number;
  aiRiskLevel?: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
  aiConfidence?: number;
  aiBreakdown?: {
    component: string;
    componentName: string;
    maxScore: number;
    score: number;
    confidence: number;
    findings: {
      criterion: string;
      maxPoints: number;
      points: number;
      status: 'strong' | 'adequate' | 'weak' | 'missing';
      evidence: string;
      concern?: string;
    }[];
    overallAssessment: string;
    recommendations: string[];
  }[];
  aiSummary?: string;
  aiTopConcerns?: string[];
  aiPositiveFindings?: string[];
  dnshAssessment?: {
    overallStatus: 'compliant' | 'partial' | 'non_compliant';
    totalScore: number;
    normalizedScore: number;
    criteria: {
      objective: string;
      objectiveName: string;
      status: 'no_harm' | 'potential_harm' | 'significant_harm' | 'not_assessed';
      score: number;
      maxScore: number;
      evidence: string;
      concern?: string;
      isFundamentallyIncompatible?: boolean;  // True = no workaround possible
      recommendation?: string;  // Only for fixable issues
    }[];
    summary: string;
    keyRisks: string[];
    recommendations: string[];  // Only for fixable issues
    isFundamentallyIncompatible?: boolean;
    incompatibilityReason?: string;
  };
  dnshPenalty?: number;
}

interface GreenwashingRiskCardProps {
  greenwashingRisk: GreenwashingRiskData;
  greenwashingPenalty?: number;
}

export function GreenwashingRiskCard({ greenwashingRisk, greenwashingPenalty }: GreenwashingRiskCardProps) {
  const [dnshExpanded, setDnshExpanded] = useState(false);
  const [expandedCriterion, setExpandedCriterion] = useState<number | null>(null);

  // Get the most critical DNSH criterion (lowest score relative to max)
  const getCriticalCriterion = () => {
    if (!greenwashingRisk.dnshAssessment?.criteria) return null;
    return greenwashingRisk.dnshAssessment.criteria.reduce((worst, current) => {
      const worstRatio = worst.score / worst.maxScore;
      const currentRatio = current.score / current.maxScore;
      return currentRatio < worstRatio ? current : worst;
    });
  };

  const criticalCriterion = getCriticalCriterion();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 result-card overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-display font-medium text-gray-900">Greenwashing Risk Assessment</h2>
            <p className="text-sm text-gray-500 mt-1">Credibility analysis of sustainability claims</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-semibold ${
              greenwashingRisk.level === 'low' ? 'text-verdex-600' :
              greenwashingRisk.level === 'medium' ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {greenwashingRisk.score}
              <span className="text-sm font-normal text-gray-400">/100</span>
            </div>
            <span className={`text-xs font-medium uppercase tracking-wide ${
              greenwashingRisk.level === 'low' ? 'text-verdex-600' :
              greenwashingRisk.level === 'medium' ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {greenwashingRisk.level} risk
            </span>
          </div>
        </div>

        {(greenwashingPenalty ?? 0) > 0 && (
          <p className="text-xs text-rose-500 mt-3">
            Score penalty of {greenwashingPenalty} points applied to overall assessment
          </p>
        )}
      </div>

      <div className="px-6 py-5">
        {/* Two column layout for flags and indicators */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Red Flags */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Concerns ({greenwashingRisk.redFlags.length})
              </span>
            </div>

            {greenwashingRisk.redFlags.length > 0 ? (
              <div className="space-y-2">
                {greenwashingRisk.redFlags.map((flag, i) => (
                  <div key={i} className="border-l-2 border-rose-300 pl-3 py-1.5">
                    <p className="text-sm text-gray-700">{flag.description}</p>
                    <p className="text-xs text-gray-500 mt-1">{flag.recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">No red flags identified</div>
            )}
          </div>

          {/* Positive Indicators */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-verdex-400" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                Positive Signals ({greenwashingRisk.positiveIndicators.length})
              </span>
            </div>

            {greenwashingRisk.positiveIndicators.length > 0 ? (
              <div className="space-y-2">
                {greenwashingRisk.positiveIndicators.map((indicator, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5">
                    <span className="w-4 h-4 rounded-full bg-verdex-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-verdex-500" />
                    </span>
                    <span className="text-sm text-gray-700">{indicator}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-400 italic">No positive indicators identified</div>
            )}
          </div>
        </div>

        {/* Recommendations if any */}
        {greenwashingRisk.recommendations && greenwashingRisk.recommendations.length > 0 && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recommendations</span>
            </div>
            <div className="space-y-2">
              {greenwashingRisk.recommendations.map((rec, i) => (
                <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-gray-300 mt-1">—</span>
                  {rec}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* AI Greenwashing Analysis Breakdown */}
        {SHOW_AI_GREENWASH_SECTION && greenwashingRisk.aiEvaluationUsed && greenwashingRisk.aiBreakdown && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">AI Analysis Breakdown</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                  {greenwashingRisk.aiScore}/100
                </span>
                <span className="text-gray-400">
                  {greenwashingRisk.aiConfidence}% confidence
                </span>
              </div>
            </div>

            {greenwashingRisk.aiSummary && (
              <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                {greenwashingRisk.aiSummary}
              </p>
            )}

            <div className="space-y-4">
              {greenwashingRisk.aiBreakdown.map((component, idx) => (
                <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">{component.componentName}</span>
                      <span className="text-xs text-gray-400">({component.confidence}% conf.)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            component.score >= 20 ? 'bg-verdex-500' :
                            component.score >= 15 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${(component.score / component.maxScore) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${
                        component.score >= 20 ? 'text-verdex-600' :
                        component.score >= 15 ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {component.score}/{component.maxScore}
                      </span>
                    </div>
                  </div>

                  <div className="px-4 py-3 space-y-2">
                    {component.findings.map((finding, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3 py-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          finding.status === 'strong' ? 'bg-verdex-500' :
                          finding.status === 'adequate' ? 'bg-amber-500' :
                          finding.status === 'weak' ? 'bg-orange-500' : 'bg-rose-500'
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-700">{finding.criterion}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              finding.status === 'strong' ? 'bg-verdex-50 text-verdex-700' :
                              finding.status === 'adequate' ? 'bg-amber-50 text-amber-700' :
                              finding.status === 'weak' ? 'bg-orange-50 text-orange-700' : 'bg-rose-50 text-rose-700'
                            }`}>
                              {finding.points}/{finding.maxPoints}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-0.5">{finding.evidence}</p>
                          {finding.concern && (
                            <p className="text-xs text-rose-600 mt-0.5 italic">{finding.concern}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {component.recommendations.length > 0 && (
                    <div className="px-4 py-2 bg-blue-50/50 border-t border-gray-100">
                      <p className="text-xs text-gray-500 mb-1">Recommendations:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {component.recommendations.slice(0, 3).map((rec, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-blue-400">→</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* AI Top Concerns & Positive Findings */}
            {(greenwashingRisk.aiTopConcerns?.length || greenwashingRisk.aiPositiveFindings?.length) && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                {greenwashingRisk.aiTopConcerns && greenwashingRisk.aiTopConcerns.length > 0 && (
                  <div className="p-3 bg-rose-50/50 rounded-lg">
                    <p className="text-xs font-medium text-rose-700 mb-2">Top AI Concerns</p>
                    <ul className="text-xs text-rose-600 space-y-1">
                      {greenwashingRisk.aiTopConcerns.map((concern, i) => (
                        <li key={i}>• {concern}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {greenwashingRisk.aiPositiveFindings && greenwashingRisk.aiPositiveFindings.length > 0 && (
                  <div className="p-3 bg-verdex-50/50 rounded-lg">
                    <p className="text-xs font-medium text-verdex-700 mb-2">AI Positive Findings</p>
                    <ul className="text-xs text-verdex-600 space-y-1">
                      {greenwashingRisk.aiPositiveFindings.map((finding, i) => (
                        <li key={i}>• {finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* DNSH Assessment Section (EU Taxonomy Article 17) */}
        {greenwashingRisk.dnshAssessment && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  greenwashingRisk.dnshAssessment.overallStatus === 'compliant' ? 'bg-verdex-50' :
                  greenwashingRisk.dnshAssessment.overallStatus === 'partial' ? 'bg-amber-50' : 'bg-rose-50'
                }`}>
                  <svg className={`w-5 h-5 ${
                    greenwashingRisk.dnshAssessment.overallStatus === 'compliant' ? 'text-verdex-600' :
                    greenwashingRisk.dnshAssessment.overallStatus === 'partial' ? 'text-amber-600' : 'text-rose-600'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">EU Taxonomy DNSH</h3>
                  <p className="text-xs text-gray-500">Do No Significant Harm · Article 17</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  greenwashingRisk.dnshAssessment.overallStatus === 'compliant' ? 'text-verdex-600' :
                  greenwashingRisk.dnshAssessment.overallStatus === 'partial' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {greenwashingRisk.dnshAssessment.normalizedScore}
                  <span className="text-sm font-normal text-gray-400">/100</span>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                  greenwashingRisk.dnshAssessment.overallStatus === 'compliant' ? 'bg-verdex-50 text-verdex-700' :
                  greenwashingRisk.dnshAssessment.overallStatus === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  {greenwashingRisk.dnshAssessment.overallStatus === 'compliant' ? 'Compliant' :
                   greenwashingRisk.dnshAssessment.overallStatus === 'partial' ? 'Partial' : 'Non-Compliant'}
                </span>
              </div>
            </div>

            {/* FUNDAMENTAL INCOMPATIBILITY WARNING */}
            {greenwashingRisk.dnshAssessment.isFundamentallyIncompatible && (
              <div className="mb-5 p-4 bg-rose-50 rounded-xl border border-rose-200">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-rose-800">
                      Fundamentally Incompatible
                    </h4>
                    <p className="text-sm text-rose-700 mt-1">
                      {greenwashingRisk.dnshAssessment.incompatibilityReason ||
                        'This project type is fundamentally incompatible with EU Taxonomy environmental objectives.'}
                    </p>
                    <p className="text-xs text-rose-500 mt-2">
                      European DFIs cannot finance without pathway to compliance.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6-CRITERIA GRID - LMA style with colored left border */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-3 mb-4">
              {greenwashingRisk.dnshAssessment.criteria.map((criterion, idx) => {
                const shortLabel = DNSH_SHORT_LABELS[criterion.objective] || DNSH_SHORT_LABELS[criterion.objectiveName] || criterion.objectiveName.split(' ')[0];
                const isExpanded = expandedCriterion === idx;
                const icon = getDNSHIcon(criterion.objective || criterion.objectiveName);

                // Border color based on status (matching LMA section styling)
                const borderColor = criterion.isFundamentallyIncompatible ? 'border-rose-400' :
                  criterion.status === 'no_harm' ? 'border-verdex-400' :
                  criterion.status === 'potential_harm' ? 'border-amber-400' :
                  criterion.status === 'significant_harm' ? 'border-rose-400' : 'border-gray-300';

                return (
                  <button
                    key={idx}
                    onClick={() => setExpandedCriterion(isExpanded ? null : idx)}
                    className={`group relative pl-4 py-3 text-left transition-all duration-200 border-l-2 ${borderColor} hover:bg-gray-50 ${isExpanded ? 'bg-gray-50' : ''}`}
                  >
                    {/* Icon and label */}
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-5 h-5 flex-shrink-0 ${
                        criterion.isFundamentallyIncompatible ? 'text-rose-500' :
                        criterion.status === 'no_harm' ? 'text-verdex-600' :
                        criterion.status === 'potential_harm' ? 'text-amber-600' :
                        criterion.status === 'significant_harm' ? 'text-rose-600' : 'text-gray-400'
                      }`}>
                        {icon}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{shortLabel}</span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-3">
                      {criterion.isFundamentallyIncompatible ? (
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">BLOCKED</span>
                      ) : (
                        <span className={`text-xl font-bold ${
                          criterion.status === 'no_harm' ? 'text-verdex-600' :
                          criterion.status === 'potential_harm' ? 'text-amber-600' :
                          criterion.status === 'significant_harm' ? 'text-rose-600' : 'text-gray-500'
                        }`}>
                          {criterion.score}<span className="text-sm font-normal text-gray-400">/{criterion.maxScore}</span>
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* EXPANDED CRITERION DETAIL (inline) - LMA style */}
            {expandedCriterion !== null && (
              <div className={`mb-4 pl-4 py-3 animate-in slide-in-from-top-2 duration-200`}>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 flex-shrink-0 ${
                      greenwashingRisk.dnshAssessment.criteria[expandedCriterion].status === 'no_harm' ? 'text-verdex-600' :
                      greenwashingRisk.dnshAssessment.criteria[expandedCriterion].status === 'potential_harm' ? 'text-amber-600' :
                      greenwashingRisk.dnshAssessment.criteria[expandedCriterion].status === 'significant_harm' ? 'text-rose-600' : 'text-gray-500'
                    }`}>
                      {getDNSHIcon(greenwashingRisk.dnshAssessment.criteria[expandedCriterion].objective || greenwashingRisk.dnshAssessment.criteria[expandedCriterion].objectiveName)}
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {greenwashingRisk.dnshAssessment.criteria[expandedCriterion].objectiveName}
                    </h4>
                  </div>
                  <button
                    onClick={() => setExpandedCriterion(null)}
                    className="p-1 hover:bg-gray-100 rounded transition-colors"
                  >
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {greenwashingRisk.dnshAssessment.criteria[expandedCriterion].evidence}
                </p>
                {greenwashingRisk.dnshAssessment.criteria[expandedCriterion].concern && (
                  <div className="mt-3 pl-3 border-l-2 border-amber-400">
                    <p className="text-xs text-amber-700">
                      {greenwashingRisk.dnshAssessment.criteria[expandedCriterion].concern}
                    </p>
                  </div>
                )}
                {/* Show incompatibility message OR recommendation, never both */}
                {greenwashingRisk.dnshAssessment.criteria[expandedCriterion].isFundamentallyIncompatible ? (
                  <div className="mt-3 pl-3 border-l-2 border-rose-400">
                    <p className="text-xs text-rose-700">
                      No pathway to compliance — this activity is fundamentally incompatible with this environmental objective.
                    </p>
                  </div>
                ) : greenwashingRisk.dnshAssessment.criteria[expandedCriterion].recommendation && (
                  <div className="mt-3 pl-3 border-l-2 border-gray-300">
                    <p className="text-xs text-gray-600">
                      → {greenwashingRisk.dnshAssessment.criteria[expandedCriterion].recommendation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* CRITICAL RISK CALLOUT (most important insight) */}
            {criticalCriterion && criticalCriterion.score === 0 && !dnshExpanded && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-rose-800">
                      Critical: {criticalCriterion.objectiveName}
                    </p>
                    <p className="text-xs text-rose-600 mt-1">
                      {criticalCriterion.concern || criticalCriterion.evidence}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* EXPAND/COLLAPSE FOR FULL DETAILS */}
            <button
              onClick={() => setDnshExpanded(!dnshExpanded)}
              className="w-full flex items-center justify-between py-2.5 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-xs border border-gray-200"
            >
              <span className="font-medium text-gray-600">
                {dnshExpanded ? 'Hide details' :
                  greenwashingRisk.dnshAssessment.isFundamentallyIncompatible
                    ? 'View environmental risks'
                    : 'View all risks & recommendations'}
              </span>
              <svg
                className={`w-4 h-4 text-gray-400 transition-transform ${dnshExpanded ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* EXPANDED FULL DETAILS */}
            {dnshExpanded && (
              <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {/* Key Risks */}
                {greenwashingRisk.dnshAssessment.keyRisks.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-rose-800 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Key Environmental Risks
                    </p>
                    <ul className="text-sm text-rose-700 space-y-2">
                      {greenwashingRisk.dnshAssessment.keyRisks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 flex-shrink-0" />
                          <span>{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {!greenwashingRisk.dnshAssessment.isFundamentallyIncompatible &&
                  greenwashingRisk.dnshAssessment.recommendations.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Recommendations
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {greenwashingRisk.dnshAssessment.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-gray-400">—</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Alternative guidance for incompatible projects */}
                {greenwashingRisk.dnshAssessment.isFundamentallyIncompatible && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">What This Means</p>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">—</span>
                        <span>This project type cannot be modified to meet EU Taxonomy DNSH requirements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">—</span>
                        <span>European climate-aligned DFIs are unlikely to provide financing</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-gray-400">—</span>
                        <span>Consider alternative financing sources or project redesign</span>
                      </li>
                    </ul>
                  </div>
                )}

                {/* Full Criteria Breakdown */}
                <details className="group">
                  <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 flex items-center gap-2 py-2">
                    <svg className="w-3 h-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                    Full criteria breakdown
                  </summary>
                  <div className="mt-3 space-y-3">
                    {greenwashingRisk.dnshAssessment.criteria.map((criterion, idx) => (
                      <div key={idx} className="py-2 text-xs">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 ${
                              criterion.status === 'no_harm' ? 'text-verdex-600' :
                              criterion.status === 'potential_harm' ? 'text-amber-600' :
                              criterion.status === 'significant_harm' ? 'text-rose-600' : 'text-gray-500'
                            }`}>
                              {getDNSHIcon(criterion.objective || criterion.objectiveName)}
                            </div>
                            <span className="font-medium text-gray-800">{criterion.objectiveName}</span>
                            {criterion.isFundamentallyIncompatible && (
                              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-600 rounded">
                                INCOMPATIBLE
                              </span>
                            )}
                          </div>
                          <span className={`font-bold ${
                            criterion.status === 'no_harm' ? 'text-verdex-600' :
                            criterion.status === 'potential_harm' ? 'text-amber-600' :
                            criterion.status === 'significant_harm' ? 'text-rose-600' : 'text-gray-500'
                          }`}>{criterion.score}/{criterion.maxScore}</span>
                        </div>
                        <p className="text-gray-600">{criterion.evidence}</p>
                        {criterion.concern && (
                          <p className="text-amber-700 mt-2 text-[11px]">⚠ {criterion.concern}</p>
                        )}
                        {criterion.recommendation && !criterion.isFundamentallyIncompatible && (
                          <p className="text-gray-500 mt-2 text-[11px]">→ {criterion.recommendation}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
