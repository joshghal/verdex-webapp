import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Verdex | Verified Green Finance for Africa',
  description: 'AI-powered platform for assessing transition finance projects against LMA standards, matching with DFIs, and generating compliant loan documentation.',
  keywords: ['transition finance', 'Africa', 'DFI', 'LMA', 'green loan', 'sustainable finance', 'climate finance', 'verdex'],
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
