'use client';

import React from 'react';

interface JourneyMilestoneProps {
  stationCode: string;
  stationName: string;
  milestoneTitle: string;
  milestoneSubtitle?: string;
  statusText?: string;
  isLast?: boolean;
}

export function JourneyMilestone({
  stationCode,
  stationName,
  milestoneTitle,
  milestoneSubtitle,
  statusText = 'CLEAR SIGNAL',
  isLast = false,
}: JourneyMilestoneProps) {
  return (
    <div className="relative flex flex-col items-center justify-center my-6 select-none">
      
      {/* 1. Upper Railway Track Connection */}
      <div className="w-12 h-8 flex flex-col items-center justify-between opacity-80">
        <div className="w-full flex justify-between px-2">
          <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
          <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
        </div>
        <div className="w-10 h-1 bg-[#785E4A] dark:bg-[#292137] rounded shadow-sm" />
        <div className="w-full flex justify-between px-2">
          <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
          <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
        </div>
      </div>

      {/* 2. Official Railway Station Board Pill */}
      <div className="relative z-10 flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-[#191426] border-2 border-[#E7D5C1] dark:border-[#493B55] shadow-md dark:shadow-xl text-[#251B32] dark:text-[#FFF8F0] transition-colors">
        {/* Signal Light Indicator */}
        <div className="relative flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-[#20C997] animate-pulse" />
          <span className="absolute w-4 h-4 rounded-full bg-emerald-500/30 dark:bg-[#20C997]/30 animate-ping" />
        </div>

        {/* Station Identification */}
        <div className="flex items-baseline gap-2">
          <span className="px-2 py-0.5 rounded bg-[#FAF5ED] dark:bg-[#292137] border border-[#E7D5C1] dark:border-[#493B55] font-mono text-xs font-bold text-[#E9793D] dark:text-[#F5B65C]">
            {stationCode}
          </span>
          <span className="text-xs font-extrabold tracking-wider uppercase text-[#251B32] dark:text-[#FFF8F0]">
            {stationName}
          </span>
        </div>

        <div className="hidden sm:block h-3.5 w-px bg-[#E7D5C1] dark:bg-[#493B55]" />

        {/* Milestone Purpose */}
        <div className="text-[11px] text-[#685C6B] dark:text-[#C5B9CD] font-medium hidden sm:flex items-center gap-1.5">
          <span className="text-[#251B32] dark:text-[#FFF8F0] font-bold">{milestoneTitle}</span>
          {milestoneSubtitle && (
            <span className="text-[#685C6B] dark:text-[#C5B9CD]">&bull; {milestoneSubtitle}</span>
          )}
        </div>

        {/* Telemetry pill */}
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#DCFCE7] dark:bg-[#191426] text-[#13875C] dark:text-[#20C997] border border-[#86EFAC] dark:border-[#20C997]/40 font-bold hidden md:inline-block">
          {statusText}
        </span>
      </div>

      {/* 3. Lower Railway Track Connection */}
      {!isLast && (
        <div className="w-12 h-8 flex flex-col items-center justify-between opacity-80">
          <div className="w-full flex justify-between px-2">
            <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
            <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
          </div>
          <div className="w-10 h-1 bg-[#785E4A] dark:bg-[#292137] rounded shadow-sm" />
          <div className="w-full flex justify-between px-2">
            <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
            <div className="w-1 h-full bg-[#B3A090] dark:bg-[#493B55]" />
          </div>
        </div>
      )}

    </div>
  );
}
