'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Compass, 
  MessageSquare, 
  Search, 
  ArrowRight, 
  Calendar, 
  MapPin, 
  ArrowRightLeft,
  FileText, 
  ShieldCheck, 
  PhoneCall, 
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Train,
  HelpCircle,
  Layers,
  ChevronRight,
  Flame,
  Radio,
  Gauge
} from 'lucide-react';
import { 
  fetchDashboardInsights, 
  DashboardInsights, 
  fetchStations, 
  StationItem 
} from '@/lib/api';
import { Container } from '@/primitives/Container';
import { Button } from '@/primitives/Button';
import { Badge } from '@/primitives/Badge';
import { Card } from '@/primitives/Card';
import { TrainWindowHero } from '@/components/TrainWindowHero';
import { JourneyMilestone } from '@/components/JourneyMilestone';
import { ScenicRouteCards } from '@/components/ScenicRouteCards';
import { WelcomeSplashScreen } from '@/components/WelcomeSplashScreen';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [showIntro, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    // Check if first-time visitor
    try {
      const hasSeen = localStorage.getItem('railassist_intro_completed');
      if (!hasSeen && !isAuthenticated) {
        setShowIntro(true);
      }
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    // Handle hash navigation on mount and hash changes (e.g. #ai-assistant)
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');
        const el = document.getElementById(id);
        if (el) {
          const navbarHeight = 75;
          const pos = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
          window.scrollTo({ top: Math.max(0, pos), behavior: 'smooth' });
        }
      }
    };

    const timer = setTimeout(handleHash, 150);
    window.addEventListener('hashchange', handleHash);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('hashchange', handleHash);
    };
  }, []);

  // Search form state
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [journeyDate, setJourneyDate] = useState('');
  const [selectedQuickDate, setSelectedQuickDate] = useState<'today' | 'tomorrow' | 'dayAfter' | null>('tomorrow');
  const [todayStr, setTodayStr] = useState('');
  const [tomorrowStr, setTomorrowStr] = useState('');
  const [dayAfterStr, setDayAfterStr] = useState('');
  const [allStations, setAllStations] = useState<StationItem[]>([]);
  
  // Autocomplete dropdown state
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // AI query form state
  const [aiQuery, setAiQuery] = useState('');
  const [activeChip, setActiveChip] = useState<string>('vande-bharat');

  // Dataset stats
  const [insights, setInsights] = useState<DashboardInsights | null>(null);

  useEffect(() => {
    const d = new Date();
    const format = (dt: Date) => {
      const y = dt.getFullYear();
      const m = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const t0 = new Date(d);
    const t1 = new Date(d);
    t1.setDate(t1.getDate() + 1);
    const t2 = new Date(d);
    t2.setDate(t2.getDate() + 2);

    const s0 = format(t0);
    const s1 = format(t1);
    const s2 = format(t2);

    setTodayStr(s0);
    setTomorrowStr(s1);
    setDayAfterStr(s2);
    setJourneyDate(s1);
    setSelectedQuickDate('tomorrow');

    // Load stations for autocomplete
    fetchStations()
      .then(setAllStations)
      .catch((err) => console.log('Could not load station list:', err));

    // Load system insights
    fetchDashboardInsights()
      .then(setInsights)
      .catch((err) => console.log('Could not load dashboard stats:', err));
  }, []);

  // Click outside listener for station dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fromRef.current && !fromRef.current.contains(event.target as Node)) {
        setShowFromSuggestions(false);
      }
      if (toRef.current && !toRef.current.contains(event.target as Node)) {
        setShowToSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getFilteredStations = (query: string) => {
    if (!query || query.trim().length < 1) return [];
    const q = query.trim().toUpperCase();
    return allStations
      .filter(
        (s) =>
          s.station_code.toUpperCase().includes(q) ||
          s.station_name.toUpperCase().includes(q)
      )
      .slice(0, 6);
  };

  const handleTrainSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromQuery.trim() || !toQuery.trim()) return;
    router.push(
      `/trains?from=${encodeURIComponent(fromQuery.trim())}&to=${encodeURIComponent(toQuery.trim())}&date=${journeyDate}`
    );
  };

  const handleAiQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    router.push(`/chat?q=${encodeURIComponent(aiQuery.trim())}`);
  };

  const handleSwapStations = () => {
    const temp = fromQuery;
    setFromQuery(toQuery);
    setToQuery(temp);
  };

  const setDateOffset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${day}`;
    setJourneyDate(formatted);
    if (days === 0) setSelectedQuickDate('today');
    else if (days === 1) setSelectedQuickDate('tomorrow');
    else if (days === 2) setSelectedQuickDate('dayAfter');
    else setSelectedQuickDate(null);
  };

  const setRouteShortcut = (from: string, to: string) => {
    setFromQuery(from);
    setToQuery(to);
  };

  // Grounded Sample Answers based on official capstone data
  const sampleAnswers: Record<string, { query: string; answer: string; citation: string; category: string }> = {
    'vande-bharat': {
      query: 'What is the refund rule for Vande Bharat Sleeper cancellation?',
      answer:
        'Under Railway Board Circular TC-II/2026/VBS, cancellation > 72 hours before departure incurs standard clerkage (₹240 for 1st AC, ₹180 for 2nd AC). Between 72h and 24h, 25% of fare is deducted. Between 24h and 8h, 50% is deducted. No refund is granted within 8 hours of scheduled departure.',
      citation: 'Railway Board Circular TC-II/2026/VBS (Section 4.2)',
      category: '2026 Active Precedence',
    },
    'tatkal-refund': {
      query: 'Can I get a refund on a cancelled Tatkal ticket?',
      answer:
        'No refund is granted on cancellation of confirmed Tatkal tickets. However, a full refund (minus clerkage) is admissible if the train is delayed by more than 3 hours, if the train route is diverted, or if Tatkal waitlisted passengers remain unconfirmed after final chart preparation.',
      citation: 'CC 2015/07 Cancellation & Refund Rules (Clause 14)',
      category: 'Statutory Gazette Rules',
    },
    'luggage-rules': {
      query: 'What is the free luggage allowance in AC 2-Tier?',
      answer:
        'In AC 2-Tier, each passenger is allowed 50 kg of free luggage with a marginal allowance of 10 kg (maximum permissible 100 kg with luggage booking fee). Luggage dimensions must not exceed 100 cm × 60 cm × 25 cm for carriage inside the compartment.',
      citation: 'Indian Railways Commercial Manual (Chapter 18)',
      category: 'Luggage Regulations',
    },
    'ndls-lounge': {
      query: 'What amenities are available at New Delhi Railway Station (NDLS)?',
      answer:
        'New Delhi Railway Station (NDLS) offers 24x7 IRCTC Executive Lounges on Platform 1 and Platform 16 with buffet dining, reclining seating, Wi-Fi, and shower rooms. It also features automated battery-operated car assistance for senior citizens, computerized cloakrooms, and direct subway connectivity to the Airport Express Metro.',
      citation: 'Northern Railway Station Directory (NDLS Hub)',
      category: 'Station Amenities',
    },
  };

  const officialCirculars = [
    {
      code: 'TC-II/2026/VBS',
      title: 'Vande Bharat Sleeper Cancellation & Refund Rules (2026)',
      authority: 'Railway Board Commercial',
      category: 'Policy Circular',
      effective: 'Highest Precedence',
    },
    {
      code: 'CC 2015/07',
      title: 'Railway Passengers (Cancellation of Ticket & Refund of Fare) Rules',
      authority: 'Ministry of Railways Gazette',
      category: 'Statutory Rules',
      effective: 'Standard Baseline',
    },
    {
      code: 'RB/COMM/2024/ARP',
      title: 'Advance Reservation Period (ARP) Revision from 120 to 60 Days',
      authority: 'Railway Board Commercial',
      category: 'Reservation Policy',
      effective: 'Active Current',
    },
    {
      code: 'SOP/RM-139/2023',
      title: 'Integrated Single-Number (139) Rail Madad Passenger Care System',
      authority: 'Indian Railways Operations',
      category: 'Emergency & Care',
      effective: '24x7 Active',
    },
  ];

  if (showIntro) {
    return (
      <WelcomeSplashScreen
        onComplete={() => {
          try {
            localStorage.setItem('railassist_intro_completed', 'true');
          } catch {}
          setShowIntro(false);
          router.push('/login');
        }}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF5ED] dark:bg-[#100D19] text-[#251B32] dark:text-[#FFF8F0] overflow-x-hidden">
      
      {/* Personalized Passenger Welcome Banner */}
      {isAuthenticated && user && (
        <div className="pt-20 pb-2.5 px-4 bg-[#FAF5ED] dark:bg-[#191426] border-b border-[#E7D5C1] dark:border-[#493B55] transition-colors relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#251B32] dark:text-[#FFF8F0]">
                Welcome back, {user.full_name}!
              </span>
              <span className="text-[#685C6B] dark:text-[#C5B9CD] hidden sm:inline">
                &bull; Individual passenger account verified & active
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px] text-[#E9793D] dark:text-[#F5B65C]">
              <span>MEMBER SINCE {new Date(user.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 1. CINEMATIC HERO: THE ANIMATED RAILWAY WORLD           */}
      {/* ======================================================== */}
      <TrainWindowHero />

      {/* ======================================================== */}
      {/* STATION MILESTONE 01: ORIGIN -> SEARCH                   */}
      {/* ======================================================== */}
      <JourneyMilestone
        stationCode="NDLS"
        stationName="New Delhi Central Junction"
        milestoneTitle="Station 01: Departure Platform"
        milestoneSubtitle="5,208 Timetable Services Indexed"
        statusText="PLATFORM CLEAR"
      />

      {/* ======================================================== */}
      {/* 2. THE RAILWAY PLATFORM: FIND YOUR TRAIN                 */}
      {/* ======================================================== */}
      <section id="journey-search" className="relative py-14 overflow-hidden scroll-mt-24">
        {/* Subtle Environment Illumination */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-gradient-to-b from-[#E67E48]/10 to-transparent blur-3xl pointer-events-none" />

        <Container size="large">
          <div className="max-w-4xl mx-auto">
            
            {/* Heritage Station Signboard & Ambient Platform Lantern Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E7D5C1] dark:border-[#493B55] pb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] border border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-center text-[#E9793D] dark:text-[#F5B65C] shadow-md animate-lantern-glow">
                  <Train className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#251B32] dark:text-[#FFF8F0]">
                      Find Scheduled Trains
                    </h2>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-[#FAF5ED] dark:bg-[#292137] text-[10px] font-mono text-[#E9793D] dark:text-[#F5B65C] border border-[#E7D5C1] dark:border-[#493B55]">
                      PLATFORM 01
                    </span>
                  </div>
                  <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-0.5">
                    Query scheduled trains across India with verified route direction sequence checks.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="verified" size="small">
                  MATHEMATICAL ROUTE GRAPH
                </Badge>
              </div>
            </div>

            {/* Platform Departure Board Search Interface */}
            <div className="rounded-2xl border-2 border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D] p-6 sm:p-7 shadow-2xl relative overflow-hidden">
              {/* Subtle Platform Board Header Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E67E48] via-[#F6C176] to-[#234E41]" />

              <form onSubmit={handleTrainSearchSubmit} className="space-y-4 pt-1">
                
                {/* From / Swap / To Station Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center">
                  
                  {/* From Station with Autocomplete */}
                  <div className="md:col-span-5 relative" ref={fromRef}>
                    <label className="block text-xs font-semibold text-[#251B32] dark:text-[#C5B9CD] mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C]" />
                      <span>Origin Station (Code or City)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fromQuery}
                        onChange={(e) => {
                          setFromQuery(e.target.value);
                          setShowFromSuggestions(true);
                        }}
                        onFocus={() => setShowFromSuggestions(true)}
                        placeholder="e.g. NDLS, New Delhi, ERS"
                        className="w-full bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#251B32] dark:text-[#FFF8F0] placeholder-[#8E8274] dark:placeholder-[#A093B3] focus:outline-none focus:border-[#E9793D] focus:ring-1 focus:ring-[#E9793D] transition-colors"
                        required
                      />
                      {fromQuery && (
                        <button
                          type="button"
                          onClick={() => setFromQuery('')}
                          className="absolute right-3 top-2.5 text-[#8E8274] dark:text-[#A093B3] hover:text-[#251B32] dark:hover:text-[#FFF8F0] text-sm"
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    {/* Autocomplete Menu */}
                    {showFromSuggestions && getFilteredStations(fromQuery).length > 0 && (
                      <div className="station-autocomplete-dropdown absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#E7D5C1] dark:divide-[#493B55]">
                        {getFilteredStations(fromQuery).map((st) => (
                          <button
                            key={st.station_code}
                            type="button"
                            onClick={() => {
                              setFromQuery(st.station_code);
                              setShowFromSuggestions(false);
                            }}
                            className="station-autocomplete-item w-full px-3.5 py-2.5 text-left bg-white dark:bg-[#191426] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] transition-colors flex items-center justify-between text-xs cursor-pointer group"
                          >
                            <span className="station-name font-semibold text-[#251B32] dark:text-[#FFF8F0] group-hover:text-[#E9793D] dark:group-hover:text-[#F5B65C]">
                              {st.station_name}
                            </span>
                            <span className="station-code font-mono text-[#E9793D] dark:text-[#F5B65C] font-bold px-1.5 py-0.5 rounded bg-[#FAF5ED] dark:bg-[#292137] border border-[#E7D5C1] dark:border-[#493B55]">
                              {st.station_code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Swap Button with smooth rotation */}
                  <div className="md:col-span-1 flex justify-center pt-2 md:pt-5">
                    <button
                      type="button"
                      onClick={handleSwapStations}
                      title="Swap Origin and Destination"
                      className="p-2.5 rounded-full bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#E9793D] dark:text-[#F5B65C] border border-[#E7D5C1] dark:border-[#493B55] transition-all transform hover:rotate-180 duration-300 cursor-pointer shadow-md"
                    >
                      <ArrowRightLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* To Station with Autocomplete */}
                  <div className="md:col-span-5 relative" ref={toRef}>
                    <label className="block text-xs font-semibold text-[#251B32] dark:text-[#C5B9CD] mb-1.5 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#13875C] dark:text-[#20C997]" />
                      <span>Destination Station (Code or City)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={toQuery}
                        onChange={(e) => {
                          setToQuery(e.target.value);
                          setShowToSuggestions(true);
                        }}
                        onFocus={() => setShowToSuggestions(true)}
                        placeholder="e.g. TVC, Trivandrum, MMCT"
                        className="w-full bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium text-[#251B32] dark:text-[#FFF8F0] placeholder-[#8E8274] dark:placeholder-[#A093B3] focus:outline-none focus:border-[#E9793D] focus:ring-1 focus:ring-[#E9793D] transition-colors"
                        required
                      />
                      {toQuery && (
                        <button
                          type="button"
                          onClick={() => setToQuery('')}
                          className="absolute right-3 top-2.5 text-[#8E8274] dark:text-[#A093B3] hover:text-[#251B32] dark:hover:text-[#FFF8F0] text-sm"
                        >
                          &times;
                        </button>
                      )}
                    </div>

                    {showToSuggestions && getFilteredStations(toQuery).length > 0 && (
                      <div className="station-autocomplete-dropdown absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-[#E7D5C1] dark:divide-[#493B55]">
                        {getFilteredStations(toQuery).map((st) => (
                          <button
                            key={st.station_code}
                            type="button"
                            onClick={() => {
                              setToQuery(st.station_code);
                              setShowToSuggestions(false);
                            }}
                            className="station-autocomplete-item w-full px-3.5 py-2.5 text-left bg-white dark:bg-[#191426] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] transition-colors flex items-center justify-between text-xs cursor-pointer group"
                          >
                            <span className="station-name font-semibold text-[#251B32] dark:text-[#FFF8F0] group-hover:text-[#E9793D] dark:group-hover:text-[#F5B65C]">
                              {st.station_name}
                            </span>
                            <span className="station-code font-mono text-[#13875C] dark:text-[#20C997] font-bold px-1.5 py-0.5 rounded bg-[#EBF7F0] dark:bg-[#292137] border border-[#C5E8D3] dark:border-[#493B55]">
                              {st.station_code}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Journey Date Controls & Primary Action */}
                <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#E7D5C1] dark:border-[#493B55]">
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#251B32] dark:text-[#C5B9CD] flex items-center gap-1 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C]" />
                      <span>Date:</span>
                    </span>
                    <input
                      type="date"
                      value={journeyDate}
                      onChange={(e) => {
                        const val = e.target.value;
                        setJourneyDate(val);
                        if (val === todayStr) setSelectedQuickDate('today');
                        else if (val === tomorrowStr) setSelectedQuickDate('tomorrow');
                        else if (val === dayAfterStr) setSelectedQuickDate('dayAfter');
                        else setSelectedQuickDate(null);
                      }}
                      className="bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-lg px-3 py-1.5 text-xs text-[#251B32] dark:text-[#FFF8F0] focus:outline-none focus:border-[#E9793D] transition-colors"
                    />
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setDateOffset(0)}
                        className={`quick-date-btn text-[11px] py-1 px-2.5 ${selectedQuickDate === 'today' ? 'quick-date-btn-active' : ''}`}
                        aria-pressed={selectedQuickDate === 'today'}
                      >
                        Today
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOffset(1)}
                        className={`quick-date-btn text-[11px] py-1 px-2.5 ${selectedQuickDate === 'tomorrow' ? 'quick-date-btn-active' : ''}`}
                        aria-pressed={selectedQuickDate === 'tomorrow'}
                      >
                        Tomorrow
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOffset(2)}
                        className={`quick-date-btn text-[11px] py-1 px-2.5 hidden sm:inline-flex ${selectedQuickDate === 'dayAfter' ? 'quick-date-btn-active' : ''}`}
                        aria-pressed={selectedQuickDate === 'dayAfter'}
                      >
                        +2 Days
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="medium"
                    icon={<Search className="w-4 h-4" />}
                    className="w-full sm:w-auto px-7 py-2.5 font-bold text-xs sm:text-sm"
                  >
                    Search Trains
                  </Button>
                </div>

              </form>

              {/* High Demand Indian Railway Corridors */}
              <div className="mt-5 pt-3.5 border-t border-[#E7D5C1] dark:border-[#493B55] flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[#685C6B] dark:text-[#C5B9CD] font-semibold">High-Demand Corridors:</span>
                <button
                  type="button"
                  onClick={() => setRouteShortcut('ERS', 'TVC')}
                  className="px-3 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F5B65C] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:border-[#E9793D] dark:hover:border-[#F18445] transition-colors cursor-pointer"
                >
                  Ernakulam (ERS) &rarr; Trivandrum (TVC)
                </button>
                <button
                  type="button"
                  onClick={() => setRouteShortcut('MMCT', 'NDLS')}
                  className="px-3 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F5B65C] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:border-[#E9793D] dark:hover:border-[#F18445] transition-colors cursor-pointer"
                >
                  Mumbai (MMCT) &rarr; New Delhi (NDLS)
                </button>
                <button
                  type="button"
                  onClick={() => setRouteShortcut('MAS', 'CBE')}
                  className="px-3 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F5B65C] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:border-[#E9793D] dark:hover:border-[#F18445] transition-colors cursor-pointer"
                >
                  Chennai (MAS) &rarr; Coimbatore (CBE)
                </button>
                <button
                  type="button"
                  onClick={() => setRouteShortcut('NDLS', 'RKMP')}
                  className="px-3 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F5B65C] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:border-[#E9793D] dark:hover:border-[#F18445] transition-colors hidden sm:inline-block cursor-pointer"
                >
                  New Delhi (NDLS) &rarr; Bhopal (RKMP)
                </button>
              </div>

            </div>

          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* STATION MILESTONE 02: SEARCH -> AI ASSISTANT             */}
      {/* ======================================================== */}
      <JourneyMilestone
        stationCode="CSMT"
        stationName="Chhatrapati Shivaji Maharaj Terminus"
        milestoneTitle="Station 02: Passenger Cabin Lounge"
        milestoneSubtitle="Grounded RAG with Circular Citations"
        statusText="CABIN ASSIST ACTIVE"
      />

      {/* ======================================================== */}
      {/* 3. OBSERVATION COMPARTMENT: AI PASSENGER COMPANION       */}
      {/* ======================================================== */}
      <section id="ai-assistant" className="relative py-14 overflow-hidden scroll-mt-24">
        {/* Subtle Ambient Dusk Violet Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-gradient-to-b from-[#74426B]/15 to-transparent blur-3xl pointer-events-none" />

        <Container size="large">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Inquiry Box & Prompt Chips */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="verified" size="small">
                    OFFICIAL RAG COMPANION
                  </Badge>
                  <span className="text-xs font-mono text-[#685C6B] dark:text-[#C5B9CD]">Strict Document Grounding</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
                  Passenger Assistance Cabin
                </h2>
                <p className="text-xs sm:text-sm text-[#685C6B] dark:text-[#C5B9CD] mt-1.5 leading-relaxed">
                  Ask natural-language questions regarding Indian Railways rules, refund schedules, Tatkal timings, or station amenities. Answers are grounded in official records.
                </p>
              </div>

              {/* Inquiry Input Box */}
              <form onSubmit={handleAiQuerySubmit} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g. What is the cancellation deduction for 3rd AC 10 hours before departure?"
                    className="w-full bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl px-4 py-3.5 text-xs sm:text-sm text-[#251B32] dark:text-[#FFF8F0] placeholder-[#8E8274] dark:placeholder-[#A093B3] focus:outline-none focus:border-[#E9793D] focus:ring-1 focus:ring-[#E9793D] shadow-inner transition-colors"
                    required
                  />
                  <div className="absolute right-2 top-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="small"
                      icon={<ArrowRight className="w-4 h-4" />}
                      className="px-4 py-2 text-xs font-bold"
                    >
                      Ask
                    </Button>
                  </div>
                </div>
              </form>

              {/* Verified Inquiry Chips */}
              <div className="pt-2">
                <span className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] block mb-2">
                  Frequently Verified Inquiries (Click to Preview):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setActiveChip('vande-bharat')}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      activeChip === 'vande-bharat'
                        ? 'bg-[#E9793D]/15 dark:bg-[#F18445]/20 border-[#E9793D] dark:border-[#F5B65C] text-[#251B32] dark:text-[#FFF8F0] shadow-md'
                        : 'bg-white dark:bg-[#211A2D] border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] hover:border-[#E9793D] dark:hover:border-[#F18445]'
                    }`}
                  >
                    <span className="font-bold block text-[#E9793D] dark:text-[#F5B65C] mb-0.5">Vande Bharat Sleeper</span>
                    <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] line-clamp-1">Refund schedule & clerkage charges</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChip('tatkal-refund')}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      activeChip === 'tatkal-refund'
                        ? 'bg-[#E9793D]/15 dark:bg-[#F18445]/20 border-[#E9793D] dark:border-[#F5B65C] text-[#251B32] dark:text-[#FFF8F0] shadow-md'
                        : 'bg-white dark:bg-[#211A2D] border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] hover:border-[#E9793D] dark:hover:border-[#F18445]'
                    }`}
                  >
                    <span className="font-bold block text-[#13875C] dark:text-[#20C997] mb-0.5">Tatkal Cancellation</span>
                    <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] line-clamp-1">Confirmed vs waitlist refund rules</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChip('luggage-rules')}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      activeChip === 'luggage-rules'
                        ? 'bg-[#E9793D]/15 dark:bg-[#F18445]/20 border-[#E9793D] dark:border-[#F5B65C] text-[#251B32] dark:text-[#FFF8F0] shadow-md'
                        : 'bg-white dark:bg-[#211A2D] border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] hover:border-[#E9793D] dark:hover:border-[#F18445]'
                    }`}
                  >
                    <span className="font-bold block text-[#D99A43] dark:text-[#F5B65C] mb-0.5">Luggage Allowance</span>
                    <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] line-clamp-1">Permissible free weight by coach class</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveChip('ndls-lounge')}
                    className={`text-left p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                      activeChip === 'ndls-lounge'
                        ? 'bg-[#E9793D]/15 dark:bg-[#F18445]/20 border-[#E9793D] dark:border-[#F5B65C] text-[#251B32] dark:text-[#FFF8F0] shadow-md'
                        : 'bg-white dark:bg-[#211A2D] border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] hover:border-[#E9793D] dark:hover:border-[#F18445]'
                    }`}
                  >
                    <span className="font-bold block text-purple-600 dark:text-purple-300 mb-0.5">New Delhi Amenities</span>
                    <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] line-clamp-1">NDLS executive lounge & cloakroom</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Grounded Answer Terminal */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl border-2 border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D] shadow-2xl p-6 flex flex-col justify-between">
                
                {/* Terminal Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E7D5C1] dark:border-[#493B55]">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#20C997]" />
                    <span className="text-xs font-mono font-bold text-[#251B32] dark:text-[#FFF8F0] uppercase tracking-wider">
                      Grounded Answer Preview
                    </span>
                  </div>
                  <Badge variant="verified" size="small">
                    {sampleAnswers[activeChip].category}
                  </Badge>
                </div>

                {/* Question & Answer Content */}
                <div className="py-4 space-y-3.5">
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-[#FAF5ED] dark:bg-[#292137] border border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-center text-xs font-bold text-[#E9793D] dark:text-[#F5B65C] shrink-0 mt-0.5">
                      Q
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#251B32] dark:text-[#FFF8F0]">
                      {sampleAnswers[activeChip].query}
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 bg-[#FAF5ED] dark:bg-[#191426] p-4 rounded-xl border border-[#E7D5C1] dark:border-[#493B55]">
                    <div className="w-6 h-6 rounded-md bg-[#E9793D]/20 border border-[#E9793D]/40 flex items-center justify-center text-xs font-bold text-[#E9793D] dark:text-[#F5B65C] shrink-0 mt-0.5">
                      A
                    </div>
                    <p className="text-xs sm:text-sm text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
                      {sampleAnswers[activeChip].answer}
                    </p>
                  </div>

                  {/* Grounded Citation */}
                  <div className="flex items-center gap-2 text-[11px] text-[#685C6B] dark:text-[#C5B9CD] font-mono bg-[#FAF5ED] dark:bg-[#191426] px-3.5 py-2 rounded-lg border border-[#E7D5C1] dark:border-[#493B55]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-[#20C997] shrink-0" />
                    <span className="text-[#685C6B] dark:text-[#C5B9CD]">Citation:</span>
                    <span className="text-[#E9793D] dark:text-[#F5B65C] font-bold">{sampleAnswers[activeChip].citation}</span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3.5 border-t border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between">
                  <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] font-mono">
                    Deterministic Refusal on Unknowns
                  </span>
                  <Link
                    href={`/chat?q=${encodeURIComponent(sampleAnswers[activeChip].query)}`}
                    target="_self"
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                        e.preventDefault();
                        router.push(`/chat?q=${encodeURIComponent(sampleAnswers[activeChip].query)}`);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-orange-950/40"
                  >
                    <span>Open in AI Assistant</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* STATION MILESTONE 03: SERVICES                           */}
      {/* ======================================================== */}
      <JourneyMilestone
        stationCode="HWH"
        stationName="Howrah Terminus"
        milestoneTitle="Station 03: Railway Information Hub"
        milestoneSubtitle="Timetables, Amenities, Refunds, & Safety"
        statusText="INFORMATION ACTIVE"
      />

      {/* ======================================================== */}
      {/* 4. CORE PASSENGER SERVICES OVERVIEW                      */}
      {/* ======================================================== */}
      <section className="relative py-14 overflow-hidden">
        <Container size="large">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
              Passenger Information Modules
            </h2>
            <p className="text-xs sm:text-sm text-[#685C6B] dark:text-[#C5B9CD] mt-1">
              Select an operational section to review verified timetables, statutory refund schedules, or station amenities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Service 1 */}
            <Card
              variant="default"
              className="p-5 flex flex-col justify-between"
              interactive
              onClick={() => router.push('/trains')}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF2E9] dark:bg-[#292137] border border-[#FADBD0] dark:border-[#493B55] flex items-center justify-center text-[#E9793D] dark:text-[#F5B65C] transition-colors">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#685C6B] dark:text-[#C5B9CD] font-bold">MODULE 01</span>
                </div>
                <h3 className="text-sm font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5">
                  Train Timetable Search
                </h3>
                <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
                  Search scheduled trains between any two stations with route sequence validation ensuring the destination occurs after origin.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-[#E7D5C1] dark:border-[#493B55] text-xs font-bold text-[#E9793D] dark:text-[#F5B65C] flex items-center justify-between">
                <span>Open Train Search</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Service 2 */}
            <Card
              variant="default"
              className="p-5 flex flex-col justify-between"
              interactive
              onClick={() => router.push('/explore?category=policies')}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EBF7F0] dark:bg-emerald-950/60 border border-[#C5E8D3] dark:border-emerald-800/40 flex items-center justify-center text-[#13875C] dark:text-[#20C997] transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#685C6B] dark:text-[#C5B9CD] font-bold">MODULE 02</span>
                </div>
                <h3 className="text-sm font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5">
                  Tatkal & Refund Policies
                </h3>
                <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
                  Clear reference on cancellation deductions based on hours before departure, confirmed/waitlist refunds, and Vande Bharat Sleeper rules.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-[#E7D5C1] dark:border-[#493B55] text-xs font-bold text-[#13875C] dark:text-[#20C997] flex items-center justify-between">
                <span>View Policy Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Service 3 */}
            <Card
              variant="default"
              className="p-5 flex flex-col justify-between"
              interactive
              onClick={() => router.push('/explore?category=stations')}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFF6E5] dark:bg-[#292137] border border-[#FFE2B0] dark:border-[#493B55] flex items-center justify-center text-[#D99A43] dark:text-[#F5B65C] transition-colors">
                    <Database className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#685C6B] dark:text-[#C5B9CD] font-bold">MODULE 03</span>
                </div>
                <h3 className="text-sm font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5">
                  Station Amenities Directory
                </h3>
                <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
                  Information on cloak rooms, waiting lounges, wheelchair assistance, water vending machines, and connectivity across stations.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-[#E7D5C1] dark:border-[#493B55] text-xs font-bold text-[#D99A43] dark:text-[#F5B65C] flex items-center justify-between">
                <span>Browse Stations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

            {/* Service 4 */}
            <Card
              variant="default"
              className="p-5 flex flex-col justify-between"
              interactive
              onClick={() => router.push('/about')}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FDF0ED] dark:bg-rose-950/60 border border-[#FACDC3] dark:border-rose-800/40 flex items-center justify-center text-[#C53030] dark:text-rose-400 transition-colors">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono text-[#685C6B] dark:text-[#C5B9CD] font-bold">MODULE 04</span>
                </div>
                <h3 className="text-sm font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5">
                  Rail Madad & Helplines
                </h3>
                <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
                  Emergency procedures for lost baggage, medical attention on running trains, security alert escalation, and the 24x7 139 hotline.
                </p>
              </div>
              <div className="pt-3 mt-4 border-t border-[#E7D5C1] dark:border-[#493B55] text-xs font-bold text-[#C53030] dark:text-rose-400 flex items-center justify-between">
                <span>Emergency Support</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>

          </div>
        </Container>
      </section>

      {/* ======================================================== */}
      {/* STATION MILESTONE 04: SCENIC VISTA                       */}
      {/* ======================================================== */}
      <JourneyMilestone
        stationCode="MAQ"
        stationName="Mangaluru Central Junction"
        milestoneTitle="Station 04: Discover the Journey"
        milestoneSubtitle="Iconic Indian Railway Routes & Engineering Icons"
        statusText="SCENIC VISTA CLEAR"
      />

      {/* ======================================================== */}
      {/* 5. DISCOVER THE JOURNEY: FEATURED SCENIC ROUTES          */}
      {/* ======================================================== */}
      <section className="relative py-14 overflow-hidden">
        <Container size="large">
          <div className="max-w-3xl mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="verified" size="small">
                RAILWAY HERITAGE & INNOVATION
              </Badge>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
              Discover the Journey: Iconic Rail Corridors
            </h2>
            <p className="text-xs sm:text-sm text-[#685C6B] dark:text-[#C5B9CD] mt-2 leading-relaxed">
              Experience the breathtaking landscapes of Indian Railways — from coastal viaducts along the Arabian Sea to Himalayan heritage narrow-gauge lines and modern Vande Bharat corridors.
            </p>
          </div>

          <ScenicRouteCards />
        </Container>
      </section>

      {/* ======================================================== */}
      {/* STATION MILESTONE 05: DATA INSIGHTS                      */}
      {/* ======================================================== */}
      <JourneyMilestone
        stationCode="MAS"
        stationName="Chennai Central Terminus"
        milestoneTitle="Station 05: Platform Insights"
        milestoneSubtitle="Verified Timetable Fleet & Grounded Benchmark"
        statusText="DATA AUDIT VERIFIED"
      />

      {/* ======================================================== */}
      {/* 6. RAILWAY INSIGHTS & REGULATORY LEDGER                  */}
      {/* ======================================================== */}
      <section className="relative py-14 overflow-hidden">
        <Container size="large">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
                Railway Fleet Coverage & Grounding Metrics
              </h2>
              <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-1">
                Deterministic accuracy backed by the official Indian Railways timetable database and Railway Board gazettes.
              </p>
            </div>
            <Link
              href="/dashboard"
              target="_self"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                  e.preventDefault();
                  router.push('/dashboard');
                }
              }}
              className="text-xs text-[#E9793D] dark:text-[#F5B65C] hover:underline flex items-center gap-1 font-bold shrink-0 cursor-pointer"
            >
              <span>Explore Analytics Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Stat Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl border border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D]">
              <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-semibold block">Timetable Services</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0] mt-1 block">
                {insights?.total_trains || '5,208'}
              </span>
              <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1 block">Scheduled train routes</span>
            </div>

            <div className="p-5 rounded-2xl border border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D]">
              <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-semibold block">Indexed Stations</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0] mt-1 block">
                {insights?.total_stations || '8,990'}
              </span>
              <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1 block">Pan-India railway stations</span>
            </div>

            <div className="p-5 rounded-2xl border border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D]">
              <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-semibold block">Official Circulars</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#E9793D] dark:text-[#F5B65C] mt-1 block">
                7 Documents
              </span>
              <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1 block">Prioritized chronologically</span>
            </div>

            <div className="p-5 rounded-2xl border border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D]">
              <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-semibold block">Grounding Guarantee</span>
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[#13875C] dark:text-[#20C997] mt-1 block">
                100%
              </span>
              <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1 block">Strict refusal on unknown</span>
            </div>
          </div>

          {/* Official Governance Circulars Table */}
          <div className="border-2 border-[#E7D5C1] dark:border-[#493B55] rounded-2xl overflow-hidden bg-white dark:bg-[#211A2D] shadow-xl">
            <div className="bg-[#FAF5ED] dark:bg-[#191426] px-5 py-3.5 border-b border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between">
              <span className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] uppercase tracking-wider">
                Hierarchy of Official Regulatory Documents
              </span>
              <span className="text-[11px] font-mono text-[#685C6B] dark:text-[#C5B9CD]">
                Latest Railway Board Circulars Take Precedence
              </span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F3EBDD] dark:bg-[#191426] border-b border-[#E7D5C1] dark:border-[#493B55] text-[#D99A43] dark:text-[#F5B65C] font-bold uppercase">
                  <tr>
                    <th className="py-3 px-4">Circular Code</th>
                    <th className="py-3 px-4">Document Title</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Issuing Authority</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7D5C1] dark:divide-[#493B55] text-[#251B32] dark:text-[#FFF8F0]">
                  {officialCirculars.map((c, i) => (
                    <tr key={i} className="hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#E9793D] dark:text-[#F5B65C] whitespace-nowrap">
                        {c.code}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#251B32] dark:text-[#FFF8F0]">
                        {c.title}
                      </td>
                      <td className="py-3 px-4 text-[#685C6B] dark:text-[#C5B9CD] hidden sm:table-cell">
                        {c.authority}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#DCFCE7] dark:bg-emerald-950/60 text-[#13875C] dark:text-[#20C997] border border-[#86EFAC] dark:border-emerald-800/40 font-semibold">
                          {c.effective}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </Container>
      </section>

      {/* ======================================================== */}
      {/* FINAL MILESTONE: DESTINATION & EMERGENCY CARE             */}
      {/* ======================================================== */}
      <JourneyMilestone
        stationCode="DEST"
        stationName="Journey Destination"
        milestoneTitle="Station 06: Rail Madad & Safety Helpline"
        milestoneSubtitle="24x7 Official Emergency Response"
        statusText="DESTINATION REACHED"
        isLast={true}
      />

      {/* ======================================================== */}
      {/* 7. HERITAGE STATION EMERGENCY CALL BOX (139)             */}
      {/* ======================================================== */}
      <section className="py-10">
        <Container size="large">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 p-6 rounded-2xl bg-white dark:bg-[#211A2D] border-2 border-[#E9793D]/50 dark:border-[#F18445]/50 shadow-2xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#E9793D]/15 dark:bg-[#F18445]/20 border border-[#E9793D]/40 flex items-center justify-center text-[#E9793D] dark:text-[#F5B65C] shrink-0">
                <PhoneCall className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#251B32] dark:text-[#FFF8F0] flex items-center gap-2">
                  <span>Rail Madad (139) – 24x7 Dedicated Passenger Emergency Care</span>
                  <Badge variant="live" size="small">TOLL FREE</Badge>
                </h3>
                <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-1">
                  For active security concerns, onboard medical assistance, harassment alerts, or lost property while traveling.
                </p>
              </div>
            </div>

            <a
              href="tel:139"
              className="px-6 py-3 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] dark:bg-[#F18445] dark:hover:bg-[#E9793D] text-white text-xs sm:text-sm font-bold shadow-lg shadow-orange-950/50 transition-all whitespace-nowrap shrink-0 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Call 139 (Toll Free)
            </a>
          </div>
        </Container>
      </section>

    </div>
  );
}
