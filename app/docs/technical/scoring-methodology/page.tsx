import DocPage, { InfoBox, DataTable, CodeBlock } from '@/components/docs/DocPage';

export const metadata = {
  title: 'Scoring Methodology | Verdex Docs',
  description: 'Detailed explanation of how Verdex calculates project scores and eligibility',
};

export default function ScoringMethodologyPage() {
  return (
    <DocPage
      title="Scoring Methodology"
      description="Detailed breakdown of how Verdex calculates LMA compliance scores, greenwashing penalties, and final eligibility determinations."
      breadcrumbs={[{ label: 'Technical' }, { label: 'Scoring Methodology' }]}
      previousPage={{ title: 'API Reference', href: '/docs/technical/api-reference' }}
      nextPage={{ title: 'Market Opportunity', href: '/docs/business/market-opportunity' }}
      tableOfContents={[
        { id: 'overview', title: 'Score Overview', level: 2 },
        { id: 'lma-scoring', title: 'LMA Component Scoring', level: 2 },
        { id: 'greenwashing', title: 'Greenwashing Penalty', level: 2 },
        { id: 'dnsh', title: 'DNSH Score', level: 2 },
        { id: 'final-score', title: 'Final Score Calculation', level: 2 },
        { id: 'eligibility', title: 'Eligibility Thresholds', level: 2 },
        { id: 'examples', title: 'Scoring Examples', level: 2 },
      ]}
    >
      <h2 id="overview" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Score Overview
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Verdex calculates a project&apos;s transition loan eligibility using two independent scores: <strong>LMA Transition Score</strong> (compliance with LMA 5 Core Components minus greenwashing penalties) and <strong>DNSH Score</strong> (EU Taxonomy environmental harm screening).
      </p>

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-100">
        <h3 className="font-semibold text-gray-900 mb-4 text-center">Two Independent Scores</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-white text-center">
            <div className="text-sm text-gray-500 mb-1">LMA Transition Score</div>
            <code className="text-lg font-mono text-verdex-700">
              LMA Base − Greenwashing Penalty
            </code>
            <div className="mt-2 text-xs text-gray-500">0-100 (affects eligibility)</div>
          </div>
          <div className="p-4 rounded-xl bg-white text-center">
            <div className="text-sm text-gray-500 mb-1">DNSH Score</div>
            <code className="text-lg font-mono text-amber-700">
              EU Taxonomy Article 17
            </code>
            <div className="mt-2 text-xs text-gray-500">0-100 (displayed separately)</div>
          </div>
        </div>
      </div>

      <h2 id="lma-scoring" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        LMA Component Scoring
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Projects are scored against the <strong>5 Core Components</strong> from the LMA Transition Loan Guide (October 2025):
      </p>

      <DataTable
        headers={['Component', 'Max Score', 'Sub-Criteria', 'Weight Distribution']}
        rows={[
          [<span key="1" className="font-semibold text-verdex-700">1. Transition Strategy</span>, '20', '3 criteria', 'Published plan (8) + Paris aligned (7) + Entity-wide (5)'],
          [<span key="2" className="font-semibold text-verdex-700">2. Use of Proceeds</span>, '20', '3 criteria', 'Eligible activities (10) + Quantifiable (5) + No lock-in (5)'],
          [<span key="3" className="font-semibold text-verdex-700">3. Project Selection</span>, '20', '3 criteria', 'Strategy aligned (10) + Evaluation (5) + Sector fit (5)'],
          [<span key="4" className="font-semibold text-verdex-700">4. Management of Proceeds</span>, '20', '2 criteria', 'Allocation tracking (10) + Documentation (10)'],
          [<span key="5" className="font-semibold text-verdex-700">5. Reporting</span>, '20', '3 criteria', 'KPI framework (8) + Disclosure (7) + Verification (5)'],
        ]}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Component 1: Transition Strategy (20 pts)</h3>

      <CodeBlock
        language="typescript"
        code={`const transitionStrategyScoring = {
  // Does the entity have a published transition plan?
  hasPublishedPlan: {
    maxPoints: 8,
    criteria: [
      { condition: 'Publicly disclosed plan', points: 8 },
      { condition: 'Internal plan only', points: 4 },
      { condition: 'No documented plan', points: 0 }
    ]
  },

  // Is the plan aligned with Paris Agreement?
  parisAlignment: {
    maxPoints: 7,
    criteria: [
      { condition: '1.5°C aligned with SBTi', points: 7 },
      { condition: 'Well-below 2°C', points: 5 },
      { condition: 'NDC aligned only', points: 3 },
      { condition: 'No alignment stated', points: 0 }
    ]
  },

  // Does it cover the entire entity?
  entityWideScope: {
    maxPoints: 5,
    criteria: [
      { condition: 'Entity-wide scope', points: 5 },
      { condition: 'Division/project only', points: 2 },
      { condition: 'Unclear scope', points: 0 }
    ]
  }
};`}
      />

      <h2 id="greenwashing" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Greenwashing Penalty Calculation
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        The greenwashing penalty reduces the LMA score based on detected red flags. When AI evaluation is enabled, it uses a <strong>weighted combination</strong> of two methods:
      </p>

      <div className="my-6 space-y-4">
        <div className="p-5 rounded-xl bg-verdex-50 border border-verdex-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-xl bg-verdex-500 flex items-center justify-center text-white font-bold text-xl">60%</div>
            <div>
              <div className="font-semibold text-verdex-800">AI Pattern Detection</div>
              <div className="text-sm text-verdex-600">LLM analysis of document text for greenwashing language</div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-16 h-16 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-xl">40%</div>
            <div>
              <div className="font-semibold text-amber-800">Rule-Based Detection</div>
              <div className="text-sm text-amber-600">15 predefined red flag patterns</div>
            </div>
          </div>
        </div>
      </div>

      <InfoBox type="info" title="Rule-Based Fallback">
        When AI evaluation is unavailable, greenwashing penalty is calculated purely from rule-based detection. The risk score is mapped to penalty: ≥70 risk → 20 pts, ≥40 → 10 pts, ≥20 → 5 pts, &lt;20 → 0 pts.
      </InfoBox>

      <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">Red Flag Severity Weights</h3>

      <DataTable
        headers={['Severity', 'Point Deduction', 'Example Red Flags']}
        rows={[
          [<span key="1" className="px-2 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-semibold">HIGH</span>, '25 points each', 'Missing baseline emissions, fossil fuel lock-in, no published plan'],
          [<span key="2" className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">MEDIUM</span>, '15 points each', 'No verification, vague timeline, missing financials'],
          [<span key="3" className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-semibold">LOW</span>, '5 points each', 'Missing Scope 3, generic language, unclear governance'],
        ]}
      />

      <CodeBlock
        language="typescript"
        code={`// Greenwashing penalty calculation (DNSH is separate)
// Rule-based risk score → Penalty mapping
function calculatePenaltyFromRiskScore(riskScore: number): number {
  if (riskScore >= 70) return 20;  // High risk
  if (riskScore >= 40) return 10;  // Medium risk
  if (riskScore >= 20) return 5;   // Low-medium risk
  return 0;                        // Low risk
}

// Final LMA Score = LMA Base Score - Greenwashing Penalty
// DNSH Score is displayed separately (not subtracted from LMA)
function calculateFinalLMAScore(
  lmaBaseScore: number,           // 0-100 from 5 components
  greenwashingPenalty: number     // 0-60 from red flags
): number {
  return Math.max(0, lmaBaseScore - greenwashingPenalty);
}`}
      />

      <h2 id="dnsh" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        DNSH Score (Independent)
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        The DNSH (Do No Significant Harm) assessment is an <strong>independent score</strong> displayed alongside the LMA Transition Score. It evaluates EU Taxonomy Article 17 compliance across 6 environmental objectives.
      </p>

      <div className="my-6 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-verdex-50/30 border border-verdex-100">
        <h3 className="font-semibold text-gray-900 mb-4">DNSH Score Interpretation</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg bg-white">
            <span className="text-gray-700">DNSH Score 83-100</span>
            <span className="font-semibold text-verdex-600">Fully Compliant</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white">
            <span className="text-gray-700">DNSH Score 70-82</span>
            <span className="font-semibold text-verdex-600">Mostly Compliant</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white">
            <span className="text-gray-700">DNSH Score 50-69</span>
            <span className="font-semibold text-amber-600">Partial Compliance</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white">
            <span className="text-gray-700">DNSH Score 25-49</span>
            <span className="font-semibold text-rose-600">Non-Compliant</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-white">
            <span className="text-gray-700">DNSH Score 0-24</span>
            <span className="font-semibold text-rose-600">Severe Harm Detected</span>
          </div>
        </div>
      </div>

      <InfoBox type="info" title="Two Independent Scores">
        LMA Transition Score and DNSH Score are displayed side-by-side but calculated independently. A project can have high LMA compliance (100/100) but partial DNSH compliance (61/100), indicating strong transition credentials but environmental harm concerns that need addressing.
      </InfoBox>

      <h2 id="final-score" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Final Score Calculation
      </h2>

      <CodeBlock
        language="typescript"
        code={`interface AssessmentScores {
  // LMA Component Scores (0-20 each, 0-100 total)
  lmaBaseScore: number;
  components: {
    transitionStrategy: number;     // 0-20
    useOfProceeds: number;          // 0-20
    projectSelection: number;       // 0-20
    managementOfProceeds: number;   // 0-20
    reporting: number;              // 0-20
  };

  // Greenwashing Assessment
  greenwashingPenalty: number;      // 0-60 points deducted
  greenwashingRisk: 'low' | 'medium' | 'high';

  // DNSH Assessment
  dnshScore: number;                // 0-100
  dnshStatus: 'compliant' | 'partial' | 'non_compliant';

  // Final Score
  overallScore: number;             // lmaBaseScore - greenwashingPenalty
  eligibilityStatus: 'eligible' | 'partial' | 'ineligible';
}

function calculateFinalScore(
  lmaBaseScore: number,
  greenwashingPenalty: number,
  greenwashingRisk: 'low' | 'medium' | 'high'
): { overallScore: number; eligibilityStatus: string } {
  const overallScore = Math.max(0, lmaBaseScore - greenwashingPenalty);

  let eligibilityStatus: string;
  // High greenwashing risk with score >=80 = automatic ineligible
  if (greenwashingRisk === 'high' && overallScore < 80) {
    eligibilityStatus = 'ineligible';
  } else if (overallScore >= 60 && greenwashingRisk !== 'high') {
    eligibilityStatus = 'eligible';
  } else if (overallScore >= 30) {
    eligibilityStatus = 'partial';
  } else {
    eligibilityStatus = 'ineligible';
  }

  return { overallScore, eligibilityStatus };
}`}
      />

      <h2 id="eligibility" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Eligibility Thresholds
      </h2>

      <div className="space-y-4 my-6">
        <div className="flex items-center gap-4 p-5 rounded-xl bg-verdex-50 border border-verdex-200">
          <div className="w-20 h-20 rounded-xl bg-verdex-500 flex items-center justify-center text-white font-bold text-2xl">≥60</div>
          <div>
            <div className="font-semibold text-verdex-800 text-lg">ELIGIBLE</div>
            <div className="text-verdex-600">Meets LMA transition loan criteria. Proceed with DFI discussions.</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-xl bg-amber-50 border border-amber-200">
          <div className="w-20 h-20 rounded-xl bg-amber-500 flex items-center justify-center text-white font-bold text-2xl">30-59</div>
          <div>
            <div className="font-semibold text-amber-800 text-lg">PARTIAL</div>
            <div className="text-amber-600">Conditional eligibility. Address identified gaps before financing.</div>
          </div>
        </div>

        <div className="flex items-center gap-4 p-5 rounded-xl bg-rose-50 border border-rose-200">
          <div className="w-20 h-20 rounded-xl bg-rose-500 flex items-center justify-center text-white font-bold text-2xl">&lt;30</div>
          <div>
            <div className="font-semibold text-rose-800 text-lg">INELIGIBLE</div>
            <div className="text-rose-600">Significant gaps exist. Major remediation required.</div>
          </div>
        </div>
      </div>

      <InfoBox type="warning" title="Automatic Ineligibility">
        Certain projects are automatically marked as <strong>INELIGIBLE</strong> regardless of score:
        <ul className="mt-2 space-y-1">
          <li>&bull; Fossil fuel extraction or production projects</li>
          <li>&bull; Coal-related activities</li>
          <li>&bull; Projects in non-African countries (outside supported 7)</li>
          <li>&bull; Projects with fundamental DNSH incompatibility</li>
        </ul>
      </InfoBox>

      <h2 id="examples" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Scoring Examples
      </h2>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Example 1: Strong Solar Project</h3>

      <div className="my-4 p-4 rounded-xl bg-verdex-50 border border-verdex-200">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-verdex-800 mb-2">LMA Components</div>
            <ul className="space-y-1 text-verdex-700">
              <li>Transition Strategy: 18/20</li>
              <li>Use of Proceeds: 17/20</li>
              <li>Project Selection: 16/20</li>
              <li>Management: 15/20</li>
              <li>Reporting: 14/20</li>
              <li className="font-semibold border-t border-verdex-200 pt-1">LMA Base: 80/100</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-verdex-800 mb-2">Greenwashing</div>
            <ul className="space-y-1 text-verdex-700">
              <li>Penalty: -5 pts</li>
              <li className="font-semibold border-t border-verdex-200 pt-1 mt-2">LMA Score: 75/100</li>
              <li className="text-verdex-600">Status: ELIGIBLE</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-verdex-800 mb-2">DNSH (Separate)</div>
            <ul className="space-y-1 text-verdex-700">
              <li>Score: 85/100</li>
              <li className="text-verdex-600">Status: Compliant</li>
            </ul>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">Example 2: Project with Mixed Results</h3>

      <div className="my-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-semibold text-amber-800 mb-2">LMA Components</div>
            <ul className="space-y-1 text-amber-700">
              <li>Transition Strategy: 20/20</li>
              <li>Use of Proceeds: 20/20</li>
              <li>Project Selection: 20/20</li>
              <li>Management: 20/20</li>
              <li>Reporting: 20/20</li>
              <li className="font-semibold border-t border-amber-200 pt-1">LMA Base: 100/100</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-amber-800 mb-2">Greenwashing</div>
            <ul className="space-y-1 text-amber-700">
              <li>Penalty: 0 pts</li>
              <li className="font-semibold border-t border-amber-200 pt-1 mt-2">LMA Score: 100/100</li>
              <li className="text-verdex-600">Status: ELIGIBLE</li>
            </ul>
          </div>
          <div>
            <div className="font-semibold text-amber-800 mb-2">DNSH (Separate)</div>
            <ul className="space-y-1 text-amber-700">
              <li>Score: 61/100</li>
              <li className="text-amber-600">Status: Partial</li>
              <li className="text-xs mt-1">Environmental concerns need addressing</li>
            </ul>
          </div>
        </div>
      </div>

      <InfoBox type="tip" title="Improving Your Score">
        The most impactful improvements:
        <ul className="mt-2 space-y-1">
          <li>&bull; <strong>+8 pts:</strong> Publish a transition strategy document</li>
          <li>&bull; <strong>+7 pts:</strong> Align with Paris Agreement 1.5°C pathway</li>
          <li>&bull; <strong>+5 pts:</strong> Commit to third-party verification</li>
          <li>&bull; <strong>-10 pts avoided:</strong> Include baseline emissions data</li>
        </ul>
      </InfoBox>

    </DocPage>
  );
}
