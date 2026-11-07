'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  ShieldCheck, 
  Sun, 
  Moon,
  ChevronLeft
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token.trim()) {
      setErrorMessage('Please provide the cryptographic recovery token.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter both carefully.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({
        token: token.trim(),
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed. The token may be expired or invalid.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#FAF5ED] dark:bg-[#120F1D] text-[#302638] dark:text-[#F8EFE4] transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 50% 20%, #201733 0%, #120F1D 80%)'
              : 'radial-gradient(ellipse at 50% 20%, #FBE9D0 0%, #FAF5ED 80%)',
          }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#E5D5C4] dark:border-[#493B50] bg-white dark:bg-[#171322] shadow-sm">
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
            <span className="font-extrabold text-sm tracking-tight text-[#302638] dark:text-[#F8EFE4] group-hover:text-[#E98245] transition-colors">
              RailAssist AI
            </span>
            <span className="block text-[10px] text-[#655967] dark:text-[#C0B2C3]">
              Railway Passenger Help Desk
            </span>
          </div>
        </Link>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-white/80 dark:bg-[#1C1427]/80 backdrop-blur-md border border-[#E5D5C4] dark:border-[#493B50] text-[#302638] dark:text-[#F8EFE4] hover:border-[#E98245] transition-all cursor-pointer shadow-sm"
          aria-label="Toggle theme"
          title={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-purple-700" />}
        </button>
      </header>

      {/* Main Panel */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md bg-white/95 dark:bg-[#1D162A]/95 backdrop-blur-xl rounded-3xl border border-[#E5D5C4] dark:border-[#493B50] shadow-2xl p-6 sm:p-8 relative"
        >
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FAF5ED] dark:bg-[#120F1D] border border-[#E5D5C4] dark:border-[#493B50] text-[10px] font-mono font-bold tracking-wider uppercase text-[#E98245] dark:text-[#F6C176] shadow-sm flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#E98245]" />
            <span>RESET VERIFIED CREDENTIALS</span>
          </div>

          {!isSuccess ? (
            <>
              <div className="text-center mt-3 mb-6">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#302638] dark:text-[#F8EFE4] tracking-tight">
                  Set New Password
                </h1>
                <p className="text-xs sm:text-sm text-[#655967] dark:text-[#C0B2C3] mt-1.5">
                  Enter your verified cryptographic token and choose a new secure password.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-800 dark:text-rose-300 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Token */}
                <div>
                  <label 
                    htmlFor="reset-token"
                    className="block text-xs font-bold text-[#302638] dark:text-[#F8EFE4] mb-1.5"
                  >
                    Recovery Token
                  </label>
                  <input
                    id="reset-token"
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Paste your 32-character token"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#171322] border border-[#E5D5C4] dark:border-[#493B50] text-[#302638] dark:text-[#F8EFE4] font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#E98245] transition-all"
                  />
                </div>

                {/* New Password */}
                <div>
                  <label 
                    htmlFor="reset-new-password"
                    className="block text-xs font-bold text-[#302638] dark:text-[#F8EFE4] mb-1.5"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#655967] dark:text-[#A39687]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-new-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#171322] border border-[#E5D5C4] dark:border-[#493B50] text-[#302638] dark:text-[#F8EFE4] placeholder-[#8E8274] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E98245] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#655967] dark:text-[#A39687] hover:text-[#302638] dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label 
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-bold text-[#302638] dark:text-[#F8EFE4] mb-1.5"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#655967] dark:text-[#A39687]">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#171322] border border-[#E5D5C4] dark:border-[#493B50] text-[#302638] dark:text-[#F8EFE4] placeholder-[#8E8274] text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E98245] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#655967] dark:text-[#A39687] hover:text-[#302638] dark:hover:text-white cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E98245] to-[#D96528] hover:from-[#D96528] hover:to-[#C2561E] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center mt-3 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-extrabold text-[#302638] dark:text-[#F8EFE4]">
                Password Updated!
              </h2>
              <p className="text-xs text-[#655967] dark:text-[#C0B2C3] leading-relaxed">
                Your passenger account credentials have been securely updated. You can now sign in with your new password.
              </p>
              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3 px-4 rounded-xl bg-[#E98245] hover:bg-[#D96528] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>Sign In Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          <div className="mt-6 pt-5 border-t border-[#E5D5C4] dark:border-[#38284F] text-center text-xs">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 font-bold text-[#655967] dark:text-[#C0B2C3] hover:text-[#302638] dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 text-center text-[11px] text-[#655967] dark:text-[#A39687]">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>PBKDF2 Hashed Security &bull; Token Invalidation Guaranteed</span>
        </div>
      </footer>

    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs font-mono">Loading recovery console...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

