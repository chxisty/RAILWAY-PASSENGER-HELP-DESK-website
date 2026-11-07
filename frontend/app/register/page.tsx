'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck,
  Sun,
  Moon,
  Train
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Password strength calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: 'Not entered', color: 'bg-stone-300' };

    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak (8+ chars needed)', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Fair (add numbers/symbols)', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Good (almost there)', color: 'bg-emerald-400' };
      case 4:
        return { score: 4, label: 'Strong (excellent protection)', color: 'bg-emerald-600' };
      default:
        return { score: 0, label: 'Too short', color: 'bg-rose-500' };
    }
  }, [password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMessage('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter both carefully.');
      return;
    }

    if (!acceptTerms) {
      setErrorMessage('Please review and accept the Passenger Terms of Service and Privacy Policy to proceed.');
      return;
    }

    setIsLoading(true);
    try {
      const user = await register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
        phone: phone.trim() || undefined,
      });

      setSuccessMessage(`Account created successfully for ${user.full_name}! Preparing your passenger ticket...`);
      setTimeout(() => {
        router.push('/');
      }, 900);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. An account with this email may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#FAF5ED] dark:bg-[#100D19] text-[#251B32] dark:text-[#FFF8F0] transition-colors duration-500">
      
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            background: isDark
              ? 'radial-gradient(ellipse at 50% 20%, #191426 0%, #100D19 80%)'
              : 'radial-gradient(ellipse at 50% 20%, #FBE9D0 0%, #FAF5ED 80%)',
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#E9793D]/10 dark:bg-[#F18445]/5 blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 rounded-full bg-amber-100/30 dark:bg-purple-900/10 blur-3xl" />
      </div>

      {/* Top Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group cursor-pointer">
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

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/80 dark:bg-[#191426]/80 backdrop-blur-md border border-[#E7D5C1] dark:border-[#493B55] text-xs font-semibold text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-white hover:border-[#E9793D] dark:hover:border-[#F18445] transition-all cursor-pointer shadow-sm"
          >
            <span>Already registered? Sign In</span>
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

      {/* Register Card */}
      <main className="relative z-20 flex-1 flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-lg bg-white/95 dark:bg-[#211A2D]/95 backdrop-blur-xl rounded-3xl border border-[#E7D5C1] dark:border-[#493B55] shadow-2xl p-6 sm:p-8 relative"
        >
          {/* Badge */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#FAF5ED] dark:bg-[#100D19] border border-[#E7D5C1] dark:border-[#493B55] text-[10px] font-mono font-bold tracking-wider uppercase text-[#E9793D] dark:text-[#F5B65C] shadow-sm flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#13875C] dark:bg-[#20C997] animate-pulse" />
            <span>NEW PASSENGER REGISTRATION</span>
          </div>

          <div className="text-center mt-3 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#251B32] dark:text-[#FFF8F0] tracking-tight">
              Create Your Account
            </h1>
            <p className="text-xs sm:text-sm text-[#685C6B] dark:text-[#C5B9CD] mt-1.5">
              Join RailAssist AI for personalized timetables, verified travel guidance and passenger assistance.
            </p>
          </div>

          {/* Feedback */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label 
                htmlFor="reg-name"
                className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5"
              >
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Arjun Sharma"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] placeholder-[#685C6B]/70 dark:placeholder-[#C5B9CD]/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E9793D] dark:focus:ring-[#F18445] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label 
                htmlFor="reg-email"
                className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="passenger@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] placeholder-[#685C6B]/70 dark:placeholder-[#C5B9CD]/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E9793D] dark:focus:ring-[#F18445] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Phone Number (Optional) */}
            <div>
              <label 
                htmlFor="reg-phone"
                className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5"
              >
                Mobile Number <span className="font-normal text-[#685C6B] dark:text-[#C5B9CD]">(Optional, for IRCTC SMS updates)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="reg-phone"
                  type="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] placeholder-[#685C6B]/70 dark:placeholder-[#C5B9CD]/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E9793D] dark:focus:ring-[#F18445] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label 
                htmlFor="reg-password"
                className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5"
              >
                Create Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
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

              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((seg) => (
                      <div
                        key={seg}
                        className={`flex-1 rounded-full transition-colors ${
                          seg <= passwordStrength.score ? passwordStrength.color : 'bg-stone-200 dark:bg-stone-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-[#685C6B] dark:text-[#C5B9CD]">
                    <span>Strength: {passwordStrength.label}</span>
                    <span>8+ chars, upper & number</span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label 
                htmlFor="reg-confirm"
                className="block text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] mb-1.5"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#685C6B] dark:text-[#C5B9CD]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="reg-confirm"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF5ED] dark:bg-[#191426] border border-[#E7D5C1] dark:border-[#493B55] text-[#251B32] dark:text-[#FFF8F0] placeholder-[#685C6B]/70 dark:placeholder-[#C5B9CD]/60 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#E9793D] dark:focus:ring-[#F18445] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#685C6B] dark:text-[#C5B9CD] hover:text-[#251B32] dark:hover:text-white cursor-pointer"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Terms and Privacy Acknowledgement */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-[#E7D5C1] dark:border-[#493B55] text-[#E9793D] focus:ring-[#E9793D] cursor-pointer"
                />
                <span className="text-xs text-[#685C6B] dark:text-[#C5B9CD] leading-relaxed">
                  I agree to the RailAssist AI Terms of Service and acknowledge that timetable information is retrieved from official railway snapshots.
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
                  <span>Creating Passenger Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 pt-5 border-t border-[#E7D5C1] dark:border-[#493B55] text-center text-xs text-[#685C6B] dark:text-[#C5B9CD]">
            <span>Already hold a passenger ticket? </span>
            <Link
              href="/login"
              className="font-bold text-[#E9793D] hover:text-[#D46A34] dark:text-[#F5B65C] transition-colors"
            >
              Sign In to Your Account &rarr;
            </Link>
          </div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 py-4 text-center text-[11px] text-[#685C6B] dark:text-[#C5B9CD]">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-[#13875C] dark:text-[#20C997]" />
          <span>Individual Accounts &bull; Zero Hallucination Grounding &bull; 100% Private</span>
        </div>
      </footer>

    </div>
  );
}

