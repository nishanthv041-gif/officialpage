import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePasswordStrength,
  validateIndianPhone,
  generateApplicationId,
  isDuplicateAdmissionEmail,
  filterGalleryItems,
  filterAdmissions,
  convertAdmissionsToCsv,
  sortAndFilterActiveAnnouncements,
  resolveSpaRouteTarget,
} from './schoolLogic';
import { AdmissionApplication, AnnouncementItem, GalleryItem } from '../types/school';

test('evaluatePasswordStrength scores password complexity accurately', () => {
  const weak = evaluatePasswordStrength('abc');
  assert.equal(weak.score, 0);
  assert.equal(weak.label, 'Weak');

  const strong = evaluatePasswordStrength('SrtSchool@2026');
  assert.equal(strong.score, 4);
  assert.equal(strong.label, 'Strong');
  assert.equal(strong.hasMinLength, true);
  assert.equal(strong.hasUppercase, true);
  assert.equal(strong.hasNumber, true);
  assert.equal(strong.hasSpecial, true);
});

test('validateIndianPhone accepts only 10-digit numeric strings', () => {
  assert.equal(validateIndianPhone('9842722045'), true);
  assert.equal(validateIndianPhone('98427 22045'), false);
  assert.equal(validateIndianPhone('984272204'), false);
  assert.equal(validateIndianPhone('98427220451'), false);
});

test('generateApplicationId creates deterministic formatted IDs', () => {
  const id = generateApplicationId('2026-2027', 42);
  assert.equal(id, 'SRT-2026-1042');
  assert.match(id, /^[a-zA-Z0-9_\-]+$/);
});

test('isDuplicateAdmissionEmail detects case-insensitive duplicate emails', () => {
  const list = [{ email: 'parent.kumar@example.com' }, { email: 'meena@example.com' }];
  assert.equal(isDuplicateAdmissionEmail('PARENT.KUMAR@example.com ', list), true);
  assert.equal(isDuplicateAdmissionEmail('new.parent@example.com', list), false);
});

test('filterGalleryItems filters by section, category, year, and query', () => {
  const sample: GalleryItem[] = [
    {
      id: '1',
      section: 'sports',
      title: 'Zonal Kabaddi Gold',
      category: 'Kabaddi',
      year: '2026',
      date: '2026-02-14',
      description: 'Under-19 boys team won the Erode District Zonal Championship.',
      imageUrl: 'data:image/svg+xml;utf8,<svg></svg>',
    },
    {
      id: '2',
      section: 'sports',
      title: 'Inter-School Athletics Meet',
      category: 'Athletics',
      year: '2025',
      date: '2025-11-20',
      description: '4x100m relay record at Sathyamangalam Stadium.',
      imageUrl: 'data:image/svg+xml;utf8,<svg></svg>',
    },
  ];

  const kabaddiOnly = filterGalleryItems(sample, { section: 'sports', category: 'Kabaddi' });
  assert.equal(kabaddiOnly.length, 1);
  assert.equal(kabaddiOnly[0].id, '1');

  const year2025 = filterGalleryItems(sample, { section: 'sports', year: '2025' });
  assert.equal(year2025.length, 1);
  assert.equal(year2025[0].id, '2');
});

test('filterAdmissions and convertAdmissionsToCsv filter and format records properly', () => {
  const apps: AdmissionApplication[] = [
    {
      id: 'a1',
      applicationId: 'SRT-2026-1001',
      applicantUid: 'u1',
      studentName: 'Kavin Prakash',
      gender: 'Male',
      dob: '2010-05-12',
      batch: '2026-2027',
      gradeApplying: 'Class XI - Bio-Maths (Group I)',
      residenceType: 'Hostel',
      parentName: 'Prakash S',
      phone: '9842711223',
      address: '14 Mysore Trunk Road, Sathyamangalam',
      email: 'prakash@example.com',
      status: 'accepted',
      createdAt: '2026-03-10T10:00:00.000Z',
      updatedAt: '2026-03-11T10:00:00.000Z',
    },
    {
      id: 'a2',
      applicationId: 'SRT-2026-1002',
      applicantUid: 'u2',
      studentName: 'Ananya Ramesh',
      gender: 'Female',
      dob: '2011-08-21',
      batch: '2026-2027',
      gradeApplying: 'Class XI - Computer Science (Group II)',
      residenceType: 'Day Scholar',
      parentName: 'Ramesh K',
      phone: '9443011223',
      address: 'Bannari Main Road, Sathyamangalam',
      email: 'ramesh@example.com',
      status: 'pending',
      createdAt: '2026-03-12T10:00:00.000Z',
      updatedAt: '2026-03-12T10:00:00.000Z',
    },
  ];

  const accepted = filterAdmissions(apps, { status: 'accepted' });
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0].applicationId, 'SRT-2026-1001');

  const csv = convertAdmissionsToCsv(accepted);
  assert.ok(csv.includes('"SRT-2026-1001"'));
  assert.ok(csv.includes('"Kavin Prakash"'));
  assert.ok(csv.includes('"ACCEPTED"'));
});

test('sortAndFilterActiveAnnouncements filters inactive items and prioritizes urgent updates first', () => {
  const sample: AnnouncementItem[] = [
    {
      id: 'ann-1',
      title: 'Standard Academic Notice',
      category: 'Academics',
      priority: 'standard',
      isUrgent: false,
      active: true,
      date: '2026-03-20',
      authorUid: 'admin-1',
      createdAt: '2026-03-20T10:00:00.000Z',
      updatedAt: '2026-03-20T10:00:00.000Z',
    },
    {
      id: 'ann-2',
      title: 'Urgent Pre-Admission Counseling Window Extended',
      category: 'Admissions',
      priority: 'urgent',
      isUrgent: true,
      active: true,
      date: '2026-03-18',
      authorUid: 'admin-1',
      createdAt: '2026-03-18T10:00:00.000Z',
      updatedAt: '2026-03-18T10:00:00.000Z',
    },
    {
      id: 'ann-3',
      title: 'Archived Notice',
      category: 'General',
      priority: 'urgent',
      isUrgent: true,
      active: false,
      date: '2026-03-25',
      authorUid: 'admin-1',
      createdAt: '2026-03-25T10:00:00.000Z',
      updatedAt: '2026-03-25T10:00:00.000Z',
    },
  ];

  const sorted = sortAndFilterActiveAnnouncements(sample);
  assert.equal(sorted.length, 2);
  assert.equal(sorted[0].id, 'ann-2');
  assert.equal(sorted[1].id, 'ann-1');
});

test('resolveSpaRouteTarget normalizes /admin hash, query, and trailing-slash variations', () => {
  assert.equal(resolveSpaRouteTarget('/', '', '#/admin'), '/admin');
  assert.equal(resolveSpaRouteTarget('/', '', '#admin'), '/admin');
  assert.equal(resolveSpaRouteTarget('/', '?page=admin', ''), '/admin');
  assert.equal(resolveSpaRouteTarget('/', '?admin=1&module=settings', ''), '/admin?module=settings');
  assert.equal(resolveSpaRouteTarget('/admin/', '', ''), '/admin');
  assert.equal(resolveSpaRouteTarget('/Admin', '', ''), '/admin');
  assert.equal(resolveSpaRouteTarget('/admin', '', ''), null);
});


