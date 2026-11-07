'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Train, 
  Sun, 
  Moon, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!emailOrUsername.trim()) {
      setErrorMessage('Please enter your registered email address or username.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your account password.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await login(emailOrUsername.trim(), password, rememberMe);
      setSuccessMessage(`Welcome back, ${user.full_name}! Boarding your platform...`);
      setTimeout(() => {
        router.push('/');
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillQuickDemo = () => {
    setEmailOrUsername('passenger@railassist.ai');
    setPassword('RailSecure@2026');
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#FAF5ED] dark:bg-[#100D19] text-[#251B32] dark:text-[#FFF8F0] transition-colors duration-500">
      
      {/* ======================================================== */}
      {/* 1. SCENIC RAILWAY STATION BACKGROUND                     */}
      {/* ======================================================== */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Sky Gradient */}
        <div 
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 50% 20%, #191426 0%, #100D19 80%)'
              : 'radial-gradient(ellipse at 50% 20%, #FBE9D0 0%, #FAF5ED 80%)',
          }}
        />

        {/* Station Grand Windows with Train Visible Outside */}
        <div className="absolute inset-x-0 top-0 h-96 opacity-40 dark:opacity-25 flex justify-center gap-6 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-44 md:w-56 h-80 rounded-t-full border-4 border-[#E7D5C1] dark:border-[#493B55] bg-gradient-to-b from-sky-200/20 dark:from-indigo-900/20 to-transparent relative overflow-hidden"
            >
              {/* Silhouette of Moving Scenery Outside */}
              <div className="absolute bottom-6 inset-x-0 h-10 bg-[#B8A38D] dark:bg-[#191426] rounded-t-full" />
              {/* Distant Train Carriage Gliding By */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{ duration: 14 + (i * 2), repeat: Infinity, ease: 'linear' }}
                className="absolute bottom-8 left-0 w-28 h-6 bg-[#E9793D]/80 dark:bg-[#F18445]/50 rounded-sm flex items-center justify-around px-1"
              >
                <div className="w-2.5 h-2 bg-amber-100 rounded-xs" />
                <div className="w-2.5 h-2 bg-amber-100 rounded-xs" />
                <div className="w-2.5 h-2 bg-amber-100 rounded-xs" />
              </motion.div>
            </div>
          ))}
        </div>

        {/* Station Platform Lighting Glows */}
        <div className="absolute top-1/4 left-1/6 w-72 h-72 rounded-full bg-[#E9793D]/10 dark:bg-[#F18445]/5 blur-3xl" />
        <div className="absolute top-1/3 right-1/6 w-80 h-80 rounded-full bg-amber-200/20 dark:bg-purple-900/10 blur-3xl" />

        {/* Subtle Platform Silhouette at Bottom */}
        <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[#EADBCC] dark:from-[#100D19] to-transparent" />
      </div>

      {/* ======================================================== */}
      {/* 2. TOP BAR                                               */}
      {/* ======================================================== */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2.5 group cursor-pointer"
          title="Return to RailAssist AI Homepage"
        >
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E7D5C1] dark:border-[#493B55] bg-white dark:bg-[#191426] shadow-sm">
            <Image
              src="/railassist-logo.png"
              alt="RailAssist AI"
              width={32}
              height={32}
              className="object-cover"
              priority
            />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-[#251B32] dark:text-[#FFF8F0] group-hover:text-[#E9793D] dark:group-hover:text-[#F18445] transition-colors">
              RailAssist AI
            </span>
            <span className="block text-[10px] text-[#685C6B] dark:text-[#C5B9CD]">
              Railway Passenger Help Desk
            </span>
          </div>
        </Link>

        {/* Theme & Welcome Links */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/welcome"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-[#191426]/80 backdrop-blur-md border border-[#E7D5C1] dark:border-[#493B55] text-xs font-semibold text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-white hover:border-[#E9793D] dark:hover:border-[#F18445] transition-all cursor-pointer shadow-sm"
          >
            <Train className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F18445]" />
            <span>View Welcome Intro</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-white/80 dark:bg-[#191426]/80 backdrop-blur-md border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] hover:border-[#E9793D] dark:hover:border-[#F18445] transition-all cursor-pointer shadow-sm"
            aria-label="Toggle theme"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-700" />}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 3. LOGIN CARD PANEL                                      */}
      {/* ======================================================== */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/95 dark:bg-[#211A2D]/95 backdrop-blur-xl rounded-3xl border border-[#E7D5C1] dark:border-[#493B55] shadow-2xl p-6 sm:p-8 relative"
        >
          {/* Subtle Decorative Ticket Notch */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FAF5ED] dark:bg-[#100D19] border border-[#E7D5C1] dark:border-[#493B55] text-[10px] font-mono font-bold tracking-wider uppercase text-[#E9793D] dark:text-[#F5B65C] shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#13875C] dark:bg-[#20C997] animate-pulse" />
            <span>STATION CONCOURSE CHECK-IN</span>
          </div>

          {/* Heading */}
          <div className="text-center mt-3 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
              Welcome Back!
            </h1>
            <p className="text-xs sm:text-sm text-[#685C6B] dark:text-[#C5B9CD] mt-1.5">
              Sign in to continue your journey with RailAssist AI.
            </p>
          </div>

          {/* Alerts */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email or Username */}
            <div>
              <label 
                htmlFor="login-email"
                className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5"
              >
                Email Address or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="text"
                  autoComplete="email"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] placeholder-[#685C6B]/70 dark:placeholder-[#C5B9CD]/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E9793D] dark:focus:ring-[#F18445] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="login-password"
                  className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0]"
                >
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-[#E9793D] hover:text-[#D46A34] dark:text-[#F5B65C] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] placeholder-[#685C6B]/70 dark:placeholder-[#C5B9CD]/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E9793D] dark:focus:ring-[#F18445] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-white cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E7D5C1] dark:border-[#493B55] text-[#E9793D] focus:ring-[#E9793D] cursor-pointer"
                />
                <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD]">
                  Remember me for 7 days
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E9793D] hover:bg-[#D46A34] dark:bg-[#F18445] dark:hover:bg-[#E9793D] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group transform active:translate-y-0"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="mt-5 p-3 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F18445]" />
              <span className="text-[#685C6B] dark:text-[#C5B9CD]">Need demo credentials?</span>
            </div>
            <button
              type="button"
              onClick={fillQuickDemo}
              className="text-xs font-bold text-[#E9793D] hover:text-[#D46A34] dark:text-[#F5B65C] cursor-pointer"
            >
              Fill Sample
            </button>
          </div>

          {/* Create Account Link */}
          <div className="mt-6 pt-5 border-t border-[#E7D5C1] dark:border-[#493B55] text-center text-xs text-[#685C6B] dark:text-[#C5B9CD]">
            <span>Don&apos;t have an account? </span>
            <Link
              href="/register"
              className="font-bold text-[#E9793D] hover:text-[#D46A34] dark:text-[#F5B65C] transition-colors"
            >
              Create New Account &rarr;
            </Link>
          </div>

        </motion.div>
      </main>

      {/* ======================================================== */}
      {/* 4. FOOTER NOTE                                           */}
      {/* ======================================================== */}
      <footer className="relative z-20 py-4 text-center text-[11px] text-[#655967] dark:text-[#A39687]">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Encrypted with PBKDF2-HMAC-SHA256 &bull; Session Privacy Protected</span>
        </div>
      </footer>

    </div>
  );
}

