import DocPage, { InfoBox, DataTable } from '@/components/docs/DocPage';

export const metadata = {
  title: 'Solution Overview | Verdex Docs',
  description: 'What is Verdex and how does it solve the climate finance gap',
};

export default function SolutionOverviewPage() {
  return (
    <DocPage
      title="Solution Overview"
      description="Verdex is an AI-powered compliance infrastructure platform that validates African transition projects against international frameworks."
      breadcrumbs={[{ label: 'Problem & Solution' }, { label: 'Solution Overview' }]}
      previousPage={{ title: 'Priority Countries', href: '/docs/problem/priority-countries' }}
      nextPage={{ title: 'LMA Validator', href: '/docs/features/lma-validator' }}
      tableOfContents={[
        { id: 'what-is-verdex', title: 'What is Verdex?', level: 2 },
        { id: 'value-proposition', title: 'Value Proposition', level: 2 },
        { id: 'how-it-works', title: 'How It Works', level: 2 },
        { id: 'design-principles', title: 'Design Principles', level: 2 },
      ]}
    >
      <h2 id="what-is-verdex" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        What is Verdex?
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Verdex is an <strong>AI-powered compliance infrastructure platform</strong> that validates African transition projects against international frameworks and connects them with appropriate financing sources.
      </p>

      <div className="my-8 p-8 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-100 text-center">
        <p className="text-2xl font-display text-verdex-800">
          &ldquo;We validate transition credentials so African projects can secure transition financing.&rdquo;
        </p>
      </div>

      <h2 id="value-proposition" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Core Value Proposition
      </h2>

      <DataTable
        headers={['Stakeholder', 'Problem Solved', 'Value Delivered']}
        rows={[
          [<span key="1" className="font-semibold text-verdex-700">Project Developers</span>, 'Cannot demonstrate LMA compliance', 'Pre-validated bankable projects'],
          [<span key="2" className="font-semibold text-verdex-700">Commercial Banks</span>, 'Risk of greenwashing in portfolios', 'Verified transition credentials'],
          [<span key="3" className="font-semibold text-verdex-700">DFIs</span>, 'High due diligence costs per project', 'Pre-screened pipeline'],
          [<span key="4" className="font-semibold text-verdex-700">Climate Investors</span>, 'Difficulty finding compliant projects', 'Curated deal flow'],
        ]}
      />

      <h2 id="how-it-works" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        How It Works
      </h2>

      <div className="my-8 grid md:grid-cols-4 gap-4">
        {[
          {
            step: '1',
            title: 'Upload',
            description: 'Submit project PDF and description',
            color: 'from-verdex-500 to-verdex-600',
          },
          {
            step: '2',
            title: 'Validate',
            description: 'AI scores against LMA 5 Components',
            color: 'from-emerald-500 to-emerald-600',
          },
          {
            step: '3',
            title: 'Match',
            description: 'Connect with relevant DFIs',
            color: 'from-teal-500 to-teal-600',
          },
          {
            step: '4',
            title: 'Generate',
            description: 'KPI framework + documentation',
            color: 'from-cyan-500 to-cyan-600',
          },
        ].map((item, idx) => (
          <div key={idx} className="relative p-6 rounded-xl bg-white border border-gray-100 text-center">
            <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-4`}>
              {item.step}
            </div>
            <h3 className="font-semibold text-gray-900">{item.title}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
            {idx < 3 && (
              <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-gray-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>

      <InfoBox type="success" title="End-to-End Solution">
        Verdex provides a complete workflow from project submission to financing readiness, eliminating the need for multiple consultants and manual compliance checks.
      </InfoBox>

      <h2 id="design-principles" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Design Principles
      </h2>

      <div className="grid md:grid-cols-2 gap-4 my-6">
        {[
          {
            title: 'Simple for First-Time Users',
            description: 'Upload a PDF or fill a form — no training required. Assessment completes in under 60 seconds.',
          },
          {
            title: 'Rigorous for DFI Due Diligence',
            description: 'Scoring based on the October 2025 Transition Loan Guide. Every rule traceable to LMA documentation.',
          },
          {
            title: 'Scalable Architecture',
            description: 'Stateless, cloud-native design. Handles one project or thousands without infrastructure changes.',
          },
          {
            title: 'Transparent Methodology',
            description: 'Full documentation of scoring logic, sources, and limitations. No black-box decisions.',
          },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100 hover:border-verdex-200 transition-colors">
            <div className="font-semibold text-gray-900 mb-2">{item.title}</div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

    </DocPage>
  );
}
