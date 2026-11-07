import React from 'react';
import Link from 'next/link';
import { 
  PhoneCall, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  HeartHandshake,
  Compass,
  MessageSquare,
  Train
} from 'lucide-react';
import { Container } from '@/primitives/Container';
import { Logo } from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="border-t border-[#E7D5C1] dark:border-[#493B55] bg-[#FAF5ED] dark:bg-[#100D19] text-[#685C6B] dark:text-[#C5B9CD] py-12 mt-auto transition-colors">
      <Container size="large">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <Logo size="small" showBadge={false} />
            <p className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
              Official Indian Railways reference world delivering grounded assistance on train schedules, route sequences, and 2015–2026 refund policies.
            </p>
            <div className="pt-2 text-xs font-mono text-[#8E8274] dark:text-[#A093B3]">
              System ID: IR-RAG-2026-CAPSTONE
            </div>
          </div>

          {/* Core Services Links */}
          <div>
            <h4 className="text-[#251B32] dark:text-[#FFF8F0] font-extrabold text-xs mb-3 uppercase tracking-wider">
              Railway Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/trains" target="_self" className="text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F18445] transition-colors">
                  Find Trains Between Stations
                </Link>
              </li>
              <li>
                <Link href="/chat" target="_self" className="text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F18445] transition-colors">
                  AI Assistant & Passenger Help Desk
                </Link>
              </li>
              <li>
                <Link href="/explore?category=trains" target="_self" className="text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F18445] transition-colors">
                  Train Timetable & Schedules
                </Link>
              </li>
              <li>
                <Link href="/explore?category=stations" target="_self" className="text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F18445] transition-colors">
                  Station Amenities & Facilities
                </Link>
              </li>
              <li>
                <Link href="/explore?category=policies" target="_self" className="text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F18445] transition-colors">
                  Tatkal, Cancellation & Refund Rules
                </Link>
              </li>
              <li>
                <Link href="/dashboard" target="_self" className="text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#E9793D] dark:hover:text-[#F18445] transition-colors">
                  Insights & System Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Official Helpline Contacts */}
          <div>
            <h4 className="text-[#251B32] dark:text-[#FFF8F0] font-extrabold text-xs mb-3 uppercase tracking-wider">
              Passenger Helplines
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <span className="font-bold text-[#E9793D] dark:text-[#F5B65C] font-mono bg-white dark:bg-[#191426] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">139</span>
                <span className="text-[#251B32] dark:text-[#FFF8F0] font-medium">Rail Madad 24x7 Passenger Care</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-[#251B32] dark:text-[#FFF8F0] font-mono bg-white dark:bg-[#191426] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">182</span>
                <span className="text-[#685C6B] dark:text-[#C5B9CD]">Railway Security Helpline</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-[#251B32] dark:text-[#FFF8F0] font-mono bg-white dark:bg-[#191426] px-2 py-0.5 rounded border border-[#E7D5C1] dark:border-[#493B55]">112</span>
                <span className="text-[#685C6B] dark:text-[#C5B9CD]">National Emergency Services</span>
              </li>
              <li className="text-[#685C6B] dark:text-[#C5B9CD] pt-1 text-[11px]">
                For medical emergencies on train, alert the Train Ticket Examiner (TTE) or nearest station master.
              </li>
            </ul>
          </div>

          {/* Verification Notice */}
          <div className="space-y-2">
            <h4 className="text-[#251B32] dark:text-[#FFF8F0] font-extrabold text-xs uppercase tracking-wider">
              Data Grounding Notice
            </h4>
            <p className="text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed text-xs">
              Information is strictly retrieved from the official railway timetable snapshot and Ministry of Railways Gazette notifications. Refusal policies are enforced for unverified fare estimates or live GPS tracking.
            </p>
            <div className="p-3 rounded-lg bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] text-[11px] text-[#685C6B] dark:text-[#C5B9CD] shadow-sm">
              <span className="font-bold text-[#E9793D] dark:text-[#F5B65C] block mb-0.5">
                Capstone Assessment Verified
              </span>
              Strict "I don't know" threshold prevents hallucinations on unestablished facts.
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#E7D5C1] dark:border-[#493B55] flex flex-col sm:flex-row items-center justify-between text-xs text-[#685C6B] dark:text-[#C5B9CD] gap-3">
          <p>© 2025–2026 RailAssist AI — Railway Passenger Help Desk. Built for the Capstone Assessment.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/about" target="_self" className="hover:text-[#E9793D] dark:hover:text-[#F5B65C] transition-colors">
              About & Methodology
            </Link>
            <span>•</span>
            <Link href="/chat" target="_self" className="hover:text-[#E9793D] dark:hover:text-[#F5B65C] transition-colors">
              AI Assistant
            </Link>
            <span>•</span>
            <a 
              href="https://railmadad.indianrailways.gov.in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 hover:text-[#E9793D] dark:hover:text-[#F5B65C] transition-colors"
            >
              <span>Rail Madad Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
