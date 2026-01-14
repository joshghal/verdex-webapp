# Verdex

**Transition Finance Infrastructure for Africa**

Validating projects against LMA frameworks so they can access global capital.

[![Live Demo](https://img.shields.io/badge/demo-verdx.site-verdex)](https://www.verdx.site)
[![LMA Edge Hackathon](https://img.shields.io/badge/hackathon-LMA%20Edge%202025-blue)](https://lma-edge.devpost.com/)

---

## Table of Contents

- [Executive Summary](#executive-summary)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Features](#features)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Project Structure](#project-structure)
- [Knowledge Base](#knowledge-base)
- [Regulatory Frameworks](#regulatory-frameworks)
- [Roadmap](#roadmap)
- [License](#license)

---

## Executive Summary

Verdex is an AI-powered platform that validates transition finance projects against international frameworks, specifically designed for African markets. It bridges the gap between project developers with bankable projects and global capital seeking credible transition investments.

### Key Metrics

| Metric | Value |
|--------|-------|
| Assessment Time | <60 seconds |
| DFI Partners Matched | 7 institutions |
| LMA Principles Coverage | 100% (5 Core Components) |
| Indexed Clauses | 500+ templates |
| Supported Countries | 7 African nations |
| Lines of Code | 26,000+ |
| API Endpoints | 12 |

### What Makes Verdex Different

1. **LMA-Native**: Built on the October 2025 LMA Transition Loan Guide
2. **Africa-First**: 7-country profiles with NDC targets, DFI eligibility, regulatory frameworks
3. **EU Taxonomy DNSH**: Integrated "Do No Significant Harm" screening
4. **Climate Intelligence**: Location-specific risk assessment via Open-Meteo
5. **Production-Ready**: Multi-provider AI fallback, comprehensive type system

---

## The Problem

Africa faces a **$233 billion annual climate finance gap**, despite holding over 60% of the world's best solar resources. More than $700 billion has been committed globally to transition lending, yet African project developers struggle to access this capital.

### The Bankability Bottleneck

```
┌─────────────────────────────────────────────────────────────────┐
│                    AFRICA'S TRANSITION FINANCE GAP              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PROJECT DEVELOPERS          THE GAP           GLOBAL CAPITAL   │
│  ┌─────────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │ Have projects   │    │ Framework   │    │ $700B committed │ │
│  │ Have PDFs       │ ──>│ knowledge   │<── │ to transition   │ │
│  │ Lack expertise  │    │ gap         │    │ lending         │ │
│  └─────────────────┘    └─────────────┘    └─────────────────┘ │
│                                                                 │
│  RESULT: Only 3% of global climate finance reaches Africa       │
└─────────────────────────────────────────────────────────────────┘
```

### Stakeholder Pain Points

| Stakeholder | Challenge |
|-------------|-----------|
| **Project Developers** | Have projects and PDF proposals but lack expertise to structure bankable documentation |
| **Commercial Banks** | Can't efficiently verify transition claims and face greenwashing risk |
| **DFIs** | Lack pre-screened pipelines and face high due diligence costs |
| **Climate Investors** | Have capital but can't find framework-aligned projects |

### Why Now?

The LMA published the [Transition Loan Guide](https://www.lma.eu.com/application/files/9917/6035/1809/Guide_to_Transition_Loans_-_16_October_2025.pdf) in October 2025, defining clear criteria for credible transition finance. But these frameworks are scattered across thousands of technical PDFs, written for global banks — not local project sponsors.

---

## The Solution

Verdex automates transition finance validation by combining:

1. **LMA Framework Scoring** — Validate against 5 Core Components
2. **Greenwashing Detection** — AI-powered red flag identification
3. **EU Taxonomy DNSH** — Environmental harm screening
4. **Climate Risk Intelligence** — Location-specific resilience assessment
5. **DFI Matching** — Connect with appropriate financiers
6. **Draft Generation** — Create LMA-compliant documentation

### Solution Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                              VERDEX PLATFORM                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  INPUT                    PROCESSING                    OUTPUT             │
│  ┌──────────────┐        ┌──────────────────────┐      ┌──────────────┐   │
│  │ PDF Upload   │───────>│ LMA 5-Component      │─────>│ Assessment   │   │
│  │ Manual Form  │        │ Evaluation Engine    │      │ Report       │   │
│  └──────────────┘        └──────────────────────┘      └──────────────┘   │
│         │                         │                           │           │
│         │                ┌────────┴────────┐                  │           │
│         v                v                 v                  v           │
│  ┌──────────────┐  ┌──────────┐    ┌──────────────┐   ┌──────────────┐   │
│  │ AI Extraction│  │Greenwash │    │ DNSH         │   │ DFI Match    │   │
│  │ (Claude/Groq)│  │ Detector │    │ Evaluator    │   │ Results      │   │
│  └──────────────┘  └──────────┘    └──────────────┘   └──────────────┘   │
│         │                │                 │                  │           │
│         │                └────────┬────────┘                  │           │
│         v                         v                           v           │
│  ┌──────────────┐        ┌──────────────────────┐      ┌──────────────┐   │
│  │ Country      │        │ Location Risk        │      │ Draft        │   │
│  │ Profiles     │        │ (Open-Meteo API)     │      │ Generator    │   │
│  └──────────────┘        └──────────────────────┘      └──────────────┘   │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Features

### 1. LMA Transition Loan Validator

Scores projects against the **5 Core Components** from the October 2025 LMA Transition Loan Guide:

| Component | Description | Max Score |
|-----------|-------------|-----------|
| **1. Transition Strategy** | Paris alignment, published plan, entity-wide scope | 20 |
| **2. Use of Proceeds** | Eligible activities, quantifiable reductions, no lock-in | 20 |
| **3. Project Selection & Evaluation** | Aligned with strategy, evaluation process | 20 |
| **4. Management of Proceeds** | Allocation, tracking, documentation | 20 |
| **5. Reporting** | KPI framework, disclosure, verification | 20 |

**Implementation:**

```typescript
// lib/engines/lma-evaluator.ts
export async function evaluateLMACompliance(
  project: ProjectInput,
  documentText?: string
): Promise<LMAEvaluationResult> {
  // AI-powered evaluation against each criterion
  const result = await callAI({
    systemPrompt: LMA_EVALUATION_SYSTEM_PROMPT,
    userPrompt: formatProjectForEvaluation(project, documentText),
    jsonMode: true
  });

  return {
    components: result.parsed.components,
    overallScore: calculateOverallScore(result.parsed.components),
    feedback: result.parsed.feedback
  };
}
```

### 2. Greenwashing Detection

AI-powered detection with rule-based validation layer:

| Red Flag Category | Example Patterns |
|-------------------|------------------|
| **Vague Commitments** | "Net zero ambitions", "carbon neutral journey" |
| **Missing Baselines** | No quantified current emissions |
| **Unrealistic Targets** | >50% reduction without technology pathway |
| **Scope Exclusions** | Omitting material Scope 3 categories |
| **Verification Gaps** | No third-party verification commitment |
| **Technology Lock-in** | Investing in fossil fuel infrastructure |

**Scoring Formula:**

```
Final Score = LMA Base Score - Greenwashing Penalty

Where:
- LMA Base Score = Sum of 5 Component scores (0-100)
- Greenwashing Penalty = AI Score (50%) + Rule Score (30%) + DNSH Score (20%)
```

### 3. EU Taxonomy DNSH Assessment

Integrated "Do No Significant Harm" screening against EU Taxonomy Article 17:

| Objective | Assessment Criteria |
|-----------|---------------------|
| **Climate Mitigation** | No significant GHG emissions increase |
| **Climate Adaptation** | Physical climate risk assessment |
| **Water Resources** | Water use efficiency, pollution prevention |
| **Circular Economy** | Waste management, material efficiency |
| **Pollution Prevention** | Air, water, soil pollution controls |
| **Biodiversity** | Ecosystem protection, habitat preservation |

**DNSH Status Levels:**

| Status | Score | Description |
|--------|-------|-------------|
| `no_harm` | 4 | No significant negative impact |
| `potential_harm` | 2 | Risks identified, mitigable |
| `significant_harm` | 0 | Fundamental incompatibility |
| `not_assessed` | — | Insufficient information |

### 4. Location Risk & Climate Intelligence

Real-time climate data integration via Open-Meteo API:

**Data Sources:**

| API | Data Type | Coverage |
|-----|-----------|----------|
| `api.open-meteo.com/v1/archive` | Historical climate (10-year) | Global |
| `climate-api.open-meteo.com/v1/climate` | Future projections (CMIP6) | Global |

**Outputs:**

```typescript
interface LocationRiskAssessment {
  coordinates: GeoCoordinates;
  historicalData: {
    averageTemperature: number;      // °C
    annualPrecipitation: number;     // mm/year
    extremeHeatDays: number;         // days > 35°C
    drySeasonMonths: number[];       // 1-12
    droughtRisk: RiskLevel;
    floodRisk: RiskLevel;
  };
  projections: ClimateProjection[];  // SSP2-4.5, SSP5-8.5 for 2030, 2050
  siteIntelligence: {
    optimalOperatingMonths: number[];
    waterAvailability: 'abundant' | 'moderate' | 'scarce';
    solarPotential?: number;         // kWh/m²/day
  };
  keyInsights: KeyInsight[];         // Decision-relevant insights
  recommendations: string[];
}
```

### 5. DFI Matching Engine

Automated matching with 7 Development Finance Institutions:

| DFI | Country | Min Deal | Max Deal | Key Sectors |
|-----|---------|----------|----------|-------------|
| **IFC** | Global | $10M | $100M+ | All |
| **AfDB** | Africa | $10M | $500M | Infrastructure, Energy |
| **FMO** | Netherlands | $5M | $100M | Energy, Agriculture |
| **DEG** | Germany | $3M | $50M | Manufacturing, Energy |
| **BII** | UK | $10M | $150M | Infrastructure |
| **Proparco** | France | $5M | $100M | Energy, Agriculture |
| **DFC** | USA | $10M | $1B | All |

**Matching Algorithm:**

```typescript
export function matchDFIs(project: ProjectInput): DFIMatch[] {
  return DFI_DATABASE
    .filter(dfi => isEligible(dfi, project))
    .map(dfi => ({
      dfi,
      matchScore: calculateMatchScore(dfi, project),
      matchReasons: getMatchReasons(dfi, project),
      concerns: getConcerns(dfi, project),
      recommendedRole: determineRole(dfi, project),
      estimatedSize: estimateDealSize(dfi, project)
    }))
    .sort((a, b) => b.matchScore - a.matchScore);
}
```

### 6. RAG-Powered Clause Library

Semantic search across 500+ indexed LMA clauses:

| Document Category | Indexed | Total Available |
|-------------------|---------|-----------------|
| LMA Core Templates | 13 | 161 |
| Africa-Specific | 3 | 83 |
| Transition Finance | 5 | 42 |
| External Frameworks | 2 | 2 |
| **Total** | **23** | **2,009** |

**Vector Database:**

- **Provider:** Pinecone
- **Embedding Model:** BGE-small (384 dimensions)
- **Index Size:** 500+ clause vectors

### 7. AI-Powered Draft Generation

Three-phase LMA-compliant document generation:

```
Phase 1: Structure        Phase 2: Content         Phase 3: Refinement
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│ Generate        │      │ Fill sections   │      │ Apply LMA       │
│ document        │ ──>  │ with project    │ ──>  │ terminology     │
│ skeleton        │      │ specifics       │      │ and formatting  │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            VERDEX SYSTEM ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           PRESENTATION LAYER                         │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────────┐ │   │
│  │  │ Assessment│  │ Clause    │  │ Docs      │  │ Pitch Deck        │ │   │
│  │  │ Flow      │  │ Search    │  │ Portal    │  │ (Investor View)   │ │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                              API LAYER                               │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │/assess   │ │/search   │ │/chat     │ │/upload-  │ │/generate-│  │   │
│  │  │          │ │          │ │          │ │pdf       │ │draft     │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │   │
│  │  │/clause-  │ │/clause-  │ │/location-│ │/location-│ │/lma      │  │   │
│  │  │advice    │ │insight   │ │risk      │ │insight   │ │          │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                           ENGINE LAYER                               │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │   │
│  │  │ LMA Evaluator  │  │ Greenwash      │  │ DNSH Evaluator         │ │   │
│  │  │ (AI + Rules)   │  │ Detector       │  │ (EU Taxonomy Art. 17)  │ │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘ │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │   │
│  │  │ DFI Matcher    │  │ Location Risk  │  │ Draft Generator        │ │   │
│  │  │                │  │ Engine         │  │ (3-Phase)              │ │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                            DATA LAYER                                │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │   │
│  │  │ Pinecone       │  │ Country        │  │ DFI Database           │ │   │
│  │  │ (Vector DB)    │  │ Profiles       │  │ (7 Institutions)       │ │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘ │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │   │
│  │  │ African        │  │ Sector KPIs    │  │ LMA Components         │ │   │
│  │  │ Coordinates    │  │                │  │ Framework              │ │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                      │                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         EXTERNAL SERVICES                            │   │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐ │   │
│  │  │ Groq API       │  │ ASI:One API    │  │ Open-Meteo API         │ │   │
│  │  │ (Llama 4)      │  │ (ASI1 Mini)    │  │ (Climate Data)         │ │   │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### AI Provider Fallback Chain

```
┌──────────────────────────────────────────────────────────────┐
│                     AI PROVIDER CHAIN                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Request ─┬─> ASI:One (Primary)                              │
│           │      │                                           │
│           │      ├─ Success ─> Return response               │
│           │      │                                           │
│           │      └─ Fail ─┬─> Groq (Fallback)                │
│           │               │      │                           │
│           │               │      ├─ Success ─> Return        │
│           │               │      │                           │
│           │               │      └─ Fail ─> Error response   │
│           │               │                                  │
│           └───────────────┴──────────────────────────────────┤
│                                                              │
│  Provider Configuration:                                     │
│  ┌──────────┬────────────────┬──────────────────────────┐   │
│  │ Priority │ Provider       │ Model                    │   │
│  ├──────────┼────────────────┼──────────────────────────┤   │
│  │ 1        │ ASI:One        │ asi1-mini                │   │
│  │ 2        │ Groq           │ llama-4-maverick-17b-128e│   │
│  └──────────┴────────────────┴──────────────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Data Flow: Assessment Pipeline

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         ASSESSMENT DATA FLOW                                │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│  1. INPUT                                                                  │
│  ┌─────────────────┐                                                       │
│  │ PDF Upload      │──┐                                                    │
│  └─────────────────┘  │   ┌─────────────────────────────────────────────┐ │
│                       ├──>│ AI Extraction (Claude/Groq)                 │ │
│  ┌─────────────────┐  │   │ - Project name, sector, country             │ │
│  │ Manual Form     │──┘   │ - Emissions data, targets, timeline         │ │
│  └─────────────────┘      │ - Strategy description                      │ │
│                           └─────────────────────────────────────────────┘ │
│                                           │                               │
│  2. PARALLEL PROCESSING                   v                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │ LMA         │  │ Greenwash   │  │ DNSH        │  │ Location │  │  │
│  │  │ Evaluation  │  │ Detection   │  │ Evaluation  │  │ Risk     │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘  │  │
│  │        │                │                │               │        │  │
│  │        v                v                v               v        │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌──────────┐  │  │
│  │  │ 5 Component │  │ Red Flags   │  │ 6 Objective │  │ Climate  │  │  │
│  │  │ Scores      │  │ + Penalty   │  │ Scores      │  │ Profile  │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └──────────┘  │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                           │                               │
│  3. AGGREGATION                           v                               │
│  ┌────────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  Final Score = LMA Base - Greenwashing Penalty                     │  │
│  │                                                                    │  │
│  │  Eligibility:                                                      │  │
│  │  - "eligible" (score >= 70)                                        │  │
│  │  - "partial" (score >= 50)                                         │  │
│  │  - "ineligible" (score < 50)                                       │  │
│  │                                                                    │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                           │                               │
│  4. OUTPUT                                v                               │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐  │
│  │ Assessment      │  │ DFI Matches     │  │ PDF Export              │  │
│  │ Report          │  │ (Ranked)        │  │ (Full Report)           │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘  │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## API Reference

Base URL: `https://www.verdx.site`

### Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/assess` | Project LMA assessment | None |
| `POST` | `/api/search` | Clause semantic search | None |
| `GET` | `/api/search` | Index statistics | None |
| `POST` | `/api/upload-pdf` | PDF data extraction | None |
| `POST` | `/api/chat` | RAG conversation | None |
| `POST` | `/api/clause-advice` | Clause guidance | None |
| `POST` | `/api/clause-insight` | Clause summary (cached) | None |
| `POST` | `/api/generate-draft` | Draft generation | None |
| `POST` | `/api/location-risk` | Climate risk assessment | None |
| `POST` | `/api/location-insight` | AI climate insights | None |
| `POST` | `/api/lma` | LMA component evaluation | None |
| `GET` | `/api/document-url` | Document source links | None |

### Detailed Endpoint Documentation

#### POST /api/assess

Submit a project for comprehensive LMA transition eligibility assessment.

**Request Body:**

```typescript
interface AssessmentRequest {
  projectName: string;
  country: 'kenya' | 'nigeria' | 'south_africa' | 'tanzania' | 'ghana' | 'egypt' | 'morocco';
  sector: 'energy' | 'mining' | 'agriculture' | 'transport' | 'manufacturing';
  projectType: string;
  description: string;
  totalCost: number;              // USD
  debtAmount: number;             // USD
  equityAmount: number;           // USD
  currentEmissions: {
    scope1: number;               // tCO2e/year
    scope2: number;
    scope3?: number;
  };
  targetEmissions: {
    scope1: number;
    scope2: number;
    scope3?: number;
  };
  targetYear: number;             // e.g., 2030
  transitionStrategy: string;
  hasPublishedPlan: boolean;
  thirdPartyVerification: boolean;
  rawDocumentText?: string;       // For greenwashing analysis
}
```

**Response:**

```typescript
interface AssessmentResult {
  projectName: string;
  country: string;
  sector: string;
  eligibilityStatus: 'eligible' | 'partial' | 'ineligible';
  overallScore: number;           // 0-100
  lmaBaseScore: number;           // Pre-penalty score
  greenwashingPenalty: number;    // Deduction applied
  components: {
    transitionStrategy: ComponentScore;
    useOfProceeds: ComponentScore;
    projectSelectionEvaluation: ComponentScore;
    managementOfProceeds: ComponentScore;
    reporting: ComponentScore;
  };
  greenwashingRisk: GreenwashingAssessment;
  sbtiAssessment: SBTiAssessment;
  parisAlignment: ParisAlignment;
  eligibleDFIs: DFIMatch[];
  recommendedStructure: BlendedStructure;
  locationRisk?: LocationRiskAssessment;
  nextSteps: string[];
  assessmentDate: string;
}
```

**Example:**

```bash
curl -X POST https://www.verdx.site/api/assess \
  -H "Content-Type: application/json" \
  -d '{
    "projectName": "Kano Solar Farm Phase II",
    "country": "nigeria",
    "sector": "energy",
    "projectType": "Solar PV Utility Scale",
    "description": "100MW solar farm with battery storage",
    "totalCost": 50000000,
    "debtAmount": 35000000,
    "equityAmount": 15000000,
    "currentEmissions": { "scope1": 50000, "scope2": 20000 },
    "targetEmissions": { "scope1": 5000, "scope2": 2000 },
    "targetYear": 2030,
    "transitionStrategy": "Replace diesel generation with solar PV",
    "hasPublishedPlan": true,
    "thirdPartyVerification": true
  }'
```

#### POST /api/search

Semantic search across indexed LMA clauses.

**Request Body:**

```typescript
interface SearchRequest {
  query: string;
  filters?: {
    clauseType?: string[];       // e.g., ['margin_ratchet', 'kpi']
    country?: string[];
    sector?: string[];
  };
  limit?: number;                // Default: 10, Max: 50
}
```

**Response:**

```typescript
interface SearchResponse {
  results: {
    id: string;
    content: string;
    score: number;               // Similarity score (0-1)
    metadata: {
      clauseType?: string;
      documentType?: string;
      source?: string;
    };
  }[];
  total: number;
  query: string;
}
```

**Example:**

```bash
curl -X POST https://www.verdx.site/api/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "margin ratchet sustainability performance targets",
    "filters": { "clauseType": ["margin_ratchet"] },
    "limit": 10
  }'
```

#### POST /api/location-risk

Get climate risk assessment for a specific location.

**Request Body:**

```typescript
interface LocationRiskRequest {
  country: string;
  sector: string;
  city?: string;                 // Optional, defaults to capital
}
```

**Response:**

```typescript
interface LocationRiskAssessment {
  coordinates: {
    latitude: number;
    longitude: number;
    locationName: string;
  };
  historicalData: {
    averageTemperature: number;
    annualPrecipitation: number;
    extremeHeatDays: number;
    drySeasonMonths: number[];
    droughtRisk: 'low' | 'medium' | 'high';
    floodRisk: 'low' | 'medium' | 'high';
  };
  projections: {
    scenario: 'SSP1-2.6' | 'SSP2-4.5' | 'SSP5-8.5';
    year: 2030 | 2050;
    temperatureChange: number;
    precipitationChange: number;
  }[];
  siteIntelligence: {
    optimalOperatingMonths: number[];
    waterAvailability: 'abundant' | 'moderate' | 'scarce';
    solarPotential?: number;
  };
  keyInsights: {
    icon: string;
    headline: string;
    detail: string;
    severity: 'positive' | 'neutral' | 'caution';
  }[];
  recommendations: string[];
  dataSource: 'open-meteo';
  assessmentDate: string;
}
```

**Example:**

```bash
curl -X POST https://www.verdx.site/api/location-risk \
  -H "Content-Type: application/json" \
  -d '{
    "country": "kenya",
    "sector": "agriculture"
  }'
```

#### POST /api/chat

RAG-powered conversational assistant for LMA questions.

**Request Body:**

```typescript
interface ChatRequest {
  message: string;
  history: {
    role: 'user' | 'assistant';
    content: string;
  }[];
}
```

**Response:**

```typescript
interface ChatResponse {
  response: string;
  sources: {
    id: string;
    clauseType: string;
    preview: string;
    score: number;
  }[];
  suggestedQuestions: string[];
  provider: string;
}
```

**Example:**

```bash
curl -X POST https://www.verdx.site/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What are the key requirements for SPTs in sustainability-linked loans?",
    "history": []
  }'
```

---

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 15 | Full-stack React framework |
| **Language** | TypeScript | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **UI Components** | Radix UI, Framer Motion | Accessible components, animations |
| **Vector DB** | Pinecone | Semantic clause search |
| **Embeddings** | BGE-small (384d) | Text vectorization |
| **AI/LLM** | Groq (Llama 4), ASI:One | Language model inference |
| **PDF Processing** | pdf-parse | Document extraction |
| **PDF Generation** | jsPDF | Report export |
| **Climate Data** | Open-Meteo | Weather/climate API |
| **Deployment** | Vercel | Edge deployment |
| **Analytics** | Google Analytics 4 | Usage tracking |

### Dependencies

```json
{
  "dependencies": {
    "next": "15.x",
    "react": "19.x",
    "typescript": "5.x",
    "@pinecone-database/pinecone": "^4.x",
    "groq-sdk": "^0.x",
    "pdf-parse": "^1.x",
    "jspdf": "^2.x",
    "framer-motion": "^11.x",
    "@radix-ui/react-*": "^1.x",
    "tailwindcss": "^3.x",
    "lucide-react": "^0.x"
  }
}
```

---

## Local Development

### Prerequisites

- Node.js 18+
- npm or yarn
- Pinecone account (free tier available)
- Groq API key (free tier available)
- ASI:One API key (optional)

### Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/verdex-webapp.git
cd verdex-webapp

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
```

### Environment Variables

```bash
# .env.local

# Pinecone (Vector Database)
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_index_name

# Groq (Primary LLM)
GROQ_API_KEY=your_groq_api_key

# ASI:One (Optional - Alternative LLM)
ASI1_API_KEY=your_asi1_api_key

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### Running Locally

```bash
# Development server
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint

# Clause ingestion (requires Pinecone)
npm run ingest
npm run ingest:dry  # Dry run
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run ingest` | Ingest clauses into Pinecone |
| `npm run ingest:dry` | Dry run clause ingestion |

---

## Project Structure

```
verdex-webapp/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── assess/               # Project assessment
│   │   ├── chat/                 # RAG conversation
│   │   ├── clause-advice/        # Clause guidance
│   │   ├── clause-insight/       # Clause summaries
│   │   ├── document-url/         # Source links
│   │   ├── generate-draft/       # Draft generation
│   │   ├── lma/                  # LMA evaluation
│   │   ├── location-insight/     # AI climate insights
│   │   ├── location-risk/        # Climate risk API
│   │   ├── search/               # Clause search
│   │   └── upload-pdf/           # PDF extraction
│   ├── (main)/                   # Main app routes
│   │   ├── assess/               # Assessment flow
│   │   ├── results/              # Results display
│   │   └── search/               # Clause search
│   ├── docs/                     # Documentation portal
│   └── verdex-deck/              # Investor pitch deck
├── components/                   # React components
│   ├── results/                  # Assessment result cards
│   ├── ui/                       # Base UI components
│   └── docs/                     # Documentation components
├── lib/                          # Core logic
│   ├── ai/                       # AI provider handling
│   │   └── api-handler.ts        # Multi-provider fallback
│   ├── data/                     # Static data
│   │   ├── countries.ts          # 7 African country profiles
│   │   ├── dfi-database.ts       # 7 DFI institutions
│   │   ├── african-coordinates.ts # Geocoding data
│   │   └── lma-components.ts     # 5 LMA Core Components
│   ├── engines/                  # Business logic engines
│   │   ├── dnsh-evaluator.ts     # EU Taxonomy DNSH
│   │   ├── greenwash-detector.ts # Greenwashing detection
│   │   ├── lma-evaluator.ts      # LMA scoring
│   │   └── location-risk-engine.ts # Climate risk
│   ├── pinecone.ts               # Vector DB client
│   ├── embeddings.ts             # Text vectorization
│   └── types.ts                  # TypeScript definitions
├── public/                       # Static assets
│   └── samples/                  # Sample project PDFs
├── scripts/                      # Build scripts
│   └── ingest-clauses.ts         # Pinecone ingestion
└── types/                        # Additional type definitions
```

---

## Knowledge Base

Verdex is built on extensive research of LMA documentation:

### Indexed Documents

| Category | Documents | Description |
|----------|-----------|-------------|
| **LMA Core Documents** | 13 | Green/SLL Principles, Transition Loan Guide |
| **Africa-Specific** | 3 | Regional infrastructure, DFI requirements |
| **Transition Finance** | 5 | Sector pathways, decarbonization |
| **External Frameworks** | 2 | EU Taxonomy, TCFD |

### LMA Document Hierarchy

```
LMA Publications (2,009 total)
├── Sustainability & Green Finance (161)
│   ├── Green Loan Principles ✓
│   ├── Sustainability-Linked Loan Principles ✓
│   └── Guidance Documents ✓
├── Africa-Specific (83)
│   └── Selected Regional Documents ✓
├── Transition Finance (42)
│   ├── Transition Loan Guide (Oct 2025) ✓
│   └── Sector Guidance ✓
└── External Frameworks (2)
    ├── EU Taxonomy Technical Screening ✓
    └── TCFD Recommendations ✓
```

---

## Regulatory Frameworks

### LMA 5 Core Components (October 2025)

Verdex implements the complete framework from the [LMA Transition Loan Guide](https://www.lma.eu.com/application/files/9917/6035/1809/Guide_to_Transition_Loans_-_16_October_2025.pdf):

| Component | Key Requirements |
|-----------|------------------|
| **1. Transition Strategy** | Paris-aligned, published, entity-wide scope |
| **2. Use of Proceeds** | Eligible activities, quantifiable reductions |
| **3. Project Selection** | Aligned with strategy, evaluation process |
| **4. Management of Proceeds** | Allocation tracking, documentation |
| **5. Reporting** | KPI framework, annual disclosure, verification |

### EU Taxonomy DNSH (Article 17)

Six environmental objectives that activities must not significantly harm:

| Objective | Assessment Focus |
|-----------|------------------|
| Climate Mitigation | GHG emissions impact |
| Climate Adaptation | Physical risk resilience |
| Water Resources | Water use, marine protection |
| Circular Economy | Waste, material efficiency |
| Pollution Prevention | Air, water, soil pollution |
| Biodiversity | Ecosystem, habitat protection |

### Supported Country NDC Targets

| Country | 2030 NDC Target | Baseline Year |
|---------|-----------------|---------------|
| Kenya | -32% | 2010 |
| Nigeria | -20% unconditional | 2010 |
| South Africa | 350-420 Mt CO2e | 2015 |
| Tanzania | -10-20% | 2010 |
| Ghana | -15% unconditional | 2010 |
| Egypt | Not quantified | — |
| Morocco | -42% | 2010 |

---

## Roadmap

### Delivered (v1.0)

- [x] LMA 5 Core Component evaluation
- [x] AI-powered greenwashing detection
- [x] EU Taxonomy DNSH integration
- [x] Climate risk assessment (Open-Meteo)
- [x] DFI matching (7 institutions)
- [x] RAG clause search (500+ clauses)
- [x] PDF extraction and export
- [x] 7 African country profiles

### Planned

- [ ] Additional African countries (20+)
- [ ] Carbon credit marketplace integration
- [ ] DFI API partnerships
- [ ] Mobile application
- [ ] Multi-language support (French, Portuguese, Arabic)
- [ ] Real-time project monitoring dashboard
- [ ] Blockchain-based verification trail

---

## Contributing

We welcome contributions. Please see our contributing guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Contact

- **Website:** [verdx.site](https://www.verdx.site)
- **Documentation:** [verdx.site/docs](https://www.verdx.site/docs)

---

Built for the [LMA Edge Hackathon 2025](https://lma-edge.devpost.com/)
