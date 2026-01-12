'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import {
  ArrowUpRight,
  Zap,
  Shield,
  Building2,
  FileCheck,
  FileText,
  Check,
  Clock,
  Database,
  Users,
  TrendingUp,
  Target,
  Code,
  DollarSign,
  Leaf,
  Sun,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Play,
  Layers,
  Link2
} from 'lucide-react';

// Register GSAP plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function PitchDeckPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const totalSections = 12;

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
          style={{ width: `${((currentSection + 1) / 12) * 100}%` }}
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
          {Array.from({ length: 12 }).map((_, i) => (
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
                {['Title', 'Opportunity', 'Gap', 'Solution', 'Process', 'Landscape', 'API', 'Business', 'Traction', 'Market', 'Regulations', 'Ask'][i]}
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

      {/* ==================== SECTION 2: THE OPPORTUNITY ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Layered gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-verdex-50/60 to-gold-50/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-verdex-100/20" />
        {/* Radial glow */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-verdex-200/20 rounded-full blur-[120px]" />
        <TopographicLines className="top-0 right-0 w-[400px] h-[400px] translate-x-[20%] -translate-y-[20%] opacity-[0.08]" flip />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Section label */}
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-gold-500 to-gold-600" />
              <span className="text-gold-600 font-semibold tracking-wider uppercase text-sm">The Opportunity</span>
            </div>

            {/* Bento grid layout */}
            <div className="grid grid-cols-12 gap-4">
              {/* Main stat - Large card with Verdex texture */}
              <div className="bento-card col-span-12 md:col-span-7 row-span-2 relative overflow-hidden rounded-3xl p-8 md:p-12 bg-gradient-to-br from-verdex-500 via-verdex-900 to-verdex-800">
                {/* Grid texture */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
                  <pattern id="gap-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 10" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#gap-grid)" />
                </svg>
                {/* Blurred orbs */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.06] rounded-full blur-[80px]" />
                <div className="absolute -bottom-10 left-1/4 w-32 h-32 bg-emerald-300/[0.08] rounded-full blur-[60px]" />
                <div className="relative z-10">
                  <span className="text-white/80 text-lg font-medium">Africa&apos;s Climate Finance Gap</span>
                  <div className="big-number text-7xl md:text-9xl font-display font-bold text-white mt-2 mb-6" data-value="$233B">
                    $233B
                  </div>
                  <p className="text-xl text-white/70 max-w-md">
                    Africa holds 60% of the world&apos;s best solar resources but receives only 2% of global climate finance.
                  </p>
                  <div className="mt-8 inline-flex items-center gap-2 text-white font-semibold bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span>This is a market inefficiency</span>
                    <ArrowUpRight className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Stats cards - Right column */}
              <div className="bento-card col-span-6 md:col-span-5 glass-card rounded-3xl p-6 flex flex-col justify-between border-l-4 border-l-gold-500">
                <Sun className="w-8 h-8 text-gold-500" strokeWidth={1.5} />
                <div>
                  <div className="text-4xl font-display font-bold text-gray-900">60%</div>
                  <div className="text-gray-500 text-sm">World&apos;s Best Solar</div>
                </div>
              </div>

              <div className="bento-card col-span-6 md:col-span-5 glass-card rounded-3xl p-6 flex flex-col justify-between border-l-4 border-l-verdex-500">
                <TrendingUp className="w-8 h-8 text-verdex-600" strokeWidth={1.5} />
                <div>
                  <div className="text-4xl font-display font-bold text-gray-900">5x</div>
                  <div className="text-gray-500 text-sm">Growth by 2030</div>
                </div>
              </div>

              {/* Why now - Full width */}
              <div className="bento-card col-span-12 glass-card rounded-3xl border-l-4 border-l-verdex-500 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-2 h-2 bg-verdex-500 rounded-full animate-pulse" />
                  <span className="text-verdex-700 font-semibold">Why Now</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: FileCheck, title: 'LMA Guide', desc: 'October 2025' },
                    { icon: Shield, title: 'Regulatory Push', desc: 'FCA crackdown' },
                    { icon: Building2, title: 'DFI Demand', desc: 'Seeking pipeline' },
                    { icon: Target, title: 'First Mover', desc: 'No competition' },
                  ].map((item, i) => (
                    <div key={i} className="animate-item flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-verdex-50 border border-verdex-100 flex items-center justify-center flex-shrink-0">
                        <item.icon className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{item.title}</div>
                        <div className="text-sm text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 3: THE GAP ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Subtle warm gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-rose-50/30 to-gray-50" />
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-rose-100/20 to-transparent" />
        {/* Subtle glow */}
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-rose-200/15 rounded-full blur-[100px]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="animate-item flex items-center gap-3 mb-3">
              <div className="w-12 h-[2px] bg-gradient-to-r from-rose-500 to-rose-400" />
              <span className="text-rose-600 font-semibold tracking-wider uppercase text-sm">The Gap</span>
            </div>
            <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900 mb-6">
              Viable Projects Exist. <span className="text-rose-500">The Bridge Doesn&apos;t.</span>
            </h2>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-4">
              {/* Projects Card - Large */}
              <div className="bento-card col-span-12 md:col-span-5 glass-card rounded-3xl border-l-4 border-l-verdex-500 p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-verdex-100 flex items-center justify-center">
                    <Leaf className="w-7 h-7 text-verdex-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900">African Projects</h3>
                    <p className="text-gray-500">Seeking Capital</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-verdex-50">
                    <Check className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                    <span className="text-verdex-700 font-medium">Viable projects exist</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-verdex-50">
                    <Check className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                    <span className="text-verdex-700 font-medium">Documentation ready</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span className="text-rose-600 font-medium">No LMA expertise</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span className="text-rose-600 font-medium">High borrowing costs (5-8x)</span>
                  </div>
                </div>
              </div>

              {/* Gap Indicator - Center */}
              <div className="col-span-12 md:col-span-2 flex flex-col items-center justify-center py-4">
                <div className="text-6xl font-display font-bold text-rose-300 mb-2">?</div>
                <div className="w-24 h-1 bg-gradient-to-r from-verdex-400 via-rose-400 to-gold-400 rounded-full mb-2" />
                <div className="text-rose-500 font-bold text-lg">THE GAP</div>
                <p className="text-gray-500 text-sm text-center mt-1">No validation layer</p>
              </div>

              {/* Capital Card - Large */}
              <div className="bento-card col-span-12 md:col-span-5 glass-card rounded-3xl border-l-4 border-l-gold-500 p-6">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-gold-100 flex items-center justify-center">
                    <DollarSign className="w-7 h-7 text-gold-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900">Global Capital</h3>
                    <p className="text-gray-500">Ready to Deploy</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-verdex-50">
                    <Check className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                    <span className="text-verdex-700 font-medium">$700B available globally</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-verdex-50">
                    <Check className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                    <span className="text-verdex-700 font-medium">Appetite to deploy</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span className="text-rose-600 font-medium">Greenwashing fears</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-50">
                    <span className="text-rose-500 font-bold">✗</span>
                    <span className="text-rose-600 font-medium">Weeks for due diligence</span>
                  </div>
                </div>
              </div>

              {/* Bottom Stats Row */}
              <div className="col-span-12 grid grid-cols-3 gap-4">
                {[
                  { value: '5-8x', label: 'Higher Borrowing Costs', desc: 'vs developed markets', color: 'rose' },
                  { value: '$17.5M', label: 'FCA Fines 2024', desc: 'Greenwashing penalties', color: 'rose' },
                  { value: '2-4 wks', label: 'Due Diligence', desc: 'Traditional process', color: 'rose' },
                ].map((item, i) => (
                  <div key={i} className={`bento-card glass-card rounded-2xl p-5 text-center border-t-4 border-t-rose-400`}>
                    <div className="text-3xl font-display font-bold text-rose-500 mb-1">{item.value}</div>
                    <div className="font-semibold text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
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

        <div className="section-content relative z-10 w-full px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {/* Header - compact */}
            <div className="text-center mb-5">
              <div className="intro-header inline-flex items-center gap-2 mb-2 px-3 py-1.5 rounded-full bg-verdex-500/20 border border-verdex-500/30">
                <Play className="w-3 h-3 text-verdex-300" strokeWidth={1.5} />
                <span className="text-verdex-300 font-medium text-xs">Introducing</span>
              </div>
              <h2 className="intro-header text-4xl md:text-5xl font-display font-bold text-white mb-2">Verdex</h2>
              <p className="intro-header text-lg text-verdex-300 max-w-xl mx-auto">
                The compliance infrastructure layer connecting African projects to global capital
              </p>
            </div>

            {/* Bridge Visualization */}
            <div className="grid grid-cols-12 gap-4 items-center mb-5">
              {/* Projects Side */}
              <div className="col-span-6 md:col-span-2 intro-side-left">
                <div className="intro-side-card rounded-2xl bg-white/5 border border-white/10 p-5 text-center hover:bg-white/10 transition-all duration-300">
                  <Leaf className="w-6 h-6 text-verdex-400 mx-auto mb-3" strokeWidth={1.5} />
                  <h3 className="text-base font-semibold text-white mb-1">African Projects</h3>
                  <p className="text-verdex-300 text-sm">Seeking capital</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex col-span-1 justify-center intro-arrow">
                <ChevronRight className="w-5 h-5 text-verdex-400/60 animate-pulse" />
              </div>

              {/* Verdex Center - Hero */}
              <div className="col-span-12 md:col-span-6 intro-verdex-hero">
                <div className="relative rounded-2xl overflow-hidden group">
                  {/* Animated outer glow */}
                  <div className="intro-glow absolute -inset-1 bg-gradient-to-r from-verdex-500/50 via-emerald-400/30 to-verdex-500/50 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-verdex-500/40 via-emerald-400/20 to-verdex-500/40 rounded-2xl blur-lg" />

                  <div className="relative intro-verdex-card rounded-2xl bg-gradient-to-br from-verdex-900 via-verdex-800 to-verdex-900 border border-verdex-500/30 p-7 hover:border-verdex-400/50 transition-colors duration-300">
                    <svg className="absolute inset-0 w-full h-full opacity-[0.05]" preserveAspectRatio="none">
                      <pattern id="verdex-intro-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                        <path d="M 10 0 L 0 10" stroke="white" strokeWidth="0.5" fill="none" />
                      </pattern>
                      <rect width="100%" height="100%" fill="url(#verdex-intro-grid)" />
                    </svg>

                    <div className="relative flex items-center gap-5">
                      {/* VERDEX label */}
                      <div className="text-center flex-shrink-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className="intro-pulse-dot w-2 h-2 rounded-full bg-verdex-400" />
                          <span className="text-verdex-300 text-xs font-medium uppercase tracking-wider">Platform</span>
                        </div>
                        <div className="text-3xl font-display font-bold text-white tracking-wide">VERDEX</div>
                      </div>

                      {/* Divider */}
                      <div className="w-px h-16 bg-gradient-to-b from-transparent via-verdex-500/50 to-transparent" />

                      {/* Features as 2x2 grid */}
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        {[
                          { action: 'Validate', desc: 'LMA' },
                          { action: 'Detect', desc: 'Greenwash' },
                          { action: 'Match', desc: 'DFIs' },
                          { action: 'Generate', desc: 'KPIs' },
                        ].map((item, i) => (
                          <div
                            key={item.action}
                            className="intro-feature flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-200"
                          >
                            <span className="w-5 h-5 rounded text-xs font-bold bg-verdex-500/30 text-verdex-300 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                            <div className="leading-tight">
                              <span className="text-white text-sm font-medium">{item.action}</span>
                              <span className="text-gray-400 text-xs ml-1">{item.desc}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex col-span-1 justify-center intro-arrow">
                <ChevronRight className="w-5 h-5 text-gold-400/60 animate-pulse" />
              </div>

              {/* Capital Side */}
              <div className="col-span-6 md:col-span-2 intro-side-right">
                <div className="intro-side-card rounded-2xl bg-white/5 border border-white/10 p-5 text-center hover:bg-white/10 transition-all duration-300">
                  <DollarSign className="w-6 h-6 text-gold-400 mx-auto mb-3" strokeWidth={1.5} />
                  <h3 className="text-base font-semibold text-white mb-1">Global Capital</h3>
                  <p className="text-gold-300 text-sm">$700B ready</p>
                </div>
              </div>
            </div>

            {/* Features Grid - 5 columns */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: FileCheck, title: 'LMA Validator', desc: '5 Core Components', stat: '<60s' },
                { icon: Shield, title: 'Greenwash Detection', desc: 'AI-Powered Analysis', stat: '95%' },
                { icon: Users, title: 'DFI Matching', desc: 'Smart Recommendations', stat: '7+' },
                { icon: Zap, title: 'KPI Generator', desc: 'Automated Metrics', stat: 'Auto' },
                { icon: Code, title: 'API Integration', desc: 'Ecosystem Ready', stat: 'REST' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="intro-bottom-card rounded-2xl bg-white/5 border border-white/10 p-5 hover:bg-white/10 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-verdex-400 mb-3" strokeWidth={1.5} />
                  <div className="font-semibold text-white mb-1">{feature.title}</div>
                  <div className="text-sm text-gray-400 mb-3">{feature.desc}</div>
                  <div className="text-lg font-display font-bold text-verdex-400">{feature.stat}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 5: HOW IT WORKS ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Layered gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-verdex-50/30 to-gray-50" />
        <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-verdex-100/30 to-transparent" />
        {/* Glow */}
        <div className="absolute bottom-1/3 left-1/3 w-[400px] h-[400px] bg-verdex-200/15 rounded-full blur-[100px]" />
        <TopographicLines className="bottom-0 right-0 w-[400px] h-[400px] translate-x-[20%] translate-y-[20%] opacity-[0.08]" flip />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-verdex-600 to-verdex-500" />
              <span className="text-verdex-700 font-semibold tracking-wider uppercase text-sm">Process</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900">
                How It <span className="text-verdex-600">Works</span>
              </h2>
              <div className="animate-item mt-4 md:mt-0 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-verdex-600 shadow-verdex">
                <Clock className="w-5 h-5 text-white" strokeWidth={1.5} />
                <span className="text-white font-semibold">Under 60 Seconds</span>
              </div>
            </div>

            {/* Process steps */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              {[
                { step: 1, title: 'Upload', desc: 'Submit project PDF or fill the assessment form', output: 'Structured data', icon: FileCheck },
                { step: 2, title: 'Validate', desc: 'AI scores against LMA 5 Core Components', output: 'Score 0-100', icon: Shield },
                { step: 3, title: 'Match', desc: 'Connect with relevant DFIs based on criteria', output: 'Ranked DFIs', icon: Users },
                { step: 4, title: 'Generate', desc: 'Create KPIs, SPTs, and documentation', output: 'Investor pack', icon: Zap },
              ].map((item) => (
                <div key={item.step} className="bento-card glass-card rounded-3xl border-l-4 border-l-verdex-500 p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-verdex-50 border border-verdex-100 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-verdex-600 font-mono text-sm font-semibold">0{item.step}</div>
                  </div>
                  <h3 className="text-xl font-display font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-4">{item.desc}</p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-verdex-50 border border-verdex-200">
                    <span className="text-verdex-700 text-xs font-medium">{item.output}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bento-card glass-card rounded-3xl border-l-4 border-l-verdex-500 p-8">
                <h3 className="text-2xl font-display font-semibold text-verdex-700 mb-6">Verdex</h3>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between"><span className="text-gray-500">Time</span><span className="text-verdex-700 font-semibold">&lt;60 seconds</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Cost</span><span className="text-verdex-700 font-semibold">$500-2K/mo</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Output</span><span className="text-verdex-700 font-semibold">API-ready</span></div>
                </div>
              </div>
              <div className="bento-card glass-card rounded-3xl p-5">
                <h3 className="text-2xl font-display font-semibold text-gray-400 mb-6">Traditional</h3>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between"><span className="text-gray-400">Time</span><span className="text-gray-400">2-4 weeks</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Cost</span><span className="text-gray-400">$50K+ consulting</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Output</span><span className="text-gray-400">Manual</span></div>
                </div>
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
              Verdex is the <span className="text-verdex-600">Missing Layer</span>
            </h2>
            <p className="animate-item text-xl text-gray-500 mb-6 max-w-2xl">
              Not a competitor &mdash; the connector that the ecosystem needs
            </p>

            {/* Three layer visualization - enhanced layout */}
            <div className="grid grid-cols-12 gap-4 items-stretch">
              {/* Document Layer */}
              <div className="col-span-12 md:col-span-3 bento-card glass-card rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-500">Document Layer</h3>
                </div>
                <div className="space-y-2">
                  {['LMA.Automate', 'Avvoka', 'Allen & Overy'].map((name) => (
                    <div key={name} className="px-3 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm text-center font-medium">
                      {name}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-400 italic">&ldquo;HOW to draft&rdquo;</div>
              </div>

              {/* VERDEX Validation Layer - Center, larger */}
              <div className="col-span-12 md:col-span-6 bento-card glass-card rounded-3xl border-2 border-verdex-300 p-6 shadow-verdex relative bg-gradient-to-br from-white via-verdex-50/30 to-white">
                {/* Connection lines */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full w-8 h-[3px] bg-gradient-to-r from-gray-200 to-verdex-400 hidden md:block" />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full w-8 h-[3px] bg-gradient-to-l from-gold-300 to-verdex-400 hidden md:block" />

                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-verdex-200/20 blur-xl -z-10" />

                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-verdex-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-semibold text-verdex-700">Validation Layer</h3>
                </div>

                <div className="text-center">
                  <div className="inline-block px-6 py-3 rounded-2xl bg-gradient-to-r from-verdex-600 to-verdex-500 mb-4">
                    <span className="text-3xl font-display font-bold text-white tracking-wide">VERDEX</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-verdex-50 border border-verdex-200">
                      <div className="text-xs text-verdex-500 uppercase tracking-wider mb-1">Question 1</div>
                      <div className="text-verdex-700 font-medium">&ldquo;IS it compliant?&rdquo;</div>
                    </div>
                    <div className="p-3 rounded-xl bg-verdex-50 border border-verdex-200">
                      <div className="text-xs text-verdex-500 uppercase tracking-wider mb-1">Question 2</div>
                      <div className="text-verdex-700 font-medium">&ldquo;WHO should fund?&rdquo;</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-verdex-100 flex justify-center gap-4 text-xs text-verdex-600">
                    <span className="flex items-center gap-1"><Check className="w-3 h-3" strokeWidth={1.5} /> Real-time</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3" strokeWidth={1.5} /> AI-powered</span>
                    <span className="flex items-center gap-1"><Check className="w-3 h-3" strokeWidth={1.5} /> LMA standards</span>
                  </div>
                </div>
              </div>

              {/* Capital Layer */}
              <div className="col-span-12 md:col-span-3 bento-card glass-card rounded-3xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gold-100 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-gold-600" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-semibold text-gray-500">Capital Layer</h3>
                </div>
                <div className="space-y-2">
                  {['DFIs (IFC, AfDB)', 'Banks', 'Climate Investors'].map((name) => (
                    <div key={name} className="px-3 py-2.5 rounded-xl bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm text-center font-medium">
                      {name}
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 text-center text-sm text-gray-400 italic">&ldquo;WHAT to fund&rdquo;</div>
              </div>
            </div>

            {/* Unique positioning - enhanced checkpoints */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Pre-validation layer', desc: 'Compliance before capital', icon: 'layers' },
                { label: 'LMA 5 Components', desc: 'Full standard coverage', icon: 'file' },
                { label: 'API to both layers', desc: 'Seamless integration', icon: 'link' },
                { label: '2,009 docs catalogued', desc: 'Growing knowledge base', icon: 'database' },
              ].map((item, i) => (
                <div key={i} className="bento-card glass-card rounded-2xl border-l-4 border-l-verdex-500 p-4 hover:shadow-verdex transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-verdex-100 flex items-center justify-center flex-shrink-0">
                      {item.icon === 'layers' && <Layers className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />}
                      {item.icon === 'file' && <FileText className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />}
                      {item.icon === 'link' && <Link2 className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />}
                      {item.icon === 'database' && <Database className="w-4 h-4 text-verdex-600" strokeWidth={1.5} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Check className="w-4 h-4 text-verdex-600 flex-shrink-0" strokeWidth={1.5} />
                        <span className="text-verdex-700 text-sm font-semibold">{item.label}</span>
                      </div>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 7: API INTEGRATION ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Cool gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-verdex-50/40 to-navy-50/20" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-verdex-100/30 rounded-full blur-[100px]" />
        <TopographicLines className="top-0 left-0 w-[400px] h-[400px] -translate-x-[20%] -translate-y-[20%] opacity-[0.06]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-navy-600 to-navy-500" />
              <span className="text-navy-600 font-semibold tracking-wider uppercase text-sm">Integration</span>
            </div>

            <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900 mb-6">
              API-First <span className="text-navy-600">Architecture</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Left partners */}
              <div className="space-y-4">
                {[
                  { name: 'LMA.Automate', desc: 'Validated data, KPIs', type: 'API licensing' },
                  { name: 'Avvoka', desc: 'Compliance scores', type: 'API licensing' },
                ].map((partner, i) => (
                  <div key={i} className="bento-card glass-card rounded-2xl p-4 hover:shadow-verdex transition-shadow text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">{partner.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{partner.desc}</p>
                    <span className="text-xs text-navy-600 font-medium">{partner.type}</span>
                  </div>
                ))}
              </div>

              {/* Center - API hub with aura */}
              <div className="flex items-center justify-center relative">
                {/* Outer glow rings */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[280px] h-[280px] rounded-full bg-navy-400/5 blur-xl" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[220px] h-[220px] rounded-full bg-verdex-400/8 blur-lg" />
                </div>

                <div className="relative bento-card rounded-3xl p-6 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 border border-navy-700/50 shadow-2xl">
                  {/* Inner glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-verdex-500/10 via-transparent to-navy-500/10" />

                  {/* Header */}
                  <div className="relative text-center mb-5">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-navy-700/50 border border-navy-600/50 mb-3">
                      <div className="w-2 h-2 rounded-full bg-verdex-400 animate-pulse" />
                      <span className="text-xs text-navy-300 font-medium tracking-wider uppercase">Live</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-white">VERDEX APIs</h3>
                  </div>

                  {/* Endpoints - centered grid */}
                  <div className="relative grid grid-cols-2 gap-2">
                    {[
                      { endpoint: '/assess', desc: 'Compliance check', icon: Shield },
                      { endpoint: '/match', desc: 'Funder matching', icon: Target },
                      { endpoint: '/generate', desc: 'Doc generation', icon: FileCheck },
                      { endpoint: '/search', desc: 'Knowledge base', icon: Database },
                    ].map((item) => (
                      <div key={item.endpoint} className="group flex flex-col items-center text-center px-4 py-3 rounded-xl bg-navy-800/80 border border-navy-700/50 hover:border-verdex-500/50 hover:bg-navy-700/50 transition-all">
                        <item.icon className="w-5 h-5 text-verdex-400 mb-2" />
                        <code className="text-verdex-300 font-mono text-sm font-semibold">{item.endpoint}</code>
                        <span className="text-navy-400 text-xs mt-1">{item.desc}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom accent */}
                  <div className="mt-4 pt-4 border-t border-navy-700/50 flex justify-center gap-3 text-xs text-navy-400">
                    <span className="flex items-center gap-1"><Code className="w-3 h-3" strokeWidth={1.5} /> RESTful</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" strokeWidth={1.5} /> &lt;100ms</span>
                    <span className="flex items-center gap-1"><Shield className="w-3 h-3" strokeWidth={1.5} /> OAuth 2.0</span>
                  </div>
                </div>
              </div>

              {/* Right partners */}
              <div className="space-y-4">
                {[
                  { name: 'DFIs', desc: 'Pre-screened pipeline', type: 'Success fees' },
                  { name: 'Banks', desc: 'Greenwash verification', type: 'Subscription' },
                ].map((partner, i) => (
                  <div key={i} className="bento-card glass-card rounded-2xl p-4 hover:shadow-gold transition-shadow text-center">
                    <h4 className="font-semibold text-gray-900 mb-2">{partner.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{partner.desc}</p>
                    <span className="text-xs text-gold-600 font-medium">{partner.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Roadmap */}
            <div className="mt-4 bento-card glass-card rounded-3xl p-5">
              <h3 className="text-xl font-display font-bold text-gray-900 mb-3 text-center">2026 Roadmap</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { q: 'Q1', name: 'LMA.Automate', status: 'Pilot' },
                  { q: 'Q2', name: 'DFI APIs', status: 'IFC, AfDB' },
                  { q: 'Q3', name: 'Avvoka', status: 'Partnership' },
                  { q: 'Q4', name: 'Banks', status: 'Integration' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl bg-gray-50">
                    <div className="text-2xl font-display font-bold text-navy-600 mb-2">{item.q}</div>
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.status}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 8: BUSINESS MODEL ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Mesh gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-verdex-50/50 to-gold-50/20" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-verdex-100/25 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gold-100/20 rounded-full blur-[100px]" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-verdex-600 to-verdex-500" />
              <span className="text-verdex-700 font-semibold tracking-wider uppercase text-sm">Business</span>
            </div>

            <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900 mb-6">
              Four Revenue <span className="text-verdex-600">Streams</span>
            </h2>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-3">
              {/* SaaS - Hero card with texture */}
              <div className="col-span-12 md:col-span-8 bento-card rounded-2xl p-6 bg-gradient-to-br from-verdex-600 via-verdex-900 to-verdex-700 relative overflow-hidden">
                {/* Grid texture */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
                  <pattern id="saas-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 10" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#saas-grid)" />
                </svg>
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.06] rounded-full blur-[80px]" />
                <div className="absolute -bottom-10 left-1/4 w-32 h-32 bg-emerald-300/[0.08] rounded-full blur-[60px]" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <span className="text-xs bg-white/10 backdrop-blur-sm text-white/90 px-3 py-1 rounded-full font-semibold">PRIMARY REVENUE</span>
                    <h3 className="text-xl font-display font-bold text-white mt-3">SaaS Subscription</h3>
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="text-5xl font-display font-bold text-white">$500-10K</span>
                      <span className="text-white/50">/month</span>
                    </div>
                  </div>
                  {/* Tiers */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                    <div className="text-xs text-white/50 mb-2">Tiers</div>
                    <div className="space-y-1 text-sm">
                      <div className="text-white/70">Starter: $500/mo</div>
                      <div className="text-white/70">Pro: $2K/mo</div>
                      <div className="text-white font-semibold">Enterprise: $10K/mo</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transaction Fees */}
              <div className="col-span-6 md:col-span-4 bento-card glass-card rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-navy-600" strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-gray-900">Transactions</span>
                </div>
                <div className="text-2xl font-display font-bold text-gray-900">5-15 bps</div>
                <div className="text-xs text-gray-400">/deal</div>
                <div className="text-xs text-gray-500 mt-2">e.g. $50K on $100M deal</div>
              </div>

              {/* API */}
              <div className="col-span-6 md:col-span-4 bento-card glass-card rounded-2xl p-4 border-l-4 border-l-verdex-500">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-verdex-100 flex items-center justify-center">
                    <Code className="w-5 h-5 text-verdex-600" strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-gray-900">API</span>
                  <span className="text-xs bg-verdex-100 text-verdex-700 px-2 py-0.5 rounded-full">NEW</span>
                </div>
                <div className="text-2xl font-display font-bold text-verdex-700">$50K+</div>
                <div className="text-xs text-gray-400">/year</div>
              </div>

              {/* Data */}
              <div className="col-span-6 md:col-span-4 bento-card glass-card rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-navy-100 flex items-center justify-center">
                    <Database className="w-5 h-5 text-navy-600" strokeWidth={1.5} />
                  </div>
                  <span className="font-medium text-gray-900">Data</span>
                </div>
                <div className="text-2xl font-display font-bold text-gray-900">$25-100K</div>
                <div className="text-xs text-gray-400">/year</div>
              </div>

              {/* Unit Economics */}
              <div className="col-span-6 md:col-span-4 bento-card glass-card rounded-2xl p-4 flex flex-col items-center justify-center text-center">
                <div className="text-xs text-gray-400 mb-1">LTV:CAC</div>
                <div className="text-xl font-display font-bold text-gray-900">15:1 <span className="text-verdex-500">→</span> 188:1</div>
                <div className="text-xs text-gray-500 mt-2">Y1 to Y5 as platform scales</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 9: TRACTION ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-verdex-50/30" />
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-verdex-50/20 to-transparent" />
        {/* Glow */}
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-verdex-200/15 rounded-full blur-[100px]" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-verdex-600 to-verdex-500" />
              <span className="text-verdex-700 font-semibold tracking-wider uppercase text-sm">Traction</span>
            </div>

            <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900 mb-6">
              Foundation is <span className="text-verdex-600">Laid</span>
            </h2>

            {/* Symmetric bento grid layout */}
            <div className="grid grid-cols-12 gap-4">
              {/* MVP Live - spans top */}
              <div className="col-span-12 md:col-span-4 bento-card glass-card rounded-2xl p-5 border-2 border-verdex-200 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-3 h-3 bg-verdex-500 rounded-full animate-pulse" />
                  <span className="text-verdex-600 font-semibold text-lg">MVP Live</span>
                </div>
                <span className="text-2xl font-display font-bold text-gray-900">verdx.site</span>
              </div>

              {/* Hero stat - 2,009 with Verdex texture */}
              <div className="col-span-12 md:col-span-8 bento-card rounded-3xl p-6 bg-gradient-to-br from-verdex-600 via-verdex-800 to-verdex-900 relative overflow-hidden">
                {/* Grid texture */}
                <svg className="absolute inset-0 w-full h-full opacity-[0.08]" preserveAspectRatio="none">
                  <pattern id="moat-grid" width="10" height="10" patternUnits="userSpaceOnUse">
                    <path d="M 10 0 L 0 10" stroke="white" strokeWidth="0.5" fill="none" />
                  </pattern>
                  <rect width="100%" height="100%" fill="url(#moat-grid)" />
                </svg>
                {/* Blurred orbs */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-white/[0.06] rounded-full blur-[80px]" />
                <div className="absolute -bottom-10 left-1/4 w-32 h-32 bg-emerald-300/[0.08] rounded-full blur-[60px]" />

                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="w-4 h-4 text-white/80" strokeWidth={1.5} />
                      <span className="text-white/80 text-sm font-semibold">The Moat</span>
                    </div>
                    <div className="text-6xl font-display font-bold text-white">2,009</div>
                    <div className="text-white/60">Documents Catalogued</div>
                  </div>
                  <div className="text-right">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                      <div className="text-3xl font-display font-bold text-white">20</div>
                      <div className="text-white/60 text-sm">Indexed Docs</div>
                    </div>
                    <div className="text-white/40 text-xs mt-2">No competitor has this</div>
                  </div>
                </div>
              </div>

              {/* Bottom row - 4 equal stats */}
              <div className="col-span-6 md:col-span-3 bento-card glass-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-display font-bold text-navy-600">83</div>
                <div className="text-xs text-gray-400">Africa-Specific</div>
              </div>
              <div className="col-span-6 md:col-span-3 bento-card glass-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-display font-bold text-navy-600">12</div>
                <div className="text-xs text-gray-400">Years Coverage</div>
              </div>
              <div className="col-span-6 md:col-span-3 bento-card glass-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-display font-bold text-navy-600">500+</div>
                <div className="text-xs text-gray-400">Clauses</div>
              </div>
              <div className="col-span-6 md:col-span-3 bento-card glass-card rounded-2xl p-4 text-center">
                <div className="text-3xl font-display font-bold text-navy-600">7</div>
                <div className="text-xs text-gray-400">DFI Partners</div>
              </div>

              {/* Value Proposition Quote */}
              <div className="col-span-12 pt-4 mt-2 text-center">
                <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
                  <span className="text-verdex-600 font-semibold">When borrowers understand the standards, they come prepared.</span>{' '}
                  Deals close faster. LMA framework adoption grows. The market becomes more efficient.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 10: MARKET ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Layered gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-navy-50/30 to-verdex-50/20" />
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-navy-100/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-verdex-100/25 rounded-full blur-[100px]" />

        {/* Background texture - concentric circles with glow */}
        <div className="absolute top-1/2 right-0 translate-x-1/4 -translate-y-1/2 w-[700px] h-[700px]">
          <div className="absolute inset-0 bg-verdex-200/20 rounded-full blur-[80px]" />
          <svg className="absolute inset-0 w-full h-full opacity-[0.12]" viewBox="0 0 400 400">
            <circle cx="200" cy="200" r="50" fill="none" stroke="#22c55e" strokeWidth="1.5" />
            <circle cx="200" cy="200" r="100" fill="none" stroke="#22c55e" strokeWidth="1.2" />
            <circle cx="200" cy="200" r="150" fill="none" stroke="#22c55e" strokeWidth="0.8" />
            <circle cx="200" cy="200" r="200" fill="none" stroke="#22c55e" strokeWidth="0.5" />
            <circle cx="200" cy="200" r="6" fill="#22c55e" opacity="0.4" />
          </svg>
        </div>

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="animate-item flex items-center gap-3 mb-3">
              <div className="w-12 h-[2px] bg-gradient-to-r from-navy-600 to-navy-500" />
              <span className="text-navy-600 font-semibold tracking-wider uppercase text-sm">Market</span>
            </div>
            <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900 mb-5">
              Market <span className="text-verdex-600">Opportunity</span>
            </h2>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-12 gap-3">
              {/* TAM */}
              <div className="col-span-12 md:col-span-4 bento-card glass-card rounded-2xl p-5 border-l-4 border-l-navy-500">
                <div className="text-xs text-gray-400 mb-1">TAM</div>
                <div className="text-4xl font-display font-bold text-navy-600 mb-1">$700B</div>
                <div className="text-sm text-gray-500">Global Transition Finance</div>
              </div>

              {/* SAM */}
              <div className="col-span-6 md:col-span-4 bento-card glass-card rounded-2xl p-5 border-l-4 border-l-verdex-500">
                <div className="text-xs text-gray-400 mb-1">SAM</div>
                <div className="text-4xl font-display font-bold text-verdex-600 mb-1">$25B</div>
                <div className="text-sm text-gray-500">Africa by 2030</div>
              </div>

              {/* SOM */}
              <div className="col-span-6 md:col-span-4 bento-card glass-card rounded-2xl p-5 border-l-4 border-l-gold-500">
                <div className="text-xs text-gray-400 mb-1">SOM</div>
                <div className="text-4xl font-display font-bold text-gold-600 mb-1">$20M</div>
                <div className="text-sm text-gray-500">ARR Year 5</div>
              </div>

              {/* Revenue Projection - bar chart */}
              <div className="col-span-12 md:col-span-7 bento-card glass-card rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">Revenue Projection</h3>
                <div className="flex items-end justify-between gap-3" style={{ height: '120px' }}>
                  {[
                    { year: 'Y1', value: '$450K', height: 12 },
                    { year: 'Y2', value: '$1.5M', height: 18 },
                    { year: 'Y3', value: '$3M', height: 28 },
                    { year: 'Y4', value: '$8M', height: 52 },
                    { year: 'Y5', value: '$20M', height: 120, highlight: true },
                  ].map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div className="text-xs font-semibold text-gray-600 mb-1">{item.value}</div>
                      <div
                        className={`w-full rounded-t-lg ${item.highlight ? 'bg-gradient-to-t from-verdex-600 to-verdex-400' : 'bg-verdex-200'}`}
                        style={{ height: `${item.height}px` }}
                      />
                      <div className={`text-xs mt-2 ${item.highlight ? 'text-verdex-600 font-semibold' : 'text-gray-400'}`}>{item.year}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Priority Markets */}
              <div className="col-span-12 md:col-span-5 bento-card glass-card rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Priority Markets</h3>
                  <span className="text-xs text-verdex-600 font-bold bg-verdex-50 px-2 py-1 rounded-full">$77B</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { country: 'Nigeria', flag: '🇳🇬', pipeline: '$18B' },
                    { country: 'S. Africa', flag: '🇿🇦', pipeline: '$15B' },
                    { country: 'Egypt', flag: '🇪🇬', pipeline: '$14B' },
                    { country: 'Kenya', flag: '🇰🇪', pipeline: '$12B' },
                    { country: 'Morocco', flag: '🇲🇦', pipeline: '$8B' },
                    { country: 'Others', flag: '🌍', pipeline: '$10B' },
                  ].map((item) => (
                    <div key={item.country} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span className="text-sm text-gray-700">{item.country}</span>
                      </div>
                      <span className="text-xs text-verdex-600 font-semibold">{item.pipeline}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 11: REGULATIONS ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Warm gradient with accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-rose-50/30" />
        <div className="absolute top-0 right-0 w-2/3 h-1/2 bg-gradient-to-bl from-rose-100/20 to-transparent" />
        {/* Subtle glow */}
        <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-verdex-100/15 rounded-full blur-[100px]" />
        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-item flex items-center gap-3 mb-4">
              <div className="w-12 h-[2px] bg-gradient-to-r from-rose-500 to-rose-400" />
              <span className="text-rose-600 font-semibold tracking-wider uppercase text-sm">Tailwinds</span>
            </div>

            <h2 className="animate-item text-4xl md:text-5xl font-display font-medium text-gray-900 mb-6">
              Compliance is <span className="text-rose-500">Mandatory</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
              {[
                { date: 'Dec 2024', title: 'FCA Anti-Greenwashing', desc: '$17.5M fines', feature: 'Greenwash Detection', borderColor: 'border-l-rose-500' },
                { date: 'Oct 2025', title: 'LMA Transition Guide', desc: '5 Core Components', feature: 'LMA Validator', borderColor: 'border-l-verdex-500' },
                { date: 'Jul 2026', title: 'EU ESG Transparency', desc: 'Disclosure required', feature: 'Compliance Scoring', borderColor: 'border-l-navy-600' },
              ].map((reg, i) => (
                <div key={i} className={`bento-card glass-card rounded-3xl ${reg.borderColor} border-l-4 p-5`}>
                  <div className="text-sm text-gray-500 mb-2">{reg.date}</div>
                  <h3 className="text-xl font-display font-bold text-gray-900 mb-3">{reg.title}</h3>
                  <p className="text-gray-500 mb-6">{reg.desc}</p>
                  <div className="flex items-center gap-2 text-sm text-verdex-700 font-medium">
                    <Check className="w-4 h-4" strokeWidth={1.5} />
                    <span>Verdex: {reg.feature}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Impact */}
            <div className="bento-card glass-card rounded-3xl border-l-4 border-l-verdex-500 p-8">
              <h3 className="text-xl font-display font-bold text-gray-900 mb-3 text-center">
                If We Enable <span className="text-verdex-600">10%</span> of the Gap
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: '$23B', label: 'Finance Unlocked', sub: 'annually' },
                  { value: '50+ GW', label: 'Renewable Capacity', sub: 'annually' },
                  { value: '100M+', label: 'People with Power', sub: 'annually' },
                  { value: '100M+', label: 'Tonnes CO2e Avoided', sub: 'annually' },
                ].map((impact, i) => (
                  <div key={i} className="text-center p-4 rounded-2xl bg-verdex-50">
                    <div className="text-2xl font-display font-bold text-verdex-700 mb-1">{impact.value}</div>
                    <div className="text-sm text-gray-500">{impact.label}</div>
                    <div className="text-xs text-gray-400">{impact.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== SECTION 12: THE ASK ==================== */}
      <section className="pinned-section h-screen relative flex items-center overflow-hidden snap-start">
        {/* Rich layered dark gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-verdex-950 via-verdex-900 to-navy-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-verdex-800/20" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        {/* Enhanced gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-verdex-500/25 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-gold-500/10 rounded-full blur-[80px]" />

        <div className="section-content relative z-10 w-full px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Two column layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-20 items-center">

              {/* Left side - Quote & Metrics */}
              <div className="md:col-span-7">
                {/* Quote */}
                <blockquote className="animate-item text-2xl md:text-3xl lg:text-4xl text-white font-light leading-relaxed tracking-wide mb-8">
                  &ldquo;Where every project speaks the same language as global lenders &mdash; and every platform gains the validation layer it needs.&rdquo;
                </blockquote>

                {/* Inline metrics */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                  <span className="text-gray-300"><span className="text-2xl font-display font-bold text-white">$233B</span> <span className="text-sm">annual gap</span></span>
                  <span className="text-verdex-500/50">•</span>
                  <span className="text-gray-300"><span className="text-2xl font-display font-bold text-white">$20M</span> <span className="text-sm">ARR Y5</span></span>
                  <span className="text-verdex-500/50">•</span>
                  <span className="text-gray-300"><span className="text-2xl font-display font-bold text-white">2,009</span> <span className="text-sm">docs</span></span>
                  <span className="text-verdex-500/50">•</span>
                  <span className="text-gray-300"><span className="text-2xl font-display font-bold text-white">$77B</span> <span className="text-sm">pipeline</span></span>
                </div>
              </div>

              {/* Right side - The Ask */}
              <div className="md:col-span-5">
                <div className="bg-white/[0.03] backdrop-blur-sm rounded-3xl border border-white/10 p-6">
                  <h2 className="text-xl font-display font-medium text-white mb-5 flex items-center gap-3">
                    <span className="w-8 h-px bg-verdex-500" />
                    The Ask
                  </h2>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Investment</span>
                      <span className="text-verdex-400 text-sm">Seed Round</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Partnership</span>
                      <span className="text-verdex-400 text-sm">LMA.Automate, DFIs</span>
                    </div>
                    <div className="h-px bg-white/10" />
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">Pilot</span>
                      <span className="text-verdex-400 text-sm">Bank Program</span>
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href="https://verdx.site"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-verdex-600 text-white font-medium hover:bg-verdex-500 transition-colors"
                  >
                    verdx.site
                    <ArrowUpRight className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                </div>

                {/* Footer */}
                <div className="mt-4 text-center">
                  <p className="text-gray-400 text-sm">Verdex Pitch Deck &mdash; 2026</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
