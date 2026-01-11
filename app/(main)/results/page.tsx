'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { formatClauseContent } from '@/lib/clauseFormatter';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// ============================================================================
// FEATURE FLAGS
// ============================================================================
// Toggle AI greenwashing display (disabled to focus on LMA 5 components)
const SHOW_AI_GREENWASH_SECTION = false;

interface AssessmentResult {
  projectName: string;
  country: string;
  countryName: string;
  sector: string;
  targetYear?: number;
  // Original project data for draft generation
  description?: string;
  projectType?: string;
  totalCost?: number;
  debtAmount?: number;
  equityAmount?: number;
  currentEmissions?: { scope1: number; scope2: number; scope3?: number };
  targetEmissions?: { scope1: number; scope2: number; scope3?: number };
  // NEW: Total emissions (captures all sources, not just Scope 1/2/3)
  totalBaselineEmissions?: number;
  totalTargetEmissions?: number;
  statedReductionPercent?: number;
  transitionStrategy?: string;
  hasPublishedPlan?: boolean;
  thirdPartyVerification?: boolean;
  eligibilityStatus: 'eligible' | 'partial' | 'ineligible';
  ineligibilityReasons?: string[];
  overallScore: number;
  lmaBaseScore?: number; // Raw LMA score before penalty
  greenwashingPenalty?: number; // Points deducted
  lmaComponents: {
    name: string;
    score: number;
    maxScore: number;
    feedback: {
      status: 'met' | 'partial' | 'missing';
      description: string;
      action?: string;
    }[];
  }[];
  kpiRecommendations?: {
    name: string;
    unit: string;
    description: string;
    suggestedTarget: string;
    source?: string;
    rationale?: string;
  }[];
  sptRecommendations?: {
    name: string;
    baseline: string;
    target: string;
    marginImpact: string;
    verificationMethod?: string;
    source?: string;
  }[];
  frameworksReferenced?: string[];
  kpiAiGenerated?: boolean;
  greenwashingRisk: {
    level: string;
    score: number;
    redFlags: { description: string; recommendation: string; severity: string }[];
    positiveIndicators: string[];
    recommendations: string[];
    // AI-enhanced fields
    aiEvaluationUsed?: boolean;
    aiScore?: number;
    aiRiskLevel?: 'low' | 'medium-low' | 'medium' | 'medium-high' | 'high';
    aiConfidence?: number;
    aiBreakdown?: {
      component: string;
      componentName: string;
      maxScore: number;
      score: number;
      confidence: number;
      findings: {
        criterion: string;
        maxPoints: number;
        points: number;
        status: 'strong' | 'adequate' | 'weak' | 'missing';
        evidence: string;
        concern?: string;
      }[];
      overallAssessment: string;
      recommendations: string[];
    }[];
    aiSummary?: string;
    aiTopConcerns?: string[];
    aiPositiveFindings?: string[];
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
  // NEW: AI evaluation metadata
  aiEvaluationUsed?: boolean;
  lmaEvaluationDetails?: {
    component: string;
    componentName: string;
    maxScore: number;
    score: number;
    confidence: number;
    subScores: {
      criterion: string;
      maxPoints: number;
      points: number;
      status: 'met' | 'partial' | 'missing';
      evidence: string;
      reasoning: string;
    }[];
    overallReasoning: string;
    improvements: string[];
    keyQuotes: { quote: string; relevance: string }[];
  }[];
}

interface ClauseAdvice {
  relevanceScore: number;
  relevanceSummary: string;
  howToApply: string;
  whenToUse: string;
  keyConsiderations: string[];
  suggestedModifications?: string;
  contextualizedExample?: string;
}

interface RelevantClause {
  id: string;
  score: number;
  content: string;
  metadata: {
    clauseType?: string;
    documentType?: string;
    source?: string;
  };
  advice?: ClauseAdvice;
  adviceLoading?: boolean;
}

// PDF Export Function
function exportToPDF(result: AssessmentResult, relevantClauses?: RelevantClause[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPos = 20;

  // Verdex Theme Colors (matching web)
  const colors = {
    verdex: {
      50: [236, 253, 245],   // #ecfdf5
      100: [209, 250, 229],  // #d1fae5
      200: [167, 243, 208],  // #a7f3d0
      500: [16, 185, 129],   // #10b981
      600: [5, 150, 105],    // #059669
      700: [4, 120, 87],     // #047857
      800: [6, 95, 70],      // #065f46
    },
    teal: {
      100: [204, 251, 241],  // #ccfbf1
      600: [13, 148, 136],   // #0d9488
      700: [15, 118, 110],   // #0f766e
    },
    amber: {
      50: [255, 251, 235],   // #fffbeb
      600: [217, 119, 6],    // #d97706
      700: [180, 83, 9],     // #b45309
    },
    rose: {
      50: [255, 241, 242],   // #fff1f2
      600: [225, 29, 72],    // #e11d48
      700: [159, 18, 57],    // #9f1239
    },
    gray: {
      50: [249, 250, 251],   // #f9fafb
      100: [243, 244, 246],  // #f3f4f6
      500: [107, 114, 128],  // #6b7280
      600: [75, 85, 99],     // #4b5563
      700: [55, 65, 81],     // #374151
    }
  };

  // Set Montserrat-like font (Helvetica is the closest built-in)
  // For true Montserrat, embed the font via doc.addFont() with base64
  doc.setFont('helvetica');

  // Add footer to every page
  const addFooter = () => {
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(colors.gray[500][0], colors.gray[500][1], colors.gray[500][2]);
      doc.text(
        'This assessment is based on LMA Transition Loan Principles and does not constitute financial advice.',
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );
      doc.setTextColor(colors.verdex[600][0], colors.verdex[600][1], colors.verdex[600][2]);
      doc.text(
        'Generated by Verdex - Verified Green Finance',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
      doc.setTextColor(colors.gray[500][0], colors.gray[500][1], colors.gray[500][2]);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - 20,
        pageHeight - 8,
        { align: 'right' }
      );
    }
  };

  // Helper function to add new page if needed (leave space for footer)
  const checkNewPage = (neededSpace: number = 30) => {
    if (yPos + neededSpace > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
    }
  };

  // Title - Verdex Brand Color (#047857)
  doc.setFontSize(20);
  doc.setTextColor(4, 120, 87); // Verdex-700
  doc.text('Verdex', pageWidth / 2, yPos, { align: 'center' });
  yPos += 8;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text('LMA Transition Loan Assessment Report', pageWidth / 2, yPos, { align: 'center' });
  yPos += 12;

  // Project Header - handle long names
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  const projectNameLines = doc.splitTextToSize(result.projectName, pageWidth - 28);
  doc.text(projectNameLines, 14, yPos);
  yPos += projectNameLines.length * 7 + 2;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`${result.countryName} | ${result.sector.charAt(0).toUpperCase() + result.sector.slice(1)} Sector`, 14, yPos);
  yPos += 5;
  doc.text(`Assessment Date: ${new Date(result.assessmentDate).toLocaleDateString()}`, 14, yPos);
  yPos += 10;

  // Overall Score Box - using theme colors
  const statusBgColor = result.eligibilityStatus === 'eligible'
    ? colors.verdex[50]
    : result.eligibilityStatus === 'partial'
      ? colors.amber[50]
      : colors.rose[50];
  doc.setFillColor(statusBgColor[0], statusBgColor[1], statusBgColor[2]);
  doc.roundedRect(14, yPos, pageWidth - 28, 30, 3, 3, 'F');

  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  const statusLabel = result.eligibilityStatus === 'eligible' ? 'ELIGIBLE FOR TRANSITION LOAN' :
    result.eligibilityStatus === 'partial' ? 'PARTIALLY ELIGIBLE - GAPS IDENTIFIED' :
      'NOT YET ELIGIBLE - IMPROVEMENTS NEEDED';
  doc.text(statusLabel, 20, yPos + 12);

  doc.setFontSize(20);
  doc.text(`${result.overallScore}/100`, pageWidth - 40, yPos + 18);
  doc.setFontSize(8);
  doc.text('Overall Score', pageWidth - 40, yPos + 24);

  if ((result.greenwashingPenalty ?? 0) > 0) {
    doc.setFontSize(8);
    doc.setTextColor(200, 0, 0);
    doc.text(`(includes -${result.greenwashingPenalty} risk penalty)`, pageWidth - 40, yPos + 28);
  }
  yPos += 40;

  // Ineligibility reasons if any
  if (result.ineligibilityReasons && result.ineligibilityReasons.length > 0) {
    doc.setFontSize(9);
    doc.setTextColor(180, 0, 0);
    result.ineligibilityReasons.forEach(reason => {
      const reasonLines = doc.splitTextToSize(`• ${reason}`, pageWidth - 45);
      doc.text(reasonLines, 20, yPos);
      yPos += reasonLines.length * 5 + 2;
    });
    yPos += 3;
  }

  // LMA Components Table
  checkNewPage(60);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('LMA Transition Loan Requirements', 14, yPos);
  yPos += 8;

  const lmaData = result.lmaComponents.map(comp => [
    comp.name,
    `${comp.score}/${comp.maxScore}`,
    `${Math.round((comp.score / comp.maxScore) * 100)}%`
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Component', 'Score', 'Progress']],
    body: lmaData,
    theme: 'striped',
    headStyles: { fillColor: [4, 120, 87] },
    margin: { left: 14, right: 14 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Detailed feedback for each component
  result.lmaComponents.forEach(comp => {
    checkNewPage(50);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`${comp.name} (${comp.score}/${comp.maxScore})`, 14, yPos);
    yPos += 8;

    comp.feedback.forEach(fb => {
      checkNewPage(20);
      const icon = fb.status === 'met' ? '[OK]' : fb.status === 'partial' ? '[~]' : '[X]';
      // Use Verdex brand colors: met=verdex-600, partial=amber-700, missing=rose-700
      const color = fb.status === 'met' ? [5, 150, 105] : fb.status === 'partial' ? [180, 83, 9] : [159, 18, 57];

      doc.setFontSize(9);
      doc.setTextColor(color[0], color[1], color[2]);
      const descLines = doc.splitTextToSize(`${icon} ${fb.description}`, pageWidth - 40);
      doc.text(descLines, 18, yPos);
      yPos += descLines.length * 5;

      if (fb.action) {
        checkNewPage(15);
        doc.setFontSize(8);
        doc.setTextColor(60, 60, 60);
        const actionLines = doc.splitTextToSize(`Action: ${fb.action}`, pageWidth - 45);
        doc.text(actionLines, 22, yPos);
        yPos += actionLines.length * 4 + 3;
      } else {
        yPos += 2;
      }
    });
    yPos += 6;
  });

  // KPI Recommendations
  if (result.kpiRecommendations && result.kpiRecommendations.length > 0) {
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Recommended KPIs', 14, yPos);
    yPos += 3;

    if (result.frameworksReferenced && result.frameworksReferenced.length > 0) {
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Based on: ${result.frameworksReferenced.join(', ')}`, 14, yPos + 5);
      yPos += 5;
    }
    yPos += 5;

    const kpiData = result.kpiRecommendations.map(kpi => [
      kpi.name,
      kpi.unit,
      kpi.suggestedTarget,
      kpi.source || '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['KPI', 'Unit', 'Target', 'Source']],
      body: kpiData,
      theme: 'striped',
      headStyles: { fillColor: [colors.verdex[600][0], colors.verdex[600][1], colors.verdex[600][2]] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 50 },
        3: { cellWidth: 35 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // SPT Recommendations
  if (result.sptRecommendations && result.sptRecommendations.length > 0) {
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Sustainability Performance Targets (SPTs)', 14, yPos);
    yPos += 8;

    const sptData = result.sptRecommendations.map(spt => [
      spt.name,
      spt.baseline,
      spt.target,
      spt.marginImpact,
      spt.source || '-'
    ]);

    autoTable(doc, {
      startY: yPos,
      head: [['SPT', 'Baseline', 'Target', 'Margin Impact', 'Source']],
      body: sptData,
      theme: 'striped',
      headStyles: { fillColor: [colors.teal[600][0], colors.teal[600][1], colors.teal[600][2]] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 40 },
        4: { cellWidth: 30 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Greenwashing Risk - manual validation (always shown)
  checkNewPage(50);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Greenwashing Risk Assessment', 14, yPos);
  yPos += 10;

  // Use Verdex brand colors for risk levels
  const riskColor = result.greenwashingRisk.level === 'low' ? [5, 150, 105] :
    result.greenwashingRisk.level === 'medium' ? [180, 83, 9] : [159, 18, 57];
  doc.setFontSize(11);
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2]);
  doc.text(`${result.greenwashingRisk.level.toUpperCase()} RISK (Score: ${result.greenwashingRisk.score}/100)`, 14, yPos);
  yPos += 10;

  if (result.greenwashingRisk.redFlags.length > 0) {
    doc.setFontSize(10);
    doc.setTextColor(159, 18, 57); // rose-700
    doc.text('Red Flags:', 14, yPos);
    yPos += 6;

    result.greenwashingRisk.redFlags.forEach(flag => {
      checkNewPage(15);
      doc.setFontSize(9);
      doc.setTextColor(159, 18, 57); // rose-700
      const flagLines = doc.splitTextToSize(`[-] ${flag.description}`, pageWidth - 40);
      doc.text(flagLines, 18, yPos);
      yPos += flagLines.length * 5 + 2;
    });
    yPos += 4;
  }

  if (result.greenwashingRisk.positiveIndicators.length > 0) {
    checkNewPage(20);
    doc.setFontSize(10);
    doc.setTextColor(4, 120, 87); // verdex-700
    doc.text('Positive Indicators:', 14, yPos);
    yPos += 6;

    result.greenwashingRisk.positiveIndicators.forEach(indicator => {
      checkNewPage(10);
      doc.setFontSize(9);
      doc.setTextColor(5, 150, 105); // verdex-600
      const indicatorLines = doc.splitTextToSize(`[+] ${indicator}`, pageWidth - 40);
      doc.text(indicatorLines, 18, yPos);
      yPos += indicatorLines.length * 5 + 2;
    });
    yPos += 4;
  }

  // DFI Matches
  if (result.dfiMatches.length > 0) {
    checkNewPage(50);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('DFI Matches', 14, yPos);
    yPos += 8;

    const dfiData = result.dfiMatches.map(dfi => {
      let sizeDisplay = '-';
      if (dfi.estimatedSize) {
        const minM = dfi.estimatedSize.min / 1_000_000;
        const maxM = dfi.estimatedSize.max / 1_000_000;
        if (maxM > 0 && maxM >= minM) {
          sizeDisplay = `$${minM.toFixed(0)}M - $${maxM.toFixed(0)}M`;
        } else if (minM > 0) {
          // max is 0 or invalid - just show minimum (typical DFI ticket size)
          sizeDisplay = `Min $${minM.toFixed(0)}M`;
        }
      }
      return [
        dfi.name,
        dfi.fullName,
        `${dfi.matchScore}%`,
        dfi.recommendedRole.replace('_', ' '),
        sizeDisplay
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['DFI', 'Full Name', 'Match', 'Role', 'Est. Size']],
      body: dfiData,
      theme: 'striped',
      headStyles: { fillColor: [4, 120, 87] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 50 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 35 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // Next Steps
  checkNewPage(50);
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text('Recommended Next Steps', 14, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setTextColor(4, 120, 87); // verdex-700
  result.nextSteps.forEach((step, i) => {
    checkNewPage(15);
    const stepLines = doc.splitTextToSize(`${i + 1}. ${step}`, pageWidth - 40);
    doc.text(stepLines, 18, yPos);
    yPos += stepLines.length * 5 + 3;
  });

  // Relevant Clauses Section
  if (relevantClauses && relevantClauses.length > 0) {
    // Add extra spacing and divider before clauses section
    yPos += 10;
    checkNewPage(70);

    // Draw a subtle divider line
    doc.setDrawColor(colors.gray[100][0], colors.gray[100][1], colors.gray[100][2]);
    doc.setLineWidth(0.5);
    doc.line(14, yPos, pageWidth - 14, yPos);
    yPos += 15;

    doc.setFontSize(14);
    doc.setTextColor(colors.verdex[700][0], colors.verdex[700][1], colors.verdex[700][2]);
    doc.text('Relevant LMA Clauses', 14, yPos);
    yPos += 10;

    relevantClauses.forEach((clause, idx) => {
      checkNewPage(60);

      // Clause header with number and type
      doc.setFontSize(11);
      doc.setTextColor(4, 120, 87);
      const clauseType = clause.metadata.clauseType?.replace(/_/g, ' ') || 'General';
      doc.text(`${idx + 1}. ${clauseType.charAt(0).toUpperCase() + clauseType.slice(1)}`, 14, yPos);

      // Match score
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Match: ${(clause.score * 100).toFixed(0)}%`, pageWidth - 35, yPos);
      yPos += 6;

      // Relevance score if available
      if (clause.advice) {
        doc.setFontSize(9);
        doc.setTextColor(5, 150, 105);
        doc.text(`Project Relevance: ${clause.advice.relevanceScore}/10`, 14, yPos);
        yPos += 5;

        // AI Summary
        doc.setFontSize(9);
        doc.setTextColor(60, 60, 60);
        const summaryLines = doc.splitTextToSize(clause.advice.relevanceSummary, pageWidth - 28);
        doc.text(summaryLines, 14, yPos);
        yPos += summaryLines.length * 4 + 3;

        // How to Apply
        checkNewPage(25);
        doc.setFontSize(8);
        doc.setTextColor(0, 0, 0);
        doc.text('How to Apply:', 14, yPos);
        yPos += 4;
        doc.setTextColor(60, 60, 60);
        const applyLines = doc.splitTextToSize(clause.advice.howToApply, pageWidth - 32);
        doc.text(applyLines, 18, yPos);
        yPos += applyLines.length * 3.5 + 3;

        // Key Considerations
        if (clause.advice.keyConsiderations && clause.advice.keyConsiderations.length > 0) {
          checkNewPage(20);
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text('Key Considerations:', 14, yPos);
          yPos += 4;
          doc.setTextColor(60, 60, 60);
          clause.advice.keyConsiderations.slice(0, 3).forEach(consideration => {
            checkNewPage(10);
            const consLines = doc.splitTextToSize(`• ${consideration}`, pageWidth - 36);
            doc.text(consLines, 18, yPos);
            yPos += consLines.length * 3.5 + 1;
          });
          yPos += 2;
        }
      }

      // Source document and clause ID
      doc.setFontSize(8);
      doc.setTextColor(colors.gray[500][0], colors.gray[500][1], colors.gray[500][2]);
      if (clause.metadata.source) {
        doc.text(`Source: ${clause.metadata.source}`, 14, yPos);
        yPos += 4;
      }
      doc.text(`Clause ID: ${clause.id}`, 14, yPos);
      yPos += 5;

      // Clause content preview
      checkNewPage(20);
      doc.setFillColor(colors.verdex[50][0], colors.verdex[50][1], colors.verdex[50][2]);
      const contentPreview = clause.content.substring(0, 300) + (clause.content.length > 300 ? '...' : '');
      const contentLines = doc.splitTextToSize(contentPreview, pageWidth - 36);
      const boxHeight = Math.min(contentLines.length * 3.5 + 6, 40);
      doc.roundedRect(14, yPos, pageWidth - 28, boxHeight, 2, 2, 'F');
      doc.setFontSize(7);
      doc.setTextColor(colors.gray[600][0], colors.gray[600][1], colors.gray[600][2]);
      doc.text(contentLines.slice(0, 8), 18, yPos + 4);
      yPos += boxHeight + 8;
    });
  }

  // Add footer to all pages
  addFooter();

  // Save the PDF
  const fileName = `${result.projectName.replace(/[^a-z0-9]/gi, '_')}_Assessment_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

export default function ResultsPage() {
  const router = useRouter();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [relevantClauses, setRelevantClauses] = useState<RelevantClause[]>([]);
  const [clausesLoading, setClausesLoading] = useState(false);
  const [clauseSearchQuery, setClauseSearchQuery] = useState('');
  const [selectedClauseModal, setSelectedClauseModal] = useState<RelevantClause | null>(null);
  const [originalClauseExpanded, setOriginalClauseExpanded] = useState(false);
  const [modalDocumentUrl, setModalDocumentUrl] = useState<string | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [draftModalOpen, setDraftModalOpen] = useState(false);
  const [draftMetadata, setDraftMetadata] = useState<{
    generatedAt: string;
    targetDFI: string;
    projectName: string;
    sector: string;
    country: string;
  } | null>(null);

  // Check if any clause advice is still loading
  const isExportReady = !clausesLoading && relevantClauses.every(c => !c.adviceLoading);
  const pageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('assessmentResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push('/assess');
    }
  }, [router]);

  // Fetch document URL when modal clause changes
  useEffect(() => {
    if (!selectedClauseModal) {
      setModalDocumentUrl(null);
      return;
    }

    const fetchDocUrl = async () => {
      try {
        const params = new URLSearchParams();
        if (selectedClauseModal.metadata.source) {
          params.set('source', selectedClauseModal.metadata.source);
        }
        params.set('clauseId', selectedClauseModal.id);

        const res = await fetch(`/api/document-url?${params}`);
        const data = await res.json();
        setModalDocumentUrl(data.url || null);
      } catch {
        setModalDocumentUrl(null);
      }
    };

    fetchDocUrl();
  }, [selectedClauseModal]);

  // Fetch relevant clauses based on project characteristics
  useEffect(() => {
    if (result) {
      const fetchClauses = async () => {
        setClausesLoading(true);
        try {
          // Build contextual search query based on project KPIs and SPTs
          const kpiTerms = result.kpiRecommendations?.slice(0, 2).map(kpi => kpi.name).join(' ') || '';
          const sptTerms = result.sptRecommendations?.slice(0, 1).map(spt => spt.target).join(' ') || '';

          // Create a more specific search query focused on sustainability-linked features
          const searchTerms = [
            'sustainability linked',
            result.sector,
            kpiTerms,
            result.eligibilityStatus === 'eligible' ? 'margin adjustment KPI SPT' : 'eligibility criteria',
          ].filter(Boolean).join(' ');

          setClauseSearchQuery(searchTerms);

          // Fetch clauses with relevant clause type filters - all sustainability-linked clause types
          const relevantClauseTypes = [
            'margin_ratchet',      // Margin adjustment based on SPT achievement
            'kpi_definition',      // Key Performance Indicator definitions
            'spt_definition',      // Sustainability Performance Target definitions
            'verification',        // External verification requirements
            'use_of_proceeds',     // How loan proceeds must be used
            'reporting_covenant',  // Sustainability reporting requirements
            'conditions_precedent', // Conditions before drawdown
            'representations',     // Borrower representations & warranties
            'interest',            // Interest rate provisions
            'facility_terms',      // General facility terms
          ];

          // Make multiple targeted searches for different clause types
          const searchPromises = relevantClauseTypes.map(clauseType =>
            fetch('/api/search', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `${result.sector} ${clauseType.replace(/_/g, ' ')} sustainability transition`,
                limit: 2,
                filters: { clauseType },
              }),
            }).then(res => res.json())
          );

          const results = await Promise.all(searchPromises);
          const allClauses = results.flatMap(r => r.results || []);

          // Deduplicate and take top 6
          const uniqueClauses = allClauses.reduce((acc: RelevantClause[], clause) => {
            if (!acc.find(c => c.id === clause.id)) {
              acc.push({ ...clause, adviceLoading: true });
            }
            return acc;
          }, [])
            .sort((a, b) => b.score - a.score)
            .slice(0, 6)

          setRelevantClauses(uniqueClauses);

          // Fetch AI advice for each clause in parallel
          const projectContext = {
            projectName: result.projectName,
            sector: result.sector,
            country: result.countryName,
            eligibilityStatus: result.eligibilityStatus,
            kpis: result.kpiRecommendations?.slice(0, 3).map(k => ({ name: k.name, description: k.description })),
            spts: result.sptRecommendations?.slice(0, 2).map(s => ({ name: s.name, target: s.target })),
          };

          // Fetch advice for each clause
          uniqueClauses.forEach(async (clause, index) => {
            try {
              const adviceResponse = await fetch('/api/clause-advice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  clause: {
                    content: clause.content,
                    clauseType: clause.metadata.clauseType,
                    source: clause.metadata.source,
                  },
                  projectContext,
                }),
              });

              const adviceData = await adviceResponse.json();

              if (adviceData.success && adviceData.advice) {
                setRelevantClauses(prev => prev.map((c, i) =>
                  i === index ? { ...c, advice: adviceData.advice, adviceLoading: false } : c
                ));
              } else {
                setRelevantClauses(prev => prev.map((c, i) =>
                  i === index ? { ...c, adviceLoading: false } : c
                ));
              }
            } catch (error) {
              console.error('Failed to fetch advice for clause:', error);
              setRelevantClauses(prev => prev.map((c, i) =>
                i === index ? { ...c, adviceLoading: false } : c
              ));
            }
          });
        } catch (error) {
          console.error('Failed to fetch relevant clauses:', error);
        } finally {
          setClausesLoading(false);
        }
      };

      fetchClauses();
    }
  }, [result]);

  // GSAP animations with ScrollTrigger
  useEffect(() => {
    if (result && pageRef.current) {
      // Header animation - immediate on load
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo(headerRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.5 }
      )
        .fromTo(statusRef.current,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.4 },
          '-=0.2'
        );

      // Result cards with scroll-triggered stagger animation
      gsap.utils.toArray('.result-card').forEach((card, index) => {
        gsap.fromTo(card as Element,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card as Element,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            delay: index * 0.1 // Stagger effect
          }
        );
      });

      // Cleanup ScrollTrigger on unmount
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }
  }, [result]);

  // Generate AI Draft function
  const generateDraft = async () => {
    if (!result || draftLoading) return;

    setDraftLoading(true);
    try {
      const response = await fetch('/api/generate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...result,
          relevantClauses: relevantClauses.map(c => ({
            id: c.id,
            content: c.content,
            metadata: c.metadata,
            advice: c.advice,
          })),
        }),
      });

      const data = await response.json();

      if (data.success && data.draft) {
        setGeneratedDraft(data.draft);
        setDraftMetadata(data.metadata);
        setDraftModalOpen(true);
      } else {
        console.error('Draft generation failed:', data.error);
        alert('Failed to generate draft. Please try again.');
      }
    } catch (error) {
      console.error('Draft generation error:', error);
      alert('Failed to generate draft. Please try again.');
    } finally {
      setDraftLoading(false);
    }
  };

  // Export draft to PDF
  const exportDraftToPDF = () => {
    if (!generatedDraft || !draftMetadata) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const maxLineWidth = pageWidth - margin * 2;
    let yPos = 20;

    // Verdex colors
    const verdexGreen = [4, 120, 87];
    const darkGray = [55, 65, 81];
    const lightGray = [107, 114, 128];

    // Helper to add page if needed
    const checkNewPage = (neededSpace: number = 15) => {
      if (yPos + neededSpace > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.setTextColor(verdexGreen[0], verdexGreen[1], verdexGreen[2]);
    doc.text('Verdex', pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;

    doc.setFontSize(11);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text('AI-Generated Project Draft', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Project info
    doc.setFontSize(14);
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    const projectLines = doc.splitTextToSize(draftMetadata.projectName, maxLineWidth);
    doc.text(projectLines, margin, yPos);
    yPos += projectLines.length * 6 + 4;

    doc.setFontSize(9);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`${draftMetadata.country} | ${draftMetadata.sector} | Target DFI: ${draftMetadata.targetDFI}`, margin, yPos);
    yPos += 4;
    doc.text(`Generated: ${new Date(draftMetadata.generatedAt).toLocaleString()}`, margin, yPos);
    yPos += 10;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 8;

    // Parse and render markdown content with table support
    const lines = generatedDraft.split('\n');
    let i = 0;

    // Helper to parse a markdown table
    const parseMarkdownTable = (startIdx: number): { headers: string[], rows: string[][], endIdx: number } => {
      const headers: string[] = [];
      const rows: string[][] = [];
      let idx = startIdx;

      // Parse header row
      const headerLine = lines[idx]?.trim();
      if (headerLine?.startsWith('|')) {
        const headerCells = headerLine.split('|').filter(c => c.trim()).map(c => c.trim().replace(/\*\*/g, ''));
        headers.push(...headerCells);
        idx++;
      }

      // Skip separator row (|---|---|)
      const sepLine = lines[idx]?.trim();
      if (sepLine?.match(/^\|[\s\-:|]+\|$/)) {
        idx++;
      }

      // Parse data rows
      while (idx < lines.length) {
        const rowLine = lines[idx]?.trim();
        if (!rowLine?.startsWith('|')) break;
        if (rowLine.match(/^\|[\s\-:|]+\|$/)) { idx++; continue; } // Skip any additional separator rows
        const cells = rowLine.split('|').filter(c => c.trim()).map(c => c.trim().replace(/\*\*/g, ''));
        if (cells.length > 0) rows.push(cells);
        idx++;
      }

      return { headers, rows, endIdx: idx };
    };

    while (i < lines.length) {
      const trimmedLine = lines[i].trim();

      // Skip empty lines but add small spacing
      if (!trimmedLine) {
        yPos += 3;
        i++;
        continue;
      }

      // Check if this is a table (starts with |)
      if (trimmedLine.startsWith('|') && !trimmedLine.match(/^\|[\s\-:|]+\|$/)) {
        const { headers, rows, endIdx } = parseMarkdownTable(i);

        if (headers.length > 0 && rows.length > 0) {
          checkNewPage(40);

          // Use autoTable for proper table rendering
          autoTable(doc, {
            startY: yPos,
            head: [headers],
            body: rows,
            margin: { left: margin, right: margin },
            styles: {
              fontSize: 8,
              cellPadding: 2,
              textColor: [55, 65, 81],
            },
            headStyles: {
              fillColor: [4, 120, 87],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 8,
            },
            alternateRowStyles: {
              fillColor: [249, 250, 251],
            },
            tableLineColor: [200, 200, 200],
            tableLineWidth: 0.1,
          });

          // Update yPos after table
          yPos = (doc as any).lastAutoTable.finalY + 8;
        }

        i = endIdx;
        continue;
      }

      checkNewPage(20);

      // Handle headers
      if (trimmedLine.startsWith('### ')) {
        yPos += 4;
        doc.setFontSize(11);
        doc.setTextColor(verdexGreen[0], verdexGreen[1], verdexGreen[2]);
        const headerText = trimmedLine.replace('### ', '').replace(/\*\*/g, '');
        const headerLines = doc.splitTextToSize(headerText, maxLineWidth);
        doc.text(headerLines, margin, yPos);
        yPos += headerLines.length * 5 + 3;
      } else if (trimmedLine.startsWith('## ')) {
        yPos += 6;
        doc.setFontSize(13);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const headerText = trimmedLine.replace('## ', '').replace(/\*\*/g, '');
        const headerLines = doc.splitTextToSize(headerText, maxLineWidth);
        doc.text(headerLines, margin, yPos);
        yPos += headerLines.length * 6 + 4;
      } else if (trimmedLine.startsWith('# ')) {
        yPos += 8;
        doc.setFontSize(15);
        doc.setTextColor(verdexGreen[0], verdexGreen[1], verdexGreen[2]);
        const headerText = trimmedLine.replace('# ', '').replace(/\*\*/g, '');
        const headerLines = doc.splitTextToSize(headerText, maxLineWidth);
        doc.text(headerLines, margin, yPos);
        yPos += headerLines.length * 7 + 5;
      } else if (trimmedLine.startsWith('---')) {
        yPos += 4;
        doc.setDrawColor(220, 220, 220);
        doc.line(margin, yPos, pageWidth - margin, yPos);
        yPos += 6;
      } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const bulletText = trimmedLine.substring(2).replace(/\*\*/g, '');
        const bulletLines = doc.splitTextToSize(`• ${bulletText}`, maxLineWidth - 8);
        doc.text(bulletLines, margin + 4, yPos);
        yPos += bulletLines.length * 4 + 2;
      } else if (/^\d+\.\s/.test(trimmedLine)) {
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const numText = trimmedLine.replace(/\*\*/g, '');
        const numLines = doc.splitTextToSize(numText, maxLineWidth - 4);
        doc.text(numLines, margin + 2, yPos);
        yPos += numLines.length * 4 + 2;
      } else {
        doc.setFontSize(9);
        doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
        const cleanText = trimmedLine.replace(/\*\*/g, '');
        const textLines = doc.splitTextToSize(cleanText, maxLineWidth);
        doc.text(textLines, margin, yPos);
        yPos += textLines.length * 4 + 1;
      }

      i++;
    }

    // Footer on all pages
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(
        'AI-generated draft based on LMA Transition Loan Principles. Review with legal counsel before use.',
        pageWidth / 2,
        pageHeight - 12,
        { align: 'center' }
      );
      doc.setTextColor(verdexGreen[0], verdexGreen[1], verdexGreen[2]);
      doc.text(
        'Generated by Verdex - Verified Green Finance',
        pageWidth / 2,
        pageHeight - 8,
        { align: 'center' }
      );
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 8, { align: 'right' });
    }

    const fileName = `${draftMetadata.projectName.replace(/[^a-z0-9]/gi, '_')}_Draft_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const statusLabels = {
    eligible: 'Eligible for Transition Loan',
    partial: 'Partially Eligible - Gaps Identified',
    ineligible: 'Not Yet Eligible - Improvements Needed',
  };

  return (
    <div ref={pageRef} className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pt-32 pb-16 relative overflow-hidden">
      {/* Animated Blobs Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="blob blob-green w-[600px] h-[600px] -top-40 -left-40 opacity-15 animate-blob" />
        <div className="blob blob-teal w-[400px] h-[400px] top-1/3 -right-32 opacity-10 animate-blob-reverse" />
        <div className="blob blob-emerald w-[350px] h-[350px] bottom-0 left-1/3 opacity-10 animate-blob-slow" />
      </div>

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Header - Project title only */}
        <div ref={headerRef} className="mb-10 mt-4 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-medium text-gray-900 mb-3 break-words">
            {result.projectName}
          </h1>
          <p className="text-lg text-gray-600">
            {result.countryName} | {result.sector.charAt(0).toUpperCase() + result.sector.slice(1)} Sector
          </p>
        </div>

        {/* Overall Status */}
        <div
          ref={statusRef}
          className={`relative rounded-2xl mb-10 p-6 lg:p-8 overflow-hidden ${
            result.eligibilityStatus === 'eligible'
              ? 'bg-gradient-to-br from-verdex-800 via-verdex-900 to-verdex-950'
              : result.eligibilityStatus === 'partial'
              ? 'bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950'
              : 'bg-gradient-to-br from-rose-800 via-rose-900 to-rose-950'
          }`}
        >
          {/* Grid texture */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                              linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '32px 32px'
          }} />

          {/* Glow effects */}
          <div className={`absolute top-10 right-10 w-40 h-40 rounded-full blur-[80px] ${
            result.eligibilityStatus === 'eligible'
              ? 'bg-verdex-400/15'
              : result.eligibilityStatus === 'partial'
              ? 'bg-amber-400/15'
              : 'bg-rose-400/15'
          }`} />
          <div className={`absolute bottom-10 left-10 w-48 h-48 rounded-full blur-[100px] ${
            result.eligibilityStatus === 'eligible'
              ? 'bg-verdex-300/10'
              : result.eligibilityStatus === 'partial'
              ? 'bg-amber-300/10'
              : 'bg-rose-300/10'
          }`} />

          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left: Status info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-display font-medium text-white">
                  {statusLabels[result.eligibilityStatus]}
                </h2>
                {result.ineligibilityReasons && result.ineligibilityReasons.length > 0 && (
                  <ul className="space-y-1.5 mt-3">
                    {result.ineligibilityReasons.map((reason, i) => (
                      <li key={i} className="text-sm text-white/70 flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-white/50 mt-2 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Right: Score and actions */}
              <div className="flex items-center gap-6 lg:gap-8">
                {/* Score display */}
                <div>
                  <p className="text-xs text-white/80 uppercase tracking-wide mb-1">Overall Score</p>
                  <div className="flex items-center gap-2">
                    <span className="text-4xl lg:text-5xl font-semibold text-white">{result.overallScore}</span>
                    <span className="text-lg text-white/70">/ 100</span>
                  </div>
                  {(result.greenwashingPenalty ?? 0) > 0 && (
                    <p className="text-sm text-white/90 mt-1">
                      {result.lmaBaseScore} base <span className="text-white">−{result.greenwashingPenalty} risk penalty</span>
                    </p>
                  )}
                </div>

                {/* Desktop actions */}
                <div className="hidden sm:flex flex-col gap-2">
                  <button
                    onClick={() => generatedDraft ? setDraftModalOpen(true) : generateDraft()}
                    disabled={draftLoading || !isExportReady}
                    className={`text-sm font-medium px-5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                      draftLoading || !isExportReady
                        ? 'bg-white/20 text-white/50 cursor-not-allowed'
                        : 'bg-white text-gray-900 hover:bg-white/90 shadow-lg'
                    }`}
                  >
                    {!isExportReady || draftLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {!isExportReady ? 'Analyzing...' : 'Generating...'}
                      </span>
                    ) : generatedDraft ? 'View Draft' : 'Generate Draft'}
                  </button>
                  <button
                    onClick={() => exportToPDF(result, relevantClauses)}
                    disabled={!isExportReady}
                    className={`text-sm font-medium px-5 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                      isExportReady
                        ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                        : 'bg-white/10 text-white/50 cursor-not-allowed'
                    }`}
                  >
                    {isExportReady ? 'Export PDF' : 'Analyzing...'}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile actions */}
            <div className="flex sm:hidden gap-3 mt-6 pt-5 border-t border-white/10">
              <button
                onClick={() => exportToPDF(result, relevantClauses)}
                disabled={!isExportReady}
                className={`flex-1 text-sm font-medium py-2.5 rounded-xl transition-all ${
                  isExportReady
                    ? 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                {isExportReady ? 'Export PDF' : 'Analyzing...'}
              </button>
              <button
                onClick={() => generatedDraft ? setDraftModalOpen(true) : generateDraft()}
                disabled={draftLoading || !isExportReady}
                className={`flex-1 text-sm font-medium py-2.5 rounded-xl transition-all ${
                  draftLoading || !isExportReady
                    ? 'bg-white/20 text-white/50 cursor-not-allowed'
                    : 'bg-white text-gray-900 hover:bg-white/90'
                }`}
              >
                {draftLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </span>
                ) : generatedDraft ? 'View Draft' : 'Generate Draft'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - LMA Components */}
          <div className="lg:col-span-2 space-y-8">
            {/* LMA Component Scores */}
            <div className="bg-white rounded-2xl border border-gray-100 result-card overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-display font-medium text-gray-900">LMA Transition Loan Requirements</h2>
                    <p className="text-sm text-gray-500 mt-1">Assessment against Loan Market Association principles</p>
                  </div>
                  {result.aiEvaluationUsed && (
                    <span className="bg-gradient-to-r from-verdex-600 to-teal-500 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                      AI Evaluated
                    </span>
                  )}
                </div>
              </div>

              <div className="divide-y divide-gray-100">
                {result.lmaComponents.map((component, idx) => {
                  const percentage = Math.round((component.score / component.maxScore) * 100);
                  const isHigh = percentage >= 70;
                  const isMedium = percentage >= 50 && percentage < 70;

                  // Get AI evaluation details for this component if available
                  const aiDetails = result.lmaEvaluationDetails?.find(
                    d => d.componentName === component.name
                  );

                  return (
                    <div key={idx} className={`px-6 py-5 ${idx % 2 === 1 ? 'bg-gray-100/50' : ''}`}>
                      {/* Component Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-medium text-gray-900">{component.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-sm text-gray-500">{percentage}% complete</span>
                            <span className="text-gray-300">·</span>
                            <span className={`text-sm font-medium ${isHigh ? 'text-verdex-600' : isMedium ? 'text-amber-600' : 'text-rose-600'}`}>
                              {component.score}/{component.maxScore}
                            </span>
                            {/* Show confidence level if AI evaluated */}
                            {/* {aiDetails && aiDetails.confidence > 0 && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  aiDetails.confidence >= 70 ? 'bg-verdex-50 text-verdex-700' :
                                  aiDetails.confidence >= 40 ? 'bg-amber-50 text-amber-700' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {aiDetails.confidence}% confidence
                                </span>
                              </>
                            )} */}
                          </div>
                        </div>
                        {/* Compact progress indicator */}
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isHigh ? 'bg-verdex-500' : isMedium ? 'bg-amber-400' : 'bg-rose-400'}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Feedback Items - Clean list style */}
                      <div className="space-y-2 ml-5">
                        {component.feedback.map((fb, i) => (
                          <div
                            key={i}
                            className={`flex items-start gap-3 py-2 pl-3 border-l-2 ${
                              fb.status === 'met' ? 'border-verdex-400' :
                              fb.status === 'partial' ? 'border-amber-400' :
                              'border-rose-400'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700">{fb.description}</p>
                              {fb.action && (
                                <p className="text-xs text-gray-500 mt-1.5">{fb.action}</p>
                              )}
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              fb.status === 'met' ? 'text-verdex-700 bg-verdex-50' :
                              fb.status === 'partial' ? 'text-amber-700 bg-amber-50' :
                              'text-rose-700 bg-rose-50'
                            }`}>
                              {fb.status === 'met' ? 'Met' : fb.status === 'partial' ? 'Partial' : 'Missing'}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* AI Evaluation Details - Key Quotes & Improvements */}
                      {aiDetails && (aiDetails.keyQuotes?.length > 0 || aiDetails.improvements?.length > 0) && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          {/* Key Quotes */}
                          {aiDetails.keyQuotes?.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs font-medium text-gray-500 mb-2">Key Evidence from Document:</p>
                              <div className="space-y-2">
                                {aiDetails.keyQuotes.slice(0, 2).map((q, qi) => (
                                  <div key={qi} className="bg-gray-50 rounded-lg px-3 py-2">
                                    <p className="text-xs text-gray-700 italic">"{q.quote}"</p>
                                    <p className="text-xs text-gray-500 mt-1">{q.relevance}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Improvements */}
                          {aiDetails.improvements?.length > 0 && (
                            <div>
                              <p className="text-xs font-medium text-gray-500 mb-2">Suggested Improvements:</p>
                              <ul className="space-y-1">
                                {aiDetails.improvements.slice(0, 3).map((imp, ii) => (
                                  <li key={ii} className="text-xs text-gray-600 flex items-start gap-2">
                                    <span className="text-verdex-500 mt-0.5">→</span>
                                    {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KPI & SPT Recommendations */}
            {(result.kpiRecommendations && result.kpiRecommendations.length > 0) && (
              <div className="rounded-3xl p-6 result-card border-[1px] border-gray-100">
                <div className="flex justify-between items-start mb-4 ">
                  <h2 className="text-xl font-display font-medium">Recommended KPIs & SPTs</h2>
                  {result.kpiAiGenerated && (
                    <span className="bg-gradient-to-r from-verdex-600 to-teal-500 text-white text-xs px-2 py-1 rounded-full">
                      AI Generated
                    </span>
                  )}
                </div>

                {/* Frameworks Referenced */}
                {result.frameworksReferenced && result.frameworksReferenced.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">Based on official frameworks:</p>
                    <div className="flex flex-wrap gap-2">
                      {result.frameworksReferenced.map((fw, i) => (
                        <span key={i} className="bg-white border border-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
                          {fw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* KPIs */}
                <div className="mb-6">
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <span className="bg-verdex-600 text-white px-2 py-0.5 rounded text-xs font-semibold">KPIs</span>
                    Key Performance Indicators to Track
                  </h3>
                  <div className="space-y-3">
                    {result.kpiRecommendations.map((kpi, i) => (
                      <div key={i} className="bg-verdex-100 border border-verdex-300 rounded-xl p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 bg-verdex-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-verdex-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-verdex-900">{kpi.name}</p>
                            <p className="text-xs text-verdex-700 mt-0.5">{kpi.description}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 bg-white/70 rounded-lg p-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Unit</p>
                            <p className="text-sm font-medium text-gray-800">{kpi.unit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Target</p>
                            <p className="text-sm font-semibold text-verdex-700">{kpi.suggestedTarget}</p>
                          </div>
                        </div>
                        {(kpi.source || kpi.rationale) && (
                          <div className="mt-3 pt-3 border-t border-verdex-300 text-xs">
                            {kpi.source && (
                              <span className="inline-block bg-verdex-600 text-white px-2 py-0.5 rounded mr-2">
                                {kpi.source}
                              </span>
                            )}
                            {kpi.rationale && (
                              <span className="text-gray-700">{kpi.rationale}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* SPTs */}
                {result.sptRecommendations && result.sptRecommendations.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <span className="bg-teal-600 text-white px-2 py-0.5 rounded text-xs font-semibold">SPTs</span>
                      Sustainability Performance Targets (Margin-Linked)
                    </h3>
                    <div className="space-y-3">
                      {result.sptRecommendations.map((spt, i) => (
                        <div key={i} className="bg-teal-100 border border-teal-300 rounded-xl p-4">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-8 h-8 bg-teal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg className="w-4 h-4 text-teal-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-teal-900">{spt.name}</p>
                            </div>
                            <span className="bg-teal-600 text-white px-2 py-1 rounded text-xs font-mono flex-shrink-0">
                              {spt.marginImpact}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 bg-white/70 rounded-lg p-3 mb-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Baseline</p>
                              <p className="text-sm font-medium text-gray-800">{spt.baseline}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Target</p>
                              <p className="text-sm font-semibold text-teal-700">{spt.target}</p>
                            </div>
                          </div>
                          {(spt.verificationMethod || spt.source) && (
                            <div className="text-xs">
                              {spt.verificationMethod && (
                                <p className="text-gray-700 mb-2">
                                  <span className="font-medium">Verification:</span> {spt.verificationMethod}
                                </p>
                              )}
                              {spt.source && (
                                <span className="inline-block bg-teal-600 text-white px-2 py-0.5 rounded">
                                  {spt.source}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      SPTs are linked to loan margin adjustments. Meeting targets reduces interest rate; missing them increases it.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Greenwashing Risk - manual validation always shown, AI analysis conditionally */}
            <div className="bg-white rounded-2xl border border-gray-100 result-card overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-display font-medium text-gray-900">Greenwashing Risk Assessment</h2>
                    <p className="text-sm text-gray-500 mt-1">Credibility analysis of sustainability claims</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-semibold ${
                      result.greenwashingRisk.level === 'low' ? 'text-verdex-600' :
                      result.greenwashingRisk.level === 'medium' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {result.greenwashingRisk.score}
                      <span className="text-sm font-normal text-gray-400">/100</span>
                    </div>
                    <span className={`text-xs font-medium uppercase tracking-wide ${
                      result.greenwashingRisk.level === 'low' ? 'text-verdex-600' :
                      result.greenwashingRisk.level === 'medium' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {result.greenwashingRisk.level} risk
                    </span>
                  </div>
                </div>

                {(result.greenwashingPenalty ?? 0) > 0 && (
                  <p className="text-xs text-rose-500 mt-3">
                    Score penalty of {result.greenwashingPenalty} points applied to overall assessment
                  </p>
                )}
              </div>

              <div className="px-6 py-5">
                {/* Two column layout for flags and indicators */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Red Flags */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Concerns ({result.greenwashingRisk.redFlags.length})
                      </span>
                    </div>

                    {result.greenwashingRisk.redFlags.length > 0 ? (
                      <div className="space-y-2">
                        {result.greenwashingRisk.redFlags.map((flag, i) => (
                          <div key={i} className="border-l-2 border-rose-300 pl-3 py-1.5">
                            <p className="text-sm text-gray-700">{flag.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{flag.recommendation}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No red flags identified</div>
                    )}
                  </div>

                  {/* Positive Indicators */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-verdex-400" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Positive Signals ({result.greenwashingRisk.positiveIndicators.length})
                      </span>
                    </div>

                    {result.greenwashingRisk.positiveIndicators.length > 0 ? (
                      <div className="space-y-2">
                        {result.greenwashingRisk.positiveIndicators.map((indicator, i) => (
                          <div key={i} className="flex items-start gap-2 py-1.5">
                            <span className="w-4 h-4 rounded-full bg-verdex-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-verdex-500" />
                            </span>
                            <span className="text-sm text-gray-700">{indicator}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-400 italic">No positive indicators identified</div>
                    )}
                  </div>
                </div>

                {/* Recommendations if any */}
                {result.greenwashingRisk.recommendations && result.greenwashingRisk.recommendations.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Recommendations</span>
                    </div>
                    <div className="space-y-2">
                      {result.greenwashingRisk.recommendations.map((rec, i) => (
                        <p key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-gray-300 mt-1">—</span>
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Greenwashing Analysis Breakdown - conditionally shown based on feature flag */}
                {SHOW_AI_GREENWASH_SECTION && result.greenwashingRisk.aiEvaluationUsed && result.greenwashingRisk.aiBreakdown && (
                  <div className="mt-6 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">AI Analysis Breakdown</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                          {result.greenwashingRisk.aiScore}/100
                        </span>
                        <span className="text-gray-400">
                          {result.greenwashingRisk.aiConfidence}% confidence
                        </span>
                      </div>
                    </div>

                    {result.greenwashingRisk.aiSummary && (
                      <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                        {result.greenwashingRisk.aiSummary}
                      </p>
                    )}

                    <div className="space-y-4">
                      {result.greenwashingRisk.aiBreakdown.map((component, idx) => (
                        <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                          <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-gray-900">{component.componentName}</span>
                              <span className="text-xs text-gray-400">({component.confidence}% conf.)</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    component.score >= 20 ? 'bg-verdex-500' :
                                    component.score >= 15 ? 'bg-amber-500' : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${(component.score / component.maxScore) * 100}%` }}
                                />
                              </div>
                              <span className={`text-sm font-semibold ${
                                component.score >= 20 ? 'text-verdex-600' :
                                component.score >= 15 ? 'text-amber-600' : 'text-rose-600'
                              }`}>
                                {component.score}/{component.maxScore}
                              </span>
                            </div>
                          </div>

                          <div className="px-4 py-3 space-y-2">
                            {component.findings.map((finding, fIdx) => (
                              <div key={fIdx} className="flex items-start gap-3 py-1.5">
                                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                                  finding.status === 'strong' ? 'bg-verdex-500' :
                                  finding.status === 'adequate' ? 'bg-amber-500' :
                                  finding.status === 'weak' ? 'bg-orange-500' : 'bg-rose-500'
                                }`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-700">{finding.criterion}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                      finding.status === 'strong' ? 'bg-verdex-50 text-verdex-700' :
                                      finding.status === 'adequate' ? 'bg-amber-50 text-amber-700' :
                                      finding.status === 'weak' ? 'bg-orange-50 text-orange-700' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                      {finding.points}/{finding.maxPoints}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600 mt-0.5">{finding.evidence}</p>
                                  {finding.concern && (
                                    <p className="text-xs text-rose-600 mt-0.5 italic">{finding.concern}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {component.recommendations.length > 0 && (
                            <div className="px-4 py-2 bg-blue-50/50 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">Recommendations:</p>
                              <ul className="text-xs text-gray-600 space-y-0.5">
                                {component.recommendations.slice(0, 3).map((rec, rIdx) => (
                                  <li key={rIdx} className="flex items-start gap-1.5">
                                    <span className="text-blue-400">→</span>
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* AI Top Concerns & Positive Findings */}
                    {(result.greenwashingRisk.aiTopConcerns?.length || result.greenwashingRisk.aiPositiveFindings?.length) && (
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        {result.greenwashingRisk.aiTopConcerns && result.greenwashingRisk.aiTopConcerns.length > 0 && (
                          <div className="p-3 bg-rose-50/50 rounded-lg">
                            <p className="text-xs font-medium text-rose-700 mb-2">Top AI Concerns</p>
                            <ul className="text-xs text-rose-600 space-y-1">
                              {result.greenwashingRisk.aiTopConcerns.map((concern, i) => (
                                <li key={i}>• {concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {result.greenwashingRisk.aiPositiveFindings && result.greenwashingRisk.aiPositiveFindings.length > 0 && (
                          <div className="p-3 bg-verdex-50/50 rounded-lg">
                            <p className="text-xs font-medium text-verdex-700 mb-2">AI Positive Findings</p>
                            <ul className="text-xs text-verdex-600 space-y-1">
                              {result.greenwashingRisk.aiPositiveFindings.map((finding, i) => (
                                <li key={i}>• {finding}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* DFI Matches */}
            <div className="bg-white rounded-2xl border border-gray-100 result-card overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-display font-medium text-gray-900">DFI Matches</h2>
                <p className="text-sm text-gray-500 mt-1">Development finance institutions aligned with your project</p>
              </div>

              <div className="divide-y divide-gray-100">
                {result.dfiMatches.map((dfi, idx) => (
                  <div key={idx} className={`px-6 py-4 ${idx % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <div className="min-w-0">
                        <h3 className="font-medium text-gray-900">{dfi.name}</h3>
                        <p className="text-xs text-gray-500 truncate">{dfi.fullName}</p>
                      </div>
                      <span className="text-sm font-semibold text-verdex-600 flex-shrink-0">
                        {dfi.matchScore}%
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-500">
                      <span>{dfi.recommendedRole.replace('_', ' ')}</span>
                      {dfi.estimatedSize && dfi.estimatedSize.min > 0 && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span>
                            {dfi.estimatedSize.max > 0 && dfi.estimatedSize.max >= dfi.estimatedSize.min
                              ? `$${(dfi.estimatedSize.min / 1_000_000).toFixed(0)}M – $${(dfi.estimatedSize.max / 1_000_000).toFixed(0)}M`
                              : `Min $${(dfi.estimatedSize.min / 1_000_000).toFixed(0)}M`}
                          </span>
                        </>
                      )}
                    </div>

                    <p className="text-xs text-gray-600">{dfi.matchReasons.join(' · ')}</p>

                    {dfi.climateTarget && (
                      <p className="text-xs text-verdex-600 mt-1">{dfi.climateTarget}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-8">
            {/* Next Steps */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900">Next Steps</h2>
              </div>
              <div className="p-5">
                <ol className="space-y-2.5">
                  {result.nextSteps.map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-sm">
                      <span className="text-verdex-600 font-medium">{i + 1}.</span>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Relevant Clauses */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-900">Relevant Clauses</h2>
                <Link
                  href={`/search?q=${encodeURIComponent(clauseSearchQuery)}`}
                  className="text-xs text-gray-500 hover:text-verdex-600 transition-colors"
                  target='_blank'
                >
                  View all
                </Link>
              </div>

              <div className="px-4 py-3">
                {clausesLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="w-4 h-4 border-2 border-verdex-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : relevantClauses.length > 0 ? (
                  <div className="divide-y divide-gray-50 px-1">
                    {relevantClauses.slice(0, 6).map((clause) => (
                      <div
                        key={clause.id}
                        className="py-2.5 cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
                        onClick={() => { setSelectedClauseModal(clause); setOriginalClauseExpanded(false); }}
                      >
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                          <span className="text-xs font-medium text-gray-700 truncate">
                            {clause.metadata.clauseType?.replace(/_/g, ' ') || 'Clause'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {(clause.score * 100).toFixed(0)}%
                          </span>
                        </div>
                        {clause.adviceLoading ? (
                          <span className="text-[11px] text-gray-400">Analyzing...</span>
                        ) : (
                          <p className="text-[11px] text-gray-500 line-clamp-1">
                            {clause.advice ? clause.advice.relevanceSummary : `${clause.content.substring(0, 80)}...`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center py-4">No relevant clauses found</p>
                )}

                <Link
                  href={`/search?q=${encodeURIComponent(clauseSearchQuery)}`}
                  className="mt-3 block w-full text-center text-xs font-medium py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                  target='_blank'
                >
                  Search All Clauses
                </Link>
              </div>
            </div>

            {/* Country Info */}
            {result.countryInfo && (
              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <h2 className="text-sm font-semibold text-gray-900">Country Context</h2>
                </div>
                <div className="px-4 py-3">
                  <dl className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Region</dt>
                      <dd className="font-medium text-gray-700">{result.countryInfo.region.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Legal System</dt>
                      <dd className="font-medium text-gray-700">{result.countryInfo.legalSystem.replace('_', ' ')}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Currency</dt>
                      <dd className="font-medium text-gray-700">{result.countryInfo.currency}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Sovereign Rating</dt>
                      <dd className="font-medium text-gray-700">{result.countryInfo.sovereignRating || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-400">Political Risk</dt>
                      <dd className={`font-medium ${result.countryInfo.politicalRisk === 'low' ? 'text-verdex-600' :
                        result.countryInfo.politicalRisk === 'medium' ? 'text-amber-600' : 'text-rose-600'
                        }`}>
                        {result.countryInfo.politicalRisk}
                      </dd>
                    </div>
                  </dl>
                  {result.countryInfo.ndcTarget && (
                    <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                      <dt className="text-[10px] text-gray-400 mb-0.5">NDC Target</dt>
                      <dd className="text-[11px] text-gray-500">{result.countryInfo.ndcTarget}</dd>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Assessment Info */}
            <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5">
              <p className="text-xs text-gray-500 mb-1">
                Generated {new Date(result.assessmentDate).toLocaleDateString()}
              </p>
              <p className="text-[10px] text-gray-400 leading-relaxed">
                This assessment is based on LMA Transition Loan Principles and does not constitute financial advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clause Modal */}
      {selectedClauseModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedClauseModal(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <h3 className="font-medium text-gray-900 text-sm">Clause Analysis</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  {selectedClauseModal.metadata.clauseType && (
                    <span>{selectedClauseModal.metadata.clauseType.replace(/_/g, ' ')}</span>
                  )}
                  {selectedClauseModal.metadata.documentType && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span>{selectedClauseModal.metadata.documentType.replace(/_/g, ' ')}</span>
                    </>
                  )}
                  {selectedClauseModal.advice && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className={`font-medium ${selectedClauseModal.advice.relevanceScore >= 7 ? 'text-verdex-600' :
                        selectedClauseModal.advice.relevanceScore >= 4 ? 'text-amber-600' :
                          'text-gray-400'
                        }`}>
                        {selectedClauseModal.advice.relevanceScore}/10
                      </span>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedClauseModal(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-5 py-4 overflow-auto max-h-[60vh] space-y-4">
              {/* Loading State */}
              {selectedClauseModal.adviceLoading && (
                <div className="flex items-center gap-3 text-gray-500">
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-verdex-600 rounded-full animate-spin" />
                  <span className="text-sm">Analyzing...</span>
                </div>
              )}

              {selectedClauseModal.advice && (
                <div className="space-y-4">
                  {/* Contextualized Example Clause */}
                  {selectedClauseModal.advice.contextualizedExample && (
                    <div className="group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wide">Adapted for your project</span>
                        <button
                          onClick={() => navigator.clipboard.writeText(selectedClauseModal.advice?.contextualizedExample || '')}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all text-xs flex items-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy
                        </button>
                      </div>
                      <div className="bg-verdex-50/50 rounded-lg p-4 border border-verdex-100">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {selectedClauseModal.advice.contextualizedExample}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis Summary */}
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedClauseModal.advice.relevanceSummary}</p>

                  {/* Two Column Grid: How to Apply & When to Use */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">How to Apply</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedClauseModal.advice.howToApply}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">When to Use</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedClauseModal.advice.whenToUse}</p>
                    </div>
                  </div>

                  {/* Key Considerations */}
                  {selectedClauseModal.advice.keyConsiderations?.length > 0 && (
                    <div>
                      <h4 className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-2">Key Considerations</h4>
                      <ul className="space-y-1.5">
                        {selectedClauseModal.advice.keyConsiderations.map((consideration, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="text-gray-300 select-none text-xs mt-0.5">{idx + 1}.</span>
                            <span className="leading-relaxed">{consideration}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Modifications */}
                  {selectedClauseModal.advice.suggestedModifications && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                      <h4 className="text-[11px] font-medium text-amber-600 uppercase tracking-wide mb-1.5">Suggested Modification</h4>
                      <p className="text-sm text-gray-700 leading-relaxed">{selectedClauseModal.advice.suggestedModifications}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Original Clause Content - Collapsible */}
              <div className="pt-3 border-t border-gray-100">
                <button
                  onClick={() => setOriginalClauseExpanded(!originalClauseExpanded)}
                  className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${originalClauseExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-xs font-medium">Original Template</span>
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${originalClauseExpanded ? 'max-h-[300px] mt-3' : 'max-h-0'}`}>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed max-h-[200px] overflow-auto">
                      {formatClauseContent(selectedClauseModal.content)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedClauseModal.metadata.source && (
                  <span className="text-xs text-gray-400">Source: {selectedClauseModal.metadata.source}</span>
                )}
                {modalDocumentUrl && (
                  <a
                    href={modalDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-verdex-600 hover:text-verdex-700 font-medium transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View Official Document
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Draft Modal */}
      {draftModalOpen && generatedDraft && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setDraftModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-4">
                <h3 className="font-medium text-gray-900 text-sm">Generated Draft</h3>
                {draftMetadata && (
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{draftMetadata.targetDFI}</span>
                    <span className="text-gray-300">·</span>
                    <span className="capitalize">{draftMetadata.sector}</span>
                    <span className="text-gray-300">·</span>
                    <span>{new Date(draftMetadata.generatedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setDraftModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-auto px-5 py-4">
              <div className="max-w-none">
                {/* Render markdown content with table support */}
                {(() => {
                  const lines = generatedDraft.split('\n');
                  const elements: React.ReactNode[] = [];
                  let i = 0;

                  while (i < lines.length) {
                    const trimmed = lines[i].trim();

                    // Check if this is a table start
                    if (trimmed.startsWith('|') && !trimmed.match(/^\|[\s\-:|]+\|$/)) {
                      // Parse table
                      const tableLines: string[] = [];
                      while (i < lines.length && lines[i].trim().startsWith('|')) {
                        tableLines.push(lines[i].trim());
                        i++;
                      }

                      // Parse into headers and rows
                      const headers: string[] = [];
                      const rows: string[][] = [];
                      let tableIdx = 0;

                      // Header row
                      if (tableLines[tableIdx]) {
                        const headerCells = tableLines[tableIdx].split('|').filter(c => c.trim()).map(c => c.trim().replace(/\*\*/g, ''));
                        headers.push(...headerCells);
                        tableIdx++;
                      }

                      // Skip separator
                      if (tableLines[tableIdx]?.match(/^\|[\s\-:|]+\|$/)) {
                        tableIdx++;
                      }

                      // Data rows
                      while (tableIdx < tableLines.length) {
                        const rowLine = tableLines[tableIdx];
                        if (!rowLine.match(/^\|[\s\-:|]+\|$/)) {
                          const cells = rowLine.split('|').filter(c => c.trim()).map(c => c.trim().replace(/\*\*/g, ''));
                          if (cells.length > 0) rows.push(cells);
                        }
                        tableIdx++;
                      }

                      if (headers.length > 0 && rows.length > 0) {
                        elements.push(
                          <div key={`table-${elements.length}`} className="my-4 overflow-x-auto">
                            <table className="min-w-full">
                              <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                  {headers.map((h, hi) => (
                                    <th key={hi} className="px-3 py-2 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wide">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {rows.map((row, ri) => (
                                  <tr key={ri} className={ri % 2 === 1 ? 'bg-gray-50' : ''}>
                                    {row.map((cell, ci) => (
                                      <td key={ci} className="px-3 py-2 text-xs text-gray-700">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      continue;
                    }

                    // Regular line processing
                    if (!trimmed) {
                      elements.push(<div key={`line-${i}`} className="h-2" />);
                    } else if (trimmed.startsWith('### ')) {
                      elements.push(
                        <h3 key={`line-${i}`} className="text-xs font-medium text-gray-500 uppercase tracking-wide mt-4 mb-2">
                          {trimmed.replace('### ', '').replace(/\*\*/g, '')}
                        </h3>
                      );
                    } else if (trimmed.startsWith('## ')) {
                      elements.push(
                        <h2 key={`line-${i}`} className="text-sm font-semibold text-gray-800 mt-5 mb-2 pb-2 border-b border-gray-100">
                          {trimmed.replace('## ', '').replace(/\*\*/g, '')}
                        </h2>
                      );
                    } else if (trimmed.startsWith('# ')) {
                      elements.push(
                        <h1 key={`line-${i}`} className="text-sm font-medium text-gray-900 mb-1">
                          {trimmed.replace('# ', '').replace(/\*\*/g, '')}
                        </h1>
                      );
                    } else if (trimmed.startsWith('---')) {
                      elements.push(<hr key={`line-${i}`} className="my-4 border-gray-100" />);
                    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      const content = trimmed.substring(2);
                      elements.push(
                        <div key={`line-${i}`} className="flex items-start gap-2 my-0.5">
                          <span className="text-gray-300 select-none text-xs mt-0.5">•</span>
                          <span className="text-xs text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{
                            __html: content.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-gray-900">$1</strong>')
                          }} />
                        </div>
                      );
                    } else if (/^\d+\.\s/.test(trimmed)) {
                      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
                      if (match) {
                        elements.push(
                          <div key={`line-${i}`} className="flex items-start gap-2 my-0.5">
                            <span className="text-gray-300 select-none text-xs mt-0.5">{match[1]}.</span>
                            <span className="text-xs text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{
                              __html: match[2].replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-gray-900">$1</strong>')
                            }} />
                          </div>
                        );
                      }
                    } else {
                      elements.push(
                        <p key={`line-${i}`} className="text-xs text-gray-700 leading-relaxed my-0.5" dangerouslySetInnerHTML={{
                          __html: trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-gray-900">$1</strong>')
                        }} />
                      );
                    }
                    i++;
                  }

                  return elements;
                })()}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Review with legal counsel before use</p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedDraft);
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Copy
                  </button>
                  <button
                    onClick={exportDraftToPDF}
                    className="bg-verdex-600 hover:bg-verdex-700 text-white text-sm font-medium py-2 px-5 rounded-lg transition-colors"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
