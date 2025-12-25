// DFI Database - VERIFIED DATA from official sources

import type { DFI, AfricanCountry, Sector } from '../types';

export const DFI_DATABASE: DFI[] = [
  {
    id: 'ifc',
    name: 'IFC',
    fullName: 'International Finance Corporation',
    country: 'International (World Bank Group)',
    minSize: undefined,
    maxSize: undefined,
    maxParticipation: 25,
    loanTenor: '7-12 years typical',
    eligibleCountries: 'all',
    eligibleSectors: 'all',
    keyRequirements: [
      'IFC Performance Standards compliance',
      'Environmental & Social due diligence',
      'Commercially viable project',
      'Private sector ownership (>50%)',
      'Developmental impact'
    ],
    climateTarget: 'Climate business $15B+ annually',
    specialPrograms: [
      'IFC SME Ventures (for smaller deals via intermediaries)',
      'Blended Finance Facility',
      'Creating Markets Advisory'
    ],
    notes: 'Works through intermediaries for SME deals. Equity investments 5-20% of company equity.',
    sourceUrl: 'https://www.ifc.org/en/what-we-do/products-and-services/how-to-apply-for-financing'
  },
  {
    id: 'afdb',
    name: 'AfDB',
    fullName: 'African Development Bank',
    country: 'International (Pan-African)',
    minSize: 3_000_000,
    maxSize: undefined,
    maxParticipation: 33,
    loanTenor: '10-20 years',
    eligibleCountries: 'all',
    eligibleSectors: 'all',
    keyRequirements: [
      'Located in Regional Member Country (RMC)',
      'Majority private-owned',
      'Strong integrity/governance track record',
      'Clear development impact',
      'Financial viability'
    ],
    climateTarget: 'Climate finance 40% of approvals by 2025',
    specialPrograms: [
      'Africa50 Infrastructure Fund',
      'Sustainable Energy Fund for Africa (SEFA)',
      'African Legal Support Facility'
    ],
    notes: 'Response time: 15 working days for eligibility screening. Higher participation for project expansions.',
    sourceUrl: 'https://www.afdb.org/en/sectors/private-sector/how-work-us/funding-request'
  },
  {
    id: 'fmo',
    name: 'FMO',
    fullName: 'Nederlandse Financierings-Maatschappij voor Ontwikkelingslanden',
    country: 'Netherlands',
    minSize: undefined,
    maxSize: undefined,
    loanTenor: '5-15 years',
    eligibleCountries: 'all',
    eligibleSectors: ['energy', 'agriculture'] as Sector[],
    keyRequirements: [
      'OECD-DAC eligible country',
      'FMO Sustainability Policy compliance',
      'Commercial viability',
      'IFC Performance Standards'
    ],
    climateTarget: 'Climate investment focus in energy sector',
    specialPrograms: [
      'Climate Investor One',
      'Dutch Fund for Climate and Development (DFCD)',
      'MASSIF Fund (for financial inclusion)',
      'Access to Energy Fund'
    ],
    notes: '51% Dutch government owned, operates commercially. Offices in Johannesburg and Nairobi.',
    sourceUrl: 'https://www.edfi.eu/member/fmo/'
  },
  {
    id: 'deg',
    name: 'DEG',
    fullName: 'Deutsche Investitions- und Entwicklungsgesellschaft',
    country: 'Germany',
    minSize: 500_000,
    maxSize: 25_000_000,
    loanTenor: '4-10 years',
    eligibleCountries: 'all',
    eligibleSectors: 'all',
    keyRequirements: [
      'OECD-DAC eligible country',
      'IFC Performance Standards',
      'ILO core labour standards',
      'Minimum 25% equity (SMEs), 30-50% for greenfield',
      'Commercial viability'
    ],
    climateTarget: 'Climate and environment focus',
    specialPrograms: [
      'ImpactConnect (€0.5M-€10M unsecured)',
      'DEG Impulse (up to €500K, max 50% of investment)',
      'AfricaConnect',
      'Business Support Services'
    ],
    notes: 'Subsidiary of KfW Group. ImpactConnect offers unsecured financing for smaller deals.',
    sourceUrl: 'https://www.deginvest.de/index-2.html'
  },
  {
    id: 'bii',
    name: 'BII',
    fullName: 'British International Investment (formerly CDC)',
    country: 'United Kingdom',
    minSize: 10_000_000,
    maxSize: 250_000_000,
    loanTenor: '5-15 years',
    eligibleCountries: [
      'kenya', 'nigeria', 'south_africa', 'tanzania', 'ghana', 'egypt'
    ] as AfricanCountry[],
    eligibleSectors: 'all',
    keyRequirements: [
      'Priority: Sub-Saharan Africa, South Asia',
      'Strong E&S standards',
      'Development impact',
      '2X Gender criteria encouraged'
    ],
    climateTarget: '30% of new commitments in climate finance',
    specialPrograms: [
      'BII Plus (technical assistance)',
      'Climate Finance',
      'Gender Finance (2X Challenge)',
      'Infrastructure Equity'
    ],
    notes: 'World\'s oldest DFI (1948). 2X Gender: 51% women ownership OR 30% women leadership OR 30-50% women workforce.',
    sourceUrl: 'https://www.bii.co.uk/en/africa/'
  },
  {
    id: 'proparco',
    name: 'Proparco',
    fullName: 'Promotion et Participation pour la Coopération Économique',
    country: 'France',
    minSize: undefined,
    maxSize: undefined,
    loanTenor: '5-15 years',
    eligibleCountries: 'all',
    eligibleSectors: 'all',
    keyRequirements: [
      'Economically viable',
      'Financially profitable',
      'Environmentally sustainable',
      'Socially equitable',
      'AFD E&S standards'
    ],
    climateTarget: 'Climate finance priority',
    specialPrograms: [
      'FISEA+ (€210M for African MSMEs)',
      'Choose Africa (€2.5B over 4 years for African SMEs)',
      'Adapt\'Action (climate adaptation)',
      'SUNREF (sustainable energy)'
    ],
    notes: 'Subsidiary of AFD Group (French Development Agency). Strong presence in Francophone Africa.',
    sourceUrl: 'https://www.proparco.fr/en/countries-regions/our-activities-africa'
  },
  {
    id: 'dfc',
    name: 'DFC',
    fullName: 'U.S. International Development Finance Corporation',
    country: 'United States',
    minSize: 50_000_000,
    maxSize: 1_000_000_000,
    loanTenor: 'Up to 25 years',
    eligibleCountries: 'all',
    eligibleSectors: 'all',
    keyRequirements: [
      'Meaningful connection to US private sector',
      'Priority: low/lower-middle income countries',
      'DFC Environmental and Social Policies',
      'Development impact'
    ],
    climateTarget: '33% of commitments in climate (from FY2023)',
    specialPrograms: [
      'Power Africa ($2.4B+ committed)',
      'Prosper Africa',
      'Political Risk Insurance (up to $1B)',
      'Equity and Investment Funds'
    ],
    notes: 'Created 2019 by merging OPIC + USAID DCA. Strong focus on Power Africa (30GW goal).',
    sourceUrl: 'https://www.dfc.gov/'
  }
];

export function getDFIById(id: string): DFI | undefined {
  return DFI_DATABASE.find(dfi => dfi.id === id);
}

export function getDFIsForCountry(country: AfricanCountry): DFI[] {
  return DFI_DATABASE.filter(dfi => {
    if (dfi.eligibleCountries === 'all') return true;
    return dfi.eligibleCountries.includes(country);
  });
}

export function getDFIsForSector(sector: Sector): DFI[] {
  return DFI_DATABASE.filter(dfi => {
    if (dfi.eligibleSectors === 'all') return true;
    return dfi.eligibleSectors.includes(sector);
  });
}

export function getDFIsForSize(projectSizeUSD: number): DFI[] {
  return DFI_DATABASE.filter(dfi => {
    if (dfi.minSize && projectSizeUSD < dfi.minSize) return false;
    if (dfi.maxSize && projectSizeUSD > dfi.maxSize * 4) return false;
    return true;
  });
}

export function getMatchingDFIs(country: AfricanCountry, sector: Sector, sizeUSD: number): DFI[] {
  const byCountry = new Set(getDFIsForCountry(country).map(d => d.id));
  const bySector = new Set(getDFIsForSector(sector).map(d => d.id));
  const bySize = new Set(getDFIsForSize(sizeUSD).map(d => d.id));

  return DFI_DATABASE.filter(dfi =>
    byCountry.has(dfi.id) && bySector.has(dfi.id) && bySize.has(dfi.id)
  );
}
