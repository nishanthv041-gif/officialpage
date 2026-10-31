import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Microscope } from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';
import { TiltCard, ResilientImage } from '../components/common/TiltCard';

const HIGHER_SECONDARY_STREAMS = [
  {
    code: 'GROUP I · BIO-MATHS STREAM',
    title: 'Mathematics, Physics, Chemistry & Biology',
    careerPathways: 'Medicine (MBBS/BDS), IIT/NIT Engineering, Biotechnology, Architecture, Research',
    integratedPrep: 'Daily Integrated NEET-UG & JEE-Main Problem-Solving Modules',
    seats: '120 Seats (Day Scholar & Residential Hostel)',
    highlights: [
      'Dedicated human anatomy, genetics, and optics practical sessions twice a week',
      'Weekly OMR mock tests modeled on NTA NEET & JEE patterns with instant analytics',
      'Evening faculty doubt-clearing clinics for hostel and day-boarding scholars',
    ],
  },
  {
    code: 'GROUP II · COMPUTER SCIENCE STREAM',
    title: 'Mathematics, Physics, Chemistry & Computer Science',
    careerPathways: 'Computer Science Engineering, AI & Data Science, Robotics, Aerospace, Defence',
    integratedPrep: 'JEE-Main & Advanced + Python, Full-Stack & Olympiad Track',
    seats: '120 Seats (Day Scholar & Residential Hostel)',
    highlights: [
      '1:1 lab terminal ratio for Python, Data Structures, MySQL, and IoT prototyping',
      'Intensive calculus, coordinate geometry, and mechanics workshops',
      'Annual participation in state-level hackathons and robotics expos',
    ],
  },
  {
    code: 'GROUP III · PURE SCIENCE STREAM',
    title: 'Physics, Chemistry, Botany & Zoology (Microbiology Option)',
    careerPathways: 'MBBS, Veterinary Science, Agricultural B.Sc., Pharmacy, Paramedical Sciences',
    integratedPrep: 'Focused NEET-UG Intensive & ICAR Agriculture Entrance Track',
    seats: '80 Seats (Day Scholar & Residential Hostel)',
    highlights: [
      'Line-by-line NCERT + State Board biology mastery with botanical garden field study',
      'Specialized organic & physical chemistry numerical drills for medical aspirants',
      'High-yield test series producing 18+ Government Medical College selections annually',
    ],
  },
  {
    code: 'GROUP IV · COMMERCE & CHARTERED ACCOUNTANCY',
    title: 'Accountancy, Commerce, Economics & Computer Applications / Business Maths',
    careerPathways: 'Chartered Accountancy (CA), CS, CMA, B.Com (Hons), FinTech, Corporate Law (CLAT)',
    integratedPrep: 'ICAI CA-Foundation & CUET Central University Entrance Track',
    seats: '80 Seats (Day Scholar & Residential Hostel)',
    highlights: [
      'Mentorship by practicing Chartered Accountants and doctoral commerce faculty',
      'Practical workshops in Tally Prime, GST taxation, financial markets, and business law',
      'Consistent record of State Board centums in Accountancy and Commerce',
    ],
  },
];

const SCHOOL_WINGS = [
  {
    stage: '01. Kindergarten & Foundational Wing (LKG – Class II)',
    focus: 'Montessori play-way phonics, bilingual numeracy, sensory discovery, and joyful storytelling.',
  },
  {
    stage: '02. Primary & Middle Wing (Classes III – VIII)',
    focus: 'Conceptual science, mental mathematics, English communication lab, Tamil literature, and foundational coding.',
  },
  {
    stage: '03. High School SSLC Wing (Classes IX – X)',
    focus: 'Board exam mastery, NTSE/Olympiad foundation, structured laboratory practicals, and career aptitude mapping.',
  },
  {
    stage: '04. Higher Secondary HSC Wing (Classes XI – XII)',
    focus: 'Specialized stream immersion, university entrance coaching (NEET/JEE/CA/CUET), and residential mentorship.',
  },
];

export const AcademicsPage: React.FC = () => {
  const { galleryItems } = useSchoolData();
  const navigate = useNavigate();
  const facultyList = galleryItems.filter((i) => i.section === 'faculty');

  return (
    <div className="max-w-7xl mx-auto px-6 py-14 space-y-20">
      {/* Header */}
      <section className="space-y-4 max-w-3xl">
        <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
          <span>Academic Curriculum</span>
          <span aria-hidden="true">·</span>
          <span>LKG to Class XII</span>
          <span aria-hidden="true">·</span>
          <span>100% Board Pass Record</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
          Rigorous Higher Secondary Streams &amp; Concept-First Pedagogy
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Our academic architecture bridges Tamil Nadu State Board mastery with national competitive
          entrance preparation so every student graduates with both top board marks and direct
          admission readiness for premier medical, engineering, and commerce universities.
        </p>
      </section>

      {/* Progressive School Wings */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SCHOOL_WINGS.map((w) => (
          <div
            key={w.stage}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-2.5"
          >
            <GraduationCap className="w-5 h-5 text-amber-500" />
            <h2 className="font-display text-base font-bold text-slate-900 dark:text-white">
              {w.stage}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{w.focus}</p>
          </div>
        ))}
      </section>

      {/* Higher Secondary Streams (Class XI & XII Groups) */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Higher Secondary Division (Classes XI &amp; XII)
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
              Choose Your Higher Secondary Group
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate('/admissions')}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Register for 2026–27 Stream Selection</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {HIGHER_SECONDARY_STREAMS.map((stream) => (
            <TiltCard
              key={stream.code}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                    {stream.code}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                    {stream.seats}
                  </span>
                </div>

                <h3 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                  {stream.title}
                </h3>

                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <strong className="text-slate-900 dark:text-white">Career Pathways:</strong>{' '}
                    {stream.careerPathways}
                  </div>
                  <div>
                    <strong className="text-slate-900 dark:text-white">Integrated Wing:</strong>{' '}
                    {stream.integratedPrep}
                  </div>
                </div>

                <ul className="space-y-2 pt-2">
                  {stream.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  English Medium · Day Scholar &amp; Hostel
                </span>
                <button
                  type="button"
                  onClick={() => navigate('/admissions')}
                  className="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Apply for this Group</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      {/* Senior Faculty & HOD Highlights */}
      <section className="space-y-8">
        <div>
          <div className="text-xs font-medium text-amber-600 dark:text-amber-400">
            Postgraduate Academic Mentors
          </div>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">
            Heads of Departments &amp; Senior Faculty
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facultyList.map((fac) => (
            <TiltCard
              key={fac.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[16/10] w-full bg-slate-950 overflow-hidden">
                  <ResilientImage
                    src={fac.imageUrl}
                    alt={fac.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2">
                  <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                    {fac.category} · {fac.date}
                  </div>
                  <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                    {fac.title}
                  </h3>
                  {fac.subtitle && (
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {fac.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {fac.description}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Microscope className="w-3.5 h-3.5 text-amber-500" />
                <span>SRT Academic Council</span>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>
    </div>
  );
};
