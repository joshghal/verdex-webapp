import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verdex.app';

export const metadata: Metadata = {
  title: 'Search LMA Clauses',
  description: 'Search and explore LMA loan agreement clauses, sustainability-linked provisions, margin ratchets, KPI definitions, and transition finance documentation templates.',
  keywords: [
    'LMA clause search',
    'loan agreement clauses',
    'sustainability-linked loan clauses',
    'margin ratchet clause',
    'KPI definition clause',
    'SPT clause template',
    'green loan documentation',
    'transition finance clauses',
    'LMA templates',
    'facility agreement clauses',
  ],
  openGraph: {
    title: 'Search LMA Clauses | Verdex',
    description: 'Search and explore LMA loan agreement clauses, sustainability-linked provisions, and transition finance documentation templates.',
    url: `${siteUrl}/search`,
    images: [
      {
        url: `${siteUrl}/og-search.png`,
        width: 1200,
        height: 630,
        alt: 'Verdex LMA Clause Search',
      },
    ],
  },
  twitter: {
    title: 'Search LMA Clauses | Verdex',
    description: 'Search and explore LMA loan agreement clauses and sustainability-linked provisions.',
    images: [`${siteUrl}/og-search.png`],
  },
  alternates: {
    canonical: `${siteUrl}/search`,
  },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
