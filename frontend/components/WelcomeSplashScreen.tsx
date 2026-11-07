'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Compass, 
  Sun, 
  Moon, 
  ChevronRight,
  ShieldCheck,
  Train as TrainIcon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface WelcomeSplashScreenProps {
  onComplete?: () => void;
  standalone?: boolean;
}

export function WelcomeSplashScreen({ onComplete, standalone = true }: WelcomeSplashScreenProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuth();
  const isDark = theme === 'dark';

  const [step, setStep] = useState<number>(0);
  const [hasSkipped, setHasSkipped] = useState(false);

  // Progressive animation timeline
  useEffect(() => {
    if (hasSkipped) return;

    const t1 = setTimeout(() => setStep(1), 600);    // Landscape & tracks ready
    const t2 = setTimeout(() => setStep(2), 1600);   // Logo enters
    const t3 = setTimeout(() => setStep(3), 2600);   // Train emerges & moves across
    const t4 = setTimeout(() => setStep(4), 4200);   // "Every Journey Has a Story"
    const t5 = setTimeout(() => setStep(5), 5400);   // "Your journey starts here" & CTA

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [hasSkipped]);

  const handleGetStarted = () => {
    if (onComplete) {
      onComplete();
    } else {
      if (isAuthenticated) {
        router.push('/');
      } else {
        router.push('/login');
      }
    }
  };

  const handleSkip = () => {
    setHasSkipped(true);
    setStep(5);
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex flex-col justify-between select-none bg-[#FAF5ED] dark:bg-[#120F1D] text-[#302638] dark:text-[#F8EFE4] transition-colors duration-700">
      
      {/* ======================================================== */}
      {/* 1. SKY & CELESTIAL BACKGROUND                            */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Sky Gradient */}
        <div 
          className="absolute inset-0 transition-opacity duration-1000"
          style={{
            background: isDark
              ? 'linear-gradient(180deg, #0D0A15 0%, #171224 40%, #251B38 75%, #34224A 100%)'
              : 'linear-gradient(180deg, #F8E5D0 0%, #F5D3B3 35%, #E9A983 70%, #D88265 100%)',
          }}
        />

        {/* Twinkling Stars (Dark Mode Only) */}
        {isDark && (
          <div className="absolute inset-0 opacity-70">
            {[...Array(35)].map((_, i) => (
              <span
                key={i}
                className="absolute rounded-full bg-white animate-pulse"
                style={{
                  width: `${(i % 3) + 1.5}px`,
                  height: `${(i % 3) + 1.5}px`,
                  top: `${(i * 19) % 65}%`,
                  left: `${(i * 27) % 98}%`,
                  animationDuration: `${2 + (i % 4)}s`,
                  animationDelay: `${(i % 5) * 0.4}s`,
                  opacity: 0.3 + ((i % 5) * 0.15),
                }}
              />
            ))}
          </div>
        )}

        {/* Floating Clouds */}
        <div className="absolute inset-x-0 top-8 h-40 pointer-events-none opacity-40 dark:opacity-20 overflow-hidden">
          <motion.div
            initial={{ x: '-10%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 75, repeat: Infinity, ease: 'linear' }}
            className="absolute top-2 left-0 w-[420px] h-20 rounded-full blur-2xl bg-white/70 dark:bg-indigo-300/20"
          />
          <motion.div
            initial={{ x: '-20%' }}
            animate={{ x: '110%' }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear', delay: 12 }}
            className="absolute top-12 left-0 w-[540px] h-24 rounded-full blur-3xl bg-amber-100/60 dark:bg-purple-400/20"
          />
        </div>

        {/* Soaring Birds */}
        <div className="absolute top-20 right-1/4 pointer-events-none opacity-70 dark:opacity-40">
          <motion.svg
            width="38"
            height="18"
            viewBox="0 0 38 18"
            fill="none"
            initial={{ x: 120, y: 10, opacity: 0 }}
            animate={{ x: -300, y: -20, opacity: [0, 1, 1, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              d="M1 10 C 6 2, 14 2, 19 10 C 24 2, 32 2, 37 10"
              stroke={isDark ? '#D8CFBE' : '#5A3D31'}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </motion.svg>
        </div>

        {/* Sun / Moon Orb */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.8, ease: 'easeOut' }}
          className="absolute right-8 md:right-28 top-16 md:top-24 w-28 h-28 md:w-36 md:h-36 rounded-full cursor-pointer z-10"
          onClick={toggleTheme}
          title={`Click to switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? (
            /* Glowing Pearl Moon */
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#FFFDF9] via-[#F4E8D4] to-[#DDD0BE] shadow-[0_0_60px_rgba(244,232,212,0.45)] flex items-center justify-center">
              <div className="absolute w-6 h-6 rounded-full bg-[#D5C2A5]/25 top-6 left-7 blur-[1px]" />
              <div className="absolute w-8 h-8 rounded-full bg-[#D5C2A5]/20 bottom-7 right-8 blur-[1px]" />
              <div className="absolute inset-0 rounded-full ring-2 ring-amber-100/30" />
            </div>
          ) : (
            /* Radiant Golden Sun */
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-[#FFF5D6] via-[#FFD27D] to-[#E98245] shadow-[0_0_90px_rgba(233,130,69,0.55)] flex items-center justify-center">
              <div className="absolute -inset-4 rounded-full bg-[#E98245]/20 blur-xl animate-pulse" />
              <div className="absolute -inset-8 rounded-full bg-[#FFD27D]/15 blur-2xl" />
            </div>
          )}
        </motion.div>

        {/* Distant Mountain Silhouettes */}
        <svg
          className="absolute bottom-36 md:bottom-44 inset-x-0 w-full h-48 md:h-64 object-cover preserve-3d"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          {/* Back Mountain Range */}
          <path
            fill={isDark ? '#1C152B' : '#B57356'}
            fillOpacity={isDark ? '0.7' : '0.6'}
            d="M0,180 L120,130 L260,210 L410,110 L580,200 L740,90 L900,180 L1080,100 L1240,190 L1360,120 L1440,160 L1440,320 L0,320 Z"
          />
          {/* Mid Mountain Peaks */}
          <path
            fill={isDark ? '#251A3A' : '#8C4E3D'}
            fillOpacity={isDark ? '0.85' : '0.75'}
            d="M0,220 L160,160 L320,240 L480,150 L640,230 L820,140 L980,220 L1160,150 L1320,230 L1440,180 L1440,320 L0,320 Z"
          />
          {/* Pine Forest Ridge */}
          <path
            fill={isDark ? '#191126' : '#57332C'}
            d="M0,260 L80,235 L140,260 L220,230 L300,260 L380,225 L460,255 L540,230 L620,260 L700,225 L800,260 L880,220 L980,260 L1060,230 L1160,260 L1260,225 L1360,260 L1440,235 L1440,320 L0,320 Z"
          />
        </svg>

        {/* ======================================================== */}
        {/* 2. THE GRAND VIADUCT & ANIMATED PASSENGER TRAIN          */}
        {/* ======================================================== */}
        <div className="absolute bottom-16 md:bottom-20 inset-x-0 h-44 z-10">
          
          {/* Moving Passenger Train */}
          <motion.div
            initial={{ x: '-120%' }}
            animate={step >= 3 ? { x: '110vw' } : { x: '-120%' }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'linear',
              repeatDelay: 2,
            }}
            className="absolute -top-10 left-0 flex items-end z-20 pointer-events-none"
          >
            {/* Locomotive (Engine) */}
            <div className="relative flex items-end">
              {/* Exhaust Smoke / Steam puffs */}
              <div className="absolute -top-6 left-12 flex gap-1 pointer-events-none">
                <span className="w-3 h-3 rounded-full bg-white/40 blur-xs animate-ping" />
                <span className="w-4 h-4 rounded-full bg-white/30 blur-xs animate-pulse" />
              </div>

              {/* Engine Body */}
              <div className="w-32 h-14 rounded-r-2xl rounded-l-md bg-gradient-to-r from-[#C2561E] via-[#E67E48] to-[#F6C176] shadow-lg border-t-2 border-r-2 border-amber-200/50 flex flex-col justify-between p-1.5 relative">
                {/* Windshield & Headlight */}
                <div className="flex justify-between items-start">
                  <div className="w-8 h-4 bg-sky-200/80 rounded-sm border border-sky-400/40" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-200 shadow-[0_0_16px_#FFE58F] border border-white" />
                </div>
                {/* Engine Striping & Identifier */}
                <div className="flex items-center justify-between text-[8px] font-mono font-bold text-white/90">
                  <span>WAP-7</span>
                  <span className="bg-black/30 px-1 rounded">RAILASSIST</span>
                </div>
                {/* Wheel Assembly */}
                <div className="flex justify-around items-center pt-0.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-3.5 h-3.5 rounded-full bg-stone-900 border-2 border-stone-600 flex items-center justify-center">
                      <div className="w-1 h-1 bg-stone-400 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carriages (4 Coaches) */}
            {[1, 2, 3, 4].map((coachIdx) => (
              <div key={coachIdx} className="flex items-end -ml-1">
                {/* Gangway Coupler */}
                <div className="w-2.5 h-7 bg-stone-800" />

                {/* Passenger Carriage */}
                <div className="w-36 h-12 rounded-t-md bg-gradient-to-r from-[#214339] via-[#2A594C] to-[#1E3E34] border-t border-[#65B891]/40 shadow-md flex flex-col justify-between p-1 relative">
                  {/* Roof vents */}
                  <div className="w-full flex justify-around px-2">
                    <div className="w-4 h-0.5 bg-stone-700 rounded" />
                    <div className="w-4 h-0.5 bg-stone-700 rounded" />
                    <div className="w-4 h-0.5 bg-stone-700 rounded" />
                  </div>

                  {/* Illuminated Windows with Passenger Silhouettes */}
                  <div className="flex justify-between px-1.5 py-1 gap-1.5">
                    {[1, 2, 3, 4, 5].map((win) => (
                      <div
                        key={win}
                        className="flex-1 h-4 rounded-xs bg-amber-100/90 shadow-[0_0_8px_rgba(255,229,143,0.7)] border border-amber-300/50 flex items-center justify-center overflow-hidden"
                      >
                        {/* Passenger Silhouette */}
                        {win % 2 === 0 && (
                          <div className="w-1.5 h-2.5 rounded-full bg-stone-800/70" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Coach Class Tag */}
                  <div className="flex items-center justify-between text-[7px] font-mono text-emerald-200/80 px-1">
                    <span>IRCTC</span>
                    <span>3A-{coachIdx}</span>
                  </div>

                  {/* Carriage Wheels */}
                  <div className="flex justify-around items-center">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-3.5 h-3.5 rounded-full bg-stone-900 border-2 border-stone-600 flex items-center justify-center">
                        <div className="w-1 h-1 bg-stone-400 rounded-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Railway Bridge Viaduct Arches */}
          <div className="absolute inset-x-0 bottom-0 h-28 bg-[#3E2D27] dark:bg-[#1A1424] border-t-4 border-[#785E4A] dark:border-[#3A2D23] flex justify-around items-end shadow-2xl">
            {/* Rails & Sleepers Track Top */}
            <div className="absolute -top-3 inset-x-0 h-3 flex flex-col justify-between">
              <div className="w-full h-1 bg-[#A39687] shadow-sm" />
              <div className="w-full flex justify-between px-1">
                {[...Array(60)].map((_, i) => (
                  <div key={i} className="w-1 h-1.5 bg-[#4A382A] dark:bg-[#2A1D20]" />
                ))}
              </div>
              <div className="w-full h-1 bg-[#A39687] shadow-sm" />
            </div>

            {/* Classical Stone Arches */}
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="w-20 md:w-28 h-20 rounded-t-full bg-[#2A1F1B] dark:bg-[#120D1A] border-t-2 border-x-2 border-[#544038] dark:border-[#271C33] shadow-inner"
              />
            ))}
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. TOP BAR: LOGO & SKIP/THEME CONTROLS                   */}
      {/* ======================================================== */}
      <header className="relative z-30 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex items-center justify-between">
        
        {/* RailAssist Brand Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-3 bg-white/80 dark:bg-[#1C1427]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#E5D5C4] dark:border-[#493B50] shadow-sm"
        >
          <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[#E67E48]">
            <Image
              src="/railassist-logo.png"
              alt="RailAssist AI"
              width={28}
              height={28}
              className="object-cover"
              priority
            />
          </div>
          <span className="text-xs font-bold tracking-tight text-[#302638] dark:text-[#F8EFE4]">
            RailAssist AI
          </span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 font-bold border border-emerald-300 dark:border-emerald-700/50">
            OFFICIAL HELP DESK
          </span>
        </motion.div>

        {/* Quick Actions (Skip & Theme Toggle) */}
        <div className="flex items-center gap-2">
          {/* Sun/Moon Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/80 dark:bg-[#1C1427]/80 backdrop-blur-md border border-[#E5D5C4] dark:border-[#493B50] text-[#302638] dark:text-[#F8EFE4] hover:border-[#E98245] transition-all cursor-pointer shadow-sm"
            aria-label="Toggle theme"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-700" />}
          </button>

          {/* Skip Intro Button */}
          {step < 5 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={handleSkip}
              className="px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#1C1427]/80 backdrop-blur-md border border-[#E5D5C4] dark:border-[#493B50] text-xs font-bold text-[#655967] dark:text-[#C0B2C3] hover:text-[#302638] dark:hover:text-white hover:border-[#E98245] transition-all cursor-pointer shadow-sm"
            >
              Skip Intro &rarr;
            </motion.button>
          )}
        </div>
      </header>

      {/* ======================================================== */}
      {/* 4. CINEMATIC HERO & INTRO SEQUENCE                       */}
      {/* ======================================================== */}
      <main className="relative z-30 flex-1 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-10">
        
        {/* Step 2+: Large Center Logo Entry */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 14 }}
              className="relative mb-6"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 bg-gradient-to-tr from-[#E98245] via-[#F4BC72] to-[#234E41] shadow-[0_0_50px_rgba(233,130,69,0.45)]">
                <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-[#1A1226] border-2 border-white/80 dark:border-[#493B50]">
                  <Image
                    src="/railassist-logo.png"
                    alt="RailAssist AI Emblem"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-2 inset-x-0 flex justify-center"
              >
                <span className="px-3 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-[#FAF5ED] dark:bg-[#171322] border border-[#E5D5C4] dark:border-[#493B50] text-[#E98245] dark:text-[#F6C176] shadow-sm">
                  100% GROUNDED PASSENGER ASSISTANT
                </span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4+: "EVERY JOURNEY HAS A STORY" */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="space-y-3 mb-6"
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
                <span className="block text-[#302638] dark:text-[#F8EFE4]">
                  Every Journey
                </span>
                <span className="block bg-gradient-to-r from-[#E98245] via-[#D96528] to-[#C2561E] dark:from-[#F6C176] dark:via-[#E98245] dark:to-[#F08A4B] bg-clip-text text-transparent drop-shadow-sm">
                  Has a Story.
                </span>
              </h1>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 5+: "Your journey starts here" & Call-to-Action */}
        <AnimatePresence>
          {step >= 5 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="flex flex-col items-center gap-6 max-w-lg mx-auto"
            >
              <p className="text-sm sm:text-base text-[#655967] dark:text-[#C0B2C3] font-medium leading-relaxed">
                Step aboard India&apos;s intelligent passenger intelligence system. Discover verified train timetables, grounded refund policies, station directories, and personalized assistance.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                <button
                  onClick={handleGetStarted}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#E98245] to-[#D96528] hover:from-[#D96528] hover:to-[#C2561E] text-white font-bold text-sm shadow-xl shadow-orange-950/20 hover:shadow-orange-950/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
                >
                  <span>{isAuthenticated ? `Continue Journey (${user?.full_name?.split(' ')[0]})` : 'Get Started'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {!isAuthenticated && (
                  <Link
                    href="/register"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/90 dark:bg-[#21182D]/90 backdrop-blur-md border border-[#E5D5C4] dark:border-[#493B50] text-[#302638] dark:text-[#F8EFE4] hover:border-[#E98245] font-bold text-sm shadow-sm hover:bg-[#FAF5ED] dark:hover:bg-[#2C213B] transition-all cursor-pointer"
                  >
                    <span>Create Account</span>
                  </Link>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#655967] dark:text-[#A39687]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  Official Ministry Datasets
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <TrainIcon className="w-3.5 h-3.5 text-[#E98245]" />
                  Verified PNR & Timetables
                </span>
                <span>&bull;</span>
                <span>Rail Madad 139 Ready</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ======================================================== */}
      {/* 5. FOOTER TELEMETRY STRIP                                */}
      {/* ======================================================== */}
      <footer className="relative z-30 w-full py-4 px-6 border-t border-[#E5D5C4]/60 dark:border-[#3A2D4A]/60 bg-white/40 dark:bg-[#171322]/40 backdrop-blur-xs flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-[#655967] dark:text-[#A39687] gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PASSENGER FLEET TELEMETRY: ACTIVE</span>
        </div>
        <div className="flex items-center gap-3">
          <span>STATION 01: NEW DELHI (NDLS)</span>
          <span>&bull;</span>
          <span>SPEED: 160 KM/H</span>
        </div>
      </footer>

    </div>
  );
}

export default WelcomeSplashScreen;

