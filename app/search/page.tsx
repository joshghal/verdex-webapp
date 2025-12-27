'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { formatClauseContent, getClausePreview } from '@/lib/clauseFormatter';

interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: {
    clauseType?: string;
    documentType?: string;
    source?: string;
    chunkIndex?: number;
    totalChunks?: number;
  };
}

interface SearchResponse {
  results: SearchResult[];
  totalFound: number;
  query: string;
  source: 'pinecone' | 'sample_templates';
  filters: {
    applied: any;
    available: {
      clauseTypes: string[];
      documentTypes: string[];
    };
  };
}

const QUICK_SEARCHES = [
  'margin ratchet sustainability',
  'KPI definition climate',
  'reporting covenant annual',
  'verification external assurance',
  'interest rate SOFR SONIA',
  'use of proceeds transition',
  'conditions precedent',
];

const CLAUSE_TYPE_LABELS: Record<string, string> = {
  interest: 'Interest & Rates',
  facility_terms: 'Facility Terms',
  events_of_default: 'Events of Default',
  security: 'Security',
  prepayment: 'Prepayment',
  margin_ratchet: 'Margin Ratchet',
  conditions_precedent: 'Conditions Precedent',
  representations: 'Representations',
  fees: 'Fees',
  verification: 'Verification',
  reporting_covenant: 'Reporting',
  kpi_definition: 'KPI Definition',
  spt_definition: 'SPT Definition',
  use_of_proceeds: 'Use of Proceeds',
  general: 'General',
};

type SearchMode = 'keyword' | 'clauseId';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedClause, setSelectedClause] = useState<SearchResult | null>(null);
  const [searchSource, setSearchSource] = useState<'pinecone' | 'sample_templates' | null>(null);
  const [indexStats, setIndexStats] = useState<{ totalVectors: number } | null>(null);
  const [selectedClauseType, setSelectedClauseType] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [initialSearchDone, setInitialSearchDone] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>('keyword');

  // Fetch index stats on mount
  useEffect(() => {
    fetch('/api/search')
      .then(res => res.json())
      .then(data => setIndexStats(data.indexStats))
      .catch(console.error);
  }, []);

  // Handle query parameter from URL (e.g., from results page)
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && !initialSearchDone) {
      setQuery(urlQuery);
      setInitialSearchDone(true);
      // Execute search after setting query
      performSearch(urlQuery);
    }
  }, [searchParams, initialSearchDone]);

  const performSearch = async (searchQuery: string, mode: SearchMode = searchMode) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);
    setSelectedClause(null);

    try {
      const filters: any = {};
      if (mode === 'keyword') {
        if (selectedClauseType) filters.clauseType = selectedClauseType;
        if (selectedDocType) filters.documentType = selectedDocType;
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery,
          limit: mode === 'clauseId' ? 1 : 15,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          searchMode: mode,
        }),
      });

      const data: SearchResponse = await response.json();
      setResults(data.results || []);
      setSearchSource(data.source);

      // Auto-select the clause if it's an ID search with results
      if (mode === 'clauseId' && data.results?.length > 0) {
        setSelectedClause(data.results[0]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    performSearch(q);
  };

  const handleQuickSearch = (q: string) => {
    setQuery(q);
    handleSearch(q);
  };

  const handleCopy = () => {
    if (selectedClause) {
      navigator.clipboard.writeText(selectedClause.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clearFilters = () => {
    setSelectedClauseType(null);
    setSelectedDocType(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-16 relative overflow-hidden">
      {/* Animated Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob blob-green w-[500px] h-[500px] -top-40 -right-40 opacity-30 animate-blob" />
        <div className="blob blob-teal w-[400px] h-[400px] bottom-20 -left-32 opacity-25 animate-blob-reverse" />
        <div className="blob blob-emerald w-[300px] h-[300px] top-1/2 right-1/4 opacity-20 animate-blob-slow" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
            <svg className="w-5 h-5 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-medium text-verdex-800">LMA Clause Database</span>
            {indexStats && indexStats.totalVectors > 0 && (
              <span className="text-xs bg-verdex-100 text-verdex-700 px-2 py-0.5 rounded-full ml-2">
                {indexStats.totalVectors} clauses indexed
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-medium text-gray-900 mb-4">Search Clauses</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            Search LMA templates, Paris Agreement, and SBTi Net-Zero standards for transition finance
          </p>
        </div>

        {/* Search Input */}
        <div className="glass-card rounded-3xl p-6 mb-6">
          {/* Search Mode Toggle */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-500">Search by:</span>
            <div className="inline-flex rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => setSearchMode('keyword')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  searchMode === 'keyword'
                    ? 'bg-white text-verdex-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Keyword
                </span>
              </button>
              <button
                onClick={() => setSearchMode('clauseId')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  searchMode === 'clauseId'
                    ? 'bg-white text-verdex-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  Clause ID
                </span>
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              className={`flex-1 px-5 py-4 bg-white/80 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-all ${searchMode === 'clauseId' ? 'font-mono' : ''}`}
              placeholder={searchMode === 'keyword'
                ? "Search for clauses (e.g., 'margin ratchet', 'SOFR interest calculation')"
                : "Enter clause ID (e.g., 'clause_abc123xyz')"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="bg-verdex-700 hover:bg-verdex-800 text-white font-semibold px-8 py-4 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Searching...' : searchMode === 'clauseId' ? 'Find' : 'Search'}
            </button>
          </div>

          {/* Filters - only show for keyword search */}
          {searchMode === 'keyword' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-sm text-gray-500">Filter by type:</span>
                {['margin_ratchet', 'interest', 'facility_terms', 'verification', 'reporting_covenant', 'conditions_precedent'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedClauseType(selectedClauseType === type ? null : type)}
                    className={`text-xs px-3 py-1.5 rounded-full transition-all ${
                      selectedClauseType === type
                        ? 'bg-verdex-600 text-white'
                        : 'bg-white/60 text-gray-600 hover:bg-verdex-50 hover:text-verdex-700 border border-gray-200'
                    }`}
                  >
                    {CLAUSE_TYPE_LABELS[type] || type.replace(/_/g, ' ')}
                  </button>
                ))}
                {(selectedClauseType || selectedDocType) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs px-3 py-1.5 text-gray-500 hover:text-gray-700"
                  >
                    Clear filters
                  </button>
                )}
              </div>

              {/* Quick Search Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Quick searches:</span>
                {QUICK_SEARCHES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleQuickSearch(q)}
                    className="text-xs px-3 py-1.5 bg-white/60 hover:bg-white text-gray-600 rounded-full transition-all border border-gray-200 hover:border-verdex-300 hover:text-verdex-700"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clause ID help text */}
          {searchMode === 'clauseId' && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-500">
                <span className="font-medium">Tip:</span> You can find clause IDs in exported PDF reports. Paste the full ID to view the complete clause text.
              </p>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Results List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Source indicator */}
            {searched && !loading && results.length > 0 && (
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-500">
                  {results.length} results found
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  searchSource === 'pinecone'
                    ? 'bg-verdex-100 text-verdex-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {searchSource === 'pinecone' ? 'Vector Search' : 'Sample Templates'}
                </span>
              </div>
            )}

            {loading && (
              <div className="glass-card rounded-2xl text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-verdex-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-500">Searching {indexStats?.totalVectors || 0} clauses...</p>
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <div className="glass-card rounded-2xl text-center py-12">
                <p className="text-gray-500">No results found. Try different keywords or remove filters.</p>
              </div>
            )}

            {!loading && results.map((result, idx) => (
              <div
                key={result.id}
                className={`glass-card rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                  selectedClause?.id === result.id
                    ? 'ring-2 ring-verdex-500 border-verdex-500 bg-white/90'
                    : 'hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-lg'
                }`}
                onClick={() => setSelectedClause(result)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium text-gray-400">#{idx + 1}</span>
                    {result.metadata.clauseType && (
                      <span className="text-xs bg-verdex-100 text-verdex-800 px-2 py-0.5 rounded-full">
                        {CLAUSE_TYPE_LABELS[result.metadata.clauseType] || result.metadata.clauseType.replace(/_/g, ' ')}
                      </span>
                    )}
                    {result.metadata.documentType && (
                      <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
                        {result.metadata.documentType.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-verdex-600 font-semibold">
                    {(result.score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-gray-700 text-sm line-clamp-3">
                  {getClausePreview(result.content, 180)}
                </p>
                {result.metadata.source && (
                  <p className="text-xs text-gray-400 mt-2 truncate">
                    {result.metadata.source}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Clause Preview */}
          <div className="lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
            {selectedClause ? (
              <div className="glass-card rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display font-medium text-gray-900">Clause Preview</h3>
                  <button
                    onClick={handleCopy}
                    className={`text-sm font-semibold transition-colors flex items-center gap-1 ${
                      copied ? 'text-verdex-600' : 'text-gray-500 hover:text-verdex-700'
                    }`}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Copied!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedClause.metadata.clauseType && (
                    <span className="text-xs bg-verdex-100 text-verdex-800 px-3 py-1.5 rounded-full font-medium">
                      {CLAUSE_TYPE_LABELS[selectedClause.metadata.clauseType] || selectedClause.metadata.clauseType.replace(/_/g, ' ')}
                    </span>
                  )}
                  {selectedClause.metadata.documentType && (
                    <span className="text-xs bg-teal-100 text-teal-800 px-3 py-1.5 rounded-full font-medium">
                      {selectedClause.metadata.documentType.replace(/_/g, ' ')}
                    </span>
                  )}
                  {selectedClause.metadata.chunkIndex !== undefined && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-full">
                      Section {selectedClause.metadata.chunkIndex + 1} of {selectedClause.metadata.totalChunks}
                    </span>
                  )}
                </div>

                <div className="bg-white/80 p-4 rounded-xl text-sm text-gray-700 whitespace-pre-wrap overflow-auto max-h-[500px] border border-gray-100 leading-relaxed">
                  {formatClauseContent(selectedClause.content)}
                </div>

                {/* Source & Clause ID */}
                <div className="mt-4 bg-gray-50 rounded-xl p-3 space-y-2">
                  {selectedClause.metadata.source && (
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">Source</span>
                      <span className="text-xs text-gray-700 break-words">{selectedClause.metadata.source}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-500 w-16 flex-shrink-0">Clause ID</span>
                    <span className="text-xs text-gray-700 font-mono truncate flex-1" title={selectedClause.id}>
                      {selectedClause.id.length > 35 ? `${selectedClause.id.substring(0, 35)}...` : selectedClause.id}
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedClause.id);
                        setCopiedId(true);
                        setTimeout(() => setCopiedId(false), 2000);
                      }}
                      className={`text-xs transition-colors flex items-center gap-1 flex-shrink-0 px-2 py-1 rounded-lg ${copiedId ? 'text-verdex-600 bg-verdex-50' : 'text-gray-400 hover:text-verdex-600 hover:bg-verdex-50'}`}
                      title="Copy clause ID"
                    >
                      {copiedId ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Copied
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card rounded-3xl text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">
                  {searched
                    ? 'Click a result to preview the full clause'
                    : 'Search for clauses to get started'}
                </p>
                <p className="text-sm text-gray-400">
                  {indexStats && indexStats.totalVectors > 0
                    ? `Searching ${indexStats.totalVectors} indexed clause segments`
                    : 'Loading index...'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
