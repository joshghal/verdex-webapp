import { NextRequest, NextResponse } from 'next/server';
import { callAI } from '@/lib/ai/api-handler';

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
  description: string;
  climateTargets: string;
  financingNeeded: number | null;
  transitionPlan: string;
  baselineEmissions: string;
  verificationStatus: string;
}> {
  const systemPrompt = `You are an expert at extracting project information from documents for transition finance assessments. Extract the requested fields and respond in JSON format only.`;

  const userPrompt = `Analyze the following document text and extract project information. Extract these fields:

1. projectName: The name of the project or company
2. country: The country where the project is located (African countries preferred)
3. sector: The industry sector (e.g., Energy, Manufacturing, Agriculture, Transport, Mining, Real Estate)
4. description: A brief description of the project and its transition goals (2-3 sentences)
5. climateTargets: Any climate or emissions reduction targets mentioned (e.g., "50% reduction by 2030")
6. financingNeeded: The financing amount needed in USD (just the number, or null if not mentioned)
7. transitionPlan: Summary of any transition plan or strategy mentioned
8. baselineEmissions: Any baseline emissions data mentioned
9. verificationStatus: Any third-party verification or certification mentioned

Document text:
${text.substring(0, 8000)}

Respond in JSON format only:
{
  "projectName": "",
  "country": "",
  "sector": "",
  "description": "",
  "climateTargets": "",
  "financingNeeded": null,
  "transitionPlan": "",
  "baselineEmissions": "",
  "verificationStatus": ""
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
      description: '',
      climateTargets: '',
      financingNeeded: null,
      transitionPlan: '',
      baselineEmissions: '',
      verificationStatus: '',
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

    // Extract structured data using AI
    const extractedData = await extractProjectData(text);

    return NextResponse.json({
      success: true,
      extractedText: text.substring(0, 2000), // Preview of extracted text
      extractedFields: extractedData,
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
