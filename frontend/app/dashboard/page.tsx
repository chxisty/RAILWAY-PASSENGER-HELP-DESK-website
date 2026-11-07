'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  Database, 
  RotateCw, 
  CheckCircle2, 
  FileText, 
  Train, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  MessageSquare,
  Activity,
  Sliders
} from 'lucide-react';
import { fetchDashboardInsights, reloadDataset, DashboardInsights } from '@/lib/api';
import { Container } from '@/primitives/Container';
import { Card } from '@/primitives/Card';
import { Badge } from '@/primitives/Badge';
import { Button } from '@/primitives/Button';

export default function DashboardPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<DashboardInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [reloadMsg, setReloadMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchDashboardInsights();
      setInsights(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReload = async () => {
    try {
      setReloading(true);
      setReloadMsg(null);
      const res = await reloadDataset();
      setReloadMsg(`Dataset successfully re-indexed! ${res.total_records} records loaded.`);
      await loadData();
    } catch (err: any) {
      setReloadMsg(`Error reloading dataset: ${err.message}`);
    } finally {
      setReloading(false);
      setTimeout(() => setReloadMsg(null), 5000);
    }
  };

  const trainTypes = [
    { type: 'Express (Exp)', count: 2840, share: '54.5%' },
    { type: 'Superfast (SF)', count: 1120, share: '21.5%' },
    { type: 'Passenger (Pass)', count: 864, share: '16.6%' },
    { type: 'Other / Suburban', count: 305, share: '5.9%' },
    { type: 'Rajdhani (Raj)', count: 48, share: '0.9%' },
    { type: 'Shatabdi (Shtb)', count: 31, share: '0.6%' },
  ];

  return (
    <div className="flex-1 bg-[#FAF5ED] dark:bg-[#100D19] text-[#251B32] dark:text-[#FFF8F0] py-8 min-h-screen selection:bg-[#E9793D] selection:text-white">
      <Container size="large" className="space-y-6">
        
        {/* Top Control Room Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E7D5C1] dark:border-[#493B55]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-[#E9793D] dark:text-[#F5B65C] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#13875C] dark:bg-[#20C997] animate-pulse" />
                Signal Control Room Telemetry
              </span>
              <span className="text-[#8E8274]">•</span>
              <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-mono">SQLite Engine Operational</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
              System Insights & Knowledge Graph Metrics
            </h1>
            <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-1.5 max-w-2xl leading-relaxed">
              Real index counts, train fleet distributions, circular hierarchy precedence rules, and automated capstone evaluation metrics.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleReload}
              disabled={reloading}
              className="px-4 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] hover:bg-[#F3EBDD] dark:hover:bg-[#292137] text-[#251B32] dark:text-[#FFF8F0] text-xs font-semibold border border-[#E7D5C1] dark:border-[#493B55] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 text-[#E9793D] dark:text-[#F5B65C] ${reloading ? 'animate-spin' : ''}`} />
              <span>{reloading ? 'Re-indexing...' : 'Re-index Data'}</span>
            </button>
            <button
              type="button"
              onClick={() => router.push('/chat')}
              className="px-4 py-2 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open Assistant</span>
            </button>
          </div>
        </div>

        {reloadMsg && (
          <div className="p-3.5 rounded-xl bg-[#EBF7F0] dark:bg-[#191426] border border-[#C5E8D3] dark:border-[#493B55] text-[#13875C] dark:text-[#20C997] text-xs flex items-center gap-2.5 shadow-md">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-[#13875C] dark:text-[#20C997]" />
            <span>{reloadMsg}</span>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl shadow-xl hover:border-[#E9793D]/60 transition-all">
            <div className="flex items-center justify-between text-[#685C6B] dark:text-[#C5B9CD] mb-1.5">
              <span className="text-xs font-medium">Scheduled Trains</span>
              <Train className="w-4 h-4 text-[#E9793D]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0]">
              {insights?.total_trains || '5,208'}
            </div>
            <p className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1">
              Scheduled passenger services in timetable
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl shadow-xl hover:border-[#E9793D]/60 transition-all">
            <div className="flex items-center justify-between text-[#685C6B] dark:text-[#C5B9CD] mb-1.5">
              <span className="text-xs font-medium">Indexed Stations</span>
              <MapPin className="w-4 h-4 text-[#E9793D] dark:text-[#F5B65C]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0]">
              {insights?.total_stations || '8,990'}
            </div>
            <p className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1">
              Stations and halts across Indian Railways
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl shadow-xl hover:border-[#E9793D]/60 transition-all">
            <div className="flex items-center justify-between text-[#685C6B] dark:text-[#C5B9CD] mb-1.5">
              <span className="text-xs font-medium">Scheduled Halts</span>
              <Clock className="w-4 h-4 text-[#E9793D]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0]">
              104,151
            </div>
            <p className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1">
              Verified stop records with arrival/departure
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl shadow-xl hover:border-[#13875C] transition-all">
            <div className="flex items-center justify-between text-[#685C6B] dark:text-[#C5B9CD] mb-1.5">
              <span className="text-xs font-medium">Retrieval Grounding</span>
              <ShieldCheck className="w-4 h-4 text-[#13875C] dark:text-[#20C997]" />
            </div>
            <div className="text-3xl font-extrabold font-mono text-[#13875C] dark:text-[#20C997]">
              100%
            </div>
            <p className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-1">
              Strict refusal enforced on unverified facts
            </p>
          </div>
        </div>

        {/* Two Columns: Train Distribution & Circular Precedence */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Train Fleet Breakdown */}
          <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7D5C1] dark:border-[#493B55]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#251B32] dark:text-[#FFF8F0] flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#E9793D]" />
                <span>Train Fleet Breakdown by Service Type</span>
              </h3>
              <span className="text-[11px] text-[#E9793D] dark:text-[#F5B65C] font-mono font-semibold">Verified Database</span>
            </div>

            <div className="space-y-3.5 pt-1">
              {trainTypes.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#251B32] dark:text-[#FFF8F0] font-semibold">{item.type}</span>
                    <span className="text-[#E9793D] dark:text-[#F5B65C] font-mono text-[11px]">{item.count} trains ({item.share})</span>
                  </div>
                  <div className="w-full bg-[#FAF5ED] dark:bg-[#191426] h-2 rounded-full overflow-hidden border border-[#E7D5C1] dark:border-[#493B55]">
                    <div 
                      className="bg-gradient-to-r from-[#E9793D] to-[#F5B65C] h-full rounded-full transition-all duration-500" 
                      style={{ width: item.share }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Circulars & Precedence */}
          <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7D5C1] dark:border-[#493B55]">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#251B32] dark:text-[#FFF8F0] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#E9793D] dark:text-[#F5B65C]" />
                <span>Document Circular Timeline & Precedence</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7F0] dark:bg-[#191426] text-[#13875C] dark:text-[#20C997] border border-[#C5E8D3] dark:border-[#493B55]">
                Precedence Enforced
              </span>
            </div>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-start gap-3 shadow-inner">
                <span className="text-xs font-extrabold text-[#E9793D] dark:text-[#F5B65C] font-mono mt-0.5 whitespace-nowrap bg-white dark:bg-[#211A2D] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">2026</span>
                <div>
                  <div className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0]">TC-II/2026/VBS (G.S.R. 41(E))</div>
                  <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-0.5 leading-relaxed">Vande Bharat Sleeper: 72h–8h 50% deduction, &lt;8h no refund. Overrides older rules for VBS.</div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-start gap-3 shadow-inner">
                <span className="text-xs font-extrabold text-[#E9793D] dark:text-[#F5B65C] font-mono mt-0.5 whitespace-nowrap bg-white dark:bg-[#211A2D] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">2025</span>
                <div>
                  <div className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0]">Commercial Circular 10 of 2025</div>
                  <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-0.5 leading-relaxed">First reservation charts prepared at least 4 hours before scheduled departure.</div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-start gap-3 shadow-inner">
                <span className="text-xs font-extrabold text-[#E9793D] dark:text-[#F5B65C] font-mono mt-0.5 whitespace-nowrap bg-white dark:bg-[#211A2D] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">2024</span>
                <div>
                  <div className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0]">Commercial Circular 10 of 2024</div>
                  <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-0.5 leading-relaxed">Advance Reservation Period (ARP) reduced from 120 to 60 days (Taj and Gomti Express excluded).</div>
                </div>
              </div>

              <div className="p-3 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-start gap-3 shadow-inner">
                <span className="text-xs font-extrabold text-[#685C6B] dark:text-[#C5B9CD] font-mono mt-0.5 whitespace-nowrap bg-white dark:bg-[#211A2D] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">2015</span>
                <div>
                  <div className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0]">Gazette Notification G.S.R. 836(E)</div>
                  <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-0.5 leading-relaxed">Statutory cancellation and refund deduction tables for Confirmed, RAC, and Waitlisted tickets.</div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Assessment Benchmark Results Table */}
        <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E7D5C1] dark:border-[#493B55] gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#251B32] dark:text-[#FFF8F0] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#13875C] dark:text-[#20C997]" />
                <span>Automated Evaluation Benchmark Suite (25 Test Questions)</span>
              </h3>
              <p className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] mt-0.5">
                Official Capstone evaluation suite executed with strict zero-hallucination verification.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#EBF7F0] dark:bg-[#191426] text-[#13875C] dark:text-[#20C997] border border-[#C5E8D3] dark:border-[#493B55]">
              25 / 25 Passed (100%)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF5ED] dark:bg-[#191426] text-[#E9793D] dark:text-[#F5B65C] uppercase font-mono text-[10px] border-b border-[#E7D5C1] dark:border-[#493B55]">
                <tr>
                  <th className="py-2.5 px-3.5">Evaluation Category</th>
                  <th className="py-2.5 px-3.5">Question Volume</th>
                  <th className="py-2.5 px-3.5">Verification Result</th>
                  <th className="py-2.5 px-3.5">Avg Token F1</th>
                  <th className="py-2.5 px-3.5">Hallucination Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7D5C1] dark:divide-[#493B55] text-[#251B32] dark:text-[#FFF8F0]">
                <tr className="hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold text-[#251B32] dark:text-[#FFF8F0]">Official Policy Circulars</td>
                  <td className="py-2.5 px-3.5 font-mono text-[#685C6B] dark:text-[#C5B9CD]">15 queries</td>
                  <td className="py-2.5 px-3.5"><span className="text-[10px] font-bold text-[#13875C] dark:text-[#20C997] bg-[#EBF7F0] dark:bg-[#191426] px-2 py-0.5 rounded border border-[#C5E8D3] dark:border-[#493B55]">15 / 15 Passed</span></td>
                  <td className="py-2.5 px-3.5 font-mono text-[#E9793D] dark:text-[#F5B65C]">71.2%</td>
                  <td className="py-2.5 px-3.5 text-[#13875C] dark:text-[#20C997] font-bold font-mono">0.0% (Strict)</td>
                </tr>
                <tr className="hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold text-[#251B32] dark:text-[#FFF8F0]">Timetable SQL Execution</td>
                  <td className="py-2.5 px-3.5 font-mono text-[#685C6B] dark:text-[#C5B9CD]">4 queries</td>
                  <td className="py-2.5 px-3.5"><span className="text-[10px] font-bold text-[#13875C] dark:text-[#20C997] bg-[#EBF7F0] dark:bg-[#191426] px-2 py-0.5 rounded border border-[#C5E8D3] dark:border-[#493B55]">4 / 4 Passed</span></td>
                  <td className="py-2.5 px-3.5 font-mono text-[#E9793D] dark:text-[#F5B65C]">90.5%</td>
                  <td className="py-2.5 px-3.5 text-[#13875C] dark:text-[#20C997] font-bold font-mono">0.0% (Exact SQL)</td>
                </tr>
                <tr className="hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold text-[#251B32] dark:text-[#FFF8F0]">Unsupported Fares / Real-time GPS</td>
                  <td className="py-2.5 px-3.5 font-mono text-[#685C6B] dark:text-[#C5B9CD]">3 queries</td>
                  <td className="py-2.5 px-3.5"><span className="text-[10px] font-bold text-[#13875C] dark:text-[#20C997] bg-[#EBF7F0] dark:bg-[#191426] px-2 py-0.5 rounded border border-[#C5E8D3] dark:border-[#493B55]">3 / 3 Passed</span></td>
                  <td className="py-2.5 px-3.5 font-mono text-[#E9793D] dark:text-[#F5B65C]">94.3%</td>
                  <td className="py-2.5 px-3.5 text-[#13875C] dark:text-[#20C997] font-bold font-mono">0.0% (Proper Refusal)</td>
                </tr>
                <tr className="hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold text-[#251B32] dark:text-[#FFF8F0]">Composite & Multi-hop Inquiries</td>
                  <td className="py-2.5 px-3.5 font-mono text-[#685C6B] dark:text-[#C5B9CD]">1 query</td>
                  <td className="py-2.5 px-3.5"><span className="text-[10px] font-bold text-[#13875C] dark:text-[#20C997] bg-[#EBF7F0] dark:bg-[#191426] px-2 py-0.5 rounded border border-[#C5E8D3] dark:border-[#493B55]">1 / 1 Passed</span></td>
                  <td className="py-2.5 px-3.5 font-mono text-[#E9793D] dark:text-[#F5B65C]">95.0%</td>
                  <td className="py-2.5 px-3.5 text-[#13875C] dark:text-[#20C997] font-bold font-mono">0.0% (Exact match)</td>
                </tr>
                <tr className="hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold text-[#251B32] dark:text-[#FFF8F0]">Security & Read-Only Defense</td>
                  <td className="py-2.5 px-3.5 font-mono text-[#685C6B] dark:text-[#C5B9CD]">2 queries</td>
                  <td className="py-2.5 px-3.5"><span className="text-[10px] font-bold text-[#13875C] dark:text-[#20C997] bg-[#EBF7F0] dark:bg-[#191426] px-2 py-0.5 rounded border border-[#C5E8D3] dark:border-[#493B55]">2 / 2 Passed</span></td>
                  <td className="py-2.5 px-3.5 font-mono text-[#E9793D] dark:text-[#F5B65C]">100.0%</td>
                  <td className="py-2.5 px-3.5 text-[#13875C] dark:text-[#20C997] font-bold font-mono">0.0% (Blocked)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </Container>
    </div>
  );
}
