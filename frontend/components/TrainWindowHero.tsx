'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Compass, 
  MessageSquare, 
  ShieldCheck, 
  Radio, 
  Zap,
  Gauge,
  Sparkles,
  ArrowRight,
  ChevronDown
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface TrainWindowHeroProps {
  onSearchClick?: () => void;
  onAssistantClick?: () => void;
}

export function TrainWindowHero({ onSearchClick, onAssistantClick }: TrainWindowHeroProps) {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const isDark = mounted ? theme === 'dark' : false;

  const handleFindTrain = () => {
    const el = document.getElementById('journey-search');
    if (el) {
      const navbarHeight = 75;
      const pos = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: Math.max(0, pos), behavior: 'smooth' });
    } else {
      router.push('/trains');
    }
  };

  const handleAskAi = () => {
    const el = document.getElementById('ai-assistant');
    if (el) {
      const navbarHeight = 75;
      const pos = el.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
      window.scrollTo({ top: Math.max(0, pos), behavior: 'smooth' });
      window.history.pushState(null, '', '#ai-assistant');
    } else {
      router.push('/#ai-assistant');
    }
  };

  return (
    <div 
      className={`relative w-full min-h-[96vh] lg:min-h-screen flex flex-col justify-between overflow-hidden select-none transition-colors duration-1000 ${
        isDark ? 'bg-[#100D19]' : 'bg-[#FAF5ED]'
      }`}
    >
      
      {/* ======================================================== */}
      {/* 1. MULTI-LAYERED ILLUSTRATED RAILWAY LANDSCAPE WORLD     */}
      {/* ======================================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        
        {/* Layer 1A: Golden Sunset & Daylight Mountain Sky (Light Theme) */}
        <div 
          className={`absolute inset-0 bg-gradient-to-b from-[#FCEAD2] via-[#F8CDAE] via-35% to-[#F1AA8C] to-75% transition-opacity duration-1000 ease-in-out ${
            isDark ? 'opacity-0' : 'opacity-100'
          }`}
        >
          {/* Sunset Horizon Amber Glow */}
          <div className="absolute bottom-24 left-0 right-0 h-64 bg-gradient-to-t from-[#E98245]/35 via-[#F6C176]/25 to-transparent blur-3xl pointer-events-none" />
        </div>

        {/* Layer 1B: Deep Midnight Starry Sky (Dark Theme) */}
        <div 
          className={`absolute inset-0 bg-gradient-to-b from-[#06040C] via-[#0E081D] via-40% to-[#1B0D33] to-75% transition-opacity duration-1000 ease-in-out ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Midnight Horizon Moonlit Indigo Glow */}
          <div className="absolute bottom-24 left-0 right-0 h-64 bg-gradient-to-t from-[#2F1E54]/45 via-[#4E397A]/25 to-transparent blur-3xl pointer-events-none" />
        </div>

        {/* Layer 1.5: Starfield in Dark Mode (Twinkling Night Stars & Constellations) */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out ${
            isDark ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {[
            { top: '8%', left: '12%', size: '2px', anim: 'animate-twinkle' },
            { top: '15%', left: '22%', size: '2.5px', anim: 'animate-twinkle-delayed' },
            { top: '6%', left: '38%', size: '1.5px', anim: 'animate-twinkle' },
            { top: '18%', left: '48%', size: '3px', anim: 'animate-twinkle-delayed' },
            { top: '10%', left: '60%', size: '2px', anim: 'animate-twinkle' },
            { top: '14%', left: '72%', size: '2.5px', anim: 'animate-twinkle-delayed' },
            { top: '7%', left: '84%', size: '3px', anim: 'animate-twinkle' },
            { top: '22%', left: '88%', size: '2px', anim: 'animate-twinkle-delayed' },
            { top: '25%', left: '16%', size: '2px', anim: 'animate-twinkle' },
            { top: '30%', left: '32%', size: '2px', anim: 'animate-twinkle-delayed' },
            { top: '28%', left: '78%', size: '2.5px', anim: 'animate-twinkle' },
            { top: '4%', left: '50%', size: '2px', anim: 'animate-twinkle-delayed' },
            { top: '19%', left: '6%', size: '2.5px', anim: 'animate-twinkle' },
            { top: '34%', left: '62%', size: '1.5px', anim: 'animate-twinkle-delayed' },
            { top: '12%', left: '94%', size: '2px', anim: 'animate-twinkle' },
          ].map((star, i) => (
            <div
              key={i}
              className={`absolute rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.95)] ${star.anim}`}
              style={{
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
              }}
            />
          ))}

          {/* Four-Point Sparkling Constellations */}
          <svg viewBox="0 0 24 24" className="absolute top-12 left-[18%] w-4 h-4 text-white/80 animate-twinkle fill-current">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" />
          </svg>
          <svg viewBox="0 0 24 24" className="absolute top-24 left-[56%] w-3 h-3 text-blue-200/80 animate-twinkle-delayed fill-current">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" />
          </svg>
          <svg viewBox="0 0 24 24" className="absolute top-10 right-[14%] w-3.5 h-3.5 text-amber-100/75 animate-twinkle fill-current">
            <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10Z" />
          </svg>
        </div>

        {/* Layer 3: Soaring Birds Across the Sunset Sky */}
        <div 
          className={`absolute top-20 left-0 w-full h-24 pointer-events-none z-10 transition-opacity duration-1000 ${
            isDark ? 'opacity-20' : 'opacity-70'
          }`}
        >
          <div className="animate-birds-soar flex items-center gap-6">
            <svg viewBox="0 0 24 12" className={`w-6 h-3 ${isDark ? 'fill-[#FFF8F0]' : 'fill-[#3A223E]'}`}>
              <path d="M0,6 Q6,0 12,6 Q18,0 24,6 Q18,4 12,9 Q6,4 0,6 Z" />
            </svg>
            <svg viewBox="0 0 24 12" className={`w-5 h-2.5 transform translate-y-3 ${isDark ? 'fill-[#FFF8F0]' : 'fill-[#3A223E]'}`}>
              <path d="M0,6 Q6,0 12,6 Q18,0 24,6 Q18,4 12,9 Q6,4 0,6 Z" />
            </svg>
            <svg viewBox="0 0 24 12" className={`w-4 h-2 transform -translate-y-2 ${isDark ? 'fill-[#FFF8F0]' : 'fill-[#3A223E]'}`}>
              <path d="M0,6 Q6,0 12,6 Q18,0 24,6 Q18,4 12,9 Q6,4 0,6 Z" />
            </svg>
          </div>
        </div>

        {/* Layer 4: Drifting Sunset / Night Clouds */}
        <div 
          className={`absolute top-8 left-0 w-[200%] h-44 flex animate-cloud-drift-slow transition-opacity duration-1000 ${
            isDark ? 'opacity-25' : 'opacity-55'
          }`}
        >
          <svg viewBox="0 0 1600 120" className={`w-1/2 h-full shrink-0 ${isDark ? 'fill-[#FFE1B5]/20' : 'fill-white/60'}`} preserveAspectRatio="none">
            <path d="M0,75 Q200,25 400,60 T800,50 T1200,70 T1600,55 L1600,120 L0,120 Z" />
            <path d="M140,45 Q340,15 540,45 T940,30 T1340,50 T1600,40 L1600,120 L140,120 Z" opacity="0.6" fill={isDark ? "#483A64" : "#FDE3CE"} />
          </svg>
          <svg viewBox="0 0 1600 120" className={`w-1/2 h-full shrink-0 ${isDark ? 'fill-[#FFE1B5]/20' : 'fill-white/60'}`} preserveAspectRatio="none">
            <path d="M0,75 Q200,25 400,60 T800,50 T1200,70 T1600,55 L1600,120 L0,120 Z" />
            <path d="M140,45 Q340,15 540,45 T940,30 T1340,50 T1600,40 L1600,120 L140,120 Z" opacity="0.6" fill={isDark ? "#483A64" : "#FDE3CE"} />
          </svg>
        </div>

        {/* Layer 5: Distant Mountain Silhouettes */}
        <div className="absolute bottom-32 left-0 w-[200%] h-72 flex animate-landscape-parallax opacity-85">
          <svg viewBox="0 0 1440 240" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
            {/* Distant Ridge */}
            <path 
              d="M0,185 L110,125 L210,165 L340,90 L480,150 L620,75 L760,140 L900,65 L1040,130 L1180,80 L1320,145 L1440,105 L1440,240 L0,240 Z" 
              fill={isDark ? "#120B1D" : "#C2ABC4"} 
            />
            {/* Mid Ridge */}
            <path 
              d="M60,195 L180,140 L300,180 L430,110 L560,160 L700,100 L840,155 L970,90 L1100,145 L1240,105 L1380,165 L1440,150 L1440,240 L0,240 Z" 
              fill={isDark ? "#1B1028" : "#98789C"} 
              opacity={isDark ? "0.85" : "0.95"} 
            />
            {/* Ridge Crest Highlight */}
            <path 
              d="M0,185 L110,125 L210,165 L340,90 L480,150 L620,75 L760,140 L900,65 L1040,130 L1180,80 L1320,145 L1440,105" 
              stroke={isDark ? "#68558A" : "#FFDEC6"} 
              strokeWidth="1.2" 
              fill="none" 
              opacity="0.6"
            />
          </svg>
          <svg viewBox="0 0 1440 240" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
            <path 
              d="M0,185 L110,125 L210,165 L340,90 L480,150 L620,75 L760,140 L900,65 L1040,130 L1180,80 L1320,145 L1440,105 L1440,240 L0,240 Z" 
              fill={isDark ? "#120B1D" : "#C2ABC4"} 
            />
            <path 
              d="M60,195 L180,140 L300,180 L430,110 L560,160 L700,100 L840,155 L970,90 L1100,145 L1240,105 L1380,165 L1440,150 L1440,240 L0,240 Z" 
              fill={isDark ? "#1B1028" : "#98789C"} 
              opacity={isDark ? "0.85" : "0.95"} 
            />
            <path 
              d="M0,185 L110,125 L210,165 L340,90 L480,150 L620,75 L760,140 L900,65 L1040,130 L1180,80 L1320,145 L1440,105" 
              stroke={isDark ? "#68558A" : "#FFDEC6"} 
              strokeWidth="1.2" 
              fill="none" 
              opacity="0.6"
            />
          </svg>
        </div>

        {/* Layer 6: Midground Pine Valley & Slopes with Gentle Tree Sway */}
        <div className="absolute bottom-20 left-0 right-0 h-52 pointer-events-none">
          <svg viewBox="0 0 1440 200" className="w-full h-full" preserveAspectRatio="none">
            {/* Deep Valley Curves in Forest Green */}
            <path 
              d="M0,130 Q240,75 480,120 T960,90 T1360,125 T1440,105 L1440,200 L0,200 Z" 
              fill={isDark ? "#0F1E19" : "#3A6B52"} 
            />
            <path 
              d="M0,150 Q200,110 400,140 T800,115 T1200,145 T1440,130 L1440,200 L0,200 Z" 
              fill={isDark ? "#0A1612" : "#294E3B"} 
            />
            {/* Shimmering Mountain River Through Valley */}
            <path 
              d="M320,170 Q480,150 640,180 T960,160 T1200,190" 
              stroke={isDark ? "#7BDFF2" : "#2A9D8F"} 
              strokeWidth="4" 
              fill="none" 
              className="animate-river-shimmer" 
            />
          </svg>
        </div>

        {/* Layer 7: THE MAJESTIC STONE ARCH VIADUCT RAILWAY BRIDGE */}
        <div className="absolute bottom-20 left-0 right-0 h-36 pointer-events-none z-10">
          <svg viewBox="0 0 1440 130" className="w-full h-full" preserveAspectRatio="none">
            {/* Viaduct Top Parapet */}
            <rect 
              x="0" 
              y="36" 
              width="1440" 
              height="9" 
              fill={isDark ? "#281D33" : "#D4C0AA"} 
              stroke={isDark ? "#1A1122" : "#9E866F"} 
              strokeWidth="1" 
            />
            <rect 
              x="0" 
              y="32" 
              width="1440" 
              height="4" 
              fill={isDark ? "#3F2D4F" : "#E4D5C3"} 
            />
            <line 
              x1="0" 
              y1="32" 
              x2="1440" 
              y2="32" 
              stroke={isDark ? "#6D5584" : "#8A7159"} 
              strokeWidth="1.2" 
            />

            {/* High Stone Arches Across the Gorge */}
            {Array.from({ length: 9 }).map((_, idx) => {
              const xPos = idx * 160 + 35;
              return (
                <g key={idx}>
                  <rect 
                    x={xPos + 42} 
                    y="45" 
                    width="24" 
                    height="85" 
                    fill={isDark ? "#1C1425" : "#C4AE96"} 
                  />
                  <rect 
                    x={xPos + 39} 
                    y="45" 
                    width="30" 
                    height="6" 
                    fill={isDark ? "#3A2B4B" : "#D9C6B2"} 
                  />
                  {/* Classical Masonry Arch Curve */}
                  <path 
                    d={`M${xPos},45 Q${xPos + 54},82 ${xPos + 108},45 L${xPos + 108},130 L${xPos},130 Z`} 
                    fill={isDark ? "#0E0915" : "#7D5F46"} 
                  />
                  <path 
                    d={`M${xPos},45 Q${xPos + 54},82 ${xPos + 108},45`} 
                    stroke={isDark ? "#48345C" : "#AA9075"} 
                    strokeWidth="2.5" 
                    fill="none" 
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Layer 8: ANIMATED PASSENGER TRAIN TRAVELLING ACROSS THE VIADUCT */}
        <div className="absolute bottom-27 left-0 w-full h-18 pointer-events-none z-15 overflow-hidden">
          <div className="w-[380px] h-full flex items-end animate-train-travel-world">
            <svg viewBox="0 0 340 64" className="w-full h-full drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
              
              {/* Billowing Steam Drift */}
              <circle cx="295" cy="18" r="8" fill={isDark ? "#C6D8EB" : "#FFFFFF"} className="animate-steam-1" />
              <circle cx="286" cy="13" r="10" fill={isDark ? "#B0C6DE" : "#FFFFFF"} className="animate-steam-2" />
              <circle cx="275" cy="9" r="12" fill="#FFFFFF" className="animate-steam-3" />

              {/* Locomotive Engine Body */}
              <rect 
                x="260" 
                y="24" 
                width="50" 
                height="26" 
                rx="4" 
                fill={isDark ? "#1C1427" : "#2C2034"} 
                stroke={isDark ? "#4D3764" : "#5A436D"} 
                strokeWidth="1" 
              />
              <rect 
                x="244" 
                y="16" 
                width="24" 
                height="34" 
                rx="2" 
                fill={isDark ? "#261C34" : "#3B253D"} 
                stroke={isDark ? "#4D3764" : "#5A436D"} 
                strokeWidth="1" 
              />
              {/* Cab Golden Interior Glow */}
              <rect x="248" y="20" width="8" height="10" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              {/* Smokestack & Cowcatcher */}
              <rect x="292" y="14" width="7" height="11" fill={isDark ? "#140E1C" : "#1E1624"} rx="1" />
              <polygon points="310,48 322,50 310,50" fill="#E67E48" />
              
              {/* Glowing Headlight Beam */}
              <circle cx="310" cy="36" r={isDark ? 5 : 4.5} fill="#FFFFFF" className={isDark ? "animate-pulse" : ""} />
              <polygon 
                points={isDark ? "312,36 365,16 365,56" : "312,36 350,20 350,52"} 
                fill={isDark ? "url(#headlightNightBeam)" : "url(#headlightSunBeam)"} 
                opacity={isDark ? 0.95 : 0.85} 
              />
              
              {/* Passenger Carriage 1 */}
              <rect 
                x="165" 
                y="22" 
                width="72" 
                height="28" 
                rx="2" 
                fill={isDark ? "#2C1F3D" : "#3B253D"} 
                stroke={isDark ? "#4D3764" : "#5A436D"} 
                strokeWidth="1" 
              />
              <rect x="171" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="185" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="199" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="213" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="227" y="28" width="8" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />

              {/* Passenger Carriage 2 */}
              <rect 
                x="85" 
                y="22" 
                width="72" 
                height="28" 
                rx="2" 
                fill={isDark ? "#2C1F3D" : "#3B253D"} 
                stroke={isDark ? "#4D3764" : "#5A436D"} 
                strokeWidth="1" 
              />
              <rect x="91" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="105" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="119" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="133" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="147" y="28" width="8" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />

              {/* Passenger Carriage 3 */}
              <rect 
                x="5" 
                y="22" 
                width="72" 
                height="28" 
                rx="2" 
                fill={isDark ? "#2C1F3D" : "#3B253D"} 
                stroke={isDark ? "#4D3764" : "#5A436D"} 
                strokeWidth="1" 
              />
              <rect x="11" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="25" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="39" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="53" y="28" width="10" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />
              <rect x="67" y="28" width="8" height="8" rx="1" fill={isDark ? "#FFD54F" : "#FFE59E"} />

              {/* Couplers */}
              <rect x="77" y="38" width="8" height="3" fill="#140E1D" />
              <rect x="157" y="38" width="8" height="3" fill="#140E1D" />
              <rect x="237" y="38" width="7" height="3" fill="#140E1D" />

              {/* Animated Rotating Wheel Sets */}
              {Array.from({ length: 12 }).map((_, i) => (
                <g key={i} className="animate-wheel-rotate">
                  <circle cx={i * 26 + 20} cy="52" r="4" fill="#0E0A14" stroke="#684D87" strokeWidth="1.2" />
                  <line x1={i * 26 + 18} y1="52" x2={i * 26 + 22} y2="52" stroke={isDark ? "#D8CFBE" : "#F6C176"} strokeWidth="0.8" />
                </g>
              ))}

              <defs>
                <linearGradient id="headlightSunBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFF2B8" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#FFF2B8" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="headlightNightBeam" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="35%" stopColor="#FFF3B0" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#F6C176" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Layer 9: Foreground Pine Forests Framing Both Sides */}
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 h-72 pointer-events-none z-20 animate-tree-sway opacity-95">
          <svg viewBox="0 0 200 240" className={`w-full h-full ${isDark ? 'fill-[#0E1A16]' : 'fill-[#1B362A]'}`}>
            {/* Primary Tall Pine Tree */}
            <polygon points="50,240 50,30 55,240" fill={isDark ? "#241913" : "#3E281C"} />
            <polygon points="50,30 20,80 80,80" />
            <polygon points="50,65 15,120 85,120" />
            <polygon points="50,105 10,170 90,170" />
            <polygon points="50,150 5,225 95,225" />
            {/* Second Pine */}
            <polygon points="125,240 125,85 130,240" fill={isDark ? "#241913" : "#3E281C"} />
            <polygon points="125,85 100,130 150,130" />
            <polygon points="125,120 95,170 155,170" />
            <polygon points="125,160 90,220 160,220" />
          </svg>
        </div>

        <div className="absolute bottom-0 right-0 w-48 sm:w-64 h-72 pointer-events-none z-20 animate-tree-sway opacity-95">
          <svg viewBox="0 0 200 240" className={`w-full h-full ${isDark ? 'fill-[#0E1A16]' : 'fill-[#1B362A]'}`}>
            <polygon points="150,240 150,40 155,240" fill={isDark ? "#241913" : "#3E281C"} />
            <polygon points="150,40 120,90 180,90" />
            <polygon points="150,75 115,130 185,130" />
            <polygon points="150,115 110,180 190,180" />
            <polygon points="80,240 85,95 90,240" fill={isDark ? "#241913" : "#3E281C"} />
            <polygon points="85,95 65,140 105,140" />
            <polygon points="85,130 60,180 110,180" />
          </svg>
        </div>

        {/* Layer 10: Twin Railway Mainline Tracks in Foreground */}
        <div className="absolute bottom-0 left-0 w-[200%] h-14 flex animate-landscape-parallax z-20">
          <svg viewBox="0 0 1200 60" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
            <rect x="0" y="24" width="1200" height="36" fill={isDark ? "#140E1B" : "#D2BEAD"} />
            <line x1="0" y1="24" x2="1200" y2="24" stroke={isDark ? "#2B1E38" : "#9E8575"} strokeWidth="2" />
            {Array.from({ length: 48 }).map((_, idx) => (
              <rect 
                key={idx} 
                x={idx * 25 + 2} 
                y={28} 
                width="12" 
                height="30" 
                rx="1" 
                fill={isDark ? "#2B1E38" : "#4E392B"} 
                stroke={isDark ? "#160F20" : "#36251A"} 
                strokeWidth="1" 
              />
            ))}
            <line x1="0" y1="36" x2="1200" y2="36" stroke={isDark ? "#8E7866" : "#7A6453"} strokeWidth="2.5" />
            <line x1="0" y1="37" x2="1200" y2="37" stroke={isDark ? "#FFFFFF" : "#FFF8EE"} strokeWidth="1" opacity={isDark ? 0.95 : 0.9} />
            <line x1="0" y1="48" x2="1200" y2="48" stroke={isDark ? "#8E7866" : "#7A6453"} strokeWidth="2.5" />
            <line x1="0" y1="49" x2="1200" y2="49" stroke={isDark ? "#FFFFFF" : "#FFF8EE"} strokeWidth="1" opacity={isDark ? 0.95 : 0.9} />
          </svg>
          <svg viewBox="0 0 1200 60" className="w-1/2 h-full shrink-0" preserveAspectRatio="none">
            <rect x="0" y="24" width="1200" height="36" fill={isDark ? "#140E1B" : "#D2BEAD"} />
            <line x1="0" y1="24" x2="1200" y2="24" stroke={isDark ? "#2B1E38" : "#9E8575"} strokeWidth="2" />
            {Array.from({ length: 48 }).map((_, idx) => (
              <rect 
                key={idx} 
                x={idx * 25 + 2} 
                y={28} 
                width="12" 
                height="30" 
                rx="1" 
                fill={isDark ? "#2B1E38" : "#4E392B"} 
                stroke={isDark ? "#160F20" : "#36251A"} 
                strokeWidth="1" 
              />
            ))}
            <line x1="0" y1="36" x2="1200" y2="36" stroke={isDark ? "#8E7866" : "#7A6453"} strokeWidth="2.5" />
            <line x1="0" y1="37" x2="1200" y2="37" stroke={isDark ? "#FFFFFF" : "#FFF8EE"} strokeWidth="1" opacity={isDark ? 0.95 : 0.9} />
            <line x1="0" y1="48" x2="1200" y2="48" stroke={isDark ? "#8E7866" : "#7A6453"} strokeWidth="2.5" />
            <line x1="0" y1="49" x2="1200" y2="49" stroke={isDark ? "#FFFFFF" : "#FFF8EE"} strokeWidth="1" opacity={isDark ? 0.95 : 0.9} />
          </svg>
        </div>

        {/* Ambient Vignette & Lighting Filter */}
        <div 
          className={`absolute inset-0 transition-colors duration-1000 z-20 pointer-events-none ${
            isDark 
              ? 'bg-gradient-to-t from-[#0E0B18]/90 via-transparent to-[#0E0B18]/50' 
              : 'bg-gradient-to-t from-[#FAF5ED]/30 via-transparent to-transparent'
          }`} 
        />
      </div>

      {/* ======================================================== */}
      {/* 2. INTERACTIVE CELESTIAL TOGGLE (SUN <-> MOON)           */}
      {/* THE CELESTIAL BODY IN THE LANDSCAPE IS THE THEME TOGGLE  */}
      {/* ======================================================== */}
      <div className="absolute top-12 sm:top-16 right-1/4 sm:right-1/3 flex items-center justify-center z-30 pointer-events-auto">
        <button
          type="button"
          onClick={toggleTheme}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleTheme();
            }
          }}
          aria-label={isDark ? "Switch to Day Mode (Golden Sunset)" : "Switch to Night Mode (Moonlit Night)"}
          aria-pressed={isDark}
          title={isDark ? "Switch to Golden Sunset (Day Mode)" : "Switch to Moonlit Night (Night Mode)"}
          tabIndex={0}
          role="button"
          className="group relative cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#F6C176]/80 rounded-full transition-transform duration-700 ease-out hover:scale-105 active:scale-95"
        >
          {/* Floating Hover & Focus Tooltip */}
          <div 
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-3.5 py-1.5 rounded-full bg-[#1A1226]/95 border border-[#F6C176]/50 backdrop-blur-md text-[11px] font-semibold text-[#FFF8F0] shadow-2xl opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-all duration-300 pointer-events-none z-50 flex items-center gap-1.5"
            role="tooltip"
          >
            {isDark ? (
              <>
                <span className="text-amber-300 text-xs">☀️</span>
                <span>Day Mode &bull; Click for Golden Sunset</span>
              </>
            ) : (
              <>
                <span className="text-blue-200 text-xs">🌙</span>
                <span>Night Mode &bull; Click for Moonlit Night</span>
              </>
            )}
          </div>

          {/* Interactive Sun Sphere (Light Mode) */}
          <div 
            className={`w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-t from-[#F6C176] via-[#FFF3D6] to-[#FFFFFF] animate-sun-radiance shadow-[0_0_100px_rgba(246,193,118,0.95)] transition-all duration-1000 ease-in-out ${
              isDark ? 'opacity-0 scale-75 rotate-90 pointer-events-none' : 'opacity-95 scale-100 rotate-0'
            }`}
          >
            {/* Subtle Sun Corona Halo */}
            <div className="absolute inset-0 rounded-full bg-[#F6C176]/30 blur-md group-hover:blur-lg transition-all" />
          </div>

          {/* Interactive Moon Sphere (Dark Mode) */}
          <div 
            className={`absolute inset-0 w-32 h-32 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-[#C2D6E8] via-[#E8F2F8] to-[#FFFFFF] animate-moon-radiance shadow-[0_0_90px_rgba(210,230,255,0.9)] transition-all duration-1000 ease-in-out ${
              isDark ? 'opacity-95 scale-100 rotate-0' : 'opacity-0 scale-75 -rotate-90 pointer-events-none'
            }`}
          >
            {/* Lunar Maria & Realistic Crater Detailing */}
            <svg viewBox="0 0 100 100" className="w-full h-full rounded-full opacity-35">
              <circle cx="34" cy="32" r="8" fill="#8AA8C0" />
              <circle cx="30" cy="30" r="6" fill="#7596B0" />
              <circle cx="62" cy="54" r="11" fill="#8AA8C0" />
              <circle cx="64" cy="56" r="8" fill="#7596B0" />
              <circle cx="44" cy="68" r="6" fill="#8AA8C0" />
              <circle cx="70" cy="30" r="5" fill="#8AA8C0" />
              <circle cx="22" cy="58" r="4.5" fill="#8AA8C0" />
              <circle cx="50" cy="24" r="4" fill="#8AA8C0" />
              <circle cx="78" cy="46" r="3.5" fill="#8AA8C0" />
            </svg>
            {/* Soft Moon Halo */}
            <div className="absolute inset-0 rounded-full border border-white/40 blur-[1px]" />
          </div>
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. TOP CORRIDOR INDICATOR & TELEMETRY                    */}
      {/* ======================================================== */}
      <div className="relative z-30 pt-20 px-6 sm:px-12 flex items-center justify-between text-xs font-mono">
        <div 
          className={`flex items-center gap-2.5 backdrop-blur-md px-3.5 py-1.5 rounded-full border shadow-lg transition-colors ${
            isDark 
              ? 'bg-[#191226]/85 border-[#3E2D58] text-[#FFF8F0]' 
              : 'bg-white/90 border-[#E5D5C4] text-[#281634]'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider uppercase">
            HIMALAYAN &amp; MOUNTAIN CORRIDOR
          </span>
          <span className={`text-[10px] hidden sm:inline ${isDark ? 'text-[#A39687]' : 'text-[#655967]'}`}>
            &bull; {isDark ? 'MOONLIT MIDNIGHT EXPRESS' : 'GOLDEN SUNSET JOURNEY'}
          </span>
        </div>

        <div 
          className={`hidden md:flex items-center gap-4 backdrop-blur-md px-4 py-1.5 rounded-full border text-[11px] shadow-lg transition-colors ${
            isDark 
              ? 'bg-[#191226]/85 border-[#3E2D58] text-[#D8CFBE]' 
              : 'bg-white/90 border-[#E5D5C4] text-[#4A3B4E]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <Gauge className={`w-3.5 h-3.5 ${isDark ? 'text-[#F6C176]' : 'text-[#E98245]'}`} />
            <span>VIADUCT SPAN: 480M</span>
          </div>
          <div className={`flex items-center gap-1.5 ${isDark ? 'text-[#F6C176]' : 'text-[#D96528]'}`}>
            <Zap className="w-3.5 h-3.5" />
            <span>ELEV: 1,840M MSL</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <Radio className="w-3.5 h-3.5" />
            <span>SIGNAL: PROCEED</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. EDITORIAL HERO HEADLINE & ACTIONS                     */}
      {/* ======================================================== */}
      <div className="relative z-30 px-6 sm:px-12 md:px-16 py-10 sm:py-16 max-w-4xl flex flex-col justify-center">
        
        {/* Heritage Official Help Desk Badge */}
        <div 
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-md backdrop-blur-md text-xs font-bold tracking-wide uppercase mb-4 w-fit shadow-md transition-colors ${
            isDark 
              ? 'bg-[#E67E48]/20 border border-[#E67E48]/45 text-[#F6C176]' 
              : 'bg-white/90 border border-[#E98245]/50 text-[#C2561E]'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-[#F6C176]' : 'text-[#E98245]'}`} />
          <span>Official Passenger Help Desk &bull; 100% Grounded RAG</span>
        </div>

        {/* Editorial Headline: Highly Legible in Both Themes */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06]">
          <span className={isDark ? "text-[#FFF8F0] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]" : "text-[#281634]"}>
            Every Journey
          </span>
          <br className="hidden sm:inline" />
          <span 
            className={`text-transparent bg-clip-text ${
              isDark 
                ? "bg-gradient-to-r from-[#FFF8F0] via-[#F6C176] to-[#E67E48] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]" 
                : "bg-gradient-to-r from-[#C2561E] via-[#D96528] to-[#E98245]"
            }`}
          >
            {" "}Has a Story.
          </span>
        </h1>

        {/* Delicate Line Divider */}
        <div className="w-24 h-0.5 bg-gradient-to-r from-[#E98245] to-transparent my-5" />

        {/* Hero Description with 100% Opacity and Strong Contrast */}
        <p 
          className={`text-base sm:text-lg lg:text-xl max-w-2xl font-medium leading-relaxed ${
            isDark 
              ? 'text-[#E5DCCE] drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]' 
              : 'text-[#35233E]'
          }`}
        >
          Discover trains, explore railway information and get reliable passenger assistance, wherever the tracks take you.
        </p>

        {/* Action Buttons: Warm Terracotta & Forest Green */}
        <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={handleFindTrain}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#E98245] hover:bg-[#D76E30] text-white text-xs sm:text-sm font-bold shadow-xl shadow-orange-950/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Compass className="w-4 h-4 text-white" />
            <span>Find Your Train</span>
          </button>

          <button
            type="button"
            onClick={handleAskAi}
            className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 ${
              isDark 
                ? 'bg-[#234E41] hover:bg-[#1A3E34] border border-[#3A6B5C] shadow-emerald-950/50' 
                : 'bg-[#1E5244] hover:bg-[#153D32] border border-[#2B6F5D] shadow-emerald-950/20'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-[#F6C176]" />
            <span>Ask RailAssist AI</span>
          </button>
        </div>

        {/* Grounded Dataset Highlights Strip in Dedicated High-Contrast Pill */}
        <div 
          className={`mt-10 p-3 sm:px-5 sm:py-2.5 rounded-2xl backdrop-blur-md border shadow-lg flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-mono transition-colors w-fit ${
            isDark 
              ? 'bg-[#191426]/90 border-[#493B55] text-[#C5B9CD]' 
              : 'bg-white/90 border-[#E7D5C1] text-[#251B32]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#E9793D] dark:bg-[#F18445]" />
            <span className={`font-bold ${isDark ? 'text-[#FFF8F0]' : 'text-[#251B32]'}`}>5,208</span>
            <span className={isDark ? 'text-[#C5B9CD]' : 'text-[#685C6B]'}>Scheduled Trains</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D99A43] dark:bg-[#F5B65C]" />
            <span className={`font-bold ${isDark ? 'text-[#FFF8F0]' : 'text-[#251B32]'}`}>8,990</span>
            <span className={isDark ? 'text-[#C5B9CD]' : 'text-[#685C6B]'}>Stations Indexed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#13875C] dark:bg-[#20C997]" />
            <span className={`font-bold ${isDark ? 'text-[#FFF8F0]' : 'text-[#251B32]'}`}>2015–2026</span>
            <span className={isDark ? 'text-[#C5B9CD]' : 'text-[#685C6B]'}>Official Circulars</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className={`font-bold ${isDark ? 'text-[#FFF8F0]' : 'text-[#251B32]'}`}>139</span>
            <span className={isDark ? 'text-[#C5B9CD]' : 'text-[#685C6B]'}>Rail Madad 24x7</span>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 5. SCROLL PROMPT                                         */}
      {/* ======================================================== */}
      <div className="relative z-30 pb-6 flex flex-col items-center justify-center pointer-events-auto">
        <button
          type="button"
          onClick={handleFindTrain}
          className={`flex flex-col items-center gap-1.5 transition-colors group cursor-pointer ${
            isDark ? 'text-[#D8CFBE] hover:text-[#FFF8F0]' : 'text-[#655967] hover:text-[#281634]'
          }`}
          aria-label="Scroll down to begin your journey"
        >
          <span 
            className={`text-[11px] font-semibold tracking-wider uppercase transition-colors ${
              isDark ? 'text-[#A39687] group-hover:text-[#F6C176]' : 'text-[#655967] group-hover:text-[#C2561E]'
            }`}
          >
            Scroll to begin your journey
          </span>
          <div 
            className={`w-5 h-8 rounded-full border flex items-start justify-center p-1 transition-colors ${
              isDark 
                ? 'border-[#483662] group-hover:border-[#E67E48] bg-[#1A1226]/80' 
                : 'border-[#D8C7B0] group-hover:border-[#E98245] bg-white/90 shadow-sm'
            }`}
          >
            <div className="w-1.5 h-2 rounded-full bg-[#E98245] animate-bounce" />
          </div>
        </button>
      </div>

    </div>
  );
}
