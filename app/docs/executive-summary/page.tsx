import DocPage, { InfoBox, DataTable, FlowDiagram } from '@/components/docs/DocPage';
import { CheckCircle, Target, Building2, Shield, FileText, Search } from 'lucide-react';

export const metadata = {
  title: 'Executive Summary | Verdex Docs',
  description: 'High-level overview of Verdex - AI-powered green finance platform for African transition projects',
};

export default function ExecutiveSummaryPage() {
  return (
    <DocPage
      title="Executive Summary"
      description="Verdex is an AI-powered platform that makes African renewable energy and transition projects bankable by validating their compliance with international frameworks."
      breadcrumbs={[{ label: 'Getting Started', href: '/docs' }, { label: 'Executive Summary' }]}
      previousPage={{ title: 'Welcome', href: '/docs' }}
      nextPage={{ title: 'Quick Start', href: '/docs/quick-start' }}
      tableOfContents={[
        { id: 'the-problem', title: 'The Problem', level: 2 },
        { id: 'the-solution', title: 'The Solution', level: 2 },
        { id: 'key-features', title: 'Key Features', level: 2 },
        { id: 'how-it-works', title: 'How It Works', level: 2 },
        { id: 'impact', title: 'Impact', level: 2 },
        { id: 'why-different', title: 'What Makes This Different', level: 2 },
      ]}
    >
      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        {[
          { value: '$233B', label: 'Annual financing gap' },
          { value: '2%', label: 'Global climate finance' },
          { value: '60%', label: 'Best solar resources' },
          { value: '7', label: 'Priority countries' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-verdex-50 to-emerald-50 border border-verdex-100 text-center">
            <div className="text-2xl font-bold text-verdex-700">{stat.value}</div>
            <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <h2 id="the-problem" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        The Problem
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Africa faces a critical <strong className="text-verdex-700">USD 247 billion annual climate finance gap</strong>, receiving only 2% of global climate investments despite hosting 60% of the world&apos;s best solar resources.
      </p>

      <InfoBox type="warning" title="Why Projects Fail">
        Projects fail to secure financing not due to lack of viability, but because they cannot demonstrate compliance with evolving international transition finance frameworks like LMA, SBTi, and the Paris Agreement.
      </InfoBox>

      <DataTable
        headers={['Metric', 'Value', 'Source']}
        rows={[
          ['Annual climate finance needed', 'USD 277 billion', 'CPI 2024'],
          ['Current annual flows', 'USD 44 billion', 'CPI 2024'],
          ['Financing gap', 'USD 233 billion', 'Calculated'],
          ['Share of global climate finance', '2%', 'CPI Press Release'],
          ['Share of global emissions', '<4%', 'UNFCCC'],
        ]}
      />

      <h2 id="the-solution" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        The Solution
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Verdex is an <strong>AI-powered compliance infrastructure platform</strong> that validates African transition projects against international frameworks and connects them with appropriate financing sources.
      </p>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-100 my-8">
        <p className="text-xl font-display text-verdex-800 text-center">
          &ldquo;We validate transition credentials so African projects can secure transition financing.&rdquo;
        </p>
      </div>

      <DataTable
        headers={['Stakeholder', 'Problem Solved', 'Value Delivered']}
        rows={[
          [<span key="dev" className="font-semibold text-verdex-700">Project Developers</span>, 'Cannot demonstrate LMA compliance', 'Pre-validated bankable projects'],
          [<span key="bank" className="font-semibold text-verdex-700">Commercial Banks</span>, 'Risk of greenwashing in portfolios', 'Verified transition credentials'],
          [<span key="dfi" className="font-semibold text-verdex-700">DFIs</span>, 'High due diligence costs per project', 'Pre-screened pipeline'],
          [<span key="inv" className="font-semibold text-verdex-700">Climate Investors</span>, 'Difficulty finding compliant projects', 'Curated deal flow'],
        ]}
      />

      <h2 id="key-features" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Key Features
      </h2>

      <div className="grid md:grid-cols-2 gap-4 my-6">
        {[
          {
            icon: <Target className="w-5 h-5" />,
            title: 'LMA Transition Validator',
            description: 'Score projects against the 5 Core Components for Transition Loans',
          },
          {
            icon: <Building2 className="w-5 h-5" />,
            title: 'DFI Matching',
            description: 'Match with 7+ verified DFIs including IFC, AfDB, FMO, DEG',
          },
          {
            icon: <Shield className="w-5 h-5" />,
            title: 'Greenwashing Detection',
            description: 'AI-powered detection of red flags before they derail financing',
          },
          {
            icon: <FileText className="w-5 h-5" />,
            title: 'KPI Framework Generator',
            description: 'Generate LMA-compliant documentation and KPI frameworks',
          },
          {
            icon: <Search className="w-5 h-5" />,
            title: 'Clause Library',
            description: 'Search and generate LMA-standard clauses from 16+ templates',
          },
          {
            icon: <CheckCircle className="w-5 h-5" />,
            title: 'Paris Alignment',
            description: 'Validate alignment with Paris Agreement & SBTi Net-Zero Standard V2',
          },
        ].map((feature, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-verdex-200 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-verdex-50 flex items-center justify-center text-verdex-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900">{feature.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>

      <h2 id="how-it-works" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        How It Works
      </h2>

      <FlowDiagram
        steps={[
          { title: 'Upload', description: 'Project PDF or description' },
          { title: 'Validate', description: 'LMA 5 Components scoring' },
          { title: 'Match', description: 'DFI recommendations' },
          { title: 'Generate', description: 'KPIs & documentation' },
        ]}
      />

      <h2 id="impact" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Potential Impact
      </h2>

      <InfoBox type="success" title="If we enable just 10% of the financing gap to be addressed:">
        <ul className="mt-2 space-y-1">
          <li>• <strong>USD 23 billion</strong> additional annual climate finance</li>
          <li>• <strong>50+ GW</strong> additional renewable capacity</li>
          <li>• <strong>100+ million people</strong> with new electricity access</li>
          <li>• <strong>100+ million tonnes CO2e</strong> avoided annually</li>
        </ul>
      </InfoBox>

      <h2 id="why-different" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        What Makes This Different
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Existing tools offer generic ESG scoring or require expensive consultants. Verdex is <strong>purpose-built for LMA Transition Loan validation</strong> — grounded in 2,009 catalogued LMA documents, not fabricated criteria.
      </p>

      <DataTable
        headers={['Dimension', 'Traditional Approach', 'Verdex']}
        rows={[
          ['Compliance check', 'Manual consultant review', 'Automated in <60 seconds'],
          ['Framework coverage', 'Generic ESG metrics', 'LMA 5 Components + SBTi + Paris'],
          ['DFI matching', 'Relationship-based', 'Criteria-based matching to 7+ DFIs'],
          ['Standardization', 'Per-deal negotiation', 'Common framework across all projects'],
        ]}
      />

      <InfoBox type="info" title="Industry-Wide Standardization">
        Every project assessed on the same LMA framework means faster decisions, lower risk, and a common language between developers and lenders across the industry.
      </InfoBox>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-200">
        <h3 className="font-display font-semibold text-verdex-800 mb-3">Knowledge Base: Built to Scale</h3>
        <p className="text-gray-700 leading-relaxed mb-4">
          We&apos;ve catalogued <strong>2,009 LMA documents</strong> — the foundation is laid. Today, we index <strong>20 high-priority documents</strong> covering the October 2025 Transition Loan Guide, core facility agreements, and Africa-specific frameworks.
        </p>
        <p className="text-gray-700 leading-relaxed mb-4">
          This isn&apos;t a limitation — it&apos;s a deliberate MVP scope. The full catalogue is mapped, categorized, and ready for ingestion.
        </p>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-verdex-100">
          <div className="w-10 h-10 rounded-full bg-verdex-500 flex items-center justify-center text-white font-bold">→</div>
          <div>
            <div className="font-semibold text-verdex-800">Roadmap: Full LMA Coverage</div>
            <div className="text-sm text-gray-600">2,009 documents indexed = the most comprehensive LMA compliance engine in the market. No competitor has done this research.</div>
          </div>
        </div>
      </div>

    </DocPage>
  );
}
