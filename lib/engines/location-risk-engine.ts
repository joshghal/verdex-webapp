// Location Risk Engine
// Provides climate resilience assessment and site intelligence
//
// ============================================
// API SOURCES
// ============================================
// - Open-Meteo Historical Weather API: https://open-meteo.com/en/docs/historical-weather-api
//   Free, no authentication required, CC BY 4.0 license
// - Open-Meteo Climate API: https://open-meteo.com/en/docs/climate-api
//   CMIP6 climate projections, SSP scenarios
//
// ============================================
// SCIENTIFIC REFERENCES (CLIMATE PROJECTIONS)
// ============================================
// - SSP Scenarios: O'Neill et al. (2016), Nature Climate Change
//   https://www.nature.com/articles/nclimate3071
// - IPCC AR6 Africa Chapter for regional context
//   https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-9/
//
// ============================================
// THRESHOLD CITATIONS
// ============================================
//
// RAINFALL THRESHOLDS (Agriculture):
// - ICRISAT & FAO (1996): Minimum 300mm/yr for millets, 350-400mm/yr for sorghum
//   Source: https://ecoevorxiv.org/repository/object/4352/download/8739/
// - FAO Irrigation & Drainage Paper 56: Maize 500-800mm/growing season
//   Source: https://www.fao.org/4/S2022E/s2022e07.htm
// - 800mm threshold: Standard for rainfed maize and most food crops in Africa
//   Derived from FAO crop water requirement ranges
// - 1200mm+: Water-secure threshold for water-intensive perennial crops
//
// SOLAR IRRADIANCE (Energy):
// - World Bank Global PV Potential Study (2020):
//   <3.5 kWh/kWp = poor conditions
//   3.5-4.5 kWh/kWp = favorable middle range (71% of global population)
//   >4.5 kWh/kWp = excellent conditions (~70 countries, mostly Africa/Middle East)
//   Source: https://documents1.worldbank.org/curated/en/466331592817725242/pdf/Global-Photovoltaic-Power-Potential-by-Country.pdf
// - Africa typical range: 4-7 kWh/m²/day (Sub-Saharan Africa)
//   Source: https://www.mdpi.com/1996-1073/16/23/7708
//
// HEAT STRESS (Occupational Health):
// - ILO "Working on a Warmer Planet" (2019): 2-3% productivity drop per °C above 20°C WBGT
//   Source: https://www.ilo.org/sites/default/files/wcmsp5/groups/public/@dgreports/@dcomm/@publ/documents/publication/wcms_711919.pdf
// - WHO/WMO Workplace Heat Stress Guidance: WBGT 26-30°C = work capacity rapidly reduces
//   Source: https://www.who.int/news-room/questions-and-answers/item/workplace-heat-stress
// - 35°C air temperature: Corresponds to dangerous WBGT levels in humid tropical conditions
//   National regulatory thresholds: 29-30°C WBGT for high-intensity work
//   Source: https://pmc.ncbi.nlm.nih.gov/articles/PMC10434255/
//
// ============================================
// FRAMING: "Resilience Proof" - shows projects designed FOR African climate
// ============================================

import type {
  AfricanCountry,
  Sector,
  RiskLevel,
  LocationRiskAssessment,
  HistoricalClimateData,
  ClimateProjection,
  ClimateRiskMetric,
  SiteIntelligence,
  ClimateScenario,
  ProjectionYear,
  KeyInsight
} from '../types';

import { getCoordinates, COUNTRY_CLIMATE_ZONES } from '../data/african-coordinates';

// Open-Meteo API endpoints (free, no auth required)
const OPEN_METEO_HISTORICAL = 'https://archive-api.open-meteo.com/v1/archive';
const OPEN_METEO_CLIMATE = 'https://climate-api.open-meteo.com/v1/climate';

interface OpenMeteoHistoricalResponse {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
  };
}

interface OpenMeteoClimateResponse {
  daily: {
    time: string[];
    temperature_2m_mean: number[];
    precipitation_sum: number[];
  };
}

/**
 * Fetch 10-year historical climate data from Open-Meteo
 * Uses the Archive API which has data from 1940 to present
 */
async function fetchHistoricalClimateData(
  lat: number,
  lon: number
): Promise<HistoricalClimateData> {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setFullYear(endDate.getFullYear() - 10);

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lon.toString(),
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    timezone: 'auto'
  });

  try {
    const response = await fetch(`${OPEN_METEO_HISTORICAL}?${params}`);

    if (!response.ok) {
      throw new Error(`Open-Meteo API error: ${response.status}`);
    }

    const data: OpenMeteoHistoricalResponse = await response.json();

    // Calculate statistics from daily data
    const temps = data.daily.temperature_2m_max.map((max, i) =>
      (max + data.daily.temperature_2m_min[i]) / 2
    );
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const tempVariability = calculateStdDev(temps);

    const precipitation = data.daily.precipitation_sum.filter(p => p !== null);
    const annualPrecip = precipitation.reduce((a, b) => a + (b || 0), 0) / 10; // 10-year average
    const precipVariability = calculateStdDev(precipitation.filter(p => p > 0));

    // Count extreme heat days (>35°C)
    const extremeHeatDays = Math.round(
      data.daily.temperature_2m_max.filter(t => t > 35).length / 10
    );

    // Calculate monthly averages to identify dry season
    const monthlyPrecip = calculateMonthlyAverages(
      data.daily.precipitation_sum,
      data.daily.time
    );

    // Use RELATIVE threshold: dry months are below 25th percentile of location's own rainfall
    // This works for both tropical (1500mm+) and semi-arid (400mm) climates
    const monthlyValues = Object.values(monthlyPrecip).sort((a, b) => a - b);
    const p25Threshold = monthlyValues[Math.floor(monthlyValues.length * 0.25)] || 30;
    // Also apply minimum threshold: at least 30mm difference from wettest month
    const maxMonthly = Math.max(...monthlyValues);
    const adaptiveThreshold = Math.max(p25Threshold, maxMonthly * 0.3); // 30% of peak = dry

    const dryMonths = Object.entries(monthlyPrecip)
      .filter(([_, precip]) => precip < adaptiveThreshold)
      .map(([month]) => parseInt(month));

    // Determine risk levels based on thresholds
    const droughtRisk: RiskLevel = annualPrecip < 500 ? 'high' : annualPrecip < 800 ? 'medium' : 'low';
    const floodRisk: RiskLevel = precipVariability > 50 ? 'high' : precipVariability > 30 ? 'medium' : 'low';

    return {
      averageTemperature: Math.round(avgTemp * 10) / 10,
      temperatureVariability: Math.round(tempVariability * 10) / 10,
      annualPrecipitation: Math.round(annualPrecip),
      precipitationVariability: Math.round(precipVariability * 10) / 10,
      drySeasonMonths: dryMonths,
      extremeHeatDays,
      droughtRisk,
      floodRisk
    };

  } catch (error) {
    console.error('[Location Risk] Historical data fetch failed:', error);
    throw error;
  }
}

/**
 * Fetch climate projections from Open-Meteo Climate API
 * Uses CMIP6 models with SSP scenarios
 *
 * @param historicalBaseline - Actual historical data for this location (used for accurate delta calculation)
 */
async function fetchClimateProjections(
  lat: number,
  lon: number,
  historicalBaseline: HistoricalClimateData
): Promise<ClimateProjection[]> {
  const projections: ClimateProjection[] = [];

  // Use EC_Earth3P_HR model - good for Africa (European Centre model)
  // Fetch SSP2-4.5 (middle of the road) and SSP5-8.5 (high emissions)
  const scenarios: Array<{ ssp: ClimateScenario; model: string }> = [
    { ssp: 'SSP2-4.5', model: 'EC_Earth3P_HR' },
    { ssp: 'SSP5-8.5', model: 'EC_Earth3P_HR' }
  ];

  // Use ACTUAL historical data as baseline, not hardcoded values
  const baselineTemp = historicalBaseline.averageTemperature;
  const baselinePrecip = historicalBaseline.annualPrecipitation;

  for (const { ssp, model } of scenarios) {
    for (const year of [2030, 2050] as ProjectionYear[]) {
      try {
        const startDate = `${year}-01-01`;
        const endDate = `${year}-12-31`;

        const params = new URLSearchParams({
          latitude: lat.toString(),
          longitude: lon.toString(),
          start_date: startDate,
          end_date: endDate,
          models: model,
          daily: 'temperature_2m_mean,precipitation_sum'
        });

        const response = await fetch(`${OPEN_METEO_CLIMATE}?${params}`);

        if (!response.ok) {
          console.warn(`[Location Risk] Climate projection fetch failed for ${ssp} ${year}`);
          continue;
        }

        const data: OpenMeteoClimateResponse = await response.json();

        if (data.daily?.temperature_2m_mean?.length > 0) {
          const avgTemp = data.daily.temperature_2m_mean.reduce((a, b) => a + b, 0) /
            data.daily.temperature_2m_mean.length;
          const totalPrecip = data.daily.precipitation_sum.reduce((a, b) => a + (b || 0), 0);

          // Calculate change relative to actual historical baseline
          let tempChange = avgTemp - baselineTemp;
          const precipChange = baselinePrecip > 0
            ? ((totalPrecip - baselinePrecip) / baselinePrecip) * 100
            : 0;

          // VALIDATION: CMIP6 API sometimes returns bad data (near-zero temps)
          // If temperature change is unrealistic (< -5 or > 8°C), use IPCC AR6 estimates
          // AR6 Africa: +0.8-1.1°C by 2030, +1.5-3.5°C by 2050 depending on scenario
          if (tempChange < -5 || tempChange > 8) {
            console.warn(`[Location Risk] Invalid temp change ${tempChange}°C for ${ssp} ${year}, using IPCC estimate`);
            if (ssp === 'SSP2-4.5') {
              tempChange = year === 2030 ? 0.9 : 1.8;
            } else { // SSP5-8.5
              tempChange = year === 2030 ? 1.1 : 2.7;
            }
          }

          projections.push({
            scenario: ssp,
            year,
            temperatureChange: Math.round(tempChange * 10) / 10,
            precipitationChange: Math.round(Math.max(-50, Math.min(50, precipChange))), // Clamp to reasonable range
            extremeEventFrequency: ssp === 'SSP5-8.5' ? (year === 2050 ? 1.8 : 1.4) : (year === 2050 ? 1.4 : 1.2)
          });
        }

      } catch (error) {
        console.warn(`[Location Risk] Projection error for ${ssp} ${year}:`, error);
      }
    }
  }

  return projections;
}

/**
 * Generate sector-specific climate risk metrics
 */
function generateRiskMetrics(
  historical: HistoricalClimateData,
  projections: ClimateProjection[],
  sector: Sector
): ClimateRiskMetric[] {
  const metrics: ClimateRiskMetric[] = [];

  // Heat Stress Risk (all sectors)
  metrics.push({
    indicator: 'Heat Stress Days',
    value: historical.extremeHeatDays,
    unit: 'days/year >35°C',
    trend: 'increasing',
    riskLevel: historical.extremeHeatDays > 30 ? 'high' : historical.extremeHeatDays > 15 ? 'medium' : 'low',
    description: 'Days with extreme heat affecting operations and worker safety'
  });

  // Water Availability (all sectors)
  metrics.push({
    indicator: 'Annual Rainfall',
    value: historical.annualPrecipitation,
    unit: 'mm/year',
    trend: historical.droughtRisk === 'high' ? 'decreasing' : 'stable',
    riskLevel: historical.droughtRisk,
    description: 'Annual precipitation affecting water-dependent operations'
  });

  // Sector-specific metrics
  if (sector === 'energy') {
    const solarPotential = estimateSolarPotential(historical);
    metrics.push({
      indicator: 'Solar Potential',
      value: solarPotential,
      unit: 'kWh/m²/day',
      trend: 'stable',
      riskLevel: 'low', // Higher is better
      description: 'Daily solar irradiance potential for PV installations'
    });
  }

  if (sector === 'agriculture') {
    metrics.push({
      indicator: 'Dry Season Length',
      value: historical.drySeasonMonths.length,
      unit: 'months',
      trend: 'stable',
      riskLevel: historical.drySeasonMonths.length > 6 ? 'high' : historical.drySeasonMonths.length > 4 ? 'medium' : 'low',
      description: 'Duration of dry season affecting crop cycles'
    });
  }

  if (sector === 'mining') {
    metrics.push({
      indicator: 'Flood Risk',
      value: historical.precipitationVariability,
      unit: 'variability index',
      trend: 'increasing',
      riskLevel: historical.floodRisk,
      description: 'Precipitation variability affecting site operations'
    });
  }

  // Climate projection metric
  const worstCase = projections.find(p => p.scenario === 'SSP5-8.5' && p.year === 2050);
  if (worstCase) {
    metrics.push({
      indicator: '2050 Temperature Rise',
      value: worstCase.temperatureChange,
      unit: '°C above baseline',
      trend: 'increasing',
      riskLevel: worstCase.temperatureChange > 2 ? 'high' : worstCase.temperatureChange > 1 ? 'medium' : 'low',
      description: 'Projected warming by 2050 (SSP5-8.5 scenario)'
    });
  }

  return metrics;
}

/**
 * Generate site intelligence for developers
 */
function generateSiteIntelligence(
  historical: HistoricalClimateData,
  sector: Sector
): SiteIntelligence {
  // Determine optimal operating context based on sector
  let optimalMonths: number[];
  let operatingContext: string;

  const allMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const wetMonths = allMonths.filter(m => !historical.drySeasonMonths.includes(m));
  const dryMonths = historical.drySeasonMonths;

  if (sector === 'energy') {
    // Solar: dry season = more sun = better
    optimalMonths = dryMonths.length > 0 ? dryMonths : allMonths;
    operatingContext = dryMonths.length >= 6 ? 'year-round' : 'peak dry season';
  } else if (sector === 'agriculture') {
    // Agriculture: wet season = growing season
    optimalMonths = wetMonths.length > 0 ? wetMonths : allMonths;
    operatingContext = wetMonths.length > 0 ? `${wetMonths.length}-month growing season` : 'requires irrigation';
  } else if (sector === 'mining') {
    // Mining: dry season = easier operations
    optimalMonths = dryMonths.length > 0 ? dryMonths : allMonths;
    operatingContext = dryMonths.length >= 6 ? 'year-round' : 'dry season preferred';
  } else {
    optimalMonths = allMonths;
    operatingContext = 'year-round';
  }

  return {
    optimalOperatingMonths: optimalMonths,
    operatingContext,
    waterAvailability: historical.annualPrecipitation > 1000 ? 'abundant' :
      historical.annualPrecipitation > 500 ? 'moderate' : 'scarce',
    solarPotential: sector === 'energy' ? estimateSolarPotential(historical) : undefined,
    agriculturalSuitability: sector === 'agriculture' ?
      determineAgriculturalSuitability(historical) : undefined
  };
}

/**
 * Generate KEY INSIGHTS - the "AHAA!" moments
 * Decision-relevant information with specific thresholds and actions
 *
 * All thresholds are cited from authoritative sources - see header comments for full citations.
 */
function generateKeyInsights(
  historical: HistoricalClimateData,
  projections: ClimateProjection[],
  sector: Sector,
  country: AfricanCountry
): KeyInsight[] {
  const insights: KeyInsight[] = [];
  const rainfall = historical.annualPrecipitation;
  const heatDays = historical.extremeHeatDays;
  const dryMonths = historical.drySeasonMonths.length;
  const wetMonths = 12 - dryMonths;

  // ============================================
  // WATER/IRRIGATION INSIGHT (Agriculture)
  // Thresholds from ICRISAT/FAO (1996) and FAO Paper 56
  // ============================================
  if (sector === 'agriculture') {
    if (rainfall < 500) {
      insights.push({
        icon: 'water',
        headline: 'Full Irrigation Required',
        detail: `${rainfall}mm annual rainfall is below the FAO 500mm minimum for rainfed maize. Only drought-tolerant millets (300mm min) may survive without irrigation.`,
        action: 'Budget $3,000-5,000/hectare for full irrigation; consider sorghum/millet if water-limited',
        severity: 'caution',
        source: 'FAO Paper 56, ICRISAT/FAO 1996'
      });
    } else if (rainfall < 800) {
      insights.push({
        icon: 'water',
        headline: 'Supplemental Irrigation Needed',
        detail: `${rainfall}mm rainfall is marginal for maize (FAO range: 500-800mm). Suitable for sorghum (350mm min) and millet (300mm min) rainfed.`,
        action: 'Drip irrigation recommended: $2,000-3,500/hectare. Or switch to drought-tolerant crops.',
        severity: 'caution',
        source: 'FAO Paper 56'
      });
    } else if (rainfall < 1200) {
      insights.push({
        icon: 'water',
        headline: 'Adequate Rainfall',
        detail: `${rainfall}mm annual rainfall exceeds FAO maize threshold (800mm). Rainfed agriculture viable for most food crops.`,
        action: 'Rainwater harvesting ($500-1,000/ha) adds drought resilience for dry spells',
        severity: 'neutral',
        source: 'FAO Paper 56'
      });
    } else {
      insights.push({
        icon: 'check',
        headline: 'Strong Water Security',
        detail: `${rainfall}mm annual rainfall supports water-intensive and perennial crops. Drainage may be more important than irrigation.`,
        action: 'Focus on drainage infrastructure rather than irrigation systems',
        severity: 'positive',
        source: 'FAO Paper 56'
      });
    }
  }

  // ============================================
  // SOLAR POTENTIAL INSIGHT (Energy)
  // Thresholds from World Bank Global PV Potential Study (2020)
  // ============================================
  if (sector === 'energy') {
    const solarPotential = estimateSolarPotential(historical);
    if (solarPotential >= 4.5) {
      insights.push({
        icon: 'sun',
        headline: 'Excellent Solar Resource',
        detail: `${solarPotential} kWh/m²/day exceeds World Bank "excellent" threshold (4.5 kWh/kWp). Africa typical: 4-7 kWh/m²/day.`,
        action: 'Standard mono-PERC panels cost-effective. Expected capacity factor: 18-22%.',
        severity: 'positive',
        source: 'World Bank Global PV Potential 2020'
      });
    } else if (solarPotential >= 3.5) {
      insights.push({
        icon: 'sun',
        headline: 'Favorable Solar Resource',
        detail: `${solarPotential} kWh/m²/day is in World Bank "favorable" range (3.5-4.5 kWh/kWp). Commercially viable.`,
        action: 'Bifacial panels can increase yield by 5-10%. Expected capacity factor: 15-18%.',
        severity: 'neutral',
        source: 'World Bank Global PV Potential 2020'
      });
    } else {
      insights.push({
        icon: 'warning',
        headline: 'Below-Average Solar Resource',
        detail: `${solarPotential} kWh/m²/day is below World Bank threshold (3.5 kWh/kWp). Unusual for Africa.`,
        action: 'Consider wind or hybrid systems. If solar-only: use high-efficiency panels.',
        severity: 'caution',
        source: 'World Bank Global PV Potential 2020'
      });
    }
  }

  // ============================================
  // GROWING SEASON INSIGHT (Agriculture)
  // ============================================
  if (sector === 'agriculture') {
    if (wetMonths >= 6) {
      insights.push({
        icon: 'calendar',
        headline: `${wetMonths}-Month Growing Season`,
        detail: `Rainfall pattern supports ${wetMonths} months of active growth. Sufficient for 2 crop cycles per year.`,
        action: 'Plan first planting 2-3 weeks before wet season onset',
        severity: 'positive',
        source: 'Open-Meteo Historical Data'
      });
    } else if (wetMonths >= 3) {
      insights.push({
        icon: 'calendar',
        headline: `Short ${wetMonths}-Month Growing Window`,
        detail: `Limited to single-cycle crops or short-duration varieties (90-120 days).`,
        action: 'Select drought-tolerant varieties: sorghum (350mm min), millet (300mm min), early-maturing maize',
        severity: 'neutral',
        source: 'Open-Meteo Historical Data, ICRISAT'
      });
    } else {
      insights.push({
        icon: 'warning',
        headline: 'Minimal Rainy Season',
        detail: `Rainfall is evenly distributed or consistently low. Not suitable for rainfed agriculture.`,
        action: 'Full irrigation infrastructure required; consider greenhouse cultivation',
        severity: 'caution',
        source: 'Open-Meteo Historical Data'
      });
    }
  }

  // ============================================
  // HEAT STRESS INSIGHT (All sectors)
  // Thresholds from ILO (2019) and WHO/WMO
  // ============================================
  if (heatDays > 30) {
    insights.push({
      icon: 'temp',
      headline: 'High Heat Exposure',
      detail: `${heatDays} days/year exceed 35°C. ILO data shows 2-3% productivity drop per °C above 20°C WBGT. Budget for heat mitigation.`,
      action: sector === 'energy'
        ? 'Specify inverters rated for 50°C ambient; expect 5-8% panel derating in peak heat'
        : 'ILO recommends rest periods when WBGT >26°C. Budget for heat shelters and hydration.',
      severity: 'caution',
      source: 'ILO Working on a Warmer Planet 2019'
    });
  } else if (heatDays > 0 && heatDays <= 30) {
    insights.push({
      icon: 'temp',
      headline: 'Manageable Heat Days',
      detail: `${heatDays} days/year exceed 35°C. Within manageable range with standard precautions.`,
      action: 'Standard heat safety protocols sufficient. No specialized equipment required.',
      severity: 'neutral',
      source: 'ILO/WHO Heat Stress Guidelines'
    });
  } else {
    insights.push({
      icon: 'temp',
      headline: 'Mild Temperature Profile',
      detail: `No extreme heat days (>35°C). Standard equipment and work schedules appropriate year-round.`,
      severity: 'positive',
      source: 'Open-Meteo Historical Data'
    });
  }

  // ============================================
  // CONSTRUCTION TIMING (Mining, Manufacturing)
  // ============================================
  if (sector === 'mining' || sector === 'manufacturing') {
    if (dryMonths >= 4) {
      insights.push({
        icon: 'calendar',
        headline: `${dryMonths}-Month Construction Window`,
        detail: `Dry season provides ${dryMonths} months of favorable conditions for earthworks and foundations.`,
        action: 'Schedule heavy civil works during dry months to avoid weather delays',
        severity: 'positive',
        source: 'Open-Meteo Historical Data'
      });
    } else {
      insights.push({
        icon: 'warning',
        headline: 'Limited Dry Season',
        detail: `Only ${dryMonths} months with low rainfall. Rain disruptions likely during construction.`,
        action: 'Include 15-20% weather contingency in construction timeline',
        severity: 'caution',
        source: 'Open-Meteo Historical Data'
      });
    }
  }

  // ============================================
  // CLIMATE TRAJECTORY INSIGHT
  // Based on IPCC AR6 projections
  // ============================================
  const worstCase = projections.find(p => p.scenario === 'SSP5-8.5' && p.year === 2050);
  if (worstCase && worstCase.temperatureChange > 2) {
    insights.push({
      icon: 'warning',
      headline: `+${worstCase.temperatureChange}°C by 2050`,
      detail: `IPCC SSP5-8.5 scenario projects ${worstCase.temperatureChange}°C warming. Design for future climate, not current.`,
      action: 'Specify equipment/varieties rated for +3°C above current baseline temperatures',
      severity: 'caution',
      source: 'IPCC AR6, CMIP6 Models'
    });
  }

  return insights.slice(0, 4);
}

/**
 * Generate resilience opportunities (positive framing)
 * Shows how climate context is an advantage, not just a risk
 *
 * Thresholds cited from World Bank, FAO, ILO sources - see header.
 */
function generateResilienceOpportunities(
  historical: HistoricalClimateData,
  projections: ClimateProjection[],
  sector: Sector,
  country: AfricanCountry
): string[] {
  const opportunities: string[] = [];
  const climateZone = COUNTRY_CLIMATE_ZONES[country];

  // Solar potential (energy sector) - World Bank threshold
  if (sector === 'energy') {
    const solarPotential = estimateSolarPotential(historical);
    if (solarPotential >= 4.5) {
      // World Bank "excellent" threshold
      opportunities.push(`Solar irradiance ${solarPotential} kWh/m²/day — exceeds World Bank 4.5 excellent threshold`);
    }
  }

  // Temperature advantage - ILO heat stress context
  if (historical.extremeHeatDays < 10) {
    opportunities.push(`Only ${historical.extremeHeatDays} extreme heat days/year — no special heat protocols needed`);
  }

  // Water availability - FAO context
  if (historical.annualPrecipitation > 1000) {
    opportunities.push(`${historical.annualPrecipitation}mm rainfall — exceeds FAO maize threshold (800mm)`);
  }

  // Regional context
  if (climateZone) {
    opportunities.push(`${climateZone.primaryZone} climate zone — established operational knowledge`);
  }

  // Future stability - IPCC AR6 context
  const midCentury = projections.find(p => p.year === 2050 && p.scenario === 'SSP2-4.5');
  if (midCentury && midCentury.temperatureChange < 2 && midCentury.temperatureChange > 0) {
    opportunities.push(`+${midCentury.temperatureChange}°C by 2050 (SSP2-4.5) — within Paris Agreement 2°C target`);
  }

  return opportunities.slice(0, 3);
}

/**
 * Generate sector-specific, actionable recommendations
 */
function generateRecommendations(
  historical: HistoricalClimateData,
  projections: ClimateProjection[],
  sector: Sector
): string[] {
  const recommendations: string[] = [];

  // Sector-specific recommendations first (most relevant)
  if (sector === 'energy') {
    recommendations.push('Design panel mounting for airflow (10cm+ clearance) to maintain efficiency in heat');
    if (historical.droughtRisk !== 'low') {
      recommendations.push('Install dry-cleaning systems for panels to minimize water dependence');
    }
    if (historical.extremeHeatDays > 15) {
      recommendations.push('Select heat-tolerant inverters rated for >45°C ambient temperature');
    }
  }

  if (sector === 'agriculture') {
    if (historical.drySeasonMonths.length > 4) {
      recommendations.push(`Plan planting cycles around ${12 - historical.drySeasonMonths.length}-month rainy season`);
    }
    if (historical.droughtRisk !== 'low') {
      recommendations.push('Install drip irrigation with soil moisture sensors to optimize water use');
    }
    recommendations.push('Select crop varieties tested for local temperature range and rainfall patterns');
  }

  if (sector === 'mining') {
    if (historical.floodRisk !== 'low') {
      recommendations.push('Design pit drainage capacity for peak rainfall events (100-year flood)');
    }
    if (historical.extremeHeatDays > 20) {
      recommendations.push('Implement heat stress protocols and adjust shift schedules for worker safety');
    }
    recommendations.push('Include water recycling in processing to reduce freshwater extraction');
  }

  if (sector === 'manufacturing' || sector === 'transport') {
    if (historical.extremeHeatDays > 15) {
      recommendations.push('Design facilities with passive cooling and natural ventilation');
    }
    recommendations.push('Incorporate backup power systems for grid instability during extreme weather');
  }

  // Generic climate-smart recommendations (if space)
  const worstCase = projections.find(p => p.scenario === 'SSP5-8.5' && p.year === 2050);
  if (worstCase && worstCase.temperatureChange > 1.5 && recommendations.length < 4) {
    recommendations.push(`Design infrastructure for +${Math.ceil(worstCase.temperatureChange)}°C warming by 2050`);
  }

  return recommendations.slice(0, 4);
}

/**
 * Calculate overall climate risk score (0-100, higher = more risk)
 */
function calculateOverallRiskScore(
  historical: HistoricalClimateData,
  projections: ClimateProjection[]
): number {
  let riskScore = 0;

  // Historical factors (50% weight)
  if (historical.droughtRisk === 'high') riskScore += 20;
  else if (historical.droughtRisk === 'medium') riskScore += 10;

  if (historical.floodRisk === 'high') riskScore += 15;
  else if (historical.floodRisk === 'medium') riskScore += 7;

  if (historical.extremeHeatDays > 30) riskScore += 15;
  else if (historical.extremeHeatDays > 15) riskScore += 8;

  // Projection factors (50% weight)
  const worstCase = projections.find(p => p.scenario === 'SSP5-8.5' && p.year === 2050);
  if (worstCase) {
    if (worstCase.temperatureChange > 3) riskScore += 25;
    else if (worstCase.temperatureChange > 2) riskScore += 15;
    else if (worstCase.temperatureChange > 1) riskScore += 8;

    if (Math.abs(worstCase.precipitationChange) > 30) riskScore += 15;
    else if (Math.abs(worstCase.precipitationChange) > 15) riskScore += 8;
  }

  return Math.min(100, riskScore);
}

// ============================================
// Helper Functions
// ============================================

function calculateStdDev(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
}

function calculateMonthlyAverages(values: number[], dates: string[]): Record<number, number> {
  const monthlyTotals: Record<number, number[]> = {};

  dates.forEach((date, i) => {
    const month = new Date(date).getMonth() + 1; // 1-12
    if (!monthlyTotals[month]) monthlyTotals[month] = [];
    monthlyTotals[month].push(values[i] || 0);
  });

  const averages: Record<number, number> = {};
  Object.entries(monthlyTotals).forEach(([month, vals]) => {
    averages[parseInt(month)] = vals.reduce((a, b) => a + b, 0) / vals.length;
  });

  return averages;
}

/**
 * Estimate solar potential based on climate data
 *
 * Methodology: Africa typical range 4-7 kWh/m²/day (MDPI Energy Status in Africa, 2023)
 * Base potential 5.5 kWh/m²/day for clear-sky tropical Africa, reduced by cloud cover proxy.
 * World Bank thresholds: <3.5 poor, 3.5-4.5 favorable, >4.5 excellent
 */
function estimateSolarPotential(historical: HistoricalClimateData): number {
  // Base potential for tropical Africa: 5.5 kWh/m²/day (middle of 4-7 range)
  // Cloud cover reduces potential (approximated from precipitation as proxy)
  const basePotential = 5.5;
  const cloudAdjustment = 1 - (historical.annualPrecipitation / 3000) * 0.3;
  // Minimum 3.5 (World Bank poor threshold) - rare in Africa
  return Math.round(Math.max(3.5, basePotential * cloudAdjustment) * 10) / 10;
}

/**
 * Determine agricultural suitability based on rainfall
 *
 * Thresholds from FAO Paper 56 and ICRISAT/FAO (1996):
 * - 1200mm+: Water-intensive/perennial crops
 * - 800mm: Comfortable for maize and most food crops
 * - 500-800mm: Marginal, suitable for sorghum/millet
 * - <500mm: Requires irrigation for most crops
 */
function determineAgriculturalSuitability(historical: HistoricalClimateData): string {
  if (historical.annualPrecipitation > 1200 && historical.drySeasonMonths.length < 4) {
    return 'High - suitable for perennial crops and intensive agriculture (>1200mm/yr)';
  } else if (historical.annualPrecipitation >= 800) {
    return 'Good - suitable for rainfed maize and food crops (FAO 800mm threshold)';
  } else if (historical.annualPrecipitation >= 500) {
    return 'Moderate - marginal for maize, suitable for sorghum/millet (FAO 500mm min)';
  }
  return 'Low - below FAO minimums, requires irrigation infrastructure';
}

// ============================================
// Main Export
// ============================================

/**
 * Assess location-based climate risk and resilience
 * Returns comprehensive climate profile with positive framing
 */
export async function assessLocationRisk(
  country: AfricanCountry,
  sector: Sector,
  city?: string
): Promise<LocationRiskAssessment> {
  const coords = getCoordinates(country, city);

  if (!coords) {
    throw new Error(`No coordinates found for ${city || country}`);
  }

  console.log(`[Location Risk] Fetching climate data for ${coords.name} (${coords.lat}, ${coords.lon})`);

  // Fetch historical data first (needed as baseline for projections)
  const historical = await fetchHistoricalClimateData(coords.lat, coords.lon);

  // Now fetch projections using historical data as baseline
  const projections = await fetchClimateProjections(coords.lat, coords.lon, historical);

  // Generate derived assessments
  const riskMetrics = generateRiskMetrics(historical, projections, sector);
  const siteIntelligence = generateSiteIntelligence(historical, sector);
  const keyInsights = generateKeyInsights(historical, projections, sector, country);
  const resilienceOpportunities = generateResilienceOpportunities(historical, projections, sector, country);
  const recommendations = generateRecommendations(historical, projections, sector);
  const overallRiskScore = calculateOverallRiskScore(historical, projections);

  return {
    coordinates: {
      latitude: coords.lat,
      longitude: coords.lon,
      locationName: coords.name
    },
    historicalData: historical,
    projections,
    riskMetrics,
    overallRiskScore,
    keyInsights,
    resilienceOpportunities,
    siteIntelligence,
    recommendations,
    dataSource: 'open-meteo',
    assessmentDate: new Date().toISOString()
  };
}
