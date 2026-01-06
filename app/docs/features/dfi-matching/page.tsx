import DocPage, { InfoBox } from '@/components/docs/DocPage';
import { Building2, Globe, Leaf, DollarSign, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'DFI Matching | Verdex Docs',
  description: 'Match projects with appropriate Development Finance Institutions',
};

export default function DFIMatchingPage() {
  const dfis = [
    {
      name: 'IFC',
      fullName: 'International Finance Corporation',
      code: 'WB',
      size: 'No min, max 25%',
      coverage: '45 African countries',
      climate: '$15B+ annually',
      programs: ['Blended Finance', 'SME Ventures', 'Scaling Solar'],
      role: 'Senior Debt, Equity',
    },
    {
      name: 'AfDB',
      fullName: 'African Development Bank',
      code: 'AF',
      size: '$3M - $10M+',
      coverage: '54 member states',
      climate: '40% of approvals',
      programs: ['SEFA', 'Africa50', 'Desert to Power'],
      role: 'Senior Debt, Guarantees',
    },
    {
      name: 'FMO',
      fullName: 'Dutch Development Bank',
      code: 'NL',
      size: 'No fixed min',
      coverage: 'OECD-DAC countries',
      climate: 'Energy focus',
      programs: ['Climate Investor One', 'DFCD', 'Access to Energy'],
      role: 'Mezzanine, Senior Debt',
    },
    {
      name: 'DEG',
      fullName: 'German Investment Corporation',
      code: 'DE',
      size: '€0.5M - €25M',
      coverage: 'OECD-DAC countries',
      climate: 'Climate priority',
      programs: ['ImpactConnect', 'AfricaConnect', 'upscalingPLUS'],
      role: 'Senior Debt, Equity',
    },
    {
      name: 'BII',
      fullName: 'British International Investment',
      code: 'GB',
      size: '$10M - $250M',
      coverage: 'SSA priority',
      climate: '30% climate target',
      programs: ['2X Gender', 'Infrastructure', 'Climate'],
      role: 'Equity, Mezzanine',
    },
    {
      name: 'Proparco',
      fullName: 'French Development Finance',
      code: 'FR',
      size: 'No fixed min',
      coverage: 'SSA + Med priority',
      climate: 'Climate priority',
      programs: ['Choose Africa €2.5B', 'FISEA+', 'SUNREF'],
      role: 'Senior Debt, Equity',
    },
    {
      name: 'DFC',
      fullName: 'US Development Finance Corp',
      code: 'US',
      size: '$50M - $1B',
      coverage: '100+ countries',
      climate: '33% climate target',
      programs: ['Power Africa $2.4B', 'Prosper Africa', 'Health'],
      role: 'Senior Debt, Guarantees',
    },
  ];

  return (
    <DocPage
      title="DFI Matching & Structure Advisory"
      description="Match projects with appropriate Development Finance Institutions and recommend optimal blended finance structures."
      breadcrumbs={[{ label: 'Features' }, { label: 'DFI Matching' }]}
      previousPage={{ title: 'LMA Validator', href: '/docs/features/lma-validator' }}
      nextPage={{ title: 'Greenwash Detection', href: '/docs/features/greenwash-detection' }}
      tableOfContents={[
        { id: 'overview', title: 'Overview', level: 2 },
        { id: 'dfi-database', title: 'DFI Database', level: 2 },
        { id: 'matching-criteria', title: 'Matching Criteria', level: 2 },
        { id: 'matching-flow', title: 'Matching Flow', level: 2 },
        { id: 'structure-example', title: 'Structure Example', level: 2 },
      ]}
    >
      <h2 id="overview" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Overview
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Once a project is validated against LMA criteria, Verdex matches it with appropriate <strong>Development Finance Institutions (DFIs)</strong> based on country coverage, sector focus, size requirements, and climate targets.
      </p>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        {[
          { icon: <Building2 className="w-5 h-5" />, value: '7+', label: 'Verified DFIs' },
          { icon: <Globe className="w-5 h-5" />, value: '54', label: 'African Countries' },
          { icon: <Leaf className="w-5 h-5" />, value: '$50B+', label: 'Climate Capital' },
          { icon: <DollarSign className="w-5 h-5" />, value: '$3M-$1B', label: 'Deal Sizes' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-verdex-50 to-emerald-50 border border-verdex-100 text-center">
            <div className="w-10 h-10 mx-auto rounded-lg bg-verdex-500 flex items-center justify-center text-white mb-2">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-verdex-700">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 id="dfi-database" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Verified DFI Database
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Every DFI in our database has been researched and verified against official sources. No fabricated criteria.
      </p>

      {/* DFI Cards */}
      <div className="grid md:grid-cols-2 gap-4 my-6">
        {dfis.map((dfi, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-verdex-200 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-verdex-500 flex items-center justify-center text-white font-bold text-xs">
                {dfi.code}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{dfi.name}</div>
                <div className="text-xs text-gray-500">{dfi.fullName}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="p-2 rounded-lg bg-gray-50">
                <div className="text-gray-500">Size Range</div>
                <div className="font-medium text-gray-900">{dfi.size}</div>
              </div>
              <div className="p-2 rounded-lg bg-gray-50">
                <div className="text-gray-500">Coverage</div>
                <div className="font-medium text-gray-900">{dfi.coverage}</div>
              </div>
              <div className="p-2 rounded-lg bg-verdex-50">
                <div className="text-verdex-600">Climate</div>
                <div className="font-medium text-verdex-800">{dfi.climate}</div>
              </div>
              <div className="p-2 rounded-lg bg-emerald-50">
                <div className="text-emerald-600">Typical Role</div>
                <div className="font-medium text-emerald-800">{dfi.role}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {dfi.programs.map((program, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
                  {program}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Verified Sources">
        All DFI data sourced from official websites, annual reports, and investment criteria documents. See <a href="/docs/resources/references" className="text-verdex-600 underline">References</a> for full citations.
      </InfoBox>

      <h2 id="matching-criteria" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Matching Criteria
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        DFIs are scored and ranked based on five weighted criteria:
      </p>

      <div className="space-y-3 my-6">
        {[
          { criterion: 'Country Match', weight: '25%', desc: 'DFI active in project country' },
          { criterion: 'Sector Match', weight: '25%', desc: 'Energy, agriculture, infrastructure alignment' },
          { criterion: 'Size Fit', weight: '20%', desc: 'Project within DFI ticket size range' },
          { criterion: 'Climate Target', weight: '15%', desc: 'DFI climate investment mandate' },
          { criterion: 'Special Programs', weight: '15%', desc: 'Active programs matching project type' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100">
            <div className="w-12 h-12 rounded-lg bg-verdex-500 flex items-center justify-center text-white font-bold text-sm">
              {item.weight}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-900">{item.criterion}</div>
              <div className="text-sm text-gray-500">{item.desc}</div>
            </div>
            <CheckCircle className="w-5 h-5 text-verdex-500" />
          </div>
        ))}
      </div>

      <h2 id="matching-flow" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Matching Flow
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        The DFI matching process filters and ranks DFIs based on project characteristics:
      </p>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-verdex-50/30 border border-verdex-100">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Input */}
          <div className="p-4 rounded-xl bg-white border border-gray-200">
            <div className="text-xs text-gray-500 mb-2">INPUT</div>
            <div className="font-semibold text-gray-900 mb-3">Validated Project</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-600">Country</span>
                <span className="font-medium text-gray-900">Kenya</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-600">Sector</span>
                <span className="font-medium text-gray-900">Energy</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-600">Size</span>
                <span className="font-medium text-gray-900">$75M</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                <span className="text-gray-600">Type</span>
                <span className="font-medium text-gray-900">Solar IPP</span>
              </div>
            </div>
          </div>

          {/* Process */}
          <div className="flex items-center justify-center">
            <div className="p-4 rounded-xl bg-verdex-500 text-white text-center">
              <div className="text-xs mb-1">MATCHING ENGINE</div>
              <div className="font-bold">Score & Rank</div>
              <div className="text-xs mt-2 text-verdex-100">5 criteria × 7 DFIs</div>
            </div>
          </div>

          {/* Output */}
          <div className="p-4 rounded-xl bg-white border border-verdex-200">
            <div className="text-xs text-verdex-600 mb-2">OUTPUT</div>
            <div className="font-semibold text-gray-900 mb-3">Top 5 DFI Matches</div>
            <div className="space-y-2">
              {[
                { rank: 1, name: 'IFC', score: 95 },
                { rank: 2, name: 'AfDB', score: 90 },
                { rank: 3, name: 'BII', score: 82 },
                { rank: 4, name: 'FMO', score: 78 },
                { rank: 5, name: 'DEG', score: 72 },
              ].map((dfi) => (
                <div key={dfi.rank} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-verdex-500 text-white text-xs flex items-center justify-center font-bold">
                    {dfi.rank}
                  </div>
                  <div className="flex-1 font-medium text-gray-900">{dfi.name}</div>
                  <div className="text-sm text-verdex-600 font-semibold">{dfi.score}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 id="structure-example" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Recommended Blended Structure Example
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Example structure for a <strong>USD $75M Solar IPP in Kenya</strong>:
      </p>

      {/* Visual Capital Stack */}
      <div className="my-6 rounded-2xl overflow-hidden border border-verdex-200">
        {/* Stacked Bar Visual */}
        <div className="h-12 flex">
          <div className="bg-verdex-600 flex items-center justify-center text-white font-bold text-sm" style={{ width: '60%' }}>
            Senior Debt 60%
          </div>
          <div className="bg-verdex-500 flex items-center justify-center text-white font-bold text-sm" style={{ width: '15%' }}>
            Mezz
          </div>
          <div className="bg-verdex-400 flex items-center justify-center text-white font-bold text-sm" style={{ width: '25%' }}>
            Equity 25%
          </div>
        </div>

        {/* Details */}
        <div className="grid md:grid-cols-3 divide-x divide-verdex-100">
          <div className="p-4 bg-verdex-50/80">
            <div className="font-semibold text-verdex-800 mb-2">Senior Debt: $45M</div>
            <div className="space-y-1 text-sm text-verdex-700">
              <div className="flex justify-between">
                <span>IFC</span>
                <span className="font-medium">$25M</span>
              </div>
              <div className="flex justify-between">
                <span>Commercial Banks</span>
                <span className="font-medium">$15M</span>
              </div>
              <div className="flex justify-between">
                <span>AfDB</span>
                <span className="font-medium">$5M</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-verdex-50/50">
            <div className="font-semibold text-verdex-800 mb-2">Mezzanine: $11.25M</div>
            <div className="space-y-1 text-sm text-verdex-700">
              <div className="flex justify-between">
                <span>FMO (CIO)</span>
                <span className="font-medium">$6M</span>
              </div>
              <div className="flex justify-between">
                <span>BII</span>
                <span className="font-medium">$5.25M</span>
              </div>
            </div>
          </div>
          <div className="p-4 bg-verdex-50/30">
            <div className="font-semibold text-verdex-800 mb-2">Equity: $18.75M</div>
            <div className="space-y-1 text-sm text-verdex-700">
              <div className="flex justify-between">
                <span>Sponsor</span>
                <span className="font-medium">$12M</span>
              </div>
              <div className="flex justify-between">
                <span>IFC Co-invest</span>
                <span className="font-medium">$4M</span>
              </div>
              <div className="flex justify-between">
                <span>Local Partner</span>
                <span className="font-medium">$2.75M</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InfoBox type="tip" title="Structure Advisory: Roadmap Feature">
        Full blended finance structure recommendations with DFI role allocation is on our roadmap. The example above demonstrates the output format once verified DFI participation data is integrated.
      </InfoBox>

      <InfoBox type="success" title="DFI Matching: Live Now">
        DFI matching based on country, sector, size, and climate criteria is fully operational. Upload a project to see your top 5 DFI matches with scores and reasoning.
      </InfoBox>

    </DocPage>
  );
}
