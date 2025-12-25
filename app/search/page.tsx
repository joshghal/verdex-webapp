'use client';

import { useState } from 'react';

interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    clauseType?: string;
    documentType?: string;
    source?: string;
  };
}

const QUICK_SEARCHES = [
  'margin ratchet sustainability',
  'KPI definition climate',
  'reporting covenant annual',
  'verification external assurance',
  'DFI participation clause',
  'use of proceeds transition',
  'conditions precedent green loan',
];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedClause, setSelectedClause] = useState<SearchResult | null>(null);

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, limit: 10 }),
      });

      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Search LMA Clauses</h1>
          <p className="text-gray-600">
            Find relevant clause templates from LMA documentation for your transition loan
          </p>
        </div>

        {/* Search Input */}
        <div className="card mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              className="input flex-1"
              placeholder="Search for clauses (e.g., 'margin ratchet sustainability', 'KPI definition')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="btn-primary px-8"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick Search Tags */}
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Quick searches:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_SEARCHES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickSearch(q)}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Results List */}
          <div className="space-y-4">
            {loading && (
              <div className="card text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Searching...</p>
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-gray-500">No results found. Try different keywords.</p>
              </div>
            )}

            {!loading && results.map((result, idx) => (
              <div
                key={result.id}
                className={`card cursor-pointer transition-all ${
                  selectedClause?.id === result.id
                    ? 'ring-2 ring-green-500 border-green-500'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedClause(result)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">#{idx + 1}</span>
                    {result.metadata.clauseType && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {result.metadata.clauseType.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-green-600 font-medium">
                    {(result.score * 100).toFixed(0)}% match
                  </span>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {result.content.substring(0, 200)}...
                </p>
                {result.metadata.source && (
                  <p className="text-xs text-gray-400 mt-2">
                    Source: {result.metadata.source}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Clause Preview */}
          <div className="lg:sticky lg:top-8">
            {selectedClause ? (
              <div className="card">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-gray-900">Clause Preview</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedClause.content);
                    }}
                    className="text-sm text-green-600 hover:text-green-700"
                  >
                    Copy to clipboard
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  {selectedClause.metadata.clauseType && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedClause.metadata.clauseType.replace(/_/g, ' ')}
                    </span>
                  )}
                  {selectedClause.metadata.documentType && (
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                      {selectedClause.metadata.documentType.replace(/_/g, ' ')}
                    </span>
                  )}
                </div>

                <pre className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-auto max-h-[500px]">
                  {selectedClause.content}
                </pre>

                {selectedClause.metadata.source && (
                  <p className="text-xs text-gray-500 mt-4">
                    Source: {selectedClause.metadata.source}
                  </p>
                )}
              </div>
            ) : (
              <div className="card bg-gray-50 text-center py-12">
                <p className="text-gray-500">
                  {searched
                    ? 'Click a result to preview the full clause'
                    : 'Search for clauses to get started'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
