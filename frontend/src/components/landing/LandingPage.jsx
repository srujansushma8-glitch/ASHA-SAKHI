import React, { useState } from 'react';
import { 
  Heart,
  Calendar,
  Phone,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Globe,
  Sun,
  Moon,
  ExternalLink,
  MapPin,
  Users,
  Check,
  MessageCircle,
  AlertCircle,
  HelpCircle,
  Activity,
  Layers,
  Award
} from 'lucide-react';
import { getLanguageByCode } from '../../services/languages';
import Lotus3DScene from './Lotus3DScene';
import { 
  MaternalCareIcon, 
  ImmunizationIcon, 
  MenstrualHealthIcon, 
  FamilyPlanningIcon, 
  NutritionIcon, 
  SchemesIcon 
} from './ServiceIcons';
import { api } from '../../services/api';

export default function LandingPage({ 
  onLaunchApp, 
  onOpenAuth, 
  currentLanguage = 'kn', 
  onLanguageChange,
  onOpenLanguageSelector,
  isDarkMode = false,
  onToggleDarkMode
}) {
  const activeLang = getLanguageByCode(currentLanguage);

  // Form State
  const [formData, setFormData] = useState({
    beneficiary_name: '',
    phone: '',
    village: 'Mandya Sector 4',
    service_type: 'Maternal Care (ANC/PNC)',
    preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    concern: ''
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState('');

  // Testimonial Carousel State
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: "Priya M.",
      role: "Mother of 6-month-old Aarav",
      village: "Shivalli Sub-Centre",
      avatar: "/images/mother-priya.jpg",
      quote: "When I was pregnant with Aarav, my ASHA Sakhi Sunita-di visited every month. The automated voice reminders ensured I never missed an IFA tablet or TT injection. She even arranged the hospital birth."
    },
    {
      name: "Kavitha R.",
      role: "Expecting Mother (7th Month)",
      village: "Mandya Sector 4",
      avatar: "/images/mother-kavitha.jpg",
      quote: "When I experienced severe dizziness and headache, Sunita recognized the maternal danger sign immediately. The 108 ambulance arrived at our village in 18 minutes. She saved my baby."
    },
    {
      name: "Meenakshi S.",
      role: "Adolescent Peer Leader",
      village: "Keregodu Village",
      avatar: "/images/mother-meenakshi.jpg",
      quote: "The menstrual hygiene and anemia awareness sessions organized by our ASHA Sakhi broke years of silence in our village. Now every young girl has access to clean sanitary supplies without shame."
    }
  ];

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formData.beneficiary_name.trim()) {
      setFormError('Please enter your full name');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number');
      return;
    }

    setFormSubmitting(true);
    try {
      const res = await api.submitVisitRequest(formData);
      setFormSuccess(res);
      setFormData({
        beneficiary_name: '',
        phone: '',
        village: 'Mandya Sector 4',
        service_type: 'Maternal Care (ANC/PNC)',
        preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        concern: ''
      });
    } catch (err) {
      setFormError('Could not submit request. Please call helpline 108 directly.');
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9ECEC] text-[#3B2A33] font-poppins selection:bg-[#A25B74]/20 selection:text-[#3B2A33] overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. STICKY NAVBAR                                             */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-[#F9ECEC]/90 backdrop-blur-md border-b border-[#A25B74]/15 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo & Identity */}
          <div 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#A25B74] to-[#C47A92] text-white flex items-center justify-center shadow-md shadow-[#A25B74]/25 group-hover:scale-105 transition-transform">
              {/* Stylized Lotus Icon */}
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3c-1.5 3-3.5 5.5-6 7 2.5 1.5 4.5 4 6 7 1.5-3 3.5-5.5 6-7-2.5-1.5-4.5-4-6-7z"/>
                <path d="M12 17c-2 2-4 3-7 3 2-2 3-4 3-7"/>
                <path d="M12 17c2 2 4 3 7 3-2-2-3-4-3-7"/>
              </svg>
            </div>
            <div>
              <span className="font-cormorant font-bold text-2xl text-[#3B2A33] tracking-tight block leading-tight">
                ASHA <span className="italic font-normal text-[#A25B74]">Sakhi</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#7A6670] block">
                Women & Maternal Care
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-semibold text-[#7A6670]">
            <a href="#services" className="hover:text-[#A25B74] transition-colors">Services</a>
            <a href="#about" className="hover:text-[#A25B74] transition-colors">About Us</a>
            <a href="#sakhis" className="hover:text-[#A25B74] transition-colors">Meet Our Sakhis</a>
            <a href="#stories" className="hover:text-[#A25B74] transition-colors">Stories</a>
            <a href="#request-visit" className="hover:text-[#A25B74] transition-colors">Request a Visit</a>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Language Selector Pill */}
            {onOpenLanguageSelector && (
              <button
                onClick={onOpenLanguageSelector}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-white border border-[#A25B74]/20 text-[#3B2A33] text-xs font-bold hover:bg-[#FDF6F5] transition-all shadow-xs"
                title="All 22 Scheduled Indian Languages"
              >
                <Globe className="w-3.5 h-3.5 text-[#A25B74]" />
                <span>{activeLang.name_native}</span>
                <span className="text-[10px] bg-[#A25B74]/10 text-[#A25B74] px-1.5 rounded-full font-mono font-bold">22</span>
              </button>
            )}

            {/* Quick 108 Emergency Call Pill */}
            <a
              href="tel:108"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white text-[#A25B74] hover:bg-[#FDF6F5] border border-[#A25B74]/25 text-xs font-bold transition-all shadow-xs"
              title="National Health Emergency Helpline"
            >
              <Phone className="w-3.5 h-3.5 text-[#A25B74]" />
              <span>108 Helpline</span>
            </a>

            {/* Launch App / Sign In CTA */}
            <button
              onClick={onLaunchApp}
              className="px-5 py-2 rounded-full bg-[#A25B74] hover:bg-[#84455C] text-white text-xs font-bold tracking-wide transition-all shadow-md shadow-[#A25B74]/30 active:scale-95 flex items-center space-x-1.5"
            >
              <span>Launch Field App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. HERO SECTION WITH 3D LOTUS & FLOATING HOLOGRAPHIC ICONS   */}
      {/* ============================================================ */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-gradient-to-b from-[#F9ECEC] via-[#FDF6F5] to-[#F9ECEC] floral-edge">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Content Column (Span 7) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Eyebrow Label */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-[#A25B74]/20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#A25B74] animate-pulse"></span>
                <span className="eyebrow text-[#A25B74] text-[11px] font-bold">
                  ACCREDITED SOCIAL HEALTH ACTIVIST COMPANION
                </span>
              </div>

              {/* Display Headline in Cormorant Garamond */}
              <h1 className="font-cormorant text-4xl sm:text-5xl lg:text-6xl text-[#3B2A33] font-semibold tracking-tight leading-[1.12]">
                Care for Every Woman,{' '}
                <span className="italic font-normal text-[#A25B74] underline decoration-[#C47A92]/30 decoration-wavy">
                  Every Stage.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#7A6670] max-w-2xl leading-relaxed font-normal">
                ASHA Sakhi is a compassionate, digital companion connecting rural families with certified 
                community health workers. From prenatal checkups to safe institutional deliveries, 
                child immunization, and women's wellness — healthcare at your doorstep.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#request-visit"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#A25B74] hover:bg-[#84455C] text-white font-semibold text-sm transition-all rose-button-shadow active:scale-95 flex items-center justify-center space-x-2.5"
                >
                  <span>Request a Free Home Visit</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <button
                  onClick={onLaunchApp}
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white hover:bg-[#FDF6F5] text-[#A25B74] border border-[#A25B74]/30 font-semibold text-sm transition-all rose-card-shadow active:scale-95 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C47A92]" />
                  <span>Explore Field Register</span>
                </button>
              </div>

              {/* 3 Trust Badges */}
              <div className="pt-8 border-t border-[#A25B74]/15 grid grid-cols-3 gap-4 text-center sm:text-left">
                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[#A25B74]">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#3B2A33]">MoHFW Aligned</span>
                  </div>
                  <p className="text-[11px] text-[#7A6670]">National Health Mission guidelines</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[#A25B74]">
                    <Activity className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#3B2A33]">100% Offline</span>
                  </div>
                  <p className="text-[11px] text-[#7A6670]">SQLite local field sync</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 text-[#A25B74]">
                    <Globe className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase tracking-wider text-[#3B2A33]">22 Languages</span>
                  </div>
                  <p className="text-[11px] text-[#7A6670]">AI4Bharat voice pipeline</p>
                </div>
              </div>
            </div>

            {/* Right Interactive 3D Showcase Column (Span 5) */}
            <div className="lg:col-span-5 relative flex items-center justify-center">
              {/* Backing Ambient Arch Halo */}
              <div className="absolute w-[360px] sm:w-[440px] h-[480px] rounded-full bg-gradient-to-b from-[#E8B4C4]/40 via-[#FDF6F5]/50 to-transparent blur-2xl -z-10" />

              {/* Visual Presentation Card with 3D Canvas */}
              <div className="w-full max-w-[440px] bg-white p-3 rounded-[36px] rose-card-shadow border border-[#A25B74]/15 relative overflow-hidden">
                {/* Hero Showcase Image */}
                <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] bg-[#FDF6F5]">
                  <img 
                    src="/images/hero-asha-lotus.jpg" 
                    alt="ASHA Sakhi companion healthcare worker in village clinic"
                    className="w-full h-full object-cover object-center"
                    loading="eager"
                  />
                  {/* Subtle Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3B2A33]/60 via-transparent to-transparent" />

                  {/* Overlaid 3D Canvas with Real-Time Parallax Lotus */}
                  <div className="absolute inset-0 pointer-events-none">
                    <Lotus3DScene className="w-full h-full" />
                  </div>

                  {/* Floating Micro-Badge */}
                  <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#A25B74]/20 shadow-lg flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#A25B74] text-white flex items-center justify-center">
                        <Heart className="w-4 h-4 fill-white" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-[#3B2A33]">Doorstep Healthcare</span>
                        <span className="block text-[10px] text-[#7A6670]">Mandya Sector 4 • Verified ASHA</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#A25B74] font-mono">100% Free</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SERVICES (6 ELEGANT ROSE CARDS)                           */}
      {/* ============================================================ */}
      <section id="services" className="py-20 lg:py-28 bg-[#FDF6F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="eyebrow block">COMPREHENSIVE COMMUNITY HEALTH</span>
            <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl text-[#3B2A33] font-semibold leading-tight">
              Holistic Care Across <span className="italic text-[#A25B74]">Every Milestone.</span>
            </h2>
            <p className="text-sm text-[#7A6670] leading-relaxed">
              Every card represents a government-mandated frontline service delivered free of cost 
              to mothers, children, and adolescent girls in village communities.
            </p>
          </div>

          {/* 6 Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1: Maternal Care */}
            <div className="bg-white p-8 rounded-[28px] border border-[#A25B74]/15 rose-card-shadow hover:-translate-y-1.5 transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
                <MaternalCareIcon className="w-8 h-8" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#3B2A33]">Maternal Care</h3>
              <p className="text-xs text-[#7A6670] leading-relaxed">
                Complete 4-ANC protocol tracking, high-risk pregnancy screening (PMSMA), 
                blood pressure monitoring, and institutional delivery accompaniment.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-[#A25B74] group-hover:text-[#84455C]">
                <span>Antenatal & Postnatal</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 2: Child Immunization */}
            <div className="bg-white p-8 rounded-[28px] border border-[#A25B74]/15 rose-card-shadow hover:-translate-y-1.5 transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
                <ImmunizationIcon className="w-8 h-8" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#3B2A33]">Child Immunization</h3>
              <p className="text-xs text-[#7A6670] leading-relaxed">
                Universal Immunization Programme schedule management from birth BCG to 9-month Measles-Rubella, 
                with automated alerts ensuring zero missed infant doses.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-[#A25B74] group-hover:text-[#84455C]">
                <span>Birth to 5 Years Tracking</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 3: Menstrual Health */}
            <div className="bg-white p-8 rounded-[28px] border border-[#A25B74]/15 rose-card-shadow hover:-translate-y-1.5 transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
                <MenstrualHealthIcon className="w-8 h-8" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#3B2A33]">Menstrual Health</h3>
              <p className="text-xs text-[#7A6670] leading-relaxed">
                Community sanitary pad distribution, adolescent peer counseling, reproductive infection 
                prevention, and breaking cultural taboos through trusted village circles.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-[#A25B74] group-hover:text-[#84455C]">
                <span>Hygiene & Awareness</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 4: Family Planning */}
            <div className="bg-white p-8 rounded-[28px] border border-[#A25B74]/15 rose-card-shadow hover:-translate-y-1.5 transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
                <FamilyPlanningIcon className="w-8 h-8" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#3B2A33]">Family Planning</h3>
              <p className="text-xs text-[#7A6670] leading-relaxed">
                Confidential reproductive guidance, modern birth spacing methods (Antara injectable, 
                Chhaya non-hormonal, IUCD copper-T), and postpartum family wellness.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-[#A25B74] group-hover:text-[#84455C]">
                <span>Counseling & Spacing</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 5: Nutrition & Wellness */}
            <div className="bg-white p-8 rounded-[28px] border border-[#A25B74]/15 rose-card-shadow hover:-translate-y-1.5 transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
                <NutritionIcon className="w-8 h-8" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#3B2A33]">Nutrition & Wellness</h3>
              <p className="text-xs text-[#7A6670] leading-relaxed">
                Iron-Folic Acid (IFA) and Calcium supplementation, Poshan Abhiyaan nutritional monitoring, 
                severe anemia detection, and locally sourced diet planning.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-[#A25B74] group-hover:text-[#84455C]">
                <span>Anemia Prevention</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

            {/* Card 6: Government Schemes */}
            <div className="bg-white p-8 rounded-[28px] border border-[#A25B74]/15 rose-card-shadow hover:-translate-y-1.5 transition-all duration-300 space-y-4 group">
              <div className="w-14 h-14 rounded-2xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center group-hover:bg-[#A25B74] group-hover:text-white transition-colors">
                <SchemesIcon className="w-8 h-8" />
              </div>
              <h3 className="font-cormorant text-2xl font-bold text-[#3B2A33]">Government Schemes</h3>
              <p className="text-xs text-[#7A6670] leading-relaxed">
                Direct enrollment assistance for Janani Suraksha Yojana (JSY), PMMVY cash entitlements, 
                and Ayushman Bharat Golden Card access for zero-expense hospital care.
              </p>
              <div className="pt-2 flex items-center text-xs font-bold text-[#A25B74] group-hover:text-[#84455C]">
                <span>Financial Entitlements</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. ABOUT SECTION WITH DEEP ROSE STATS CARD                   */}
      {/* ============================================================ */}
      <section id="about" className="py-20 lg:py-28 bg-[#F9ECEC] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image & Stats Display (Span 6) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="relative rounded-[32px] overflow-hidden rose-card-shadow border border-[#A25B74]/15 bg-white p-2">
                <div className="rounded-[26px] overflow-hidden aspect-[4/3]">
                  <img 
                    src="/images/about-clinic.jpg" 
                    alt="Warm community health room in rural India"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Deep Rose Stats Card */}
              <div className="bg-[#A25B74] text-white p-8 rounded-[32px] rose-button-shadow space-y-6">
                <div className="flex items-center justify-between border-b border-white/20 pb-4">
                  <span className="text-xs uppercase tracking-widest font-bold text-[#FDF6F5]">
                    National Health Mission Verified
                  </span>
                  <span className="text-xs font-mono bg-white/20 px-2.5 py-0.5 rounded-full">
                    Active Registry
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                  <div>
                    <span className="block font-cormorant text-3xl sm:text-4xl font-bold text-white">2,400+</span>
                    <span className="block text-[11px] text-[#F9ECEC]/80 mt-1">Village Centres</span>
                  </div>
                  <div>
                    <span className="block font-cormorant text-3xl sm:text-4xl font-bold text-white">12,800+</span>
                    <span className="block text-[11px] text-[#F9ECEC]/80 mt-1">ASHA Sakhis</span>
                  </div>
                  <div>
                    <span className="block font-cormorant text-3xl sm:text-4xl font-bold text-white">99.4%</span>
                    <span className="block text-[11px] text-[#F9ECEC]/80 mt-1">Immunization</span>
                  </div>
                  <div>
                    <span className="block font-cormorant text-3xl sm:text-4xl font-bold text-white">350k+</span>
                    <span className="block text-[11px] text-[#F9ECEC]/80 mt-1">Visits Logged</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Mission & 4 Feature Points (Span 6) */}
            <div className="lg:col-span-6 space-y-6">
              <span className="eyebrow block">DEDICATED TO COMMUNITY HEALTHCARE</span>
              <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl text-[#3B2A33] font-semibold leading-tight">
                Bridging Care from PHC to the <span className="italic text-[#A25B74]">Last Doorstep.</span>
              </h2>
              
              <p className="text-sm text-[#7A6670] leading-relaxed font-normal">
                ASHA (Accredited Social Health Activist) workers walk thousands of kilometers across rural India 
                to ensure no pregnant mother delivers without skilled care and no infant misses immunization. 
                ASHA Sakhi is engineered to lift the burden of heavy physical registers through voice-first Indic AI.
              </p>

              {/* 4 Feature Points */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white border border-[#A25B74]/10 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#A25B74]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#3B2A33]">Voice-First Notes in 22 Indic Languages</h4>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">Speak naturally with mixed Kannada, Hindi, and English medical terminology.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white border border-[#A25B74]/10 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#A25B74]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#3B2A33]">MoHFW Danger Sign Detection & 108 Dispatch</h4>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">Deterministic rule-engine alerts with immediate life-saving ambulance dispatch link.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white border border-[#A25B74]/10 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#A25B74]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#3B2A33]">100% Offline SQLite Architecture</h4>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">Zero internet required in deep rural fields. Automatic sync upon reaching connectivity.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3.5 p-3.5 rounded-2xl bg-white border border-[#A25B74]/10 shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-[#A25B74]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#3B2A33]">Transparent Incentive Claim Ledger</h4>
                    <p className="text-[11px] text-[#7A6670] mt-0.5">Live rupee counter for every home visit and institutional delivery claim.</p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. MEET OUR ASHA SAKHIS (4 PROFILE CARDS)                     */}
      {/* ============================================================ */}
      <section id="sakhis" className="py-20 lg:py-28 bg-[#FDF6F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="eyebrow block">OUR FRONTLINE HEROES</span>
            <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl text-[#3B2A33] font-semibold leading-tight">
              Trusted Faces in <span className="italic text-[#A25B74]">Every Village.</span>
            </h2>
            <p className="text-sm text-[#7A6670] leading-relaxed">
              Meet the certified community healthcare activists serving families with warmth, clinical diligence, 
              and unwavering dedication.
            </p>
          </div>

          {/* 4 Profile Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Sakhi 1: Sunita Devi */}
            <div className="bg-white rounded-[28px] overflow-hidden border border-[#A25B74]/15 rose-card-shadow group hover:-translate-y-1.5 transition-all duration-300">
              <div className="aspect-square overflow-hidden bg-[#F9ECEC]">
                <img 
                  src="/images/asha-sunita.jpg" 
                  alt="Sunita Devi, Senior ASHA Worker"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25B74] uppercase tracking-wider bg-[#F9ECEC] px-2 py-0.5 rounded-full">
                    8 Years Service
                  </span>
                  <span className="text-[10px] text-[#7A6670] font-mono">Mandya Sec-4</span>
                </div>
                <h3 className="font-cormorant text-xl font-bold text-[#3B2A33]">Sunita Devi</h3>
                <p className="text-xs text-[#7A6670]">Senior Field Health Activist</p>
                <div className="pt-2 border-t border-[#A25B74]/10 text-[11px] text-[#3B2A33] flex items-center justify-between">
                  <span className="text-[#7A6670]">Languages:</span>
                  <span className="font-semibold text-[#A25B74]">ಕನ್ನಡ, हिन्दी</span>
                </div>
              </div>
            </div>

            {/* Sakhi 2: Rajeshwari Bai */}
            <div className="bg-white rounded-[28px] overflow-hidden border border-[#A25B74]/15 rose-card-shadow group hover:-translate-y-1.5 transition-all duration-300">
              <div className="aspect-square overflow-hidden bg-[#F9ECEC]">
                <img 
                  src="/images/asha-rajeshwari.jpg" 
                  alt="Rajeshwari Bai, Lead Community Caregiver"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25B74] uppercase tracking-wider bg-[#F9ECEC] px-2 py-0.5 rounded-full">
                    12 Years Service
                  </span>
                  <span className="text-[10px] text-[#7A6670] font-mono">Keregodu</span>
                </div>
                <h3 className="font-cormorant text-xl font-bold text-[#3B2A33]">Rajeshwari Bai</h3>
                <p className="text-xs text-[#7A6670]">Maternal Care Specialist</p>
                <div className="pt-2 border-t border-[#A25B74]/10 text-[11px] text-[#3B2A33] flex items-center justify-between">
                  <span className="text-[#7A6670]">Languages:</span>
                  <span className="font-semibold text-[#A25B74]">ಕನ್ನಡ</span>
                </div>
              </div>
            </div>

            {/* Sakhi 3: Ananya Sharma */}
            <div className="bg-white rounded-[28px] overflow-hidden border border-[#A25B74]/15 rose-card-shadow group hover:-translate-y-1.5 transition-all duration-300">
              <div className="aspect-square overflow-hidden bg-[#F9ECEC]">
                <img 
                  src="/images/asha-ananya.jpg" 
                  alt="Ananya Sharma, Rural Health Educator"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25B74] uppercase tracking-wider bg-[#F9ECEC] px-2 py-0.5 rounded-full">
                    5 Years Service
                  </span>
                  <span className="text-[10px] text-[#7A6670] font-mono">Shivalli PHC</span>
                </div>
                <h3 className="font-cormorant text-xl font-bold text-[#3B2A33]">Ananya Sharma</h3>
                <p className="text-xs text-[#7A6670]">Immunization & Youth Lead</p>
                <div className="pt-2 border-t border-[#A25B74]/10 text-[11px] text-[#3B2A33] flex items-center justify-between">
                  <span className="text-[#7A6670]">Languages:</span>
                  <span className="font-semibold text-[#A25B74]">हिन्दी, English</span>
                </div>
              </div>
            </div>

            {/* Sakhi 4: Fatima Begum */}
            <div className="bg-white rounded-[28px] overflow-hidden border border-[#A25B74]/15 rose-card-shadow group hover:-translate-y-1.5 transition-all duration-300">
              <div className="aspect-square overflow-hidden bg-[#F9ECEC]">
                <img 
                  src="/images/asha-fatima.jpg" 
                  alt="Fatima Begum, Family Health Volunteer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#A25B74] uppercase tracking-wider bg-[#F9ECEC] px-2 py-0.5 rounded-full">
                    9 Years Service
                  </span>
                  <span className="text-[10px] text-[#7A6670] font-mono">Indiranagar</span>
                </div>
                <h3 className="font-cormorant text-xl font-bold text-[#3B2A33]">Fatima Begum</h3>
                <p className="text-xs text-[#7A6670]">Family Planning Counselor</p>
                <div className="pt-2 border-t border-[#A25B74]/10 text-[11px] text-[#3B2A33] flex items-center justify-between">
                  <span className="text-[#7A6670]">Languages:</span>
                  <span className="font-semibold text-[#A25B74]">اردو, ಕನ್ನಡ</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. REAL WOMEN. REAL STORIES (TESTIMONIAL CAROUSEL)           */}
      {/* ============================================================ */}
      <section id="stories" className="py-20 lg:py-28 bg-[#A25B74] text-white relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-3 mb-12">
            <span className="text-xs uppercase tracking-widest font-bold text-[#FDF6F5]/80 block">
              COMMUNITY VOICES
            </span>
            <h2 className="font-cormorant text-3xl sm:text-4xl lg:text-5xl text-white font-semibold leading-tight">
              Real Women. <span className="italic font-normal text-[#FDF6F5]">Real Stories of Care.</span>
            </h2>
          </div>

          {/* Testimonial Active Slide Card */}
          <div className="bg-white text-[#3B2A33] rounded-[32px] p-8 sm:p-12 rose-card-shadow relative space-y-6">
            {/* Quote Mark */}
            <div className="w-12 h-12 rounded-full bg-[#F9ECEC] text-[#A25B74] flex items-center justify-center font-cormorant text-4xl font-bold">
              “
            </div>

            <p className="font-cormorant text-xl sm:text-2xl text-[#3B2A33] italic leading-relaxed">
              {testimonials[activeTestimonial].quote}
            </p>

            <div className="pt-6 border-t border-[#A25B74]/15 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <img 
                  src={testimonials[activeTestimonial].avatar} 
                  alt={testimonials[activeTestimonial].name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#A25B74]"
                />
                <div>
                  <h4 className="font-bold text-base text-[#3B2A33]">{testimonials[activeTestimonial].name}</h4>
                  <p className="text-xs text-[#7A6670]">{testimonials[activeTestimonial].role}</p>
                  <span className="text-[11px] text-[#A25B74] font-medium block">{testimonials[activeTestimonial].village}</span>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center space-x-2">
                {testimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveTestimonial(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      activeTestimonial === idx ? 'w-8 bg-[#A25B74]' : 'w-2.5 bg-[#A25B74]/25 hover:bg-[#A25B74]/50'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. REQUEST A VISIT FORM (WITH ARCH FLOWER IMAGE)             */}
      {/* ============================================================ */}
      <section id="request-visit" className="py-20 lg:py-28 bg-[#FDF6F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Arch-Crop Flower Vase Image (Span 5) */}
            <div className="lg:col-span-5 flex flex-col items-center text-center space-y-6">
              <div className="w-full max-w-[340px] aspect-[3/4] bg-white p-2.5 rounded-[36px] rose-card-shadow border border-[#A25B74]/15">
                <div className="w-full h-full arch-crop overflow-hidden bg-[#F9ECEC]">
                  <img 
                    src="/images/cta-flowers.jpg" 
                    alt="Delicate blooming pink lotus and roses in artisanal vase"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <span className="font-cormorant text-2xl font-bold text-[#3B2A33] block">
                  Caring Hands at Your Doorstep
                </span>
                <p className="text-xs text-[#7A6670] max-w-xs">
                  All community visits are arranged free of cost under National Health Mission guidelines.
                </p>
              </div>
            </div>

            {/* Right Booking Form Card (Span 7) */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-10 rounded-[32px] border border-[#A25B74]/15 rose-card-shadow space-y-6">
              
              <div>
                <span className="eyebrow block">CONNECT WITH YOUR LOCAL ASHA</span>
                <h2 className="font-cormorant text-3xl sm:text-4xl text-[#3B2A33] font-semibold leading-tight mt-1">
                  Schedule a Compassionate <span className="italic text-[#A25B74]">Home Visit.</span>
                </h2>
                <p className="text-xs text-[#7A6670] mt-1.5">
                  Fill in your details below and a certified village ASHA worker will confirm your visit time.
                </p>
              </div>

              {formSuccess ? (
                <div className="p-6 rounded-2xl bg-[#F9ECEC] border border-[#A25B74]/30 space-y-4 animate-fade-in text-center">
                  <div className="w-12 h-12 rounded-full bg-[#A25B74] text-white flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-cormorant text-2xl font-bold text-[#3B2A33]">Home Visit Requested!</h3>
                    <p className="text-xs text-[#7A6670] mt-1">
                      Request ID: <span className="font-mono font-bold text-[#A25B74]">{formSuccess.id}</span>
                    </p>
                    <p className="text-xs text-[#3B2A33] mt-2">
                      Local ASHA Sakhi <strong>{formSuccess.assigned_worker}</strong> has been notified for your village.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setFormSuccess(null)}
                      className="px-6 py-2.5 rounded-full border border-[#A25B74] text-[#A25B74] text-xs font-bold hover:bg-white transition-all"
                    >
                      Book Another Visit
                    </button>
                    <button
                      onClick={onLaunchApp}
                      className="px-6 py-2.5 rounded-full bg-[#A25B74] text-white text-xs font-bold hover:bg-[#84455C] transition-all"
                    >
                      View in Web App
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#3B2A33] block">Full Name of Beneficiary *</label>
                      <input 
                        type="text" 
                        required
                        value={formData.beneficiary_name}
                        onChange={(e) => setFormData({ ...formData, beneficiary_name: e.target.value })}
                        placeholder="e.g. Rekha Devi / Lakshmi"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FDF6F5] border border-[#A25B74]/20 focus:outline-none focus:ring-2 focus:ring-[#A25B74] text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-[#3B2A33] block">Mobile Phone Number *</label>
                      <input 
                        type="tel" 
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98450 12345"
                        className="w-full px-4 py-3 rounded-2xl bg-[#FDF6F5] border border-[#A25B74]/20 focus:outline-none focus:ring-2 focus:ring-[#A25B74] text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-[#3B2A33] block">Village / Sub-Centre *</label>
                      <select
                        value={formData.village}
                        onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FDF6F5] border border-[#A25B74]/20 focus:outline-none focus:ring-2 focus:ring-[#A25B74] text-xs"
                      >
                        <option value="Mandya Sector 4">Mandya Sector 4 (Main)</option>
                        <option value="Keregodu Subcentre">Keregodu Subcentre</option>
                        <option value="Shivalli Village">Shivalli Village</option>
                        <option value="Indiranagar Ward">Indiranagar Ward</option>
                        <option value="Gopalapura Anganwadi">Gopalapura Anganwadi</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-bold text-[#3B2A33] block">Service Needed *</label>
                      <select
                        value={formData.service_type}
                        onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                        className="w-full px-4 py-3 rounded-2xl bg-[#FDF6F5] border border-[#A25B74]/20 focus:outline-none focus:ring-2 focus:ring-[#A25B74] text-xs"
                      >
                        <option value="Maternal Care (ANC/PNC)">Maternal Care (ANC / Prenatal Checkup)</option>
                        <option value="Child Immunization">Child Immunization (Vaccine Schedule)</option>
                        <option value="Menstrual Health & Hygiene">Menstrual Health & Hygiene Guidance</option>
                        <option value="Family Planning & Counseling">Family Planning & Contraceptive Advice</option>
                        <option value="Nutrition & Anemia Support">Nutrition & IFA Tablet Support</option>
                        <option value="Government Scheme Enrollment">Government Schemes (JSY / PMMVY)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#3B2A33] block">Preferred Date of Visit</label>
                    <input 
                      type="date" 
                      value={formData.preferred_date}
                      onChange={(e) => setFormData({ ...formData, preferred_date: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl bg-[#FDF6F5] border border-[#A25B74]/20 focus:outline-none focus:ring-2 focus:ring-[#A25B74] text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-[#3B2A33] block">Health Concern or Notes (Optional)</label>
                    <textarea 
                      rows="3"
                      value={formData.concern}
                      onChange={(e) => setFormData({ ...formData, concern: e.target.value })}
                      placeholder="e.g. Experiencing mild morning sickness, or due for 10-week Pentavalent vaccination dose..."
                      className="w-full px-4 py-3 rounded-2xl bg-[#FDF6F5] border border-[#A25B74]/20 focus:outline-none focus:ring-2 focus:ring-[#A25B74] text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-4 rounded-full bg-[#A25B74] hover:bg-[#84455C] text-white font-semibold text-sm transition-all rose-button-shadow active:scale-95 flex items-center justify-center space-x-2"
                  >
                    {formSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Submitting to ASHA Registry...</span>
                      </span>
                    ) : (
                      <>
                        <span>Confirm Home Visit Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-[#7A6670] text-center pt-1">
                    *Your contact information is strictly confidential under NHM patient privacy standards.
                  </p>
                </form>
              )}

            </div>

          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. FOOTER WITH SERVICE HOURS & HELPLINES                    */}
      {/* ============================================================ */}
      <footer className="bg-[#A25B74] text-white pt-16 pb-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Col 1: Brand & Mission */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-[#A25B74] flex items-center justify-center font-bold">
                  <Heart className="w-5 h-5 fill-[#A25B74]" />
                </div>
                <span className="font-cormorant font-bold text-2xl tracking-tight text-white">
                  ASHA <span className="italic font-normal">Sakhi</span>
                </span>
              </div>
              <p className="text-xs text-[#FDF6F5]/80 leading-relaxed">
                Empowering India's 1 million+ ASHA healthcare heroes with AI4Bharat voice intelligence, 
                streamlining maternal tracking, immunization, and community care.
              </p>
            </div>

            {/* Col 2: Services Links */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm tracking-wider uppercase text-[#FDF6F5]">Frontline Services</h4>
              <ul className="space-y-2 text-[#FDF6F5]/80">
                <li><a href="#services" className="hover:text-white transition-colors">Maternal & Prenatal Care</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Universal Child Immunization</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Menstrual Health & Hygiene</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Family Planning Counseling</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">JSY & PMMVY Benefits</a></li>
              </ul>
            </div>

            {/* Col 3: Service Hours & Facilities */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm tracking-wider uppercase text-[#FDF6F5]">Service Hours</h4>
              <ul className="space-y-2 text-[#FDF6F5]/80">
                <li>Monday – Saturday: 8:00 AM – 6:00 PM</li>
                <li>Sunday: Scheduled Village Visits</li>
                <li className="font-bold text-white pt-1">Emergency Services: 24 Hours / 7 Days</li>
                <li className="text-[11px] text-[#FDF6F5]/70">Mandya District PHC Sector 4 Subcentres</li>
              </ul>
            </div>

            {/* Col 4: National Helplines */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-sm tracking-wider uppercase text-[#FDF6F5]">National Helplines</h4>
              <div className="space-y-2">
                <a 
                  href="tel:108"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/15"
                >
                  <span className="font-semibold">Ambulance Emergency</span>
                  <span className="font-mono font-bold text-white text-sm">108</span>
                </a>
                <a 
                  href="tel:104"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/15"
                >
                  <span className="font-semibold">Health Information</span>
                  <span className="font-mono font-bold text-white text-sm">104</span>
                </a>
                <a 
                  href="tel:181"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/15"
                >
                  <span className="font-semibold">Women Helpline</span>
                  <span className="font-mono font-bold text-white text-sm">181</span>
                </a>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Disclaimer & Privacy */}
          <div className="pt-8 border-t border-white/15 text-[11px] text-[#FDF6F5]/70 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p>
              © 2026 ASHA Sakhi. Built with pride for India's frontline healthcare workers. 
              Aligned with National Health Mission (NHM) and MoHFW guidelines.
            </p>
            <p className="max-w-md">
              *Disclaimer: ASHA Sakhi provides community healthcare tracking and informational guidance. 
              It is not a substitute for professional clinical medical advice or diagnosis.
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
}
