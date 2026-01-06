import DocPage, { InfoBox, DataTable, CodeBlock } from '@/components/docs/DocPage';

export const metadata = {
  title: 'Technical Architecture | Verdex Docs',
  description: 'Deep dive into Verdex platform architecture and AI engine',
};

export default function ArchitecturePage() {
  return (
    <DocPage
      title="Technical Architecture"
      description="Deep dive into the Verdex platform architecture, AI engines, and knowledge base."
      breadcrumbs={[{ label: 'Technical' }, { label: 'Architecture' }]}
      previousPage={{ title: 'Clause Library', href: '/docs/features/clause-library' }}
      nextPage={{ title: 'Knowledge Base', href: '/docs/technical/knowledge-base' }}
      tableOfContents={[
        { id: 'overview', title: 'System Overview', level: 2 },
        { id: 'frontend', title: 'Frontend', level: 2 },
        { id: 'ai-engine', title: 'AI Engine', level: 2 },
        { id: 'knowledge-base', title: 'Knowledge Base', level: 2 },
        { id: 'tech-stack', title: 'Tech Stack', level: 2 },
        { id: 'scalability', title: 'Scalability & Design', level: 2 },
      ]}
    >
      <h2 id="overview" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        System Overview
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Verdex is built as a modern web application with an AI-powered backend that processes project documents, validates compliance, and generates recommendations.
      </p>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-100">
        <div className="grid md:grid-cols-4 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white border border-verdex-100 shadow-sm">
            <div className="text-2xl font-bold text-verdex-600">Next.js</div>
            <div className="text-xs text-gray-500 mt-1">Frontend</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-verdex-100 shadow-sm">
            <div className="text-2xl font-bold text-verdex-600">Groq & ASI:One</div>
            <div className="text-xs text-gray-500 mt-1">AI Engine</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-verdex-100 shadow-sm">
            <div className="text-2xl font-bold text-verdex-600">Pinecone</div>
            <div className="text-xs text-gray-500 mt-1">Vector DB</div>
          </div>
          <div className="p-4 rounded-xl bg-white border border-verdex-100 shadow-sm">
            <div className="text-2xl font-bold text-verdex-600">RAG</div>
            <div className="text-xs text-gray-500 mt-1">Knowledge</div>
          </div>
        </div>
      </div>

      <h2 id="frontend" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Frontend Layer
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        The frontend is built with Next.js and provides four main interfaces:
      </p>

      <div className="grid md:grid-cols-2 gap-4 my-6">
        {[
          { title: 'Upload / Input', desc: 'Project document upload and form input' },
          { title: 'Transition Assessment', desc: 'LMA 5 Components scoring dashboard' },
          { title: 'Financing Pathway', desc: 'DFI matching and structure recommendations' },
          { title: 'Results & Export', desc: 'PDF report generation and clause search' },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100">
            <div className="font-semibold text-gray-900">{item.title}</div>
            <div className="text-sm text-gray-600 mt-1">{item.desc}</div>
          </div>
        ))}
      </div>

      <h2 id="ai-engine" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        AI Engine
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        The AI engine is powered by <strong>Groq (Llama 4 Maverick)</strong> with RAG (Retrieval-Augmented Generation) for accurate, grounded responses.
      </p>

      <div className="my-6 space-y-4">
        {[
          { title: 'Green Draft Generator', desc: 'Creates LMA-compliant documentation drafts from project data' },
          { title: 'Clause Matcher', desc: 'Semantic search across indexed LMA documents using vector embeddings' },
          { title: 'KPI & SPT Generator', desc: 'Recommends sector-specific KPIs based on SBTi pathways' },
        ].map((item, idx) => (
          <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-verdex-50 border border-verdex-100">
            <div className="w-8 h-8 rounded-lg bg-verdex-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {idx + 1}
            </div>
            <div>
              <div className="font-semibold text-verdex-800">{item.title}</div>
              <div className="text-sm text-verdex-600 mt-1">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 id="knowledge-base" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Knowledge Base Sources
      </h2>

      <DataTable
        headers={['Source', 'Documents', 'Use Case']}
        rows={[
          [<span key="1" className="font-semibold text-verdex-700">LMA Core Documents</span>, '16', 'Facility agreements, guides, templates (indexed via Pinecone)'],
          ['LMA Transition Loan Guide', '1', '5 Core Components validation'],
          ['LMA Green/SLL Principles', '4', 'Sustainability-linked loan compliance'],
          ['SBTi Net-Zero Standard V2', '1', 'Science-based target validation'],
          ['Paris Agreement', '1', 'Article 2, 4, 6, 9, 13 alignment'],
          ['Country NDCs', '7', 'National target alignment'],
          ['Sector Pathways', '5', 'Decarbonization trajectory validation'],
        ]}
      />

      <h2 id="tech-stack" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Tech Stack
      </h2>

      <CodeBlock
        language="json"
        code={`{
  "frontend": {
    "framework": "Next.js 16",
    "language": "TypeScript",
    "styling": "Tailwind CSS",
    "icons": "Lucide React"
  },
  "ai": {
    "llm": "Groq (Llama 4 Maverick)",
    "embeddings": "BGE-small-en",
    "vectorDb": "Pinecone"
  },
  "features": {
    "pdfParsing": "pdf-parse",
    "pdfGeneration": "jsPDF + AutoTable",
    "animations": "GSAP"
  }
}`}
      />

      <h2 id="scalability" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Scalability & Design
      </h2>

      <div className="grid md:grid-cols-2 gap-4 my-6">
        {[
          {
            title: 'Stateless Architecture',
            description: 'No server-side sessions. Each request is independent, enabling horizontal scaling.',
          },
          {
            title: 'Cloud-Native',
            description: 'Deployed on Vercel (frontend) and Railway (embedding service). Auto-scales with demand.',
          },
          {
            title: 'Vector Database',
            description: 'Pinecone handles millions of embeddings. Clause search scales without index rebuilds.',
          },
          {
            title: 'API-First',
            description: 'All features accessible via REST APIs. Easy integration with existing bank systems.',
          },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100">
            <div className="font-semibold text-gray-900 mb-1">{item.title}</div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="From One to Thousands">
        Architecture handles one project or thousands without infrastructure changes. Same codebase, same validation logic, same compliance standards.
      </InfoBox>

      <InfoBox type="success" title="Built for LMA Edge Hackathon 2025">
        Verdex was developed for the LMA Edge Hackathon 2025, demonstrating how AI can bridge the climate finance gap in Africa through automated compliance validation.
      </InfoBox>

    </DocPage>
  );
}
