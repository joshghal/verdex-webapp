import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-50 to-emerald-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Make African Transition Projects{' '}
              <span className="gradient-text">Bankable</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              AI-powered platform for assessing transition finance projects against LMA standards,
              matching with Development Finance Institutions, and generating compliant documentation.
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/assess" className="btn-primary text-lg px-8 py-3">
                Assess Your Project
              </Link>
              <Link href="/search" className="btn-secondary text-lg px-8 py-3">
                Search LMA Clauses
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📋"
              title="1. Input Project Details"
              description="Enter your project information including sector, country, emissions data, and transition strategy."
            />
            <FeatureCard
              icon="🔍"
              title="2. Get AI Assessment"
              description="Our AI analyzes your project against LMA Transition Loan Principles and identifies gaps."
            />
            <FeatureCard
              icon="🏦"
              title="3. Match with DFIs"
              description="Get matched with suitable Development Finance Institutions and recommended financing structures."
            />
          </div>
        </div>
      </section>

      {/* Capabilities Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Platform Capabilities
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CapabilityCard
              title="LMA Compliance Scoring"
              description="Automated assessment against all 5 LMA Transition Loan Principles components"
              color="green"
            />
            <CapabilityCard
              title="Greenwashing Detection"
              description="AI-powered identification of red flags and weak transition commitments"
              color="yellow"
            />
            <CapabilityCard
              title="DFI Matching"
              description="Match with IFC, AfDB, FMO, DEG, BII, Proparco, and DFC based on eligibility"
              color="blue"
            />
            <CapabilityCard
              title="KPI Generation"
              description="Generate science-based KPIs and sustainability performance targets"
              color="purple"
            />
            <CapabilityCard
              title="Clause Search (RAG)"
              description="Search 2000+ LMA documents for relevant clause templates"
              color="indigo"
            />
            <CapabilityCard
              title="Paris Alignment Check"
              description="Verify alignment with Paris Agreement and country NDC targets"
              color="teal"
            />
          </div>
        </div>
      </section>

      {/* Supported Countries */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Supported Markets
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Kenya', 'Nigeria', 'South Africa', 'Tanzania', 'Ghana', 'Egypt', 'Morocco'].map((country) => (
              <span
                key={country}
                className="px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 text-gray-700 font-medium"
              >
                {country}
              </span>
            ))}
          </div>
          <p className="text-center text-gray-500 mt-4 text-sm">
            Full country profiles with NDC targets, regulatory frameworks, and DFI eligibility
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make Your Project Bankable?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Get a comprehensive assessment in minutes, not weeks.
          </p>
          <Link
            href="/assess"
            className="bg-white text-green-600 font-semibold px-8 py-3 rounded-lg hover:bg-green-50 transition-colors"
          >
            Start Free Assessment
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="card card-hover text-center">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function CapabilityCard({ title, description, color }: { title: string; description: string; color: string }) {
  const colorClasses: Record<string, string> = {
    green: 'border-l-green-500',
    yellow: 'border-l-yellow-500',
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    indigo: 'border-l-indigo-500',
    teal: 'border-l-teal-500',
  };

  return (
    <div className={`card border-l-4 ${colorClasses[color]}`}>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}
