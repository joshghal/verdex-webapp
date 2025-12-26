// Pinecone Client for RAG

import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!process.env.PINECONE_API_KEY) {
      throw new Error('PINECONE_API_KEY not set');
    }
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
  }
  return pineconeClient;
}

export function getIndex() {
  const client = getPineconeClient();
  // Use the new 384-dimension index for BGE embeddings
  const indexName = process.env.PINECONE_INDEX_384 || 'lma-clauses-384';
  return client.index(indexName);
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    source?: string;
    clauseType?: string;
    documentType?: string;
    country?: string;
    section?: string;
  };
}

export async function searchDocuments(
  queryEmbedding: number[],
  options: {
    topK?: number;
    filter?: Record<string, any>;
  } = {}
): Promise<SearchResult[]> {
  const { topK = 5, filter } = options;

  try {
    const index = getIndex();

    const queryOptions: any = {
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
    };

    if (filter) {
      queryOptions.filter = filter;
    }

    const result = await index.query(queryOptions);

    return (result.matches || []).map(match => ({
      id: match.id,
      score: match.score || 0,
      content: (match.metadata?.content as string) || '',
      metadata: {
        source: match.metadata?.source as string,
        clauseType: match.metadata?.clauseType as string,
        documentType: match.metadata?.documentType as string,
        country: match.metadata?.country as string,
        section: match.metadata?.section as string,
      },
    }));
  } catch (error) {
    console.error('Pinecone search error:', error);
    throw error;
  }
}

export async function upsertDocuments(
  documents: {
    id: string;
    embedding: number[];
    content: string;
    metadata: Record<string, any>;
  }[]
) {
  const index = getIndex();

  const vectors = documents.map(doc => ({
    id: doc.id,
    values: doc.embedding,
    metadata: {
      content: doc.content,
      ...doc.metadata,
    },
  }));

  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < vectors.length; i += batchSize) {
    const batch = vectors.slice(i, i + batchSize);
    await index.upsert(batch);
  }

  return vectors.length;
}

export async function getIndexStats() {
  try {
    const index = getIndex();
    const stats = await index.describeIndexStats();
    return stats;
  } catch (error) {
    console.error('Failed to get index stats:', error);
    return null;
  }
}
