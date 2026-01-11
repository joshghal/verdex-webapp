// Dedicated Greenwashing Detection API Handler
// Uses ASI1:mini with dedicated API key for greenwashing evaluation

const ASI1_API_URL = 'https://api.asi1.ai/v1/chat/completions';
const ASI1_MODEL = 'asi1-mini';

export interface GreenwashApiRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GreenwashApiResponse {
  success: boolean;
  content?: string;
  parsed?: any;
  duration: number;
  error?: string;
}

/**
 * Call ASI1:mini API for greenwashing evaluation
 * Uses dedicated API key (ASI1_API_KEY_GREENWASH)
 */
export async function callGreenwashApi(options: GreenwashApiRequestOptions): Promise<GreenwashApiResponse> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0, // Deterministic: temperature 0 for consistent results
    maxTokens = 2000
  } = options;

  const apiKey = process.env.ASI1_API_KEY_GREENWASH;

  if (!apiKey) {
    return {
      success: false,
      duration: 0,
      error: 'ASI1_API_KEY_GREENWASH not configured. Please set the dedicated greenwash API key in environment.'
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
      error: `Greenwash API request failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Evaluate a greenwashing component with AI
 */
export async function evaluateGreenwashComponent<T = any>(
  systemPrompt: string,
  documentText: string,
  projectData: Record<string, any>
): Promise<{ success: boolean; data?: T; error?: string; duration?: number }> {

  const userPrompt = `
## Document Content (for analysis):
${documentText.substring(0, 8000)}

## Project Data:
${JSON.stringify(projectData, null, 2)}

Evaluate this document for greenwashing risk and return your analysis as JSON.
`;

  const result = await callGreenwashApi({
    systemPrompt,
    userPrompt,
    maxTokens: 2000
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
    error: result.error || 'Failed to evaluate greenwashing component',
    duration: result.duration
  };
}
