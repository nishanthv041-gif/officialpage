import {
  AdmissionApplication,
  AdminUserRecord,
  AnnouncementItem,
  ContactMessage,
  GalleryItem,
  SiteConfig,
} from '../types/school';

export function createEditorialSvgDataUri(
  title: string,
  subtitle: string,
  accentHex: string,
  secondaryHex: string,
  motif: 'campus' | 'lab' | 'sports' | 'trophy' | 'library' | 'faculty'
): string {
  const motifs: Record<typeof motif, string> = {
    campus: `
      <rect x="140" y="210" width="520" height="190" rx="8" fill="#0f172a" stroke="${accentHex}" stroke-width="2.5"/>
      <polygon points="120,210 400,110 680,210" fill="${secondaryHex}" stroke="${accentHex}" stroke-width="2.5"/>
      <rect x="355" y="275" width="90" height="125" rx="6" fill="${accentHex}" fill-opacity="0.22" stroke="${accentHex}" stroke-width="2"/>
      <line x1="220" y1="210" x2="220" y2="400" stroke="${accentHex}" stroke-width="3" stroke-opacity="0.5"/>
      <line x1="580" y1="210" x2="580" y2="400" stroke="${accentHex}" stroke-width="3" stroke-opacity="0.5"/>
      <circle cx="400" cy="168" r="22" fill="${accentHex}" fill-opacity="0.25" stroke="${accentHex}" stroke-width="2"/>
    `,
    lab: `
      <circle cx="400" cy="240" r="95" fill="none" stroke="${accentHex}" stroke-width="2.5" stroke-dasharray="8 6"/>
      <ellipse cx="400" cy="240" rx="140" ry="52" transform="rotate(-28 400 240)" fill="none" stroke="${accentHex}" stroke-width="2"/>
      <ellipse cx="400" cy="240" rx="140" ry="52" transform="rotate(28 400 240)" fill="none" stroke="${secondaryHex}" stroke-width="2"/>
      <circle cx="400" cy="240" r="18" fill="${accentHex}"/>
      <circle cx="490" cy="195" r="8" fill="#f8fafc"/>
      <circle cx="310" cy="285" r="8" fill="${accentHex}"/>
    `,
    sports: `
      <ellipse cx="400" cy="260" rx="220" ry="95" fill="none" stroke="${accentHex}" stroke-width="3"/>
      <ellipse cx="400" cy="260" rx="165" ry="68" fill="none" stroke="${accentHex}" stroke-width="1.5" stroke-dasharray="10 6"/>
      <circle cx="400" cy="210" r="36" fill="${accentHex}" fill-opacity="0.2" stroke="${accentHex}" stroke-width="2.5"/>
      <path d="M370 210 L392 232 L435 188" fill="none" stroke="${accentHex}" stroke-width="4" stroke-linecap="round"/>
    `,
    trophy: `
      <path d="M340 160 H460 V225 C460 265 432 292 400 292 C368 292 340 265 340 225 Z" fill="${accentHex}" fill-opacity="0.22" stroke="${accentHex}" stroke-width="3"/>
      <path d="M340 180 H305 C305 225 325 245 345 245" fill="none" stroke="${accentHex}" stroke-width="3"/>
      <path d="M460 180 H495 C495 225 475 245 455 245" fill="none" stroke="${accentHex}" stroke-width="3"/>
      <rect x="382" y="292" width="36" height="44" fill="${accentHex}" fill-opacity="0.35"/>
      <rect x="345" y="336" width="110" height="22" rx="4" fill="${accentHex}"/>
    `,
    library: `
      <path d="M260 180 Q330 160 400 185 Q470 160 540 180 V340 Q470 320 400 345 Q330 320 260 340 Z" fill="#0f172a" stroke="${accentHex}" stroke-width="3"/>
      <line x1="400" y1="185" x2="400" y2="345" stroke="${accentHex}" stroke-width="2.5"/>
      <line x1="290" y1="220" x2="375" y2="228" stroke="#94a3b8" stroke-width="2"/>
      <line x1="290" y1="255" x2="375" y2="263" stroke="#94a3b8" stroke-width="2"/>
      <line x1="425" y1="228" x2="510" y2="220" stroke="#94a3b8" stroke-width="2"/>
      <line x1="425" y1="263" x2="510" y2="255" stroke="#94a3b8" stroke-width="2"/>
    `,
    faculty: `
      <circle cx="400" cy="215" r="46" fill="${accentHex}" fill-opacity="0.22" stroke="${accentHex}" stroke-width="2.5"/>
      <path d="M315 350 C315 295 352 275 400 275 C448 275 485 295 485 350" fill="${accentHex}" fill-opacity="0.15" stroke="${accentHex}" stroke-width="2.5"/>
    `,
  };

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520" width="800" height="520">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#091124"/>
        <stop offset="55%" stop-color="#0f1d3a"/>
        <stop offset="100%" stop-color="${secondaryHex}"/>
      </linearGradient>
      <radialGradient id="glow" cx="50%" cy="42%" r="55%">
        <stop offset="0%" stop-color="${accentHex}" stop-opacity="0.24"/>
        <stop offset="100%" stop-color="${accentHex}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="800" height="520" fill="url(#bg)"/>
    <rect width="800" height="520" fill="url(#glow)"/>
    <g opacity="0.12" stroke="#e2e8f0" stroke-width="1">
      <line x1="0" y1="100" x2="800" y2="100"/>
      <line x1="0" y1="260" x2="800" y2="260"/>
      <line x1="0" y1="420" x2="800" y2="420"/>
      <line x1="160" y1="0" x2="160" y2="520"/>
      <line x1="400" y1="0" x2="400" y2="520"/>
      <line x1="640" y1="0" x2="640" y2="520"/>
    </g>
    ${motifs[motif]}
    <rect x="44" y="405" width="712" height="78" rx="10" fill="#060c1a" fill-opacity="0.82" stroke="${accentHex}" stroke-opacity="0.35"/>
    <text x="68" y="438" fill="#f8fafc" font-family="Outfit, sans-serif" font-size="22" font-weight="700">${title.replace(/&/g, '&amp;')}</text>
    <text x="68" y="464" fill="#cbd5e1" font-family="Plus Jakarta Sans, sans-serif" font-size="14">${subtitle.replace(/&/g, '&amp;')}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const INITIAL_SITE_CONFIG: SiteConfig = {
  schoolName: 'SRT UNIVERSAL HR.SEC SCHOOL',
  tagline: 'Learn. Lead. Inspire.',
  location: 'Sathyamangalam, Erode District, Tamil Nadu, India',
  heroHeadline: 'Shaping Tomorrow’s Scholars in the Foothills of Sathyamangalam',
  heroSubtext:
    'A premier Co-Educational Higher Secondary institution offering Day Scholar and Residential Hostel programmes with State-rank academic mentorship, modern STEM laboratories, and championship athletics.',
  welcomeTitle: 'Excellence Rooted in Character & Scientific Inquiry',
  welcomeMessage:
    'Founded with the mission of bringing world-class Higher Secondary education to Sathyamangalam and the surrounding Bhavani Sagar valley, SRT Universal Hr. Sec. School blends rigorous Tamil Nadu State Board & competitive exam preparation (NEET, JEE, CUET, CA Foundation) with holistic character formation. Our 18-acre green campus provides an inspiring sanctuary where curiosity turns into leadership.',
  principalName: 'Dr. S. Senthilnathan M.Sc., M.Phil., M.Ed., Ph.D.',
  principalTitle: 'Principal & Academic Director',
  principalMessage:
    'At SRT Universal Higher Secondary School, we believe every student carries an extraordinary spark. Whether a Day Scholar from Sathyamangalam or a Residential Hostel scholar from across Tamil Nadu, our faculty mentors each learner individually—balancing conceptual mastery in science, mathematics, and commerce with ethics, sportsmanship, and public speaking.',
  heroBannerImage: createEditorialSvgDataUri(
    'SRT Universal Hr. Sec. School Campus',
    '18-Acre Eco-Smart Sanctuary · Sathyamangalam, Erode District',
    '#f59e0b',
    '#1e3a8a',
    'campus'
  ),
  principalPhotoUrl: createEditorialSvgDataUri(
    'Dr. S. Senthilnathan M.Sc., M.Phil., Ph.D.',
    'Principal & Academic Director · SRT Universal Hr. Sec. School',
    '#f59e0b',
    '#0f172a',
    'faculty'
  ),
  homeShowcaseImages: [
    {
      id: 'home-photo-1',
      title: 'Silver Jubilee Academic Block',
      caption: '48 Digital Smart Classrooms overlooking the Western Ghats foothills',
      imageUrl: createEditorialSvgDataUri(
        'Silver Jubilee Academic Block',
        'Smart Classrooms & Seminar Auditoriums · Sathyamangalam',
        '#f59e0b',
        '#1e3a8a',
        'campus'
      ),
    },
    {
      id: 'home-photo-2',
      title: 'Dr. A.P.J. Abdul Kalam STEM & Robotics Wing',
      caption: 'Dedicated Physics, Chemistry, Biology, Computer & AI Laboratories',
      imageUrl: createEditorialSvgDataUri(
        'STEM & Robotics Laboratories',
        'Higher Secondary Practical Research Wing',
        '#38bdf8',
        '#0f172a',
        'lab'
      ),
    },
    {
      id: 'home-photo-3',
      title: '400m Championship Sports & Athletics Complex',
      caption: '8-Lane Track, Synthetic Kabaddi Courts, Football & Cricket Turf',
      imageUrl: createEditorialSvgDataUri(
        'Olympic Standard Sports Arena',
        'Zonal Athletics, Kabaddi, Football & Cricket Complex',
        '#10b981',
        '#064e3b',
        'sports'
      ),
    },
  ],
  vision:
    'To nurture intellectually fearless, ethically grounded, and globally competent citizens who lead positive transformation in science, industry, and society.',
  mission:
    'To deliver concept-driven education through modern laboratories, digital smart classrooms, dedicated residential mentorship, and structured sports training in a safe, inclusive environment.',
  history:
    'Established in 2001 in Sathyamangalam, Erode District, SRT Universal began with 180 students and a vision to bridge rural and urban educational opportunities. Over two and a half decades, the institution has grown into a landmark Higher Secondary campus educating over 2,450 scholars annually with a consistent 100% pass record and district-topper honours.',
  address:
    'Mysore Trunk Road (NH-948), Near Bhavani Sagar Foothills, Sathyamangalam – 638 401, Erode District, Tamil Nadu, India',
  phonePrimary: '+91 4295 220450',
  phoneSecondary: '+91 98427 22045',
  email: 'admissions@srtuniversal.edu.in',
  workingHours: 'Monday – Saturday: 8:30 AM to 4:45 PM (Office open 8:00 AM – 5:30 PM)',
  googleMapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Sathyamangalam+Erode+District+Tamil+Nadu+638401',
  googleMapsEmbedUrl:
    'https://www.google.com/maps?q=Sathyamangalam,Erode,Tamil+Nadu&output=embed',
  whatsappNumber: '919842722045',
  studentsCount: 2450,
  teachersCount: 128,
  yearsCount: 25,
  awardsCount: 184,
  socialLinks: {
    facebook: 'https://facebook.com/srtuniversalschool',
    instagram: 'https://instagram.com/srtuniversalschool',
    youtube: 'https://youtube.com/@srtuniversalschool',
    twitter: 'https://x.com/srtuniversal',
    whatsapp: 'https://wa.me/919842722045',
    linkedin: 'https://linkedin.com/school/srt-universal-school',
    enabled: {
      facebook: true,
      instagram: true,
      youtube: true,
      twitter: true,
      whatsapp: true,
      linkedin: true,
    },
  },
  featureToggles: {
    enableEventsEditing: true,
    enableSportsEditing: true,
    admissionFormOpen: true,
    contactFormOpen: true,
    darkModeDefault: true,
    maintenanceMode: false,
    enable3DHero: true,
    showHomeWelcome: true,
    showHomePillars: true,
    showHomeAchievements: true,
    showHomeEventsSports: true,
    showHomePhotoShowcase: true,
    showHomeCampusTour: true,
    showHomeTestimonials: true,
    showHomeDownloads: true,
    showHomeFaq: true,
    showHomeCtaBanner: true,
  },
};

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  // ANNOUNCEMENTS
  {
    id: 'ann-1',
    section: 'announcements',
    title: 'Pre-Admission Registration Open for 2026–2027 Batch (Classes LKG to XI)',
    category: 'Admissions',
    year: '2026',
    date: '2026-03-01',
    description:
      'Applications are invited for Day Scholar and Residential Hostel seats across Group I (Bio-Maths), Group II (Computer Science), Group III (Pure Science), and Group IV (Commerce & Accountancy).',
    imageUrl: createEditorialSvgDataUri(
      'Admissions 2026–27 Open',
      'Day Scholar & Residential Hostel Registration',
      '#f59e0b',
      '#1e3a8a',
      'campus'
    ),
  },
  {
    id: 'ann-2',
    section: 'announcements',
    title: 'Erode District Higher Secondary Science Exhibition First Prize',
    category: 'Academics',
    year: '2026',
    date: '2026-02-18',
    description:
      'Our Class XI Robotics & Renewable Energy team secured First Place at the Erode District Inter-School Innovation Conclave for their Solar Drip Irrigation Telemetry prototype.',
    imageUrl: createEditorialSvgDataUri(
      'District Science Conclave Winners',
      'First Place · Renewable Agri-Tech Prototype',
      '#38bdf8',
      '#0f172a',
      'lab'
    ),
  },
  {
    id: 'ann-3',
    section: 'announcements',
    title: 'NEET & JEE Integrated Foundation Coaching Orientation on Nov 14',
    category: 'Academic Calendar',
    year: '2026',
    date: '2026-10-25',
    description:
      'Parents and incoming Class XI scholars are invited to the Academic Auditorium at 10:00 AM for the 2026–27 competitive exam mentorship briefing.',
    imageUrl: createEditorialSvgDataUri(
      'NEET & JEE Foundation Orientation',
      'Academic Auditorium · Sathyamangalam Campus',
      '#f59e0b',
      '#1e293b',
      'library'
    ),
  },

  // EVENTS
  {
    id: 'evt-1',
    section: 'events',
    title: '25th Silver Jubilee Annual Day & Cultural Sangamam',
    subtitle: 'Grand Auditorium Stage · Sathyamangalam',
    category: 'Cultural',
    year: '2026',
    date: '14 Feb 2026',
    description:
      'Over 650 students performed classical Bharatanatyam, Tamil literary drama, orchestral fusion, and felicitation of State Board centum scorers in the presence of district education dignitaries.',
    imageUrl: createEditorialSvgDataUri(
      '25th Silver Jubilee Annual Day',
      'Cultural Sangamam & Academic Awards Night · 2026',
      '#f59e0b',
      '#311042',
      'trophy'
    ),
  },
  {
    id: 'evt-2',
    section: 'events',
    title: 'SRT Sci-Tech & Robotics Expo 2026',
    subtitle: 'Dr. A.P.J. Abdul Kalam Innovation Block',
    category: 'Science & STEM',
    year: '2026',
    date: '28 Jan 2026',
    description:
      'Interactive showcase of 94 working models in autonomous robotics, IoT weather stations, organic chemistry synthesis, and mathematical topology built by Classes VIII to XII.',
    imageUrl: createEditorialSvgDataUri(
      'SRT Sci-Tech & Robotics Expo',
      '94 Student Prototypes · Kalam Innovation Block',
      '#38bdf8',
      '#0c4a6e',
      'lab'
    ),
  },
  {
    id: 'evt-3',
    section: 'events',
    title: 'Pongal Tamizhagam Heritage Festival',
    subtitle: 'Central Green Courtyard',
    category: 'Cultural',
    year: '2026',
    date: '14 Jan 2026',
    description:
      'Traditional Pongal preparation in earthen pots, Silambam martial arts demonstration, Uriyadi, and folk arts celebrating the agrarian heritage of the Bhavani valley.',
    imageUrl: createEditorialSvgDataUri(
      'Pongal Heritage Celebration',
      'Traditional Arts & Silambam Showcase · 2026',
      '#f59e0b',
      '#14532d',
      'campus'
    ),
  },
  {
    id: 'evt-4',
    section: 'events',
    title: 'Higher Secondary Career & University Guidance Summit',
    subtitle: 'Digital Knowledge Seminar Hall',
    category: 'Academics',
    year: '2025',
    date: '18 Nov 2025',
    description:
      'Alumni from IIT Madras, Anna University, Madras Medical College, and ICAI conducted interactive roadmap sessions for Class XI and XII students and parents.',
    imageUrl: createEditorialSvgDataUri(
      'Career & University Guidance Summit',
      'IIT, Medical & Chartered Accountancy Roadmaps · 2025',
      '#a855f7',
      '#1e1b4b',
      'library'
    ),
  },

  // SPORTS
  {
    id: 'spt-1',
    section: 'sports',
    title: 'Erode District U-19 Boys Kabaddi Gold Champions',
    subtitle: 'Divisional Indoor Stadium',
    category: 'Kabaddi',
    year: '2026',
    date: '08 Feb 2026',
    description:
      'Undefeated run across 6 matches clinching the Erode District Higher Secondary Zonal Kabaddi Trophy with 3 players selected for the Tamil Nadu State camp.',
    imageUrl: createEditorialSvgDataUri(
      'U-19 Zonal Kabaddi Champions',
      'Undefeated Gold Medalists · Erode District',
      '#f59e0b',
      '#7c2d12',
      'sports'
    ),
  },
  {
    id: 'spt-2',
    section: 'sports',
    title: 'Annual Track & Field Meet — 4x100m Relay Record',
    subtitle: 'SRT 400m Synthetic Standard Track',
    category: 'Athletics',
    year: '2026',
    date: '22 Jan 2026',
    description:
      'Senior Girls and Boys contingent set new meet records in 4x100m relay, high jump, and javelin throw at the 25th Annual Olympic Torch Meet.',
    imageUrl: createEditorialSvgDataUri(
      'Track & Field Championship',
      '400m Track Meet & Relay Records · Athletics',
      '#10b981',
      '#064e3b',
      'sports'
    ),
  },
  {
    id: 'spt-3',
    section: 'sports',
    title: 'Bharathiar Trophy Inter-School Football Winners',
    subtitle: 'Main Turf Ground',
    category: 'Football',
    year: '2025',
    date: '05 Dec 2025',
    description:
      'SRT Universal XI defeated 16 regional schools in a 3-1 final victory under floodlights, earning Best Goalkeeper and Golden Boot honours.',
    imageUrl: createEditorialSvgDataUri(
      'Inter-School Football Trophy',
      '3–1 Final Victory · Best Goalkeeper & Golden Boot',
      '#38bdf8',
      '#0f172a',
      'sports'
    ),
  },
  {
    id: 'spt-4',
    section: 'sports',
    title: 'Coimbatore–Erode Zone U-17 Cricket Shield',
    subtitle: 'SRT Turf Wicket Oval',
    category: 'Cricket',
    year: '2025',
    date: '19 Oct 2025',
    description:
      'Consistent all-round bowling and an unbeaten century in the semi-final propelled the school U-17 squad to the Zonal Cricket Shield title.',
    imageUrl: createEditorialSvgDataUri(
      'Zonal U-17 Cricket Shield',
      'Champions · SRT Turf Wicket Oval',
      '#f59e0b',
      '#1e3a8a',
      'sports'
    ),
  },

  // ACHIEVEMENTS
  {
    id: 'ach-1',
    section: 'achievements',
    title: 'Class XII Public Exam — 596 / 600 District First Rank',
    subtitle: 'Selvi. Harini V. · Bio-Maths Stream (Centum in Physics, Chemistry, Maths, Biology)',
    category: 'Board Results',
    year: '2026',
    date: 'May 2026',
    description:
      'Secured Erode District First Rank with 4 subject centums and 100% overall pass result across all 412 appearing Class XII students.',
    imageUrl: createEditorialSvgDataUri(
      '596 / 600 — District First Rank',
      'Selvi. Harini V. · 4 Centums in Class XII Board Exam',
      '#f59e0b',
      '#1e3a8a',
      'trophy'
    ),
  },
  {
    id: 'ach-2',
    section: 'achievements',
    title: '18 Students Qualified in NEET-UG with 650+ Scores',
    subtitle: 'Government Medical College Admissions Batch',
    category: 'Competitive Exams',
    year: '2026',
    date: 'Jun 2026',
    description:
      'Our integrated residential NEET coaching wing produced 18 qualifiers entering premier Government Medical Colleges across Tamil Nadu, led by Master Praveen R. (685/720).',
    imageUrl: createEditorialSvgDataUri(
      '18 NEET-UG Medical Qualifiers',
      'Top Score: 685 / 720 · Integrated Residential Batch',
      '#10b981',
      '#064e3b',
      'trophy'
    ),
  },
  {
    id: 'ach-3',
    section: 'achievements',
    title: '47 Subject Centums in Class XII & X State Board Examinations',
    subtitle: 'Mathematics, Computer Science, Accountancy & Chemistry',
    category: 'Board Results',
    year: '2025',
    date: 'May 2025',
    description:
      '86% of appearing students scored above 500/600, reaffirming SRT Universal’s benchmark academic pedagogy in Erode District.',
    imageUrl: createEditorialSvgDataUri(
      '47 State Board Subject Centums',
      '100% Pass Result · 86% Above 500/600 Marks',
      '#38bdf8',
      '#0c4a6e',
      'trophy'
    ),
  },
  {
    id: 'ach-4',
    section: 'achievements',
    title: 'Best Eco-Green & Smart Campus Award — Tamil Nadu Education Forum',
    subtitle: '100% Solar-Powered Academic Blocks & Rainwater Harvesting',
    category: 'Institutional Award',
    year: '2025',
    date: 'Sep 2025',
    description:
      'Recognized at the State level for zero-waste residential dining, botanical medicinal garden, and 60kW rooftop solar installation.',
    imageUrl: createEditorialSvgDataUri(
      'State Best Eco-Green Smart Campus',
      'Tamil Nadu Education Excellence Award · 2025',
      '#f59e0b',
      '#14532d',
      'campus'
    ),
  },

  // FACULTY
  {
    id: 'fac-1',
    section: 'faculty',
    title: 'Prof. R. Balasubramaniam, M.Sc., M.Phil., B.Ed.',
    subtitle: 'Head of Department — Physics & Senior NEET/JEE Mentor (22 Yrs Exp.)',
    category: 'Science Stream',
    year: '2026',
    date: 'Since 2006',
    description:
      'Recipient of the Dr. Radhakrishnan Best Teacher Award; specializes in electrodynamics, optics, and experimental physics apparatus design.',
    imageUrl: createEditorialSvgDataUri(
      'Prof. R. Balasubramaniam',
      'HOD Physics · 22 Years Academic Mentorship',
      '#38bdf8',
      '#0f172a',
      'faculty'
    ),
  },
  {
    id: 'fac-2',
    section: 'faculty',
    title: 'Mrs. K. Mythili, M.Sc. (Maths), M.Ed.',
    subtitle: 'Head of Department — Mathematics & Olympiad Coordinator (19 Yrs Exp.)',
    category: 'Mathematics',
    year: '2026',
    date: 'Since 2008',
    description:
      'Has guided over 140 centum scorers in Higher Secondary Mathematics through structured problem-solving clinics.',
    imageUrl: createEditorialSvgDataUri(
      'Mrs. K. Mythili, M.Sc., M.Ed.',
      'HOD Mathematics · 140+ Board Centum Mentorships',
      '#f59e0b',
      '#1e293b',
      'faculty'
    ),
  },
  {
    id: 'fac-3',
    section: 'faculty',
    title: 'Mr. V. Karthikeyan, M.C.A., M.Phil.',
    subtitle: 'Senior Coordinator — Computer Science, AI & Robotics Lab (15 Yrs Exp.)',
    category: 'Computer Science',
    year: '2026',
    date: 'Since 2012',
    description:
      'Leads Python, Data Structures, and embedded robotics mentorship for Group II scholars and district innovation teams.',
    imageUrl: createEditorialSvgDataUri(
      'Mr. V. Karthikeyan, M.C.A.',
      'Coordinator · Computer Science & Robotics Lab',
      '#10b981',
      '#064e3b',
      'faculty'
    ),
  },
  {
    id: 'fac-4',
    section: 'faculty',
    title: 'Dr. P. Shanmugapriya, M.Com., Ph.D.',
    subtitle: 'Head of Department — Commerce, Accountancy & CA Foundation (17 Yrs Exp.)',
    category: 'Commerce Stream',
    year: '2026',
    date: 'Since 2010',
    description:
      'Mentors Group IV Commerce scholars in corporate accounting, financial literacy, and Chartered Accountancy foundation prep.',
    imageUrl: createEditorialSvgDataUri(
      'Dr. P. Shanmugapriya, Ph.D.',
      'HOD Commerce & CA Foundation Wing',
      '#a855f7',
      '#1e1b4b',
      'faculty'
    ),
  },

  // TESTIMONIALS
  {
    id: 'tst-1',
    section: 'testimonials',
    title: 'Dr. Aravindhan S. (MBBS — Madras Medical College, Alumni Batch 2022)',
    subtitle: 'Former Residential Hostel Scholar · Sathyamangalam',
    category: 'Alumni',
    year: '2026',
    date: '2026',
    description:
      'Joining SRT Universal Hostel in Class XI transformed my preparation. Evening doubt-clearing sessions with faculty right on campus helped me score 672 in NEET on my first attempt without needing external coaching.',
    imageUrl: createEditorialSvgDataUri(
      'Dr. Aravindhan S. · Batch 2022',
      'Madras Medical College · NEET Score 672/720',
      '#f59e0b',
      '#0f172a',
      'faculty'
    ),
  },
  {
    id: 'tst-2',
    section: 'testimonials',
    title: 'Mrs. Deepa Venkatesh (Parent of Class XII & VIII Day Scholars)',
    subtitle: 'Gobichettipalayam / Sathyamangalam Route',
    category: 'Parent',
    year: '2026',
    date: '2026',
    description:
      'The GPS-enabled school bus fleet, disciplined campus atmosphere, and monthly one-on-one parent academic reviews give us complete confidence. Both our children have grown in academic focus and public speaking.',
    imageUrl: createEditorialSvgDataUri(
      'Mrs. Deepa Venkatesh',
      'Parent Testimonial · Day Scholar Programme',
      '#38bdf8',
      '#0f172a',
      'faculty'
    ),
  },

  // DOWNLOADS
  {
    id: 'dl-1',
    section: 'downloads',
    title: '2026–2027 Prospectus & Academic Handbook (PDF)',
    subtitle: 'Complete overview of Higher Secondary Streams, Labs & Hostel Rules',
    category: 'Prospectus',
    year: '2026',
    date: 'Updated Mar 2026',
    description:
      'Includes eligibility criteria, subject group combinations for Classes XI & XII, scholarship slabs for board toppers, and campus code of conduct.',
    imageUrl: '#download-prospectus-2026',
  },
  {
    id: 'dl-2',
    section: 'downloads',
    title: 'Annual Tuition, Transport & Residential Hostel Fee Structure 2026–27',
    subtitle: 'Transparent term-wise fee schedule for LKG to Class XII',
    category: 'Fee Structure',
    year: '2026',
    date: 'Updated Mar 2026',
    description:
      'Term I, II, and III fee breakdown for Day Scholars and AC/Non-AC Hostel wings along with merit scholarship waivers.',
    imageUrl: '#download-fee-structure-2026',
  },
  {
    id: 'dl-3',
    section: 'downloads',
    title: 'Academic Calendar & Examination Schedule 2026–2027',
    subtitle: 'Term exams, practical dates, parent-teacher meets & holidays',
    category: 'Calendar',
    year: '2026',
    date: 'Updated Apr 2026',
    description:
      'Month-by-month academic planner covering unit tests, quarterly/half-yearly assessments, sports day, and practical exam windows.',
    imageUrl: '#download-academic-calendar-2026',
  },

  // FAQ
  {
    id: 'faq-1',
    section: 'faq',
    title: 'What Higher Secondary groups are offered in Class XI & XII?',
    category: 'Academics',
    year: '2026',
    date: '2026',
    description:
      'We offer four comprehensive groups: Group I (Mathematics, Physics, Chemistry, Biology), Group II (Mathematics, Physics, Chemistry, Computer Science), Group III (Physics, Chemistry, Botany, Zoology), and Group IV (Commerce, Accountancy, Economics, Computer Applications / Business Maths).',
    imageUrl: 'faq',
  },
  {
    id: 'faq-2',
    section: 'faq',
    title: 'What facilities are provided in the Residential Hostel for boys and girls?',
    category: 'Hostel & Campus',
    year: '2026',
    date: '2026',
    description:
      'Separate, secure residential blocks for boys and girls with 24/7 resident wardens, CCTV surveillance, nutritious vegetarian & wholesome dining prepared in a steam-sterilized kitchen, supervised evening study hours with subject faculty, RO drinking water, solar hot water, and an on-campus infirmary.',
    imageUrl: 'faq',
  },
  {
    id: 'faq-3',
    section: 'faq',
    title: 'Which towns are covered by the SRT School Bus Transport fleet?',
    category: 'Transport',
    year: '2026',
    date: '2026',
    description:
      'Our fleet of 34 GPS-tracked buses covers Sathyamangalam, Bhavani Sagar, Punjai Puliampatti, Gobichettipalayam, Bannari, Kavanthandapatti, Sirumugai, and Annur within a 40 km radius.',
    imageUrl: 'faq',
  },
  {
    id: 'faq-4',
    section: 'faq',
    title: 'How can parents track their Pre-Admission Application status?',
    category: 'Admissions',
    year: '2026',
    date: '2026',
    description:
      'After submitting the 4-step online Pre-Admission form, parents receive a unique Application ID (e.g., SRT-2026-1042) and can sign in on the Pre-Admission page anytime using their registered email or Application ID to check live status (Pending, Accepted, or Rejected).',
    imageUrl: 'faq',
  },
];

export const INITIAL_ADMISSIONS: AdmissionApplication[] = [
  {
    id: 'seed-adm-1',
    applicationId: 'SRT-2026-1001',
    applicantUid: 'demo-parent-1',
    studentName: 'Kavin Prakash S.',
    gender: 'Male',
    dob: '2010-05-14',
    batch: '2026-2027',
    gradeApplying: 'Class XI - Group I (Maths, Physics, Chemistry, Biology)',
    residenceType: 'Hostel',
    parentName: 'S. Prakash',
    phone: '9842711220',
    address: '42B Mysore Trunk Road, Bannari Post, Sathyamangalam - 638401',
    email: 'prakash.sathy@example.com',
    status: 'accepted',
    createdAt: '2026-03-10T09:30:00.000Z',
    updatedAt: '2026-03-12T14:15:00.000Z',
  },
  {
    id: 'seed-adm-2',
    applicationId: 'SRT-2026-1002',
    applicantUid: 'demo-parent-2',
    studentName: 'Dhivya Bharathi M.',
    gender: 'Female',
    dob: '2010-11-03',
    batch: '2026-2027',
    gradeApplying: 'Class XI - Group II (Maths, Physics, Chemistry, Computer Science)',
    residenceType: 'Day Scholar',
    parentName: 'M. Murugesan',
    phone: '9443288910',
    address: '18 Gandhi Nagar, Gobichettipalayam Main Road, Sathyamangalam - 638402',
    email: 'murugesan.gobi@example.com',
    status: 'pending',
    createdAt: '2026-03-18T11:20:00.000Z',
    updatedAt: '2026-03-18T11:20:00.000Z',
  },
  {
    id: 'seed-adm-3',
    applicationId: 'SRT-2026-1003',
    applicantUid: 'demo-parent-3',
    studentName: 'Sanjay Vikraman R.',
    gender: 'Male',
    dob: '2012-07-22',
    batch: '2026-2027',
    gradeApplying: 'Class IX - State Board English Medium',
    residenceType: 'Day Scholar',
    parentName: 'R. Vikraman',
    phone: '9789455123',
    address: '7 North Car Street, Punjai Puliampatti, Erode District - 638459',
    email: 'vikraman.puliampatti@example.com',
    status: 'pending',
    createdAt: '2026-03-21T16:05:00.000Z',
    updatedAt: '2026-03-21T16:05:00.000Z',
  },
  {
    id: 'seed-adm-4',
    applicationId: 'SRT-2026-1004',
    applicantUid: 'demo-parent-4',
    studentName: 'Nandhini Karthik',
    gender: 'Female',
    dob: '2010-02-19',
    batch: '2026-2027',
    gradeApplying: 'Class XI - Group IV (Commerce, Accountancy, Economics, CA)',
    residenceType: 'Hostel',
    parentName: 'K. Karthik',
    phone: '9944123890',
    address: '112 Mettupalayam Road, Sirumugai - 641302',
    email: 'karthik.sirumugai@example.com',
    status: 'accepted',
    createdAt: '2026-03-04T10:10:00.000Z',
    updatedAt: '2026-03-06T17:00:00.000Z',
  },
];

export const INITIAL_CONTACT_MESSAGES: ContactMessage[] = [
  {
    id: 'msg-1',
    senderUid: 'visitor-1',
    name: 'Senthil Kumar P.',
    email: 'senthil.erode@example.com',
    phone: '9842765432',
    subject: 'Class XI Bio-Maths Hostel Campus Visit Request',
    message:
      'We would like to visit the residential hostel and physics/biology labs this Saturday at 11:00 AM with our son who scored 482/500 in Class X.',
    status: 'unread',
    createdAt: '2026-03-22T08:45:00.000Z',
    updatedAt: '2026-03-22T08:45:00.000Z',
  },
  {
    id: 'msg-2',
    senderUid: 'visitor-2',
    name: 'Lakshmi Narayanan',
    email: 'lakshmi.cbe@example.com',
    phone: '9443198765',
    subject: 'School Bus Route Inquiry — Punjai Puliampatti',
    message:
      'Kindly share the morning pickup timing and stop point near Punjai Puliampatti bus stand for Class VI Day Scholars.',
    status: 'read',
    createdAt: '2026-03-19T14:10:00.000Z',
    updatedAt: '2026-03-20T09:00:00.000Z',
  },
];

export const INITIAL_ADMINS: AdminUserRecord[] = [
  {
    uid: 'bootstrap-super-admin',
    email: 'nishanthv041@gmail.com',
    role: 'super_admin',
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

export const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'rt-ann-1',
    title:
      'URGENT: Pre-Admission Counseling & Scholarship Entrance Slot Booking Open for 2026–2027 Batch (Classes LKG to XI)',
    category: 'Admissions',
    priority: 'urgent',
    isUrgent: true,
    active: true,
    date: '2026-03-25',
    link: '/admissions',
    authorUid: 'bootstrap-super-admin',
    createdAt: '2026-03-25T09:00:00.000Z',
    updatedAt: '2026-03-25T09:00:00.000Z',
  },
  {
    id: 'rt-ann-2',
    title:
      'SRT Universal Scholars Clinch First Prize at Erode District Higher Secondary STEM & Robotics Exhibition',
    category: 'Achievements',
    priority: 'standard',
    isUrgent: false,
    active: true,
    date: '2026-03-18',
    link: '/galleries?tab=achievements',
    authorUid: 'bootstrap-super-admin',
    createdAt: '2026-03-18T10:00:00.000Z',
    updatedAt: '2026-03-18T10:00:00.000Z',
  },
  {
    id: 'rt-ann-3',
    title:
      'Integrated NEET, JEE (Main) & CUET Foundation Bridge Course Commences April 10, 2026 for Incoming Class XI Scholars',
    category: 'Academics',
    priority: 'urgent',
    isUrgent: true,
    active: true,
    date: '2026-03-15',
    link: '/academics',
    authorUid: 'bootstrap-super-admin',
    createdAt: '2026-03-15T11:30:00.000Z',
    updatedAt: '2026-03-15T11:30:00.000Z',
  },
  {
    id: 'rt-ann-4',
    title:
      'Residential Hostel AC & Non-AC Wing Room Allotment & Campus Tour Schedule Released for Outstation Parents',
    category: 'Hostel',
    priority: 'standard',
    isUrgent: false,
    active: true,
    date: '2026-03-10',
    link: '/about',
    authorUid: 'bootstrap-super-admin',
    createdAt: '2026-03-10T08:00:00.000Z',
    updatedAt: '2026-03-10T08:00:00.000Z',
  },
];

