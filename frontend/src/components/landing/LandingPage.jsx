import { getLanguageByCode } from '../../services/languages';
import React, { useState } from 'react';
import { 
  HeartPulse, 
  Sparkles, 
  Mic, 
  Baby, 
  Syringe, 
  WifiOff, 
  IndianRupee, 
  Ambulance, 
  ArrowRight, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Globe, 
  Moon, 
  Sun, 
  ShieldCheck, 
  ExternalLink, 
  Phone, 
  FileText, 
  Users, 
  Award,
  Layers,
  Activity,
  CalendarCheck
} from 'lucide-react';
import Hero3DScene from './Hero3DScene';
import Phone3DShowcase from './Phone3DShowcase';
import { TRANSLATIONS } from '../../services/i18n';

export default function LandingPage({ 
  onLaunchApp, 
  onOpenAuth, 
  currentLanguage = 'en', 
  onLanguageChange,
  onOpenLanguageSelector,
  isDarkMode = false,
  onToggleDarkMode
}) {
  const [activeStep, setActiveStep] = useState(0);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index);
  };

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-navy-950 text-navy-900 dark:text-navy-50 font-sans transition-colors duration-300 overflow-x-hidden selection:bg-cyan/20 selection:text-navy-900">
      
      {/* ============================================================ */}
      {/* 1. STICKY GLASS NAVBAR                                       */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 glass-nav transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Branding */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-deep via-primary to-cyan text-white flex items-center justify-center shadow-card group-hover:scale-105 transition-decelerate relative">
              <HeartPulse className="w-6 h-6 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-saffron rounded-full border-2 border-white dark:border-navy-950 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif font-bold text-xl text-navy-900 dark:text-white tracking-tight">
                  ASHA Sakhi
                </span>
                <span className="text-[10px] font-bold font-mono text-saffron bg-saffron/10 px-2 py-0.5 rounded-full border border-saffron/30">
                  NHM PRO
                </span>
              </div>
              <p className="text-[11px] font-medium text-navy-500 dark:text-navy-300">
                {t.nav.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold text-navy-700 dark:text-navy-200">
            <a href="#features" className="hover:text-primary transition-colors">{t.nav.features}</a>
            <a href="#problem" className="hover:text-primary transition-colors">{t.nav.problem}</a>
            <a href="#how-it-works" className="hover:text-primary transition-colors">{t.nav.howItWorks}</a>
            <a href="#impact" className="hover:text-primary transition-colors">{t.nav.impact}</a>
            <a href="#testimonials" className="hover:text-primary transition-colors">{t.nav.testimonials}</a>
            <a href="#faq" className="hover:text-primary transition-colors">{t.nav.faq}</a>
          </nav>

          {/* Right Action Controls: Lang Switcher, Dark Mode, CTAs */}
          <div className="flex items-center space-x-3">
            {/* Language Selector Dropdown */}
            <div className="flex items-center space-x-1 bg-white dark:bg-navy-900 p-1 rounded-xl border border-navy-200/70 dark:border-navy-700 shadow-sm text-xs">
              {onOpenLanguageSelector && (
                <button
                  onClick={onOpenLanguageSelector}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-softblue dark:bg-navy-800 text-primary dark:text-cyan hover:bg-cream-100 font-bold border border-primary/20 transition-all"
                  title="All 22 Scheduled Indian Languages"
                >
                  <Globe className="w-3.5 h-3.5 text-primary" />
                  <span>{getLanguageByCode(currentLanguage).name_native}</span>
                  <span className="text-[10px] bg-primary/10 text-primary px-1 rounded font-mono font-bold">22</span>
                </button>
              )}
              {['en', 'hi', 'kn'].map(code => {
                const l = getLanguageByCode(code);
                return (
                  <button
                    key={code}
                    onClick={() => onLanguageChange(code)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all ${
                      currentLanguage === code
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-navy-600 dark:text-navy-300 hover:text-navy-900'
                    }`}
                  >
                    {code === 'en' ? 'EN' : l.name_native}
                  </button>
                );
              })}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2.5 rounded-xl bg-white dark:bg-navy-900 border border-navy-200/70 dark:border-navy-700 text-navy-700 dark:text-navy-200 hover:bg-cream-200 dark:hover:bg-navy-800 transition-colors shadow-sm"
              title={isDarkMode ? t.nav.lightMode : t.nav.darkMode}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-saffron" /> : <Moon className="w-4 h-4 text-navy-700" />}
            </button>

            {/* Sign In Trigger */}
            <button
              onClick={onOpenAuth}
              className="hidden sm:inline-flex px-4 py-2.5 rounded-xl text-xs font-bold text-navy-800 dark:text-navy-100 hover:bg-cream-200 dark:hover:bg-navy-800 transition-colors border border-transparent"
            >
              {t.nav.signIn}
            </button>

            {/* Primary Launch CTA */}
            <button
              onClick={onLaunchApp}
              className="bg-gradient-to-r from-teal-deep to-primary hover:from-teal-800 hover:to-primary-hover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-touch active:scale-95 transition-decelerate flex items-center space-x-2"
            >
              <span>{t.nav.launchApp}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION WITH INTERACTIVE 3D SCENE                     */}
      {/* ============================================================ */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-8 pb-20 overflow-hidden">
        {/* Full Interactive 3D Three.js Scene */}
        <Hero3DScene />

        {/* Ambient Gradient Glow Insets */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-cyan/15 via-primary/10 to-saffron/15 rounded-full blur-3xl pointer-events-none -z-10"></div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Trust Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-navy-900/80 backdrop-blur-md border border-primary/20 shadow-subtle animate-fade-in">
            <span className="w-2.5 h-2.5 rounded-full bg-healthcare animate-pulse"></span>
            <span className="text-xs font-bold text-primary dark:text-cyan tracking-wide font-mono">
              {t.hero.badge}
            </span>
          </div>

          {/* Refined Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-navy-900 dark:text-white tracking-tight leading-[1.15]">
            {t.hero.headlineLead}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-deep via-primary to-cyan">
              {t.hero.headlineHighlight}
            </span>
          </h1>

          {/* Subtext */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-navy-600 dark:text-navy-300 font-normal leading-relaxed">
            {t.hero.subtext}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto bg-gradient-to-r from-saffron to-saffron-600 hover:from-saffron-600 hover:to-saffron-700 text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-saffron active:scale-95 transition-decelerate flex items-center justify-center space-x-2.5"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onLaunchApp}
              className="w-full sm:w-auto bg-white/90 dark:bg-navy-900/90 hover:bg-cream-200 dark:hover:bg-navy-800 text-navy-900 dark:text-white font-bold text-sm px-7 py-4 rounded-2xl border border-navy-200 dark:border-navy-700 shadow-card active:scale-95 transition-decelerate flex items-center justify-center space-x-2"
            >
              <Mic className="w-4 h-4 text-primary" />
              <span>{t.hero.ctaSecondary}</span>
            </button>
          </div>

          {/* Trust Banner Text */}
          <p className="text-xs text-navy-400 dark:text-navy-400 font-medium pt-2">
            🛡️ {t.hero.trustText}
          </p>

          {/* 4 Hero Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-8 max-w-4xl mx-auto">
            {Object.entries(t.hero.stats).map(([k, label]) => (
              <div 
                key={k}
                className="glass-card p-4 rounded-2xl shadow-sm text-center"
              >
                <span className="block text-sm sm:text-base font-bold text-navy-900 dark:text-white font-mono">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. PROBLEM & SOLUTION: COMPARATIVE STORYTELLING              */}
      {/* ============================================================ */}
      <section id="problem" className="py-20 bg-white/60 dark:bg-navy-900/40 border-y border-navy-200/50 dark:border-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-saffron bg-saffron/10 px-3 py-1 rounded-full border border-saffron/20">
              {t.problem.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 dark:text-white">
              {t.problem.title}
            </h2>
            <p className="text-sm text-navy-600 dark:text-navy-300">
              {t.problem.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            {/* The Paper Burden (Before) */}
            <div className="bg-red-50/50 dark:bg-red-950/20 rounded-3xl p-8 border border-red-200/60 dark:border-red-900/30 shadow-card space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emergency/10 text-emergency flex items-center justify-center font-bold">
                  ✕
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emergency dark:text-red-400">
                    {t.problem.before.title}
                  </h3>
                  <span className="text-xs text-navy-400 font-mono">Traditional Manual Workflow</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-navy-700 dark:text-navy-200 leading-relaxed">
                <li className="flex items-start space-x-2.5">
                  <span className="text-emergency mt-0.5">•</span>
                  <span>{t.problem.before.item1}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-emergency mt-0.5">•</span>
                  <span>{t.problem.before.item2}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-emergency mt-0.5">•</span>
                  <span>{t.problem.before.item3}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-emergency mt-0.5">•</span>
                  <span>{t.problem.before.item4}</span>
                </li>
              </ul>
            </div>

            {/* With ASHA Sakhi (After) */}
            <div className="bg-teal-50/50 dark:bg-teal-950/20 rounded-3xl p-8 border border-teal-200/60 dark:border-teal-900/30 shadow-card space-y-5">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-healthcare/20 text-healthcare flex items-center justify-center font-bold">
                  ✓
                </div>
                <div>
                  <h3 className="text-lg font-bold text-teal-deep dark:text-cyan">
                    {t.problem.after.title}
                  </h3>
                  <span className="text-xs text-navy-400 font-mono">ASHA Sakhi Voice Register</span>
                </div>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-navy-700 dark:text-navy-200 leading-relaxed">
                <li className="flex items-start space-x-2.5">
                  <span className="text-healthcare mt-0.5">✓</span>
                  <span>{t.problem.after.item1}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-healthcare mt-0.5">✓</span>
                  <span>{t.problem.after.item2}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-healthcare mt-0.5">✓</span>
                  <span>{t.problem.after.item3}</span>
                </li>
                <li className="flex items-start space-x-2.5">
                  <span className="text-healthcare mt-0.5">✓</span>
                  <span>{t.problem.after.item4}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. FEATURES BENTO GRID WITH HOVER-TILT CARDS                 */}
      {/* ============================================================ */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {t.features.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 dark:text-white">
              {t.features.title}
            </h2>
            <p className="text-sm text-navy-600 dark:text-navy-300">
              {t.features.subtitle}
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.features.cards.map((f, i) => {
              const icons = [Mic, Baby, Syringe, WifiOff, IndianRupee, Ambulance];
              const Icon = icons[i % icons.length];

              return (
                <div
                  key={f.id}
                  className="glass-card rounded-3xl p-7 flex flex-col justify-between space-y-4 shadow-card hover:shadow-card-hover hover:border-primary/50 transition-all duration-300 group cursor-pointer"
                  onClick={onLaunchApp}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary/10 to-cyan/15 text-primary dark:text-cyan flex items-center justify-center group-hover:scale-110 transition-decelerate">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold font-mono uppercase px-2.5 py-1 rounded-full bg-cream-200 dark:bg-navy-800 text-navy-600 dark:text-navy-300 border border-navy-200 dark:border-navy-700">
                        {f.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-navy-900 dark:text-white group-hover:text-primary transition-colors">
                      {f.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-300 leading-relaxed font-normal">
                      {f.desc}
                    </p>
                  </div>

                  <div className="pt-2 flex items-center text-xs font-bold text-primary group-hover:translate-x-1 transition-decelerate">
                    <span>{t.nav.launchApp}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. "HOW IT WORKS": PINNED SCROLL WITH 3D PHONE SHOWCASE     */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-24 bg-white/70 dark:bg-navy-900/60 border-y border-navy-200/50 dark:border-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-saffron bg-saffron/10 px-3 py-1 rounded-full border border-saffron/20">
              {t.howItWorks.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 dark:text-white">
              {t.howItWorks.title}
            </h2>
            <p className="text-sm text-navy-600 dark:text-navy-300">
              {t.howItWorks.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left: 3 Interactive Steps */}
            <div className="lg:col-span-6 space-y-4">
              {t.howItWorks.steps.map((st, i) => (
                <div
                  key={st.num}
                  onClick={() => setActiveStep(i)}
                  className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex items-start space-x-4 ${
                    activeStep === i
                      ? 'bg-gradient-to-r from-primary/10 to-cyan/10 border-primary shadow-card dark:bg-navy-800'
                      : 'glass-card border-navy-200/60 dark:border-navy-800 hover:border-navy-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold font-mono text-sm shrink-0 ${
                    activeStep === i
                      ? 'bg-primary text-white shadow-touch'
                      : 'bg-cream-200 dark:bg-navy-800 text-navy-700 dark:text-navy-300'
                  }`}>
                    {st.num}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-navy-900 dark:text-white">
                      {st.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-300 mt-1 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Interactive 3D Phone Mockup Showcase */}
            <div className="lg:col-span-6 flex justify-center">
              <Phone3DShowcase 
                activeStep={activeStep} 
                onStepClick={(idx) => setActiveStep(idx)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. LIVE IMPACT COUNTERS                                      */}
      {/* ============================================================ */}
      <section id="impact" className="py-20 bg-gradient-to-br from-navy-900 via-teal-deep to-navy-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-cyan-300 bg-cyan/10 px-3 py-1 rounded-full border border-cyan/30">
              {t.impact.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white">
              {t.impact.title}
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-cyan">2,400+</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium mt-1">{t.impact.villagesTitle}</div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-saffron">12,800+</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium mt-1">{t.impact.workersTitle}</div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">350,000+</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium mt-1">{t.impact.visitsTitle}</div>
            </div>
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white">₹42.8 Lakh</div>
              <div className="text-xs sm:text-sm text-white/80 font-medium mt-1">{t.impact.incentivesTitle}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. TESTIMONIALS CAROUSEL                                     */}
      {/* ============================================================ */}
      <section id="testimonials" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {t.testimonials.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 dark:text-white">
              {t.testimonials.title}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {t.testimonials.quotes.map((q, i) => (
              <div 
                key={i}
                className="glass-card rounded-3xl p-7 flex flex-col justify-between space-y-5 shadow-card"
              >
                <p className="text-xs sm:text-sm text-navy-700 dark:text-navy-200 leading-relaxed italic font-serif">
                  "{q.quote}"
                </p>

                <div className="flex items-center space-x-3 pt-3 border-t border-navy-100 dark:border-navy-800">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-cyan text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {q.name.slice(0, 1)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-navy-900 dark:text-white">{q.name}</div>
                    <div className="text-[11px] text-navy-500 dark:text-navy-400">{q.role} • {q.location}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. PARTNERS & SECURITY / DATA SOVEREIGNTY                    */}
      {/* ============================================================ */}
      <section className="py-16 bg-cream-200/50 dark:bg-navy-900/50 border-y border-navy-200/50 dark:border-navy-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <span className="text-xs font-bold font-mono uppercase tracking-widest text-navy-400">
            {t.partners.badge}
          </span>
          <h3 className="text-2xl font-serif font-bold text-navy-900 dark:text-white">
            {t.partners.title}
          </h3>
          <p className="text-xs sm:text-sm text-navy-600 dark:text-navy-300 max-w-2xl mx-auto">
            {t.partners.desc}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {t.partners.badges.map((b, i) => (
              <span 
                key={i} 
                className="px-4 py-2 rounded-2xl bg-white dark:bg-navy-800 border border-navy-200/70 dark:border-navy-700 text-xs font-bold text-navy-800 dark:text-navy-100 shadow-sm"
              >
                🛡️ {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. FAQ ACCORDION                                             */}
      {/* ============================================================ */}
      <section id="faq" className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-xs font-bold font-mono uppercase tracking-widest text-saffron bg-saffron/10 px-3 py-1 rounded-full border border-saffron/20">
              {t.faq.badge}
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-navy-900 dark:text-white">
              {t.faq.title}
            </h2>
          </div>

          <div className="space-y-4">
            {t.faq.items.map((item, i) => (
              <div 
                key={i}
                className="glass-card rounded-2xl border border-navy-200/70 dark:border-navy-800 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleFaq(i)}
                  className="w-full p-5 text-left flex items-center justify-between space-x-4 text-sm font-bold text-navy-900 dark:text-white focus:outline-none"
                >
                  <span>{item.q}</span>
                  {openFaqIndex === i ? <ChevronUp className="w-4 h-4 text-primary shrink-0" /> : <ChevronDown className="w-4 h-4 text-navy-400 shrink-0" />}
                </button>

                {openFaqIndex === i && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-navy-600 dark:text-navy-300 leading-relaxed border-t border-navy-100 dark:border-navy-800">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. FINAL CTA BANNER & PREMIUM FOOTER                        */}
      {/* ============================================================ */}
      <section className="py-20 bg-gradient-to-r from-teal-deep via-primary to-cyan text-white text-center relative overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold leading-tight">
            Ready to Experience the Future of Community Health?
          </h2>
          <p className="text-sm sm:text-base text-white/90 max-w-2xl mx-auto">
            Test the live voice visit recording, clinical danger sign detection, and 108 ambulance simulator right now in your browser.
          </p>
          <div className="pt-2 flex justify-center">
            <button
              onClick={onLaunchApp}
              className="bg-saffron hover:bg-saffron-hover text-white font-bold text-sm px-8 py-4 rounded-2xl shadow-saffron active:scale-95 transition-decelerate flex items-center space-x-2"
            >
              <span>{t.hero.ctaPrimary}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-navy-950 text-white/70 text-xs border-t border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-base text-white">ASHA Sakhi</span>
            </div>
            <p className="text-center md:text-right font-medium">
              {t.footer.helplines}
            </p>
          </div>

          <div className="border-t border-navy-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/50">
            <p>{t.footer.copyright}</p>
            <div className="flex space-x-6">
              {t.footer.links.map((link, i) => (
                <span key={i} className="hover:text-white cursor-pointer transition-colors">{link}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
