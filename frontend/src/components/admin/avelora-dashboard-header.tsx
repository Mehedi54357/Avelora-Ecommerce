'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Calendar,
  Clock,
  ChevronDown,
  RefreshCw,
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Sparkles,
  Check,
} from 'lucide-react';
import { useAdmin } from '../../context/admin-context';
import { API_BASE_URL, authFetch } from '../../utils/api-config';

export type TimeTheme = 'morning' | 'afternoon' | 'evening' | 'night';
export type TimeRangePreset = '7D' | '30D' | '90D' | 'ALL';

export interface AveloraDashboardHeaderProps {
  userName?: string;
  subtitle?: string;
  timeRange?: TimeRangePreset;
  onTimeRangeChange?: (range: TimeRangePreset) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}

// Fixed stars coordinates for consistent, non-flickering luxury night sky
const STAR_COORDINATES = [
  { x: 3, y: 18, size: 1.5, opacity: 0.6, delay: 0 },
  { x: 7, y: 45, size: 1.2, opacity: 0.45, delay: 1.2 },
  { x: 12, y: 15, size: 2, opacity: 0.85, delay: 0.5 },
  { x: 16, y: 68, size: 1, opacity: 0.5, delay: 2.1 },
  { x: 22, y: 28, size: 2.2, opacity: 0.9, delay: 1.7 },
  { x: 27, y: 80, size: 1.2, opacity: 0.4, delay: 0.8 },
  { x: 34, y: 22, size: 1.8, opacity: 0.75, delay: 2.5 },
  { x: 38, y: 55, size: 1, opacity: 0.35, delay: 1.1 },
  { x: 44, y: 14, size: 2.5, opacity: 0.95, delay: 0.2 },
  { x: 48, y: 72, size: 1.4, opacity: 0.55, delay: 1.9 },
  { x: 55, y: 25, size: 1.6, opacity: 0.7, delay: 2.8 },
  { x: 61, y: 62, size: 1.2, opacity: 0.45, delay: 0.7 },
  { x: 67, y: 18, size: 2, opacity: 0.8, delay: 1.4 },
  { x: 72, y: 48, size: 1.1, opacity: 0.5, delay: 2.3 },
  { x: 78, y: 15, size: 2.2, opacity: 0.9, delay: 0.6 },
  { x: 83, y: 76, size: 1.3, opacity: 0.4, delay: 1.5 },
  { x: 88, y: 30, size: 1.8, opacity: 0.75, delay: 2.7 },
  { x: 93, y: 65, size: 1.2, opacity: 0.5, delay: 0.9 },
  { x: 97, y: 22, size: 2.4, opacity: 0.85, delay: 1.8 },
];

export default function AveloraDashboardHeader({
  userName,
  subtitle = "Here's what's happening with Avelora Elegance today.",
  timeRange = '7D',
  onTimeRangeChange,
  onRefresh,
  refreshing = false,
  className = '',
}: AveloraDashboardHeaderProps) {
  // 1. Resolve Admin Name
  const adminContext = useAdmin();
  const [fetchedName, setFetchedName] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [themeOverride, setThemeOverride] = useState<TimeTheme | 'auto'>('auto');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState<boolean>(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Timezone resolution: prefer configured env, fallback to browser or Asia/Dhaka
  const resolvedTimezone = useMemo(() => {
    if (process.env.NEXT_PUBLIC_TIMEZONE && process.env.NEXT_PUBLIC_TIMEZONE.trim() !== '') {
      return process.env.NEXT_PUBLIC_TIMEZONE.trim();
    }
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Dhaka';
    } catch {
      return 'Asia/Dhaka';
    }
  }, []);

  // Fetch session user name if not available from context or props
  useEffect(() => {
    setMounted(true);

    if (userName || adminContext?.currentUser?.name) {
      return;
    }

    let isSubscribed = true;
    const fetchUserProfile = async () => {
      try {
        const res = await authFetch(`${API_BASE_URL}/api/auth/me`);
        if (res.ok) {
          const json = await res.json();
          const name = json?.user?.name || json?.name;
          if (isSubscribed && name) {
            setFetchedName(name);
          }
        }
      } catch {
        // Fallback silently
      }
    };

    fetchUserProfile();
    return () => {
      isSubscribed = false;
    };
  }, [userName, adminContext?.currentUser?.name]);

  // Live Clock Tick (Every Second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFilterDropdownOpen(false);
      }
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute local hour in configured/local timezone
  const localHour = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: resolvedTimezone,
        hour: 'numeric',
        hour12: false,
      }).formatToParts(currentTime);
      const hourPart = parts.find((p) => p.type === 'hour');
      return hourPart ? parseInt(hourPart.value, 10) : currentTime.getHours();
    } catch {
      return currentTime.getHours();
    }
  }, [currentTime, resolvedTimezone]);

  // Determine current active theme based on local time
  // MORNING: 05:00 - 11:59
  // AFTERNOON: 12:00 - 16:59
  // EVENING: 17:00 - 18:59
  // NIGHT: 19:00 - 04:59
  const calculatedTheme: TimeTheme = useMemo(() => {
    if (localHour >= 5 && localHour < 12) return 'morning';
    if (localHour >= 12 && localHour < 17) return 'afternoon';
    if (localHour >= 17 && localHour < 19) return 'evening';
    return 'night';
  }, [localHour]);

  const activeTheme: TimeTheme = themeOverride === 'auto' ? calculatedTheme : themeOverride;

  // Format Clock display (HH:MM:SS AM/PM)
  const formattedTime = useMemo(() => {
    if (!mounted) return '--:--:-- --';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: resolvedTimezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleTimeString();
    }
  }, [currentTime, mounted, resolvedTimezone]);

  // Format Date display (e.g. Wed, Oct 7)
  const formattedDate = useMemo(() => {
    if (!mounted) return '---, --- --';
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: resolvedTimezone,
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }).format(currentTime);
    } catch {
      return currentTime.toLocaleDateString();
    }
  }, [currentTime, mounted, resolvedTimezone]);

  // Format Date Range display based on active preset
  const formattedRangeText = useMemo(() => {
    if (!mounted) return 'Loading range...';
    try {
      const end = currentTime;
      if (timeRange === 'ALL') {
        return 'All Recorded History';
      }

      const daysBack = timeRange === '7D' ? 7 : timeRange === '30D' ? 30 : 90;
      const start = new Date(end.getTime() - daysBack * 24 * 60 * 60 * 1000);

      const fmt = (d: Date) =>
        new Intl.DateTimeFormat('en-US', {
          timeZone: resolvedTimezone,
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(d);

      return `${fmt(start)} - ${fmt(end)}`;
    } catch {
      return `${timeRange} Range`;
    }
  }, [currentTime, timeRange, mounted, resolvedTimezone]);

  // Display Name Calculation
  const resolvedDisplayName = useMemo(() => {
    const raw = userName || adminContext?.currentUser?.name || fetchedName;
    return raw && raw.trim() !== '' ? raw.trim() : 'Administrator';
  }, [userName, adminContext?.currentUser?.name, fetchedName]);

  // Greeting Configuration per Theme
  const themeConfig = useMemo(() => {
    switch (activeTheme) {
      case 'morning':
        return {
          title: `Good Morning, ${resolvedDisplayName}`,
          emoji: '☀️',
          bgGradient: 'from-[#0C233C] via-[#163D66] to-[#C49454]',
          accentGlow: 'rgba(254, 215, 170, 0.45)',
          pulseColor: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)]',
        };
      case 'afternoon':
        return {
          title: `Good Afternoon, ${resolvedDisplayName}`,
          emoji: '☀️',
          bgGradient: 'from-[#092D53] via-[#125396] to-[#38BDF8]',
          accentGlow: 'rgba(186, 230, 253, 0.45)',
          pulseColor: 'bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]',
        };
      case 'evening':
        return {
          title: `Good Evening, ${resolvedDisplayName}`,
          emoji: '🌇',
          bgGradient: 'from-[#190E28] via-[#5C1E42] to-[#DD7C44]',
          accentGlow: 'rgba(253, 186, 116, 0.45)',
          pulseColor: 'bg-orange-400 shadow-[0_0_10px_rgba(251,146,60,0.9)]',
        };
      case 'night':
      default:
        return {
          title: `Good Night, ${resolvedDisplayName}`,
          emoji: '🌙',
          bgGradient: 'from-[#050B16] via-[#09152B] to-[#12244B]',
          accentGlow: 'rgba(191, 219, 254, 0.35)',
          pulseColor: 'bg-violet-400 shadow-[0_0_10px_rgba(167,139,250,0.9)]',
        };
    }
  }, [activeTheme, resolvedDisplayName]);

  return (
    <div
      className={`relative w-full overflow-hidden rounded-2xl shadow-xl transition-all duration-1000 ease-in-out border border-white/10 ${className}`}
      style={{
        background:
          activeTheme === 'morning'
            ? 'linear-gradient(135deg, #0A2137 0%, #153C65 40%, #2A588B 70%, #C89958 100%)'
            : activeTheme === 'afternoon'
            ? 'linear-gradient(135deg, #08294B 0%, #0F4984 45%, #196FB7 80%, #38BDF8 100%)'
            : activeTheme === 'evening'
            ? 'linear-gradient(135deg, #180D27 0%, #46163D 35%, #7F2746 65%, #C75F40 90%, #E38647 100%)'
            : 'linear-gradient(135deg, #040813 0%, #081226 40%, #0C1A38 75%, #12244C 100%)',
      }}
    >
      {/* ========================================================================= */}
      {/* BACKGROUND ARTWORK: Stars, Moon/Sun, and Clouds (Lightweight CSS/SVG)     */}
      {/* ========================================================================= */}

      {/* 1. Stars (Visible during Night, subtle in Evening/Morning) */}
      {(activeTheme === 'night' || activeTheme === 'evening') && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          {STAR_COORDINATES.map((star, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white transition-opacity duration-700"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: activeTheme === 'night' ? star.opacity : star.opacity * 0.4,
                boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`,
                animation: `twinkle ${2.5 + (i % 3)}s ease-in-out ${star.delay}s infinite alternate`,
              }}
            />
          ))}
        </div>
      )}

      {/* 2. Celestial Body: Crescent Moon (Night) */}
      {activeTheme === 'night' && (
        <div className="absolute top-1/2 -translate-y-1/2 right-[20%] sm:right-[32%] md:right-[26%] lg:right-[32%] pointer-events-none select-none z-0 transition-all duration-1000 opacity-90">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center">
            {/* Ethereal Glow */}
            <div className="absolute inset-0 rounded-full bg-blue-300/15 blur-2xl transform scale-125" />
            {/* Crescent Moon SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-24 h-24 sm:w-32 sm:h-32 transform -rotate-12 drop-shadow-[0_0_18px_rgba(200,225,255,0.5)]"
              fill="none"
            >
              <defs>
                <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="40%" stopColor="#E0EDFE" />
                  <stop offset="100%" stopColor="#B9D5FD" />
                </linearGradient>
                <mask id="crescentMask">
                  <rect width="100" height="100" fill="white" />
                  <circle cx="56" cy="42" r="38" fill="black" />
                </mask>
              </defs>
              <circle
                cx="46"
                cy="50"
                r="40"
                fill="url(#moonGrad)"
                mask="url(#crescentMask)"
              />
              {/* Subtle Crater Details */}
              <circle cx="34" cy="46" r="3.5" fill="#93B8E8" opacity="0.4" />
              <circle cx="40" cy="62" r="2.5" fill="#93B8E8" opacity="0.3" />
              <circle cx="30" cy="58" r="1.8" fill="#93B8E8" opacity="0.35" />
            </svg>
          </div>
        </div>
      )}

      {/* 3. Celestial Body: Morning Rising Sun */}
      {activeTheme === 'morning' && (
        <div className="absolute -top-4 right-[10%] sm:right-[25%] pointer-events-none select-none z-0 transition-all duration-1000">
          <div className="relative w-44 h-44 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-amber-400/25 blur-3xl transform scale-150 animate-pulse" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-amber-400 via-yellow-200 to-white shadow-[0_0_40px_rgba(251,191,36,0.6)]" />
          </div>
        </div>
      )}

      {/* 4. Celestial Body: Afternoon High Sun Glow */}
      {activeTheme === 'afternoon' && (
        <div className="absolute -top-10 right-[15%] pointer-events-none select-none z-0 transition-all duration-1000">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-sky-300/30 blur-3xl transform scale-150" />
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-sky-200 via-white to-amber-100 shadow-[0_0_50px_rgba(255,255,255,0.7)]" />
          </div>
        </div>
      )}

      {/* 5. Celestial Body: Evening Twilight Sunset Sun */}
      {activeTheme === 'evening' && (
        <div className="absolute -bottom-6 right-[15%] sm:right-[28%] pointer-events-none select-none z-0 transition-all duration-1000">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-3xl transform scale-150" />
            <div className="w-24 h-24 rounded-full bg-gradient-to-t from-orange-500 via-rose-400 to-amber-200 shadow-[0_0_45px_rgba(249,115,22,0.7)]" />
          </div>
        </div>
      )}

      {/* 6. Soft Atmospheric Layered Clouds (Nestled at the bottom edge) */}
      <div className="absolute -bottom-1 left-0 right-0 pointer-events-none select-none z-0 flex items-end justify-center">
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-16 sm:h-20 lg:h-24 opacity-25 object-cover transform translate-y-3"
          preserveAspectRatio="none"
          fill="none"
        >
          {/* Back cloud puff layer */}
          <path
            d="M0,120 L0,90 Q120,60 240,85 Q380,45 520,75 Q680,30 840,65 Q1000,40 1200,80 L1200,120 Z"
            fill="white"
            fillOpacity="0.3"
          />
          {/* Front cloud puff layer */}
          <path
            d="M0,120 L0,100 Q150,75 300,95 Q480,55 650,85 Q820,50 1020,80 Q1120,65 1200,95 L1200,120 Z"
            fill="white"
            fillOpacity="0.45"
          />
        </svg>
      </div>

      {/* ========================================================================= */}
      {/* MAIN BANNER CONTENT: Left Greeting & Right Controls                        */}
      {/* ========================================================================= */}
      <div className="relative z-10 px-5 py-5 sm:px-7 sm:py-6 lg:px-8 lg:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        {/* LEFT: Dynamic Greeting & Subtitle */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white tracking-tight drop-shadow-sm flex items-center gap-2">
              <span>{themeConfig.title}</span>
              <span className="text-xl sm:text-2xl select-none" role="img" aria-label="Greeting emoji">
                {themeConfig.emoji}
              </span>
            </h1>

            {/* Subtle Theme Status Badge / Preview Switcher */}
            <div className="relative inline-block" ref={themeMenuRef}>
              <button
                type="button"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition shadow-xs"
                title="Click to preview time themes or keep Auto"
              >
                <Sparkles className="w-2.5 h-2.5 text-[#F3E5AB]" />
                <span>{themeOverride === 'auto' ? activeTheme : `${themeOverride} (test)`}</span>
              </button>

              {/* Theme Preview Switcher Dropdown */}
              {isThemeMenuOpen && (
                <div className="absolute left-0 mt-2 w-44 rounded-xl bg-slate-950/95 backdrop-blur-xl border border-white/15 p-1.5 shadow-2xl z-50 animate-fadeIn text-xs">
                  <div className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest text-gray-400">
                    Theme Mode
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setThemeOverride('auto');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      themeOverride === 'auto'
                        ? 'bg-[#D4AF37]/25 text-[#F3E5AB] font-bold'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>🔄 Auto (Live Clock)</span>
                    {themeOverride === 'auto' && <Check className="w-3.5 h-3.5 text-[#F3E5AB]" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setThemeOverride('morning');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      themeOverride === 'morning'
                        ? 'bg-amber-500/25 text-amber-200 font-bold'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>🌅 Morning</span>
                    {themeOverride === 'morning' && <Check className="w-3.5 h-3.5 text-amber-200" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setThemeOverride('afternoon');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      themeOverride === 'afternoon'
                        ? 'bg-sky-500/25 text-sky-200 font-bold'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>☀️ Afternoon</span>
                    {themeOverride === 'afternoon' && <Check className="w-3.5 h-3.5 text-sky-200" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setThemeOverride('evening');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      themeOverride === 'evening'
                        ? 'bg-orange-500/25 text-orange-200 font-bold'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>🌇 Evening</span>
                    {themeOverride === 'evening' && <Check className="w-3.5 h-3.5 text-orange-200" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setThemeOverride('night');
                      setIsThemeMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition ${
                      themeOverride === 'night'
                        ? 'bg-indigo-500/25 text-indigo-200 font-bold'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>🌙 Night</span>
                    {themeOverride === 'night' && <Check className="w-3.5 h-3.5 text-indigo-200" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 font-medium tracking-normal drop-shadow-sm">
            {subtitle}
          </p>
        </div>

        {/* RIGHT: Date Range Filter Pill & Live Clock Pill */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap md:flex-nowrap">
          {/* 1. Date Range Filter Pill */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
              className="group flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-950/50 hover:bg-slate-950/70 border border-white/15 hover:border-white/30 backdrop-blur-md text-white transition shadow-sm text-xs font-medium cursor-pointer"
              title="Filter dashboard date range"
              aria-expanded={isFilterDropdownOpen}
            >
              <Calendar className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition" />
              <span className="font-mono tracking-tight text-white/95 text-xs truncate max-w-[210px] sm:max-w-[260px]">
                {formattedRangeText}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-white/70 transition-transform duration-200 ${
                  isFilterDropdownOpen ? 'transform rotate-180' : ''
                }`}
              />
            </button>

            {/* Date Range Dropdown Menu */}
            {isFilterDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-950/95 backdrop-blur-xl border border-white/15 p-2 shadow-2xl z-50 animate-fadeIn text-xs">
                <div className="px-3 py-1.5 flex items-center justify-between border-b border-white/10 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Filter Range
                  </span>
                  {onRefresh && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRefresh();
                      }}
                      disabled={refreshing}
                      className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition flex items-center gap-1 text-[11px]"
                      title="Sync metrics"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin text-[#D4AF37]' : ''}`} />
                      <span>Sync</span>
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  {(
                    [
                      { id: '7D', label: 'Last 7 Days', desc: 'Trailing 1 week' },
                      { id: '30D', label: 'Last 30 Days', desc: 'Trailing 1 month' },
                      { id: '90D', label: 'Last 90 Days', desc: 'Trailing 1 quarter' },
                      { id: 'ALL', label: 'All History', desc: 'Lifetime authoritative' },
                    ] as const
                  ).map((preset) => {
                    const isSelected = timeRange === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          if (onTimeRangeChange) {
                            onTimeRangeChange(preset.id);
                          }
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition ${
                          isSelected
                            ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F3E5AB] font-bold'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div>
                          <p className="leading-tight">{preset.label}</p>
                          <p className="text-[10px] text-gray-400 font-normal">{preset.desc}</p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-[#D4AF37]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 2. Live Time & Date Pill */}
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/50 border border-white/15 backdrop-blur-md text-white shadow-sm"
            title={`Timezone: ${resolvedTimezone}`}
          >
            {/* Pulsing Dot */}
            <span
              className={`w-2 h-2 rounded-full transition-colors duration-700 ${themeConfig.pulseColor}`}
            />

            {/* Live Clock (HH:MM:SS AM/PM) */}
            <span className="font-mono font-bold tracking-tight text-white text-xs sm:text-sm select-none">
              {formattedTime}
            </span>

            {/* Day and Date (Wed, Oct 7) */}
            <span className="text-white/75 font-medium text-xs select-none pl-1 border-l border-white/20">
              {formattedDate}
            </span>
          </div>
        </div>
      </div>

      {/* Embedded CSS for Star Twinkling Animations with Accessibility Support */}
      <style jsx>{`
        @keyframes twinkle {
          0% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.15);
          }
          100% {
            opacity: 0.3;
            transform: scale(0.9);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .twinkle {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
