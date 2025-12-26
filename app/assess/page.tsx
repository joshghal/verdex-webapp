'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const COUNTRIES = [
  { value: 'kenya', label: 'Kenya' },
  { value: 'nigeria', label: 'Nigeria' },
  { value: 'south_africa', label: 'South Africa' },
  { value: 'tanzania', label: 'Tanzania' },
  { value: 'ghana', label: 'Ghana' },
  { value: 'egypt', label: 'Egypt' },
  { value: 'morocco', label: 'Morocco' },
  { value: 'ethiopia', label: 'Ethiopia' },
  { value: 'senegal', label: 'Senegal' },
  { value: 'cote_divoire', label: "Côte d'Ivoire" },
  { value: 'zambia', label: 'Zambia' },
  { value: 'rwanda', label: 'Rwanda' },
];

const SECTORS = [
  { value: 'energy', label: 'Energy' },
  { value: 'renewable_energy', label: 'Renewable Energy' },
  { value: 'mining', label: 'Mining' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'transport', label: 'Transport' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'water', label: 'Water & Sanitation' },
];

interface ExtractedFields {
  projectName: string;
  country: string;
  sector: string;
  description: string;
  climateTargets: string;
  financingNeeded: number | null;
  transitionPlan: string;
  baselineEmissions: string;
  verificationStatus: string;
}

export default function AssessPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // PDF upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extractedPreview, setExtractedPreview] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    projectName: '',
    country: 'kenya',
    sector: 'energy',
    projectType: '',
    description: '',

    // Step 2: Financials
    totalCost: 0,
    debtAmount: 0,
    equityAmount: 0,

    // Step 3: Emissions
    currentScope1: 0,
    currentScope2: 0,
    currentScope3: 0,
    targetScope1: 0,
    targetScope2: 0,
    targetScope3: 0,
    targetYear: 2030,

    // Step 4: Strategy
    transitionStrategy: '',
    hasPublishedPlan: false,
    thirdPartyVerification: false,
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle PDF upload
  const handlePDFUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please upload a PDF file');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('pdf', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formDataUpload,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Pre-fill form with extracted data
      const fields: ExtractedFields = result.extractedFields;

      setFormData(prev => ({
        ...prev,
        projectName: fields.projectName || prev.projectName,
        country: matchCountry(fields.country) || prev.country,
        sector: matchSector(fields.sector) || prev.sector,
        description: fields.description || prev.description,
        transitionStrategy: fields.transitionPlan || prev.transitionStrategy,
        totalCost: fields.financingNeeded || prev.totalCost,
        hasPublishedPlan: !!fields.transitionPlan,
        thirdPartyVerification: !!fields.verificationStatus,
      }));

      setExtractedPreview(result.extractedText);
      setUploadSuccess(true);

    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setUploadLoading(false);
    }
  };

  // Match country string to dropdown value
  const matchCountry = (countryStr: string): string | null => {
    if (!countryStr) return null;
    const lower = countryStr.toLowerCase();
    const match = COUNTRIES.find(c =>
      c.label.toLowerCase().includes(lower) ||
      lower.includes(c.label.toLowerCase())
    );
    return match?.value || null;
  };

  // Match sector string to dropdown value
  const matchSector = (sectorStr: string): string | null => {
    if (!sectorStr) return null;
    const lower = sectorStr.toLowerCase();
    const match = SECTORS.find(s =>
      s.label.toLowerCase().includes(lower) ||
      lower.includes(s.label.toLowerCase())
    );
    return match?.value || null;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePDFUpload(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handlePDFUpload(file);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName: formData.projectName,
          country: formData.country,
          sector: formData.sector,
          projectType: formData.projectType,
          description: formData.description,
          totalCost: formData.totalCost,
          debtAmount: formData.debtAmount,
          equityAmount: formData.equityAmount,
          currentEmissions: {
            scope1: formData.currentScope1,
            scope2: formData.currentScope2,
            scope3: formData.currentScope3,
          },
          targetEmissions: {
            scope1: formData.targetScope1,
            scope2: formData.targetScope2,
            scope3: formData.targetScope3,
          },
          targetYear: formData.targetYear,
          transitionStrategy: formData.transitionStrategy,
          hasPublishedPlan: formData.hasPublishedPlan,
          thirdPartyVerification: formData.thirdPartyVerification,
        }),
      });

      if (!response.ok) {
        throw new Error('Assessment failed');
      }

      const result = await response.json();

      // Store result in sessionStorage and navigate to results
      sessionStorage.setItem('assessmentResult', JSON.stringify(result));
      router.push('/results');

    } catch (err) {
      setError('Failed to run assessment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Assessment</h1>
          <p className="text-gray-600">
            Upload a PDF or enter your project details manually for LMA compliance assessment
          </p>
        </div>

        {/* PDF Upload Section */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Start: Upload Project Document
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Upload a project proposal, transition plan, or sustainability report to auto-fill the form
          </p>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver
                ? 'border-green-500 bg-green-50'
                : uploadSuccess
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {uploadLoading ? (
              <div className="space-y-3">
                <div className="animate-spin w-10 h-10 border-3 border-green-600 border-t-transparent rounded-full mx-auto" />
                <p className="text-gray-600">Extracting information from PDF...</p>
                <p className="text-sm text-gray-500">This may take a few seconds</p>
              </div>
            ) : uploadSuccess ? (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-700 font-medium">PDF processed successfully!</p>
                <p className="text-sm text-gray-600">Form has been pre-filled with extracted data. Review and edit as needed.</p>
                <button
                  onClick={() => {
                    setUploadSuccess(false);
                    setExtractedPreview('');
                  }}
                  className="text-sm text-green-600 hover:text-green-700 underline"
                >
                  Upload another file
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-gray-600">
                  <span className="font-medium">Drop your PDF here</span> or{' '}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-green-600 hover:text-green-700 font-medium"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-sm text-gray-500">Supports: Project proposals, transition plans, ESG reports</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </div>
            )}
          </div>

          {uploadError && (
            <div className="mt-3 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {uploadError}
            </div>
          )}

          {extractedPreview && (
            <details className="mt-4">
              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                View extracted text preview
              </summary>
              <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 overflow-auto max-h-40">
                {extractedPreview}
              </pre>
            </details>
          )}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 border-t border-gray-200" />
          <span className="text-sm text-gray-500">or fill manually</span>
          <div className="flex-1 border-t border-gray-200" />
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                  step >= s ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s}
              </div>
              <span className={`ml-2 text-sm ${step >= s ? 'text-green-600' : 'text-gray-500'}`}>
                {s === 1 && 'Basic Info'}
                {s === 2 && 'Financials'}
                {s === 3 && 'Emissions'}
                {s === 4 && 'Strategy'}
              </span>
            </div>
          ))}
        </div>

        <div className="card">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Project Information</h2>

              <div>
                <label className="label">Project Name *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.projectName}
                  onChange={(e) => updateField('projectName', e.target.value)}
                  placeholder="e.g., Turkana Wind Power Phase 2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Country *</label>
                  <select
                    className="input"
                    value={formData.country}
                    onChange={(e) => updateField('country', e.target.value)}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Sector *</label>
                  <select
                    className="input"
                    value={formData.sector}
                    onChange={(e) => updateField('sector', e.target.value)}
                  >
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Project Type *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.projectType}
                  onChange={(e) => updateField('projectType', e.target.value)}
                  placeholder="e.g., Wind Farm, Solar PV, Coal-to-Gas Transition"
                />
              </div>

              <div>
                <label className="label">Project Description *</label>
                <textarea
                  className="input min-h-[100px]"
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="Describe the project, its objectives, and transition goals..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Financials */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Financial Details (USD)</h2>

              <div>
                <label className="label">Total Project Cost *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.totalCost || ''}
                  onChange={(e) => updateField('totalCost', Number(e.target.value))}
                  placeholder="e.g., 150000000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.totalCost > 0 && `$${(formData.totalCost / 1_000_000).toFixed(1)}M`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Debt Amount *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.debtAmount || ''}
                    onChange={(e) => updateField('debtAmount', Number(e.target.value))}
                    placeholder="e.g., 120000000"
                  />
                </div>
                <div>
                  <label className="label">Equity Amount *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.equityAmount || ''}
                    onChange={(e) => updateField('equityAmount', Number(e.target.value))}
                    placeholder="e.g., 30000000"
                  />
                </div>
              </div>

              {formData.totalCost > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Debt/Equity Ratio: {((formData.debtAmount / formData.totalCost) * 100).toFixed(0)}% / {((formData.equityAmount / formData.totalCost) * 100).toFixed(0)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Emissions */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Emissions Data (tCO2e/year)</h2>

              <div>
                <h3 className="font-medium text-gray-800 mb-3">Current Baseline Emissions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Scope 1 *</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.currentScope1 || ''}
                      onChange={(e) => updateField('currentScope1', Number(e.target.value))}
                      placeholder="Direct emissions"
                    />
                  </div>
                  <div>
                    <label className="label">Scope 2 *</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.currentScope2 || ''}
                      onChange={(e) => updateField('currentScope2', Number(e.target.value))}
                      placeholder="Electricity"
                    />
                  </div>
                  <div>
                    <label className="label">Scope 3</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.currentScope3 || ''}
                      onChange={(e) => updateField('currentScope3', Number(e.target.value))}
                      placeholder="Value chain"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-3">Target Emissions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Scope 1 Target *</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.targetScope1 || ''}
                      onChange={(e) => updateField('targetScope1', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label">Scope 2 Target *</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.targetScope2 || ''}
                      onChange={(e) => updateField('targetScope2', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="label">Scope 3 Target</label>
                    <input
                      type="number"
                      className="input"
                      value={formData.targetScope3 || ''}
                      onChange={(e) => updateField('targetScope3', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Target Year *</label>
                <select
                  className="input w-48"
                  value={formData.targetYear}
                  onChange={(e) => updateField('targetYear', Number(e.target.value))}
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030, 2035, 2040, 2050].map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {formData.currentScope1 > 0 && formData.targetScope1 > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-800">
                    Projected Reduction: {(((formData.currentScope1 + formData.currentScope2) - (formData.targetScope1 + formData.targetScope2)) / (formData.currentScope1 + formData.currentScope2) * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Strategy */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Transition Strategy</h2>

              <div>
                <label className="label">Transition Strategy Description *</label>
                <textarea
                  className="input min-h-[150px]"
                  value={formData.transitionStrategy}
                  onChange={(e) => updateField('transitionStrategy', e.target.value)}
                  placeholder="Describe your decarbonization pathway, key milestones, technologies to be deployed, and alignment with science-based targets..."
                />
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-green-600 rounded"
                    checked={formData.hasPublishedPlan}
                    onChange={(e) => updateField('hasPublishedPlan', e.target.checked)}
                  />
                  <span className="text-gray-700">
                    Entity has a published transition plan or climate strategy
                  </span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="w-5 h-5 text-green-600 rounded"
                    checked={formData.thirdPartyVerification}
                    onChange={(e) => updateField('thirdPartyVerification', e.target.checked)}
                  />
                  <span className="text-gray-700">
                    Targets verified by third party (SBTi, auditor, or similar)
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 1}
              className={`btn-secondary ${step === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Previous
            </button>

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="btn-primary"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary min-w-[150px]"
              >
                {loading ? 'Analyzing...' : 'Run Assessment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
