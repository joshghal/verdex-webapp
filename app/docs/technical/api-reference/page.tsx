import DocPage, { CollapsibleCodeBlock, InfoBox } from '@/components/docs/DocPage';

export const metadata = {
  title: 'API Reference | Verdex Docs',
  description: 'API documentation for integrating with Verdex',
};

export default function APIReferencePage() {
  return (
    <DocPage
      title="API Reference"
      description="Technical reference for integrating with the Verdex platform API."
      breadcrumbs={[{ label: 'Technical' }, { label: 'API Reference' }]}
      previousPage={{ title: 'Knowledge Base', href: '/docs/technical/knowledge-base' }}
      nextPage={{ title: 'Market Opportunity', href: '/docs/business/market-opportunity' }}
      tableOfContents={[
        { id: 'overview', title: 'Overview', level: 2 },
        { id: 'assess-endpoint', title: 'Assess Endpoint', level: 2 },
        { id: 'search-endpoint', title: 'Search Endpoint', level: 2 },
        { id: 'upload-pdf-endpoint', title: 'Upload PDF Endpoint', level: 2 },
        { id: 'chat-endpoint', title: 'Chat Endpoint', level: 2 },
        { id: 'clause-advice-endpoint', title: 'Clause Advice Endpoint', level: 2 },
        { id: 'generate-draft-endpoint', title: 'Generate Draft Endpoint', level: 2 },
      ]}
    >
      <h2 id="overview" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Overview
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        The Verdex API provides programmatic access to project assessment, DFI matching, clause search,
        AI-powered chat assistance, and transition loan draft generation. All endpoints accept JSON
        requests and return JSON responses.
      </p>

      {/* ============================== ASSESS ENDPOINT ============================== */}
      <h2 id="assess-endpoint" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        POST /api/assess
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Submit a project for LMA transition eligibility assessment. Returns comprehensive scoring across
        five LMA components, greenwashing risk analysis, DFI matches, and AI-generated KPI/SPT recommendations.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">cURL Example</h3>

      <CollapsibleCodeBlock
        language="bash"
        title="cURL"
        code={`curl -X POST https://www.verdx.site/api/assess \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectName": "Kano Solar Farm Phase II",
    "country": "nigeria",
    "sector": "energy",
    "projectType": "Solar PV",
    "description": "200MW solar PV installation with battery storage",
    "totalCost": 50000000,
    "debtAmount": 40000000,
    "equityAmount": 10000000,
    "currentEmissions": { "scope1": 5000, "scope2": 2000, "scope3": 15000 },
    "targetEmissions": { "scope1": 500, "scope2": 0, "scope3": 8000 },
    "targetYear": 2030,
    "transitionStrategy": "Phase out diesel generators, install solar PV",
    "hasPublishedPlan": true,
    "thirdPartyVerification": false
  }'`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Request Body</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Request"
        code={`{
  // Required fields
  "projectName": "Kano Solar Farm Phase II",
  "country": "nigeria",  // Must be African country
  "sector": "energy",    // energy | agriculture | transport | manufacturing | mining | real_estate | water

  // Optional fields
  "projectType": "Solar PV",
  "description": "200MW solar PV installation with battery storage...",
  "totalCost": 50000000,
  "debtAmount": 40000000,
  "equityAmount": 10000000,
  "currentEmissions": {
    "scope1": 5000,
    "scope2": 2000,
    "scope3": 15000  // Optional but recommended
  },
  "targetEmissions": {
    "scope1": 500,
    "scope2": 0,
    "scope3": 8000
  },
  "targetYear": 2030,

  // Total emissions fields (preferred when available)
  "totalBaselineEmissions": 22000,  // tCO2e/year
  "totalTargetEmissions": 8500,
  "statedReductionPercent": 61,     // Document's stated reduction %

  "transitionStrategy": "Phase out diesel generators, install solar...",
  "hasPublishedPlan": true,
  "thirdPartyVerification": false,
  "rawDocumentText": "..."  // Optional: full document text for greenwashing detection
}`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Response"
        code={`{
  "projectName": "Kano Solar Farm Phase II",
  "country": "nigeria",
  "countryName": "Nigeria",
  "sector": "energy",
  "targetYear": 2030,

  // Eligibility
  "eligibilityStatus": "eligible" | "partial" | "ineligible",
  "ineligibilityReasons": [],  // Reasons if ineligible

  // Scoring
  "overallScore": 75,           // 0-100, after greenwashing penalty
  "lmaBaseScore": 80,           // Raw LMA score before penalty
  "greenwashingPenalty": 5,     // Points deducted

  // LMA Component Breakdown
  "lmaComponents": [
    {
      "name": "Strategy Alignment",
      "score": 18,
      "maxScore": 20,
      "feedback": [
        {
          "status": "met",
          "description": "Published transition plan exists"
        },
        {
          "status": "missing",
          "description": "No SBTi alignment mentioned",
          "action": "Commit to Science Based Targets initiative..."
        }
      ]
    }
    // ... Use of Proceeds, Target Ambition, Reporting & Verification, Project Selection
  ],

  // Greenwashing Risk
  "greenwashingRisk": {
    "level": "low" | "medium" | "high",
    "score": 25,
    "redFlags": [
      {
        "description": "Vague emissions targets",
        "recommendation": "Specify exact reduction percentages..."
      }
    ],
    "positiveIndicators": ["Third-party verification mentioned"],
    "recommendations": ["Add specific timelines..."]
  },

  // DFI Matches
  "dfiMatches": [
    {
      "id": "ifc",
      "name": "IFC",
      "fullName": "International Finance Corporation",
      "matchScore": 95,
      "matchReasons": ["Strong renewable energy focus", "Active in Nigeria"],
      "concerns": ["Requires detailed ESIA"],
      "recommendedRole": "Senior Lender",
      "estimatedSize": { "min": 20000000, "max": 40000000 },
      "climateTarget": "85% climate finance by 2025",
      "specialPrograms": ["Scaling Solar", "IDA PSW"]
    }
  ],

  // Blended Finance Structure
  "blendedStructure": {
    "recommended": true,
    "layers": [...],
    "totalSize": 50000000
  },

  // AI-Generated Recommendations
  "kpiRecommendations": [
    {
      "name": "Installed Solar Capacity",
      "unit": "MW",
      "description": "Total operational solar PV capacity",
      "suggestedTarget": "200 MW by 2026",
      "source": "IFC Performance Standards",
      "rationale": "Aligned with Nigeria's RE targets"
    }
  ],
  "sptRecommendations": [
    {
      "name": "GHG Emissions Reduction",
      "baseline": "22,000 tCO2e/year",
      "target": "8,500 tCO2e/year by 2030",
      "marginImpact": "-10 bps on achievement",
      "verificationMethod": "Annual third-party audit (ISO 14064)"
    }
  ],
  "frameworksReferenced": ["GHG Protocol", "SBTi", "IFC Performance Standards"],
  "kpiAiGenerated": true,

  // Country Context
  "countryInfo": {
    "region": "West Africa",
    "legalSystem": "Common Law",
    "currency": "NGN",
    "sovereignRating": "B-",
    "politicalRisk": "medium",
    "ndcTarget": "47% emissions reduction by 2030",
    "renewableTargets": "30% RE by 2030"
  },

  // Next Steps
  "nextSteps": [
    "Project is well-positioned for transition loan financing",
    "3 DFIs identified - begin preliminary discussions",
    "Engage legal counsel to prepare LMA-compliant documentation"
  ],

  "assessmentDate": "2024-01-15T10:30:00.000Z"
}`}
      />

      <InfoBox type="info" title="Scoring Logic">
        Projects score 0-100 across five LMA components (20 points each). Greenwashing red flags reduce
        the score: high severity (-10 pts), medium (-6 pts), low (-3 pts). Fossil fuel projects and
        non-African locations are automatically ineligible.
      </InfoBox>

      {/* ============================== SEARCH ENDPOINT ============================== */}
      <h2 id="search-endpoint" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        POST /api/search
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Search the LMA clause library using semantic search powered by embeddings.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">cURL Example</h3>

      <CollapsibleCodeBlock
        language="bash"
        title="cURL"
        code={`curl -X POST https://www.verdx.site/api/search \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "margin ratchet sustainability linked",
    "limit": 10,
    "filters": {
      "clauseType": "margin_ratchet"
    }
  }'`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Request Body</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Request"
        code={`{
  "query": "margin ratchet sustainability linked",
  "limit": 10,               // Default: 10
  "searchMode": "keyword",   // "keyword" | "clauseId"
  "filters": {
    "clauseType": "margin_ratchet",    // Optional
    "documentType": "facility_agreement",  // Optional
    "source": "LMA Sustainability-Linked Loan Principles"  // Optional
  }
}`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Response"
        code={`{
  "results": [
    {
      "id": "margin-ratchet-1",
      "score": 0.92,
      "content": "MARGIN RATCHET CLAUSE (Sustainability-Linked)\\n\\nThe applicable Margin shall be adjusted...",
      "metadata": {
        "clauseType": "margin_ratchet",
        "documentType": "sustainability_linked_loan",
        "source": "LMA Sustainability-Linked Loan Principles"
      }
    }
  ],
  "totalFound": 7,
  "query": "margin ratchet sustainability linked",
  "source": "pinecone" | "sample_templates",
  "searchMode": "keyword",
  "filters": {
    "applied": { "clauseType": "margin_ratchet" },
    "available": {
      "clauseTypes": ["interest", "facility_terms", "events_of_default", "security",
                     "prepayment", "margin_ratchet", "conditions_precedent",
                     "representations", "fees", "verification", "reporting_covenant",
                     "kpi_definition", "spt_definition", "use_of_proceeds"],
      "documentTypes": ["facility_agreement", "guide", "glossary", "markup", "briefing", "document"]
    }
  }
}`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">GET /api/search</h3>

      <p className="text-gray-700 leading-relaxed mb-4">
        Retrieve search index metadata and available filter options.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">cURL Example</h3>

      <CollapsibleCodeBlock
        language="bash"
        title="cURL"
        code={`curl -X GET https://www.verdx.site/api/search`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Response"
        code={`{
  "indexStats": {
    "totalVectors": 1250,
    "dimension": 384
  },
  "filters": {
    "clauseTypes": ["interest", "facility_terms", ...],
    "documentTypes": ["facility_agreement", "guide", ...]
  }
}`}
      />

      {/* ============================== UPLOAD PDF ENDPOINT ============================== */}
      <h2 id="upload-pdf-endpoint" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        POST /api/upload-pdf
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Upload a PDF document to extract project information using AI. Returns structured data
        including project details, emissions data, and financial information.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">cURL Example</h3>

      <CollapsibleCodeBlock
        language="bash"
        title="cURL"
        code={`curl -X POST https://www.verdx.site/api/upload-pdf \\
  -F "pdf=@/path/to/your/project-document.pdf"`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Request</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Request"
        code={`// Content-Type: multipart/form-data
// Field: "pdf" - The PDF file to upload

const formData = new FormData();
formData.append('pdf', file);

const response = await fetch('/api/upload-pdf', {
  method: 'POST',
  body: formData
});`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Response"
        code={`{
  "success": true,
  "extractedText": "First 2000 characters of extracted text...",
  "rawDocumentText": "Full extracted text for greenwashing analysis",
  "textLength": 15420,
  "extractedFields": {
    "projectName": "Kano Solar Farm Phase II",
    "country": "Nigeria",
    "sector": "Energy",
    "projectType": "Solar PV",
    "description": "200MW solar PV installation with grid connection...",
    "climateTargets": "61% emissions reduction by 2030",
    "financingNeeded": 50000000,
    "debtAmount": 40000000,
    "equityAmount": 10000000,
    "transitionPlan": "Phase out diesel generators, install solar PV...",
    "baselineEmissions": "22,000 tCO2e/year from current operations",

    // Scope-level emissions (if available in document)
    "currentScope1": 5000,
    "currentScope2": 2000,
    "currentScope3": 15000,
    "targetScope1": 500,
    "targetScope2": 0,
    "targetScope3": 8000,

    // Total emissions (preferred for assessment)
    "totalBaselineEmissions": 22000,
    "totalTargetEmissions": 8500,
    "statedReductionPercent": 61,
    "targetYear": 2030,

    "verificationStatus": "DNV verification planned for Q2 2025"
  }
}`}
      />

      <InfoBox type="info" title="PDF Processing">
        The endpoint uses pdf-parse for text extraction and AI for structured data extraction.
        Scanned or image-based PDFs will return an error. Maximum recommended file size is 10MB.
      </InfoBox>

      {/* ============================== CHAT ENDPOINT ============================== */}
      <h2 id="chat-endpoint" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        POST /api/chat
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        RAG-powered conversational assistant for LMA clause questions. Uses semantic search to
        retrieve relevant clauses and provides contextual answers with source citations.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">cURL Example</h3>

      <CollapsibleCodeBlock
        language="bash"
        title="cURL"
        code={`curl -X POST https://www.verdx.site/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "message": "How should I structure KPIs for a sustainability-linked loan?",
    "history": []
  }'`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Request Body</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Request"
        code={`{
  "message": "How should I structure KPIs for a sustainability-linked loan?",
  "history": [   // Optional: conversation history
    { "role": "user", "content": "What is a margin ratchet?" },
    { "role": "assistant", "content": "A margin ratchet is a mechanism..." }
  ]
}`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Response"
        code={`{
  "response": "For sustainability-linked loans, KPIs should be material to your business, measurable, externally verifiable, and benchmarkable against industry standards. Common KPIs include:\\n\\n1. **GHG Emissions** - Scope 1, 2, and ideally Scope 3\\n2. **Renewable Energy Share** - % of total energy consumption\\n3. **Energy Intensity** - Energy per unit of production\\n\\nBased on LMA guidelines...",

  "sources": [
    {
      "id": "kpi-definition-1",
      "clauseType": "kpi",
      "preview": "KEY PERFORMANCE INDICATOR DEFINITIONS\\n\\n\\"KPI 1\\" means the Borrower's absolute...",
      "score": 0.89
    },
    {
      "id": "reporting-covenant-1",
      "clauseType": "reporting",
      "preview": "SUSTAINABILITY REPORTING COVENANT\\n\\nThe Borrower shall...",
      "score": 0.82
    }
  ],

  "suggestedQuestions": [
    "What verification requirements apply to KPIs?",
    "How do SPTs differ from KPIs?",
    "What margin adjustments are typical for KPI achievement?"
  ],

  "provider": "asi1"  // AI provider used
}`}
      />

      <InfoBox type="info" title="RAG Pipeline">
        The chat endpoint generates embeddings for your question, searches the Pinecone vector store
        for relevant LMA clauses (top 5), then provides these as context to the AI model for
        generating grounded responses.
      </InfoBox>

      {/* ============================== CLAUSE ADVICE ENDPOINT ============================== */}
      <h2 id="clause-advice-endpoint" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        POST /api/clause-advice
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Get AI-generated advice for applying a specific LMA clause template to your project.
        Returns relevance scoring, application guidance, and a contextualized clause example.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">cURL Example</h3>

      <CollapsibleCodeBlock
        language="bash"
        title="cURL"
        code={`curl -X POST https://www.verdx.site/api/clause-advice \\
  -H "Content-Type: application/json" \\
  -d '{
    "clause": {
      "content": "MARGIN RATCHET CLAUSE (Sustainability-Linked)...",
      "clauseType": "margin_ratchet",
      "source": "LMA Sustainability-Linked Loan Principles"
    },
    "projectContext": {
      "projectName": "Kano Solar Farm Phase II",
      "sector": "energy",
      "country": "Nigeria",
      "eligibilityStatus": "eligible",
      "kpis": [{ "name": "GHG Emissions Reduction", "description": "Annual tCO2e reduction" }],
      "spts": [{ "name": "Emissions Target", "target": "61% reduction by 2030" }]
    }
  }'`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Request Body</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Request"
        code={`{
  "clause": {
    "content": "MARGIN RATCHET CLAUSE (Sustainability-Linked)\\n\\nThe applicable Margin shall be adjusted...",
    "clauseType": "margin_ratchet",
    "source": "LMA Sustainability-Linked Loan Principles"
  },
  "projectContext": {
    "projectName": "Kano Solar Farm Phase II",
    "sector": "energy",
    "country": "Nigeria",
    "eligibilityStatus": "eligible",
    "kpis": [
      { "name": "Installed Solar Capacity", "description": "Total MW installed" },
      { "name": "GHG Emissions Reduction", "description": "Annual tCO2e reduction" }
    ],
    "spts": [
      { "name": "Emissions Target", "target": "61% reduction by 2030" }
    ]
  }
}`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Response"
        code={`{
  "success": true,
  "advice": {
    "relevanceScore": 9,  // 1-10 scale
    "relevanceSummary": "This margin ratchet clause is highly relevant for your solar project as it directly links financing costs to your GHG emissions reduction targets.",

    "howToApply": "Insert specific SPT thresholds: -10 bps for achieving 61% emissions reduction, +5 bps if target missed. Include annual verification requirement with DNV or similar provider.",

    "whenToUse": "Include in all sustainability-linked facility agreements where margin adjustments are tied to ESG performance.",

    "keyConsiderations": [
      "Ensure SPT thresholds are ambitious but achievable",
      "Align verification timing with annual reporting cycle",
      "Consider step-down mechanics for exceeding targets"
    ],

    "suggestedModifications": "For African energy projects, consider adding force majeure provisions for grid connection delays and specify local currency margin calculations.",

    "contextualizedExample": "Kano Solar Farm Phase II (the \\"Borrower\\") shall be subject to margin adjustments as follows:\\n\\n(a) If the Borrower achieves 61% or greater emissions reduction from the 22,000 tCO2e/year baseline by the Target Date, the Margin shall decrease by 10 basis points;\\n(b) If the Borrower achieves between 45% and 60% emissions reduction, the Margin shall remain unchanged;\\n(c) If the Borrower achieves less than 45% emissions reduction, the Margin shall increase by 5 basis points.\\n\\nVerification shall be conducted annually by an independent third party (DNV, KPMG, or equivalent)."
  },
  "provider": "groq"
}`}
      />

      {/* ============================== GENERATE DRAFT ENDPOINT ============================== */}
      <h2 id="generate-draft-endpoint" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        POST /api/generate-draft
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Generate a complete LMA transition loan project draft document. Uses a 3-phase AI pipeline
        (Analyze → Generate → Review) with RAG context from the LMA Guide to Transition Loans.
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">cURL Example</h3>

      <CollapsibleCodeBlock
        language="bash"
        title="cURL"
        code={`curl -X POST https://www.verdx.site/api/generate-draft \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectName": "Kano Solar Farm Phase II",
    "country": "nigeria",
    "countryName": "Nigeria",
    "sector": "energy",
    "eligibilityStatus": "eligible",
    "overallScore": 75,
    "targetYear": 2030,
    "description": "200MW solar PV installation",
    "projectType": "Solar PV",
    "totalCost": 50000000,
    "debtAmount": 40000000,
    "equityAmount": 10000000,
    "currentEmissions": { "scope1": 5000, "scope2": 2000, "scope3": 15000 },
    "targetEmissions": { "scope1": 500, "scope2": 0, "scope3": 8000 },
    "lmaComponents": [],
    "greenwashingRisk": { "level": "low", "score": 20, "redFlags": [], "positiveIndicators": [] },
    "dfiMatches": [],
    "nextSteps": []
  }'`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Request Body</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Request"
        code={`{
  // Required - from /api/assess response
  "projectName": "Kano Solar Farm Phase II",
  "country": "nigeria",
  "countryName": "Nigeria",
  "sector": "energy",
  "eligibilityStatus": "eligible",
  "overallScore": 75,
  "lmaComponents": [...],  // From assess response
  "greenwashingRisk": {...},  // From assess response
  "dfiMatches": [...],  // From assess response
  "nextSteps": [...],  // From assess response

  // Optional - enhances draft quality
  "targetYear": 2030,
  "description": "200MW solar PV installation...",
  "projectType": "Solar PV",
  "totalCost": 50000000,
  "debtAmount": 40000000,
  "equityAmount": 10000000,
  "currentEmissions": { "scope1": 5000, "scope2": 2000, "scope3": 15000 },
  "targetEmissions": { "scope1": 500, "scope2": 0, "scope3": 8000 },
  "totalBaselineEmissions": 22000,
  "totalTargetEmissions": 8500,
  "statedReductionPercent": 61,
  "transitionStrategy": "Phase out diesel...",
  "hasPublishedPlan": true,
  "thirdPartyVerification": false,

  // AI-generated recommendations (from assess)
  "kpiRecommendations": [...],
  "sptRecommendations": [...],

  // Relevant clauses with AI advice (from search + clause-advice)
  "relevantClauses": [
    {
      "id": "margin-ratchet-1",
      "content": "MARGIN RATCHET CLAUSE...",
      "metadata": { "clauseType": "margin_ratchet", "source": "LMA SLL Principles" },
      "advice": {
        "relevanceScore": 9,
        "relevanceSummary": "...",
        "howToApply": "...",
        "contextualizedExample": "Kano Solar Farm Phase II shall..."
      }
    }
  ],

  // Country context
  "countryInfo": {
    "region": "West Africa",
    "legalSystem": "Common Law",
    "currency": "NGN",
    "sovereignRating": "B-",
    "politicalRisk": "medium",
    "ndcTarget": "47% emissions reduction by 2030"
  },

  // Optional: Transition-specific fields
  "transitionPlan": {
    "shortTermTargets": [{ "year": 2025, "target": "15% reduction" }],
    "mediumTermTargets": [{ "year": 2030, "target": "61% reduction" }],
    "longTermTargets": [{ "year": 2050, "target": "Net zero" }],
    "sectorPathway": "SBTi 1.5°C power sector pathway",
    "taxonomyAlignment": ["Paris Agreement", "EU Taxonomy"]
  },
  "useOfProceedsCategories": [
    { "category": "Solar PV Installation", "allocation": 70, "eligibilityCriteria": "Renewable energy generation" }
  ],
  "governanceFramework": {
    "boardOversight": true,
    "climateCommittee": true,
    "executiveIncentives": false
  },
  "externalReview": {
    "preSigning": { "type": "Second Party Opinion", "provider": "Sustainalytics" },
    "annual": { "type": "Limited assurance", "provider": "DNV" }
  }
}`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Response</h3>

      <CollapsibleCodeBlock
        language="typescript"
        title="Response"
        code={`{
  "success": true,
  "draft": "# Kano Solar Farm Phase II\\n## LMA Transition Loan Project Draft\\n\\n**Generated:** 2024-01-15\\n**Country:** Nigeria\\n**Sector:** Energy\\n**Target DFI:** IFC\\n\\n---\\n\\n## 1. EXECUTIVE SUMMARY\\n\\n| Metric | Value |\\n|--------|-------|\\n| Project | Kano Solar Farm Phase II |\\n| Total Investment | USD 50,000,000 |\\n| Emissions Reduction | 61% by 2030 |\\n...\\n\\n## 2. PROJECT DESCRIPTION\\n\\n[200+ word description with SBTi, Paris Agreement, NDC alignment]\\n\\n## 3. TRANSITION STRATEGY\\n\\n[Emissions tables for Scope 1/2/3, roadmap]\\n\\n## 4. FINANCING STRUCTURE\\n\\n[Debt/equity breakdown, DFI strategy]\\n\\n## 5. USE OF PROCEEDS & ELIGIBILITY\\n\\n[Categories, allocations, eligibility criteria]\\n\\n## 6. TRANSITION PLAN\\n\\n[Decarbonization pathway, governance framework, just transition]\\n\\n## 7. KPI FRAMEWORK\\n\\n[Detailed KPI table with baselines, targets, methodology]\\n\\n## 8. TPT MECHANISM\\n\\n[Transition Performance Targets with margin adjustments]\\n\\n## 9. RISK MITIGATION & EXTERNAL REVIEW\\n\\n[Red flag responses, verification schedule]\\n\\n## 10. DFI ROADMAP & ANNEXES\\n\\n[Submission timeline, documentation checklist, glossary]\\n\\n---\\n\\n## ANNEX A: ADAPTED LMA CLAUSES\\n\\n### Margin & Interest\\n\\n**1. Margin Ratchet**\\n*Source: LMA Sustainability-Linked Loan Principles*\\n\\nKano Solar Farm Phase II (the \\"Borrower\\") shall be subject to margin adjustments...\\n\\n> **Application Note:** Insert specific SPT thresholds...\\n\\n---\\n\\n*End of Adapted Clauses Annex*",

  "metadata": {
    "generatedAt": "2024-01-15T10:30:00.000Z",
    "targetDFI": "IFC",
    "projectName": "Kano Solar Farm Phase II",
    "sector": "energy",
    "country": "Nigeria",
    "generationTime": 15420,  // milliseconds
    "phases": {
      "analyze": "complete",
      "generate": "complete",
      "review": "complete"
    },
    "ragContext": {
      "lmaGuideChunksUsed": 5,
      "chunkIds": ["lma-guide-chunk-1", "lma-guide-chunk-2", ...],
      "contextAvailable": true
    }
  }
}`}
      />

      <InfoBox type="info" title="3-Phase Generation Pipeline">
        <ul className="list-disc ml-4 mt-2 space-y-1">
          <li><strong>Phase 1 (Analyze):</strong> Extracts required keywords, identifies items to fix, and plans greenwashing mitigations</li>
          <li><strong>Phase 2 (Generate):</strong> Creates sections 1-5 and 6-10 in parallel for faster generation</li>
          <li><strong>Phase 3 (Review):</strong> Removes greenwashing language, validates dates (must be current year+), ensures required keywords present</li>
        </ul>
      </InfoBox>

      <InfoBox type="warning" title="Draft Generation Time">
        Draft generation typically takes 10-20 seconds due to the multi-phase AI pipeline.
        The endpoint has a 30-second timeout. For production use, consider implementing
        webhook callbacks or polling for long-running requests.
      </InfoBox>

    </DocPage>
  );
}
