import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TransitionPath Africa | Make African Transition Projects Bankable',
  description: 'AI-powered platform for assessing transition finance projects against LMA standards, matching with DFIs, and generating compliant loan documentation.',
  keywords: ['transition finance', 'Africa', 'DFI', 'LMA', 'sustainable finance', 'climate finance'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <a href="/" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TP</span>
                  </div>
                  <span className="font-semibold text-gray-900">TransitionPath Africa</span>
                </a>
              </div>
              <div className="flex items-center space-x-4">
                <a href="/assess" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Assess Project
                </a>
                <a href="/search" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Search Clauses
                </a>
                <a href="/assess" className="btn-primary text-sm">
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-gray-200 mt-auto">
          <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 text-sm">
              TransitionPath Africa - Making African transition projects bankable
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
