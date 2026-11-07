'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Clock, 
  Train, 
  MapPin, 
  Sparkles, 
  Compass, 
  Volume2, 
  VolumeX,
  Radio,
  Info
} from 'lucide-react';

interface StationHelpDeskEnvironmentProps {
  className?: string;
  stationName?: string;
}

export function StationHelpDeskEnvironment({
  className = '',
  stationName = 'NEW DELHI (NDLS)'
}: StationHelpDeskEnvironmentProps) {
  const [timeStr, setTimeStr] = useState<string>('14:40:00');
  const [tickerList, setTickerList] = useState<string[]>([
    '12951 NDLS-MMCT TEJAS RAJDHANI • PLATFORM 1 • ON TIME',
    '20901 VANDE BHARAT EXPRESS • PLATFORM 3 • ON TIME',
    '12618 MANGALA LAKSHADWEEP EXP • PLATFORM 2 • EXP 15:10',
    '12002 NEW DELHI-BHOPAL SHATABDI • PLATFORM 4 • BOARDING',
    '22436 VANDE BHARAT (BSB-NDLS) • PLATFORM 5 • ARRIVED',
    '12302 HOWRAH RAJDHANI EXPRESS • PLATFORM 1 • ON TIME'
  ]);

  // Real clock ticking for seconds/minutes
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      
      {/* 1. Base Station Enquiry Concourse Artwork */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/station-enquiry-hall.jpg"
          alt="Indian Railway Station Enquiry Hall"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        {/* Warm Ambient Grading Layer */}
        <div className="absolute inset-0 station-ambient-layer transition-colors duration-700" />
      </div>

      {/* 2. Atmospheric Golden Sunbeams from Arched Skylights */}
      <div className="absolute inset-0 pointer-events-none z-1 overflow-hidden">
        <div className="absolute -top-10 left-1/4 w-[480px] h-[750px] bg-gradient-to-b from-[#FFF5DC]/35 via-[#F6C176]/15 to-transparent blur-2xl animate-sunbeam transform -rotate-12" />
        <div className="absolute -top-16 left-1/2 w-[380px] h-[680px] bg-gradient-to-b from-[#FFF5DC]/25 via-[#E67E48]/10 to-transparent blur-xl animate-sunbeam transform -rotate-15 delay-1000" />
      </div>

      {/* 3. Platform 1 Track: Animated Passenger Train Gliding in Background */}
      <div className="absolute top-[28%] left-0 w-full h-24 pointer-events-none z-2 overflow-hidden opacity-90">
        <div className="w-[520px] h-full flex items-center animate-station-train">
          <svg viewBox="0 0 520 90" className="w-full h-full drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]">
            {/* Locomotive Nose (Vande Bharat / Aerodynamic Front) */}
            <path 
              d="M420,70 L480,70 Q515,68 518,48 Q515,28 470,26 L420,26 Z" 
              fill="#ECE7DF" 
              stroke="#2B2135" 
              strokeWidth="2"
            />
            {/* Front Pilot Cowcatcher */}
            <path d="M495,70 L518,74 L510,65 Z" fill="#D32F2F" />
            {/* Windshield */}
            <path d="M465,30 Q495,32 502,46 L465,46 Z" fill="#182A3A" />
            {/* Bright Glowing Headlight Beam */}
            <circle cx="512" cy="54" r="5" fill="#FFF3D6" />
            <polygon points="517,54 550,42 550,66" fill="rgba(255,243,214,0.4)" />

            {/* Locomotive Body in Cream & Royal Blue Indian Railways livery */}
            <rect x="260" y="26" width="160" height="44" fill="#F4EFE6" stroke="#2B2135" strokeWidth="2" />
            <rect x="260" y="44" width="160" height="12" fill="#1A4A75" />
            {/* Cab Windows */}
            <rect x="275" y="32" width="28" height="10" rx="2" fill="#20344A" />
            <rect x="315" y="32" width="45" height="10" rx="2" fill="#20344A" />
            <rect x="370" y="32" width="40" height="10" rx="2" fill="#20344A" />

            {/* Trailing Passenger Coach */}
            <rect x="40" y="26" width="215" height="44" fill="#ECE7DF" stroke="#2B2135" strokeWidth="2" />
            <rect x="40" y="44" width="215" height="12" fill="#1A4A75" />
            {/* Coach Windows with Warm Interior Golden Light */}
            {Array.from({ length: 6 }).map((_, i) => (
              <g key={i}>
                <rect x={55 + i * 32} y="32" width="22" height="10" rx="2" fill="#FFE8B5" stroke="#48382A" strokeWidth="1" />
                {/* Passenger silhouette inside carriage */}
                <circle cx={66 + i * 32} cy="37" r="3" fill="#583B25" opacity="0.8" />
              </g>
            ))}

            {/* Coach Gangway Connection */}
            <rect x="255" y="30" width="5" height="38" fill="#1E1925" />

            {/* Wheels & Bogies */}
            <circle cx="70" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
            <circle cx="105" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
            <circle cx="190" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
            <circle cx="225" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
            <circle cx="290" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
            <circle cx="325" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
            <circle cx="430" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
            <circle cx="465" cy="74" r="7" fill="#282230" stroke="#5E4E6D" strokeWidth="2" />
          </svg>
        </div>
      </div>

      {/* 4. Overhead Electronic Train Departure Display Board (LED) */}
      <div className="absolute top-4 left-6 sm:left-12 max-w-sm sm:max-w-md z-10 pointer-events-none">
        <div className="bg-[#121118]/95 border-2 border-[#5C4530] rounded-xl p-2 shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between px-2 pb-1 border-b border-[#36274D] text-[10px] font-mono">
            <span className="text-[#F6C176] font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E67E48] animate-pulse" />
              LIVE DEPARTURES • {stationName}
            </span>
            <span className="text-[#34D399] font-bold">{timeStr}</span>
          </div>

          {/* Scrolling Amber LED dot-matrix display ticker */}
          <div className="overflow-hidden whitespace-nowrap pt-1">
            <div className="inline-block animate-led-marquee font-mono text-[11px] font-bold text-[#F6C176] tracking-wider">
              {tickerList.concat(tickerList).map((item, idx) => (
                <span key={idx} className="mr-8">
                  &bull; {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Authentic Indian Railways Station Wall Clock */}
      <div className="absolute top-4 right-6 sm:right-12 z-10 pointer-events-none hidden sm:flex items-center gap-3">
        <div className="relative w-16 h-16 rounded-full bg-[#FFF8ED] border-4 border-[#5C3F24] shadow-2xl flex items-center justify-center p-1">
          {/* Clock Dial Rim & Markings */}
          <div className="relative w-full h-full rounded-full border border-[#9A784F]/40 flex items-center justify-center">
            {/* 12, 3, 6, 9 ticks */}
            <div className="absolute top-1 text-[8px] font-bold font-serif text-[#3A2818]">12</div>
            <div className="absolute right-1 text-[8px] font-bold font-serif text-[#3A2818]">3</div>
            <div className="absolute bottom-1 text-[8px] font-bold font-serif text-[#3A2818]">6</div>
            <div className="absolute left-1 text-[8px] font-bold font-serif text-[#3A2818]">9</div>
            
            {/* Center Pin */}
            <div className="w-1.5 h-1.5 rounded-full bg-[#D32F2F] z-20" />

            {/* Hour Hand */}
            <div 
              className="absolute w-0.5 h-4 bg-[#3A2818] origin-bottom -translate-y-2 z-10 rounded" 
              style={{ transform: 'rotate(65deg)' }}
            />
            {/* Minute Hand */}
            <div 
              className="absolute w-0.5 h-5 bg-[#3A2818] origin-bottom -translate-y-2.5 z-10 rounded" 
              style={{ transform: 'rotate(240deg)' }}
            />
            {/* Rotating Second Hand */}
            <div className="absolute w-0.5 h-6 bg-[#D32F2F] origin-bottom -translate-y-3 z-15 animate-clock-second" />
          </div>
        </div>
        <div className="bg-white/90 dark:bg-[#211A2D]/90 border border-[#E7D5C1] dark:border-[#493B55] px-2.5 py-1 rounded-lg backdrop-blur-sm shadow-md">
          <span className="text-[10px] font-mono text-[#685C6B] dark:text-[#C5B9CD] block">STATION TIME</span>
          <span className="text-xs font-mono font-bold text-[#E9793D] dark:text-[#F5B65C]">{timeStr}</span>
        </div>
      </div>

      {/* 6. Animated Passengers Walking Across Concourse */}
      <div className="absolute bottom-28 left-0 right-0 h-32 pointer-events-none z-3 overflow-hidden">
        
        {/* Passenger 1: Commuter with Rolling Suitcase (Left to Right) */}
        <div className="absolute bottom-4 left-0 animate-passenger-1 flex items-end">
          <svg viewBox="0 0 70 110" className="w-14 h-22 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
            {/* Wheeled Suitcase */}
            <g className="animate-luggage-bob">
              <rect x="2" y="55" width="22" height="36" rx="3" fill="#8D4320" stroke="#3A1C0E" strokeWidth="1.5" />
              <line x1="8" y1="55" x2="8" y2="91" stroke="#F6C176" strokeWidth="1" />
              <line x1="18" y1="55" x2="18" y2="91" stroke="#F6C176" strokeWidth="1" />
              <line x1="13" y1="55" x2="32" y2="44" stroke="#483628" strokeWidth="2" />
              <circle cx="6" cy="93" r="2.5" fill="#201825" />
              <circle cx="20" cy="93" r="2.5" fill="#201825" />
            </g>

            {/* Walking Passenger Figure */}
            <circle cx="45" cy="18" r="8" fill="#583B25" />
            <circle cx="46" cy="17" r="7.5" fill="#C9936A" />
            <path d="M37,28 L53,28 L57,65 L33,65 Z" fill="#2B5B49" stroke="#18362A" strokeWidth="1" />
            <line x1="38" y1="32" x2="32" y2="44" stroke="#C9936A" strokeWidth="3" strokeLinecap="round" />
            <line x1="52" y1="32" x2="56" y2="48" stroke="#C9936A" strokeWidth="3" strokeLinecap="round" />
            <path d="M38,65 L36,92 L41,94" stroke="#251D2A" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M50,65 L55,90 L60,92" stroke="#251D2A" strokeWidth="4" strokeLinecap="round" fill="none" />
          </svg>
        </div>

        {/* Passenger 2: Traveler with Shoulder Bag & Shawl (Right to Left) */}
        <div className="absolute bottom-2 left-0 animate-passenger-2 flex items-end">
          <svg viewBox="0 0 65 110" className="w-13 h-20 drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
            <circle cx="30" cy="18" r="8" fill="#3D291C" />
            <circle cx="29" cy="18" r="7" fill="#B88058" />
            <path d="M20,28 L38,28 L42,70 L18,70 Z" fill="#9C4426" stroke="#481F12" strokeWidth="1" />
            <line x1="22" y1="28" x2="36" y2="52" stroke="#F6C176" strokeWidth="1.5" />
            <rect x="33" y="48" width="16" height="18" rx="2" fill="#543C28" stroke="#2D1F14" strokeWidth="1" />
            <path d="M23,70 L21,92 L18,94" stroke="#ECE7DE" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M35,70 L38,89 L42,91" stroke="#ECE7DE" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>

      </div>

      {/* 7. Foreground Station Concourse Ground Tone & Ambient Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-44 station-ground-layer pointer-events-none z-4 transition-colors duration-700" />

    </div>
  );
}
