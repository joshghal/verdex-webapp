'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';

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
  { value: 'drc', label: 'DRC (Congo)' },
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
  projectType: string;
  description: string;
  climateTargets: string;
  financingNeeded: number | null;
  debtAmount: number | null;
  equityAmount: number | null;
  transitionPlan: string;
  baselineEmissions: string;
  currentScope1: number | null;
  currentScope2: number | null;
  currentScope3: number | null;
  targetScope1: number | null;
  targetScope2: number | null;
  targetScope3: number | null;
  // NEW: Total emissions fields (captures all sources, not just Scope 1/2/3)
  totalBaselineEmissions: number | null;
  totalTargetEmissions: number | null;
  statedReductionPercent: number | null;
  targetYear: number | null;
  verificationStatus: string;
}

export default function AssessPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Mode selection: null = choosing, 'upload' = PDF upload, 'form' = manual form
  const [mode, setMode] = useState<'upload' | 'form' | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // PDF upload state
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [formData, setFormData] = useState({
    projectName: '',
    country: 'kenya',
    sector: 'energy',
    projectType: '',
    description: '',
    totalCost: 0,
    debtAmount: 0,
    equityAmount: 0,
    currentScope1: 0,
    currentScope2: 0,
    currentScope3: 0,
    targetScope1: 0,
    targetScope2: 0,
    targetScope3: 0,
    targetYear: 2030,
    transitionStrategy: '',
    hasPublishedPlan: false,
    thirdPartyVerification: false,
  });

  // GSAP animations
  useEffect(() => {
    if (pageRef.current) {
      gsap.fromTo(
        pageRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );
    }
  }, []);

  useEffect(() => {
    if (cardsRef.current && mode === null) {
      const cards = cardsRef.current.querySelectorAll('.choice-card');
      gsap.fromTo(
        cards,
        { opacity: 0, y: 30, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.2)' }
      );
    }
  }, [mode]);

  useEffect(() => {
    if (mode === 'form') {
      gsap.fromTo(
        '.form-container',
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }
      );
    }
    if (mode === 'upload') {
      gsap.fromTo(
        '.upload-container',
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'power2.out' }
      );
    }
  }, [mode]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const matchCountry = (countryStr: string): string | null => {
    if (!countryStr) return null;
    const lower = countryStr.toLowerCase();
    const match = COUNTRIES.find(c =>
      c.label.toLowerCase().includes(lower) ||
      lower.includes(c.label.toLowerCase()) ||
      lower.includes('drc') || lower.includes('congo')
    );
    return match?.value || null;
  };

  const matchSector = (sectorStr: string): string | null => {
    if (!sectorStr) return null;
    const lower = sectorStr.toLowerCase();
    const match = SECTORS.find(s =>
      s.label.toLowerCase().includes(lower) ||
      lower.includes(s.label.toLowerCase())
    );
    return match?.value || null;
  };

  // Handle PDF upload and go directly to results
  const handlePDFUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setUploadError('Please upload a PDF file');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadProgress('Extracting text from PDF...');

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('pdf', file);

      const uploadResponse = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formDataUpload,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || 'Upload failed');
      }

      setUploadProgress('Analyzing project data...');

      const fields: ExtractedFields = uploadResult.extractedFields;
      const rawDocumentText = uploadResult.rawDocumentText || '';

      // Build assessment request from extracted data
      const assessmentData = {
        projectName: fields.projectName || 'Unnamed Project',
        country: matchCountry(fields.country) || 'kenya',
        sector: matchSector(fields.sector) || 'energy',
        projectType: fields.projectType || '',
        description: fields.description || '',
        totalCost: fields.financingNeeded || 0,
        debtAmount: fields.debtAmount || 0,
        equityAmount: fields.equityAmount || 0,
        currentEmissions: {
          scope1: fields.currentScope1 || 0,
          scope2: fields.currentScope2 || 0,
          scope3: fields.currentScope3 || 0,
        },
        targetEmissions: {
          scope1: fields.targetScope1 || 0,
          scope2: fields.targetScope2 || 0,
          scope3: fields.targetScope3 || 0,
        },
        // NEW: Pass total emissions for accurate scoring (captures Water Treatment, Solar, etc.)
        totalBaselineEmissions: fields.totalBaselineEmissions || undefined,
        totalTargetEmissions: fields.totalTargetEmissions || undefined,
        statedReductionPercent: fields.statedReductionPercent || undefined,
        targetYear: fields.targetYear || 2030,
        transitionStrategy: fields.transitionPlan || '',
        hasPublishedPlan: !!fields.transitionPlan,
        thirdPartyVerification: !!fields.verificationStatus,
        rawDocumentText: rawDocumentText,
      };

      setUploadProgress('Running LMA assessment...');

      // Run assessment
      const assessResponse = await fetch('/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData),
      });

      if (!assessResponse.ok) {
        throw new Error('Assessment failed');
      }

      const result = await assessResponse.json();

      setUploadProgress('Complete! Redirecting...');

      // Store result and navigate to results
      sessionStorage.setItem('assessmentResult', JSON.stringify(result));

      // Animate out then navigate
      gsap.to('.upload-container', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => router.push('/results'),
      });

    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process PDF');
      setUploadProgress('');
    } finally {
      setUploadLoading(false);
    }
  };

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

  const handleFormSubmit = async () => {
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
          rawDocumentText: '',
        }),
      });

      if (!response.ok) {
        throw new Error('Assessment failed');
      }

      const result = await response.json();

      sessionStorage.setItem('assessmentResult', JSON.stringify(result));

      gsap.to('.form-container', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        onComplete: () => router.push('/results'),
      });

    } catch (err) {
      setError('Failed to run assessment. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mode selection screen
  if (mode === null) {
    return (
      <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-16 relative overflow-hidden">
        {/* Animated Blobs Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="blob blob-green w-[500px] h-[500px] -top-20 -left-40 opacity-40 animate-blob" />
          <div className="blob blob-teal w-[400px] h-[400px] top-1/3 -right-32 opacity-30 animate-blob-reverse" />
          <div className="blob blob-emerald w-[300px] h-[300px] bottom-20 left-1/4 opacity-25 animate-blob-slow" />
        </div>

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
              <svg className="w-5 h-5 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-verdex-800">LMA Compliant Assessment</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-medium text-gray-900 mb-4">Project Assessment</h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
              Evaluate your transition project against LMA Transition Loan Principles
            </p>
          </div>

          <div ref={cardsRef} className="grid md:grid-cols-2 gap-8">
            {/* Upload Option */}
            <button
              onClick={() => setMode('upload')}
              className="choice-card group glass-card rounded-3xl p-8 hover:bg-white/90 transition-all duration-300 text-left border-2 border-transparent hover:border-verdex-400 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-verdex-500 to-verdex-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-medium text-gray-900 mb-3">Upload Document</h2>
              <p className="text-gray-600 mb-4">
                Upload a project proposal, transition plan, or sustainability report. Our AI will extract the data and assess it automatically.
              </p>
              <div className="flex items-center text-verdex-600 font-semibold">
                <span>Quick & Automated</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>

            {/* Manual Form Option */}
            <button
              onClick={() => setMode('form')}
              className="choice-card group glass-card rounded-3xl p-8 hover:bg-white/90 transition-all duration-300 text-left border-2 border-transparent hover:border-navy-400 hover:shadow-xl hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-navy-500 to-navy-700 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-display font-medium text-gray-900 mb-3">Fill Form Manually</h2>
              <p className="text-gray-600 mb-4">
                Enter your project details step by step. Best for projects without existing documentation or for maximum control.
              </p>
              <div className="flex items-center text-navy-600 font-semibold">
                <span>Detailed & Precise</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Upload mode
  if (mode === 'upload') {
    return (
      <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-16 relative overflow-hidden">
        {/* Animated Blobs Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="blob blob-green w-[400px] h-[400px] -top-20 -right-32 opacity-30 animate-blob" />
          <div className="blob blob-teal w-[300px] h-[300px] bottom-20 -left-20 opacity-25 animate-blob-reverse" />
        </div>

        <div className="max-w-2xl mx-auto px-4 relative z-10">
          <button
            onClick={() => setMode(null)}
            className="flex items-center text-gray-600 hover:text-verdex-700 mb-8 transition-colors font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to options
          </button>

          <div className="upload-container">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-4 mt-[60px]">Upload Project Document</h1>
              <p className="text-gray-600">
                Drop your PDF and we'll analyze it instantly
              </p>
            </div>

            <div
              className={`glass-card rounded-3xl p-12 border-3 border-dashed transition-all duration-300 ${
                dragOver
                  ? 'border-verdex-500 bg-verdex-50/80 scale-[1.02]'
                  : uploadLoading
                    ? 'border-verdex-400 bg-verdex-50/60'
                    : 'border-gray-300 hover:border-verdex-500'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {uploadLoading ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto relative">
                    <div className="absolute inset-0 border-4 border-verdex-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-verdex-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{uploadProgress}</p>
                  <p className="text-sm text-gray-500">This may take a few moments...</p>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xl font-medium text-gray-900 mb-1">
                      Drop your PDF here
                    </p>
                    <p className="text-gray-500 mb-4">or</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-verdex-700 hover:bg-verdex-800 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                    >
                      Browse Files
                    </button>
                  </div>
                  <p className="text-sm text-gray-400">
                    Supports: Project proposals, transition plans, ESG reports
                  </p>
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
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3">
                <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{uploadError}</span>
              </div>
            )}

            {/* Example Documents Banner - Minimal */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-3">
                No document? Try with examples:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <a
                  href="/samples/realistic/ethiopia-coffee.pdf"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  Eligible
                </a>
                <a
                  href="/samples/not-eligible/southafrica-coal.pdf"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                  Ineligible
                </a>
                <a
                  href="/samples/unrealistic/nigeria-greenwashing.pdf"
                  download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-full transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                  Greenwashing
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form mode
  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-16 relative overflow-hidden">
      {/* Animated Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob blob-green w-[400px] h-[400px] -top-32 -left-32 opacity-25 animate-blob" />
        <div className="blob blob-teal w-[350px] h-[350px] top-1/2 -right-24 opacity-20 animate-blob-reverse" />
        <div className="blob blob-emerald w-[250px] h-[250px] bottom-0 left-1/3 opacity-20 animate-blob-slow" />
      </div>

      <div className="max-w-3xl mx-auto px-4 relative z-10">
        <button
          onClick={() => setMode(null)}
          className="flex items-center text-gray-600 hover:text-verdex-700 mb-8 transition-colors font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to options
        </button>

        <div className="form-container">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-2">Project Details</h1>
            <p className="text-gray-600">
              Fill in your project information for LMA compliance assessment
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    step >= s ? 'bg-verdex-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    s
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${step >= s ? 'text-verdex-600' : 'text-gray-400'}`}>
                  {s === 1 && 'Basic Info'}
                  {s === 2 && 'Financials'}
                  {s === 3 && 'Emissions'}
                  {s === 4 && 'Strategy'}
                </span>
              </div>
            ))}
          </div>

          <div className="glass-card rounded-3xl p-8">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Project Information</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Name *</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                    value={formData.projectName}
                    onChange={(e) => updateField('projectName', e.target.value)}
                    placeholder="e.g., Turkana Wind Power Phase 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                    <select
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%236b7280%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M8%2011L3%206h10l-5%205z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
                      value={formData.country}
                      onChange={(e) => updateField('country', e.target.value)}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sector *</label>
                    <select
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%236b7280%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M8%2011L3%206h10l-5%205z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Type</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                    value={formData.projectType}
                    onChange={(e) => updateField('projectType', e.target.value)}
                    placeholder="e.g., Wind Farm, Solar PV, Coal-to-Gas Transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Project Description *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="Describe the project, its objectives, and transition goals..."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Financials */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Details (USD)</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Total Project Cost *</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                    value={formData.totalCost || ''}
                    onChange={(e) => updateField('totalCost', Number(e.target.value))}
                    placeholder="e.g., 150000000"
                  />
                  {formData.totalCost > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      ${(formData.totalCost / 1_000_000).toFixed(1)}M
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Debt Amount</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                      value={formData.debtAmount || ''}
                      onChange={(e) => updateField('debtAmount', Number(e.target.value))}
                      placeholder="e.g., 120000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Equity Amount</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                      value={formData.equityAmount || ''}
                      onChange={(e) => updateField('equityAmount', Number(e.target.value))}
                      placeholder="e.g., 30000000"
                    />
                  </div>
                </div>

                {formData.totalCost > 0 && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-gray-700">
                      Debt/Equity Ratio: {((formData.debtAmount / formData.totalCost) * 100).toFixed(0)}% / {((formData.equityAmount / formData.totalCost) * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Emissions */}
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Emissions Data (tCO2e/year)</h2>

                {/* Guidance Box */}
                <div className="bg-verdex-50 border border-verdex-200 rounded-2xl p-5 text-sm space-y-4">
                  {/* Scope Definitions */}
                  <div>
                    <p className="font-semibold text-verdex-900 mb-3">What are emission scopes?</p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-white/60 rounded-xl p-3">
                        <p className="font-medium text-verdex-800 mb-1">Scope 1</p>
                        <p className="text-verdex-700 text-xs">Direct emissions (fuel, vehicles)</p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3">
                        <p className="font-medium text-verdex-800 mb-1">Scope 2</p>
                        <p className="text-verdex-700 text-xs">Purchased electricity, heat, steam</p>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3">
                        <p className="font-medium text-verdex-800 mb-1">Scope 3</p>
                        <p className="text-verdex-700 text-xs">Value chain emissions (optional)</p>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-verdex-200"></div>

                  {/* Example Case */}
                  <div>
                    <p className="font-semibold text-verdex-900 mb-1">Example: 30MW Coal-to-Gas Transition</p>
                    <p className="text-xs text-verdex-600 mb-3">Typical ~50% emissions reduction</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-verdex-700">
                            <th className="text-left font-medium py-2 pr-4"></th>
                            <th className="text-right font-medium py-2 px-3 bg-verdex-100 rounded-l-lg">Baseline</th>
                            <th className="text-right font-medium py-2 px-3 bg-white/80 rounded-r-lg">Target</th>
                          </tr>
                        </thead>
                        <tbody className="text-verdex-800">
                          <tr>
                            <td className="py-1.5 pr-4 font-medium">Scope 1</td>
                            <td className="text-right py-1.5 px-3 bg-verdex-100/50">150,000</td>
                            <td className="text-right py-1.5 px-3 bg-white/50">75,000</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 pr-4 font-medium">Scope 2</td>
                            <td className="text-right py-1.5 px-3 bg-verdex-100/50">25,000</td>
                            <td className="text-right py-1.5 px-3 bg-white/50">10,000</td>
                          </tr>
                          <tr>
                            <td className="py-1.5 pr-4 font-medium">Scope 3</td>
                            <td className="text-right py-1.5 px-3 bg-verdex-100/50">50,000</td>
                            <td className="text-right py-1.5 px-3 bg-white/50">30,000</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Current Baseline Emissions</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scope 1</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                        value={formData.currentScope1 || ''}
                        onChange={(e) => updateField('currentScope1', Number(e.target.value))}
                        placeholder="e.g., 150000"
                      />
                      <p className="text-xs text-gray-400 mt-1">Direct emissions</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scope 2</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                        value={formData.currentScope2 || ''}
                        onChange={(e) => updateField('currentScope2', Number(e.target.value))}
                        placeholder="e.g., 25000"
                      />
                      <p className="text-xs text-gray-400 mt-1">Purchased electricity</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scope 3</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                        value={formData.currentScope3 || ''}
                        onChange={(e) => updateField('currentScope3', Number(e.target.value))}
                        placeholder="e.g., 50000"
                      />
                      <p className="text-xs text-gray-400 mt-1">Value chain (optional)</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-800 mb-4">Target Emissions</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scope 1 Target</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                        value={formData.targetScope1 || ''}
                        onChange={(e) => updateField('targetScope1', Number(e.target.value))}
                        placeholder="e.g., 75000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scope 2 Target</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                        value={formData.targetScope2 || ''}
                        onChange={(e) => updateField('targetScope2', Number(e.target.value))}
                        placeholder="e.g., 10000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scope 3 Target</label>
                      <input
                        type="number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors"
                        value={formData.targetScope3 || ''}
                        onChange={(e) => updateField('targetScope3', Number(e.target.value))}
                        placeholder="e.g., 30000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Year</label>
                  <select
                    className="w-48 px-4 py-3 pr-10 border border-gray-300 rounded-xl text-gray-900 bg-white focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%236b7280%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M8%2011L3%206h10l-5%205z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat"
                    value={formData.targetYear}
                    onChange={(e) => updateField('targetYear', Number(e.target.value))}
                  >
                    {[2025, 2026, 2027, 2028, 2029, 2030, 2035, 2040, 2050].map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                {formData.currentScope1 > 0 && formData.targetScope1 > 0 && (
                  <div className="bg-verdex-50 p-4 rounded-xl">
                    <p className="text-sm font-medium text-verdex-800">
                      Projected Reduction: {(((formData.currentScope1 + formData.currentScope2) - (formData.targetScope1 + formData.targetScope2)) / (formData.currentScope1 + formData.currentScope2) * 100).toFixed(1)}%
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 4: Strategy */}
            {step === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Transition Strategy</h2>

                {/* Guidance Box */}
                <div className="bg-verdex-50 border border-verdex-200 rounded-2xl p-5 text-sm space-y-4">
                  <div>
                    <p className="font-semibold text-verdex-900 mb-3">How to write a strong transition strategy</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="bg-white/60 rounded-xl p-3">
                        <p className="font-medium text-verdex-800 mb-2">Include these elements:</p>
                        <ul className="text-verdex-700 text-xs space-y-1">
                          <li>• Clear decarbonization pathway & timeline</li>
                          <li>• Specific technologies to be deployed</li>
                          <li>• Quantified emissions reduction targets</li>
                          <li>• Alignment with Paris Agreement / NDCs</li>
                        </ul>
                      </div>
                      <div className="bg-white/60 rounded-xl p-3">
                        <p className="font-medium text-verdex-800 mb-2">Example:</p>
                        <p className="text-verdex-700 text-xs italic">
                          &quot;Phase 1 (2024-2026): Replace coal boilers with natural gas, reducing Scope 1 by 45%.
                          Phase 2 (2027-2030): Install 20MW solar PV and battery storage, achieving 70% renewable energy mix.
                          Aligned with Kenya&apos;s NDC target of 32% emissions reduction by 2030.&quot;
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Transition Strategy Description *</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-verdex-500 focus:border-verdex-500 transition-colors min-h-[150px]"
                    value={formData.transitionStrategy}
                    onChange={(e) => updateField('transitionStrategy', e.target.value)}
                    placeholder="Describe your decarbonization pathway, key milestones, technologies to be deployed, and alignment with science-based targets..."
                  />
                </div>

                {/* Yes/No Pills */}
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Does the entity have a published transition plan or climate strategy?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('hasPublishedPlan', true)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          formData.hasPublishedPlan
                            ? 'bg-verdex-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('hasPublishedPlan', false)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          !formData.hasPublishedPlan
                            ? 'bg-gray-700 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-3">
                      Are targets verified by a third party (SBTi, auditor, or similar)?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateField('thirdPartyVerification', true)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          formData.thirdPartyVerification
                            ? 'bg-verdex-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        onClick={() => updateField('thirdPartyVerification', false)}
                        className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          !formData.thirdPartyVerification
                            ? 'bg-gray-700 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        No
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={() => setStep(step - 1)}
                disabled={step === 1}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  step === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white/80 text-gray-700 hover:bg-white border border-gray-200 hover:border-gray-300'
                }`}
              >
                Previous
              </button>

              {step < 4 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="bg-verdex-700 hover:bg-verdex-800 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="bg-verdex-700 hover:bg-verdex-800 text-white font-semibold px-8 py-3 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105 min-w-[180px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing
                    </span>
                  ) : (
                    'Run Assessment'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
