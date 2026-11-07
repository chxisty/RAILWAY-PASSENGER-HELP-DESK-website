'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Train, 
  MapPin, 
  FileText, 
  HelpCircle, 
  Search, 
  ArrowRight, 
  Compass, 
  Database,
  ExternalLink,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import { fetchRailwayInfo, RailwayInfoItem } from '@/lib/api';
import { Container } from '@/primitives/Container';
import { Badge } from '@/primitives/Badge';
import { Button } from '@/primitives/Button';

function RailwayExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get('category') || 'all';

  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchFilter, setSearchFilter] = useState('');
  const [items, setItems] = useState<RailwayInfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    setLoading(true);
    fetchRailwayInfo(activeCategory === 'all' ? undefined : activeCategory, 1, 60)
      .then((res) => {
        setItems(res.items);
        setTotalCount(res.total);
      })
      .catch((err) => console.error('Failed to load railway info:', err))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const categories = [
    { id: 'all', label: 'All Records', icon: Database },
    { id: 'trains', label: 'Trains & Routes', icon: Train },
    { id: 'stations', label: 'Stations & Amenities', icon: MapPin },
    { id: 'policies', label: 'Policies & Circulars', icon: FileText },
    { id: 'faqs', label: 'Passenger FAQs', icon: HelpCircle },
  ];

  const filteredItems = items.filter((item) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      (item.code && item.code.toLowerCase().includes(q)) ||
      (item.origin && item.origin.toLowerCase().includes(q)) ||
      (item.destination && item.destination.toLowerCase().includes(q)) ||
      (item.details && item.details.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 bg-[#FAF5ED] dark:bg-[#100D19] text-[#251B32] dark:text-[#FFF8F0] py-8 min-h-screen selection:bg-[#E9793D] selection:text-white">
      <Container size="large" className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E7D5C1] dark:border-[#493B55]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-[#E9793D] dark:text-[#F5B65C] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#E9793D] animate-pulse" />
                Reference Data Platform
              </span>
              <span className="text-[#8E8274]">•</span>
              <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-mono">{totalCount} Indexed Records</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
              Railway Information Directory
            </h1>
            <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-1.5 max-w-2xl leading-relaxed">
              Searchable reference table for scheduled passenger services, station amenities, Ministry circulars, and refund policies.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => router.push('/trains')}
              className="px-4 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] text-[#251B32] dark:text-[#FFF8F0] text-xs font-semibold border border-[#E7D5C1] dark:border-[#493B55] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C]" />
              <span>Train Search</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="px-4 py-2 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Assistant</span>
            </button>
          </div>
        </div>

        {/* Scenic Railway Route Panorama Banner */}
        <div className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-[#E7D5C1] dark:border-[#493B55] shadow-xl">
          <Image
            src="/steam-forest.jpg"
            alt="Scenic Steam Train Corridor"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 banner-gradient" />
          <div className="absolute inset-0 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="banner-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                OFFICIAL REPOSITORY
              </span>
              <span className="banner-counter text-xs font-mono px-2 py-0.5 rounded font-bold">
                Schedules &bull; Amenities &bull; Gazette Precedence
              </span>
            </div>
            <div>
              <p className="banner-title text-sm sm:text-base font-bold text-white">
                Every Journey Has a Story &bull; Indian Railways Directory
              </p>
              <p className="banner-subtitle text-xs text-stone-200">
                Explore passenger amenities, train schedules, and policy circulars.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-white dark:bg-[#211A2D] p-1.5 rounded-xl border border-[#E7D5C1] dark:border-[#493B55] w-full md:w-auto shadow-md">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#E9793D] text-white shadow-sm'
                      : 'text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-[#FFF8F0] hover:bg-[#FAF5ED] dark:hover:bg-[#292137]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Search filter input */}
          <div className="w-full md:w-80 relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#685C6B] dark:text-[#C5B9CD] pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by name, code, origin, or policy..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl text-xs text-[#251B32] dark:text-[#FFF8F0] placeholder-[#8E8274] dark:placeholder-[#A093B3] focus:outline-none focus:border-[#E9793D] focus:ring-1 focus:ring-[#E9793D]/30 transition-colors"
            />
          </div>
        </div>

        {/* Searchable Data Table */}
        <div className="border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl overflow-hidden bg-white dark:bg-[#211A2D] shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF5ED] dark:bg-[#191426] border-b border-[#E7D5C1] dark:border-[#493B55] text-[#E9793D] dark:text-[#F5B65C] font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4 whitespace-nowrap">Identifier</th>
                  <th className="py-3 px-4">Title / Station / Train</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Operational Details & Scope</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D5C1] dark:divide-[#493B55] text-[#251B32] dark:text-[#FFF8F0]">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5 px-4"><div className="h-4 bg-[#FAF5ED] dark:bg-[#191426] rounded w-16" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-[#FAF5ED] dark:bg-[#191426] rounded w-48" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-[#FAF5ED] dark:bg-[#191426] rounded w-20" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-[#FAF5ED] dark:bg-[#191426] rounded w-64" /></td>
                      <td className="py-3.5 px-4"><div className="h-4 bg-[#FAF5ED] dark:bg-[#191426] rounded w-16 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[#685C6B] dark:text-[#C5B9CD] text-xs">
                      No matching records found for "{searchFilter}". Try another term or clear the filter.
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors">
                      
                      {/* Code / ID */}
                      <td className="py-3 px-4 font-mono font-bold text-[#251B32] dark:text-[#FFF8F0] whitespace-nowrap">
                        {item.code ? (
                          <span className="px-2 py-0.5 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] text-[#E9793D] dark:text-[#F5B65C] border border-[#E7D5C1] dark:border-[#493B55]">
                            {item.code}
                          </span>
                        ) : (
                          <span className="text-[#8E8274] font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* Name / Train */}
                      <td className="py-3 px-4 font-semibold text-[#251B32] dark:text-[#FFF8F0]">
                        <div>{item.name}</div>
                        {item.origin && item.destination && (
                          <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-0.5 font-mono">
                            {item.origin} &rarr; {item.destination}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.category === 'trains'
                            ? 'bg-[#E9793D]/20 text-[#E9793D] dark:text-[#F5B65C] border border-[#E9793D]/40'
                            : item.category === 'stations'
                            ? 'bg-[#EBF7F0] dark:bg-[#191426] text-[#13875C] dark:text-[#20C997] border border-[#C5E8D3] dark:border-[#493B55]'
                            : 'bg-[#FAF5ED] dark:bg-[#191426] text-[#685C6B] dark:text-[#C5B9CD] border border-[#E7D5C1] dark:border-[#493B55]'
                        }`}>
                          {item.category.toUpperCase()}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-[#685C6B] dark:text-[#C5B9CD] max-w-md">
                        <div className="line-clamp-2 text-xs leading-relaxed">
                          {item.details || 'Official verified record.'}
                        </div>
                        {item.facilities && item.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {item.facilities.slice(0, 4).map((fac, fIdx) => (
                              <span key={fIdx} className="text-[10px] bg-[#FAF5ED] dark:bg-[#191426] text-[#685C6B] dark:text-[#C5B9CD] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">
                                {fac}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => router.push(`/chat?q=${encodeURIComponent('Tell me about ' + item.name + (item.code ? ` (${item.code})` : ''))}`)}
                          className="inline-flex items-center gap-1 text-xs text-[#E9793D] dark:text-[#F5B65C] hover:text-[#D46A34] font-bold transition-colors cursor-pointer"
                        >
                          <span>Ask AI</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Directory Guidance Notice */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <span>All directory entries originate from the official railway SQLite database and verified circulars.</span>
          <span className="font-mono text-[11px] text-[#E9793D] dark:text-[#F5B65C] shrink-0 bg-[#FAF5ED] dark:bg-[#191426] px-2.5 py-1 rounded-lg border border-[#E7D5C1] dark:border-[#493B55]">
            Updated Assessment Pack
          </span>
        </div>

      </Container>
    </div>
  );
}

export default function RailwayExplorePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#685C6B] dark:text-[#C5B9CD] text-xs bg-[#FAF5ED] dark:bg-[#100D19] min-h-screen">Loading Railway Directory...</div>}>
      <RailwayExploreContent />
    </Suspense>
  );
}
