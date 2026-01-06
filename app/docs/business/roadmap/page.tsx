import DocPage, { InfoBox, DataTable } from '@/components/docs/DocPage';
import { Database, FileText, Globe, TrendingUp, Layers, ClipboardCheck, Search } from 'lucide-react';

export const metadata = {
  title: 'Roadmap | Verdex Docs',
  description: 'Future development roadmap for Verdex platform',
};

export default function RoadmapPage() {
  return (
    <DocPage
      title="Future Roadmap"
      description="From MVP to the most comprehensive LMA compliance engine in the market."
      breadcrumbs={[{ label: 'Business' }, { label: 'Roadmap' }]}
      previousPage={{ title: 'Business Model', href: '/docs/business/model' }}
      nextPage={{ title: 'References', href: '/docs/resources/references' }}
      tableOfContents={[
        { id: 'progress', title: 'Progress Overview', level: 2 },
        { id: 'current-state', title: 'Current State (MVP)', level: 2 },
        { id: 'knowledge-base-expansion', title: 'Knowledge Base Expansion', level: 2 },
        { id: 'financing-structure', title: 'Financing Structure', level: 2 },
        { id: 'documentation-checklist', title: 'Documentation Checklist', level: 2 },
        { id: 'advanced-clauses', title: 'Advanced Clause Features', level: 2 },
        { id: 'vision', title: 'The Vision', level: 2 },
      ]}
    >
      {/* Progress Overview */}
      <h2 id="progress" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Progress Overview
      </h2>

      {/* Hero Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {[
          { icon: <FileText className="w-5 h-5" />, value: '21', label: 'Docs Indexed', sub: 'MVP' },
          { icon: <Database className="w-5 h-5" />, value: '2,009', label: 'Docs Catalogued', sub: 'Ready' },
          { icon: <Globe className="w-5 h-5" />, value: '83', label: 'Africa-Specific', sub: 'Mapped' },
          { icon: <TrendingUp className="w-5 h-5" />, value: '12', label: 'Years Coverage', sub: '2013-2025' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-verdex-50 to-emerald-50 border border-verdex-100 text-center">
            <div className="w-10 h-10 mx-auto rounded-lg bg-verdex-500 flex items-center justify-center text-white mb-2">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-verdex-700">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
            <div className="text-xs text-verdex-600 font-medium">{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="my-8 p-4 rounded-xl bg-white border border-gray-200">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Knowledge Base Progress</span>
          <span className="font-semibold text-verdex-700">21 / 2,009 indexed (1%)</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full bg-verdex-500 rounded-full" style={{ width: '1%' }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>MVP Complete</span>
          <span>Full Library Ready</span>
        </div>
      </div>

      <h2 id="current-state" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Current State (MVP)
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Today, Verdex indexes <strong>21 high-priority documents</strong> — a deliberate MVP scope covering the essentials for transition loan validation.
      </p>

      <DataTable
        headers={['Category', 'Indexed', 'Coverage']}
        rows={[
          ['Transition Loan Guide (Oct 2025)', '1', '5 Core Components scoring'],
          ['Core Facility Agreements', '13', 'Green Loan, SLL Principles, templates'],
          ['Africa-Specific', '3', 'OHADA, East Africa, South Africa'],
          ['External Frameworks', '2', 'SBTi Net-Zero V2, Paris Agreement'],
          [<span key="total" className="font-bold text-verdex-700">Total</span>, <span key="num" className="font-bold">21</span>, <span key="cov" className="font-bold">MVP Complete</span>],
        ]}
      />

      <h2 id="knowledge-base-expansion" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Knowledge Base Expansion
      </h2>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-200 my-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="px-3 py-1 rounded-full bg-verdex-500 text-white text-xs font-semibold">Phase 2</span>
          <span className="text-verdex-700 font-semibold">The Moat</span>
        </div>

        <p className="text-gray-700 leading-relaxed mb-4">
          We&apos;ve catalogued <strong>2,009 LMA documents</strong> spanning 12+ years. The research is done. The categorization is complete. The infrastructure is ready.
        </p>

        <DataTable
          headers={['Category', 'Catalogued', 'Ready to Index']}
          rows={[
            ['Africa-Specific Documents', '83', '✓ Mapped'],
            ['Sustainability & Green Finance', '161', '✓ Mapped'],
            ['Transition Finance', '42', '✓ Mapped'],
            ['Facility Agreements', '70', '✓ Mapped'],
            ['Full LMA Library', '2,009', '✓ Categorized'],
          ]}
        />

        <div className="mt-6 p-4 rounded-xl bg-white border border-verdex-100">
          <div className="font-semibold text-verdex-800 mb-2">What Full Indexing Unlocks:</div>
          <ul className="space-y-2 text-gray-600 text-sm">
            <li>• <strong>Semantic search</strong> across every LMA clause ever published</li>
            <li>• <strong>Template matching</strong> — identify which LMA template a document is based on</li>
            <li>• <strong>Deviation detection</strong> — flag where a contract differs from LMA standard</li>
            <li>• <strong>Historical context</strong> — trace how clauses evolved over 12 years</li>
          </ul>
        </div>

        <div className="mt-4 p-4 rounded-xl bg-verdex-500 text-white">
          <div className="font-semibold mb-1">Competitive Moat</div>
          <div className="text-sm text-verdex-100">No competitor has done this research. 2,009 documents indexed = the most comprehensive LMA compliance engine in the market.</div>
        </div>
      </div>

      <InfoBox type="info" title="Planned Development">
        The following features are planned for future development, pending proper data sourcing and validation.
      </InfoBox>

      <h2 id="financing-structure" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Recommended Financing Structure
      </h2>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-verdex-50/30 border border-gray-200 my-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-verdex-100 flex items-center justify-center">
            <Layers className="w-5 h-5 text-verdex-600" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded-full bg-verdex-100 text-verdex-700 text-xs font-semibold">Planned</span>
            <p className="text-gray-500 text-sm mt-1">Requires verified DFI participation data</p>
          </div>
        </div>

        {/* Preview Visual */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-gray-200">
          <div className="text-xs text-gray-500 mb-2">Preview: Capital Stack Visualization</div>
          <div className="h-8 flex rounded-lg overflow-hidden">
            <div className="bg-verdex-600 flex items-center justify-center text-white text-xs font-medium" style={{ width: '60%' }}>Senior 60%</div>
            <div className="bg-verdex-500 flex items-center justify-center text-white text-xs font-medium" style={{ width: '15%' }}>15%</div>
            <div className="bg-verdex-400 flex items-center justify-center text-white text-xs font-medium" style={{ width: '25%' }}>Equity 25%</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">What it would do</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Visual capital stack (Senior / Mezz / Equity)</li>
              <li>• DFI role recommendations per tranche</li>
              <li>• Estimated pricing ranges</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Verified DFI participation policies</li>
              <li>• IFC/AfDB operational criteria</li>
              <li>• DFI partnership validation</li>
            </ul>
          </div>
        </div>
      </div>

      <h2 id="documentation-checklist" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Documentation Checklist
      </h2>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-verdex-50/30 border border-gray-200 my-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-verdex-100 flex items-center justify-center">
            <ClipboardCheck className="w-5 h-5 text-verdex-600" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded-full bg-verdex-100 text-verdex-700 text-xs font-semibold">Planned</span>
            <p className="text-gray-500 text-sm mt-1">Requires official sourcing</p>
          </div>
        </div>

        {/* Preview Visual */}
        <div className="mb-6 p-4 rounded-xl bg-white border border-gray-200">
          <div className="text-xs text-gray-500 mb-3">Preview: Interactive Checklist</div>
          <div className="space-y-2">
            {[
              { label: 'Corporate Documents', progress: 4, total: 8 },
              { label: 'Project Technical', progress: 2, total: 10 },
              { label: 'Financial Statements', progress: 0, total: 6 },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-32 text-xs text-gray-600">{item.label}</div>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-verdex-500 rounded-full"
                    style={{ width: `${(item.progress / item.total) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 w-12 text-right">{item.progress}/{item.total}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">What it would do</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 38-54 item checklist across 6 categories</li>
              <li>• DFI-specific requirements flagged</li>
              <li>• Interactive progress tracking</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Corporate', count: 8 },
                { name: 'Project', count: 10 },
                { name: 'Financial', count: 6 },
                { name: 'Environmental', count: 12 },
                { name: 'Transition', count: 10 },
                { name: 'Country', count: 8 },
              ].map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-verdex-50">
                  <span className="text-sm text-verdex-700">{cat.name}</span>
                  <span className="text-xs text-verdex-600 font-medium">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <h2 id="advanced-clauses" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Advanced Clause Features
      </h2>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-200 my-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-verdex-500 flex items-center justify-center">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="px-2 py-0.5 rounded-full bg-verdex-500 text-white text-xs font-semibold">Partial</span>
            <p className="text-verdex-700 text-sm mt-1">Search works, advanced features planned</p>
          </div>
        </div>

        {/* Current vs Planned */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 rounded-xl bg-white border border-verdex-200">
            <h3 className="font-semibold text-verdex-800 mb-3">Available Now</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Semantic clause search</li>
              <li>• 16+ LMA templates indexed</li>
              <li>• Keyword and context matching</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl bg-white border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-3">Planned Enhancements</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Filter by LMA component (1-5)</li>
              <li>• Filter by sector</li>
              <li>• Auto-populate with project data</li>
              <li>• Export to DOCX with variables</li>
            </ul>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 rounded-xl bg-verdex-500 text-white">
          <div className="font-semibold mb-1">Full Library Unlocks</div>
          <div className="text-sm text-verdex-100">With 2,009 documents indexed, clause search becomes the most comprehensive LMA clause library available anywhere.</div>
        </div>
      </div>

      <h2 id="vision" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        The Vision
      </h2>

      <div className="p-8 rounded-2xl bg-gradient-to-br from-verdex-600 to-emerald-600 text-white my-6">
        <p className="text-xl font-display mb-6">
          &ldquo;The infrastructure layer for African transition finance — where every project speaks the same language as global lenders.&rdquo;
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              phase: 'Today',
              title: 'Validation Engine',
              items: ['21 docs indexed', 'LMA 5 Components scoring', '7 DFI matching', 'Greenwashing detection'],
            },
            {
              phase: 'Phase 2',
              title: 'Full Knowledge Base',
              items: ['2,009 docs indexed', 'Semantic clause search', 'Template matching', 'Deviation detection'],
            },
            {
              phase: 'Phase 3',
              title: 'Market Infrastructure',
              items: ['DFI pipeline integration', 'Real-time deal flow', 'Standardized due diligence', 'Pan-African coverage'],
            },
          ].map((phase, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-white/10 backdrop-blur">
              <div className="text-verdex-200 text-xs font-semibold mb-1">{phase.phase}</div>
              <div className="font-semibold mb-2">{phase.title}</div>
              <ul className="text-sm text-verdex-100 space-y-1">
                {phase.items.map((item, i) => (
                  <li key={i}>• {item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <InfoBox type="success" title="The Foundation is Laid">
        2,009 documents catalogued. 83 Africa-specific materials identified. 12 years of LMA engagement mapped. The research that no one else has done — ready to become the most comprehensive LMA compliance engine in the market.
      </InfoBox>

    </DocPage>
  );
}
