// Dedicated LMA Evaluation API Handler
// Uses ASI1:mini with dedicated API key for LMA component evaluations

const ASI1_API_URL = 'https://api.asi1.ai/v1/chat/completions';
const ASI1_MODEL = 'asi1-mini';

export interface LMAApiRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LMAApiResponse {
  success: boolean;
  content?: string;
  parsed?: any;
  duration: number;
  error?: string;
}

/**
 * Call ASI1:mini API for LMA component evaluation
 * Uses dedicated API key (ASI1_API_KEY_LMA)
 */
export async function callLMAApi(options: LMAApiRequestOptions): Promise<LMAApiResponse> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0, // Deterministic: temperature 0 for consistent results
    maxTokens = 4000
  } = options;

  const apiKey = process.env.ASI1_API_KEY_LMA;

  if (!apiKey) {
    return {
      success: false,
      duration: 0,
      error: 'ASI1_API_KEY_LMA not configured. Please set the dedicated LMA API key in environment.'
    };
  }

  const start = Date.now();

  try {
    const response = await fetch(ASI1_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: ASI1_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature,
        max_tokens: maxTokens,
        seed: 42 // Fixed seed for deterministic/reproducible results
      })
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        duration,
        error: `ASI1 API error ${response.status}: ${errorText.substring(0, 200)}`
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        duration,
        error: 'ASI1 returned empty response'
      };
    }

    // Try to parse JSON from response
    let parsed: any = undefined;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        // JSON parsing failed, content is still available as raw text
      }
    }

    return {
      success: true,
      content,
      parsed,
      duration
    };

  } catch (error) {
    return {
      success: false,
      duration: Date.now() - start,
      error: `LMA API request failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Extract structured JSON for LMA component evaluation
 */
export async function evaluateLMAComponent<T = any>(
  systemPrompt: string,
  documentSection: string,
  extractedFields: Record<string, any>,
  projectContext: Record<string, any>
): Promise<{ success: boolean; data?: T; error?: string; duration?: number }> {

  const userPrompt = `
## Document Section (Relevant to this component):
${documentSection || 'No specific section found for this component.'}

## Extracted Fields:
${JSON.stringify(extractedFields, null, 2)}

## Project Context:
${JSON.stringify(projectContext, null, 2)}

Please evaluate this component and return your analysis as JSON.
`;

  const result = await callLMAApi({
    systemPrompt,
    userPrompt,
    maxTokens: 4000
  });

  if (result.success && result.parsed) {
    return {
      success: true,
      data: result.parsed as T,
      duration: result.duration
    };
  }

  return {
    success: false,
    error: result.error || 'Failed to evaluate component',
    duration: result.duration
  };
}
