// African Country Coordinates for Climate Data Lookup
// Used by location-risk-engine.ts to fetch Open-Meteo climate data
//
// DATA SOURCES:
// - Coordinates: GeoNames (geonames.org) - public domain geographic database
// - Climate zones: Köppen-Geiger Climate Classification (Beck et al., 2018)
//   https://www.nature.com/articles/sdata2018214
// - Climate risks: IPCC AR6 Africa Chapter (2022)
//   https://www.ipcc.ch/report/ar6/wg2/chapter/chapter-9/
// - Open-Meteo API: https://open-meteo.com/en/docs (free, no auth)
//
// VALIDATION: Coordinates cross-referenced with Google Maps and OSM

import type { AfricanCountry } from '../types';

export interface LocationCoordinates {
  country: string;
  capital: string;
  latitude: number;
  longitude: number;
  alternativeLocations?: { name: string; lat: number; lon: number }[];
}

/**
 * Coordinates for all 7 supported African countries
 * Primary location is capital; alternatives are major cities for more accurate site assessment
 */
export const AFRICAN_COORDINATES: Record<AfricanCountry, LocationCoordinates> = {
  kenya: {
    country: 'Kenya',
    capital: 'Nairobi',
    latitude: -1.2921,
    longitude: 36.8219,
    alternativeLocations: [
      { name: 'Mombasa', lat: -4.0435, lon: 39.6682 },
      { name: 'Kisumu', lat: -0.1022, lon: 34.7617 },
      { name: 'Nakuru', lat: -0.3031, lon: 36.0800 },
      { name: 'Eldoret', lat: 0.5143, lon: 35.2698 }
    ]
  },
  nigeria: {
    country: 'Nigeria',
    capital: 'Abuja',
    latitude: 9.0765,
    longitude: 7.3986,
    alternativeLocations: [
      { name: 'Lagos', lat: 6.5244, lon: 3.3792 },
      { name: 'Port Harcourt', lat: 4.8156, lon: 7.0498 },
      { name: 'Kano', lat: 12.0022, lon: 8.5920 },
      { name: 'Ibadan', lat: 7.3775, lon: 3.9470 }
    ]
  },
  south_africa: {
    country: 'South Africa',
    capital: 'Pretoria',
    latitude: -25.7479,
    longitude: 28.2293,
    alternativeLocations: [
      { name: 'Cape Town', lat: -33.9249, lon: 18.4241 },
      { name: 'Johannesburg', lat: -26.2041, lon: 28.0473 },
      { name: 'Durban', lat: -29.8587, lon: 31.0218 },
      { name: 'Port Elizabeth', lat: -33.9608, lon: 25.6022 }
    ]
  },
  tanzania: {
    country: 'Tanzania',
    capital: 'Dodoma',
    latitude: -6.1630,
    longitude: 35.7516,
    alternativeLocations: [
      { name: 'Dar es Salaam', lat: -6.7924, lon: 39.2083 },
      { name: 'Mwanza', lat: -2.5164, lon: 32.9175 },
      { name: 'Arusha', lat: -3.3869, lon: 36.6830 },
      { name: 'Zanzibar', lat: -6.1659, lon: 39.2026 }
    ]
  },
  ghana: {
    country: 'Ghana',
    capital: 'Accra',
    latitude: 5.6037,
    longitude: -0.1870,
    alternativeLocations: [
      { name: 'Kumasi', lat: 6.6885, lon: -1.6244 },
      { name: 'Tamale', lat: 9.4034, lon: -0.8424 },
      { name: 'Takoradi', lat: 4.8845, lon: -1.7554 }
    ]
  },
  egypt: {
    country: 'Egypt',
    capital: 'Cairo',
    latitude: 30.0444,
    longitude: 31.2357,
    alternativeLocations: [
      { name: 'Alexandria', lat: 31.2001, lon: 29.9187 },
      { name: 'Aswan', lat: 24.0889, lon: 32.8998 },
      { name: 'Luxor', lat: 25.6872, lon: 32.6396 },
      { name: 'Sharm El Sheikh', lat: 27.9158, lon: 34.3300 }
    ]
  },
  morocco: {
    country: 'Morocco',
    capital: 'Rabat',
    latitude: 34.0209,
    longitude: -6.8416,
    alternativeLocations: [
      { name: 'Casablanca', lat: 33.5731, lon: -7.5898 },
      { name: 'Marrakech', lat: 31.6295, lon: -7.9811 },
      { name: 'Tangier', lat: 35.7595, lon: -5.8340 },
      { name: 'Ouarzazate', lat: 30.9189, lon: -6.8936 }  // Solar hub
    ]
  },
  ethiopia: {
    country: 'Ethiopia',
    capital: 'Addis Ababa',
    latitude: 9.0320,
    longitude: 38.7469,
    alternativeLocations: [
      { name: 'Dire Dawa', lat: 9.6009, lon: 41.8501 },
      { name: 'Mekelle', lat: 13.4967, lon: 39.4753 },
      { name: 'Hawassa', lat: 7.0504, lon: 38.4955 },
      { name: 'Bahir Dar', lat: 11.5742, lon: 37.3614 }
    ]
  }
};

/**
 * Get coordinates for a country, optionally for a specific city
 * @param country - The African country code
 * @param city - Optional city name for more precise location
 * @returns Coordinates and location name, or null if not found
 */
export function getCoordinates(
  country: AfricanCountry,
  city?: string
): { lat: number; lon: number; name: string } | null {
  const countryData = AFRICAN_COORDINATES[country];
  if (!countryData) return null;

  // If city specified, try to find it in alternatives
  if (city) {
    const cityLower = city.toLowerCase().trim();

    // Check if it's the capital
    if (countryData.capital.toLowerCase() === cityLower) {
      return {
        lat: countryData.latitude,
        lon: countryData.longitude,
        name: `${countryData.capital}, ${countryData.country}`
      };
    }

    // Check alternative locations
    if (countryData.alternativeLocations) {
      const altLoc = countryData.alternativeLocations.find(
        loc => loc.name.toLowerCase() === cityLower
      );
      if (altLoc) {
        return {
          lat: altLoc.lat,
          lon: altLoc.lon,
          name: `${altLoc.name}, ${countryData.country}`
        };
      }
    }
  }

  // Default to capital
  return {
    lat: countryData.latitude,
    lon: countryData.longitude,
    name: `${countryData.capital}, ${countryData.country}`
  };
}

/**
 * Get all available locations for a country
 * Useful for UI dropdowns
 */
export function getAvailableLocations(country: AfricanCountry): string[] {
  const countryData = AFRICAN_COORDINATES[country];
  if (!countryData) return [];

  const locations = [countryData.capital];
  if (countryData.alternativeLocations) {
    locations.push(...countryData.alternativeLocations.map(loc => loc.name));
  }
  return locations;
}

/**
 * Climate zone hints for each country
 * Used to contextualize climate risk messaging
 */
export const COUNTRY_CLIMATE_ZONES: Record<AfricanCountry, {
  primaryZone: string;
  characteristics: string[];
  keyRisks: string[];
}> = {
  kenya: {
    primaryZone: 'Tropical/Semi-arid',
    characteristics: ['Bimodal rainfall', 'Highland cool zones', 'Coastal humidity'],
    keyRisks: ['Drought in north', 'Flooding in lake regions', 'Variable rainfall timing']
  },
  nigeria: {
    primaryZone: 'Tropical/Sahel',
    characteristics: ['Wet south', 'Dry north', 'Monsoon season'],
    keyRisks: ['Desertification in north', 'Coastal erosion', 'Flooding in Niger Delta']
  },
  south_africa: {
    primaryZone: 'Temperate/Semi-arid',
    characteristics: ['Mediterranean (Cape)', 'Subtropical (east)', 'Karoo desert'],
    keyRisks: ['Water scarcity', 'Drought cycles', 'Extreme heat in interior']
  },
  tanzania: {
    primaryZone: 'Tropical',
    characteristics: ['Coastal humidity', 'Highland cool zones', 'Seasonal rainfall'],
    keyRisks: ['Drought in central regions', 'Flooding in lake zones', 'Cyclone exposure (coast)']
  },
  ghana: {
    primaryZone: 'Tropical',
    characteristics: ['Humid south', 'Savanna north', 'Two rainy seasons'],
    keyRisks: ['Flooding in south', 'Drought in north', 'Harmattan dust']
  },
  egypt: {
    primaryZone: 'Hot Arid/Desert',
    characteristics: ['Nile dependency', 'Mediterranean coast', 'Extreme heat interior'],
    keyRisks: ['Water scarcity', 'Extreme heat', 'Sea level rise (Delta)']
  },
  morocco: {
    primaryZone: 'Mediterranean/Semi-arid',
    characteristics: ['Coastal Mediterranean', 'Atlas mountains', 'Sahara transition'],
    keyRisks: ['Drought cycles', 'Desertification', 'Water stress']
  },
  ethiopia: {
    primaryZone: 'Tropical Highland/Semi-arid',
    characteristics: ['Highland cool zones', 'Rift Valley lakes', 'Seasonal rainfall (Kiremt)'],
    keyRisks: ['Drought cycles', 'Deforestation', 'Water stress in lowlands', 'Flooding in Rift Valley']
  }
};
