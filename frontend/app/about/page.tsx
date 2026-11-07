'use client';

import React from 'react';
import Image from 'next/image';
import { 
  HelpCircle, 
  ShieldCheck, 
  Database, 
  Cpu, 
  CheckCircle2, 
  PhoneCall, 
  Train, 
  FileText,
  Compass,
  Sparkles
} from 'lucide-react';
import { Container } from '@/primitives/Container';
import { Badge } from '@/primitives/Badge';
import { Card } from '@/primitives/Card';

export default function AboutPage() {
  return (
    <div className="flex-1 bg-[#FAF5ED] dark:bg-[#100D19] text-[#251B32] dark:text-[#FFF8F0] py-8 min-h-screen selection:bg-[#E9793D] selection:text-white">
      <Container size="small" className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-[#E7D5C1] dark:border-[#493B55]">
          <div className="w-14 h-14 rounded-full overflow-hidden border border-[#E7D5C1] dark:border-[#493B55] bg-[#FAF5ED] dark:bg-[#191426] shrink-0 shadow-lg">
            <Image
              src="/railassist-logo.png"
              alt="RailAssist AI Logo"
              width={56}
              height={56}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7F0] dark:bg-[#191426] text-[#13875C] dark:text-[#20C997] border border-[#C5E8D3] dark:border-[#493B55]">
                ARCHITECTURE SPECIFICATION
              </span>
              <span className="text-[#8E8274]">•</span>
              <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] font-mono">Module 2 Capstone</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
              About RailAssist AI
            </h1>
            <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] mt-1 leading-relaxed">
              Official Indian Railways passenger help desk engineered according to the GenAI Nexus Module 2 Capstone Brief. Designed to provide passengers with reliable, grounded, and prompt assistance throughout their journey.
            </p>
          </div>
        </div>

        {/* Scenic Editorial Railway Visual Banner */}
        <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border border-[#E7D5C1] dark:border-[#493B55] shadow-xl">
          <Image
            src="/mountain-bridge.jpg"
            alt="Scenic Railway Bridge Crossing"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 banner-gradient" />
          <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs">
            <span className="font-mono banner-title font-bold flex items-center gap-2 text-white">
              <Train className="w-4 h-4 text-[#E9793D] dark:text-[#F18445]" />
              <span>Every Journey Has a Story &bull; Indian Railways Technology</span>
            </span>
            <span className="banner-counter text-[11px] font-mono hidden sm:inline px-2.5 py-1 rounded-lg font-bold text-white bg-black/40 backdrop-blur-md">
              Scenic Alpine Viaduct Corridor
            </span>
          </div>
        </div>

        {/* 1. What RailAssist AI Does */}
        <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7D5C1] dark:border-[#493B55]">
            <Train className="w-4 h-4 text-[#E9793D] dark:text-[#F18445]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#251B32] dark:text-[#FFF8F0]">
              1. Platform Scope & Purpose
            </h2>
          </div>
          <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
            RailAssist AI bridges the gap between massive railway documentation and immediate passenger inquiries. Instead of browsing complex multi-page PDF timetables or dense railway circulars, passengers can query timetables, route directions, and policies with verified, source-backed answers.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] text-xs text-[#685C6B] dark:text-[#C5B9CD] shadow-inner">
              <strong className="text-[#251B32] dark:text-[#FFF8F0] block mb-1">Train Timetables & Schedules:</strong>
              Check train departure, arrival, duration, classes, and stopping stations from the SQLite database.
            </div>
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] text-xs text-[#685C6B] dark:text-[#C5B9CD] shadow-inner">
              <strong className="text-[#251B32] dark:text-[#FFF8F0] block mb-1">Route Direction Verification:</strong>
              Search trains between stations with mathematical sequence checks ensuring destination occurs after origin.
            </div>
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] text-xs text-[#685C6B] dark:text-[#C5B9CD] shadow-inner">
              <strong className="text-[#251B32] dark:text-[#FFF8F0] block mb-1">Ticket & Tatkal Policies:</strong>
              Understand cancellation deductions, Tatkal booking opening hours, and waitlist refunds from 2026 circulars.
            </div>
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] text-xs text-[#685C6B] dark:text-[#C5B9CD] shadow-inner">
              <strong className="text-[#251B32] dark:text-[#FFF8F0] block mb-1">Emergency Assistance:</strong>
              Direct access to the 24x7 Rail Madad 139 hotline, security procedures, and on-train medical assistance.
            </div>
          </div>
        </div>

        {/* 2. RAG Architecture & Zero Hallucination */}
        <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7D5C1] dark:border-[#493B55]">
            <Cpu className="w-4 h-4 text-[#E9793D] dark:text-[#F5B65C]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#251B32] dark:text-[#FFF8F0]">
              2. Grounded RAG & Anti-Hallucination Boundaries
            </h2>
          </div>
          <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
            Unlike unconstrained conversational AI models that frequently hallucinate ticket fares or invent non-existent train schedules, RailAssist AI enforces strict information retrieval principles:
          </p>
          <ul className="space-y-2.5 text-xs text-[#685C6B] dark:text-[#C5B9CD] pt-1">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#13875C] dark:text-[#20C997] mt-0.5 shrink-0" />
              <span><strong className="text-[#251B32] dark:text-[#FFF8F0]">Circular Precedence Hierarchy:</strong> When policy circulars conflict, newer Railway Board orders (2024, 2025, 2026) systematically supersede older rules (2015).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#13875C] dark:text-[#20C997] mt-0.5 shrink-0" />
              <span><strong className="text-[#251B32] dark:text-[#FFF8F0]">OCR on Scanned Government Circulars:</strong> RapidOCR with ONNX runtime recovers 100% of text from scanned Ministry of Railways Gazette notifications.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#13875C] dark:text-[#20C997] mt-0.5 shrink-0" />
              <span><strong className="text-[#251B32] dark:text-[#FFF8F0]">Read-Only SQLite Timetable Execution:</strong> Train schedule queries are executed via read-only SQL joins on the <code>stops</code> view with verified sequence ordering.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#13875C] dark:text-[#20C997] mt-0.5 shrink-0" />
              <span><strong className="text-[#251B32] dark:text-[#FFF8F0]">Explicit Refusal Boundary:</strong> When a query requests information outside the assessment dataset (e.g. real-time dynamic GPS delays or unlisted fares), the system strictly replies "I don't know".</span>
            </li>
          </ul>
        </div>

        {/* 3. Official Emergency Helplines Directory */}
        <div className="bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] rounded-2xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7D5C1] dark:border-[#493B55]">
            <PhoneCall className="w-4 h-4 text-[#E9793D] dark:text-[#F18445]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#251B32] dark:text-[#FFF8F0]">
              3. Official Emergency & Passenger Helpline Directory
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between shadow-inner">
              <div>
                <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">Rail Madad (24x7 Care)</div>
                <div className="text-xl font-extrabold font-mono text-[#E9793D] dark:text-[#F5B65C]">139</div>
              </div>
              <a href="tel:139" className="px-4 py-2 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] text-white text-xs font-bold shadow-md transition-colors">
                Call 139
              </a>
            </div>
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between shadow-inner">
              <div>
                <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">RPF Security Helpline</div>
                <div className="text-xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0]">182</div>
              </div>
              <a href="tel:182" className="px-4 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#251B32] dark:text-[#FFF8F0] text-xs font-bold border border-[#E7D5C1] dark:border-[#493B55] transition-colors">
                Call 182
              </a>
            </div>
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between shadow-inner">
              <div>
                <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">National Emergency Number</div>
                <div className="text-xl font-extrabold font-mono text-[#251B32] dark:text-[#FFF8F0]">112</div>
              </div>
              <a href="tel:112" className="px-4 py-2 rounded-xl bg-[#FAF5ED] dark:bg-[#292137] hover:bg-[#F3EBDD] dark:hover:bg-[#362B46] text-[#251B32] dark:text-[#FFF8F0] text-xs font-bold border border-[#E7D5C1] dark:border-[#493B55] transition-colors">
                Call 112
              </a>
            </div>
            <div className="p-3.5 bg-[#FAF5ED] dark:bg-[#191426] rounded-xl border border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between shadow-inner">
              <div>
                <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">On-train Medical Assistance</div>
                <div className="text-xs font-bold text-[#13875C] dark:text-[#20C997]">Alert TTE / Guard</div>
              </div>
              <span className="text-[11px] font-mono text-[#E9793D] dark:text-[#F5B65C] bg-white dark:bg-[#211A2D] px-2.5 py-1 rounded-lg border border-[#E7D5C1] dark:border-[#493B55]">
                Immediate Action
              </span>
            </div>
          </div>
        </div>

      </Container>
    </div>
  );
}
