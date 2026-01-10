'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Copy, Check, ArrowLeft, ArrowRight } from 'lucide-react';

interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

interface DocPageProps {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  tableOfContents?: TableOfContentsItem[];
  previousPage?: { title: string; href: string };
  nextPage?: { title: string; href: string };
  children: React.ReactNode;
}

export function CodeBlock({ code, language = 'typescript' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-verdex-100 bg-gradient-to-br from-gray-50 to-verdex-50/30">
      <div className="flex items-center justify-between px-4 py-2 bg-verdex-50/50 border-b border-verdex-100">
        <span className="text-xs font-medium text-verdex-600 uppercase tracking-wide">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-verdex-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="text-gray-700 font-mono">{code}</code>
      </pre>
    </div>
  );
}

export function CollapsibleCodeBlock({
  code,
  language = 'typescript',
  title,
  defaultLines = 15
}: {
  code: string;
  language?: string;
  title?: string;
  defaultLines?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.split('\n');
  const totalLines = lines.length;
  const isCollapsible = totalLines > defaultLines;
  const displayedCode = expanded || !isCollapsible
    ? code
    : lines.slice(0, defaultLines).join('\n');

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-verdex-100 bg-gradient-to-br from-gray-50 to-verdex-50/30">
      <div className="flex items-center justify-between px-4 py-2 bg-verdex-50/50 border-b border-verdex-100">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-verdex-600 uppercase tracking-wide">{language}</span>
          {title && (
            <span className="text-xs font-medium text-gray-600 border-l border-verdex-200 pl-3">{title}</span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-verdex-600 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy
            </>
          )}
        </button>
      </div>
      <div className="relative">
        <pre className="p-4 overflow-x-auto text-sm">
          <code className="text-gray-700 font-mono">{displayedCode}</code>
        </pre>
        {isCollapsible && !expanded && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none" />
        )}
      </div>
      {isCollapsible && (
        <div className="border-t border-verdex-100 bg-verdex-50/30">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-4 py-2 text-xs font-medium text-verdex-600 hover:text-verdex-700 hover:bg-verdex-50 transition-colors flex items-center justify-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 rotate-[-90deg]" />
                Show less
              </>
            ) : (
              <>
                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                Show more ({totalLines - defaultLines} more lines)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export function InfoBox({ type = 'info', title, children }: { type?: 'info' | 'warning' | 'success' | 'tip'; title?: string; children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    success: 'bg-verdex-50 border-verdex-200 text-verdex-800',
    tip: 'bg-purple-50 border-purple-200 text-purple-800',
  };

  const icons = {
    info: '💡',
    warning: '⚠️',
    success: '✅',
    tip: '💎',
  };

  return (
    <div className={`my-6 p-4 rounded-xl border ${styles[type]}`}>
      {title && (
        <div className="flex items-center gap-2 font-semibold mb-2">
          <span>{icons[type]}</span>
          {title}
        </div>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}

export function DataTable({ headers, rows }: { headers: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border border-verdex-100">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-verdex-50 to-emerald-50">
            {headers.map((header, idx) => (
              <th key={idx} className="px-4 py-3 text-left font-semibold text-verdex-800 border-b border-verdex-100">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="bg-white hover:bg-verdex-50/30 transition-colors">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 border-b border-gray-100 text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FlowDiagram({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <div className="my-8 flex flex-col md:flex-row items-start md:items-center gap-4">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-verdex-500 to-verdex-600 flex items-center justify-center text-white font-bold shadow-lg">
              {idx + 1}
            </div>
            <div className="mt-2 text-center">
              <div className="font-semibold text-gray-900 text-sm">{step.title}</div>
              <div className="text-xs text-gray-500 max-w-[120px]">{step.description}</div>
            </div>
          </div>
          {idx < steps.length - 1 && (
            <ArrowRight className="hidden md:block w-6 h-6 text-verdex-300 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function DocPage({
  title,
  description,
  breadcrumbs = [],
  tableOfContents = [],
  previousPage,
  nextPage,
  children,
}: DocPageProps) {
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      const sections = tableOfContents.map(item => document.getElementById(item.id));
      const scrollPosition = window.scrollY + 100;

      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(tableOfContents[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [tableOfContents]);

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1 min-w-0 px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-3xl">
          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
              <Link href="/docs" className="hover:text-verdex-600 transition-colors">
                Docs
              </Link>
              {breadcrumbs.map((crumb, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <ChevronRight className="w-4 h-4" />
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:text-verdex-600 transition-colors">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-900 font-medium">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-display font-bold text-gray-900 leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {description}
            </p>
          )}

          {/* Divider */}
          <div className="mt-8 mb-10 h-px bg-gradient-to-r from-verdex-200 via-verdex-100 to-transparent" />

          {/* Content */}
          <article className="prose prose-verdex max-w-none">
            {children}
          </article>

          {/* Navigation */}
          {(previousPage || nextPage) && (
            <div className="mt-16 pt-8 border-t border-verdex-100 flex items-center justify-between gap-4">
              {previousPage ? (
                <Link
                  href={previousPage.href}
                  className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-verdex-200 hover:shadow-md transition-all"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-verdex-600 transition-colors" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">Previous</div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-verdex-700 transition-colors">
                      {previousPage.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextPage && (
                <Link
                  href={nextPage.href}
                  className="group flex items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-100 hover:border-verdex-200 hover:shadow-md transition-all"
                >
                  <div className="text-right">
                    <div className="text-xs text-gray-500">Next</div>
                    <div className="text-sm font-medium text-gray-900 group-hover:text-verdex-700 transition-colors">
                      {nextPage.title}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-verdex-600 transition-colors" />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Table of Contents sidebar */}
      {tableOfContents.length > 0 && (
        <aside className="hidden xl:block w-64 flex-shrink-0 pr-8 py-12">
          <div className="sticky top-24">
            <h4 className="text-sm font-semibold text-gray-900 mb-4">On this page</h4>
            <nav className="space-y-1">
              {tableOfContents.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`block text-sm py-1 transition-colors ${
                    item.level === 2 ? 'pl-0' : 'pl-4'
                  } ${
                    activeSection === item.id
                      ? 'text-verdex-600 font-medium'
                      : 'text-gray-500 hover:text-verdex-600'
                  }`}
                >
                  {item.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>
      )}
    </div>
  );
}
