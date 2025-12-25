// African Country Profiles for TransitionPath Africa

import type { CountryProfile } from '../types';

export const COUNTRY_PROFILES: CountryProfile[] = [
  {
    id: 'kenya',
    name: 'Kenya',
    region: 'east_africa',
    regulatoryFramework: 'Strong regulatory environment with established IPP framework',
    legalSystem: 'common_law',
    relevantLaws: [
      'Energy Act 2019',
      'Climate Change Act 2016',
      'Environmental Management and Co-ordination Act (EMCA)',
      'Public Private Partnership Act 2013'
    ],
    currency: 'Kenyan Shilling',
    currencyCode: 'KES',
    fxConsiderations: [
      'Floating exchange rate with Central Bank intervention',
      'PPA payments typically in USD or USD-indexed',
      'Capital account largely liberalized'
    ],
    exchangeControlNotes: 'Relatively liberal FX regime; repatriation of profits permitted',
    gridOperator: 'Kenya Power and Lighting Company (KPLC)',
    ppaFramework: 'Standardized PPA available; Feed-in-Tariff (FiT) for renewables up to 10MW',
    renewableTargets: '100% renewable electricity by 2030 (national target)',
    sovereignRating: 'B (Fitch), B3 (Moody\'s)',
    politicalRiskLevel: 'medium',
    ndcTarget: '32% reduction in GHG emissions by 2030 vs BAU',
    ndcBaselineYear: 2010,
    ndcTargetYear: 2030,
    specialConsiderations: [
      'Lake Turkana Wind Power - Africa\'s largest wind farm',
      'Geothermal potential (Olkaria)',
      'Strong DFI presence and track record',
      'East African hub for regional projects'
    ]
  },
  {
    id: 'nigeria',
    name: 'Nigeria',
    region: 'west_africa',
    regulatoryFramework: 'Evolving regulatory framework; power sector reform ongoing',
    legalSystem: 'common_law',
    relevantLaws: [
      'Electric Power Sector Reform Act (EPSRA) 2005',
      'Nigerian Electricity Regulatory Commission (NERC) regulations',
      'Climate Change Act 2021',
      'Nigeria Investment Promotion Commission Act'
    ],
    currency: 'Nigerian Naira',
    currencyCode: 'NGN',
    fxConsiderations: [
      'Multiple exchange rate windows (official, I&E, parallel)',
      'USD liquidity constraints historically',
      'PPA payments in Naira with USD indexation common',
      'Recent FX unification efforts (2023+)'
    ],
    exchangeControlNotes: 'FX access can be challenging; DFI guarantees helpful for repatriation',
    gridOperator: 'Transmission Company of Nigeria (TCN)',
    ppaFramework: 'Power Purchase Agreements through Nigerian Bulk Electricity Trading Plc (NBET)',
    renewableTargets: '30% renewable in energy mix by 2030',
    sovereignRating: 'B- (Fitch), Caa1 (Moody\'s)',
    politicalRiskLevel: 'high',
    ndcTarget: '20% unconditional, 47% conditional GHG reduction by 2030',
    ndcBaselineYear: 2010,
    ndcTargetYear: 2030,
    specialConsiderations: [
      'Largest economy in Africa',
      'Significant gas-to-power transition potential',
      'Off-grid/mini-grid opportunities due to grid limitations',
      'Power Africa priority country',
      'Currency risk mitigation essential'
    ]
  },
  {
    id: 'south_africa',
    name: 'South Africa',
    region: 'southern_africa',
    regulatoryFramework: 'Well-developed legal framework; REIPPPP highly successful',
    legalSystem: 'mixed',
    relevantLaws: [
      'National Energy Act 2008',
      'Electricity Regulation Act 2006',
      'Carbon Tax Act 2019',
      'Climate Change Bill (pending)',
      'Broad-Based Black Economic Empowerment Act'
    ],
    currency: 'South African Rand',
    currencyCode: 'ZAR',
    fxConsiderations: [
      'Freely floating, liquid currency',
      'PPA payments in ZAR (REIPPPP)',
      'Well-developed hedging markets',
      'No exchange controls for current account'
    ],
    exchangeControlNotes: 'Liberal regime; some capital account restrictions remain',
    gridOperator: 'Eskom (vertically integrated utility)',
    ppaFramework: 'Renewable Energy Independent Power Producer Procurement Programme (REIPPPP)',
    renewableTargets: 'Just Energy Transition (JET) - coal phase-down commitment',
    sovereignRating: 'BB- (Fitch), Ba2 (Moody\'s)',
    politicalRiskLevel: 'medium',
    ndcTarget: '350-420 Mt CO2e by 2030 (absolute cap)',
    ndcBaselineYear: 2010,
    ndcTargetYear: 2030,
    specialConsiderations: [
      'Most sophisticated African financial market',
      'REIPPPP: Africa\'s most successful IPP program',
      'Just Energy Transition Partnership (JETP) - $8.5B commitment',
      'Coal transition is key focus',
      'B-BBEE requirements for local participation',
      'LMA South African law templates available'
    ]
  },
  {
    id: 'tanzania',
    name: 'Tanzania',
    region: 'east_africa',
    regulatoryFramework: 'Improving regulatory framework; sector reforms underway',
    legalSystem: 'common_law',
    relevantLaws: [
      'Electricity Act 2008 (amended 2018)',
      'Energy and Water Utilities Regulatory Authority (EWURA) regulations',
      'Environmental Management Act 2004',
      'Public Private Partnership Act 2010'
    ],
    currency: 'Tanzanian Shilling',
    currencyCode: 'TZS',
    fxConsiderations: [
      'Managed float exchange rate',
      'USD-denominated PPAs preferred for IPPs',
      'Bank of Tanzania manages FX availability'
    ],
    exchangeControlNotes: 'Moderate controls; profit repatriation generally permitted',
    gridOperator: 'Tanzania Electric Supply Company (TANESCO)',
    ppaFramework: 'Standardized Small Power Producer framework; larger PPAs negotiated',
    renewableTargets: '50% renewable electricity by 2030',
    sovereignRating: 'B (Fitch)',
    politicalRiskLevel: 'medium',
    ndcTarget: '30-35% GHG reduction by 2030 (conditional)',
    ndcBaselineYear: 2010,
    ndcTargetYear: 2030,
    specialConsiderations: [
      'Significant natural gas reserves',
      'Hydropower potential (Rufiji)',
      'Growing mini-grid sector',
      'East African Community member',
      'Improving investment climate'
    ]
  },
  {
    id: 'ghana',
    name: 'Ghana',
    region: 'west_africa',
    regulatoryFramework: 'Stable regulatory environment; established IPP track record',
    legalSystem: 'common_law',
    relevantLaws: [
      'Energy Commission Act 1997',
      'Renewable Energy Act 2011',
      'Public Utilities Regulatory Commission Act 1997',
      'Environmental Assessment Regulations'
    ],
    currency: 'Ghanaian Cedi',
    currencyCode: 'GHS',
    fxConsiderations: [
      'Floating exchange rate with periodic volatility',
      'USD-indexed PPAs common',
      'Bank of Ghana FX auctions',
      'Recent currency pressures (2022-2023)'
    ],
    exchangeControlNotes: 'Generally liberal; some restrictions on capital movements',
    gridOperator: 'Ghana Grid Company (GRIDCo)',
    ppaFramework: 'Power Purchase Agreements with Electricity Company of Ghana (ECG)',
    renewableTargets: '10% renewable energy in electricity mix by 2030',
    sovereignRating: 'RD (Fitch) - debt restructuring',
    politicalRiskLevel: 'medium',
    ndcTarget: '15% unconditional, 45% conditional GHG reduction by 2030',
    ndcBaselineYear: 2010,
    ndcTargetYear: 2030,
    specialConsiderations: [
      'Recent debt restructuring (2023)',
      'IMF program in place',
      'Strong renewable energy policy framework',
      'West African hub potential',
      'DFI support particularly important given fiscal situation'
    ]
  },
  {
    id: 'egypt',
    name: 'Egypt',
    region: 'north_africa',
    regulatoryFramework: 'Reformed energy sector; competitive bidding for renewables',
    legalSystem: 'civil_law',
    relevantLaws: [
      'Electricity Law No. 87 of 2015',
      'Renewable Energy Law',
      'Investment Law No. 72 of 2017',
      'Environment Law No. 4 of 1994'
    ],
    currency: 'Egyptian Pound',
    currencyCode: 'EGP',
    fxConsiderations: [
      'Managed float; significant devaluations (2022-2023)',
      'USD-denominated PPAs for IPPs',
      'Central Bank of Egypt FX controls',
      'IMF program supporting reforms'
    ],
    exchangeControlNotes: 'FX access improved with IMF program; repatriation permitted',
    gridOperator: 'Egyptian Electricity Holding Company (EEHC)',
    ppaFramework: 'Competitive bidding for large-scale renewables; Feed-in Tariff program',
    renewableTargets: '42% renewable electricity by 2035',
    sovereignRating: 'B- (Fitch), B3 (Moody\'s)',
    politicalRiskLevel: 'medium',
    ndcTarget: 'Net-zero by 2050; interim targets in updated NDC',
    ndcBaselineYear: 2015,
    ndcTargetYear: 2030,
    specialConsiderations: [
      'Benban Solar Park - one of world\'s largest',
      'COP27 host (Sharm el-Sheikh)',
      'Strong renewable resource base (solar, wind)',
      'Suez Canal Economic Zone opportunities',
      'Gateway to Middle East and Africa'
    ]
  },
  {
    id: 'morocco',
    name: 'Morocco',
    region: 'north_africa',
    regulatoryFramework: 'Advanced renewable energy framework; Noor solar complex',
    legalSystem: 'civil_law',
    relevantLaws: [
      'Renewable Energy Law 13-09',
      'Energy Efficiency Law 47-09',
      'Law 58-15 (liberalized high/medium voltage)',
      'Environmental Impact Assessment Decree'
    ],
    currency: 'Moroccan Dirham',
    currencyCode: 'MAD',
    fxConsiderations: [
      'Pegged to EUR/USD basket',
      'Relatively stable currency',
      'PPAs in MAD with indexation common',
      'Liberal FX regime'
    ],
    exchangeControlNotes: 'Progressive liberalization; current account convertible',
    gridOperator: 'Office National de l\'Electricité et de l\'Eau Potable (ONEE)',
    ppaFramework: 'MASEN (Moroccan Agency for Sustainable Energy) for large projects',
    renewableTargets: '52% renewable electricity capacity by 2030',
    sovereignRating: 'BB+ (Fitch), Ba1 (Moody\'s)',
    politicalRiskLevel: 'low',
    ndcTarget: '45.5% GHG reduction by 2030 (conditional)',
    ndcBaselineYear: 2010,
    ndcTargetYear: 2030,
    specialConsiderations: [
      'Noor-Ouarzazate Solar Complex - world\'s largest CSP',
      'Renewable energy leader in Africa',
      'Strong regulatory framework',
      'EU interconnection potential',
      'Hydrogen strategy (green hydrogen)',
      'Stable political environment'
    ]
  }
];

export function getCountryProfile(countryId: string): CountryProfile | undefined {
  return COUNTRY_PROFILES.find(c => c.id === countryId);
}

export function getCountriesByRegion(region: CountryProfile['region']): CountryProfile[] {
  return COUNTRY_PROFILES.filter(c => c.region === region);
}

export function getCountriesByRisk(maxRisk: 'low' | 'medium' | 'high'): CountryProfile[] {
  const riskOrder = { low: 1, medium: 2, high: 3 };
  return COUNTRY_PROFILES.filter(c => riskOrder[c.politicalRiskLevel] <= riskOrder[maxRisk]);
}
