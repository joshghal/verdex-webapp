import type { Metadata } from 'next';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://verdex.app';

export const metadata: Metadata = {
  title: 'Assess Your Project',
  description: 'Get instant LMA compliance assessment for your African transition finance project. AI-powered analysis against Transition Loan Principles with DFI matching and KPI recommendations.',
  keywords: [
    'LMA assessment tool',
    'transition loan eligibility',
    'green finance assessment',
    'DFI eligibility check',
    'sustainability project assessment',
    'Africa project finance',
    'ESG compliance check',
  ],
  openGraph: {
    title: 'Assess Your Project | Verdex',
    description: 'Get instant LMA compliance assessment for your African transition finance project. AI-powered analysis with DFI matching.',
    url: `${siteUrl}/assess`,
    images: [
      {
        url: `${siteUrl}/og-assess.png`,
        width: 1200,
        height: 630,
        alt: 'Verdex Project Assessment Tool',
      },
    ],
  },
  twitter: {
    title: 'Assess Your Project | Verdex',
    description: 'Get instant LMA compliance assessment for your African transition finance project.',
    images: [`${siteUrl}/og-assess.png`],
  },
  alternates: {
    canonical: `${siteUrl}/assess`,
  },
};

export default function AssessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
