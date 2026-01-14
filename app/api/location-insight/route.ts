import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/api-handler';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sector,
      country,
      locationName,
      historicalData,
      siteIntelligence,
      projections,
      projectName,
      projectDescription
    } = body;

    if (!sector || !country) {
      return NextResponse.json(
        { error: 'Missing required fields: sector, country' },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a climate risk advisor for African infrastructure projects. Generate CONCISE, actionable insights.

Your response must be valid JSON with this exact structure:
{
  "projectContext": "1-2 sentences max. Use numbers. Be specific to ${sector}.",
  "recommendations": [
    {
      "text": "Short actionable item (max 15 words)",
      "priority": "high|medium|low"
    }
  ],
  "keyRisk": {
    "headline": "5-7 words max",
    "mitigation": "One action, max 10 words"
  },
  "opportunity": {
    "headline": "5-7 words max",
    "detail": "One sentence, max 15 words"
  }
}

CRITICAL: Keep ALL text SHORT. No verbose explanations. Max 3 recommendations.`;

    const userPrompt = `Generate climate insights for this project:

PROJECT:
- Name: ${projectName || 'Unnamed project'}
- Sector: ${sector}
- Location: ${locationName || country}
- Description: ${projectDescription || 'Not provided'}

CLIMATE DATA:
- Average Temperature: ${historicalData?.averageTemperature}°C
- Annual Precipitation: ${historicalData?.annualPrecipitation}mm
- Extreme Heat Days (>35°C): ${historicalData?.extremeHeatDays} days/year
- Dry Season: ${historicalData?.drySeasonMonths?.length || 0} months
- Drought Risk: ${historicalData?.droughtRisk}
- Flood Risk: ${historicalData?.floodRisk}
- Water Availability: ${siteIntelligence?.waterAvailability}
- Solar Potential: ${siteIntelligence?.solarPotential || 'N/A'} kWh/m²/day

FUTURE PROJECTIONS (2050):
${projections?.filter((p: any) => p.year === 2050).map((p: any) =>
  `- ${p.scenario}: +${p.temperatureChange}°C, ${p.precipitationChange > 0 ? '+' : ''}${p.precipitationChange}% precipitation`
).join('\n') || 'Not available'}

Generate specific, actionable insights for this ${sector} project.`;

    const result = await callAI({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true
    });

    if (!result.success || !result.parsed) {
      return NextResponse.json(
        { error: result.error || 'Failed to generate insights' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insights: result.parsed,
      provider: result.provider,
      cached: false
    });

  } catch (error) {
    console.error('[Location Insight API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
