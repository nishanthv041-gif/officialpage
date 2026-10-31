import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Bus,
  Building2,
  Cpu,
  FlaskConical,
  Home,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';
import { TiltCard } from '../components/common/TiltCard';

const FACILITIES_LIST = [
  {
    icon: FlaskConical,
    title: '01. Physics, Chemistry & Biology Research Labs',
    meta: '3,200 sq.ft each · 48 Students per Batch',
    description:
      'Equipped with digital balances, precision spectrometers, binocular compound microscopes, botanical herbarium archives, and strict lab safety showers for Class XI & XII practical mastery.',
  },
  {
    icon: Cpu,
    title: '02. Computer Science, AI & Robotics Innovation Lab',
    meta: '120 Workstations · High-Speed Fiber Leased Line',
    description:
      'Dedicated programming terminals for Python, C++, SQL, and microcontroller robotics kits enabling hands-on engineering prototypes and district science olympiads.',
  },
  {
    icon: BookOpen,
    title: '03. Dr. S. Radhakrishnan Central Library & Digital Commons',
    meta: '18,500+ Volumes · National Digital Library Access',
    description:
      'Houses Higher Secondary reference encyclopedias, NEET/JEE question banks, Tamil & English literary classics, periodicals, and quiet individual reading carrels.',
  },
  {
    icon: Home,
    title: '04. Separate Boys & Girls Residential Hostels',
    meta: '24/7 Resident Wardens · Supervised Study Hours',
    description:
      'Spacious, well-ventilated dormitories with solar water heating, RO drinking water, steam-sterilized vegetarian & nutritious dining hall, evening faculty mentorship, and campus infirmary.',
  },
  {
    icon: Bus,
    title: '05. 34-Bus GPS-Tracked Safe Transport Fleet',
    meta: '40 km Radius Coverage · Live Parent Notifications',
    description:
      'Connects Sathyamangalam, Gobichettipalayam, Bhavani Sagar, Punjai Puliampatti, Bannari, Sirumugai, and Kavanthandapatti with trained attendants on every bus.',
  },
  {
    icon: ShieldCheck,
    title: '06. Smart Classrooms & Eco-Safe Campus',
    meta: '4K Interactive Panels · 120+ CCTV Cameras',
    description:
      'Every classroom integrates visual 3D concept simulations, biometric attendance alerts, 60kW solar power backup, and lush botanical shade trees.',
  },
];

const MANAGEMENT_LEADERS = [
  {
    role: 'Founder & Chairman',
    name: 'Thiru. S. R. Thangavelu',
    credentials: 'Industrialist & Educational Philanthropist',
    note: 'Founded SRT Universal Trust in 2001 to ensure children of the Bhavani Sagar and Sathyamangalam belt receive premier Higher Secondary education close to home.',
  },
  {
    role: 'Correspondent & Secretary',
    name: 'Thiru. T. Karthikeyan, B.E., M.B.A.',
    credentials: 'Academic Infrastructure & Digital Transformation Lead',
    note: 'Spearheads STEM laboratory modernization, residential hostel welfare, and merit scholarship endowments for first-generation learners.',
  },
  {
    role: 'Principal & Academic Director',
    name: 'Dr. S. Senthilnathan, M.Sc., M.Phil., M.Ed., Ph.D.',
    credentials: '26 Years in Higher Secondary Academic Leadership',
    note: 'Guides curriculum delivery, continuous faculty development, and personalized board + competitive exam mentorship.',
  },
];

export const AboutPage: React.FC = () => {
  const { siteConfig } = useSchoolData();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-20">
      {/* Page Header */}
      <section className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          <span>About {siteConfig.schoolName}</span>
          <span aria-hidden="true">·</span>
          <span>Established 2001</span>
          <span aria-hidden="true">·</span>
          <span>Sathyamangalam</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          25 Years of Academic Rigor, Character &amp; Rural-Urban Educational Equity
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          {siteConfig.history}
        </p>
      </section>

      {/* Vision, Mission & Core Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 space-y-3">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            01. Institutional Vision
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Global Competence with Ethical Roots
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {siteConfig.vision}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 space-y-3">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            02. Institutional Mission
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            Concept-Driven Pedagogy &amp; Care
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {siteConfig.mission}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 space-y-3">
          <div className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            03. Motto &amp; Ethos
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900 dark:text-white">
            “{siteConfig.tagline}”
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Discipline, scientific curiosity, mutual respect, and service to society form the four
            pillars of daily life for every Day Scholar and Hostel resident at SRT Universal.
          </p>
        </div>
      </section>

      {/* Principal's Full Message & Management Trust */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Principal’s Message
            </span>
            <Award className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {siteConfig.principalName}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{siteConfig.principalTitle}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {siteConfig.principalMessage}
          </p>
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            Office Hours for Parents: Monday – Friday, 3:30 PM – 5:00 PM
          </div>
        </div>

        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Governance &amp; Stewardship
            </div>
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white mt-1">
              SRT Educational Trust &amp; Management Council
            </h2>
          </div>

          <div className="space-y-4">
            {MANAGEMENT_LEADERS.map((leader) => (
              <div
                key={leader.name}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {leader.name}
                  </h3>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {leader.role} · {leader.credentials}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {leader.note}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comprehensive Campus Facilities */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Infrastructure &amp; Residential Amenities
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Campus Facilities Engineered for Excellence
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admissions')}
            className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Apply for Day Scholar / Hostel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FACILITIES_LIST.map((fac) => {
            const IconComponent = fac.icon;
            return (
              <TiltCard
                key={fac.title}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    {fac.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {fac.description}
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {fac.meta}
                </div>
              </TiltCard>
            );
          })}
        </div>
      </section>
    </div>
  );
};
