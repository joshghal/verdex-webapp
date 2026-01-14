'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Search,
  ExternalLink,
  Menu,
  X,
  Rocket,
  Target,
  Zap,
  Code,
  BarChart3,
  BookOpen
} from 'lucide-react';

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    icon: <Rocket className="w-4 h-4" />,
    children: [
      { title: 'Welcome', href: '/docs' },
      { title: 'Executive Summary', href: '/docs/executive-summary' },
      { title: 'Quick Start', href: '/docs/quick-start' },
    ]
  },
  {
    title: 'Problem & Solution',
    icon: <Target className="w-4 h-4" />,
    children: [
      { title: 'Climate Finance Gap', href: '/docs/problem/climate-finance-gap' },
      { title: 'Why Africa', href: '/docs/problem/why-africa' },
      { title: 'Priority Countries', href: '/docs/problem/priority-countries' },
      { title: 'Solution Overview', href: '/docs/solution-overview' },
    ]
  },
  {
    title: 'Core Features',
    icon: <Zap className="w-4 h-4" />,
    children: [
      { title: 'LMA Validator', href: '/docs/features/lma-validator' },
      { title: 'DFI Matching', href: '/docs/features/dfi-matching' },
      { title: 'Greenwash Detection', href: '/docs/features/greenwash-detection' },
      { title: 'DNSH Assessment', href: '/docs/features/dnsh-assessment' },
      { title: 'Climate Intelligence', href: '/docs/features/climate-intelligence' },
      { title: 'KPI Generator', href: '/docs/features/kpi-generator' },
      { title: 'Clause Library', href: '/docs/features/clause-library' },
    ]
  },
  {
    title: 'Technical',
    icon: <Code className="w-4 h-4" />,
    children: [
      { title: 'Architecture', href: '/docs/technical/architecture' },
      { title: 'Knowledge Base', href: '/docs/technical/knowledge-base' },
      { title: 'API Reference', href: '/docs/technical/api-reference' },
      { title: 'Scoring Methodology', href: '/docs/technical/scoring-methodology' },
    ]
  },
  {
    title: 'Business',
    icon: <BarChart3 className="w-4 h-4" />,
    children: [
      { title: 'Market Opportunity', href: '/docs/business/market-opportunity' },
      { title: 'Business Model', href: '/docs/business/model' },
      { title: 'Roadmap', href: '/docs/business/roadmap' },
    ]
  },
  {
    title: 'Resources',
    icon: <BookOpen className="w-4 h-4" />,
    children: [
      { title: 'References', href: '/docs/resources/references' },
      { title: 'Glossary', href: '/docs/resources/glossary' },
    ]
  },
];

function NavSection({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname;
  const hasActiveChild = item.children?.some(child => child.href === pathname);

  useEffect(() => {
    if (hasActiveChild) setIsOpen(true);
  }, [hasActiveChild]);

  if (hasChildren) {
    return (
      <div className="mb-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group
            ${hasActiveChild
              ? 'text-verdex-800 bg-verdex-50'
              : 'text-gray-600 hover:text-verdex-700 hover:bg-verdex-50/50'
            }`}
        >
          <span className="flex items-center gap-2.5">
            <span className={`${hasActiveChild ? 'text-verdex-600' : 'text-gray-400 group-hover:text-verdex-500'}`}>
              {item.icon}
            </span>
            {item.title}
          </span>
          <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
        </button>
        {isOpen && (
          <div className="mt-1 ml-4 pl-4 border-l-2 border-verdex-100 space-y-0.5">
            {item.children?.map((child, idx) => (
              <NavSection key={idx} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href || '#'}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-200
        ${isActive
          ? 'text-verdex-700 bg-verdex-100/80 font-medium'
          : 'text-gray-500 hover:text-verdex-700 hover:bg-verdex-50'
        }`}
    >
      {item.title}
    </Link>
  );
}

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-verdex-50/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-verdex-100/40 blur-[100px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-verdex-50/60 blur-[80px]" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] rounded-full bg-emerald-50/40 blur-[60px]" />
      </div>

      {/* Top navigation bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-verdex-100/50 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 text-gray-500 hover:text-verdex-700 rounded-lg hover:bg-verdex-50 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-gradient-to-br from-verdex-500 to-verdex-700 rounded-xl flex items-center justify-center shadow-lg shadow-verdex-500/20 group-hover:shadow-verdex-500/40 transition-shadow">
                <svg width="20" height="20" viewBox="0 0 56 56" fill="none">
                  <path d="M10 10 Q14 10 18 18 L28 44" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"/>
                  <path d="M46 10 Q42 10 38 18 L28 44" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5"/>
                  <ellipse cx="28" cy="44" rx="4" ry="3" fill="white"/>
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display font-semibold text-gray-900 text-lg">Verdex</span>
                <span className="text-verdex-300">/</span>
                <span className="text-verdex-600 font-medium">Docs</span>
              </div>
            </Link>
          </div>

          {/* Search */}
          {/* <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-verdex-500 transition-colors" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-verdex-50/50 border border-verdex-100 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-verdex-300 focus:bg-white focus:ring-2 focus:ring-verdex-100 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 bg-white border border-gray-200 rounded shadow-sm">
                <span>⌘</span>K
              </kbd>
            </div>
          </div> */}

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/assess"
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-verdex-600 to-verdex-700 hover:from-verdex-700 hover:to-verdex-800 rounded-xl transition-all shadow-md shadow-verdex-500/20 hover:shadow-lg hover:shadow-verdex-500/30"
            >
              Launch App
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-verdex-700 rounded-lg hover:bg-verdex-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 z-40 w-72 h-[calc(100vh-4rem)] overflow-y-auto bg-white/90 backdrop-blur-xl border-r border-verdex-100/50 transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navigation.map((item, idx) => (
            <NavSection key={idx} item={item} />
          ))}
        </nav>

        {/* Sidebar footer */}
        {/* <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-verdex-100/50 bg-white/80">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>v1.0 - December 2025</span>
            <span className="text-verdex-500">LMA Edge Hackathon</span>
          </div>
        </div> */}
      </aside>

      {/* Main content */}
      <main className="lg:pl-72 pt-16 min-h-screen">
        <div className="relative">
          {children}
        </div>
      </main>
    </div>
  );
}
