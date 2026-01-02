import DocPage, { DataTable, InfoBox } from '@/components/docs/DocPage';

export const metadata = {
  title: 'Knowledge Base | Verdex Docs',
  description: 'Sources and documents indexed in the Verdex knowledge base',
};

export default function KnowledgeBasePage() {
  return (
    <DocPage
      title="Knowledge Base"
      description="The sources and documents that power Verdex&apos;s AI-driven validation and recommendations."
      breadcrumbs={[{ label: 'Technical' }, { label: 'Knowledge Base' }]}
      previousPage={{ title: 'Architecture', href: '/docs/technical/architecture' }}
      nextPage={{ title: 'API Reference', href: '/docs/technical/api-reference' }}
      tableOfContents={[
        { id: 'sources', title: 'Document Sources', level: 2 },
        { id: 'core-documents', title: 'LMA Core Documents (16)', level: 2 },
        { id: 'vector-search', title: 'Vector Search', level: 2 },
      ]}
    >
      <h2 id="sources" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Document Sources
      </h2>

      <DataTable
        headers={['Source', 'Docs', 'Use Case']}
        rows={[
          [<a key="1" href="#core-documents" className="font-semibold text-verdex-700 hover:underline">LMA Core Documents</a>, '16', 'Facility agreements, guides, templates (indexed via Pinecone)'],
          [<a key="2" href="https://www.lma.eu.com/application/files/9917/6035/1809/Guide_to_Transition_Loans_-_16_October_2025.pdf" target="_blank" rel="noopener noreferrer" className="text-verdex-600 hover:underline">LMA Transition Loan Guide</a>, '1', '5 Core Components validation'],
          [<a key="3" href="https://www.lma.eu.com/application/files/1917/4298/0817/Green_Loan_Principles_-_26_March_2025.pdf" target="_blank" rel="noopener noreferrer" className="text-verdex-600 hover:underline">Green Loan Principles (Mar 2025)</a>, '1', 'Green loan compliance'],
          [<a key="4" href="https://www.lma.eu.com/application/files/6317/4298/0865/Sustainability-Linked_Loan_Principles_-_26_March_2025.pdf" target="_blank" rel="noopener noreferrer" className="text-verdex-600 hover:underline">SLL Principles (Mar 2025)</a>, '1', 'Sustainability-linked loan compliance'],
          [<a key="5" href="https://sciencebasedtargets.org/resources/files/Net-Zero-Standard-v2-Consultation-Draft.pdf" target="_blank" rel="noopener noreferrer" className="text-verdex-600 hover:underline">SBTi Net-Zero Standard V2</a>, '1', 'Science-based target validation'],
          [<a key="6" href="https://unfccc.int/sites/default/files/english_paris_agreement.pdf" target="_blank" rel="noopener noreferrer" className="text-verdex-600 hover:underline">Paris Agreement</a>, '1', 'Article 2, 4, 6, 9, 13 alignment'],
          ['Country NDCs', '7', 'National target alignment (Kenya, Nigeria, South Africa, Egypt, Morocco, Ghana, Tanzania)'],
          ['Sector Pathways', '5', 'Decarbonization trajectory validation'],
        ]}
      />

      <h2 id="core-documents" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        LMA Core Documents (16)
      </h2>

      <p className="text-gray-600 mb-6">
        These documents are indexed via Pinecone for semantic clause search. All sourced directly from{' '}
        <a href="https://www.lma.eu.com" target="_blank" rel="noopener noreferrer" className="text-verdex-600 hover:underline">lma.eu.com</a>.
      </p>

      <div className="space-y-3">
        {[
          { name: 'Africa and Renewables', url: 'https://www.lma.eu.com/application/files/5515/4990/3008/Africa_and_Renewables_FINAL.PDF', category: 'Africa' },
          { name: 'East African Loan Markets Conference Report (2025)', url: 'https://www.lma.eu.com/application/files/3917/6311/1176/East_African_Loan_Markets_Conference_Report.pdf', category: 'Africa' },
          { name: 'South African Loan Markets Conference Report', url: 'https://www.lma.eu.com/application/files/4317/5388/6960/Report_South_African_Loan_Markets_Conference_and_Sustainable_Finance_Seminar_.pdf', category: 'Africa' },
          { name: 'Role of DFIs Funding African Development (2015)', url: 'https://www.lma.eu.com/application/files/8714/6909/8934/LMA_East_Africa_Syndicated_Loans_Conference_2015_Role_of_DFIs_Funding_African_Development.pdf', category: 'DFI' },
          { name: 'User Guide: Kenya, Nigeria, Tanzania, Uganda, Zambia', url: 'https://www.lma.eu.com/application/files/4915/4643/0846/User_Guide_to_Facility_Agreements_for_Use_in_Kenya_Nigeria_Tanzania_Uganda_and_Zambia.pdf', category: 'Africa' },
          { name: 'OHADA Guide (English)', url: 'https://www.lma.eu.com/application/files/8514/6859/4517/OHADA_ENGLISH.pdf', category: 'Africa' },
          { name: 'Baker McKenzie Transition Finance Briefing', url: 'https://www.lma.eu.com/application/files/9216/8183/6153/Baker_McKenzie_Transition_Finance_Briefing.pdf', category: 'Transition' },
          { name: 'Financing Sustainable Development: African Perspective', url: 'https://www.lma.eu.com/application/files/1816/4338/1905/financing-sustainable-development-an-african-perspective_22-01-27.pdf', category: 'Africa' },
          { name: 'Best Practice Guide: Sustainability-Linked Leveraged Loans', url: 'https://www.lma.eu.com/application/files/5216/9649/1549/Best_Practice_Guide_to_Sustainability_Linked_Leveraged_Loans.pdf', category: 'SLL' },
          { name: 'South African Law Facility Agreement (ZARONIA)', url: 'https://www.lma.eu.com/application/files/9317/6530/0981/Mark_Up_-_South_African_Law_Unsecured_Single_Currency_Single_Borrower_Term_and_Revolving_Facilities_Agreement_Compounded_ZARONIA.pdf', category: 'Template' },
          { name: 'Draft Provisions for Green Loans (Nov 2024)', url: 'https://www.lma.eu.com/application/files/4017/3090/6344/Draft_Provisions_for_Green_Loans_-_7_Nov_2024.pdf', category: 'Green' },
          { name: 'Guidance on Green Loan Principles (Mar 2025)', url: 'https://www.lma.eu.com/application/files/1717/4298/0842/Guidance_on_Green_Loan_Principles_-_26_March_2025.pdf', category: 'Guidance' },
          { name: 'Guidance on SLL Principles (Mar 2025)', url: 'https://www.lma.eu.com/application/files/3517/4298/0872/Guidance_on_Sustainability-Linked_Loan_Principles_-_26_March_2025.pdf', category: 'Guidance' },
          { name: 'Southern Africa Conference: Role of DFIs (2016)', url: 'https://www.lma.eu.com/application/files/3614/6902/5603/Southern_Africa_Syndicated_Conference_2016_Role_of_DFIs.pdf', category: 'DFI' },
          { name: 'Risk and Raising Capital in East Africa', url: 'https://www.lma.eu.com/application/files/1814/8783/9364/Risk_and_Raising_Capital_in_East_Africa.pdf', category: 'Africa' },
          { name: 'Southern Africa: Renewable Energy IPP Procurement (2014)', url: 'https://www.lma.eu.com/application/files/8614/6910/1030/Southern_Africa_Syndicated_Loans_Conference_2014_Renewable_Energy_IPP_Procurement.pdf', category: 'Africa' },
        ].map((doc, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-verdex-50 transition-colors">
            <span className="text-xs font-mono bg-verdex-100 text-verdex-700 px-2 py-1 rounded">{doc.category}</span>
            <a
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-700 hover:text-verdex-600 hover:underline flex-1"
            >
              {doc.name}
            </a>
          </div>
        ))}
      </div>

      <h2 id="vector-search" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Vector Search Implementation
      </h2>

      <div className="my-6 p-6 rounded-xl bg-verdex-50 border border-verdex-100">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-verdex-800 mb-3">Embeddings</h3>
            <ul className="space-y-2 text-verdex-700 text-sm">
              <li>• Model: BGE-small-en</li>
              <li>• Dimension: 384</li>
              <li>• Chunking: 500 tokens with overlap</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-verdex-800 mb-3">Vector Database</h3>
            <ul className="space-y-2 text-verdex-700 text-sm">
              <li>• Provider: Pinecone</li>
              <li>• Index: LMA clause vectors</li>
              <li>• Metadata: clause type, doc type, source</li>
            </ul>
          </div>
        </div>
      </div>

      <InfoBox type="tip" title="Semantic Search">
        The knowledge base enables semantic search across all indexed documents, allowing users to find relevant clauses and provisions based on meaning rather than exact keyword matches.
      </InfoBox>

    </DocPage>
  );
}
