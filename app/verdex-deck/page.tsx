'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowUpRight,
  Shield,
  Building2,
  FileCheck,
  FileText,
  Check,
  X,
  Clock,
  Database,
  Users,
  TrendingUp,
  DollarSign,
  Leaf,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Globe,
} from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function PitchDeckPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [showAppendix, setShowAppendix] = useState(false);
  const totalSections = 8; // 8 main slides

  // Navigate to specific section
  const navigateToSection = useCallback((index: number) => {
    if (index < 0 || index >= totalSections) return;

    const sections = document.querySelectorAll('.pinned-section');
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Navigate to previous section
  const goToPrev = useCallback(() => {
    navigateToSection(currentSection - 1);
  }, [currentSection, navigateToSection]);

  // Navigate to next section
  const goToNext = useCallback(() => {
    navigateToSection(currentSection + 1);
  }, [currentSection, navigateToSection]);

  // Track current section based on scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const sectionHeight = window.innerHeight;
      const newSection = Math.round(scrollTop / sectionHeight);

      if (newSection !== currentSection && newSection >= 0 && newSection < totalSections) {
        setCurrentSection(newSection);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentSection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev]);

  useGSAP(() => {
    // Kill any existing ScrollTriggers
    ScrollTrigger.getAll().forEach(st => st.kill());

    const container = containerRef.current;
    if (!container) return;

    // Configure ScrollTrigger to use our scroll container
    ScrollTrigger.defaults({
      scroller: container,
    });

    const sections = gsap.utils.toArray<HTMLElement>('.pinned-section');

    // Simplified animation function that works with scroll-snap
    const animateSection = (section: HTMLElement, index: number) => {
      const content = section.querySelector('.section-content');
      const items = section.querySelectorAll('.animate-item');
      const cards = section.querySelectorAll('.bento-card');
      const numbers = section.querySelectorAll('.big-number');

      // For first section, animate immediately
      if (index === 0) {
        if (content) {
          gsap.fromTo(content,
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
          );
        }
        items.forEach((item, idx) => {
          gsap.fromTo(item,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, delay: 0.2 + idx * 0.1, ease: 'power2.out' }
          );
        });
        cards.forEach((card, idx) => {
          gsap.fromTo(card,
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.4 + idx * 0.08, ease: 'power2.out' }
          );
        });
        return;
      }

      // Special handling for Introducing section (index 3) - cinematic entrance
      if (index === 3) {
        const triggerConfig = {
          trigger: section,
          start: 'top 80%',
          end: 'top 20%',
          toggleActions: 'play none none none' as const,
        };

        // Header elements - fade in first
        const headers = section.querySelectorAll('.intro-header');
        headers.forEach((header, idx) => {
          gsap.fromTo(header,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.6, delay: idx * 0.1, ease: 'power2.out', scrollTrigger: triggerConfig }
          );
        });

        // VERDEX hero card - scale in as the main hero (after header)
        const verdexHero = section.querySelector('.intro-verdex-hero');
        if (verdexHero) {
          gsap.fromTo(verdexHero,
            { opacity: 0, scale: 0.9 },
            { opacity: 1, scale: 1, duration: 0.9, delay: 0.3, ease: 'back.out(1.2)', scrollTrigger: triggerConfig }
          );
        }

        // Features inside VERDEX - fade up with stagger (after VERDEX appears)
        const introFeatures = section.querySelectorAll('.intro-feature');
        introFeatures.forEach((feature, idx) => {
          gsap.fromTo(feature,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.5, delay: 0.8 + idx * 0.1, ease: 'power2.out', scrollTrigger: triggerConfig }
          );
        });

        // Bottom feature cards - fade up after VERDEX is visible
        const bottomCards = section.querySelectorAll('.intro-bottom-card');
        bottomCards.forEach((card, idx) => {
          gsap.fromTo(card,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.5, delay: 1.3 + idx * 0.1, ease: 'power2.out', scrollTrigger: triggerConfig }
          );
        });

        // Side cards - slide in from sides (after bottom cards start)
        const sideLeft = section.querySelector('.intro-side-left');
        const sideRight = section.querySelector('.intro-side-right');
        if (sideLeft) {
          gsap.fromTo(sideLeft,
            { opacity: 0, x: -50 },
            { opacity: 1, x: 0, duration: 0.7, delay: 1.6, ease: 'power2.out', scrollTrigger: triggerConfig }
          );
        }
        if (sideRight) {
          gsap.fromTo(sideRight,
            { opacity: 0, x: 50 },
            { opacity: 1, x: 0, duration: 0.7, delay: 1.6, ease: 'power2.out', scrollTrigger: triggerConfig }
          );
        }

        // Arrows - fade in last
        const arrows = section.querySelectorAll('.intro-arrow');
        arrows.forEach((arrow) => {
          gsap.fromTo(arrow,
            { opacity: 0 },
            { opacity: 1, duration: 0.5, delay: 2.0, ease: 'power2.out', scrollTrigger: triggerConfig }
          );
        });

        // Glow pulse animation
        const glow = section.querySelector('.intro-glow');
        if (glow) {
          gsap.to(glow, {
            opacity: 0.5,
            duration: 1.5,
            delay: 1.2,
            ease: 'power2.inOut',
            scrollTrigger: triggerConfig,
            onComplete: () => {
              gsap.to(glow, { opacity: 0.3, duration: 1.5, repeat: -1, yoyo: true, ease: 'sine.inOut' });
            }
          });
        }

        return;
      }

      // For other sections, use ScrollTrigger with 'top top' since scroll-snap snaps to full sections
      const triggerConfig = {
        trigger: section,
        start: 'top 80%',
        end: 'top 20%',
        toggleActions: 'play none none none' as const, // Don't reverse - keeps content visible
      };

      if (content) {
        gsap.fromTo(content,
          { opacity: 0, y: 60 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: triggerConfig }
        );
      }

      items.forEach((item, idx) => {
        gsap.fromTo(item,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.6, delay: idx * 0.1, ease: 'power2.out', scrollTrigger: triggerConfig }
        );
      });

      cards.forEach((card, idx) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, delay: idx * 0.08, ease: 'power2.out', scrollTrigger: triggerConfig }
        );
      });

      numbers.forEach((num) => {
        gsap.fromTo(num,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)', scrollTrigger: triggerConfig }
        );
      });
    };

    // Apply animations to all sections
    sections.forEach((section, index) => {
      animateSection(section, index);
    });

    // Track current section
    sections.forEach((section, i) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top center',
        end: 'bottom center',
        onEnter: () => setCurrentSection(i),
        onEnterBack: () => setCurrentSection(i),
      });
    });

    // Refresh ScrollTrigger to ensure proper positioning
    ScrollTrigger.refresh();

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
    };
  }, { scope: containerRef });

  // Topographic SVG component for consistency
  const TopographicLines = ({ className = '', flip = false }: { className?: string; flip?: boolean }) => (
    <div className={`absolute pointer-events-none ${className} ${flip ? 'rotate-180' : ''}`}>
      <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path d="M-50 550 Q80 420 150 300 Q220 180 320 120 Q420 60 550 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
        <path d="M-50 500 Q70 380 140 270 Q210 160 300 100 Q390 40 500 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
        <path d="M-50 450 Q60 340 130 240 Q200 140 280 85 Q360 30 450 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
        <path d="M-50 400 Q50 300 120 210 Q190 120 260 70 Q330 20 400 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
        <path d="M-50 350 Q40 260 110 180 Q180 100 240 55 Q300 10 350 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
        <path d="M0 420 Q80 320 140 230 Q200 140 280 90 Q360 40 420 0" stroke="#059669" strokeWidth="1" fill="none"/>
        <path d="M20 380 Q90 290 150 210 Q210 130 280 80 Q350 30 400 0" stroke="#059669" strokeWidth="1" fill="none"/>
        <path d="M120 180 Q150 145 200 110 Q250 75 280 55 Q310 35 300 30" stroke="#10b981" strokeWidth="0.8" fill="none"/>
      </svg>
    </div>
  );

  return (
    <div ref={containerRef} className="bg-white text-gray-900 overflow-x-hidden h-screen overflow-y-auto scroll-smooth snap-y snap-mandatory">
      {/* Subtle noise texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      }} />
      {/* Progress indicator */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-verdex-600 to-verdex-500 transition-all duration-300"
          style={{ width: `${((currentSection + 1) / totalSections) * 100}%` }}
        />
      </div>

      {/* Left side navigation - dots and buttons */}
      <nav className="fixed left-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-4">
        {/* Prev Button */}
        <button
          onClick={goToPrev}
          disabled={currentSection === 0}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
            currentSection === 0
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-500 hover:border-verdex-400 hover:text-verdex-600'
          }`}
          title="Previous"
        >
          <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Dots */}
        <div className="flex flex-col gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <button
              key={i}
              onClick={() => navigateToSection(i)}
              className={`group relative w-2 h-2 rounded-full transition-all duration-300 ${
                currentSection === i
                  ? 'bg-verdex-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            >
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-[10px] font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity ${
                currentSection === i ? 'text-verdex-600' : 'text-gray-500'
              }`}>
                {['Title', 'Challenge', 'Insight', 'Solution', '5 Core', 'Ecosystem', 'Traction', 'Impact'][i]}
              </span>
            </button>
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={goToNext}
          disabled={currentSection === totalSections - 1}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 ${
            currentSection === totalSections - 1
              ? 'border-gray-200 text-gray-300 cursor-not-allowed'
              : 'border-gray-300 text-gray-500 hover:border-verdex-400 hover:text-verdex-600'
          }`}
          title="Next"
        >
          <ChevronDown className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Section counter */}
        <span className="text-[10px] text-gray-400 font-medium mt-1">
          {currentSection + 1}/{totalSections}
        </span>

        {/* Appendix link */}
        <button
          onClick={() => {
            setShowAppendix(true);
            setTimeout(() => {
              const appendix = document.querySelector('.appendix-section');
              if (appendix) appendix.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }}
          className="mt-3 px-2 py-1 text-[9px] text-gray-400 hover:text-verdex-600 font-medium tracking-wider uppercase border border-gray-200 hover:border-verdex-300 rounded transition-all"
        >
          Appendix
        </button>
      </nav>

      {/* ==================== SECTION 1: HERO ==================== */}
      <section className="pinned-section h-screen relative flex items-center justify-center overflow-hidden snap-start">
        {/* Mesh gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-verdex-50/80 via-white to-gold-50/40" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-verdex-100/30 to-transparent" />
        <div className="absolute bottom-0 right-0 w-2/3 h-2/3 bg-gradient-to-tl from-gold-100/20 to-transparent" />

        {/* Topographic decorations */}
        <TopographicLines className="top-0 left-0 w-[520px] h-[520px] -translate-x-[10%] -translate-y-[10%] opacity-[0.08]" />
        <TopographicLines className="bottom-0 right-0 w-[600px] h-[600px] translate-x-[10%] translate-y-[10%] opacity-[0.12]" flip />

        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="blob blob-teal w-[400px] h-[400px] top-[20%] right-[-150px] animate-blob-reverse opacity-60" />
          <div className="blob blob-emerald w-[350px] h-[350px] bottom-[-50px] left-[70%] animate-blob-slow opacity-40" />
        </div>

        <div className="section-content relative z-10 text-center px-6 max-w-6xl mx-auto">
          {/* Logo mark */}
          <div className="animate-item mb-4">
            <div className="inline-flex items-center gap-4 px-6 py-3">
              <div className="w-10 h-10 bg-gradient-to-br from-verdex-500 to-verdex-700 rounded-xl flex items-center justify-center shadow-verdex">
                <svg width="24" height="24" viewBox="0 0 56 56" fill="none">
                  <path d="M10 10 Q14 10 18 18 L28 44" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"/>
                  <path d="M46 10 Q42 10 38 18 L28 44" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5"/>
                </svg>
              </div>
              <span className="text-verdex-700 font-semibold">Verdex</span>
            </div>
          </div>

          {/* Main headline */}
          <h1 className="animate-item text-4xl md:text-6xl lg:text-7xl font-display font-medium tracking-tight leading-[1.15] mb-4">
            <span className="block text-gray-900 pb-2">The Bridge Between</span>
            <span className="block gradient-text pb-2">
              African Projects
            </span>
            <span className="block text-gray-800">&amp; Global Capital</span>
          </h1>

          {/* Subtitle */}
          <p className="animate-item text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-6 font-light">
            Infrastructure layer for transition finance validation,
            DFI matching, and ecosystem integration
          </p>

          {/* Key stats - Inline flow design */}
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 max-w-4xl mx-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-display font-bold text-verdex-600">$233B</span>
              <span className="text-gray-500 text-sm">gap</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-verdex-200" />
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-display font-bold text-verdex-600">$700B</span>
              <span className="text-gray-500 text-sm">market</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-verdex-200" />
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-display font-bold text-verdex-600">7+</span>
              <span className="text-gray-500 text-sm">DFIs</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-verdex-200" />
            <div className="flex items-baseline gap-2">
              <span className="text-4xl md:text-5xl font-display font-bold text-verdex-600">&lt;60s</span>
              <span className="text-gray-500 text-sm">assess</span>
            </div>
          </div>

        </div>

        {/* Scroll hint - only show on first section, above nav buttons */}
        {currentSection === 0 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 animate-pulse">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest">Scroll or use buttons</span>
            <ChevronDown className="w-5 h-5 text-verdex-400" strokeWidth={1.5} />
          </div>
        )}
      </section>

      {/* ==================== SECTION 2: THE CHALLENGE ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-verdex-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-navy-700/20" />
        {/* Grid texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.03]" preserveAspectRatio="none">
          <pattern id="challenge-grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 10" stroke="white" strokeWidth="0.5" fill="none" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#challenge-grid)" />
        </svg>
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-verdex-500/10 rounded-full blur-[150px]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Section label */}
            <div className="animate-item flex items-center gap-3 mb-8">
              <div className="w-12 h-[2px] bg-gradient-to-r from-verdex-400 to-verdex-500" />
              <span className="text-verdex-400 font-semibold tracking-wider uppercase text-sm">The Challenge</span>
            </div>

            {/* Africa-centric framing */}
            <div className="bento-card mb-8">
              <blockquote className="text-2xl md:text-3xl text-white font-light leading-relaxed mb-4">
                African renewable energy projects face a <span className="text-verdex-400">$233 billion</span> annual financing gap — not from lack of capital, but lack of <span className="text-verdex-400">bankability.</span>
              </blockquote>
              <span className="text-white/50 text-sm">LMA Edge Hackathon — Greener Lending Challenge</span>
            </div>

            {/* The Real Barriers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
              <div className="bento-card bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-rose-400" strokeWidth={2} />
                  <span className="text-rose-400 font-semibold text-sm">Complexity Barrier</span>
                </div>
                <p className="text-white/70 text-sm">LMA&apos;s Guide defines 5 Core Components + DNSH requirements. Technical language. No self-assessment tools for borrowers.</p>
              </div>
              <div className="bento-card bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-rose-400" strokeWidth={2} />
                  <span className="text-rose-400 font-semibold text-sm">Expertise Barrier</span>
                </div>
                <p className="text-white/70 text-sm">Transition strategy, DNSH screening, climate risk — require specialist knowledge most developers lack.</p>
              </div>
              <div className="bento-card bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <X className="w-4 h-4 text-rose-400" strokeWidth={2} />
                  <span className="text-rose-400 font-semibold text-sm">Cost Barrier</span>
                </div>
                <p className="text-white/70 text-sm">Big 4 consultants charge $10K+ for compliance assessments. African developers priced out.</p>
              </div>
            </div>

            {/* Our Answer */}
            <div className="bento-card bg-verdex-500/10 backdrop-blur-sm rounded-2xl border border-verdex-500/30 p-5">
              <p className="text-lg md:text-xl text-white leading-relaxed">
                <span className="text-verdex-400 font-semibold">The same tools London lenders use</span> — LMA validation, EU Taxonomy screening, climate risk assessment — <span className="text-verdex-400 font-semibold">delivered to African borrowers.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 3: THE INSIGHT ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Subtle warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-verdex-50/30" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-verdex-100/20 to-transparent" />
        <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-verdex-200/20 rounded-full blur-[100px]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="animate-item flex items-center gap-3 mb-6">
              <div className="w-12 h-[2px] bg-gradient-to-r from-verdex-500 to-verdex-400" />
              <span className="text-verdex-600 font-semibold tracking-wider uppercase text-sm">The Insight</span>
            </div>

            {/* The Problem - simple headline */}
            <h2 className="animate-item text-3xl md:text-5xl font-display font-medium text-gray-900 mb-10 leading-tight">
              The LMA wrote the rules.<br/>
              <span className="text-verdex-600">Borrowers have no way to check them.</span>
            </h2>

            {/* The gap - clean visual comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bento-card glass-card rounded-2xl p-6 border-l-4 border-l-verdex-500">
                <div className="text-sm text-verdex-600 font-semibold uppercase tracking-wider mb-4">LMA Requirements</div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-verdex-500" strokeWidth={2} />
                    <span>5 Core Components compliance</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-verdex-500" strokeWidth={2} />
                    <span>DNSH environmental safeguards</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-verdex-500" strokeWidth={2} />
                    <span>Climate resilience evidence</span>
                  </li>
                </ul>
              </div>
              <div className="bento-card glass-card rounded-2xl p-6 border-l-4 border-l-rose-400">
                <div className="text-sm text-rose-600 font-semibold uppercase tracking-wider mb-4">Borrower Reality</div>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-rose-400" strokeWidth={2} />
                    <span>No self-assessment tools</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-rose-400" strokeWidth={2} />
                    <span>$10K+ consultant fees</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <X className="w-5 h-5 text-rose-400" strokeWidth={2} />
                    <span>No Africa-specific data</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Punchline */}
            <p className="text-xl md:text-2xl text-center font-medium text-gray-900">
              We&apos;re giving borrowers the tools. <span className="text-verdex-600">Same standards. Free access.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 4: INTRODUCING VERDEX ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Rich dark gradient with depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-verdex-950 via-verdex-900 to-navy-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 via-transparent to-verdex-800/10" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
        {/* Enhanced glows */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-verdex-500/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[100px]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="intro-header text-5xl md:text-6xl font-display font-bold text-white mb-3">Verdex</h2>
              <p className="intro-header text-xl md:text-2xl text-verdex-300 mb-2">
                The borrower&apos;s toolkit for transition finance.
              </p>
              <p className="intro-header text-sm text-white/50 max-w-xl mx-auto">
                Same standards European lenders use — LMA validation, DNSH screening, climate intelligence — now accessible to African developers.
              </p>
            </div>

            {/* Bridge Visualization - Projects → Verdex → Capital */}
            <div className="flex items-center justify-center gap-6 md:gap-10 mb-10">
              <div className="intro-side-left text-center">
                <Leaf className="w-10 h-10 text-verdex-400 mx-auto mb-2" strokeWidth={1.5} />
                <div className="text-white font-semibold text-sm">African Projects</div>
                <div className="text-white/40 text-xs mt-1">Solar, wind, agri, transport</div>
              </div>

              <div className="intro-arrow flex items-center gap-2">
                <div className="w-10 h-[2px] bg-gradient-to-r from-verdex-400/50 to-verdex-400" />
                <ChevronRight className="w-4 h-4 text-verdex-400" />
              </div>

              <div className="intro-verdex-hero">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-verdex-500 to-verdex-700 flex items-center justify-center shadow-lg shadow-verdex-500/30">
                  <svg width="32" height="32" viewBox="0 0 56 56" fill="none">
                    <path d="M10 10 Q14 10 18 18 L28 44" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none"/>
                    <path d="M46 10 Q42 10 38 18 L28 44" stroke="white" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.5"/>
                  </svg>
                </div>
              </div>

              <div className="intro-arrow flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gold-400" />
                <div className="w-10 h-[2px] bg-gradient-to-r from-gold-400 to-gold-400/50" />
              </div>

              <div className="intro-side-right text-center">
                <DollarSign className="w-10 h-10 text-gold-400 mx-auto mb-2" strokeWidth={1.5} />
                <div className="text-white font-semibold text-sm">DFI Capital</div>
                <div className="text-white/40 text-xs mt-1">FMO, Proparco, IFC, DEG...</div>
              </div>
            </div>

            {/* What Verdex Does - Enhanced 3x2 grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {[
                { icon: FileCheck, title: 'LMA Validation', desc: 'Automated 5 Core Components assessment against Oct 2025 Guide' },
                { icon: Shield, title: 'DNSH Screening', desc: 'EU Taxonomy harm detection for 6 environmental objectives' },
                { icon: Globe, title: 'Climate Intelligence', desc: 'Location-specific risk data using Open-Meteo climate API' },
                { icon: TrendingUp, title: 'Greenwash Detection', desc: 'AI-powered analysis of vague claims and missing evidence' },
                { icon: Database, title: 'Clause Library', desc: '500+ transition loan templates from actual DFI agreements' },
                { icon: Users, title: 'DFI Matching', desc: 'Algorithm matches projects to 7+ development financiers' },
              ].map((feature, i) => (
                <div key={i} className="intro-bottom-card bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <feature.icon className="w-5 h-5 text-verdex-400 mb-2" strokeWidth={1.5} />
                  <div className="text-sm text-white font-medium mb-1">{feature.title}</div>
                  <div className="text-xs text-white/50 leading-relaxed">{feature.desc}</div>
                </div>
              ))}
            </div>

            {/* Empowerment punchline */}
            <div className="text-center">
              <p className="text-verdex-300 text-sm">
                <span className="text-white font-semibold">$10K consultancy → </span>60-second self-assessment.{' '}
                <span className="text-verdex-400">Leveling the playing field.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 5: LMA 5 CORE COMPONENTS ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Layered gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-verdex-50/30 to-gray-50" />
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-verdex-100/30 to-transparent" />
        {/* Glow */}
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-verdex-200/15 rounded-full blur-[100px]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-verdex-600 to-verdex-500" />
              <span className="text-verdex-700 font-semibold tracking-wider uppercase text-sm">Credibility</span>
            </div>

            <h2 className="animate-item text-3xl md:text-4xl font-display font-medium text-gray-900 mb-2">
              Built on the <span className="text-verdex-600">October 2025 LMA Transition Loan Guide</span>
            </h2>
            <p className="animate-item text-lg text-gray-600 mb-6">
              Verdex automates assessment of the LMA&apos;s 5 Core Components + DNSH safeguards. We didn&apos;t invent criteria — we encoded the actual standard.
            </p>

            {/* 5 Components - Simplified */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {[
                { num: 1, name: 'Transition Strategy', validation: 'AI analysis' },
                { num: 2, name: 'Use of Proceeds', validation: 'Eligibility check' },
                { num: 3, name: 'Project Selection', validation: 'Gap analysis' },
                { num: 4, name: 'Proceeds Management', validation: 'Doc templates' },
                { num: 5, name: 'Reporting', validation: 'KPI generator' },
              ].map((item) => (
                <div key={item.num} className="bento-card glass-card rounded-2xl p-4 text-center border-t-4 border-t-verdex-500">
                  <div className="w-8 h-8 rounded-lg bg-verdex-100 flex items-center justify-center mx-auto mb-2">
                    <span className="text-verdex-700 font-bold text-sm">{item.num}</span>
                  </div>
                  <div className="font-semibold text-gray-900 text-sm mb-2">{item.name}</div>
                  <div className="text-xs text-verdex-600 font-medium">{item.validation}</div>
                </div>
              ))}
            </div>

            {/* Source Link */}
            <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />
                  <span className="text-sm text-gray-600">
                    <a href="https://www.lma.eu.com/application/files/8017/6121/0645/Guide_to_Transition_Loans_-_16_October_2025.pdf" target="_blank" rel="noopener noreferrer" className="text-verdex-600 hover:underline font-medium">LMA Guide to Transition Loans — October 2025</a>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 ml-6">Defines 5 Core Components + DNSH safeguards for transition finance</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-verdex-100 border border-verdex-200">
                <Clock className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />
                <span className="text-verdex-700 font-semibold text-sm">Assessment in &lt;60 seconds</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 6: COMPETITIVE LANDSCAPE ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Layered gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-navy-50/20 to-white" />
        <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-verdex-50/30 to-transparent" />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-verdex-200/15 rounded-full blur-[100px]" />

        {/* Radar circles SVG background */}
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] z-[1]" viewBox="0 0 400 400">
          {/* Concentric circles - opacity decreases outward */}
          <circle cx="200" cy="200" r="40" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.12" />
          <circle cx="200" cy="200" r="80" fill="none" stroke="#22c55e" strokeWidth="1" opacity="0.09" />
          <circle cx="200" cy="200" r="120" fill="none" stroke="#22c55e" strokeWidth="0.75" opacity="0.06" />
          <circle cx="200" cy="200" r="160" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.04" />
          <circle cx="200" cy="200" r="200" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.02" />
          {/* Center dot */}
          <circle cx="200" cy="200" r="4" fill="#22c55e" opacity="0.15" />
          {/* Cross lines */}
          <line x1="200" y1="0" x2="200" y2="400" stroke="#22c55e" strokeWidth="0.5" opacity="0.05" />
          <line x1="0" y1="200" x2="400" y2="200" stroke="#22c55e" strokeWidth="0.5" opacity="0.05" />
          {/* Diagonal lines */}
          <line x1="60" y1="60" x2="340" y2="340" stroke="#22c55e" strokeWidth="0.5" opacity="0.03" />
          <line x1="340" y1="60" x2="60" y2="340" stroke="#22c55e" strokeWidth="0.5" opacity="0.03" />
        </svg>

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-navy-600 to-navy-500" />
              <span className="text-navy-600 font-semibold tracking-wider uppercase text-sm">Ecosystem</span>
            </div>

            <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900 mb-4">
              Verdex <span className="text-verdex-600">Complements, Not Competes</span>
            </h2>
            <p className="animate-item text-xl text-gray-500 mb-6 max-w-2xl">
              Every tool in the loan market serves lenders. <span className="text-verdex-600 font-semibold">None serve borrowers.</span>
            </p>

            {/* Three layer visualization - enhanced layout */}
            <div className="grid grid-cols-12 gap-4 items-stretch">
              {/* Lender Side */}
              <div className="col-span-12 md:col-span-3 bento-card glass-card rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-navy-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-navy-600">Lender Side</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { name: 'LMA.Automate', desc: 'Document automation' },
                    { name: 'Avvoka', desc: 'Contract negotiation' },
                    { name: 'LendOS', desc: 'Loan administration' },
                    { name: 'Agensight', desc: 'Syndicated agency' },
                  ].map((item) => (
                    <div key={item.name} className="px-3 py-2 rounded-xl bg-navy-50 border border-navy-100">
                      <div className="text-navy-700 text-sm font-medium">{item.name}</div>
                      <div className="text-navy-400 text-xs">{item.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-400 italic">&ldquo;How to draft, administer, trade&rdquo;</div>
              </div>

              {/* LMA Standards - Center */}
              <div className="col-span-12 md:col-span-6 bento-card glass-card rounded-3xl border-2 border-verdex-300 p-6 shadow-verdex relative bg-gradient-to-br from-white via-verdex-50/30 to-white">
                {/* Connection lines */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-8 h-[3px] bg-gradient-to-r from-navy-200 to-verdex-400 hidden md:block" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-8 h-[3px] bg-gradient-to-l from-verdex-400 to-verdex-400 hidden md:block" />

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-verdex-200/20 blur-xl -z-10" />

                <div className="text-center mb-4">
                  <div className="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">One Framework, Both Sides</div>
                  <div className="inline-block px-6 py-2 rounded-xl bg-gradient-to-r from-verdex-100 to-verdex-50 border border-verdex-200">
                    <span className="text-xl font-display font-bold text-verdex-700 tracking-wide">LMA STANDARDS</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-navy-50 border border-navy-100">
                    <div className="text-xs text-navy-500 uppercase tracking-wider mb-2">Tools for Lenders</div>
                    <div className="space-y-2 text-sm text-navy-700">
                      <div>Draft &amp; automate docs</div>
                      <div>Manage loan portfolios</div>
                      <div>Process borrower data</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-verdex-50 border border-verdex-200">
                    <div className="text-xs text-verdex-500 uppercase tracking-wider mb-2">Tools for Borrowers</div>
                    <div className="space-y-2 text-sm text-verdex-700 font-medium">
                      <div>Understand LMA requirements</div>
                      <div>Search clause templates</div>
                      <div>Assess compliance gaps</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-verdex-100 text-center">
                  <div className="inline-block px-4 py-2 rounded-xl bg-gradient-to-r from-verdex-600 to-verdex-500">
                    <span className="text-white font-bold">VERDEX = Borrower Side</span>
                  </div>
                </div>
              </div>

              {/* Borrower Side */}
              <div className="col-span-12 md:col-span-3 bento-card glass-card rounded-3xl p-5 border-2 border-verdex-200 bg-gradient-to-br from-verdex-50/50 to-white">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-verdex-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-verdex-700">Borrower Side</h3>
                </div>
                <div className="space-y-2">
                  <div className="px-3 py-3 rounded-xl bg-gradient-to-r from-verdex-600 to-verdex-500 text-white text-center">
                    <div className="font-bold text-lg">VERDEX</div>
                    <div className="text-verdex-100 text-xs">Pre-deal validation</div>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-verdex-600">
                  <div className="flex items-center gap-2"><Check className="w-3 h-3" strokeWidth={2} /> Self-assess compliance</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3" strokeWidth={2} /> Match with DFIs</div>
                  <div className="flex items-center gap-2"><Check className="w-3 h-3" strokeWidth={2} /> Generate documentation</div>
                </div>
                <div className="mt-4 pt-4 border-t border-verdex-100 text-center text-sm text-verdex-500 italic">&ldquo;Do I qualify? Who funds me?&rdquo;</div>
              </div>
            </div>

            {/* Lender Benefit + Value to LMA */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-50 to-white border border-navy-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-navy-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-navy-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-navy-700 font-semibold text-sm">Value to Lenders</div>
                    <div className="text-gray-600 text-xs">Pre-validated borrowers = faster due diligence</div>
                  </div>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-r from-verdex-50 to-white border border-verdex-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-verdex-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-verdex-700 font-semibold text-sm">Value to LMA</div>
                    <div className="text-gray-600 text-xs">More deals use LMA frameworks</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 7: TRACTION ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-verdex-50/30" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-verdex-200/15 rounded-full blur-[100px]" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-verdex-600 to-verdex-500" />
              <span className="text-verdex-700 font-semibold tracking-wider uppercase text-sm">Traction</span>
            </div>

            <h2 className="animate-item text-3xl md:text-4xl font-display font-medium text-gray-900 mb-8">
              Foundation is <span className="text-verdex-600">Laid</span>
            </h2>

            {/* Hero section - simplified */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* MVP Live */}
              <div className="bento-card glass-card rounded-2xl p-6 border-2 border-verdex-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-verdex-500 rounded-full animate-pulse" />
                  <span className="text-verdex-600 font-semibold">MVP Live</span>
                </div>
                <span className="text-3xl font-display font-bold text-gray-900">verdx.site</span>
              </div>

              {/* Hero stat - 2,009 */}
              <div className="bento-card rounded-2xl p-6 bg-gradient-to-br from-verdex-600 to-verdex-800 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
                  <pattern id="moat-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 10" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#moat-grid)" />
                </svg>
                <div className="relative">
                  <div className="text-5xl font-display font-bold text-white">2,009</div>
                  <div className="text-white/70">LMA Documents Catalogued</div>
                </div>
              </div>
            </div>

            {/* Key stats - simplified inline */}
            <div className="bento-card glass-card rounded-2xl p-6 mb-6">
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-verdex-600">20</div>
                  <div className="text-xs text-gray-500">Indexed (MVP)</div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden md:block" />
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-verdex-600">500+</div>
                  <div className="text-xs text-gray-500">Clause Templates</div>
                </div>
                <div className="w-px h-8 bg-gray-200 hidden md:block" />
                <div className="text-center">
                  <div className="text-2xl font-display font-bold text-verdex-600">7</div>
                  <div className="text-xs text-gray-500">DFIs Matched</div>
                </div>
              </div>
            </div>

            {/* Tech Stack - for technical judges */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
              {['Next.js', 'Python', 'Groq AI', 'ASI1:mini', 'Pinecone', 'Railway'].map((tech) => (
                <span key={tech} className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{tech}</span>
              ))}
            </div>

            {/* Value Proposition */}
            <p className="text-center text-lg text-gray-600">
              <span className="text-verdex-600 font-semibold">When borrowers understand the standards, they come prepared.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 8: IMPACT & CALL TO ACTION ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Rich layered dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-verdex-950 via-verdex-900 to-navy-900" />
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-verdex-500/20 rounded-full blur-[150px]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Impact header */}
            <div className="text-center mb-10">
              <h2 className="animate-item text-3xl md:text-4xl font-display font-medium text-white mb-2">
                If We Enable <span className="text-verdex-400">10%</span> of the Financing Gap
              </h2>
              <p className="text-white/50 text-sm mb-8">Annually</p>

              {/* All impact stats in one row */}
              <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-white">$23B</div>
                  <div className="text-white/50 text-xs">Climate finance</div>
                </div>
                <div className="w-px h-10 bg-white/20 hidden md:block" />
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-white">50+GW</div>
                  <div className="text-white/50 text-xs">Renewable capacity</div>
                </div>
                <div className="w-px h-10 bg-white/20 hidden md:block" />
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-white">100M+</div>
                  <div className="text-white/50 text-xs">People powered</div>
                </div>
                <div className="w-px h-10 bg-white/20 hidden md:block" />
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-display font-bold text-white">100M+</div>
                  <div className="text-white/50 text-xs">Tonnes CO2 avoided</div>
                </div>
              </div>
            </div>

            {/* Quote */}
            <blockquote className="text-2xl md:text-3xl text-white font-light leading-relaxed text-center mb-10">
              &ldquo;Where African projects learn to speak the language of global lenders.&rdquo;
            </blockquote>

            {/* Call to action - simplified */}
            <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/10 p-6 max-w-xl mx-auto">
              <h3 className="text-white font-semibold mb-4 text-center">We&apos;re Looking For</h3>
              <div className="space-y-2 mb-5 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>Pilot Partnership</span>
                  <span className="text-verdex-400">LMA members</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Integration</span>
                  <span className="text-verdex-400">LMA.Automate / Avvoka</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>Ecosystem Partners</span>
                  <span className="text-verdex-400">Debtdomain / LendOS</span>
                </div>
                <div className="flex justify-between text-white/80">
                  <span>DFI Collaboration</span>
                  <span className="text-verdex-400">Pipeline integration</span>
                </div>
              </div>
              <a href="https://verdx.site" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-verdex-600 text-white font-medium hover:bg-verdex-500 transition-colors">
                Demo: verdx.site <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
              </a>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Verdex &mdash; LMA Edge Hackathon 2026 &mdash; Greener Lending
            </p>
          </div>
        </div>
      </section>

      {/* ==================== APPENDIX (conditionally rendered) ==================== */}
      {showAppendix && (
        <>
      {/* ==================== APPENDIX DIVIDER ==================== */}
      <section className="appendix-section pinned-section h-screen relative flex items-center justify-center overflow-hidden snap-start bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        <div className="section-content relative z-10 text-center px-6">
          <div className="inline-block px-6 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
            <span className="text-white/60 text-sm font-medium tracking-wider uppercase">Available on Request</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-8">Appendix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[
              { id: 'A1', title: 'DFI Eligibility Matrix', desc: 'Full requirements for 7 DFIs' },
              { id: 'A2', title: 'Technical Architecture', desc: 'API endpoints & integration' },
              { id: 'A3', title: 'Financial Projections', desc: 'Detailed revenue model' },
              { id: 'A4', title: 'Document Coverage', desc: '2,009 LMA docs analysis' },
              { id: 'A5', title: 'Market Analysis', desc: 'TAM/SAM/SOM breakdown' },
            ].map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-white/5 border border-white/10 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-verdex-400 font-mono text-sm font-bold">{item.id}</span>
                  <span className="text-white font-medium">{item.title}</span>
                </div>
                <p className="text-white/50 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              setShowAppendix(false);
              setTimeout(() => {
                const firstSection = document.querySelector('.pinned-section');
                if (firstSection) firstSection.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            }}
            className="mt-8 inline-flex items-center gap-2 px-4 py-2 text-sm text-white/60 hover:text-white font-medium border border-white/20 hover:border-white/40 rounded-lg transition-all"
          >
            <ChevronUp className="w-4 h-4" strokeWidth={1.5} />
            Back to Presentation
          </button>
        </div>
      </section>

      {/* ==================== APPENDIX A1: DFI ELIGIBILITY MATRIX ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-verdex-50/30 to-white" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-verdex-600 font-mono text-sm font-bold bg-verdex-100 px-2 py-1 rounded">A1</span>
              <span className="text-gray-400 font-medium">Appendix</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-6">
              DFI <span className="text-verdex-600">Eligibility Matrix</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">DFI</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Min. Deal Size</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Sectors</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Geography</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Key Requirements</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'IFC', min: '$10M', sectors: 'All renewable, clean tech', geo: 'Global emerging', req: 'E&S standards, additionality' },
                    { name: 'AfDB', min: '$5M', sectors: 'Energy, infrastructure', geo: 'Africa only', req: 'Regional impact, job creation' },
                    { name: 'FMO', min: '€5M', sectors: 'Energy, agri, finance', geo: 'Emerging markets', req: 'SDG alignment, gender lens' },
                    { name: 'DEG', min: '€5M', sectors: 'Renewable, manufacturing', geo: 'Developing countries', req: 'German interest, dev impact' },
                    { name: 'BII', min: '£5M', sectors: 'Clean energy, infra', geo: 'Africa, S. Asia', req: 'Climate focus, job creation' },
                    { name: 'Proparco', min: '€3M', sectors: 'Energy, finance, health', geo: 'Africa, emerging', req: 'French link, SDG impact' },
                    { name: 'DFC', min: '$10M', sectors: 'Energy, infra, health', geo: 'Low/middle income', req: 'US interest, dev impact' },
                  ].map((dfi) => (
                    <tr key={dfi.name} className="border-b border-gray-100 hover:bg-verdex-50/50">
                      <td className="py-3 px-4 font-semibold text-verdex-700">{dfi.name}</td>
                      <td className="py-3 px-4 text-gray-600">{dfi.min}</td>
                      <td className="py-3 px-4 text-gray-600">{dfi.sectors}</td>
                      <td className="py-3 px-4 text-gray-600">{dfi.geo}</td>
                      <td className="py-3 px-4 text-gray-500 text-xs">{dfi.req}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== APPENDIX A2: TECHNICAL ARCHITECTURE ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-navy-50/20 to-white" />
        <TopographicLines className="top-0 left-0 w-[400px] h-[400px] -translate-x-[20%] -translate-y-[20%] opacity-[0.06]" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-navy-600 font-mono text-sm font-bold bg-navy-100 px-2 py-1 rounded">A2</span>
              <span className="text-gray-400 font-medium">Appendix</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-6">
              Technical <span className="text-navy-600">Architecture</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* API Endpoints */}
              <div className="md:col-span-2 rounded-2xl p-6 bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none">
                  <pattern id="a2-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                    <path d="M 12 0 L 0 12" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#a2-grid)" />
                </svg>
                <h3 className="relative text-lg font-semibold text-white mb-4">API Endpoints</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { endpoint: '/api/assess', desc: 'LMA compliance scoring', method: 'POST' },
                    { endpoint: '/api/search', desc: 'Clause semantic search', method: 'GET' },
                    { endpoint: '/api/chat', desc: 'AI knowledge assistant', method: 'POST' },
                    { endpoint: '/api/generate-draft', desc: 'Document generation', method: 'POST' },
                    { endpoint: '/api/clause-insight', desc: 'Clause analysis', method: 'POST' },
                    { endpoint: '/api/upload-pdf', desc: 'PDF processing', method: 'POST' },
                  ].map((api) => (
                    <div key={api.endpoint} className="p-3 rounded-xl bg-slate-800 border border-slate-700">
                      <code className="text-emerald-400 text-sm font-mono">{api.endpoint}</code>
                      <p className="text-slate-300 text-xs mt-1">{api.desc}</p>
                      <span className="text-slate-400 text-xs">{api.method}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Tech Stack */}
              <div className="glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tech Stack</h3>
                <div className="space-y-3">
                  {[
                    { layer: 'Frontend', tech: 'Next.js 16, React 19, TypeScript' },
                    { layer: 'AI/LLM', tech: 'Groq (Llama 4 Maverick)' },
                    { layer: 'Vector DB', tech: 'Pinecone' },
                    { layer: 'Retrieval', tech: 'RAG pipeline' },
                    { layer: 'Styling', tech: 'Tailwind CSS, GSAP' },
                    { layer: 'Deploy', tech: 'Vercel Edge' },
                  ].map((item) => (
                    <div key={item.layer} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">{item.layer}</span>
                      <span className="text-gray-900 text-sm font-medium">{item.tech}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== APPENDIX A3: FINANCIAL PROJECTIONS ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-verdex-50/50 to-gold-50/20" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-verdex-600 font-mono text-sm font-bold bg-verdex-100 px-2 py-1 rounded">A3</span>
              <span className="text-gray-400 font-medium">Appendix</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-6">
              Financial <span className="text-verdex-600">Projections</span>
            </h2>
            <div className="grid grid-cols-12 gap-4">
              {/* Revenue Streams */}
              <div className="col-span-12 md:col-span-8 rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.06]" preserveAspectRatio="none">
                  <pattern id="a3-grid" width="14" height="14" patternUnits="userSpaceOnUse">
                    <path d="M 14 0 L 0 14" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#a3-grid)" />
                </svg>
                <h3 className="relative text-lg font-semibold text-white mb-4">Revenue Streams</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { stream: 'Free', range: '$0', target: 'Basic score always free' },
                    { stream: 'Credits', range: '$10-50', target: 'Reports + drafts' },
                    { stream: 'Professional', range: '$500/mo', target: 'Unlimited, API' },
                    { stream: 'Enterprise', range: '$5K+/mo', target: 'Banks, DFIs' },
                  ].map((item) => (
                    <div key={item.stream} className="p-4 rounded-xl bg-white/20 border border-white/10">
                      <div className="text-white font-semibold">{item.stream}</div>
                      <div className="text-emerald-100 text-sm">{item.range}</div>
                      <div className="text-white/60 text-xs mt-1">{item.target}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Why It Scales */}
              <div className="col-span-12 md:col-span-4 glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Why It Scales</h3>
                <div className="space-y-4">
                  <div className="flex justify-between"><span className="text-gray-500">Assessment time</span><span className="font-semibold">&lt;60s vs 2-4 weeks</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Cost per project</span><span className="font-semibold">Free → $50 vs $50K+</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Marginal cost</span><span className="font-semibold text-verdex-600">Near zero</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Geography</span><span className="font-semibold">Any market</span></div>
                </div>
              </div>
              {/* Growth Path */}
              <div className="col-span-12 glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Path</h3>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { phase: 'Now', focus: 'Developer Direct', detail: 'Free tier, credits' },
                    { phase: 'Phase 1', focus: 'DFI Partnerships', detail: 'Pipeline integration' },
                    { phase: 'Phase 2', focus: 'Platform APIs', detail: 'LMA.Automate, Avvoka' },
                    { phase: 'Phase 3', focus: 'Enterprise', detail: '$5K+/mo, white-label' },
                  ].map((item, idx) => (
                    <div key={item.phase} className={`p-4 rounded-xl ${idx === 0 ? 'bg-verdex-100 border-2 border-verdex-300' : 'bg-gray-50'}`}>
                      <div className={`text-xs uppercase tracking-wider mb-1 ${idx === 0 ? 'text-verdex-600' : 'text-gray-400'}`}>{item.phase}</div>
                      <div className="font-semibold text-gray-900">{item.focus}</div>
                      <div className="text-sm text-gray-500">{item.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== APPENDIX A4: DOCUMENT COVERAGE ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-verdex-50/30" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-verdex-600 font-mono text-sm font-bold bg-verdex-100 px-2 py-1 rounded">A4</span>
              <span className="text-gray-400 font-medium">Appendix</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-6">
              Document <span className="text-verdex-600">Coverage Analysis</span>
            </h2>
            <div className="grid grid-cols-12 gap-4">
              {/* Main Stats */}
              <div className="col-span-12 md:col-span-4 rounded-2xl p-6 bg-gradient-to-br from-emerald-600 to-emerald-800 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
                  <pattern id="a4-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 10" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#a4-grid)" />
                </svg>
                <div className="relative text-6xl font-display font-bold text-white mb-2">2,009</div>
                <div className="text-emerald-100">Total LMA Documents Catalogued</div>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="text-3xl font-display font-bold text-white">20</div>
                  <div className="text-emerald-100 text-sm">Indexed in Phase 1 (MVP)</div>
                </div>
              </div>
              {/* Categories */}
              <div className="col-span-12 md:col-span-8 glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Categories</h3>
                <div className="space-y-3">
                  {[
                    { category: 'LMA Total Library', catalogued: 2009, indexed: '—', pct: 100 },
                    { category: 'Sustainability & Green', catalogued: 161, indexed: 13, pct: 8 },
                    { category: 'Africa-Specific', catalogued: 83, indexed: 3, pct: 4 },
                    { category: 'Transition Finance', catalogued: 42, indexed: 2, pct: 5 },
                    { category: 'External Frameworks', catalogued: 2, indexed: 2, pct: 100 },
                  ].map((item) => (
                    <div key={item.category} className="flex items-center gap-4">
                      <div className="w-48 text-sm text-gray-700">{item.category}</div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-verdex-500 rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                      <div className="w-20 text-right text-sm text-gray-600">{item.catalogued}</div>
                      <div className="w-16 text-right text-sm text-verdex-600 font-semibold">{item.indexed}</div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end gap-8 mt-4 text-xs text-gray-400">
                  <span>Catalogued</span>
                  <span>Indexed</span>
                </div>
              </div>
              {/* Sources */}
              <div className="col-span-12 glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Sources</h3>
                <div className="flex flex-wrap gap-2">
                  {['LMA Website', 'Green Loan Principles', 'Transition Loan Guide Oct 2025', 'SBTi Net-Zero V2', 'OHADA Guidelines', 'ZARONIA Framework', 'Paris Agreement', 'Regional Conference Reports'].map((source) => (
                    <span key={source} className="px-3 py-1 rounded-full bg-verdex-50 text-verdex-700 text-sm">{source}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== APPENDIX A5: MARKET ANALYSIS ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-navy-50/30 to-verdex-50/20" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-navy-600 font-mono text-sm font-bold bg-navy-100 px-2 py-1 rounded">A5</span>
              <span className="text-gray-400 font-medium">Appendix</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-medium text-gray-900 mb-6">
              Market <span className="text-navy-600">Analysis</span>
            </h2>
            <div className="grid grid-cols-12 gap-4">
              {/* TAM/SAM/SOM */}
              <div className="col-span-12 md:col-span-4 rounded-2xl p-5 border-l-4 border-l-slate-500 bg-gradient-to-br from-slate-700 to-slate-800 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.04]" preserveAspectRatio="none">
                  <pattern id="a5-tam-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 8" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#a5-tam-grid)" />
                </svg>
                <div className="relative text-xs text-slate-400 mb-1">TAM</div>
                <div className="relative text-4xl font-display font-bold text-white mb-1">$700B</div>
                <div className="relative text-sm text-slate-300">Global Transition Finance</div>
              </div>
              <div className="col-span-6 md:col-span-4 rounded-2xl p-5 border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-600 to-emerald-700 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
                  <pattern id="a5-sam-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 8" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#a5-sam-grid)" />
                </svg>
                <div className="relative text-xs text-emerald-200 mb-1">SAM</div>
                <div className="relative text-4xl font-display font-bold text-white mb-1">$25B</div>
                <div className="relative text-sm text-emerald-100">Africa by 2030</div>
              </div>
              <div className="col-span-6 md:col-span-4 rounded-2xl p-5 border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-500 to-amber-600 relative overflow-hidden">
                <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
                  <pattern id="a5-som-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                    <path d="M 8 0 L 0 8" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#a5-som-grid)" />
                </svg>
                <div className="relative text-xs text-amber-100 mb-1">SOM</div>
                <div className="relative text-4xl font-display font-bold text-white mb-1">$20M</div>
                <div className="relative text-sm text-amber-50">ARR Year 5</div>
              </div>
              {/* Priority Markets */}
              <div className="col-span-12 md:col-span-6 glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Priority Markets</h3>
                  <span className="text-verdex-600 font-bold bg-verdex-50 px-3 py-1 rounded-full">$77B Pipeline</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { country: 'Nigeria', pipeline: '$18B' },
                    { country: 'South Africa', pipeline: '$15B' },
                    { country: 'Egypt', pipeline: '$14B' },
                    { country: 'Kenya', pipeline: '$12B' },
                    { country: 'Morocco', pipeline: '$8B' },
                    { country: 'Others', pipeline: '$10B' },
                  ].map((item) => (
                    <div key={item.country} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                      <span className="text-gray-700">{item.country}</span>
                      <span className="text-verdex-600 font-semibold">{item.pipeline}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Market Drivers */}
              <div className="col-span-12 md:col-span-6 glass-card rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Drivers</h3>
                <div className="space-y-3">
                  {[
                    '$233B annual climate finance gap in Africa',
                    '5-8x higher borrowing costs vs developed markets',
                    'Growing DFI mandates for climate deployment',
                    'FCA anti-greenwashing rules (Dec 2024)',
                    'EU ESG transparency requirements (Jul 2026)',
                    'LMA Transition Loan Guide (Oct 2025)',
                  ].map((driver) => (
                    <div key={driver} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                      <div className="w-2 h-2 rounded-full bg-verdex-500 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{driver}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
}
