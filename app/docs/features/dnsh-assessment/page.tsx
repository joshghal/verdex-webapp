import DocPage, { InfoBox, DataTable, CodeBlock } from '@/components/docs/DocPage';
import { Shield, Leaf, Droplets, Recycle, Factory, Trees } from 'lucide-react';

export const metadata = {
  title: 'DNSH Assessment | Verdex Docs',
  description: 'EU Taxonomy Do No Significant Harm screening for transition projects',
};

export default function DNSHAssessmentPage() {
  const objectives = [
    {
      id: 'climate_mitigation',
      name: 'Climate Change Mitigation',
      icon: <Leaf className="w-5 h-5" />,
      description: 'Project must not lead to significant GHG emissions',
      criteria: 'No increase in carbon lock-in, no fossil fuel expansion',
      color: 'verdex',
    },
    {
      id: 'climate_adaptation',
      name: 'Climate Change Adaptation',
      icon: <Shield className="w-5 h-5" />,
      description: 'Project must be resilient to physical climate risks',
      criteria: 'Climate risk assessment conducted, adaptation measures identified',
      color: 'emerald',
    },
    {
      id: 'water_resources',
      name: 'Water & Marine Resources',
      icon: <Droplets className="w-5 h-5" />,
      description: 'No significant harm to water bodies or marine ecosystems',
      criteria: 'Water efficiency measures, pollution prevention',
      color: 'blue',
    },
    {
      id: 'circular_economy',
      name: 'Circular Economy',
      icon: <Recycle className="w-5 h-5" />,
      description: 'Waste management and material efficiency',
      criteria: 'Waste hierarchy compliance, material recovery plans',
      color: 'amber',
    },
    {
      id: 'pollution_prevention',
      name: 'Pollution Prevention',
      icon: <Factory className="w-5 h-5" />,
      description: 'No significant air, water, or soil pollution',
      criteria: 'Emissions controls, pollution prevention measures',
      color: 'rose',
    },
    {
      id: 'biodiversity',
      name: 'Biodiversity & Ecosystems',
      icon: <Trees className="w-5 h-5" />,
      description: 'Protection of ecosystems and habitats',
      criteria: 'ESIA conducted, no critical habitat destruction',
      color: 'teal',
    },
  ];

  return (
    <DocPage
      title="EU Taxonomy DNSH Assessment"
      description="Screen projects against the EU Taxonomy's 'Do No Significant Harm' criteria across six environmental objectives."
      breadcrumbs={[{ label: 'Features' }, { label: 'DNSH Assessment' }]}
      previousPage={{ title: 'Greenwash Detection', href: '/docs/features/greenwash-detection' }}
      nextPage={{ title: 'Climate Intelligence', href: '/docs/features/climate-intelligence' }}
      tableOfContents={[
        { id: 'overview', title: 'Overview', level: 2 },
        { id: 'why-dnsh', title: 'Why DNSH Matters', level: 2 },
        { id: 'six-objectives', title: 'The 6 Environmental Objectives', level: 2 },
        { id: 'scoring', title: 'DNSH Scoring', level: 2 },
        { id: 'integration', title: 'Integration with Greenwashing', level: 2 },
        { id: 'implementation', title: 'Technical Implementation', level: 2 },
      ]}
    >
      <h2 id="overview" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Overview
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        The EU Taxonomy Regulation (Article 17) requires that economic activities claiming environmental sustainability must not cause <strong>&quot;significant harm&quot;</strong> to any of six environmental objectives. Verdex integrates DNSH screening as part of the greenwashing detection system.
      </p>

      <InfoBox type="info" title="EU Taxonomy Article 17">
        An economic activity is considered to cause significant harm if it leads to significant negative impacts on any of the six environmental objectives, regardless of its contribution to other objectives.
      </InfoBox>

      <h2 id="why-dnsh" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Why DNSH Matters for African Projects
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        European DFIs like <strong>FMO, DEG, Proparco, and BII</strong> are increasingly applying EU Taxonomy criteria to their investments. DNSH compliance is becoming a prerequisite for accessing European climate finance.
      </p>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-100">
        <p className="text-lg font-display text-verdex-800 text-center">
          &ldquo;Projects that fail DNSH screening may be excluded from EU Taxonomy-aligned portfolios, even if they contribute to climate mitigation.&rdquo;
        </p>
      </div>

      <DataTable
        headers={['Regulation', 'Effective Date', 'Impact']}
        rows={[
          ['EU Taxonomy Regulation', 'July 2020', 'Defines DNSH criteria for sustainable activities'],
          ['SFDR Level 2', 'January 2023', 'Requires DNSH disclosure for Article 8/9 funds'],
          ['EU Green Bond Standard', '2024', 'Mandates DNSH compliance for green bonds'],
          ['Corporate Sustainability Due Diligence Directive', '2026', 'Extends DNSH to supply chains'],
        ]}
      />

      <h2 id="six-objectives" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        The 6 Environmental Objectives
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Verdex evaluates projects against each of the six EU Taxonomy environmental objectives:
      </p>

      <div className="grid md:grid-cols-2 gap-4 my-6">
        {objectives.map((obj) => (
          <div key={obj.id} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-verdex-200 transition-colors">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-${obj.color}-50 flex items-center justify-center text-${obj.color}-600`}>
                {obj.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{obj.name}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-2">{obj.description}</p>
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded-lg">
              <strong>Criteria:</strong> {obj.criteria}
            </div>
          </div>
        ))}
      </div>

      <h2 id="scoring" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        DNSH Scoring Framework
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Each objective is scored on a 0-4 scale, with a maximum total of 24 points:
      </p>

      <div className="space-y-4 my-6">
        <div className="p-5 rounded-xl bg-verdex-50 border border-verdex-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-verdex-500 flex items-center justify-center text-white font-bold">4</div>
            <div>
              <div className="font-semibold text-verdex-800">NO HARM</div>
              <div className="text-sm text-verdex-600">Project demonstrates positive or neutral impact</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold">2</div>
            <div>
              <div className="font-semibold text-amber-800">POTENTIAL HARM</div>
              <div className="text-sm text-amber-600">Risks identified but can be mitigated</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-rose-50 border border-rose-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-rose-500 flex items-center justify-center text-white font-bold">0</div>
            <div>
              <div className="font-semibold text-rose-800">SIGNIFICANT HARM</div>
              <div className="text-sm text-rose-600">Fundamental incompatibility with objective</div>
            </div>
          </div>
        </div>
      </div>

      <DataTable
        headers={['DNSH Score', 'Normalized', 'Status', 'Implication']}
        rows={[
          ['20-24', '83-100%', <span key="1" className="px-2 py-1 rounded-full bg-verdex-100 text-verdex-700 text-xs font-semibold">COMPLIANT</span>, 'Meets EU Taxonomy DNSH requirements'],
          ['12-19', '50-79%', <span key="2" className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">PARTIAL</span>, 'Some objectives need attention'],
          ['0-11', '0-49%', <span key="3" className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">NON-COMPLIANT</span>, 'Significant harm identified'],
        ]}
      />

      <h2 id="integration" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Integration with Greenwashing Detection
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        DNSH assessment is not a separate module—it&apos;s integrated into the greenwashing detection system as a &quot;harm detection&quot; layer.
      </p>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-verdex-50/30 border border-verdex-100">
        <h3 className="font-semibold text-gray-900 mb-4">Combined Greenwashing Score Formula</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-white">
            <div className="w-16 font-bold text-verdex-600">50%</div>
            <div className="text-gray-700">AI-powered greenwashing pattern detection</div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-white">
            <div className="w-16 font-bold text-verdex-600">30%</div>
            <div className="text-gray-700">Rule-based red flag detection (15 patterns)</div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-white">
            <div className="w-16 font-bold text-amber-600">20%</div>
            <div className="text-gray-700">DNSH environmental harm assessment</div>
          </div>
        </div>
      </div>

      <InfoBox type="warning" title="Fundamental Incompatibility">
        Some project types are <strong>fundamentally incompatible</strong> with EU Taxonomy regardless of mitigation measures. These include:
        <ul className="mt-2 space-y-1">
          <li>&bull; New fossil fuel extraction or infrastructure</li>
          <li>&bull; Coal-related activities</li>
          <li>&bull; Projects in critical habitats without ESIA</li>
        </ul>
        These receive a score of 0 for the relevant objective and cannot be remediated.
      </InfoBox>

      <h2 id="implementation" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Technical Implementation
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        The DNSH evaluator uses AI-powered assessment with sector-weighted scoring:
      </p>

      <CodeBlock
        language="typescript"
        code={`// DNSH Assessment Types
interface DNSHCriterionResult {
  objective: DNSHObjective;
  objectiveName: string;
  status: 'no_harm' | 'potential_harm' | 'significant_harm';
  score: number;        // 0-4
  evidence: string;
  concern?: string;
  recommendation?: string;
  isFundamentallyIncompatible?: boolean;
}

interface DNSHAssessment {
  overallStatus: 'compliant' | 'partial' | 'non_compliant';
  totalScore: number;           // 0-24
  normalizedScore: number;      // 0-100
  criteria: DNSHCriterionResult[];
  keyRisks: string[];
  recommendations: string[];    // Only for fixable issues
}

// Sector-weighted evaluation
const SECTOR_WEIGHTS: Record<Sector, Partial<Record<DNSHObjective, number>>> = {
  mining: {
    water_resources: 1.5,       // Mining has higher water impact
    biodiversity: 1.5,          // Mining affects ecosystems
  },
  agriculture: {
    biodiversity: 1.5,          // Land use impacts
    water_resources: 1.3,       // Irrigation concerns
  },
  // ... other sectors
};`}
      />

      <InfoBox type="tip" title="Africa-Contextualized Assessment">
        DNSH evaluation is contextualized for African conditions:
        <ul className="mt-2 space-y-1">
          <li>&bull; <strong>Water stress:</strong> Higher weight in Sahel and North Africa</li>
          <li>&bull; <strong>Biodiversity:</strong> Critical habitat mapping (Congo Basin, Madagascar)</li>
          <li>&bull; <strong>Climate adaptation:</strong> Physical risk data from Open-Meteo</li>
        </ul>
      </InfoBox>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-200">
        <h3 className="font-display font-semibold text-verdex-800 mb-3">DNSH: Your Competitive Advantage</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          Verdex is the <strong>only hackathon project</strong> that integrates EU Taxonomy DNSH screening. This positions African projects for:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-verdex-500" />
            European DFI compliance (FMO, DEG, Proparco, BII)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-verdex-500" />
            EU Green Bond Standard eligibility
          </li>
          <li className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-verdex-500" />
            SFDR Article 8/9 fund investment criteria
          </li>
        </ul>
      </div>

    </DocPage>
  );
}
