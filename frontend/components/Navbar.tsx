'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Train, 
  Compass, 
  MessageSquare, 
  Database, 
  BarChart3, 
  HelpCircle, 
  Menu, 
  X,
  PhoneCall,
  ChevronDown,
  User,
  LogOut,
  Settings,
  Sparkles
} from 'lucide-react';
import { fetchHealth, HealthResponse } from '@/lib/api';
import { Logo } from '@/components/Logo';
import { Container } from '@/primitives/Container';
import { Badge } from '@/primitives/Badge';
import { useAuth } from '@/context/AuthContext';
import { UserProfileModal } from '@/components/UserProfileModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [online, setOnline] = useState<boolean | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<'home' | 'ai-assistant'>('home');
  
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to element accounting for fixed navbar height
  const scrollToSectionWithOffset = (sectionId: string): boolean => {
    const el = document.getElementById(sectionId);
    if (!el) return false;
    
    const navbarHeight = 75; // Account for fixed navbar
    const elementTop = el.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = Math.max(0, elementTop - navbarHeight);

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    return true;
  };

  // Safe client-side navigation within the same tab
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string, key: string) => {
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) {
      return;
    }
    e.preventDefault();
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);

    // 1. Home link clicked
    if (key === 'home') {
      if (pathname === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (window.location.hash) {
          window.history.pushState(null, '', '/');
        }
        setActiveSection('home');
      } else {
        router.push('/');
      }
      return;
    }

    // 2. AI Assistant link clicked
    if (key === 'ai-assistant') {
      if (pathname === '/') {
        const scrolled = scrollToSectionWithOffset('ai-assistant');
        if (scrolled) {
          window.history.pushState(null, '', '#ai-assistant');
          setActiveSection('ai-assistant');
        } else {
          setTimeout(() => {
            scrollToSectionWithOffset('ai-assistant');
            window.history.pushState(null, '', '#ai-assistant');
            setActiveSection('ai-assistant');
          }, 100);
        }
      } else {
        router.push('/#ai-assistant');
      }
      return;
    }

    // 3. Separate internal pages
    if (pathname === href) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(href);
    }
  };

  // Track scroll position for navbar transparency and homepage section highlight
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);

      // On homepage, determine whether hero/top or ai-assistant is currently active
      if (pathname === '/') {
        const aiEl = document.getElementById('ai-assistant');
        if (aiEl) {
          const rect = aiEl.getBoundingClientRect();
          if (rect.top <= 250 && rect.bottom >= 150) {
            setActiveSection('ai-assistant');
          } else if (window.scrollY < 300) {
            setActiveSection('home');
          }
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  // Handle hash changes on back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      if (pathname === '/') {
        if (window.location.hash === '#ai-assistant') {
          scrollToSectionWithOffset('ai-assistant');
          setActiveSection('ai-assistant');
        } else if (!window.location.hash || window.location.hash === '#') {
          setActiveSection('home');
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [pathname]);

  // Periodic health check
  useEffect(() => {
    let mounted = true;
    const checkApi = async () => {
      try {
        const data = await fetchHealth();
        if (mounted) {
          setHealth(data);
          setOnline(true);
        }
      } catch (err) {
        if (mounted) setOnline(false);
      }
    };
    checkApi();
    const interval = setInterval(checkApi, 20000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMoreMenuOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  // Close 'More' and 'User' dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setMoreMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navLinks = [
    { key: 'home', href: '/', label: 'Home', icon: Train },
    { key: 'trains', href: '/trains', label: 'Find Trains', icon: Compass },
    { key: 'ai-assistant', href: '/#ai-assistant', label: 'AI Assistant', icon: MessageSquare },
    { key: 'explore', href: '/explore', label: 'Railway Directory', icon: Database },
    { key: 'dashboard', href: '/dashboard', label: 'Insights', icon: BarChart3 },
    { key: 'about', href: '/about', label: 'About & Help', icon: HelpCircle },
  ];

  const isItemActive = (key: string, href: string) => {
    if (key === 'home') {
      return pathname === '/' && activeSection === 'home';
    }
    if (key === 'ai-assistant') {
      return pathname === '/chat' || (pathname === '/' && activeSection === 'ai-assistant');
    }
    return pathname === href;
  };

  const isTabletMoreActive = ['/explore', '/dashboard', '/about'].includes(pathname);
  const isLaptopMoreActive = ['/dashboard', '/about'].includes(pathname);
  const isHomepage = pathname === '/';
  const isHeroTransparent = isHomepage && !isScrolled;

  return (
    <header 
      className={`${
        isHomepage ? 'fixed top-0 left-0 right-0' : 'sticky top-0'
      } z-50 transition-all duration-300 navbar-header ${
        isHeroTransparent ? 'navbar-transparent' : 'navbar-solid'
      }`}
    >
      <Container size="large">
        <div className="flex items-center justify-between h-15 gap-4">
          
          {/* 1. Logo & Branding */}
          <Logo />

          {/* 2. Desktop Navigation Layout */}
          <nav className="hidden md:flex items-center gap-1 xl:gap-1.5" aria-label="Main Navigation">
            {navLinks.slice(0, 3).map((link) => {
              const Icon = link.icon;
              const isActive = isItemActive(link.key, link.href);
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  target="_self"
                  onClick={(e) => handleNavigation(e, link.href, link.key)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Railway Directory (visible on lg+) */}
            <Link
              href={navLinks[3].href}
              target="_self"
              onClick={(e) => handleNavigation(e, navLinks[3].href, navLinks[3].key)}
              className={`hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                isItemActive(navLinks[3].key, navLinks[3].href) ? 'nav-link-active' : 'nav-link-inactive'
              }`}
            >
              <Database className="w-3.5 h-3.5 shrink-0" />
              <span>{navLinks[3].label}</span>
            </Link>

            {/* Insights & About (visible on xl+) */}
            {navLinks.slice(4).map((link) => {
              const Icon = link.icon;
              const isActive = isItemActive(link.key, link.href);
              return (
                <Link
                  key={link.key}
                  href={link.href}
                  target="_self"
                  onClick={(e) => handleNavigation(e, link.href, link.key)}
                  className={`hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                    isActive ? 'nav-link-active' : 'nav-link-inactive'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* "More" Dropdown on md and lg */}
            <div className="relative xl:hidden" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                aria-expanded={moreMenuOpen}
                aria-haspopup="true"
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer border ${
                  (isTabletMoreActive || isLaptopMoreActive) ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${moreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {moreMenuOpen && (
                <div 
                  className="absolute right-0 top-full mt-1.5 w-48 rounded-xl navbar-dropdown shadow-2xl p-1 z-50 divide-y divide-[#E7D5C1] dark:divide-[#493B55]"
                  role="menu"
                >
                  <Link
                    href={navLinks[3].href}
                    target="_self"
                    onClick={(e) => handleNavigation(e, navLinks[3].href, navLinks[3].key)}
                    className={`lg:hidden flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                      isItemActive(navLinks[3].key, navLinks[3].href) ? 'nav-link-active' : 'nav-link-inactive'
                    }`}
                    role="menuitem"
                  >
                    <Database className="w-3.5 h-3.5 shrink-0" />
                    <span>{navLinks[3].label}</span>
                  </Link>

                  {navLinks.slice(4).map((link) => {
                    const Icon = link.icon;
                    const isActive = isItemActive(link.key, link.href);
                    return (
                      <Link
                        key={link.key}
                        href={link.href}
                        target="_self"
                        onClick={(e) => handleNavigation(e, link.href, link.key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          isActive ? 'nav-link-active' : 'nav-link-inactive'
                        }`}
                        role="menuitem"
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* 3. Right-Side Actions (Auth, API Status & Rail Madad 139) */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            
            {/* Live System Indicator */}
            <Badge
              variant={online === true ? 'live' : online === false ? 'offline' : 'neutral'}
              size="small"
              pulse={true}
              className="py-1 px-2.5 font-mono text-[11px] hidden lg:inline-flex"
              title={online ? `Backend operational (${health?.records_count || 0} records indexed)` : 'Connecting to API'}
            >
              <span>{online === true ? 'Service Active' : online === false ? 'Connecting' : 'Connecting'}</span>
            </Badge>

            {/* Authentication: User Profile Menu or Sign In */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 py-1 px-2.5 rounded-xl bg-white/90 dark:bg-[#191426]/90 border border-[#E7D5C1] dark:border-[#493B55] text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] hover:border-[#E9793D] dark:hover:border-[#F18445] shadow-xs cursor-pointer transition-all"
                  aria-expanded={userMenuOpen}
                >
                  <div className="w-6 h-6 rounded-lg bg-[#E9793D] dark:bg-[#F18445] text-white flex items-center justify-center text-[11px] font-extrabold">
                    {user.full_name?.charAt(0).toUpperCase() || 'P'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">
                    Hi, {user.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-[#685C6B] dark:text-[#C5B9CD] transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] shadow-2xl p-2 z-50 divide-y divide-[#E7D5C1] dark:divide-[#493B55]">
                    {/* User Info Header */}
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] truncate">
                        {user.full_name}
                      </p>
                      <p className="text-[11px] font-mono text-[#685C6B] dark:text-[#C5B9CD] truncate">
                        {user.email}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          setProfileModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#251B32] dark:text-[#FFF8F0] hover:bg-[#FAF5ED] dark:hover:bg-[#292137] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Settings className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F18445]" />
                        <span>Profile & Security</span>
                      </button>

                      <Link
                        href="/welcome"
                        onClick={() => setUserMenuOpen(false)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-[#251B32] dark:text-[#FFF8F0] hover:bg-[#FAF5ED] dark:hover:bg-[#292137] rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#E9793D] dark:text-[#F18445]" />
                        <span>Replay Welcome Intro</span>
                      </Link>
                    </div>

                    {/* Sign Out */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                          router.push('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg border border-[#E7D5C1] dark:border-[#493B55] bg-white/80 dark:bg-[#191426]/80 hover:bg-[#FAF5ED] dark:hover:bg-[#292137] text-xs font-bold text-[#251B32] dark:text-[#FFF8F0] transition-all cursor-pointer shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 rounded-lg bg-[#E9793D] dark:bg-[#F18445] hover:bg-[#D96528] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                >
                  Join
                </Link>
              </div>
            )}

            {/* Helpline quick dial in Warm Terracotta */}
            <a
              href="tel:139"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#E9793D] hover:bg-[#D46A34] dark:bg-[#F18445] text-white text-xs font-bold shadow-md shadow-orange-950/40 transition-all shrink-0 whitespace-nowrap cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
              title="24x7 Official Rail Madad Passenger Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0 text-white" />
              <span>Rail Madad 139</span>
            </a>
          </div>

          {/* 4. Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && user && (
              <button
                type="button"
                onClick={() => setProfileModalOpen(true)}
                className="w-7 h-7 rounded-lg bg-[#E9793D] dark:bg-[#F18445] text-white flex items-center justify-center text-xs font-bold shadow-xs cursor-pointer"
                title={user.full_name}
              >
                {user.full_name?.charAt(0).toUpperCase() || 'P'}
              </button>
            )}

            <a
              href="tel:139"
              className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#E9793D] dark:bg-[#F18445] text-white text-xs font-bold shrink-0"
              title="Call 139"
            >
              <PhoneCall className="w-3 h-3 text-white" />
              <span>139</span>
            </a>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-[#251B32] dark:text-[#FFF8F0] hover:bg-[#FAF5ED] dark:hover:bg-[#292137] transition-colors cursor-pointer border border-[#E7D5C1] dark:border-[#493B55]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </Container>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E7D5C1] dark:border-[#493B55] bg-[#FAF5ED] dark:bg-[#191426] px-4 py-3 space-y-1 shadow-2xl">
          {/* User info or Sign In prompt on mobile */}
          <div className="mb-2 pb-2 border-b border-[#E7D5C1] dark:border-[#493B55]">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[#251B32] dark:text-[#FFF8F0]">
                    Welcome, {user.full_name}
                  </p>
                  <p className="text-[10px] text-[#685C6B] dark:text-[#C5B9CD] font-mono">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setProfileModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-[#E7D5C1] dark:border-[#493B55] text-[#E9793D] dark:text-[#F18445] text-xs font-bold cursor-pointer"
                    title="Profile Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logout();
                      router.push('/login');
                    }}
                    className="p-1.5 rounded-lg border border-rose-300 dark:border-rose-800 text-rose-600 text-xs font-bold cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-1.5 rounded-lg bg-white dark:bg-[#211A2D] border border-[#E7D5C1] dark:border-[#493B55] text-center text-xs font-bold text-[#251B32] dark:text-[#FFF8F0]"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-1.5 rounded-lg bg-[#E9793D] dark:bg-[#F18445] text-center text-xs font-bold text-white shadow-xs"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = isItemActive(link.key, link.href);
            return (
              <Link
                key={link.key}
                href={link.href}
                target="_self"
                onClick={(e) => handleNavigation(e, link.href, link.key)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer border ${
                  isActive ? 'nav-link-active' : 'nav-link-inactive'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          
          <div className="pt-2 border-t border-[#E7D5C1] dark:border-[#493B55] mt-2 flex items-center justify-between text-xs">
            <span className="text-[#685C6B] dark:text-[#C5B9CD]">Emergency Support:</span>
            <a
              href="tel:139"
              className="text-[#E9793D] dark:text-[#F18445] font-bold flex items-center gap-1 hover:underline"
            >
              <PhoneCall className="w-3 h-3" />
              <span>Dial 139 (Rail Madad)</span>
            </a>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal 
        isOpen={profileModalOpen} 
        onClose={() => setProfileModalOpen(false)} 
      />
    </header>
  );
}
