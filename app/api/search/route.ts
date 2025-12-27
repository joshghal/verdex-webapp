import { NextRequest, NextResponse } from 'next/server';
import { searchDocuments, getIndexStats, getIndex } from '@/lib/pinecone';
import { generateEmbedding } from '@/lib/embeddings';

// Sample clause templates for fallback when Pinecone is empty
const SAMPLE_CLAUSES = [
  {
    id: 'margin-ratchet-1',
    content: `MARGIN RATCHET CLAUSE (Sustainability-Linked)

The applicable Margin shall be adjusted on each Margin Adjustment Date based on the Borrower's achievement of the Sustainability Performance Targets as follows:

(a) If the Borrower achieves [●]% or more of the SPTs, the Margin shall decrease by [●] basis points;
(b) If the Borrower achieves between [●]% and [●]% of the SPTs, the Margin shall remain unchanged;
(c) If the Borrower achieves less than [●]% of the SPTs, the Margin shall increase by [●] basis points.

The Sustainability Performance Targets shall be:
- SPT 1: [Description of first target, e.g., reduction in Scope 1 & 2 GHG emissions by X% by 20XX]
- SPT 2: [Description of second target, e.g., increase in renewable energy consumption to X% by 20XX]`,
    metadata: {
      clauseType: 'margin_ratchet',
      documentType: 'sustainability_linked_loan',
      source: 'LMA Sustainability-Linked Loan Principles',
    },
  },
  {
    id: 'kpi-definition-1',
    content: `KEY PERFORMANCE INDICATOR DEFINITIONS

"KPI 1" means the Borrower's absolute Scope 1 and Scope 2 GHG Emissions measured in tonnes of CO2 equivalent (tCO2e) per annum, calculated in accordance with the GHG Protocol.

"KPI 2" means the percentage of the Borrower's total electricity consumption sourced from Renewable Energy Sources.

"KPI 3" means the Borrower's energy intensity ratio, calculated as total energy consumption (in GJ) divided by [relevant production metric].

"Baseline" means the KPI values for the financial year ending [●], as verified by [Verification Provider].

"Target" means the KPI values to be achieved by the Borrower by [Target Date], as set out in Schedule [●].`,
    metadata: {
      clauseType: 'kpi',
      documentType: 'sustainability_linked_loan',
      source: 'LMA Sustainability-Linked Loan Principles',
    },
  },
  {
    id: 'reporting-covenant-1',
    content: `SUSTAINABILITY REPORTING COVENANT

The Borrower shall:

(a) deliver to the Agent, within [90/120] days after the end of each financial year, a Sustainability Compliance Certificate substantially in the form set out in Schedule [●], signed by an Authorised Signatory, certifying the Borrower's performance against each KPI for that financial year;

(b) procure that such Sustainability Compliance Certificate is accompanied by a Verification Report from an External Verifier confirming the accuracy of the reported KPI data;

(c) promptly notify the Agent if it becomes aware that it will not or is unlikely to meet any Sustainability Performance Target;

(d) maintain records and systems adequate to enable accurate measurement and reporting of the KPIs.`,
    metadata: {
      clauseType: 'reporting',
      documentType: 'sustainability_linked_loan',
      source: 'LMA Sustainability-Linked Loan Principles',
    },
  },
  {
    id: 'verification-1',
    content: `EXTERNAL VERIFICATION CLAUSE

"External Verifier" means [name of approved verification provider] or such other independent third party verification provider as may be approved by the Majority Lenders.

The Borrower shall, at its own cost:

(a) engage the External Verifier to verify the Borrower's performance against each KPI on an annual basis;

(b) ensure that the External Verifier provides limited or reasonable assurance (as applicable) in accordance with [ISAE 3000 / ISAE 3410];

(c) deliver the Verification Report to the Agent within [●] Business Days of receipt;

(d) promptly provide the External Verifier with access to such information, records, and personnel as the External Verifier may reasonably require.`,
    metadata: {
      clauseType: 'verification',
      documentType: 'sustainability_linked_loan',
      source: 'LMA Sustainability-Linked Loan Principles',
    },
  },
  {
    id: 'conditions-precedent-1',
    content: `CONDITIONS PRECEDENT - TRANSITION FINANCE

The obligation of each Lender to participate in the first Utilisation is subject to receipt by the Agent of the following in form and substance satisfactory to the Agent:

(a) a copy of the Borrower's Transition Plan, demonstrating alignment with [the Paris Agreement / a 1.5°C pathway];

(b) evidence that the Borrower has established Sustainability Performance Targets validated by [SBTi / an External Verifier];

(c) a Second Party Opinion from [approved SPO provider] confirming alignment of the Facility with the LMA Sustainability-Linked Loan Principles;

(d) evidence that the proceeds of the Facility will be applied to Eligible Projects as defined in Schedule [●];

(e) copies of all Environmental and Social Impact Assessments required under Applicable Law.`,
    metadata: {
      clauseType: 'conditions_precedent',
      documentType: 'transition_loan',
      source: 'LMA Transition Loan Principles',
    },
  },
  {
    id: 'dfi-participation-1',
    content: `DFI PARTICIPATION CLAUSE

"DFI Lender" means [IFC/AfDB/DEG/FMO/other] in its capacity as a Lender.

Notwithstanding any other provision of this Agreement:

(a) the DFI Lender shall not be required to fund any Utilisation if, in its reasonable opinion, such funding would result in a breach of any Sanctions or Anti-Corruption Laws;

(b) the Borrower shall comply with the DFI Lender's Environmental and Social Requirements as set out in Schedule [●];

(c) the Borrower shall permit the DFI Lender reasonable access to the Project site for monitoring purposes;

(d) any transfer by the DFI Lender of its Commitment or participation shall be subject to the DFI Lender's standard transfer restrictions.`,
    metadata: {
      clauseType: 'dfi_participation',
      documentType: 'blended_finance',
      source: 'LMA Developing Markets Documentation',
    },
  },
  {
    id: 'use-of-proceeds-1',
    content: `USE OF PROCEEDS - TRANSITION FINANCE

The Borrower shall apply all amounts borrowed under the Facility exclusively for:

(a) Eligible Projects, being projects that:
    (i) contribute to the Borrower's transition towards a low-carbon business model;
    (ii) are consistent with the Borrower's published Transition Plan; and
    (iii) fall within the Eligible Project Categories set out in Schedule [●];

(b) general corporate purposes directly related to the Borrower's transition strategy; and

(c) refinancing of existing Indebtedness incurred for purposes falling within paragraphs (a) or (b) above.

The Borrower shall maintain a Transition Proceeds Account and shall provide quarterly reports to the Agent on the allocation of Facility proceeds to Eligible Projects.`,
    metadata: {
      clauseType: 'use_of_proceeds',
      documentType: 'transition_loan',
      source: 'LMA Transition Loan Principles',
    },
  },
];

// Available clause types for filtering
const CLAUSE_TYPES = [
  'interest',
  'facility_terms',
  'events_of_default',
  'security',
  'prepayment',
  'margin_ratchet',
  'conditions_precedent',
  'representations',
  'fees',
  'verification',
  'reporting_covenant',
  'kpi_definition',
  'spt_definition',
  'use_of_proceeds',
];

// Available document types for filtering
const DOCUMENT_TYPES = [
  'facility_agreement',
  'guide',
  'glossary',
  'markup',
  'briefing',
  'document',
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, filters, limit = 10, searchMode = 'keyword' } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    let results: any[] = [];
    let source = 'sample_templates';

    // Handle clause ID search
    if (searchMode === 'clauseId') {
      try {
        const index = getIndex();
        const fetchResult = await index.fetch([query.trim()]);

        if (fetchResult.records && fetchResult.records[query.trim()]) {
          const record = fetchResult.records[query.trim()];
          results = [{
            id: record.id,
            score: 1,
            content: (record.metadata?.content as string) || '',
            metadata: {
              source: record.metadata?.source as string,
              clauseType: record.metadata?.clauseType as string,
              documentType: record.metadata?.documentType as string,
              section: record.metadata?.section as string,
            },
          }];
          source = 'pinecone';
        }
      } catch (error) {
        console.log('Pinecone fetch by ID failed:', error);
      }

      // Fallback to sample clauses for ID search
      if (results.length === 0) {
        const sampleMatch = SAMPLE_CLAUSES.find(c => c.id === query.trim());
        if (sampleMatch) {
          results = [{
            id: sampleMatch.id,
            score: 1,
            content: sampleMatch.content,
            metadata: sampleMatch.metadata,
          }];
        }
      }

      return NextResponse.json({
        results,
        totalFound: results.length,
        query,
        source,
        searchMode: 'clauseId',
        filters: {
          applied: null,
          available: {
            clauseTypes: CLAUSE_TYPES,
            documentTypes: DOCUMENT_TYPES,
          },
        },
      });
    }

    // Regular keyword/semantic search
    try {
      // Check if Pinecone has data
      const stats = await getIndexStats();
      const totalVectors = stats?.totalRecordCount || 0;

      if (totalVectors > 0) {
        // Generate embedding for query
        const queryEmbedding = await generateEmbedding(query);

        // Build Pinecone filter from provided filters
        let pineconeFilter: Record<string, any> | undefined;
        if (filters) {
          pineconeFilter = {};
          if (filters.clauseType) {
            pineconeFilter.clauseType = { $eq: filters.clauseType };
          }
          if (filters.documentType) {
            pineconeFilter.documentType = { $eq: filters.documentType };
          }
          if (filters.source) {
            pineconeFilter.source = { $eq: filters.source };
          }
          // If empty, set to undefined
          if (Object.keys(pineconeFilter).length === 0) {
            pineconeFilter = undefined;
          }
        }

        // Search Pinecone
        results = await searchDocuments(queryEmbedding, {
          topK: limit,
          filter: pineconeFilter,
        });

        if (results.length > 0) {
          source = 'pinecone';
        }
      }
    } catch (error) {
      console.log('Pinecone search failed, using fallback:', error);
    }

    // If no results from Pinecone, use sample clauses
    if (results.length === 0) {
      const queryLower = query.toLowerCase();

      // Simple keyword matching on sample clauses
      results = SAMPLE_CLAUSES
        .map(clause => {
          let score = 0;
          const contentLower = clause.content.toLowerCase();
          const typeLower = clause.metadata.clauseType?.toLowerCase() || '';

          // Check for keyword matches
          const keywords = queryLower.split(/\s+/);
          for (const keyword of keywords) {
            if (contentLower.includes(keyword)) score += 0.2;
            if (typeLower.includes(keyword)) score += 0.3;
          }

          // Boost for specific clause types
          if (queryLower.includes('margin') && typeLower.includes('margin')) score += 0.5;
          if (queryLower.includes('kpi') && typeLower.includes('kpi')) score += 0.5;
          if (queryLower.includes('report') && typeLower.includes('report')) score += 0.5;
          if (queryLower.includes('verif') && typeLower.includes('verif')) score += 0.5;
          if (queryLower.includes('dfi') && typeLower.includes('dfi')) score += 0.5;
          if (queryLower.includes('proceed') && typeLower.includes('proceed')) score += 0.5;
          if (queryLower.includes('condition') && typeLower.includes('condition')) score += 0.5;

          return {
            id: clause.id,
            score: Math.min(score, 1),
            content: clause.content,
            metadata: clause.metadata,
          };
        })
        .filter(r => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    return NextResponse.json({
      results,
      totalFound: results.length,
      query,
      source,
      filters: {
        applied: filters || null,
        available: {
          clauseTypes: CLAUSE_TYPES,
          documentTypes: DOCUMENT_TYPES,
        },
      },
    });

  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}

// GET endpoint for metadata and index stats
export async function GET() {
  try {
    const stats = await getIndexStats();

    return NextResponse.json({
      indexStats: {
        totalVectors: stats?.totalRecordCount || 0,
        dimension: stats?.dimension || 384,
      },
      filters: {
        clauseTypes: CLAUSE_TYPES,
        documentTypes: DOCUMENT_TYPES,
      },
    });
  } catch (error) {
    console.error('Failed to get search metadata:', error);
    return NextResponse.json({
      indexStats: { totalVectors: 0, dimension: 384 },
      filters: {
        clauseTypes: CLAUSE_TYPES,
        documentTypes: DOCUMENT_TYPES,
      },
    });
  }
}
