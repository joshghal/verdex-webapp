import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/api-handler';
import { callLMAApi } from '@/lib/ai/lma-api-handler';
import type { ComponentSections } from '../lma/types';

// PDF parsing with pdf-parse
async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF');
  }
}

// Extract structured data from PDF text using AI
async function extractProjectData(text: string): Promise<{
  projectName: string;
  country: string;
  sector: string;
  projectType: string;
  description: string;
  climateTargets: string;
  financingNeeded: number | null;
  debtAmount: number | null;
  equityAmount: number | null;
  transitionPlan: string;
  baselineEmissions: string;
  currentScope1: number | null;
  currentScope2: number | null;
  currentScope3: number | null;
  targetScope1: number | null;
  targetScope2: number | null;
  targetScope3: number | null;
  // NEW: Total emissions fields for documents that don't break down by scope
  totalBaselineEmissions: number | null;
  totalTargetEmissions: number | null;
  statedReductionPercent: number | null;
  targetYear: number | null;
  verificationStatus: string;
  hasPublishedPlan: string;
}> {
  const systemPrompt = `You are an expert at extracting project information from documents for transition finance assessments. Extract ALL requested fields with precision. For numeric fields, extract actual numbers mentioned in the document. Respond in JSON format only.`;

  const userPrompt = `Analyze the following document text and extract project information. Extract these fields:

1. projectName: The name of the project or company
2. country: The country where the project is located
3. sector: The industry sector (Energy, Manufacturing, Agriculture, Transport, Mining, Real Estate, Water)
4. projectType: Specific project type (e.g., "Solar PV", "Wind Farm", "Coffee Processing", "EV Fleet")
5. description: Project description INCLUDING any mentions of SBTi, Science Based Targets, Paris Agreement, NDC, 1.5°C pathway
6. climateTargets: Any climate or emissions reduction targets mentioned as text
7. financingNeeded: Total financing/investment amount in USD (number only, convert from millions if needed)
8. debtAmount: Debt/loan amount in USD (number only, or null if not mentioned)
9. equityAmount: Equity amount in USD (number only, or null if not mentioned)
10. transitionPlan: Transition strategy INCLUDING any mentions of SBTi, science-based targets, Paris Agreement, NDC, 1.5°C
11. baselineEmissions: Baseline emissions description as text

**KEYWORD PRESERVATION RULES:**
When extracting description and transitionPlan, check if the source document contains these keywords:
- "SBTi", "Science Based Targets", "science-based targets"
- "Paris Agreement", "Paris"
- "NDC", "Nationally Determined Contributions"
- "1.5°C", "1.5 degrees", "1.5C pathway"

IF the document contains any of these keywords → copy them EXACTLY into description or transitionPlan
IF the document does NOT contain these keywords → do NOT add them (no hallucination)
12. currentScope1: Current Scope 1 emissions in tCO2e/year (number only, or null)
13. currentScope2: Current Scope 2 emissions in tCO2e/year (number only, or null)
14. currentScope3: Current Scope 3 emissions in tCO2e/year (number only, or null)
15. targetScope1: Target Scope 1 emissions in tCO2e/year (number only, or null)
16. targetScope2: Target Scope 2 emissions in tCO2e/year (number only, or null)
17. targetScope3: Target Scope 3 emissions in tCO2e/year (number only, or null)
18. totalBaselineEmissions: TOTAL baseline/current emissions in tCO2e/year (sum all sources if itemized, number only)
19. totalTargetEmissions: TOTAL target emissions in tCO2e/year (sum all sources if itemized, number only)
20. statedReductionPercent: The stated emissions reduction percentage if mentioned (e.g., "28% reduction" = 28)
21. targetYear: Target year for emissions reduction (e.g., 2030, or null if not mentioned)
22. verificationStatus: Extract verification status. Look for:
    - "third-party verification", "independent verification", "external audit"
    - "SPO" (Second Party Opinion), "second party opinion"
    - "verified by DNV/KPMG/EY/Deloitte"
    - "annual verification", "verification commitment"
    - If ANY verification mention exists, return the relevant text. If none found, return empty string.
23. hasPublishedPlan: Does the document indicate a published/board-approved transition plan? Look for:
    - "published transition plan/strategy"
    - "board-approved climate strategy"
    - "entity-level transition strategy"
    - "corporate transition roadmap"
    Return "yes" if found, "no" if explicitly stated as not having one, empty if unclear

IMPORTANT EMISSIONS EXTRACTION:
- For emissions fields, look for numbers like "12,500 tCO2e" or "current emissions: 15,000 tonnes CO2"
- CRITICAL: totalBaselineEmissions should be the TOTAL of ALL emission sources (including Water Treatment, Solar Avoided, etc.)
- If the document shows an emissions table, SUM all baseline sources for totalBaselineEmissions and all target sources for totalTargetEmissions
- For statedReductionPercent, look for phrases like "28% reduction", "reduce by 30%", "achieve 42% decrease"
- If reduction % is not stated but totals are given, calculate: ((baseline - target) / baseline) * 100

For financing, convert "USD 25 million" to 25000000.

Document text (beginning and end to capture all sections):

--- BEGINNING ---
${text.substring(0, 6000)}

--- END OF DOCUMENT ---
${text.length > 8000 ? text.substring(text.length - 4000) : ''}
--- END ---

Respond in JSON format only:
{
  "projectName": "",
  "country": "",
  "sector": "",
  "projectType": "",
  "description": "",
  "climateTargets": "",
  "financingNeeded": null,
  "debtAmount": null,
  "equityAmount": null,
  "transitionPlan": "",
  "baselineEmissions": "",
  "currentScope1": null,
  "currentScope2": null,
  "currentScope3": null,
  "targetScope1": null,
  "targetScope2": null,
  "targetScope3": null,
  "totalBaselineEmissions": null,
  "totalTargetEmissions": null,
  "statedReductionPercent": null,
  "targetYear": null,
  "verificationStatus": "",
  "hasPublishedPlan": ""
}`;

  try {
    const result = await callAI({
      systemPrompt,
      userPrompt,
      jsonMode: true,
      temperature: 0.1,
      maxTokens: 1500
    });

    if (result.success && result.parsed) {
      // PROGRAMMATIC OVERRIDES: Check full document for compliance phrases
      // This is more reliable than AI extraction for specific keywords
      const fullTextLower = text.toLowerCase();

      // Override hasPublishedPlan if compliance phrases found anywhere in document
      const hasPublishedPlanPhrases = [
        'this document constitutes the published transition strategy',
        'published transition plan',
        'published transition strategy',
        'board-approved transition',
        'entity-level transition strategy',
        'lma compliance statements'
      ];
      const foundPublishedPlan = hasPublishedPlanPhrases.some(phrase => fullTextLower.includes(phrase));
      if (foundPublishedPlan && result.parsed.hasPublishedPlan !== 'yes') {
        console.log('[Extract] Override hasPublishedPlan to "yes" (found compliance phrase in full text)');
        result.parsed.hasPublishedPlan = 'yes';
      }

      // Override verificationStatus if verification phrases found anywhere in document
      const verificationPhrases = [
        'third-party verification by an independent auditor',
        'annual third-party verification',
        'annual verification',
        'third-party verification',
        'independent auditor (dnv',
        'verified by dnv',
        'verified by kpmg',
        'second party opinion (spo)',
        'second party opinion will be obtained'
      ];
      const foundVerification = verificationPhrases.find(phrase => fullTextLower.includes(phrase));
      if (foundVerification && (!result.parsed.verificationStatus || result.parsed.verificationStatus.length < 5)) {
        console.log(`[Extract] Override verificationStatus (found: "${foundVerification}")`);
        result.parsed.verificationStatus = `Third-party verification commitment: ${foundVerification}`;
      }

      return result.parsed;
    }

    throw new Error(result.error || 'Failed to parse AI response');
  } catch (error) {
    console.error('AI extraction error:', error);
    // Return empty structure on error
    return {
      projectName: '',
      country: '',
      sector: '',
      projectType: '',
      description: '',
      climateTargets: '',
      financingNeeded: null,
      debtAmount: null,
      equityAmount: null,
      transitionPlan: '',
      baselineEmissions: '',
      currentScope1: null,
      currentScope2: null,
      currentScope3: null,
      targetScope1: null,
      targetScope2: null,
      targetScope3: null,
      totalBaselineEmissions: null,
      totalTargetEmissions: null,
      statedReductionPercent: null,
      targetYear: null,
      verificationStatus: '',
      hasPublishedPlan: '',
    };
  }
}

// Extract LMA component sections from document text for AI evaluation
async function extractComponentSections(text: string): Promise<ComponentSections> {
  console.log(`[Component Sections] Starting extraction from ${text.length} chars of text`);
  console.log(`[Component Sections] Document preview (first 500 chars): ${text.substring(0, 500).replace(/\n/g, ' ')}`);
  console.log(`[Component Sections] Document preview (last 500 chars): ${text.substring(text.length - 500).replace(/\n/g, ' ')}`);


  const systemPrompt = `You are a JSON extraction assistant. You MUST respond with valid JSON only. No explanations, no markdown, just pure JSON.`;

  const userPrompt = `Extract content from this transition finance document for 5 LMA components.

DOCUMENT:
${text.substring(0, 12000)}

---

Extract relevant quotes/content for each component. Respond with ONLY this JSON structure (no other text):

{"strategy":"content about transition strategy, climate targets, Paris Agreement, SBTi here","useOfProceeds":"content about how funds are used, eligible activities, emissions reductions here","selection":"content about project selection criteria, governance, screening here","management":"content about fund tracking, accounts, allocation here","reporting":"content about reporting, verification, audits, KPIs here"}`;

  try {
    // Use dedicated LMA API (ASI1) which handles JSON better
    const result = await callLMAApi({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 6000
    });

    console.log(`[Component Sections] ASI1 result - success: ${result.success}, has parsed: ${!!result.parsed}`);

    if (!result.success) {
      console.error('[Component Sections] ASI1 call failed:', result.error);
    }

    // Debug: log raw content preview
    if (result.content) {
      console.log(`[Component Sections] Raw content preview (first 500 chars): ${result.content.substring(0, 500)}`);
    }

    if (result.success && result.parsed) {
      const sections = {
        strategy: result.parsed.strategy || '',
        useOfProceeds: result.parsed.useOfProceeds || '',
        selection: result.parsed.selection || '',
        management: result.parsed.management || '',
        reporting: result.parsed.reporting || '',
      };

      // Log what was extracted
      console.log(`[Component Sections] Extracted - strategy: ${sections.strategy.length} chars, proceeds: ${sections.useOfProceeds.length} chars, selection: ${sections.selection.length} chars, management: ${sections.management.length} chars, reporting: ${sections.reporting.length} chars`);

      return sections;
    }

    // If parsed is empty, try to extract from raw content
    if (result.success && result.content) {
      console.log('[Component Sections] Attempting to parse from raw content...');
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const sections = {
            strategy: parsed.strategy || '',
            useOfProceeds: parsed.useOfProceeds || '',
            selection: parsed.selection || '',
            management: parsed.management || '',
            reporting: parsed.reporting || '',
          };
          console.log(`[Component Sections] Parsed from raw - strategy: ${sections.strategy.length} chars, proceeds: ${sections.useOfProceeds.length} chars`);
          return sections;
        }
      } catch (parseErr) {
        console.error('[Component Sections] JSON parse from content failed:', parseErr);
      }
    }

    throw new Error(result.error || 'Failed to extract component sections');
  } catch (error) {
    console.error('[Component Sections] Extraction error:', error);
    return {
      strategy: '',
      useOfProceeds: '',
      selection: '',
      management: '',
      reporting: '',
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('pdf') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No PDF file provided' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const text = await extractTextFromPDF(buffer);

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. The file may be scanned or image-based.' },
        { status: 400 }
      );
    }

    // Extract structured data and component sections in parallel
    const [extractedData, componentSections] = await Promise.all([
      extractProjectData(text),
      extractComponentSections(text)
    ]);

    return NextResponse.json({
      success: true,
      extractedText: text.substring(0, 2000), // Preview of extracted text
      rawDocumentText: text, // Full text for greenwashing analysis
      extractedFields: extractedData,
      componentSections, // LMA component sections for AI evaluation
      textLength: text.length,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PDF' },
      { status: 500 }
    );
  }
}
