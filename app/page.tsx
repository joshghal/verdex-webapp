'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const ctaRef = useRef<HTMLDivElement>(null);
  const heroIllustrationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animation - immediate on load
    const heroTl = gsap.timeline({ defaults: { ease: 'power2.out' } });

    heroTl.fromTo('.hero-badge',
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5 }
    )
    .fromTo('.hero-title',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.7 },
      '-=0.2'
    )
    .fromTo('.hero-subtitle',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.3'
    )
    .fromTo('.hero-buttons',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.5 },
      '-=0.2'
    );

    // Hero illustration animation - zoom out with opacity
    const illustrationTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    illustrationTl.fromTo('.hero-card-main',
      { opacity: 0, scale: 1.3 },
      { opacity: 1, scale: 1, duration: 0.8 },
      0.3
    )
    .fromTo('.hero-floating-lma',
      { opacity: 0, x: -50, scale: 1.3 },
      { opacity: 1, x: 0, scale: 1, duration: 0.6 },
      0.6
    )
    .fromTo('.hero-floating-ai',
      { opacity: 0, x: 50, scale: 1.3 },
      { opacity: 1, x: 0, scale: 1, duration: 0.6 },
      0.7
    );

    // Parallax mouse following for hero illustration
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroIllustrationRef.current) return;

      const rect = heroIllustrationRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const moveX = (e.clientX - centerX) / 30;
      const moveY = (e.clientY - centerY) / 30;

      gsap.to('.hero-card-main', {
        x: moveX * 0.5,
        y: moveY * 0.5,
        duration: 0.5,
        ease: 'power2.out'
      });

      gsap.to('.hero-floating-lma', {
        x: moveX * 1.2,
        y: moveY * 1.2,
        duration: 0.5,
        ease: 'power2.out'
      });

      gsap.to('.hero-floating-ai', {
        x: moveX * 1.5,
        y: moveY * 1.5,
        duration: 0.5,
        ease: 'power2.out'
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Trust indicators - scroll triggered (removed - section deleted)

    // How it works steps - each step triggers individually when visible
    gsap.utils.toArray('.step-card').forEach((card) => {
      const stepCard = card as HTMLElement;
      const stepNode = stepCard.querySelector('.step-node');

      // Animate the card dropping from top
      gsap.fromTo(stepCard,
        {
          opacity: 0,
          y: -60,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: 'back.out(1.2)',
          scrollTrigger: {
            trigger: stepCard,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Animate the number node popping in
      if (stepNode) {
        gsap.fromTo(stepNode,
          {
            opacity: 0,
            scale: 0,
            rotation: -180
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.5,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: stepCard,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            delay: 0.3
          }
        );
      }
    });

    // Section headers - scroll triggered
    gsap.utils.toArray('.section-header').forEach((header) => {
      gsap.fromTo(header as Element,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          scrollTrigger: {
            trigger: header as Element,
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      );
    });

    // Capabilities bento grid - scroll triggered with stagger
    gsap.fromTo('.capability-card',
      { opacity: 0, y: 30, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: '.capabilities-section',
          start: 'top 70%',
          toggleActions: 'play none none none'
        }
      }
    );

    // CTA section - scroll triggered
    gsap.fromTo('.cta-content',
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );

    // Cleanup
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        {/* Animated Blob Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-verdex-50/30 to-white" />

        {/* Topographic Contour Lines - Top Left */}
        <div className="absolute top-0 left-0 w-[520px] h-[520px] -translate-x-[10%] -translate-y-[10%] opacity-0 md:opacity-[0.08] pointer-events-none">
          <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Outermost contours - extending further */}
            <path d="M-50 550 Q80 420 150 300 Q220 180 320 120 Q420 60 550 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 500 Q70 380 140 270 Q210 160 300 100 Q390 40 500 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 450 Q60 340 130 240 Q200 140 280 85 Q360 30 450 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 400 Q50 300 120 210 Q190 120 260 70 Q330 20 400 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 350 Q40 260 110 180 Q180 100 240 55 Q300 10 350 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 300 Q30 220 100 150 Q170 80 220 40 Q270 0 300 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 250 Q20 180 90 120 Q160 60 200 25 Q240 -10 250 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 200 Q10 140 80 90 Q150 40 180 10 Q210 -20 200 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 150 Q0 100 70 60 Q140 20 160 -5 Q180 -30 150 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 100 Q-10 60 60 30 Q130 0 140 -20 Q150 -40 100 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            {/* Middle detail contours */}
            <path d="M0 420 Q80 320 140 230 Q200 140 280 90 Q360 40 420 0" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M20 380 Q90 290 150 210 Q210 130 280 80 Q350 30 400 0" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M40 340 Q100 260 160 190 Q220 120 280 75 Q340 30 380 0" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M60 300 Q110 230 170 170 Q230 110 280 70 Q330 30 360 10" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M80 260 Q120 200 180 150 Q240 100 280 65 Q320 30 340 20" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M100 220 Q130 170 190 130 Q250 90 280 60 Q310 30 320 25" stroke="#059669" strokeWidth="1" fill="none"/>
            {/* Inner detail curves */}
            <path d="M120 180 Q150 145 200 110 Q250 75 280 55 Q310 35 300 30" stroke="#10b981" strokeWidth="0.8" fill="none"/>
            <path d="M140 150 Q165 125 210 95 Q255 65 280 50 Q305 35 295 35" stroke="#10b981" strokeWidth="0.8" fill="none"/>
            <path d="M160 120 Q180 105 220 80 Q260 55 280 45" stroke="#10b981" strokeWidth="0.8" fill="none"/>
            <path d="M180 95 Q200 85 230 68 Q260 50 280 42" stroke="#10b981" strokeWidth="0.6" fill="none"/>
          </svg>
        </div>

        {/* Topographic Contour Lines - Bottom Right */}
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] translate-x-[10%] translate-y-[10%] opacity-[0.15] pointer-events-none rotate-180">
          <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Outermost contours - extending further */}
            <path d="M-50 550 Q80 420 150 300 Q220 180 320 120 Q420 60 550 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 500 Q70 380 140 270 Q210 160 300 100 Q390 40 500 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 450 Q60 340 130 240 Q200 140 280 85 Q360 30 450 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 400 Q50 300 120 210 Q190 120 260 70 Q330 20 400 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 350 Q40 260 110 180 Q180 100 240 55 Q300 10 350 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 300 Q30 220 100 150 Q170 80 220 40 Q270 0 300 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 250 Q20 180 90 120 Q160 60 200 25 Q240 -10 250 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 200 Q10 140 80 90 Q150 40 180 10 Q210 -20 200 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 150 Q0 100 70 60 Q140 20 160 -5 Q180 -30 150 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            <path d="M-50 100 Q-10 60 60 30 Q130 0 140 -20 Q150 -40 100 -50" stroke="#047857" strokeWidth="1.2" fill="none"/>
            {/* Middle detail contours */}
            <path d="M0 420 Q80 320 140 230 Q200 140 280 90 Q360 40 420 0" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M20 380 Q90 290 150 210 Q210 130 280 80 Q350 30 400 0" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M40 340 Q100 260 160 190 Q220 120 280 75 Q340 30 380 0" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M60 300 Q110 230 170 170 Q230 110 280 70 Q330 30 360 10" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M80 260 Q120 200 180 150 Q240 100 280 65 Q320 30 340 20" stroke="#059669" strokeWidth="1" fill="none"/>
            <path d="M100 220 Q130 170 190 130 Q250 90 280 60 Q310 30 320 25" stroke="#059669" strokeWidth="1" fill="none"/>
            {/* Inner detail curves */}
            <path d="M120 180 Q150 145 200 110 Q250 75 280 55 Q310 35 300 30" stroke="#10b981" strokeWidth="0.8" fill="none"/>
            <path d="M140 150 Q165 125 210 95 Q255 65 280 50 Q305 35 295 35" stroke="#10b981" strokeWidth="0.8" fill="none"/>
            <path d="M160 120 Q180 105 220 80 Q260 55 280 45" stroke="#10b981" strokeWidth="0.8" fill="none"/>
            <path d="M180 95 Q200 85 230 68 Q260 50 280 42" stroke="#10b981" strokeWidth="0.6" fill="none"/>
          </svg>
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="blob blob-teal w-[400px] h-[400px] top-[20%] right-[-220px] animate-blob-reverse opacity-10 md:opacity-100" />
          <div className="blob blob-emerald w-[350px] h-[350px] bottom-[-50px] left-[80%] animate-blob-slow opacity-40 md:opacity-100" />
          <div className="blob blob-teal w-[500px] h-[400px] top-[80%] right-[60px] animate-blob-reverse opacity-30 md:opacity-50" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-16 md:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="order-1 lg:order-1">
              <div className="hero-badge text-verdex-600 font-mono text-sm tracking-wider mb-4">
                FOR AFRICAN TRANSITION PROJECTS
              </div>

              <h1 className="hero-title text-4xl md:text-5xl lg:text-6xl font-display font-medium text-gray-900 mb-6 tracking-tight leading-[1.1]">
                <span className="block">Assess.</span>
                <span className="block">Verify.</span>
                <span className="block gradient-text">Get Funded.</span>
              </h1>

              <p className="hero-subtitle text-lg md:text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                AI-powered LMA compliance assessment, greenwashing detection, and DFI matching.
              </p>

              <div className="hero-buttons flex flex-col sm:flex-row gap-4 mb-12">
                <Link href="/assess" className="bg-verdex-700 hover:bg-verdex-800 text-white font-semibold px-8 py-4 rounded-xl shadow-verdex hover:shadow-verdex-lg transition-all duration-300 hover:scale-105 text-center">
                  Start Assessment
                </Link>
                <Link href="/search" className="border-2 border-verdex-600/0 hover:border-verdex-600 hover:bg-verdex-600/10 text-verdex-700 hover:text-verdex-700 font-semibold px-8 py-4 rounded-xl transition-all duration-300 text-center">
                  Browse Clauses
                </Link>
              </div>

              {/* Quick Stats */}
              <div className="hero-buttons flex flex-wrap gap-x-8 gap-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-verdex-500 rounded-full"></div>
                  <span className="text-gray-600">LMA Transition Loan Principles</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-verdex-500 rounded-full"></div>
                  <span className="text-gray-600">SBTi Net-Zero Standard</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-verdex-500 rounded-full"></div>
                  <span className="text-gray-600">Paris Agreement Aligned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-verdex-500 rounded-full"></div>
                  <span className="text-gray-600">7+ DFI Partners</span>
                </div>
              </div>
            </div>

            {/* Right Column - Visual Element */}
            <div className="order-2 lg:order-2" ref={heroIllustrationRef}>
              <div className="relative">
                {/* Assessment Preview Card Stack */}
                <div className="relative z-10 hero-card-main">
                  {/* Main Card */}
                  <div className="glass-card rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Assessment Result</span>
                      <span className="bg-verdex-100 text-verdex-800 text-xs font-bold px-3 py-1 rounded-full">Eligible</span>
                    </div>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Project</p>
                      <p className="font-semibold text-gray-900">Lagos Solar Farm Initiative</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500">LMA Score</p>
                        <p className="text-2xl font-bold text-verdex-700">87/100</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Greenwash Risk</p>
                        <p className="text-2xl font-bold text-emerald-600">Low</p>
                      </div>
                    </div>
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-sm text-gray-500 mb-2">Matched DFIs</p>
                      <div className="flex gap-2">
                        <span className="bg-navy-100 text-navy-800 text-xs font-medium px-2 py-1 rounded">AfDB</span>
                        <span className="bg-navy-100 text-navy-800 text-xs font-medium px-2 py-1 rounded">IFC</span>
                        <span className="bg-navy-100 text-navy-800 text-xs font-medium px-2 py-1 rounded">DEG</span>
                      </div>
                    </div>
                  </div>

                  {/* Background Cards */}
                  <div className="absolute -bottom-3 -right-3 left-3 h-full glass-card rounded-2xl -z-10 opacity-60"></div>
                  <div className="absolute -bottom-6 -right-6 left-6 h-full glass-card rounded-2xl -z-20 opacity-30"></div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-4 -left-4 bg-white rounded-xl shadow-lg p-3 z-20 hero-floating-lma">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">LMA Compliance</span>
                  </div>
                </div>

                <div className="absolute -bottom-2 -right-4 bg-white rounded-xl shadow-lg p-3 z-20 hero-floating-ai">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span className="text-sm font-medium">AI-Powered</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* How It Works */}
      <section className="features-section py-20 md:py-28 bg-gradient-to-b from-white via-verdex-50/20 to-white relative overflow-hidden">
        {/* Subtle blobs */}
        <div className="blob blob-emerald w-[300px] h-[300px] top-[10%] left-[-100px] opacity-50 animate-blob-slow" />
        <div className="blob blob-teal w-[250px] h-[250px] bottom-[10%] right-[-80px] opacity-40 animate-blob-reverse" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 md:mb-20">
            <div className="section-header inline-flex items-center gap-2 bg-verdex-50 text-verdex-700 text-sm font-medium px-4 py-2 rounded-full mb-4">
              <span className="w-2 h-2 bg-verdex-500 rounded-full animate-pulse"></span>
              Simple Process
            </div>
            <h2 className="section-header text-3xl md:text-4xl font-display font-medium text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="section-header text-gray-600 max-w-2xl mx-auto text-lg">
              Three steps from project submission to investor-ready assessment
            </p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
            {/* Connecting Path - Desktop */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                    <stop offset="50%" stopColor="#047857" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                  </linearGradient>
                </defs>
                <line x1="50%" y1="0" x2="50%" y2="100%" stroke="url(#pathGradient)" strokeWidth="2" strokeDasharray="8 4" />
              </svg>
            </div>

            {/* Steps */}
            <div className="space-y-12 lg:space-y-0">

              {/* Step 1 - Neutral Input */}
              <div className="step-card relative lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:pb-20">
                {/* Number Node - Desktop */}
                <div className="step-node hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-500 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg text-white font-display font-bold text-xl rotate-3 hover:rotate-0 transition-transform">
                    01
                  </div>
                </div>
                {/* Content - Left */}
                <div className="lg:text-right lg:pr-16">
                  <div className="flex items-center gap-3 mb-4 lg:justify-end">
                    <span className="lg:hidden flex items-center justify-center w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl text-white font-bold text-sm">01</span>
                    <span className="text-slate-600 font-mono text-sm tracking-wider uppercase">Input</span>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-gray-900 mb-3">Upload or Fill the Form</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Share your project documentation or complete our assessment form with project details, financials, and transition strategy.
                  </p>
                </div>
                {/* Visual - Right */}
                <div className="mt-6 lg:mt-0 lg:pl-16">
                  <div className="glass-card rounded-2xl p-6 border-l-4 border-l-slate-400 group hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-2 bg-slate-200 rounded-full w-24"></div>
                          <div className="h-2 bg-slate-100 rounded-full w-16"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-100 rounded-full w-full"></div>
                          <div className="h-2 bg-gray-100 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 - KPI Colors (Verdex) */}
              <div className="step-card relative lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:pb-20">
                {/* Number Node - Desktop */}
                <div className="step-node hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-verdex-500 to-verdex-700 rounded-2xl flex items-center justify-center shadow-verdex text-white font-display font-bold text-xl -rotate-3 hover:rotate-0 transition-transform">
                    02
                  </div>
                </div>
                {/* Visual - Left on desktop, below content on mobile (same as step 1 & 3) */}
                <div className="mt-6 lg:mt-0 lg:order-1 lg:pr-16">
                  <div className="glass-card rounded-2xl p-6 border-l-4 border-l-verdex-500 group hover:shadow-verdex transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-verdex-100 to-verdex-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs text-gray-500">Generating KPIs...</span>
                          <span className="text-xs font-medium text-verdex-600">87%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-verdex-400 to-verdex-600 rounded-full w-[87%]"></div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <span className="text-xs bg-verdex-100 text-verdex-700 px-2 py-1 rounded font-medium">KPI</span>
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded font-medium">SPT</span>
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">LMA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Content - Right on desktop, first on mobile (same as step 1 & 3) */}
                <div className="lg:order-2 lg:text-left lg:pl-16">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="lg:hidden flex items-center justify-center w-10 h-10 bg-gradient-to-br from-verdex-500 to-verdex-700 rounded-xl text-white font-bold text-sm">02</span>
                    <span className="text-verdex-600 font-mono text-sm tracking-wider uppercase">KPI & SPT Generation</span>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-gray-900 mb-3">AI-Powered Analysis</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Our AI evaluates against LMA Transition Loan Principles, detects greenwashing risks, and generates science-based KPIs and SPTs.
                  </p>
                </div>
              </div>

              {/* Step 3 - SPT Colors (Teal) */}
              <div className="step-card relative lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
                {/* Number Node - Desktop */}
                <div className="step-node hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg text-white font-display font-bold text-xl rotate-3 hover:rotate-0 transition-transform">
                    03
                  </div>
                </div>
                {/* Content - Left */}
                <div className="lg:text-right lg:pr-16">
                  <div className="flex items-center gap-3 mb-4 lg:justify-end">
                    <span className="lg:hidden flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl text-white font-bold text-sm">03</span>
                    <span className="text-teal-600 font-mono text-sm tracking-wider uppercase">Relevant clause matching</span>
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-gray-900 mb-3">Get DFI Matched</h3>
                  <p className="text-gray-600 leading-relaxed">
                    Receive tailored DFI recommendations, financing structure suggestions, and actionable steps to make your project bankable.
                  </p>
                </div>
                {/* Visual - Right */}
                <div className="mt-6 lg:mt-0 lg:pl-16">
                  <div className="glass-card rounded-2xl p-6 border-l-4 border-l-teal-500 group hover:shadow-lg transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-0.5 rounded">SPT Verified</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Matched DFIs:</p>
                        <div className="flex flex-wrap gap-1.5">
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded font-medium">AfDB</span>
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded font-medium">IFC</span>
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded font-medium">DEG</span>
                          <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded font-medium">FMO</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Supported Countries - Map with Markers */}
      <section className="py-20 md:py-28 relative overflow-hidden bg-verdex-950">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-verdex-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left - Map Visual */}
            <div className="relative order-2 lg:order-1">
              <div className="relative aspect-square max-w-[700px] mx-auto">
                {/* Africa map silhouette */}
                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <img
                    src="/img/img-affrica-map.svg"
                    alt=""
                    className="w-full h-full object-contain filter brightness-0 invert"
                  />
                </div>

                {/* Location markers with pulse */}
                {[
                  { top: '28%', left: '57%', name: 'Egypt', delay: '0s' },
                  { top: '23%', left: '30%', name: 'Morocco', delay: '0.2s' },
                  { top: '44%', left: '40%', name: 'Nigeria', delay: '0.4s' },
                  { top: '43%', left: '33%', name: 'Ghana', delay: '0.6s' },
                  { top: '49%', left: '68%', name: 'Kenya', delay: '0.8s' },
                  { top: '55%', left: '64%', name: 'Tanzania', delay: '1s' },
                  { top: '75%', left: '55%', name: 'South Africa', delay: '1.2s' },
                ].map((loc) => (
                  <div
                    key={loc.name}
                    className="absolute group cursor-default"
                    style={{ top: loc.top, left: loc.left }}
                  >
                    {/* Pulse ring */}
                    <div
                      className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 bg-verdex-500/30 rounded-full animate-ping"
                      style={{ animationDelay: loc.delay, animationDuration: '3s' }}
                    />
                    {/* Dot */}
                    <div className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 bg-verdex-400/50 rounded-full shadow-lg shadow-verdex-500/50 group-hover:scale-150 transition-transform" />
                    {/* Label on hover */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {loc.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-verdex-500/20 text-verdex-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-verdex-400 rounded-full"></span>
                Coverage
              </div>

              <h2 className="text-3xl md:text-4xl font-display font-medium text-white mb-4">
                Built for African markets
              </h2>

              <p className="text-gray-400 mb-8 text-lg">
                Local regulations, NDC targets, and DFI networks for each country.
              </p>

              {/* Country list */}
              <div className="grid grid-cols-2 gap-3 mb-8">
                {[
                  { name: 'Kenya', region: 'East Africa' },
                  { name: 'Nigeria', region: 'West Africa' },
                  { name: 'South Africa', region: 'Southern' },
                  { name: 'Egypt', region: 'North Africa' },
                  { name: 'Morocco', region: 'North Africa' },
                  { name: 'Ghana', region: 'West Africa' },
                  { name: 'Tanzania', region: 'East Africa' },
                ].map((country) => (
                  <div
                    key={country.name}
                    className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-2 h-2 bg-verdex-400 rounded-full flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium text-sm">{country.name}</p>
                      <p className="text-gray-500 text-xs">{country.region}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Coming soon */}
              <p className="text-gray-500 text-sm">
                Expanding to Ethiopia, Rwanda, Senegal, and Côte d&apos;Ivoire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities Section - Bento Box */}
      <section className="capabilities-section py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50/50 to-white" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="section-header text-3xl font-display font-medium text-gray-900 mb-4">
              Verdex Capabilities
            </h2>
            <p className="section-header text-gray-600 max-w-2xl mx-auto">
              AI-powered assessment, LMA compliance verification, and DFI matching for African green projects
            </p>
          </div>

          {/* Asymmetric Bento Grid - Mobile friendly */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 lg:auto-rows-[140px]">

            {/* Level 1: Most Crucial - LMA Compliance (spans 2 cols, 2 rows on lg) */}
            <div className="capability-card sm:col-span-2 lg:row-span-2 glass-card rounded-3xl p-6 md:p-8 flex flex-col justify-between group transition-all duration-300 border-l-4 border-l-verdex-500 overflow-hidden relative min-h-[200px] lg:min-h-0 glass-card-hover">
              <div className="absolute top-0 right-0 w-32 h-32 bg-verdex-500/10 rounded-full blur-2xl group-hover:bg-verdex-500/20 transition-colors" />
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-verdex-100 to-verdex-200 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-verdex-500/10">
                  <svg className="w-7 h-7 text-verdex-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">LMA Compliance Scoring</h3>
                <p className="text-gray-600">Automated assessment against all 5 LMA Transition Loan Principles components with detailed feedback and actionable recommendations.</p>
              </div>
              <div className="flex items-center gap-2 text-verdex-600 font-medium text-sm mt-4">
                <span>Core Feature</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Level 2: 2nd Important - Greenwashing Detection */}
            <div className="capability-card sm:col-span-2 glass-card rounded-3xl p-5 md:p-6 flex items-center gap-4 md:gap-6 group transition-all duration-300 border-l-4 border-l-amber-500 glass-card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/10">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Greenwashing Detection</h3>
                <p className="text-gray-600 text-sm">AI-powered identification of red flags and weak transition commitments</p>
              </div>
            </div>

            {/* Level 3: 3rd Important - DFI Matching */}
            <div className="capability-card sm:col-span-2 glass-card rounded-3xl p-5 md:p-6 flex items-center gap-4 md:gap-6 group transition-all duration-300 border-l-4 border-l-navy-600 glass-card-hover">
              <div className="w-12 h-12 bg-gradient-to-br from-navy-100 to-navy-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-navy-500/10">
                <svg className="w-6 h-6 text-navy-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">DFI Matching</h3>
                <p className="text-gray-600 text-sm">Match with IFC, AfDB, FMO, DEG, BII, Proparco, and DFC based on eligibility</p>
              </div>
            </div>

            {/* Level 4-6: Same size features - responsive grid */}
            <div className="capability-card glass-card rounded-2xl p-4 md:p-5 group transition-all duration-300 border-l-4 border-l-purple-500 glass-card-hover">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-md shadow-purple-500/10">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">KPI Generation</h3>
              <p className="text-gray-500 text-xs">Science-based KPIs and SPTs</p>
            </div>

            <div className="capability-card glass-card rounded-2xl p-4 md:p-5 group transition-all duration-300 border-l-4 border-l-indigo-500 glass-card-hover">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-md shadow-indigo-500/10">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Clause Search</h3>
              <p className="text-gray-500 text-xs">2000+ LMA document templates</p>
            </div>

            <div className="capability-card glass-card rounded-2xl p-4 md:p-5 group transition-all duration-300 border-l-4 border-l-teal-500 glass-card-hover">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-md shadow-teal-500/10">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">Paris Alignment</h3>
              <p className="text-gray-500 text-xs">NDC targets verification</p>
            </div>

            <div className="capability-card glass-card rounded-2xl p-4 md:p-5 group transition-all duration-300 border-l-4 border-l-emerald-500 glass-card-hover">
              <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex items-center justify-center mb-2 md:mb-3 shadow-md shadow-emerald-500/10">
                <svg className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 text-sm md:text-base">PDF Export</h3>
              <p className="text-gray-500 text-xs">Professional assessment reports</p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section - Modern Asymmetric Design */}
      <section ref={ctaRef} className="py-20 md:py-28 relative overflow-hidden">
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-verdex-950 to-gray-900" />

        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-verdex-500/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />

        <div className="cta-content relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left Column - Stats & Social Proof */}
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                {/* Stat Card 1 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                  <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 group-hover:text-verdex-300 transition-colors">
                    &lt;60s
                  </div>
                  <p className="text-gray-400 text-sm">Assessment time</p>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                  <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 group-hover:text-verdex-300 transition-colors">
                    7+
                  </div>
                  <p className="text-gray-400 text-sm">DFI partners matched</p>
                </div>

                {/* Stat Card 3 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                  <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 group-hover:text-verdex-300 transition-colors">
                    100%
                  </div>
                  <p className="text-gray-400 text-sm">LMA principles covered</p>
                </div>

                {/* Stat Card 4 */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors group">
                  <div className="text-3xl md:text-4xl font-display font-bold text-white mb-1 group-hover:text-verdex-300 transition-colors">
                    500+
                  </div>
                  <p className="text-gray-400 text-sm">Clause templates</p>
                </div>
              </div>

              {/* Trust badge */}
              <div className="mt-6 flex items-center gap-3 text-gray-400 text-sm">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-verdex-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-gray-900">AF</div>
                  <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-gray-900">IF</div>
                  <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white text-xs font-medium ring-2 ring-gray-900">DG</div>
                </div>
                <span>Aligned with AfDB, IFC, DEG standards</span>
              </div>
            </div>

            {/* Right Column - CTA Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-verdex-500/20 text-verdex-300 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-verdex-400 rounded-full animate-pulse"></span>
                Assess Now!
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-medium text-white mb-6 leading-tight">
                Your project is one click away from being{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-verdex-300 to-teal-300">
                  investor-ready
                </span>
              </h2>

              <p className="text-gray-300 mb-8 text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
                Find out if your project qualifies for funding — before you apply.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/assess"
                  className="group bg-white text-gray-900 font-semibold px-8 py-4 rounded-xl hover:bg-verdex-50 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                >
                  Start Assessment
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/search"
                  className="border border-white/20 text-white font-semibold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Browse Clauses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


