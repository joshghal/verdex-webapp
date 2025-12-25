'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface AssessmentResult {
  projectName: string;
  country: string;
  countryName: string;
  sector: string;
  eligibilityStatus: 'eligible' | 'partial' | 'ineligible';
  overallScore: number;
  lmaComponents: {
    name: string;
    score: number;
    maxScore: number;
    feedback: string[];
  }[];
  greenwashingRisk: {
    level: string;
    score: number;
    redFlags: { description: string; recommendation: string; severity: string }[];
    positiveIndicators: string[];
    recommendations: string[];
  };
  dfiMatches: {
    id: string;
    name: string;
    fullName: string;
    matchScore: number;
    matchReasons: string[];
    concerns: string[];
    recommendedRole: string;
    estimatedSize?: { min: number; max: number };
    climateTarget?: string;
    specialPrograms?: string[];
  }[];
  blendedStructure: any;
  countryInfo: any;
  nextSteps: string[];
  assessmentDate: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('assessmentResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push('/assess');
    }
  }, [router]);

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statusColors = {
    eligible: 'bg-green-100 text-green-800 border-green-200',
    partial: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ineligible: 'bg-red-100 text-red-800 border-red-200',
  };

  const statusLabels = {
    eligible: 'Eligible for Transition Loan',
    partial: 'Partially Eligible - Gaps Identified',
    ineligible: 'Not Yet Eligible - Improvements Needed',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{result.projectName}</h1>
            <p className="text-gray-600">
              {result.countryName} | {result.sector.charAt(0).toUpperCase() + result.sector.slice(1)} Sector
            </p>
          </div>
          <Link href="/assess" className="btn-secondary">
            New Assessment
          </Link>
        </div>

        {/* Overall Status */}
        <div className={`card mb-6 border-2 ${statusColors[result.eligibilityStatus]}`}>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm font-medium opacity-80">Eligibility Status</p>
              <p className="text-2xl font-bold">{statusLabels[result.eligibilityStatus]}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium opacity-80">LMA Score</p>
              <p className="text-4xl font-bold">{result.overallScore}/100</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - LMA Components */}
          <div className="lg:col-span-2 space-y-6">
            {/* LMA Component Scores */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">LMA Component Scores</h2>
              <div className="space-y-4">
                {result.lmaComponents.map((component, idx) => (
                  <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-gray-900">{component.name}</span>
                      <span className={`font-semibold ${component.score / component.maxScore >= 0.7 ? 'text-green-600' : component.score / component.maxScore >= 0.5 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {component.score}/{component.maxScore}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full ${component.score / component.maxScore >= 0.7 ? 'bg-green-500' : component.score / component.maxScore >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${(component.score / component.maxScore) * 100}%` }}
                      />
                    </div>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {component.feedback.map((fb, i) => (
                        <li key={i} className={fb.startsWith('Missing') ? 'text-red-600' : ''}>
                          {fb.startsWith('Missing') ? '⚠️ ' : '✓ '}{fb}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Greenwashing Risk */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">Greenwashing Risk Assessment</h2>
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  result.greenwashingRisk.level === 'low' ? 'risk-low' :
                  result.greenwashingRisk.level === 'medium' ? 'risk-medium' : 'risk-high'
                }`}>
                  {result.greenwashingRisk.level.toUpperCase()} RISK
                </span>
                <span className="text-gray-600">Score: {result.greenwashingRisk.score}/100</span>
              </div>

              {result.greenwashingRisk.redFlags.length > 0 && (
                <div className="mb-4">
                  <h3 className="font-medium text-red-700 mb-2">Red Flags</h3>
                  <ul className="space-y-2">
                    {result.greenwashingRisk.redFlags.map((flag, i) => (
                      <li key={i} className="bg-red-50 p-3 rounded-lg">
                        <p className="text-red-800 font-medium">{flag.description}</p>
                        <p className="text-red-600 text-sm mt-1">{flag.recommendation}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.greenwashingRisk.positiveIndicators.length > 0 && (
                <div>
                  <h3 className="font-medium text-green-700 mb-2">Positive Indicators</h3>
                  <ul className="space-y-1">
                    {result.greenwashingRisk.positiveIndicators.map((indicator, i) => (
                      <li key={i} className="text-green-700 text-sm">✓ {indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* DFI Matches */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4">DFI Matches</h2>
              <div className="space-y-4">
                {result.dfiMatches.map((dfi, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{dfi.name}</h3>
                        <p className="text-sm text-gray-500">{dfi.fullName}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold text-green-600">{dfi.matchScore}%</span>
                        <p className="text-xs text-gray-500">match</p>
                      </div>
                    </div>

                    <div className="mb-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Recommended: {dfi.recommendedRole.replace('_', ' ')}
                      </span>
                      {dfi.estimatedSize && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded ml-2">
                          ${(dfi.estimatedSize.min / 1_000_000).toFixed(0)}M - ${(dfi.estimatedSize.max / 1_000_000).toFixed(0)}M
                        </span>
                      )}
                    </div>

                    <div className="text-sm text-gray-600">
                      <p className="mb-1"><strong>Why:</strong> {dfi.matchReasons.join(', ')}</p>
                      {dfi.climateTarget && (
                        <p className="text-green-600">Climate: {dfi.climateTarget}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Next Steps */}
            <div className="card bg-green-50 border-green-200">
              <h2 className="text-lg font-semibold text-green-900 mb-3">Next Steps</h2>
              <ol className="space-y-2">
                {result.nextSteps.map((step, i) => (
                  <li key={i} className="text-green-800 text-sm flex gap-2">
                    <span className="font-bold">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Country Info */}
            {result.countryInfo && (
              <div className="card">
                <h2 className="text-lg font-semibold mb-3">Country Context</h2>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Region</dt>
                    <dd className="font-medium">{result.countryInfo.region.replace('_', ' ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Legal System</dt>
                    <dd className="font-medium">{result.countryInfo.legalSystem.replace('_', ' ')}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Currency</dt>
                    <dd className="font-medium">{result.countryInfo.currency}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Sovereign Rating</dt>
                    <dd className="font-medium">{result.countryInfo.sovereignRating || 'N/A'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Political Risk</dt>
                    <dd className={`font-medium ${
                      result.countryInfo.politicalRisk === 'low' ? 'text-green-600' :
                      result.countryInfo.politicalRisk === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {result.countryInfo.politicalRisk}
                    </dd>
                  </div>
                  {result.countryInfo.ndcTarget && (
                    <div className="pt-2 border-t">
                      <dt className="text-gray-500 mb-1">NDC Target</dt>
                      <dd className="text-xs">{result.countryInfo.ndcTarget}</dd>
                    </div>
                  )}
                </dl>
              </div>
            )}

            {/* Assessment Info */}
            <div className="card bg-gray-50">
              <h2 className="text-lg font-semibold mb-3">Assessment Info</h2>
              <p className="text-sm text-gray-600">
                Generated: {new Date(result.assessmentDate).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This assessment is based on LMA Transition Loan Principles and does not constitute financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
