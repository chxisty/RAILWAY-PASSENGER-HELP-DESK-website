import React, { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Container } from '@/primitives/Container';
import { Badge } from '@/primitives/Badge';
import { Database, Activity, ShieldCheck } from 'lucide-react';

export interface DashboardLayoutProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  children: ReactNode;
  actions?: ReactNode;
}

export function DashboardLayout({
  title,
  subtitle,
  badgeText = 'System Metrics',
  children,
  actions,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#070F1E] text-slate-100 font-sans selection:bg-sky-500 selection:text-white">
      <Navbar />

      {/* Dashboard Sub-Header Banner */}
      <section className="bg-gradient-to-b from-[#0B192C] to-[#070F1E] border-b border-slate-800/80 pt-8 pb-8">
        <Container size="large">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <Badge variant="accent" size="small">
                  {badgeText}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Official 2016 Snapshot & 2026 Circulars
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
          </div>
        </Container>
      </section>

      {/* Main Dashboard Content */}
      <main className="flex-1 py-8">
        <Container size="large">{children}</Container>
      </main>

      <Footer />
    </div>
  );
}

export default DashboardLayout;

