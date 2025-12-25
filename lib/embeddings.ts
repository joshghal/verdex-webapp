// Local Embeddings using @xenova/transformers
// This runs embedding models directly in Node.js without external API calls

let pipeline: any = null;
let modelLoaded = false;

const MODEL_NAME = 'Xenova/bge-small-en-v1.5';

async function loadModel() {
  if (modelLoaded) return;

  try {
    // Dynamic import to avoid issues with Next.js
    const { pipeline: transformersPipeline } = await import('@xenova/transformers');
    pipeline = await transformersPipeline('feature-extraction', MODEL_NAME);
    modelLoaded = true;
    console.log('Embedding model loaded:', MODEL_NAME);
  } catch (error) {
    console.error('Failed to load embedding model:', error);
    throw error;
  }
}

export async function generateEmbedding(text: string): Promise<number[]> {
  await loadModel();

  if (!pipeline) {
    throw new Error('Embedding model not loaded');
  }

  // Generate embedding
  const output = await pipeline(text, { pooling: 'mean', normalize: true });

  // Convert to array
  const embedding = Array.from(output.data) as number[];

  return embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

// Simple text-based similarity for fallback when Pinecone is empty
export function simpleTextSearch(
  query: string,
  documents: { id: string; content: string; metadata: any }[],
  topK: number = 5
): { id: string; score: number; content: string; metadata: any }[] {
  const queryTerms = query.toLowerCase().split(/\s+/);

  const scored = documents.map(doc => {
    const contentLower = doc.content.toLowerCase();
    let score = 0;

    for (const term of queryTerms) {
      if (contentLower.includes(term)) {
        score += 1;
        // Boost for exact phrase match
        if (contentLower.includes(query.toLowerCase())) {
          score += 2;
        }
      }
    }

    // Normalize by query length
    score = score / queryTerms.length;

    return { ...doc, score };
  });

  return scored
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
