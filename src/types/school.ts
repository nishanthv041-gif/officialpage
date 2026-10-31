export type GallerySection =
  | 'events'
  | 'sports'
  | 'achievements'
  | 'announcements'
  | 'faculty'
  | 'testimonials'
  | 'downloads'
  | 'faq';

export interface SocialLinks {
  facebook: string;
  instagram: string;
  youtube: string;
  twitter: string;
  whatsapp: string;
  linkedin: string;
  enabled: {
    facebook: boolean;
    instagram: boolean;
    youtube: boolean;
    twitter: boolean;
    whatsapp: boolean;
    linkedin: boolean;
  };
}

export interface FeatureToggles {
  enableEventsEditing: boolean;
  enableSportsEditing: boolean;
  admissionFormOpen: boolean;
  contactFormOpen: boolean;
  darkModeDefault: boolean;
  maintenanceMode: boolean;
  enable3DHero: boolean;
}

export interface SiteConfig {
  schoolName: string;
  tagline: string;
  location: string;
  heroHeadline: string;
  heroSubtext: string;
  welcomeTitle: string;
  welcomeMessage: string;
  principalName: string;
  principalTitle: string;
  principalMessage: string;
  vision: string;
  mission: string;
  history: string;
  address: string;
  phonePrimary: string;
  phoneSecondary: string;
  email: string;
  workingHours: string;
  googleMapsUrl: string;
  googleMapsEmbedUrl: string;
  whatsappNumber: string;
  studentsCount: number;
  teachersCount: number;
  yearsCount: number;
  awardsCount: number;
  socialLinks: SocialLinks;
  featureToggles: FeatureToggles;
  updatedAt?: string;
  updatedBy?: string;
}

export interface GalleryItem {
  id: string;
  section: GallerySection;
  title: string;
  subtitle?: string;
  category: string;
  year: string;
  date: string;
  description: string;
  imageUrl: string;
  additionalImages?: string[];
  authorUid?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AdmissionStatus = 'pending' | 'accepted' | 'rejected';

export interface AdmissionApplication {
  id: string;
  applicationId: string;
  applicantUid: string;
  studentName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  batch: string;
  gradeApplying: string;
  residenceType: 'Day Scholar' | 'Hostel';
  parentName: string;
  phone: string;
  address: string;
  email: string;
  status: AdmissionStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ContactMessage {
  id: string;
  senderUid: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserRecord {
  uid: string;
  email: string;
  role: 'super_admin' | 'editor';
  createdAt: string;
}

export type AnnouncementPriority = 'urgent' | 'standard';

export interface AnnouncementItem {
  id: string;
  title: string;
  category: string;
  priority: AnnouncementPriority;
  isUrgent: boolean;
  active: boolean;
  date: string;
  link?: string;
  authorUid: string;
  createdAt: string;
  updatedAt: string;
}

