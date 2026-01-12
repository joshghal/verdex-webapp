import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Verdex Pitch Deck | The Infrastructure Layer for African Transition Finance',
  description: 'Verdex pitch deck - The bridge between African projects and global capital. AI-powered validation infrastructure for transition finance.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function PitchDeckLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout overrides the parent docs layout to remove sidebar
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
