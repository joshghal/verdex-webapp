// Robust AI API Handler with Multi-Tier Fallback
// Primary: Groq (Maverick) → Secondary Groq → ASI1 Mini

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const ASI1_API_URL = 'https://api.asi1.ai/v1/chat/completions';

const GROQ_MODEL = 'meta-llama/llama-4-maverick-17b-128e-instruct';
const ASI1_MODEL = 'asi1-mini';

export interface AIRequestOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

export interface AIResponse {
  success: boolean;
  content?: string;
  parsed?: any;
  provider: 'groq_primary' | 'groq_secondary' | 'asi1' | 'none';
  model: string;
  duration: number;
  error?: string;
  fallbackUsed: boolean;
}

interface ProviderConfig {
  name: 'groq_primary' | 'groq_secondary' | 'asi1';
  url: string;
  apiKey: string | undefined;
  model: string;
}

export async function callAI(options: AIRequestOptions): Promise<AIResponse> {
  const {
    systemPrompt,
    userPrompt,
    temperature = 0.1,
    maxTokens = 2000,
    jsonMode = true
  } = options;

  const providers = getProviderChain();

  if (providers.length === 0) {
    return {
      success: false,
      provider: 'none',
      model: 'none',
      duration: 0,
      error: 'No API keys configured. Set GROQ_API_KEY in environment.',
      fallbackUsed: false
    };
  }

  let lastError = '';
  let fallbackUsed = false;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const isFirstAttempt = i === 0;

    if (!isFirstAttempt) {
      fallbackUsed = true;
      console.log(`[AI Handler] Falling back to ${provider.name}...`);
    }

    const result = await callProvider(provider, {
      systemPrompt,
      userPrompt,
      temperature,
      maxTokens
    });

    if (result.success) {
      let parsed: any = undefined;
      if (jsonMode && result.content) {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[0]);
          } catch (e) {
            // JSON parsing failed, but we still have content
          }
        }
      }

      return {
        success: true,
        content: result.content,
        parsed,
        provider: provider.name,
        model: provider.model,
        duration: result.duration,
        fallbackUsed
      };
    }

    lastError = result.error || 'Unknown error';

    if (shouldFallback(result.statusCode, result.error)) {
      continue;
    } else {
      break;
    }
  }

  return {
    success: false,
    provider: 'none',
    model: 'none',
    duration: 0,
    error: lastError,
    fallbackUsed
  };
}

function getProviderChain(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  const groqPrimary = process.env.GROQ_API_KEY;
  if (groqPrimary) {
    providers.push({
      name: 'groq_primary',
      url: GROQ_API_URL,
      apiKey: groqPrimary,
      model: GROQ_MODEL
    });
  }

  const groqSecondary = process.env.GROQ_API_KEY_SECONDARY;
  if (groqSecondary && groqSecondary !== groqPrimary) {
    providers.push({
      name: 'groq_secondary',
      url: GROQ_API_URL,
      apiKey: groqSecondary,
      model: GROQ_MODEL
    });
  }

  const asi1Key = process.env.ASI1_API_KEY;
  if (asi1Key) {
    providers.push({
      name: 'asi1',
      url: ASI1_API_URL,
      apiKey: asi1Key,
      model: ASI1_MODEL
    });
  }

  return providers;
}

async function callProvider(
  provider: ProviderConfig,
  options: {
    systemPrompt: string;
    userPrompt: string;
    temperature: number;
    maxTokens: number;
  }
): Promise<{
  success: boolean;
  content?: string;
  duration: number;
  statusCode?: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ],
        temperature: options.temperature,
        max_tokens: options.maxTokens
      })
    });

    const duration = Date.now() - start;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        duration,
        statusCode: response.status,
        error: `${provider.name} API error ${response.status}: ${errorText.substring(0, 200)}`
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        duration,
        error: `${provider.name} returned empty response`
      };
    }

    return {
      success: true,
      content,
      duration
    };

  } catch (error) {
    return {
      success: false,
      duration: Date.now() - start,
      error: `${provider.name} request failed: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

function shouldFallback(statusCode?: number, error?: string): boolean {
  if (statusCode === 429) return true;
  if (statusCode && statusCode >= 500) return true;
  if (error?.includes('timeout') || error?.includes('ECONNREFUSED')) return true;
  if (statusCode === 503) return true;
  if (statusCode === 400 || statusCode === 401 || statusCode === 403) return false;
  return true;
}

export async function extractJSON<T = any>(
  systemPrompt: string,
  document: string
): Promise<{ success: boolean; data?: T; error?: string; provider?: string }> {
  const result = await callAI({
    systemPrompt,
    userPrompt: document,
    jsonMode: true
  });

  if (result.success && result.parsed) {
    return {
      success: true,
      data: result.parsed as T,
      provider: result.provider
    };
  }

  return {
    success: false,
    error: result.error || 'Failed to extract JSON'
  };
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string
): Promise<{ success: boolean; text?: string; error?: string; provider?: string }> {
  const result = await callAI({
    systemPrompt,
    userPrompt,
    jsonMode: false
  });

  if (result.success && result.content) {
    return {
      success: true,
      text: result.content,
      provider: result.provider
    };
  }

  return {
    success: false,
    error: result.error || 'Failed to generate text'
  };
}
