import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verdex.app';

export const metadata: Metadata = {
  title: 'Assessment Results',
  description: 'View your LMA transition loan compliance assessment results, DFI matches, KPI recommendations, SPT targets, and greenwashing risk analysis.',
  keywords: [
    'LMA assessment results',
    'transition loan score',
    'DFI matching results',
    'KPI recommendations',
    'SPT targets',
    'greenwashing risk assessment',
    'green finance report',
  ],
  openGraph: {
    title: 'Assessment Results | Verdex',
    description: 'View your LMA transition loan compliance assessment results with DFI matches and recommendations.',
    url: `${siteUrl}/results`,
    images: [
      {
        url: `${siteUrl}/og-results.png`,
        width: 1200,
        height: 630,
        alt: 'Verdex Assessment Results',
      },
    ],
  },
  twitter: {
    title: 'Assessment Results | Verdex',
    description: 'View your LMA transition loan compliance assessment results.',
    images: [`${siteUrl}/og-results.png`],
  },
  // Don't index individual results pages
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: `${siteUrl}/results`,
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
