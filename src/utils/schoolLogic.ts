import { AdmissionApplication, GalleryItem } from '../types/school';

export interface PasswordStrengthResult {
  score: number; // 0 to 4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const checks = [hasMinLength, hasUppercase, hasNumber, hasSpecial];
  const score = checks.filter(Boolean).length;

  let label: PasswordStrengthResult['label'] = 'Weak';
  if (score === 2) label = 'Fair';
  else if (score === 3) label = 'Good';
  else if (score === 4) label = 'Strong';

  return {
    score,
    label,
    hasMinLength,
    hasUppercase,
    hasNumber,
    hasSpecial,
  };
}

export function validateIndianPhone(phone: string): boolean {
  return /^[0-9]{10}$/.test(phone.trim());
}

export function generateApplicationId(batch: string, sequenceSeed?: number): string {
  const yearPrefix = batch.split('-')[0]?.replace(/[^0-9]/g, '') || '2026';
  const suffix =
    typeof sequenceSeed === 'number'
      ? String(1000 + (sequenceSeed % 9000)).padStart(4, '0')
      : String(Math.floor(1000 + Math.random() * 9000));
  return `SRT-${yearPrefix}-${suffix}`;
}

export function isDuplicateAdmissionEmail(
  email: string,
  existingApplications: Pick<AdmissionApplication, 'email'>[]
): boolean {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return false;
  return existingApplications.some((app) => app.email.trim().toLowerCase() === normalized);
}

export function filterGalleryItems(
  items: GalleryItem[],
  options: {
    section: GalleryItem['section'];
    category?: string;
    year?: string;
    searchQuery?: string;
  }
): GalleryItem[] {
  const { section, category = 'All', year = 'All', searchQuery = '' } = options;
  const q = searchQuery.trim().toLowerCase();

  return items.filter((item) => {
    if (item.section !== section) return false;
    if (category !== 'All' && item.category !== category) return false;
    if (year !== 'All' && item.year !== year) return false;
    if (q) {
      const hay = `${item.title} ${item.subtitle || ''} ${item.description} ${item.category} ${item.year}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function filterAdmissions(
  applications: AdmissionApplication[],
  options: {
    status?: 'all' | AdmissionApplication['status'];
    searchQuery?: string;
    residenceType?: 'All' | 'Day Scholar' | 'Hostel';
    sortBy?: 'newest' | 'oldest' | 'name';
  }
): AdmissionApplication[] {
  const {
    status = 'all',
    searchQuery = '',
    residenceType = 'All',
    sortBy = 'newest',
  } = options;
  const q = searchQuery.trim().toLowerCase();

  const filtered = applications.filter((app) => {
    if (status !== 'all' && app.status !== status) return false;
    if (residenceType !== 'All' && app.residenceType !== residenceType) return false;
    if (q) {
      const hay = `${app.applicationId} ${app.studentName} ${app.parentName} ${app.email} ${app.phone} ${app.gradeApplying}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return [...filtered].sort((a, b) => {
    if (sortBy === 'name') {
      return a.studentName.localeCompare(b.studentName);
    }
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return sortBy === 'oldest' ? timeA - timeB : timeB - timeA;
  });
}

export function convertAdmissionsToCsv(applications: AdmissionApplication[]): string {
  const headers = [
    'Application ID',
    'Student Name',
    'Gender',
    'DOB',
    'Batch',
    'Class/Group',
    'Residence Status',
    'Parent/Guardian Name',
    'Phone',
    'Email',
    'Address',
    'Status',
    'Submitted At',
  ];

  const escapeCsvCell = (value: string) => {
    const clean = String(value ?? '').replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = applications.map((app) =>
    [
      app.applicationId,
      app.studentName,
      app.gender,
      app.dob,
      app.batch,
      app.gradeApplying,
      app.residenceType,
      app.parentName,
      app.phone,
      app.email,
      app.address,
      app.status.toUpperCase(),
      app.createdAt,
    ]
      .map(escapeCsvCell)
      .join(',')
  );

  return [headers.map(escapeCsvCell).join(','), ...rows].join('\n');
}
