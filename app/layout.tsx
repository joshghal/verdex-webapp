import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verdex.app';

export const metadata: Metadata = {
  // Basic metadata
  title: {
    default: 'Verdex | AI-Powered Green Finance Platform for Africa',
    template: '%s | Verdex',
  },
  description: 'Verdex helps African transition projects become bankable. AI-powered LMA compliance assessment, DFI matching, KPI recommendations, and sustainability-linked loan documentation.',
  keywords: [
    'transition finance Africa',
    'green loan assessment',
    'LMA compliance',
    'DFI matching',
    'sustainable finance platform',
    'climate finance Africa',
    'sustainability-linked loans',
    'ESG financing',
    'African development finance',
    'green bond Africa',
    'carbon reduction financing',
    'renewable energy finance Africa',
    'IFC funding',
    'AfDB projects',
    'blended finance',
    'KPI sustainability',
    'SPT targets',
    'net zero transition',
  ],
  authors: [{ name: 'Verdex', url: siteUrl }],
  creator: 'Verdex',
  publisher: 'Verdex',

  // Robots & indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph (Facebook, LinkedIn)
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Verdex',
    title: 'Verdex | AI-Powered Green Finance Platform for Africa',
    description: 'Make your African transition project bankable. AI-powered LMA compliance, DFI matching, and sustainability-linked loan documentation.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Verdex - Verified Green Finance for Africa',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Verdex | AI-Powered Green Finance Platform for Africa',
    description: 'Make your African transition project bankable. AI-powered LMA compliance, DFI matching, and sustainability-linked loan documentation.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@verdex_finance',
  },

  // Icons & PWA
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',

  // Verification (add your actual verification codes)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },

  // Alternates & canonical
  alternates: {
    canonical: siteUrl,
  },

  // Category
  category: 'Finance',

  // Other
  applicationName: 'Verdex',
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#047857' },
    { media: '(prefers-color-scheme: dark)', color: '#065f46' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// JSON-LD Structured Data
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Verdex',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
        width: 512,
        height: 512,
      },
      description: 'AI-powered green finance platform for African transition projects',
      sameAs: [
        'https://twitter.com/verdex_finance',
        'https://linkedin.com/company/verdex',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Verdex',
      publisher: { '@id': `${siteUrl}/#organization` },
      description: 'AI-powered LMA compliance assessment and DFI matching for African transition finance',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${siteUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#app`,
      name: 'Verdex',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Assess transition finance projects against LMA standards, match with DFIs, and generate compliant documentation.',
      featureList: [
        'LMA Transition Loan Compliance Assessment',
        'DFI Matching (IFC, AfDB, DEG, FMO)',
        'AI-Generated KPI Recommendations',
        'Sustainability Performance Targets',
        'Greenwashing Risk Detection',
        'LMA Clause Search Database',
        'PDF Report Export',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        {/* Floating Navbar */}
        <Navbar />

        <main>{children}</main>

        {/* Premium Footer */}
        <footer className="bg-verdex-950 text-white mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Brand Column */}
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-verdex-400 to-verdex-600 rounded-xl flex items-center justify-center">
                    <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                      <path d="M10 10 Q14 10 18 18 L28 44" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"/>
                      <path d="M46 10 Q42 10 38 18 L28 44" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5"/>
                      <ellipse cx="28" cy="44" rx="4" ry="3" fill="white"/>
                    </svg>
                  </div>
                  <span className="font-display font-medium text-xl">Verdex</span>
                </div>
                <p className="text-verdex-200 text-sm max-w-md">
                  Making African transition projects bankable through AI-powered LMA compliance assessment and DFI matching.
                </p>
              </div>

              {/* Platform Links */}
              <div>
                <h4 className="font-semibold text-verdex-100 mb-4">Platform</h4>
                <ul className="space-y-2 text-sm">
                  <li><a href="/assess" className="text-verdex-300 hover:text-white transition-colors">Assess Project</a></li>
                  <li><a href="/search" className="text-verdex-300 hover:text-white transition-colors">Search Clauses</a></li>
                </ul>
              </div>

              {/* Standards */}
              <div>
                <h4 className="font-semibold text-verdex-100 mb-4">Standards</h4>
                <ul className="space-y-2 text-sm">
                  <li><span className="text-verdex-300">LMA Transition Loan Principles</span></li>
                  <li><span className="text-verdex-300">Green Loan Principles</span></li>
                  <li><span className="text-verdex-300">Science Based Targets</span></li>
                </ul>
              </div>
            </div>

            <div className="border-t border-verdex-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-verdex-400 text-sm">
                &copy; {new Date().getFullYear()} Verdex. Verified Green Finance for Africa.
              </p>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <span className="text-verdex-500 text-xs">Built for the LMA Edge Hackathon</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
