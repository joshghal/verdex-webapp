import { NextRequest, NextResponse } from 'next/server';
import { assessLocationRisk } from '@/lib/engines/location-risk-engine';
import type { AfricanCountry, Sector } from '@/lib/types';
import { AFRICAN_COUNTRIES, SECTORS } from '@/lib/types';

/**
 * Location Risk API Endpoint
 *
 * Provides climate resilience assessment and site intelligence
 * using Open-Meteo API (free, no auth required)
 *
 * POST /api/location-risk
 * Body: { country: string, sector: string, city?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate country
    if (!body.country) {
      return NextResponse.json(
        { error: 'Country is required' },
        { status: 400 }
      );
    }

    const country = body.country.toLowerCase() as AfricanCountry;
    if (!AFRICAN_COUNTRIES.includes(country)) {
      return NextResponse.json(
        { error: `Country '${body.country}' not supported. Supported countries: ${AFRICAN_COUNTRIES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate sector
    if (!body.sector) {
      return NextResponse.json(
        { error: 'Sector is required' },
        { status: 400 }
      );
    }

    const sector = body.sector.toLowerCase() as Sector;
    if (!SECTORS.includes(sector)) {
      return NextResponse.json(
        { error: `Sector '${body.sector}' not supported. Supported sectors: ${SECTORS.join(', ')}` },
        { status: 400 }
      );
    }

    // Optional city parameter for more precise location
    const city = body.city as string | undefined;

    console.log(`[Location Risk API] Assessing ${country}/${sector}${city ? ` (${city})` : ''}`);

    // Fetch climate assessment
    const assessment = await assessLocationRisk(country, sector, city);

    return NextResponse.json({
      success: true,
      assessment
    });

  } catch (error) {
    console.error('[Location Risk API] Error:', error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('No coordinates')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('Open-Meteo API')) {
        return NextResponse.json(
          { error: 'Climate data service temporarily unavailable', details: error.message },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to assess location risk' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for checking supported locations
 * GET /api/location-risk
 */
export async function GET() {
  return NextResponse.json({
    supportedCountries: AFRICAN_COUNTRIES,
    supportedSectors: SECTORS,
    dataSource: 'Open-Meteo API (open-meteo.com)',
    features: [
      'Historical climate data (10-year average)',
      'Climate projections (SSP2-4.5, SSP5-8.5)',
      'Sector-specific risk metrics',
      'Site intelligence for developers',
      'Resilience opportunities analysis'
    ]
  });
}
