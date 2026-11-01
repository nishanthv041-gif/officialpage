import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  ArrowRight,
  Download,
  ChevronDown,
  ChevronUp,
  MapPin,
  Compass,
  Award,
  BookOpen,
  Trophy,
  Building2,
} from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';
import { CampusHeroScene } from '../components/three/CampusHeroScene';
import { TiltCard, ResilientImage } from '../components/common/TiltCard';
import { LightboxModal } from '../components/common/LightboxModal';
import { GalleryItem } from '../types/school';

const VIRTUAL_TOUR_STATIONS = [
  {
    id: 'main-block',
    title: '01. Silver Jubilee Main Academic Block',
    area: 'Smart Classrooms & Seminar Halls',
    description:
      '48 naturally ventilated digital smart classrooms equipped with interactive 4K panels, acoustic treatment, and ergonomic seating overlooking the Western Ghats foothills.',
    specs: 'Capacity: 1,600 Scholars · 100% Solar Powered · RO Drinking Water on Every Floor',
  },
  {
    id: 'stem-labs',
    title: '02. Dr. A.P.J. Abdul Kalam Science & Robotics Wing',
    area: 'Physics, Chemistry, Biology, Computer & AI Labs',
    description:
      'Dedicated Higher Secondary practical laboratories with individual optical benches, laminar airflow hoods, 120 high-speed workstations, and embedded robotics kits.',
    specs: '5 Specialized Labs · 1:1 Practical Equipment Ratio · Fiber-Optic Campus Network',
  },
  {
    id: 'hostel-campus',
    title: '03. Bhavani Residential Hostel Sanctuary',
    area: 'Separate Boys & Girls Residential Enclaves',
    description:
      'Home-away-from-home residential wings with resident academic wardens, supervised evening faculty study hours, steam-sterilized vegetarian & wholesome dining hall, and 24/7 infirmary.',
    specs: 'AC & Non-AC Dormitories · Solar Hot Water · Evening NEET/JEE Mentorship',
  },
  {
    id: 'sports-arena',
    title: '04. Olympic Standard 400m Sports Complex',
    area: 'Athletics Track, Kabaddi Courts, Football & Cricket Turf',
    description:
      '8-acre outdoor athletic arena hosting zonal tournaments with floodlit synthetic kabaddi courts, basketball courts, cricket turf nets, and professional physical directors.',
    specs: '8-Lane 400m Track · Zonal Championship Host Venue · Morning & Evening Coaching',
  },
];

export const HomePage: React.FC = () => {
  const { siteConfig, galleryItems, showToast } = useSchoolData();
  const navigate = useNavigate();
  const sectionsRef = useRef<HTMLDivElement | null>(null);

  const [lightboxList, setLightboxList] = useState<GalleryItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string>('faq-1');
  const [activeTourStation, setActiveTourStation] = useState<string>('main-block');

  const eventsPreview = galleryItems.filter((i) => i.section === 'events').slice(0, 3);
  const achievementsPreview = galleryItems.filter((i) => i.section === 'achievements').slice(0, 4);
  const sportsPreview = galleryItems.filter((i) => i.section === 'sports').slice(0, 3);
  const testimonials = galleryItems.filter((i) => i.section === 'testimonials');
  const downloads = galleryItems.filter((i) => i.section === 'downloads');
  const faqs = galleryItems.filter((i) => i.section === 'faq');
  const homeShowcase = siteConfig.homeShowcaseImages || [];
  const toggles = siteConfig.featureToggles;

  useEffect(() => {
    if (!sectionsRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-reveal',
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    }, sectionsRef);
    return () => ctx.revert();
  }, []);

  const openLightbox = (list: GalleryItem[], index: number) => {
    setLightboxList(list);
    setLightboxIndex(index);
  };

  const handleDownloadDocument = (docItem: GalleryItem) => {
    const content = [
      `${siteConfig.schoolName}`,
      `${siteConfig.location}`,
      `====================================================`,
      `DOCUMENT: ${docItem.title}`,
      `CATEGORY: ${docItem.category} | YEAR: ${docItem.year}`,
      `UPDATED: ${docItem.date}`,
      `----------------------------------------------------`,
      docItem.description,
      ``,
      `Contact Office: ${siteConfig.phonePrimary} | ${siteConfig.email}`,
      `Address: ${siteConfig.address}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${docItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Download Started', `Downloaded "${docItem.title}"`);
  };

  return (
    <div ref={sectionsRef} className="space-y-24 pb-20">
      {/* 1. Interactive 3D Campus Hero */}
      <CampusHeroScene
        schoolName={siteConfig.schoolName}
        tagline={siteConfig.tagline}
        location={siteConfig.location}
        headline={siteConfig.heroHeadline}
        subtext={siteConfig.heroSubtext}
        studentsCount={siteConfig.studentsCount}
        teachersCount={siteConfig.teachersCount}
        yearsCount={siteConfig.yearsCount}
        awardsCount={siteConfig.awardsCount}
        enable3DByDefault={siteConfig.featureToggles.enable3DHero}
        onApplyClick={() => navigate('/admissions')}
        onExploreClick={() => navigate('/academics')}
      />

      {/* 2. Welcome & Principal's Leadership Section */}
      {toggles.showHomeWelcome !== false && (
        <section className="max-w-7xl mx-auto px-6 gsap-reveal">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  01. Institutional Welcome · Sathyamangalam
                </div>
                <h2 className="font-display text-2xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {siteConfig.welcomeTitle}
                </h2>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {siteConfig.welcomeMessage}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    Our Vision
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {siteConfig.vision}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    Our Mission
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                    {siteConfig.mission}
                  </p>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  <span>Read Full Institutional History &amp; Campus Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Principal's Message Card with Uploaded Principal Photo */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    Principal’s Desk · Leadership Note
                  </div>
                  {siteConfig.principalPhotoUrl && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden border border-amber-500/40 shrink-0 bg-slate-950">
                      <ResilientImage
                        src={siteConfig.principalPhotoUrl}
                        alt={siteConfig.principalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  “Every scholar deserves individual mentorship and intellectual courage.”
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {siteConfig.principalMessage}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-display font-bold text-slate-900 dark:text-white">
                    {siteConfig.principalName}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {siteConfig.principalTitle} · {siteConfig.schoolName}
                  </div>
                </div>
                <Award className="w-8 h-8 text-amber-500 shrink-0" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2B. Uploaded Home Page Campus Photo Showcase (Editable & Uploadable in /admin) */}
      {toggles.showHomePhotoShowcase !== false && homeShowcase.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 gsap-reveal space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                Featured Campus Highlights · Sathyamangalam
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                Campus Infrastructure &amp; Learning Spaces
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/galleries')}
              className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>View Full Photo Galleries</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {homeShowcase.map((photo, idx) => (
              <TiltCard
                key={photo.id || idx}
                onClick={() =>
                  openLightbox(
                    homeShowcase.map((p) => ({
                      id: p.id,
                      section: 'events',
                      title: p.title,
                      category: 'Campus Showcase',
                      year: '2026',
                      date: 'Sathyamangalam Campus',
                      description: p.caption,
                      imageUrl: p.imageUrl,
                    })),
                    idx
                  )
                }
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer flex flex-col justify-between"
              >
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <ResilientImage
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-1.5">
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {photo.caption}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </section>
      )}

      {/* 3. Asymmetric Bento Grid: Academic & Residential Pillars */}
      {toggles.showHomePillars !== false && (
        <section className="max-w-7xl mx-auto px-6 gsap-reveal space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              02. Core Academic &amp; Campus Ecosystem
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Built for Higher Secondary Mastery &amp; Holistic Growth
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/academics')}
            className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>View All 4 Higher Secondary Groups</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TiltCard
            onClick={() => navigate('/academics')}
            className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <BookOpen className="w-4 h-4" />
                <span>Higher Secondary Wing · Classes XI &amp; XII</span>
              </div>
              <h3 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                01. State Board Concept Mastery + Integrated NEET, JEE &amp; CA Foundation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Structured daily schedules combining Tamil Nadu State Board syllabus depth with
                competitive problem-solving clinics in Physics, Chemistry, Biology, Mathematics,
                Computer Science, and Accountancy—eliminating the stress of separate travel to
                external coaching centers.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              <span>Group I: Bio-Maths</span>
              <span aria-hidden="true">·</span>
              <span>Group II: Comp-Maths</span>
              <span aria-hidden="true">·</span>
              <span>Group III: Pure Science</span>
              <span aria-hidden="true">·</span>
              <span>Group IV: Commerce &amp; CA</span>
            </div>
          </TiltCard>

          <TiltCard
            onClick={() => navigate('/about')}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                <Building2 className="w-4 h-4" />
                <span>Day Scholar &amp; Hostel</span>
              </div>
              <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                02. Separate Boys &amp; Girls Residential Hostels
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Safe, green residential campus with resident faculty wardens, supervised evening
                study hours, nutritious steam-cooked meals, and 34 GPS-tracked buses for Day
                Scholars across Erode &amp; Coimbatore districts.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              24/7 Campus Security · 34 Bus Routes
            </div>
          </TiltCard>
        </div>
      </section>
      )}

      {/* 4. Achievements Marquee & Topper Spotlights */}
      {toggles.showHomeAchievements !== false && (
      <section className="max-w-7xl mx-auto px-6 gsap-reveal space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              03. Proven Academic &amp; Institutional Outcomes
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Recent Board Ranks, NEET Qualifiers &amp; State Honours
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/galleries?tab=achievements')}
            className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Open Full Achievements Gallery</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {achievementsPreview.map((item, idx) => (
            <TiltCard
              key={item.id}
              onClick={() => openLightbox(achievementsPreview, idx)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.year}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/80 text-xs font-medium text-amber-600 dark:text-amber-400">
                Inspect Certificate &amp; Details →
              </div>
            </TiltCard>
          ))}
        </div>
      </section>
      )}

      {/* 5. Latest Campus Events & Championship Sports Preview */}
      {toggles.showHomeEventsSports !== false && (
      <section className="max-w-7xl mx-auto px-6 gsap-reveal space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              04. Campus Life, Cultural Events &amp; Athletics
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Latest Events &amp; Zonal Sports Championships
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/galleries?tab=events')}
              className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              All Events
            </button>
            <span aria-hidden="true" className="text-slate-400">
              ·
            </span>
            <button
              type="button"
              onClick={() => navigate('/galleries?tab=sports')}
              className="text-sm font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
            >
              All Sports
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...eventsPreview.slice(0, 2), ...sportsPreview.slice(0, 1)].map((item, idx, arr) => (
            <TiltCard
              key={item.id}
              onClick={() => openLightbox(arr, idx)}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950">
                  <ResilientImage
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-400">
                      {item.section}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{item.date}</span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>
              </div>
              <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>{item.subtitle || 'Sathyamangalam Campus'}</span>
                <Trophy className="w-4 h-4 text-amber-500" />
              </div>
            </TiltCard>
          ))}
        </div>
      </section>
      )}

      {/* 6. Interactive Virtual Campus Tour Explorer */}
      {toggles.showHomeCampusTour !== false && (
      <section className="max-w-7xl mx-auto px-6 gsap-reveal">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 lg:p-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
                05. Interactive Campus Tour · 18-Acre Eco-Smart Sanctuary
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                Explore Our Sathyamangalam Campus Zones
              </h2>
            </div>
            <div className="flex flex-wrap gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-800">
              {VIRTUAL_TOUR_STATIONS.map((station, index) => (
                <button
                  key={station.id}
                  type="button"
                  onClick={() => setActiveTourStation(station.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeTourStation === station.id
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Zone 0{index + 1}
                </button>
              ))}
            </div>
          </div>

          {VIRTUAL_TOUR_STATIONS.filter((s) => s.id === activeTourStation).map((station) => (
            <div
              key={station.id}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-4 border-t border-slate-200 dark:border-slate-800"
            >
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                  <Compass className="w-4 h-4" />
                  <span>{station.area}</span>
                </div>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
                  {station.title}
                </h3>
                <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  {station.description}
                </p>
                <div className="pt-2 font-mono tabular-nums text-xs text-slate-500 dark:text-slate-400">
                  {station.specs}
                </div>
              </div>
              <div className="lg:col-span-5 rounded-xl bg-slate-950 border border-slate-800 p-6 space-y-4 text-slate-200">
                <div className="text-xs font-semibold text-amber-400">
                  Schedule an In-Person Guided Campus Visit
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Parents and students are welcome to visit our Sathyamangalam campus Monday through
                  Saturday between 9:00 AM and 4:30 PM to tour the laboratories, hostel dining hall,
                  and classrooms.
                </p>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold cursor-pointer"
                  >
                    Book Campus Visit
                  </button>
                  <a
                    href={siteConfig.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-medium text-slate-200 inline-flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>Google Maps Directions</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* 7. Attributable Alumni & Parent Testimonials + Circular Downloads */}
      {(toggles.showHomeTestimonials !== false || toggles.showHomeDownloads !== false) && (
      <section className="max-w-7xl mx-auto px-6 gsap-reveal grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Testimonials */}
        {toggles.showHomeTestimonials !== false && (
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              06. Attributable Community Voices
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Alumni &amp; Parent Testimonials
            </h2>
          </div>

          <div className="space-y-4">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-3"
              >
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  “{t.description}”
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="font-display text-sm font-bold text-slate-900 dark:text-white">
                    {t.title}
                  </div>
                  <div className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    {t.subtitle}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Downloads (Prospectus, Fee Structure, Academic Calendar) */}
        {toggles.showHomeDownloads !== false && (
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              07. Official Circulars &amp; Publications
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Downloads &amp; Fee Structure
            </h2>
          </div>

          <div className="space-y-4">
            {downloads.map((dl) => (
              <div
                key={dl.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{dl.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{dl.date}</span>
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {dl.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {dl.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(dl)}
                  aria-label={`Download ${dl.title}`}
                  className="px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        )}
      </section>
      )}

      {/* 8. Frequently Asked Questions */}
      {toggles.showHomeFaq !== false && (
      <section className="max-w-5xl mx-auto px-6 gsap-reveal space-y-6">
        <div className="text-center space-y-2">
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
            08. Parent &amp; Student Queries
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq) => {
            const isOpen = openFaqId === faq.id;
            return (
              <div
                key={faq.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenFaqId(isOpen ? '' : faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-display text-base font-semibold text-slate-900 dark:text-white">
                    {faq.title}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/60">
                    {faq.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
      )}

      {/* 9. Pre-Admission Call-To-Action Conversion Banner */}
      {toggles.showHomeCtaBanner !== false && (
      <section className="max-w-7xl mx-auto px-6 gsap-reveal">
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 p-8 sm:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs font-medium text-amber-400">
              Admissions Open · 2026–2027 &amp; 2027–2028 Academic Batches
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Begin Your Child’s Pre-Admission Registration Online
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Complete our 4-step registration in under 3 minutes to receive an instant Application
              ID and schedule your scholarship assessment &amp; campus interaction.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/admissions')}
              className="px-6 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Start Pre-Admission Form</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => navigate('/contact')}
              className="px-5 py-3.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Contact Admissions Office
            </button>
          </div>
        </div>
      </section>
      )}

      <LightboxModal
        items={lightboxList}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
};
