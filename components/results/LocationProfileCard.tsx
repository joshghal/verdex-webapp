'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

// AI-generated insights type
interface AIInsights {
  projectContext: string;
  recommendations: {
    text: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  keyRisk: {
    headline: string;
    mitigation: string;
  };
  opportunity: {
    headline: string;
    detail: string;
  };
}

interface KeyInsight {
  icon: 'water' | 'sun' | 'temp' | 'calendar' | 'warning' | 'check';
  headline: string;
  detail: string;
  action?: string;
  severity: 'positive' | 'neutral' | 'caution';
  source?: string;  // Citation for transparency
}

interface LocationRiskData {
  coordinates: {
    latitude: number;
    longitude: number;
    locationName?: string;
  };
  overallRiskScore: number;
  historicalData: {
    averageTemperature: number;
    temperatureVariability: number;
    annualPrecipitation: number;
    precipitationVariability: number;
    drySeasonMonths: number[];
    extremeHeatDays: number;
    droughtRisk: 'low' | 'medium' | 'high';
    floodRisk: 'low' | 'medium' | 'high';
  };
  projections: {
    scenario: string;
    year: number;
    temperatureChange: number;
    precipitationChange: number;
    extremeEventFrequency: number;
  }[];
  riskMetrics: {
    indicator: string;
    value: number;
    unit: string;
    trend: 'increasing' | 'stable' | 'decreasing';
    riskLevel: 'low' | 'medium' | 'high';
    description: string;
  }[];
  keyInsights?: KeyInsight[];
  resilienceOpportunities: string[];
  siteIntelligence: {
    optimalOperatingMonths: number[];
    operatingContext?: string;
    waterAvailability: 'abundant' | 'moderate' | 'scarce';
    solarPotential?: number;
    agriculturalSuitability?: string;
  };
  recommendations: string[];
  dataSource: string;
  assessmentDate: string;
}

interface CountryInfoData {
  region?: string;
  legalSystem?: string;
  currency?: string;
  sovereignRating?: string;
  politicalRisk?: 'low' | 'medium' | 'high';
  ndcTarget?: string;
}

interface LocationProfileCardProps {
  locationRisk?: LocationRiskData;
  countryInfo?: CountryInfoData;
  country?: string;
  countryName?: string;
  sector?: string;
  projectName?: string;
  projectDescription?: string;
}

// Icon component for insights
function InsightIcon({ icon, className }: { icon: KeyInsight['icon']; className?: string }) {
  const icons = {
    water: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 0-6 7-6 11a6 6 0 1012 0c0-4-6-11-6-11z" />
      </svg>
    ),
    sun: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    temp: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    calendar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    warning: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return icons[icon] || null;
}

// Generate project-specific actionable recommendations
function generateProjectRecommendations(
  sector: string | undefined,
  locationRisk: LocationRiskData | undefined
): { text: string; priority: 'high' | 'medium' | 'low' }[] {
  if (!locationRisk || !sector) return [];

  const { historicalData, siteIntelligence } = locationRisk;
  const recommendations: { text: string; priority: 'high' | 'medium' | 'low' }[] = [];

  // Sector-specific recommendations based on climate data
  switch (sector) {
    case 'energy':
      // Solar-specific
      if (siteIntelligence.solarPotential && siteIntelligence.solarPotential >= 4.5) {
        if (historicalData.extremeHeatDays > 30) {
          recommendations.push({
            text: `Specify heat-tolerant panels (low temp coefficient <0.35%/°C) to minimize the ${historicalData.extremeHeatDays} extreme heat days impact`,
            priority: 'high'
          });
        }
        if (historicalData.precipitationVariability > 30) {
          recommendations.push({
            text: 'Design drainage for high rainfall variability—consider elevated mounting',
            priority: 'medium'
          });
        }
      }
      if (historicalData.droughtRisk === 'high') {
        recommendations.push({
          text: 'Avoid water-intensive cleaning; use robotic dry-cleaning systems',
          priority: 'medium'
        });
      }
      break;

    case 'agriculture':
      const rainfall = historicalData.annualPrecipitation;
      if (rainfall < 800) {
        recommendations.push({
          text: `Budget $2,500-4,000/ha for drip irrigation—${rainfall}mm rainfall is below 800mm rainfed threshold`,
          priority: 'high'
        });
      }
      if (historicalData.drySeasonMonths.length >= 5) {
        recommendations.push({
          text: `Plan for ${historicalData.drySeasonMonths.length}-month dry season with water storage or drought-resistant varieties`,
          priority: 'high'
        });
      }
      if (historicalData.extremeHeatDays > 20) {
        recommendations.push({
          text: 'Select heat-tolerant crop varieties (e.g., NERICA rice, drought-tolerant maize)',
          priority: 'medium'
        });
      }
      if (siteIntelligence.waterAvailability === 'scarce') {
        recommendations.push({
          text: 'Conduct groundwater assessment before committing—surface water is scarce',
          priority: 'high'
        });
      }
      break;

    case 'mining':
      if (historicalData.floodRisk === 'high') {
        recommendations.push({
          text: 'Design pit drainage for 1-in-100 year flood events; budget 15-20% more for dewatering',
          priority: 'high'
        });
      }
      if (historicalData.drySeasonMonths.length >= 4) {
        recommendations.push({
          text: `Schedule major earthworks during ${historicalData.drySeasonMonths.length}-month dry season window`,
          priority: 'medium'
        });
      }
      if (siteIntelligence.waterAvailability !== 'abundant') {
        recommendations.push({
          text: 'Implement closed-loop water recycling—local water availability is limited',
          priority: 'high'
        });
      }
      break;

    case 'manufacturing':
      if (historicalData.extremeHeatDays > 30) {
        recommendations.push({
          text: `Install industrial cooling—${historicalData.extremeHeatDays} extreme heat days will impact worker productivity 2-3%/°C`,
          priority: 'high'
        });
        recommendations.push({
          text: 'Design shift schedules to avoid peak heat hours (11am-3pm) during hot months',
          priority: 'medium'
        });
      }
      if (historicalData.floodRisk !== 'low') {
        recommendations.push({
          text: 'Elevate critical equipment and electrical systems above historical flood levels',
          priority: 'medium'
        });
      }
      break;

    case 'transport':
      if (historicalData.extremeHeatDays > 40) {
        recommendations.push({
          text: 'Specify heat-resistant asphalt (polymer-modified) for road surfaces',
          priority: 'high'
        });
      }
      if (historicalData.floodRisk === 'high') {
        recommendations.push({
          text: 'Design bridges and culverts for 1-in-50 year flood capacity with climate uplift',
          priority: 'high'
        });
      }
      if (historicalData.precipitationVariability > 25) {
        recommendations.push({
          text: 'Include robust drainage infrastructure—rainfall patterns are highly variable',
          priority: 'medium'
        });
      }
      break;
  }

  // Universal recommendations based on climate risks
  if (recommendations.length === 0) {
    if (historicalData.droughtRisk === 'high') {
      recommendations.push({
        text: 'Develop water contingency plan—drought risk is elevated',
        priority: 'medium'
      });
    }
    if (historicalData.floodRisk === 'high') {
      recommendations.push({
        text: 'Include flood resilience measures in project design',
        priority: 'medium'
      });
    }
  }

  return recommendations.slice(0, 4); // Max 4 recommendations
}

// Generate project-adapted context summary
function generateProjectContext(
  sector: string | undefined,
  locationRisk: LocationRiskData | undefined,
  countryName: string | undefined
): string {
  if (!locationRisk || !sector) return '';

  const { historicalData, overallRiskScore, siteIntelligence } = locationRisk;
  const resilience = 100 - overallRiskScore;
  const location = locationRisk.coordinates.locationName || countryName || 'this location';

  // Sector-specific context
  const contexts: Record<string, () => string> = {
    energy: () => {
      const solar = siteIntelligence.solarPotential || 5;
      const heatDays = historicalData.extremeHeatDays;
      if (solar >= 4.5 && heatDays < 30) {
        return `${location} offers excellent conditions for solar energy projects. With ${solar} kWh/m²/day solar irradiance (above World Bank's 4.5 threshold) and only ${heatDays} extreme heat days annually, your project benefits from strong generation potential with minimal thermal derating.`;
      } else if (solar >= 4.5) {
        return `${location} has strong solar resources at ${solar} kWh/m²/day, but ${heatDays} extreme heat days per year will require heat-tolerant equipment. Factor in 5-8% panel derating during peak summer months.`;
      }
      return `${location} has ${solar} kWh/m²/day solar potential. While commercially viable, consider bifacial panels or tracking systems to maximize output.`;
    },
    agriculture: () => {
      const rainfall = historicalData.annualPrecipitation;
      const wetMonths = 12 - historicalData.drySeasonMonths.length;
      const water = siteIntelligence.waterAvailability;
      if (rainfall >= 800 && wetMonths >= 6) {
        return `${location} is well-suited for agricultural projects. With ${rainfall}mm annual rainfall (above FAO's 800mm maize threshold) and a ${wetMonths}-month growing season, rainfed farming is viable for most food crops.`;
      } else if (rainfall >= 500) {
        return `${location} receives ${rainfall}mm annual rainfall—marginal for maize but suitable for sorghum and millet. A ${wetMonths}-month growing window means single-cycle crops or irrigation will be needed for year-round production.`;
      }
      return `${location} receives only ${rainfall}mm annual rainfall. This is below FAO thresholds for most crops. Full irrigation infrastructure is essential—budget $3,000-5,000/hectare.`;
    },
    mining: () => {
      const dryMonths = historicalData.drySeasonMonths.length;
      const floodRisk = historicalData.floodRisk;
      if (dryMonths >= 6 && floodRisk === 'low') {
        return `${location} offers favorable conditions for mining operations. A ${dryMonths}-month dry season provides ample time for construction and earthworks, with low flood risk for pit operations.`;
      } else if (floodRisk === 'high') {
        return `${location} has elevated flood risk that will require robust drainage infrastructure. Plan for ${dryMonths} months of optimal operating conditions, with weather contingencies for the wet season.`;
      }
      return `${location} has a ${dryMonths}-month dry season. Schedule heavy civil works and critical operations during this window to minimize weather disruptions.`;
    },
    manufacturing: () => {
      const heatDays = historicalData.extremeHeatDays;
      if (heatDays > 30) {
        return `${location} experiences ${heatDays} extreme heat days annually. ILO data shows 2-3% productivity drop per °C above comfortable levels. Budget for cooling systems and heat management protocols.`;
      }
      return `${location} has a moderate temperature profile with ${heatDays} extreme heat days annually. Standard industrial equipment and work schedules should be appropriate year-round.`;
    },
    transport: () => {
      const floodRisk = historicalData.floodRisk;
      const heatDays = historicalData.extremeHeatDays;
      return `${location} infrastructure planning should account for ${floodRisk} flood risk and ${heatDays} extreme heat days annually. Design road surfaces and structures for local climate conditions.`;
    }
  };

  const getContext = contexts[sector];
  if (getContext) {
    return getContext();
  }

  // Default context
  return `${location} has a ${resilience}% climate resilience score. Review the insights below to understand how local conditions may affect your project operations and design.`;
}

export function LocationProfileCard({
  locationRisk,
  countryInfo,
  country,
  countryName,
  sector,
  projectName,
  projectDescription
}: LocationProfileCardProps) {
  const [climateModalOpen, setClimateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // AI insights state - only fetched once per session
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch AI insights when modal opens (only once)
  const fetchAIInsights = useCallback(async () => {
    if (hasFetched || !locationRisk || !sector) return;

    setAiLoading(true);
    setAiError(null);
    setHasFetched(true);

    try {
      const response = await fetch('/api/location-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sector,
          country: country || countryName,
          locationName: locationRisk.coordinates.locationName || countryName,
          historicalData: locationRisk.historicalData,
          siteIntelligence: locationRisk.siteIntelligence,
          projections: locationRisk.projections,
          projectName,
          projectDescription
        })
      });

      const data = await response.json();

      if (data.success && data.insights) {
        setAiInsights(data.insights);
      } else {
        setAiError(data.error || 'Failed to generate insights');
      }
    } catch (err) {
      setAiError('Network error - using fallback insights');
    } finally {
      setAiLoading(false);
    }
  }, [hasFetched, locationRisk, sector, country, countryName, projectName, projectDescription]);

  // Trigger fetch when modal opens
  useEffect(() => {
    if (climateModalOpen && !hasFetched && locationRisk && sector) {
      fetchAIInsights();
    }
  }, [climateModalOpen, hasFetched, locationRisk, sector, fetchAIInsights]);

  // Show card even if only country/countryName is available
  const hasAnyData = locationRisk || countryInfo || country || countryName;
  if (!hasAnyData) return null;

  const heroInsight = locationRisk?.keyInsights?.[0];
  const otherInsights = locationRisk?.keyInsights?.slice(1) || [];
  const resilience = locationRisk ? 100 - locationRisk.overallRiskScore : 0;
  const projectContext = generateProjectContext(sector, locationRisk, countryName);
  const projectRecommendations = generateProjectRecommendations(sector, locationRisk);

  return (
    <>
      {/* Sidebar Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Location Profile</h2>
            <p className="text-xs text-gray-500">
              {locationRisk?.coordinates.locationName || countryName || country}
            </p>
          </div>
          {locationRisk && (
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className={`text-lg font-semibold leading-none ${
                  resilience >= 70 ? 'text-verdex-600' :
                  resilience >= 40 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {resilience}%
                </div>
                <div className="text-[9px] text-gray-400 uppercase tracking-wide">Resilience</div>
              </div>
              <button
                onClick={() => setClimateModalOpen(true)}
                className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                title="View Climate Intelligence"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="px-4 py-3">
          {countryInfo && (
            <dl className="space-y-2 text-xs">
              <div className="flex justify-between">
                <dt className="text-gray-400">Region</dt>
                <dd className="font-medium text-gray-700 capitalize">{countryInfo.region?.replace('_', ' ') || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Legal System</dt>
                <dd className="font-medium text-gray-700 capitalize">{countryInfo.legalSystem?.replace('_', ' ') || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Currency</dt>
                <dd className="font-medium text-gray-700">{countryInfo.currency || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Sovereign Rating</dt>
                <dd className="font-medium text-gray-700">{countryInfo.sovereignRating || 'N/A'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Political Risk</dt>
                <dd className={`font-medium capitalize ${
                  countryInfo.politicalRisk === 'low' ? 'text-verdex-600' :
                  countryInfo.politicalRisk === 'medium' ? 'text-amber-600' : 'text-rose-600'
                }`}>{countryInfo.politicalRisk || 'N/A'}</dd>
              </div>
              {countryInfo.ndcTarget && (
                <div className="pt-2 border-t border-gray-100">
                  <dt className="text-[10px] text-gray-400 mb-0.5">NDC Target</dt>
                  <dd className="text-[11px] text-verdex-600">{countryInfo.ndcTarget}</dd>
                </div>
              )}
            </dl>
          )}

          {locationRisk && (
            <div className={`grid grid-cols-2 gap-2 ${countryInfo ? 'mt-3 pt-3 border-t border-gray-100' : ''}`}>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-sm font-semibold text-gray-900">{locationRisk.historicalData.averageTemperature}°C</p>
                <p className="text-[10px] text-gray-500">Avg Temp</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-sm font-semibold text-gray-900">{locationRisk.historicalData.annualPrecipitation}mm</p>
                <p className="text-[10px] text-gray-500">Rainfall</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className={`text-sm font-semibold ${
                  locationRisk.siteIntelligence.waterAvailability === 'abundant' ? 'text-verdex-600' :
                  locationRisk.siteIntelligence.waterAvailability === 'moderate' ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {locationRisk.siteIntelligence.waterAvailability.charAt(0).toUpperCase() +
                   locationRisk.siteIntelligence.waterAvailability.slice(1)}
                </p>
                <p className="text-[10px] text-gray-500">Water</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2 text-center">
                <p className="text-sm font-semibold text-gray-900">{locationRisk.historicalData.extremeHeatDays}</p>
                <p className="text-[10px] text-gray-500">Heat Days</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modern Climate Intelligence Modal */}
      {mounted && climateModalOpen && locationRisk && createPortal(
        (<div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={() => setClimateModalOpen(false)}
        >
          <div
            className="bg-gradient-to-b from-gray-50 to-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Minimal Header */}
            <div className="flex justify-between items-start p-6 pb-0">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Climate Intelligence</p>
                <h3 className="text-xl font-semibold text-gray-900 mt-1">
                  {locationRisk.coordinates.locationName || country}
                </h3>
                {sector && (
                  <p className="text-sm text-gray-500 mt-0.5">{sector.charAt(0).toUpperCase() + sector.slice(1)} Project</p>
                )}
              </div>
              <button
                onClick={() => setClimateModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors -mr-2 -mt-2"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-auto">
              <div className="p-6 space-y-6">

                {/* AI-GENERATED PROJECT CONTEXT */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      {aiLoading ? (
                        <div className="w-5 h-5 border-2 border-verdex-200 border-t-verdex-600 rounded-full animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1.5">
                        Project Suitability Assessment
                        {aiInsights && <span className="ml-2 text-[10px] font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">AI</span>}
                      </h4>
                      {aiLoading ? (
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {aiInsights?.projectContext || projectContext}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* AI KEY RISK & OPPORTUNITY - Compact */}
                {!aiLoading && aiInsights && (
                  <div className="grid grid-cols-2 gap-2">
                    {/* Key Risk */}
                    <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        <h5 className="text-[10px] font-semibold text-rose-700 uppercase tracking-wide">Risk</h5>
                      </div>
                      <p className="text-xs font-medium text-rose-900 leading-tight">{aiInsights.keyRisk.headline}</p>
                      <p className="text-[11px] text-rose-600 mt-1">→ {aiInsights.keyRisk.mitigation}</p>
                    </div>

                    {/* Opportunity */}
                    <div className="bg-verdex-50 rounded-lg p-3 border border-verdex-100">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-verdex-500" />
                        <h5 className="text-[10px] font-semibold text-verdex-700 uppercase tracking-wide">Opportunity</h5>
                      </div>
                      <p className="text-xs font-medium text-verdex-900 leading-tight">{aiInsights.opportunity.headline}</p>
                      <p className="text-[11px] text-verdex-600 mt-1">{aiInsights.opportunity.detail}</p>
                    </div>
                  </div>
                )}

                {/* HERO INSIGHT - The Main AHA */}
                {heroInsight && (
                  <div className={`relative overflow-hidden rounded-2xl p-6 ${
                    heroInsight.severity === 'positive'
                      ? 'bg-gradient-to-br from-emerald-600 to-teal-700'
                      : heroInsight.severity === 'caution'
                      ? 'bg-gradient-to-br from-amber-600 to-orange-700'
                      : 'bg-gradient-to-br from-slate-600 to-slate-700'
                  }`}>
                    <div className="relative">
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${
                          heroInsight.severity === 'positive' ? 'bg-white/20' :
                          heroInsight.severity === 'caution' ? 'bg-black/10' : 'bg-white/10'
                        }`}>
                          <InsightIcon icon={heroInsight.icon} className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-white">{heroInsight.headline}</h4>
                          <p className="text-white/90 text-sm mt-2 leading-relaxed">{heroInsight.detail}</p>
                          {heroInsight.action && (
                            <div className={`mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg ${
                              heroInsight.severity === 'positive' ? 'bg-white/20' :
                              heroInsight.severity === 'caution' ? 'bg-black/15' : 'bg-white/10'
                            }`}>
                              <span className="text-sm font-medium text-white">→ {heroInsight.action}</span>
                            </div>
                          )}
                          {heroInsight.source && (
                            <p className="text-white/60 text-xs mt-3">Source: {heroInsight.source}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* OTHER INSIGHTS - Compact cards */}
                {otherInsights.length > 0 && (
                  <div className="space-y-3">
                    {otherInsights.map((insight, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-4 p-4 rounded-xl border ${
                          insight.severity === 'positive'
                            ? 'bg-verdex-50/50 border-verdex-100'
                            : insight.severity === 'caution'
                            ? 'bg-amber-50/50 border-amber-100'
                            : 'bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          insight.severity === 'positive' ? 'bg-verdex-100 text-verdex-600' :
                          insight.severity === 'caution' ? 'bg-amber-100 text-amber-600' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                          <InsightIcon icon={insight.icon} className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-gray-900 text-sm">{insight.headline}</h5>
                          <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{insight.detail}</p>
                          {insight.action && (
                            <p className="text-xs font-medium text-gray-700 mt-2 flex items-center gap-1">
                              <span className="text-gray-400">→</span> {insight.action}
                            </p>
                          )}
                          {insight.source && (
                            <p className="text-[10px] text-gray-400 mt-1.5">Source: {insight.source}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* EXPANDABLE DETAILS */}
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center justify-between w-full text-left group"
                  >
                    <span className="text-sm font-medium text-gray-700">Climate Data & Projections</span>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showDetails && (
                    <div className="mt-4 space-y-4">
                      {/* Climate Projections - Simplified */}
                      {locationRisk.projections.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-100 p-4">
                          <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">2050 Outlook</h5>
                          <div className="grid grid-cols-2 gap-4">
                            {locationRisk.projections
                              .filter(p => p.year === 2050)
                              .map((proj, idx) => (
                              <div key={idx} className="text-center">
                                <p className="text-xs text-gray-400 mb-1">{proj.scenario}</p>
                                <p className={`text-lg font-bold ${
                                  proj.temperatureChange > 2 ? 'text-rose-600' :
                                  proj.temperatureChange > 1 ? 'text-amber-600' : 'text-verdex-600'
                                }`}>
                                  {proj.temperatureChange > 0 ? '+' : ''}{proj.temperatureChange}°C
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {proj.precipitationChange > 0 ? '+' : ''}{proj.precipitationChange}% rain
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* AI or Fallback Recommendations */}
                      {(aiInsights?.recommendations?.length || projectRecommendations.length > 0) && (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                            {sector ? `${sector.charAt(0).toUpperCase() + sector.slice(1)} Project Recommendations` : 'Recommendations'}
                            {aiInsights && <span className="text-[10px] font-normal text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">AI</span>}
                          </h5>
                          <ul className="space-y-2">
                            {(aiInsights?.recommendations || projectRecommendations).map((rec, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  rec.priority === 'high' ? 'bg-rose-500' :
                                  rec.priority === 'medium' ? 'bg-amber-500' : 'bg-gray-400'
                                }`} />
                                <span className="text-xs text-gray-700">{rec.text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sources & Methodology */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Sources & Methodology</h5>
                        <div className="space-y-3 text-xs text-gray-600">
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Climate Data</p>
                            <ul className="space-y-0.5 text-[11px]">
                              <li>• Historical: <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Open-Meteo Archive API</a> (10-year average)</li>
                              <li>• Projections: <a href="https://open-meteo.com/en/docs/climate-api" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">CMIP6 Climate Models</a> (SSP2-4.5, SSP5-8.5)</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-gray-700 mb-1">Threshold Standards</p>
                            <ul className="space-y-0.5 text-[11px]">
                              <li>• Rainfall: <a href="https://www.fao.org/4/S2022E/s2022e07.htm" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">FAO Paper 56</a> + ICRISAT/FAO (1996)</li>
                              <li>• Solar: <a href="https://documents1.worldbank.org/curated/en/466331592817725242/pdf/Global-Photovoltaic-Power-Potential-by-Country.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">World Bank Global PV Potential (2020)</a></li>
                              <li>• Heat: <a href="https://www.ilo.org/sites/default/files/wcmsp5/groups/public/@dgreports/@dcomm/@publ/documents/publication/wcms_711919.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ILO Working on a Warmer Planet (2019)</a></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
              <p className="text-xs text-gray-400 text-center">
                Data: Open-Meteo CMIP6 · Thresholds: FAO, World Bank, ILO · Updated {new Date(locationRisk.assessmentDate).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>),
        document.body
      )}
    </>
  );
}
