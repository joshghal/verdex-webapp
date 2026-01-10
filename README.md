# Verdex

**Transition finance infrastructure for Africa** — validating projects against LMA frameworks so they can access global capital.

Live Demo: [verdx.site](https://www.verdx.site)

---

## The Problem

Africa faces a **$233 billion annual climate finance gap**, despite holding over 60% of the world's best solar resources. More than $700 billion has been committed globally to transition lending, yet African project developers struggle to access this capital.

The bottleneck isn't funding or projects — it's **bankability infrastructure**:

- **Project Developers** have projects and PDF proposals but lack expertise to structure bankable documentation
- **Commercial Banks** can't efficiently verify transition claims and face greenwashing risk
- **DFIs** lack pre-screened pipelines and face high due diligence costs
- **Climate Investors** have capital but can't find framework-aligned projects

The LMA (Loan Market Association) published the [Transition Loan Guide](https://www.lma.eu.com/application/files/9917/6035/1809/Guide_to_Transition_Loans_-_16_October_2025.pdf) in October 2025, defining clear criteria for credible transition finance. But these frameworks are scattered across thousands of technical PDFs, written for global banks — not local project sponsors.

---

## The Solution

Verdex takes project documents and validates them against international transition finance frameworks:

| Feature | Description |
|---------|-------------|
| **LMA Transition Loan Validator** | Scores projects against the 5 Core Components |
| **Greenwashing Detection** | Flags red flags before they reach a lender's desk |
| **DFI Matching** | Matches projects with appropriate financiers (IFC, AfDB, FMO, DEG, BII, Proparco, DFC) |
| **Clause Library** | Semantic search across 500+ indexed LMA clauses |
| **Draft Generation** | Generates LMA-compliant project documentation |

**Key Metrics:**
| <60s | 7+ | 100% | 500+ |
|------|-----|------|-------|
| Assessment time | DFI partners matched | LMA principles covered | Clause templates |

---

## User Flows

### Flow 1: Project Validation

```
Upload PDF → LMA Assessment → Greenwashing Check → DFI Matching → Generate Draft → Export PDF
```

1. **Upload** — Submit project PDF or fill form manually
2. **Validate** — Score against LMA's 5 Core Components:
   - Strategy Alignment (Paris Agreement, SBTi, NDC)
   - Use of Proceeds (eligible categories, allocation)
   - Target Ambition (emissions reduction, baselines)
   - Reporting & Verification (third-party assurance)
   - Project Selection (governance, transparency)
3. **Greenwashing Detection** — AI-powered red flag identification
4. **DFI Match** — Connect with relevant financiers based on sector, geography, deal size
5. **Generate Draft** — Create LMA-compliant documentation with KPIs, SPTs, margin ratchets
6. **Export** — Download as PDF for lender submission

### Flow 2: Clause Search

```
Search Query → Semantic Search → Clause Results → AI Advice → Apply to Project
```

1. **Keyword Search** — Search for "margin ratchet", "verification", "KPI definition"
2. **Clause ID Search** — Find specific provisions by ID
3. **AI Chat** — Ask natural language questions about LMA requirements
4. **Get Advice** — Receive contextualized guidance for applying clauses to your project

---

## API Reference

Base URL: `https://www.verdx.site`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/assess` | Submit project for LMA transition eligibility assessment |
| `POST` | `/api/search` | Search LMA clause library with semantic search |
| `GET` | `/api/search` | Get index stats and available filters |
| `POST` | `/api/upload-pdf` | Upload PDF for AI-powered data extraction |
| `POST` | `/api/chat` | RAG-powered conversational assistant |
| `POST` | `/api/clause-advice` | Get AI advice for applying clauses |
| `POST` | `/api/generate-draft` | Generate LMA-compliant project draft |

### Quick Examples

**Assess a Project:**
```bash
curl -X POST https://www.verdx.site/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Kano Solar Farm Phase II",
    "country": "nigeria",
    "sector": "energy",
    "totalCost": 50000000,
    "targetYear": 2030
  }'
```

**Search Clauses:**
```bash
curl -X POST https://www.verdx.site/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "margin ratchet sustainability linked",
    "limit": 10
  }'
```

**Chat with AI:**
```bash
curl -X POST https://www.verdx.site/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are KPI requirements for sustainability-linked loans?",
    "history": []
  }'
```

Full API documentation: [verdx.site/docs/technical/api-reference](https://www.verdx.site/docs/technical/api-reference)

---

## Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS |
| **Vector DB** | Pinecone (BGE-small embeddings) |
| **AI/LLM** | Groq (Llama 4 Maverick), ASI:One |
| **PDF Processing** | pdf-parse, jsPDF |
| **Deployment** | Vercel |

---

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Pinecone account (for vector search)
- Groq API key (for LLM features)

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd verdex-webapp
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your API keys:
   ```env
   # Pinecone (Vector Database)
   PINECONE_API_KEY=your_pinecone_api_key
   PINECONE_INDEX=your_index_name

   # Groq (LLM)
   GROQ_API_KEY=your_groq_api_key

   # ASI:One (Optional - alternative LLM)
   ASI1_API_KEY=your_asi1_api_key
   ```

4. **Run development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run ingest` | Ingest clauses into Pinecone |
| `npm run ingest:dry` | Dry run clause ingestion |

---

## Project Structure

```
verdex-webapp/
├── app/
│   ├── api/                    # API routes
│   │   ├── assess/             # Project assessment
│   │   ├── search/             # Clause search
│   │   ├── upload-pdf/         # PDF processing
│   │   ├── chat/               # RAG chat
│   │   ├── clause-advice/      # Clause guidance
│   │   └── generate-draft/     # Draft generation
│   ├── docs/                   # Documentation pages
│   ├── assess/                 # Assessment UI
│   ├── search/                 # Search UI
│   └── page.tsx                # Homepage
├── components/
│   ├── docs/                   # Documentation components
│   └── ui/                     # UI components
├── lib/
│   ├── pinecone.ts             # Pinecone client
│   ├── embeddings.ts           # Embedding generation
│   ├── scoring.ts              # LMA scoring logic
│   ├── greenwashing.ts         # Greenwashing detection
│   ├── dfi-matching.ts         # DFI matching logic
│   └── countries.ts            # African country data
├── scripts/
│   └── ingest-clauses.ts       # Clause ingestion script
├── public/
│   └── sample-projects/        # Sample project PDFs
└── types/
    └── index.ts                # TypeScript definitions
```

---

## Knowledge Base

Verdex is built on extensive LMA documentation research:

| Category | Documents | Indexed |
|----------|-----------|---------|
| LMA Total Library | 2,009 | — |
| Africa-Specific | 83 | 3 |
| Sustainability & Green Finance | 161 | 13 |
| Transition Finance | 42 | 5 |
| External Frameworks | 2 | 2 |

Full breakdown: [verdx.site/docs/technical/knowledge-base](https://www.verdx.site/docs/technical/knowledge-base)

---

## Documentation

- **Executive Summary:** [verdx.site/docs/executive-summary](https://www.verdx.site/docs/executive-summary)
- **Why Africa:** [verdx.site/docs/problem/why-africa](https://www.verdx.site/docs/problem/why-africa)
- **LMA Validator:** [verdx.site/docs/features/lma-validator](https://www.verdx.site/docs/features/lma-validator)
- **API Reference:** [verdx.site/docs/technical/api-reference](https://www.verdx.site/docs/technical/api-reference)
- **Knowledge Base:** [verdx.site/docs/technical/knowledge-base](https://www.verdx.site/docs/technical/knowledge-base)

---

## License

MIT
