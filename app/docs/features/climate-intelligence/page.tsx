import DocPage, { InfoBox, DataTable, CodeBlock } from '@/components/docs/DocPage';
import { Thermometer, CloudRain, Sun, Calendar, MapPin } from 'lucide-react';

export const metadata = {
  title: 'Climate Intelligence | Verdex Docs',
  description: 'Location-specific climate risk assessment and resilience profiling for African projects',
};

export default function ClimateIntelligencePage() {
  return (
    <DocPage
      title="Climate Intelligence & Location Risk"
      description="Real-time climate data integration providing location-specific risk assessment and resilience profiling for project sites."
      breadcrumbs={[{ label: 'Features' }, { label: 'Climate Intelligence' }]}
      previousPage={{ title: 'DNSH Assessment', href: '/docs/features/dnsh-assessment' }}
      nextPage={{ title: 'KPI Generator', href: '/docs/features/kpi-generator' }}
      tableOfContents={[
        { id: 'overview', title: 'Overview', level: 2 },
        { id: 'data-sources', title: 'Data Sources', level: 2 },
        { id: 'historical-data', title: 'Historical Climate Data', level: 2 },
        { id: 'projections', title: 'Climate Projections', level: 2 },
        { id: 'site-intelligence', title: 'Site Intelligence', level: 2 },
        { id: 'key-insights', title: 'AI-Generated Insights', level: 2 },
        { id: 'api', title: 'API Integration', level: 2 },
      ]}
    >
      <h2 id="overview" className="text-2xl font-display font-semibold text-gray-900 mt-8 mb-4">
        Overview
      </h2>

      <p className="text-gray-700 leading-relaxed mb-6">
        Verdex integrates real-time climate data to assess location-specific risks and opportunities for project sites. This enables developers to demonstrate <strong>climate resilience</strong> to DFIs and positions projects for TCFD-aligned climate disclosure.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
        {[
          { icon: <Thermometer className="w-5 h-5" />, value: '10yr', label: 'Historical data' },
          { icon: <CloudRain className="w-5 h-5" />, value: '2050', label: 'Projection horizon' },
          { icon: <MapPin className="w-5 h-5" />, value: '7', label: 'Countries covered' },
          { icon: <Sun className="w-5 h-5" />, value: 'Real-time', label: 'Data updates' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-gradient-to-br from-verdex-50 to-emerald-50 border border-verdex-100 text-center">
            <div className="w-10 h-10 mx-auto rounded-lg bg-verdex-500 flex items-center justify-center text-white mb-2">
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-verdex-700">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="TCFD Alignment">
        Climate intelligence supports Task Force on Climate-related Financial Disclosures (TCFD) requirements for physical risk assessment, helping projects demonstrate climate resilience to investors.
      </InfoBox>

      <h2 id="data-sources" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Data Sources
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Verdex uses <strong>Open-Meteo</strong> APIs for climate data—a free, open-source weather API with global coverage:
      </p>

      <DataTable
        headers={['API', 'Endpoint', 'Data Type', 'Coverage']}
        rows={[
          [<span key="1" className="font-semibold text-verdex-700">Historical Archive</span>, 'api.open-meteo.com/v1/archive', '10-year daily weather data', 'Global'],
          [<span key="2" className="font-semibold text-verdex-700">Climate Projections</span>, 'climate-api.open-meteo.com/v1/climate', 'CMIP6 model projections', 'Global'],
        ]}
      />

      <InfoBox type="tip" title="Why Open-Meteo?">
        Open-Meteo provides free, high-quality climate data without API keys, making Verdex accessible to developers without additional subscription costs.
      </InfoBox>

      <h2 id="historical-data" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Historical Climate Data
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        For each project location, Verdex retrieves 10-year historical averages:
      </p>

      <div className="grid md:grid-cols-2 gap-4 my-6">
        {[
          {
            metric: 'Average Temperature',
            unit: '°C',
            description: 'Mean annual temperature over 10-year period',
            icon: <Thermometer className="w-5 h-5" />,
          },
          {
            metric: 'Annual Precipitation',
            unit: 'mm/year',
            description: 'Total annual rainfall average',
            icon: <CloudRain className="w-5 h-5" />,
          },
          {
            metric: 'Extreme Heat Days',
            unit: 'days/year',
            description: 'Days exceeding 35°C annually',
            icon: <Sun className="w-5 h-5" />,
          },
          {
            metric: 'Dry Season Months',
            unit: 'months',
            description: 'Months with <60mm precipitation',
            icon: <Calendar className="w-5 h-5" />,
          },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-verdex-50 flex items-center justify-center text-verdex-600">
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{item.metric}</div>
                <div className="text-xs text-gray-500">{item.unit}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>

      <h2 id="projections" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Climate Projections (CMIP6)
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Verdex provides future climate projections using CMIP6 SSP scenarios for 2030 and 2050:
      </p>

      <DataTable
        headers={['Scenario', 'Description', 'Temp Rise by 2100', 'Use Case']}
        rows={[
          [<span key="1" className="font-semibold text-verdex-700">SSP1-2.6</span>, 'Sustainable development, low emissions', '+1.8°C', 'Best case planning'],
          [<span key="2" className="font-semibold text-amber-700">SSP2-4.5</span>, 'Middle of the road', '+2.7°C', 'Central planning scenario'],
          [<span key="3" className="font-semibold text-rose-700">SSP5-8.5</span>, 'High emissions, fossil fuel development', '+4.4°C', 'Stress testing'],
        ]}
      />

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-verdex-50/30 border border-verdex-100">
        <h3 className="font-semibold text-gray-900 mb-4">Projection Outputs</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-white">
            <div className="text-sm font-semibold text-gray-900">Temperature Change</div>
            <div className="text-xs text-gray-500">°C above current baseline</div>
          </div>
          <div className="p-3 rounded-lg bg-white">
            <div className="text-sm font-semibold text-gray-900">Precipitation Change</div>
            <div className="text-xs text-gray-500">% change from baseline</div>
          </div>
          <div className="p-3 rounded-lg bg-white">
            <div className="text-sm font-semibold text-gray-900">Extreme Event Frequency</div>
            <div className="text-xs text-gray-500">Multiplier for heat/drought events</div>
          </div>
          <div className="p-3 rounded-lg bg-white">
            <div className="text-sm font-semibold text-gray-900">Drought/Flood Risk</div>
            <div className="text-xs text-gray-500">Relative risk level changes</div>
          </div>
        </div>
      </div>

      <h2 id="site-intelligence" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        Site Intelligence
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Beyond raw data, Verdex generates actionable <strong>site intelligence</strong> tailored to the project sector:
      </p>

      <DataTable
        headers={['Intelligence', 'Description', 'Sectors']}
        rows={[
          [<span key="1" className="font-semibold text-verdex-700">Optimal Operating Months</span>, 'Best months for construction/operations', 'All'],
          [<span key="2" className="font-semibold text-verdex-700">Water Availability</span>, 'Abundant, moderate, or scarce classification', 'All'],
          [<span key="3" className="font-semibold text-verdex-700">Solar Potential</span>, 'kWh/m²/day average irradiance', 'Energy'],
          [<span key="4" className="font-semibold text-verdex-700">Agricultural Suitability</span>, 'Growing season, irrigation needs', 'Agriculture'],
        ]}
      />

      <h2 id="key-insights" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        AI-Generated Key Insights
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        When users view the Climate Profile modal, Verdex generates <strong>AI-powered insights</strong> using the ASI1 Mini model:
      </p>

      <div className="space-y-3 my-6">
        {[
          {
            type: 'Project Context',
            example: 'This 200MW solar project in northern Nigeria faces 112 extreme heat days annually, requiring inverter cooling systems.',
          },
          {
            type: 'Key Risk',
            example: 'Water scarcity during 7-month dry season may impact panel cleaning—budget for water recycling.',
          },
          {
            type: 'Key Opportunity',
            example: 'Solar potential of 5.8 kWh/m²/day is 40% above global average—excellent for utility-scale PV.',
          },
          {
            type: 'Recommendations',
            example: 'Install dust mitigation systems for harmattan season (November-March).',
          },
        ].map((item, idx) => (
          <div key={idx} className="p-4 rounded-xl bg-white border border-gray-100">
            <div className="text-sm font-semibold text-verdex-600 mb-1">{item.type}</div>
            <div className="text-sm text-gray-600 italic">&ldquo;{item.example}&rdquo;</div>
          </div>
        ))}
      </div>

      <InfoBox type="info" title="Lazy Loading">
        AI insights are generated on-demand when users open the Climate Profile modal, not during initial assessment. Results are cached to avoid repeated API calls.
      </InfoBox>

      <h2 id="api" className="text-2xl font-display font-semibold text-gray-900 mt-12 mb-4">
        API Integration
      </h2>

      <p className="text-gray-700 leading-relaxed mb-4">
        Climate intelligence is available via two API endpoints:
      </p>

      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-3">POST /api/location-risk</h3>

      <CodeBlock
        language="typescript"
        code={`// Request
{
  "country": "kenya",
  "sector": "energy",
  "city": "Nairobi"  // Optional, defaults to capital
}

// Response
{
  "coordinates": {
    "latitude": -1.2921,
    "longitude": 36.8219,
    "locationName": "Nairobi, Kenya"
  },
  "historicalData": {
    "averageTemperature": 19.2,
    "annualPrecipitation": 958,
    "extremeHeatDays": 12,
    "drySeasonMonths": [1, 2, 7, 8, 9],
    "droughtRisk": "medium",
    "floodRisk": "medium"
  },
  "projections": [
    {
      "scenario": "SSP2-4.5",
      "year": 2050,
      "temperatureChange": 1.8,
      "precipitationChange": -5
    }
  ],
  "siteIntelligence": {
    "optimalOperatingMonths": [3, 4, 5, 10, 11, 12],
    "waterAvailability": "moderate",
    "solarPotential": 5.4
  },
  "keyInsights": [...],
  "dataSource": "open-meteo"
}`}
      />

      <h3 className="text-lg font-semibold text-gray-900 mt-8 mb-3">POST /api/location-insight</h3>

      <CodeBlock
        language="typescript"
        code={`// Request
{
  "sector": "energy",
  "country": "kenya",
  "locationName": "Nairobi",
  "historicalData": {...},
  "siteIntelligence": {...},
  "projections": [...],
  "projectName": "Nairobi Solar Farm",
  "projectDescription": "50MW utility-scale solar PV"
}

// Response
{
  "success": true,
  "insights": {
    "projectContext": "This solar project benefits from Kenya's equatorial location with consistent 5.4 kWh/m²/day irradiance.",
    "recommendations": [
      { "text": "Install automated panel cleaning for dust management", "priority": "high" },
      { "text": "Consider battery storage for grid stability", "priority": "medium" }
    ],
    "keyRisk": {
      "headline": "Moderate flood risk in April-May",
      "mitigation": "Elevate inverter stations above flood level"
    },
    "opportunity": {
      "headline": "Excellent solar irradiance year-round",
      "detail": "5.4 kWh/m²/day exceeds global average by 25%"
    }
  },
  "provider": "asi1"
}`}
      />

      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-verdex-50 via-white to-emerald-50 border border-verdex-200">
        <h3 className="font-display font-semibold text-verdex-800 mb-3">Resilience Framing, Not Risk Labeling</h3>
        <p className="text-gray-700 leading-relaxed">
          Verdex presents climate data as <strong>&ldquo;Climate Resilience Profile&rdquo;</strong>—not &ldquo;Climate Risk Assessment.&rdquo; This positive framing emphasizes that projects are <strong>designed for African climate conditions</strong>, demonstrating to DFIs that developers have proactively addressed physical risks.
        </p>
      </div>

    </DocPage>
  );
}
