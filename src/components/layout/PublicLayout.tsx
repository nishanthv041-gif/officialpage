import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Lock,
  Moon,
  Sun,
  PhoneCall,
  Mail,
  MapPin,
  ExternalLink,
  MessageCircle,
  Menu,
  X,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';

export const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { siteConfig, galleryItems, theme, toggleTheme } = useSchoolData();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const announcements = galleryItems.filter((i) => i.section === 'announcements');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const socialItems = [
    {
      key: 'facebook' as const,
      label: 'Facebook',
      href: siteConfig.socialLinks.facebook,
      enabled: siteConfig.socialLinks.enabled.facebook,
    },
    {
      key: 'instagram' as const,
      label: 'Instagram',
      href: siteConfig.socialLinks.instagram,
      enabled: siteConfig.socialLinks.enabled.instagram,
    },
    {
      key: 'youtube' as const,
      label: 'YouTube',
      href: siteConfig.socialLinks.youtube,
      enabled: siteConfig.socialLinks.enabled.youtube,
    },
    {
      key: 'twitter' as const,
      label: 'X / Twitter',
      href: siteConfig.socialLinks.twitter,
      enabled: siteConfig.socialLinks.enabled.twitter,
    },
    {
      key: 'whatsapp' as const,
      label: 'WhatsApp',
      href: siteConfig.socialLinks.whatsapp,
      enabled: siteConfig.socialLinks.enabled.whatsapp,
    },
    {
      key: 'linkedin' as const,
      label: 'LinkedIn',
      href: siteConfig.socialLinks.linkedin,
      enabled: siteConfig.socialLinks.enabled.linkedin,
    },
  ].filter((s) => s.enabled && s.href);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Strict 3-Zone Top Bar Contract Header */}
      <header
        className={`sticky top-0 z-40 flex items-center justify-between gap-8 px-6 transition-all duration-150 border-b border-slate-200 dark:border-slate-800/90 bg-white/95 dark:bg-slate-950/95 ${
          scrolled ? 'py-3 shadow-md' : 'py-4'
        }`}
      >
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="font-display text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          {siteConfig.schoolName}
        </Link>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300"
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''
              }`
            }
          >
            About
          </NavLink>
          <NavLink
            to="/academics"
            className={({ isActive }) =>
              `hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''
              }`
            }
          >
            Academics
          </NavLink>
          <NavLink
            to="/galleries"
            className={({ isActive }) =>
              `hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''
              }`
            }
          >
            Galleries
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `hover:text-slate-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 ${
                isActive ? 'text-amber-600 dark:text-amber-400 font-semibold' : ''
              }`
            }
          >
            Contact
          </NavLink>
        </nav>

        {/* Zone 3: 1 primary action (plus mobile menu button on small screens) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('/admissions')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Pre-Admission
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Mobile Navigation"
            className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 space-y-3">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <Link to="/" className="py-1.5 text-slate-800 dark:text-slate-100">
              Home
            </Link>
            <Link to="/about" className="py-1.5 text-slate-800 dark:text-slate-100">
              About Us &amp; Facilities
            </Link>
            <Link to="/academics" className="py-1.5 text-slate-800 dark:text-slate-100">
              Academics &amp; Streams
            </Link>
            <Link to="/galleries" className="py-1.5 text-slate-800 dark:text-slate-100">
              Events, Sports &amp; Achievements
            </Link>
            <Link to="/admissions" className="py-1.5 text-amber-600 dark:text-amber-400 font-semibold">
              Pre-Admission Registration
            </Link>
            <Link to="/contact" className="py-1.5 text-slate-800 dark:text-slate-100">
              Contact &amp; Location Map
            </Link>
          </div>
        </div>
      )}

      {/* Secondary Utility Strip below Header (Quick Section Links, Announcements Ticker & Theme Switch) */}
      <div className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-900/70 px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* News & Announcements Ticker */}
          <div className="flex items-center gap-3 overflow-hidden flex-1 min-w-[240px]">
            <span className="font-semibold text-amber-600 dark:text-amber-400 whitespace-nowrap shrink-0">
              Announcements:
            </span>
            <div className="overflow-hidden whitespace-nowrap flex-1">
              <div className="animate-marquee inline-flex items-center gap-8 text-slate-600 dark:text-slate-300">
                {announcements.map((ann) => (
                  <span key={ann.id} className="inline-flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {ann.title}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ann.date}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Direct Sub-Section Links & Theme Switcher */}
          <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 shrink-0">
            <Link
              to="/galleries?tab=events"
              className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Events
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to="/galleries?tab=sports"
              className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Sports
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              to="/galleries?tab=achievements"
              className="hover:text-slate-900 dark:hover:text-white whitespace-nowrap shrink-0"
            >
              Achievements
            </Link>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-700" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Quiet Institutional Footer with Social Media Links & Small Admin Lock Icon */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Column 1: School Identity */}
          <div className="lg:col-span-4 space-y-4">
            <div className="font-display text-xl font-bold text-white">
              {siteConfig.schoolName}
            </div>
            <p className="text-xs font-medium text-amber-400">
              {siteConfig.tagline} · {siteConfig.location}
            </p>
            <p className="text-sm text-slate-400 leading-relaxed">
              Co-Educational Higher Secondary Institution (Day Scholar &amp; Residential Hostel)
              committed to State Board academic excellence, competitive exam readiness, and
              holistic athletic development.
            </p>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About Us &amp; Vision
                </Link>
              </li>
              <li>
                <Link to="/academics" className="hover:text-white transition-colors">
                  Higher Secondary Streams
                </Link>
              </li>
              <li>
                <Link to="/galleries?tab=events" className="hover:text-white transition-colors">
                  Events Gallery
                </Link>
              </li>
              <li>
                <Link to="/galleries?tab=sports" className="hover:text-white transition-colors">
                  Sports &amp; Athletics
                </Link>
              </li>
              <li>
                <Link
                  to="/galleries?tab=achievements"
                  className="hover:text-white transition-colors"
                >
                  Board Achievements
                </Link>
              </li>
              <li>
                <Link to="/admissions" className="hover:text-amber-400 transition-colors">
                  Pre-Admission Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Campus Address & Direct Contact */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-sm font-semibold text-white">Campus Contact</h3>
            <div className="space-y-2.5 text-sm text-slate-400">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-1" />
                <span>{siteConfig.address}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`tel:${siteConfig.phonePrimary}`} className="hover:text-white">
                  {siteConfig.phonePrimary}
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a href={`mailto:${siteConfig.email}`} className="hover:text-white">
                  {siteConfig.email}
                </a>
              </p>
            </div>
          </div>

          {/* Column 4: Social Media & Google Maps Link */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-sm font-semibold text-white">Connect With Us</h3>
            <div className="flex flex-wrap gap-2">
              {socialItems.map((soc) => (
                <a
                  key={soc.key}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${soc.label}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-medium text-slate-200 transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <span>{soc.label}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ))}
            </div>
            <div className="pt-2">
              <a
                href={siteConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-amber-400 hover:text-amber-300"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>View Campus on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Discreet Admin Lock Icon */}
        <div className="border-t border-slate-800/80 px-6 py-5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div>
              © {new Date().getFullYear()} {siteConfig.schoolName}, Sathyamangalam. All rights
              reserved.
            </div>
            <div className="flex items-center gap-5">
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp Admissions Desk</span>
              </a>
              <Link
                to="/admin"
                aria-label="Admin Portal Login"
                title="Admin Portal"
                className="p-1.5 rounded hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition-colors inline-flex items-center gap-1"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="sr-only">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
