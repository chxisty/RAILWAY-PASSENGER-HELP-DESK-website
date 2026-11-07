'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { 
  Compass, 
  ArrowRightLeft, 
  Calendar, 
  Search, 
  Clock, 
  MapPin, 
  ChevronRight, 
  Filter, 
  ArrowUpDown, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Train as TrainIcon, 
  X, 
  Info,
  Utensils,
  Navigation,
  Sparkles
} from 'lucide-react';
import { 
  fetchStations, 
  searchTrains, 
  fetchTrainRoute,
  StationItem, 
  TrainSearchResult, 
  TrainSearchResponse, 
  TrainStop 
} from '@/lib/api';
import { Container, Card, Badge, Button } from '@/primitives';

function TrainSearchContent() {
  const searchParams = useSearchParams();

  // Input form state
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [selectedFrom, setSelectedFrom] = useState<StationItem | null>(null);
  const [selectedTo, setSelectedTo] = useState<StationItem | null>(null);
  const [journeyDate, setJourneyDate] = useState<string>('');

  // Autocomplete suggestions
  const [fromSuggestions, setFromSuggestions] = useState<StationItem[]>([]);
  const [toSuggestions, setToSuggestions] = useState<StationItem[]>([]);
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [allStations, setAllStations] = useState<StationItem[]>([]);

  // Search Results State
  const [searchResults, setSearchResults] = useState<TrainSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Sorting & Filtering
  const [sortBy, setSortBy] = useState<'departure' | 'arrival' | 'duration'>('departure');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRunsTodayOnly, setFilterRunsTodayOnly] = useState<boolean>(false);

  // Timetable Modal State
  const [activeModalTrain, setActiveModalTrain] = useState<TrainSearchResult | null>(null);
  const [modalRouteSchedule, setModalRouteSchedule] = useState<TrainStop[]>([]);
  const [isModalLoading, setIsModalLoading] = useState(false);

  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const [selectedQuickDate, setSelectedQuickDate] = useState<'today' | 'tomorrow' | 'dayAfter' | null>('tomorrow');
  const [todayStr, setTodayStr] = useState('');
  const [tomorrowStr, setTomorrowStr] = useState('');
  const [dayAfterStr, setDayAfterStr] = useState('');

  // Initialize journeyDate on mount (default: Tomorrow)
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
  }, []);

  // Load all stations once on mount
  useEffect(() => {
    let mounted = true;
    const loadStations = async () => {
      try {
        const stations = await fetchStations();
        if (mounted) {
          setAllStations(stations);
        }
      } catch (err) {
        console.error('Failed to load stations:', err);
      }
    };
    loadStations();
    return () => {
      mounted = false;
    };
  }, []);

  // Handle URL query parameters if navigated from home page
  useEffect(() => {
    const f = searchParams.get('from');
    const t = searchParams.get('to');
    const d = searchParams.get('date');

    if (f) setFromQuery(f);
    if (t) setToQuery(t);
    if (d) setJourneyDate(d);

    if (f && t) {
      executeSearch(f, t, d || journeyDate);
    }
  }, [searchParams]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (fromRef.current && !fromRef.current.contains(e.target as Node)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(e.target as Node)) {
        setShowToDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter autocomplete for 'From'
  useEffect(() => {
    if (!fromQuery.trim()) {
      setFromSuggestions([]);
      return;
    }
    const q = fromQuery.toLowerCase().trim();
    const matches = allStations.filter(s => 
      s.station_code.toLowerCase().includes(q) ||
      s.station_name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
    setFromSuggestions(matches.slice(0, 8));
  }, [fromQuery, allStations]);

  // Filter autocomplete for 'To'
  useEffect(() => {
    if (!toQuery.trim()) {
      setToSuggestions([]);
      return;
    }
    const q = toQuery.toLowerCase().trim();
    const matches = allStations.filter(s => 
      s.station_code.toLowerCase().includes(q) ||
      s.station_name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
    setToSuggestions(matches.slice(0, 8));
  }, [toQuery, allStations]);

  const extractStationCode = (text: string, selected: StationItem | null): string => {
    if (selected) return selected.station_code;
    const match = text.match(/\(([A-Z0-9]+)\)/i);
    if (match) return match[1].toUpperCase();
    return text.trim();
  };

  const executeSearch = async (fromVal: string, toVal: string, dateVal: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    setHasSearched(true);

    const fromCode = extractStationCode(fromVal, selectedFrom);
    const toCode = extractStationCode(toVal, selectedTo);

    if (!fromCode || !toCode) {
      setErrorMessage('Please specify both origin and destination stations.');
      setIsLoading(false);
      return;
    }

    try {
      const results = await searchTrains(fromCode, toCode, dateVal || undefined);

      if (!results.trains || results.trains.length === 0) {
        setErrorMessage(
          `No scheduled direct trains found running from ${results.from_station.station_code} to ${results.to_station.station_code} in the timetable snapshot.`
        );
      }
      setSearchResults(results);
    } catch (err: any) {
      console.error('Search error:', err);
      setErrorMessage(
        err.message || 
        'No direct scheduled trains found between these stations or database query timed out. Please check station codes.'
      );
      setSearchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(fromQuery, toQuery, journeyDate);
  };

  const handleSwapStations = () => {
    const tempQuery = fromQuery;
    const tempSelected = selectedFrom;
    setFromQuery(toQuery);
    setSelectedFrom(selectedTo);
    setToQuery(tempQuery);
    setSelectedTo(tempSelected);
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

  const handleViewDetails = async (train: TrainSearchResult) => {
    setActiveModalTrain(train);
    setIsModalLoading(true);
    try {
      const schedule = await fetchTrainRoute(train.train_number);
      setModalRouteSchedule(schedule);
    } catch (err) {
      console.error('Failed to load train route:', err);
      setModalRouteSchedule([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Filtered & Sorted trains
  const processedTrains = React.useMemo(() => {
    if (!searchResults || !searchResults.trains) return [];
    let list = [...searchResults.trains];

    // Filter by type
    if (filterType !== 'all') {
      list = list.filter(t => t.train_type.toLowerCase().includes(filterType.toLowerCase()));
    }

    // Filter by runs today
    if (filterRunsTodayOnly) {
      list = list.filter(t => t.runs_on_date === true);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'departure') {
        return a.departure_time.localeCompare(b.departure_time);
      } else if (sortBy === 'arrival') {
        const aMins = (a.day_difference || 0) * 1440 + parseTimeToMins(a.arrival_time);
        const bMins = (b.day_difference || 0) * 1440 + parseTimeToMins(b.arrival_time);
        return aMins - bMins;
      } else if (sortBy === 'duration') {
        return a.duration_minutes - b.duration_minutes;
      }
      return 0;
    });

    return list;
  }, [searchResults, filterType, filterRunsTodayOnly, sortBy]);

  function parseTimeToMins(timeStr: string): number {
    const clean = timeStr.split(' ')[0];
    const parts = clean.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
    }
    return 0;
  }

  // Pre-fill popular searches
  const handleSelectPopularRoute = (fromName: string, fromCode: string, toName: string, toCode: string) => {
    setFromQuery(`${fromName} (${fromCode})`);
    setSelectedFrom({
      station_code: fromCode,
      station_name: fromName,
      city: fromName,
      state: ''
    });

    setToQuery(`${toName} (${toCode})`);
    setSelectedTo({
      station_code: toCode,
      station_name: toName,
      city: toName,
      state: ''
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF5ED] dark:bg-[#100D19] text-[#251B32] dark:text-[#FFF8F0] py-8 selection:bg-[#E9793D] selection:text-white">
      <Container size="large" className="space-y-6">
        
        {/* Concourse & Header Intro */}
        <div className="border-b border-[#E7D5C1] dark:border-[#493B55] pb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs text-[#E9793D] dark:text-[#F5B65C] uppercase tracking-wider font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#E9793D] animate-pulse" />
              Station Concourse & Platform Search
            </span>
            <span className="text-[#8E8274]">•</span>
            <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD]">Strict Sequence Validation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
            Find Scheduled Trains Between Stations
          </h1>
          <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-1.5 max-w-3xl leading-relaxed">
            Query scheduled Indian Railway services with authentic route direction verification. Destination station sequence must occur strictly after origin station. Halts, timings, and operational running days are retrieved from the verified timetable database.
          </p>
        </div>

        {/* Illustrated Station Departure Environment Banner */}
        <div className="relative w-full h-40 sm:h-48 rounded-2xl overflow-hidden border border-[#E7D5C1] dark:border-[#493B55] shadow-xl">
          <Image
            src="/sunset-viaduct.jpg"
            alt="Scenic Railway Bridge Crossing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 banner-gradient" />
          <div className="absolute inset-0 p-6 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <span className="banner-badge inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                <TrainIcon className="w-3.5 h-3.5 text-white" />
                <span>PASSENGER CORRIDOR SEARCH</span>
              </span>
              <span className="banner-counter text-xs font-mono px-2 py-0.5 rounded font-bold">
                5,208 Trains Indexed
              </span>
            </div>
            <div>
              <p className="banner-title text-base sm:text-lg font-bold">
                Every Journey Has a Story &bull; Find Your Train Across India
              </p>
              <p className="banner-subtitle text-xs mt-0.5">
                Enter your departure station and destination to view schedules, intermediate halts, and coach classes.
              </p>
            </div>
          </div>
        </div>

        {/* Search Panel Card */}
        <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-5 sm:p-6 shadow-xl">
          <form onSubmit={handleSearch} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              
              {/* From Station */}
              <div ref={fromRef} className="md:col-span-5 relative">
                <label className="block text-xs font-semibold text-[#251B32] dark:text-[#C5B9CD] mb-1.5 flex items-center justify-between">
                  <span>Origin Station (From)</span>
                  {selectedFrom && (
                    <span className="text-[11px] text-[#E9793D] dark:text-[#F5B65C] font-mono font-bold bg-[#FAF5ED] dark:bg-[#191426] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">
                      {selectedFrom.station_code}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-[#E9793D] pointer-events-none" />
                  <input
                    type="text"
                    value={fromQuery}
                    onChange={(e) => {
                      setFromQuery(e.target.value);
                      setSelectedFrom(null);
                      setShowFromDropdown(true);
                    }}
                    onFocus={() => setShowFromDropdown(true)}
                    placeholder="e.g. Ernakulam, NDLS, Mumbai..."
                    className="w-full pl-10 pr-9 py-2.5 bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl text-[#251B32] dark:text-[#FFF8F0] placeholder-[#8E8274] dark:placeholder-[#A093B3] focus:outline-none focus:border-[#E9793D] focus:ring-1 focus:ring-[#E9793D]/30 text-xs font-medium transition-colors"
                  />
                  {fromQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setFromQuery('');
                        setSelectedFrom(null);
                      }}
                      className="absolute right-3 top-3 text-[#8E8274] dark:text-[#A093B3] hover:text-[#251B32] dark:hover:text-[#FFF8F0]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showFromDropdown && fromSuggestions.length > 0 && (
                  <div className="station-autocomplete-dropdown absolute z-30 left-0 right-0 mt-1.5 bg-white dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#E7D5C1] dark:divide-[#493B55]">
                    {fromSuggestions.map((stn) => (
                      <button
                        key={stn.station_code}
                        type="button"
                        onClick={() => {
                          setSelectedFrom(stn);
                          setFromQuery(`${stn.station_name} (${stn.station_code})`);
                          setShowFromDropdown(false);
                        }}
                        className="station-autocomplete-item w-full text-left px-3.5 py-2.5 bg-white dark:bg-[#191426] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="station-name text-xs font-semibold text-[#251B32] dark:text-[#FFF8F0] group-hover:text-[#E9793D] dark:group-hover:text-[#F5B65C]">
                            {stn.station_name}
                          </div>
                          <div className="station-city text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">
                            {stn.city}{stn.state ? `, ${stn.state}` : ''}
                          </div>
                        </div>
                        <span className="station-code text-[11px] font-mono font-bold text-[#E9793D] dark:text-[#F5B65C] bg-[#FAF5ED] dark:bg-[#292137] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">
                          {stn.station_code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Station Swap Button */}
              <div className="md:col-span-1 flex justify-center -my-1 md:my-0">
                <button
                  type="button"
                  onClick={handleSwapStations}
                  title="Swap Origin and Destination"
                  className="p-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#E9793D] dark:text-[#F5B65C] border border-[#E7D5C1] dark:border-[#493B55] transition-colors shadow-sm cursor-pointer"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* To Station */}
              <div ref={toRef} className="md:col-span-4 relative">
                <label className="block text-xs font-semibold text-[#251B32] dark:text-[#C5B9CD] mb-1.5 flex items-center justify-between">
                  <span>Destination Station (To)</span>
                  {selectedTo && (
                    <span className="text-[11px] text-[#13875C] dark:text-[#20C997] font-mono font-bold bg-[#EBF7F0] dark:bg-[#191426] px-2 py-0.5 rounded border border-[#C5E8D3] dark:border-[#493B55]">
                      {selectedTo.station_code}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-3 w-4 h-4 text-[#13875C] dark:text-[#20C997] pointer-events-none" />
                  <input
                    type="text"
                    value={toQuery}
                    onChange={(e) => {
                      setToQuery(e.target.value);
                      setSelectedTo(null);
                      setShowToDropdown(true);
                    }}
                    onFocus={() => setShowToDropdown(true)}
                    placeholder="e.g. Trivandrum, TVC, Delhi..."
                    className="w-full pl-10 pr-9 py-2.5 bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl text-[#251B32] dark:text-[#FFF8F0] placeholder-[#8E8274] dark:placeholder-[#A093B3] focus:outline-none focus:border-[#E9793D] focus:ring-1 focus:ring-[#E9793D]/30 text-xs font-medium transition-colors"
                  />
                  {toQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setToQuery('');
                        setSelectedTo(null);
                      }}
                      className="absolute right-3 top-3 text-[#8E8274] dark:text-[#A093B3] hover:text-[#251B32] dark:hover:text-[#FFF8F0]"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Autocomplete Dropdown */}
                {showToDropdown && toSuggestions.length > 0 && (
                  <div className="station-autocomplete-dropdown absolute z-30 left-0 right-0 mt-1.5 bg-white dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-[#E7D5C1] dark:divide-[#493B55]">
                    {toSuggestions.map((stn) => (
                      <button
                        key={stn.station_code}
                        type="button"
                        onClick={() => {
                          setSelectedTo(stn);
                          setToQuery(`${stn.station_name} (${stn.station_code})`);
                          setShowToDropdown(false);
                        }}
                        className="station-autocomplete-item w-full text-left px-3.5 py-2.5 bg-white dark:bg-[#191426] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div>
                          <div className="station-name text-xs font-semibold text-[#251B32] dark:text-[#FFF8F0] group-hover:text-[#E9793D] dark:group-hover:text-[#F5B65C]">
                            {stn.station_name}
                          </div>
                          <div className="station-city text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">
                            {stn.city}{stn.state ? `, ${stn.state}` : ''}
                          </div>
                        </div>
                        <span className="station-code text-[11px] font-mono font-bold text-[#13875C] dark:text-[#20C997] bg-[#EBF7F0] dark:bg-[#292137] px-2 py-0.5 rounded border border-[#C5E8D3] dark:border-[#493B55]">
                          {stn.station_code}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Journey Date */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#251B32] dark:text-[#C5B9CD] mb-1.5">
                  Journey Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-[#E9793D] pointer-events-none" />
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
                    className="w-full pl-9 pr-2.5 py-2.5 bg-white dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl text-[#251B32] dark:text-[#FFF8F0] focus:outline-none focus:border-[#E9793D] text-xs font-medium transition-colors"
                  />
                </div>
              </div>

            </div>

            {/* Quick date chips & Search Action */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E7D5C1] dark:border-[#493B55]">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[#685C6B] dark:text-[#C5B9CD] font-medium">Quick Dates:</span>
                <button
                  type="button"
                  onClick={() => setDateOffset(0)}
                  className={`quick-date-btn ${selectedQuickDate === 'today' ? 'quick-date-btn-active' : ''}`}
                  aria-pressed={selectedQuickDate === 'today'}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(1)}
                  className={`quick-date-btn ${selectedQuickDate === 'tomorrow' ? 'quick-date-btn-active' : ''}`}
                  aria-pressed={selectedQuickDate === 'tomorrow'}
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setDateOffset(2)}
                  className={`quick-date-btn ${selectedQuickDate === 'dayAfter' ? 'quick-date-btn-active' : ''}`}
                  aria-pressed={selectedQuickDate === 'dayAfter'}
                >
                  +2 Days
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-7 py-2.5 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{isLoading ? 'Searching Database...' : 'Search Trains'}</span>
              </button>
            </div>
          </form>

          {/* Popular Route Shortcuts */}
          <div className="mt-4 pt-3.5 border-t border-[#E7D5C1] dark:border-[#493B55] flex flex-wrap items-center gap-2 text-xs text-[#685C6B] dark:text-[#C5B9CD]">
            <span className="font-medium text-[#251B32] dark:text-[#FFF8F0]">Corridor Presets:</span>
            <button
              type="button"
              onClick={() => handleSelectPopularRoute('Ernakulam Junction', 'ERS', 'Thiruvananthapuram Central', 'TVC')}
              className="px-2.5 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:text-[#E9793D] dark:hover:text-[#F5B65C] transition-colors cursor-pointer"
            >
              ERS &rarr; TVC
            </button>
            <button
              type="button"
              onClick={() => handleSelectPopularRoute('Mumbai Central', 'MMCT', 'New Delhi', 'NDLS')}
              className="px-2.5 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:text-[#E9793D] dark:hover:text-[#F5B65C] transition-colors cursor-pointer"
            >
              MMCT &rarr; NDLS
            </button>
            <button
              type="button"
              onClick={() => handleSelectPopularRoute('Dr MGR Chennai Central', 'MAS', 'Coimbatore Junction', 'CBE')}
              className="px-2.5 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:text-[#E9793D] dark:hover:text-[#F5B65C] transition-colors cursor-pointer"
            >
              MAS &rarr; CBE
            </button>
            <button
              type="button"
              onClick={() => handleSelectPopularRoute('New Delhi', 'NDLS', 'Rani Kamalapati', 'RKMP')}
              className="px-2.5 py-1 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] hover:text-[#E9793D] dark:hover:text-[#F5B65C] transition-colors cursor-pointer"
            >
              NDLS &rarr; RKMP
            </button>
          </div>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-[#2A1520] border border-rose-300 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3 shadow-lg">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-900 dark:text-rose-200">Route Verification Notice</p>
              <p className="text-rose-800/90 dark:text-rose-300/90 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Results Section */}
        {searchResults && (
          <div className="space-y-4">
            
            {/* Results Header with Route Info & Filters */}
            <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
              <div>
                <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] uppercase tracking-wider font-semibold">Timetable Results</div>
                <div className="text-base sm:text-lg font-extrabold text-[#251B32] dark:text-[#FFF8F0] flex items-center gap-2 mt-0.5">
                  <span className="text-[#E9793D] dark:text-[#F5B65C]">{searchResults.from_station.station_name}</span>
                  <span className="text-[#685C6B] dark:text-[#C5B9CD] font-mono text-xs">({searchResults.from_station.station_code})</span>
                  <span className="text-[#E9793D]">&rarr;</span>
                  <span className="text-[#13875C] dark:text-[#20C997]">{searchResults.to_station.station_name}</span>
                  <span className="text-[#685C6B] dark:text-[#C5B9CD] font-mono text-xs">({searchResults.to_station.station_code})</span>
                </div>
                {searchResults.journey_date && (
                  <div className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-1 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#E9793D]" />
                    <span>{searchResults.journey_date} ({searchResults.day_of_week})</span>
                    <span className="text-[#8E8274]">•</span>
                    <span className="font-semibold text-[#E9793D] dark:text-[#F5B65C]">{processedTrains.length} service(s) available</span>
                  </div>
                )}
              </div>

              {/* Sorting and Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Sort */}
                <div className="flex items-center gap-1.5 text-xs bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl px-3 py-1.5 shadow-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C]" />
                  <span className="text-[#685C6B] dark:text-[#C5B9CD]">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e: any) => setSortBy(e.target.value)}
                    className="bg-transparent text-[#251B32] dark:text-[#FFF8F0] font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="departure" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Departure Time</option>
                    <option value="arrival" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Arrival Time</option>
                    <option value="duration" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Shortest Duration</option>
                  </select>
                </div>

                {/* Filter Train Type */}
                <div className="flex items-center gap-1.5 text-xs bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] rounded-xl px-3 py-1.5 shadow-xs">
                  <Filter className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C]" />
                  <span className="text-[#685C6B] dark:text-[#C5B9CD]">Type:</span>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="bg-transparent text-[#251B32] dark:text-[#FFF8F0] font-semibold focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">All Types</option>
                    <option value="vande bharat" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Vande Bharat</option>
                    <option value="rajdhani" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Rajdhani</option>
                    <option value="shatabdi" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Shatabdi</option>
                    <option value="superfast" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Superfast</option>
                    <option value="jan shatabdi" className="bg-white dark:bg-[#211A2D] text-[#251B32] dark:text-[#FFF8F0]">Jan Shatabdi</option>
                  </select>
                </div>

                {/* Filter Running On Selected Date */}
                {searchResults.day_of_week && (
                  <button
                    type="button"
                    onClick={() => setFilterRunsTodayOnly(!filterRunsTodayOnly)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      filterRunsTodayOnly
                        ? 'bg-[#E9793D]/20 border-[#E9793D] text-[#E9793D] dark:text-[#F5B65C]'
                        : 'bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-[#FFF8F0]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${filterRunsTodayOnly ? 'bg-[#E9793D]' : 'bg-[#A39687]'}`} />
                    <span>Runs on {searchResults.day_of_week}</span>
                  </button>
                )}
              </div>
            </div>

            {/* List of Matching Timetable Records */}
            {processedTrains.length === 0 ? (
              <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-10 text-center space-y-3 shadow-xl">
                <TrainIcon className="w-12 h-12 text-[#685C6B] dark:text-[#C5B9CD] mx-auto" />
                <h3 className="text-sm font-bold text-[#251B32] dark:text-[#FFF8F0]">No Matching Trains Found</h3>
                <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] max-w-sm mx-auto">
                  No scheduled services match your selected filter criteria. Try resetting the filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFilterType('all');
                    setFilterRunsTodayOnly(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#251B32] dark:text-[#FFF8F0] text-xs font-semibold border border-[#E7D5C1] dark:border-[#493B55] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {processedTrains.map((train) => (
                  <div
                    key={train.train_number}
                    className="border border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#211A2D] hover:border-[#E9793D]/60 transition-all rounded-2xl p-5 space-y-4 shadow-xl"
                  >
                    {/* Header row: Train number, name, type, and runs on date */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7D5C1] dark:border-[#493B55] gap-2">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono font-bold text-xs bg-[#E9793D]/20 text-[#E9793D] dark:text-[#F5B65C] px-2.5 py-1 rounded-lg border border-[#E9793D]/40">
                          {train.train_number}
                        </span>
                        <h3 className="font-bold text-[#251B32] dark:text-[#FFF8F0] text-sm sm:text-base">
                          {train.train_name}
                        </h3>
                        <span className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] bg-[#FAF5ED] dark:bg-[#191426] px-2.5 py-0.5 rounded-lg border border-[#E7D5C1] dark:border-[#493B55] font-medium">
                          {train.train_type}
                        </span>
                        {train.runs_on_date === true && (
                          <span className="text-[11px] font-semibold text-[#13875C] dark:text-[#20C997] bg-[#EBF7F0] dark:bg-[#191426] border border-[#C5E8D3] dark:border-[#493B55] px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Runs on Date</span>
                          </span>
                        )}
                        {train.runs_on_date === false && (
                          <span className="text-[11px] font-semibold text-[#E9793D] dark:text-[#F5B65C] bg-[#FAF5ED] dark:bg-[#292137] border border-[#E7D5C1] dark:border-[#E9793D]/40 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>Non-operational on Date</span>
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewDetails(train)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#251B32] dark:text-[#FFF8F0] border border-[#E7D5C1] dark:border-[#493B55] text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Timetable & Halts</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C]" />
                      </button>
                    </div>

                    {/* Timetable Schedule Grid: Departure, Segment, Arrival */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-[#FAF5ED] dark:bg-[#191426] p-4 rounded-xl border border-[#E7D5C1] dark:border-[#493B55]">
                      <div className="sm:col-span-4">
                        <div className="text-2xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0] tracking-tight">{train.departure_time}</div>
                        <div className="text-xs font-bold text-[#E9793D] dark:text-[#F5B65C] mt-0.5">{train.from_station_name}</div>
                        <div className="text-[11px] font-mono text-[#685C6B] dark:text-[#C5B9CD]">Code: {train.from_station_code}</div>
                      </div>

                      <div className="sm:col-span-4 text-center px-2 py-1">
                        <div className="text-xs font-semibold text-[#685C6B] dark:text-[#C5B9CD] flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#E9793D]" />
                          <span>{train.duration}</span>
                        </div>
                        <div className="h-0.5 bg-[#E7D5C1] dark:border-[#493B55] my-2 w-full relative">
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-[#E9793D]" />
                          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-[#13875C] dark:bg-[#20C997]" />
                        </div>
                        <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] font-mono">
                          {train.distance_km > 0 ? `${train.distance_km} km • ` : ''}
                          {train.intermediate_stops_count > 0 ? `${train.intermediate_stops_count} halts` : 'Direct service'}
                        </div>
                      </div>

                      <div className="sm:col-span-4 text-left sm:text-right">
                        <div className="text-2xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
                          {train.arrival_time}
                          {train.day_difference > 0 && (
                            <span className="text-xs text-[#E9793D] ml-1.5 font-sans font-semibold">
                              (+{train.day_difference}d)
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-bold text-[#13875C] dark:text-[#20C997] mt-0.5">{train.to_station_name}</div>
                        <div className="text-[11px] font-mono text-[#685C6B] dark:text-[#C5B9CD]">Code: {train.to_station_code}</div>
                      </div>
                    </div>

                    {/* Class pills, Running Days, Pantry */}
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[#685C6B] dark:text-[#C5B9CD]">Classes:</span>
                        {train.classes.map(cls => (
                          <span key={cls} className="px-2 py-0.5 rounded-lg bg-[#FAF5ED] dark:bg-[#191426] text-[#251B32] dark:text-[#FFF8F0] border border-[#E7D5C1] dark:border-[#493B55] text-[11px] font-mono font-semibold">
                            {cls}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">
                        <span>Runs:</span>
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                          const operates = train.runs_on.includes(day);
                          return (
                            <span
                              key={day}
                              className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${
                                operates
                                  ? 'bg-[#E9793D]/20 text-[#E9793D] dark:text-[#F5B65C] font-bold border border-[#E9793D]/40'
                                  : 'text-[#B8A392] dark:text-[#5C4D73]'
                              }`}
                            >
                              {day.charAt(0)}
                            </span>
                          );
                        })}
                      </div>

                      {train.pantry && (
                        <div className="text-[#685C6B] dark:text-[#C5B9CD] text-[11px] flex items-center gap-1">
                          <Utensils className="w-3.5 h-3.5 text-[#E9793D]" />
                          <span>{train.pantry}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Timetable / Route Modal */}
        {activeModalTrain && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
              
              {/* Modal Header */}
              <div className="p-5 border-b border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between bg-[#FAF5ED] dark:bg-[#191426]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#E9793D] dark:text-[#F5B65C] bg-[#E9793D]/15 px-2.5 py-0.5 rounded-lg border border-[#E9793D]/30">
                      {activeModalTrain.train_number}
                    </span>
                    <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD]">
                      {activeModalTrain.train_type}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-[#251B32] dark:text-[#FFF8F0] mt-1">
                    {activeModalTrain.train_name}
                  </h3>
                  <p className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">
                    Official Timetable Route Sequence & Intermediate Station Halts
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalTrain(null)}
                  className="p-2 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-[#FFF8F0] border border-[#E7D5C1] dark:border-transparent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content - Ordered Railway Timetable */}
              <div className="p-5 overflow-y-auto space-y-4 flex-1">
                {isModalLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <div className="w-8 h-8 border-2 border-[#E9793D] border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD]">Loading timetable stops from database...</p>
                  </div>
                ) : modalRouteSchedule.length === 0 ? (
                  <div className="py-10 text-center text-[#685C6B] dark:text-[#C5B9CD] text-xs">
                    No intermediate stops recorded for this train in the reference snapshot.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-[#FAF5ED] dark:bg-[#191426] p-3 rounded-xl border border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD]">
                      <div>
                        <span className="text-[#685C6B] dark:text-[#C5B9CD] block text-[11px]">Total Stops:</span>
                        <span className="font-bold text-[#251B32] dark:text-[#FFF8F0]">{modalRouteSchedule.length}</span>
                      </div>
                      <div>
                        <span className="text-[#685C6B] dark:text-[#C5B9CD] block text-[11px]">Total Distance:</span>
                        <span className="font-bold text-[#251B32] dark:text-[#FFF8F0]">{modalRouteSchedule[modalRouteSchedule.length - 1]?.distance_km || activeModalTrain.distance_km} km</span>
                      </div>
                      <div>
                        <span className="text-[#685C6B] dark:text-[#C5B9CD] block text-[11px]">Classes:</span>
                        <span className="font-bold text-[#251B32] dark:text-[#FFF8F0]">{activeModalTrain.classes.join(', ')}</span>
                      </div>
                      <div>
                        <span className="text-[#685C6B] dark:text-[#C5B9CD] block text-[11px]">Pantry:</span>
                        <span className="font-bold text-[#251B32] dark:text-[#FFF8F0]">{activeModalTrain.pantry || 'Standard'}</span>
                      </div>
                    </div>

                    {/* Table View */}
                    <div className="border border-[#E7D5C1] dark:border-[#493B55] rounded-xl overflow-hidden shadow-inner bg-white dark:bg-[#211A2D]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#FAF5ED] dark:bg-[#191426] text-[#E9793D] dark:text-[#F5B65C] border-b border-[#E7D5C1] dark:border-[#493B55] uppercase font-bold text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3">#</th>
                            <th className="py-2.5 px-3">Station</th>
                            <th className="py-2.5 px-3">Arrival</th>
                            <th className="py-2.5 px-3">Departure</th>
                            <th className="py-2.5 px-3">Halt</th>
                            <th className="py-2.5 px-3">Day</th>
                            <th className="py-2.5 px-3">Distance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E7D5C1] dark:divide-[#493B55] text-[#251B32] dark:text-[#FFF8F0]">
                          {modalRouteSchedule.map((stop) => {
                            const isOrigin = stop.station_code === activeModalTrain.from_station_code;
                            const isDest = stop.station_code === activeModalTrain.to_station_code;
                            const isHighlighted = isOrigin || isDest;

                            return (
                              <tr
                                key={stop.stop_number}
                                className={`transition-colors ${
                                  isHighlighted
                                    ? 'bg-[#FBE9D0] dark:bg-[#E9793D]/20 font-bold text-[#251B32] dark:text-[#FFF8F0]'
                                    : 'hover:bg-[#FAF5ED] dark:hover:bg-[#292137]'
                                }`}
                              >
                                <td className="py-2.5 px-3 font-mono text-[#685C6B] dark:text-[#C5B9CD]">{stop.stop_number}</td>
                                <td className="py-2.5 px-3">
                                  <div className="font-semibold text-[#251B32] dark:text-[#FFF8F0] flex items-center gap-2">
                                    <span>{stop.station_name}</span>
                                    {isOrigin && (
                                      <span className="text-[10px] bg-[#E9793D] text-white font-bold px-1.5 py-0.5 rounded">
                                        Your Origin
                                      </span>
                                    )}
                                    {isDest && (
                                      <span className="text-[10px] bg-[#13875C] dark:bg-[#20C997] text-white dark:text-[#100D19] font-bold px-1.5 py-0.5 rounded">
                                        Your Destination
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-mono text-[10px] text-[#685C6B] dark:text-[#C5B9CD]">{stop.station_code}</span>
                                </td>
                                <td className="py-2.5 px-3 font-mono">{stop.arrival}</td>
                                <td className="py-2.5 px-3 font-mono">{stop.departure}</td>
                                <td className="py-2.5 px-3 text-[#685C6B] dark:text-[#C5B9CD]">{stop.halt_mins > 0 ? `${stop.halt_mins}m` : '-'}</td>
                                <td className="py-2.5 px-3 text-[#685C6B] dark:text-[#C5B9CD]">Day {stop.day}</td>
                                <td className="py-2.5 px-3 font-mono text-[#685C6B] dark:text-[#C5B9CD]">{stop.distance_km} km</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-[#E7D5C1] dark:border-[#493B55] bg-[#FAF5ED] dark:bg-[#191426] flex items-center justify-between text-xs text-[#685C6B] dark:text-[#C5B9CD]">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C]" />
                  <span>Timetable records verified from official Indian Railways data.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModalTrain(null)}
                  className="px-4 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#251B32] dark:text-[#FFF8F0] font-semibold border border-[#E7D5C1] dark:border-[#493B55] transition-colors"
                >
                  Close
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Informational Guidance Box */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] text-[#685C6B] dark:text-[#C5B9CD] text-xs leading-relaxed space-y-1.5 shadow-md">
          <div className="flex items-center gap-2 text-[#251B32] dark:text-[#FFF8F0] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#13875C] dark:text-[#20C997]" />
            <span>Dataset Verification & Integrity Notice</span>
          </div>
          <p className="text-[#685C6B] dark:text-[#C5B9CD]">
            All trains and schedules presented are strictly retrieved from official railway dataset records.
            Direction sequences are mathematically validated to ensure departure precedes arrival.
            For live emergency assistance, lost property queries, or medical help, dial <strong className="text-[#E9793D] dark:text-[#F5B65C]">139</strong> (Rail Madad).
          </p>
        </div>

      </Container>
    </div>
  );
}

export default function TrainSearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-[#685C6B] dark:text-[#C5B9CD] text-xs bg-[#FAF5ED] dark:bg-[#100D19] min-h-screen">Loading Train Search Engine...</div>}>
      <TrainSearchContent />
    </Suspense>
  );
}
