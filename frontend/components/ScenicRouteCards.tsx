'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Mountain, 
  Waves, 
  Zap, 
  MapPin, 
  Compass, 
  ArrowRight, 
  Sparkles,
  Train,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface RouteItem {
  id: string;
  name: string;
  subtitle: string;
  type: string;
  distance: string;
  duration: string;
  fromStation: string;
  toStation: string;
  imageSrc: string;
  highlights: string[];
  description: string;
  visualTheme: {
    accentColor: string;
    icon: React.ElementType;
    badge: string;
  };
}

export function ScenicRouteCards() {
  const router = useRouter();

  const routes: RouteItem[] = [
    {
      id: 'konkan',
      name: 'The Konkan Railway Corridor',
      subtitle: 'Western Ghats Viaducts & Arabian Coastline',
      type: 'Mountain & Coastal Mainline',
      distance: '741 km',
      duration: '10h 45m',
      fromStation: 'CSMT',
      toStation: 'MAQ',
      imageSrc: '/sunset-viaduct.jpg',
      highlights: ['91 Mountain Tunnels', '179 Major River Viaducts', 'Dudhsagar Waterfalls'],
      description: 'An engineering masterpiece carved through the rugged Sahyadri ranges and coastal estuaries, offering panoramic views of misty peaks, emerald valleys, and historic stone viaducts.',
      visualTheme: {
        accentColor: '#E67E48',
        icon: Mountain,
        badge: 'ENGINEERING ICON',
      },
    },
    {
      id: 'kalka-shimla',
      name: 'Kalka–Shimla Himalayan Railway',
      subtitle: 'UNESCO World Heritage Mountain Line',
      type: 'Himalayan Heritage Narrow Gauge',
      distance: '96 km',
      duration: '5h 20m',
      fromStation: 'KLK',
      toStation: 'SML',
      imageSrc: '/steam-forest.jpg',
      highlights: ['102 Historic Tunnels', '864 Multi-tier Stone Bridges', '2,152m Peak Elevation'],
      description: 'Built in 1898, this legendary mountain line climbs 4,800 feet into the Himalayas through dense pine forests, dramatic sunbeams, sharp horseshoe curves, and panoramic ridges.',
      visualTheme: {
        accentColor: '#C2561E',
        icon: Mountain,
        badge: 'UNESCO HERITAGE',
      },
    },
    {
      id: 'pamban',
      name: 'Mountain Bridge & River Valley Express',
      subtitle: 'Grand Viaduct Over Mountain Waters',
      type: 'Scenic Alpine Corridor',
      distance: 'Mountain Pass',
      duration: 'Scenic Cruise',
      fromStation: 'NDLS',
      toStation: 'SVDK',
      imageSrc: '/mountain-bridge.jpg',
      highlights: ['High-Arc Stone Viaduct', 'Crystal River Crossing', 'Evergreen Forest Pass'],
      description: 'A breathtaking railway journey across grand stone arches spanning turquoise mountain rivers, surrounded by towering pine forests and dramatic sunset mountain summits.',
      visualTheme: {
        accentColor: '#1F5244',
        icon: Waves,
        badge: 'SCENIC VIADUCT',
      },
    },
    {
      id: 'vande-bharat',
      name: 'Vande Bharat Mountain Tunnel Express',
      subtitle: 'Next-Generation Semi-High-Speed Rail',
      type: 'Modern EMU Corridor',
      distance: 'Mountain Cut',
      duration: 'Rapid Transit',
      fromStation: 'NDLS',
      toStation: 'BSB',
      imageSrc: '/tunnel-train.jpg',
      highlights: ['Aerodynamic 160 km/h Trainset', 'Deep Rock Tunnels', 'Sealed Gangways'],
      description: 'India’s indigenously engineered flagship train piercing through rugged granite mountain tunnels with intelligent kinetic suspension and automated passenger doors.',
      visualTheme: {
        accentColor: '#E67E48',
        icon: Zap,
        badge: 'MODERN FLAGSHIP',
      },
    },
  ];

  const handleRouteClick = (from: string, to: string) => {
    router.push(`/trains?from=${from}&to=${to}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {routes.map((route) => {
        const Icon = route.visualTheme.icon;
        return (
          <div
            key={route.id}
            className="group relative rounded-2xl border border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D] overflow-hidden shadow-md dark:shadow-xl flex flex-col justify-between transition-all duration-300 hover:border-[#E9793D] dark:hover:border-[#F18445] hover:shadow-xl"
          >
            {/* Top Scenic Image Container */}
            <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-[#FAF5ED] dark:bg-[#191426]">
              <Image
                src={route.imageSrc}
                alt={route.name}
                fill
                className="object-cover transform group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-105"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* Gradient Vignette for Text Contrast */}
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 dark:from-[#211A2D] dark:via-[#211A2D]/40 to-transparent" />
              
              {/* Top Badges */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                <span 
                  className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md border shadow-sm bg-white/90 dark:bg-[#191426]/90 text-[#E9793D] dark:text-[#F5B65C] border-[#E7D5C1] dark:border-[#493B55]"
                >
                  {route.visualTheme.badge}
                </span>

                <span className="px-2.5 py-1 rounded-md bg-white/90 dark:bg-[#191426]/90 backdrop-blur-md text-[11px] font-mono font-semibold text-[#251B32] dark:text-[#FFF8F0] border border-[#E7D5C1] dark:border-[#493B55] flex items-center gap-1 shadow-sm">
                  <Clock className="w-3 h-3 text-[#E9793D] dark:text-[#F18445]" />
                  <span>{route.duration}</span>
                </span>
              </div>

              {/* Station Route Pill */}
              <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2 bg-white/95 dark:bg-[#191426]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#E7D5C1] dark:border-[#493B55] text-xs font-mono font-bold text-[#251B32] dark:text-[#FFF8F0] shadow-md">
                <MapPin className="w-3.5 h-3.5 text-[#13875C] dark:text-[#20C997]" />
                <span>{route.fromStation}</span>
                <span className="text-[#685C6B] dark:text-[#C5B9CD]">&rarr;</span>
                <span>{route.toStation}</span>
                <span className="text-[#685C6B] dark:text-[#C5B9CD] text-[10px]">&bull; {route.distance}</span>
              </div>
            </div>

            {/* Content Area */}
            <div className="p-6 flex flex-col justify-between flex-1">
              <div>
                <h3 className="text-lg font-bold text-[#251B32] dark:text-[#FFF8F0] group-hover:text-[#E9793D] dark:group-hover:text-[#F18445] transition-colors">
                  {route.name}
                </h3>
                <p className="text-xs text-[#E9793D] dark:text-[#F5B65C] font-semibold mt-1">
                  {route.subtitle}
                </p>

                <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-3 leading-relaxed">
                  {route.description}
                </p>

                {/* Highlights */}
                <div className="mt-4 pt-3.5 border-t border-[#E7D5C1] dark:border-[#493B55] grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {route.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#685C6B] dark:text-[#C5B9CD] font-medium">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#E9793D] dark:bg-[#F18445]" />
                      <span className="truncate">{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Action */}
              <div className="mt-6 pt-3.5 border-t border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between">
                <span className="text-xs font-mono text-[#685C6B] dark:text-[#C5B9CD]">
                  Daily Scheduled Services
                </span>

                <Link
                  href={`/trains?from=${route.fromStation}&to=${route.toStation}`}
                  target="_self"
                  onClick={(e) => {
                    if (!e.ctrlKey && !e.metaKey && e.button === 0) {
                      e.preventDefault();
                      handleRouteClick(route.fromStation, route.toStation);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] dark:bg-[#F18445] dark:hover:bg-[#E9793D] text-xs font-bold text-white shadow-md shadow-orange-950/20 transition-all cursor-pointer group/btn transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Search Route</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform text-white" />
                </Link>
              </div>

            </div>

          </div>
        );
      })}
    </div>
  );
}
