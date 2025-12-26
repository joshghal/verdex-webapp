'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${
        scrolled
          ? 'w-[96%] max-w-7xl'
          : 'w-[94%] max-w-7xl'
      }`}>
        <div className={`rounded-2xl transition-all duration-500 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-verdex border border-verdex-100/50'
            : 'bg-white/60 backdrop-blur-md md:bg-transparent md:backdrop-blur-none'
        }`}>
          <div className="px-4 md:px-6 py-3">
            <div className="flex justify-between items-center">
              {/* Logo */}
              <Link href="/" className="flex items-center space-x-3 group" onClick={() => setMobileMenuOpen(false)}>
                {/* Logo Mark - Ribbon Flow V */}
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    scrolled
                      ? 'bg-gradient-to-br from-verdex-500 to-verdex-700 shadow-verdex-sm'
                      : 'bg-gradient-to-br from-verdex-500 to-verdex-700 shadow-lg'
                  }`}>
                    <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                      <path d="M10 10 Q14 10 18 18 L28 44" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none"/>
                      <path d="M46 10 Q42 10 38 18 L28 44" stroke="white" strokeWidth="6" strokeLinecap="round" fill="none" opacity="0.5"/>
                      <ellipse cx="28" cy="44" rx="4" ry="3" fill="white"/>
                    </svg>
                  </div>
                </div>
                {/* Brand Name */}
                <div className="flex flex-col">
                  <span className="font-display font-medium text-xl tracking-tight text-verdex-900">Verdex</span>
                  <span className="text-[10px] font-medium tracking-wider uppercase -mt-1 text-verdex-600 hidden sm:block">Green Finance Verification</span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <div className="hidden md:flex items-center space-x-1">
                <Link
                  href="/assess"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    scrolled
                      ? 'text-gray-600 hover:text-verdex-700 hover:bg-verdex-50'
                      : 'text-gray-700 hover:text-verdex-700 hover:bg-white/50'
                  }`}
                >
                  Assess Project
                </Link>
                <Link
                  href="/search"
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    scrolled
                      ? 'text-gray-600 hover:text-verdex-700 hover:bg-verdex-50'
                      : 'text-gray-700 hover:text-verdex-700 hover:bg-white/50'
                  }`}
                >
                  Search Clauses
                </Link>
                <Link
                  href="/assess"
                  className="bg-verdex-700 hover:bg-verdex-800 text-white text-sm font-semibold pl-4 px-5 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 shadow-verdex-sm hover:shadow-verdex"
                >
                  Get Started
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-verdex-50 transition-colors"
                aria-label="Toggle menu"
              >
                <div className="w-5 h-4 flex flex-col justify-between">
                  <span className={`w-full h-0.5 bg-verdex-700 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''
                  }`} />
                  <span className={`w-full h-0.5 bg-verdex-700 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? 'opacity-0' : ''
                  }`} />
                  <span className={`w-full h-0.5 bg-verdex-700 rounded-full transition-all duration-300 ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
        mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`} onClick={() => setMobileMenuOpen(false)} />

      {/* Mobile Menu Panel */}
      <div className={`fixed top-20 left-4 right-4 z-40 md:hidden transition-all duration-300 ${
        mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
      }`}>
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-verdex-lg border border-verdex-100 overflow-hidden">
          <div className="p-4 space-y-2">
            <Link
              href="/assess"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-verdex-50 hover:text-verdex-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Assess Project
            </Link>
            <Link
              href="/search"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-4 py-3 rounded-xl text-gray-700 font-medium hover:bg-verdex-50 hover:text-verdex-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-3 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Clauses
            </Link>
          </div>
          <div className="p-4 pt-2 border-t border-gray-100">
            <Link
              href="/assess"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full bg-verdex-700 hover:bg-verdex-800 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
