import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  auth,
  db,
  storage,
  googleProvider,
  OperationType,
  handleFirestoreError,
} from '../services/firebase';
import {
  AdmissionApplication,
  AdmissionStatus,
  AdminUserRecord,
  AnnouncementItem,
  ContactMessage,
  GalleryItem,
  SiteConfig,
} from '../types/school';
import {
  INITIAL_ADMINS,
  INITIAL_ADMISSIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_CONTACT_MESSAGES,
  INITIAL_GALLERY_ITEMS,
  INITIAL_SITE_CONFIG,
} from '../data/seedData';
import { generateApplicationId, isDuplicateAdmissionEmail } from '../utils/schoolLogic';

export interface ToastNotice {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'info';
}

interface SchoolDataContextValue {
  siteConfig: SiteConfig;
  galleryItems: GalleryItem[];
  announcements: AnnouncementItem[];
  admissions: AdmissionApplication[];
  contactMessages: ContactMessage[];
  admins: AdminUserRecord[];
  currentUser: User | null;
  isAuthReady: boolean;
  isAdminUnlocked: boolean;
  adminEmail: string | null;
  failedLoginAttempts: number;
  lockoutUntil: number | null;
  theme: 'dark' | 'light';
  toasts: ToastNotice[];
  toggleTheme: () => void;
  showToast: (title: string, message?: string, type?: ToastNotice['type']) => void;
  dismissToast: (id: string) => void;
  signInWithGoogle: () => Promise<User | null>;
  unlockAdminWithPasskey: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  lockAdminSession: () => Promise<void>;
  updateSiteConfig: (partial: Partial<SiteConfig>) => Promise<void>;
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGalleryItem: (id: string, partial: Partial<GalleryItem>) => Promise<void>;
  deleteGalleryItem: (id: string) => Promise<void>;
  reorderGalleryItem: (id: string, direction: 'up' | 'down') => void;
  addAnnouncement: (payload: {
    title: string;
    category: string;
    isUrgent: boolean;
    date: string;
    link?: string;
  }) => Promise<void>;
  toggleAnnouncementUrgent: (id: string) => Promise<void>;
  toggleAnnouncementActive: (id: string) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  uploadMediaFile: (file: File, folder: string) => Promise<string>;
  submitAdmission: (
    payload: Omit<
      AdmissionApplication,
      'id' | 'applicationId' | 'applicantUid' | 'status' | 'createdAt' | 'updatedAt'
    >
  ) => Promise<{ ok: boolean; application?: AdmissionApplication; error?: string }>;
  updateAdmissionStatus: (id: string, status: AdmissionStatus) => Promise<void>;
  deleteAdmission: (id: string) => Promise<void>;
  findAdmissionByCredentials: (emailOrAppId: string) => AdmissionApplication | null;
  submitContactMessage: (
    payload: Omit<ContactMessage, 'id' | 'senderUid' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updateContactMessageStatus: (id: string, status: ContactMessage['status']) => Promise<void>;
  deleteContactMessage: (id: string) => Promise<void>;
  addAdminUser: (email: string, role: AdminUserRecord['role']) => Promise<void>;
  removeAdminUser: (uid: string) => Promise<void>;
  updateAdminPassword: (currentPass: string, newPass: string) => { ok: boolean; error?: string };
}

const SchoolDataContext = createContext<SchoolDataContextValue | undefined>(undefined);

const STORAGE_KEYS = {
  SITE_CONFIG: 'srt_site_config_v1',
  GALLERY: 'srt_gallery_items_v1',
  ANNOUNCEMENTS: 'srt_announcements_v1',
  ADMISSIONS: 'srt_admissions_v1',
  CONTACTS: 'srt_contacts_v1',
  ADMINS: 'srt_admins_v1',
  ADMIN_PASS: 'srt_admin_pass_v1',
  ADMIN_SESSION: 'srt_admin_session_v1',
  THEME: 'srt_theme_v1',
};

function loadStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() =>
    loadStored(STORAGE_KEYS.SITE_CONFIG, INITIAL_SITE_CONFIG)
  );
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() =>
    loadStored(STORAGE_KEYS.GALLERY, INITIAL_GALLERY_ITEMS)
  );
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(() =>
    loadStored(STORAGE_KEYS.ANNOUNCEMENTS, INITIAL_ANNOUNCEMENTS)
  );
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(() =>
    loadStored(STORAGE_KEYS.ADMISSIONS, INITIAL_ADMISSIONS)
  );
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>(() =>
    loadStored(STORAGE_KEYS.CONTACTS, INITIAL_CONTACT_MESSAGES)
  );
  const [admins, setAdmins] = useState<AdminUserRecord[]>(() =>
    loadStored(STORAGE_KEYS.ADMINS, INITIAL_ADMINS)
  );

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState<boolean>(() => {
    try {
      const session = sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION);
      return session === 'unlocked';
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string | null>(() => {
    try {
      return sessionStorage.getItem('srt_admin_email_v1') || null;
    } catch {
      return null;
    }
  });
  const [failedLoginAttempts, setFailedLoginAttempts] = useState<number>(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {
      // ignore
    }
    return 'dark';
  });

  const [toasts, setToasts] = useState<ToastNotice[]>([]);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastNotice['type'] = 'success') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, title, message, type }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Sync theme with <html class="dark">
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Persist local state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SITE_CONFIG, JSON.stringify(siteConfig));
    } catch {
      // ignore
    }
  }, [siteConfig]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GALLERY, JSON.stringify(galleryItems));
    } catch {
      // ignore
    }
  }, [galleryItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(announcements));
    } catch {
      // ignore
    }
  }, [announcements]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMISSIONS, JSON.stringify(admissions));
    } catch {
      // ignore
    }
  }, [admissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contactMessages));
    } catch {
      // ignore
    }
  }, [contactMessages]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(admins));
    } catch {
      // ignore
    }
  }, [admins]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthReady(true);
      if (user?.email) {
        const isMatchedAdmin = admins.some(
          (a) => a.email.toLowerCase() === user.email?.toLowerCase()
        );
        if (isMatchedAdmin) {
          setIsAdminUnlocked(true);
          setAdminEmail(user.email);
          try {
            sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'unlocked');
            sessionStorage.setItem('srt_admin_email_v1', user.email);
          } catch {
            // ignore
          }
        }
      }
    });
    return () => unsubscribe();
  }, [admins]);

  // Real-time Firestore listener for public site_config/main
  useEffect(() => {
    if (!isAuthReady) return;
    const configRef = doc(db, 'site_config', 'main');
    const unsub = onSnapshot(
      configRef,
      (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setSiteConfig((prev) => ({
            ...prev,
            ...data,
          }));
        }
      },
      () => {
        // Ignore when initial doc does not exist yet
      }
    );
    return () => unsub();
  }, [isAuthReady]);

  // Real-time Firestore listener for public announcements collection
  useEffect(() => {
    if (!isAuthReady) return;
    const announcementsQuery = query(
      collection(db, 'announcements'),
      where('active', 'in', [true, false])
    );
    const unsub = onSnapshot(
      announcementsQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteItems: AnnouncementItem[] = snap.docs.map((d) => {
            const raw = d.data();
            return {
              id: d.id,
              title: String(raw.title || ''),
              category: String(raw.category || 'General'),
              priority: raw.priority === 'urgent' ? 'urgent' : 'standard',
              isUrgent: Boolean(raw.isUrgent),
              active: raw.active !== false,
              date: String(raw.date || new Date().toISOString().slice(0, 10)),
              ...(raw.link ? { link: String(raw.link) } : {}),
              authorUid: String(raw.authorUid || 'admin'),
              createdAt:
                typeof raw.createdAt?.toDate === 'function'
                  ? raw.createdAt.toDate().toISOString()
                  : String(raw.createdAt || new Date().toISOString()),
              updatedAt:
                typeof raw.updatedAt?.toDate === 'function'
                  ? raw.updatedAt.toDate().toISOString()
                  : String(raw.updatedAt || new Date().toISOString()),
            };
          });
          setAnnouncements((prev) => {
            const byId = new Map(prev.map((item) => [item.id, item]));
            remoteItems.forEach((r) => byId.set(r.id, r));
            return Array.from(byId.values());
          });
        }
      },
      () => {
        // Fallback to local/seeded announcements when collection is initially empty
      }
    );
    return () => unsub();
  }, [isAuthReady]);

  // Real-time Firestore listener for user's own admissions when signed in
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;
    const isSuperAdmin =
      currentUser.emailVerified && currentUser.email === 'nishanthv041@gmail.com';
    const admissionsQuery = isSuperAdmin
      ? query(
          collection(db, 'admissions'),
          where('status', 'in', ['pending', 'accepted', 'rejected'])
        )
      : query(collection(db, 'admissions'), where('applicantUid', '==', currentUser.uid));

    const unsub = onSnapshot(
      admissionsQuery,
      (snap) => {
        if (!snap.empty) {
          const remoteApps: AdmissionApplication[] = snap.docs.map((d) => {
            const raw = d.data();
            return {
              id: d.id,
              applicationId: raw.applicationId,
              applicantUid: raw.applicantUid,
              studentName: raw.studentName,
              gender: raw.gender,
              dob: raw.dob,
              batch: raw.batch,
              gradeApplying: raw.gradeApplying,
              residenceType: raw.residenceType,
              parentName: raw.parentName,
              phone: raw.phone,
              address: raw.address,
              email: raw.email,
              status: raw.status,
              createdAt:
                typeof raw.createdAt?.toDate === 'function'
                  ? raw.createdAt.toDate().toISOString()
                  : String(raw.createdAt || new Date().toISOString()),
              updatedAt:
                typeof raw.updatedAt?.toDate === 'function'
                  ? raw.updatedAt.toDate().toISOString()
                  : String(raw.updatedAt || new Date().toISOString()),
            };
          });
          setAdmissions((prev) => {
            const byId = new Map(prev.map((item) => [item.applicationId, item]));
            remoteApps.forEach((r) => byId.set(r.applicationId, r));
            return Array.from(byId.values());
          });
        }
      },
      (err) => {
        console.warn('Firestore admissions listener note:', err.message);
      }
    );
    return () => unsub();
  }, [isAuthReady, currentUser]);

  const signInWithGoogle = useCallback(async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      showToast('Signed in with Google', `Welcome, ${result.user.displayName || result.user.email}`);
      return result.user;
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Google Sign-In could not complete.';
      showToast('Google Sign-In Notice', msg, 'info');
      return null;
    }
  }, [showToast]);

  const unlockAdminWithPasskey = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      if (lockoutUntil && Date.now() < lockoutUntil) {
        const secs = Math.ceil((lockoutUntil - Date.now()) / 1000);
        return {
          ok: false,
          error: `Too many failed attempts. Please wait ${secs} seconds before trying again.`,
        };
      }

      const storedPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'SrtAdmin@2026';
      const normalizedEmail = email.trim().toLowerCase();
      const validEmail =
        normalizedEmail === 'nishanthv041@gmail.com' ||
        normalizedEmail === 'admin@srtuniversal.edu.in' ||
        admins.some((a) => a.email.toLowerCase() === normalizedEmail);

      if (validEmail && password === storedPass) {
        setFailedLoginAttempts(0);
        setLockoutUntil(null);
        setIsAdminUnlocked(true);
        setAdminEmail(normalizedEmail);
        try {
          sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION, 'unlocked');
          sessionStorage.setItem('srt_admin_email_v1', normalizedEmail);
        } catch {
          // ignore
        }
        showToast('Admin Portal Unlocked', `Authenticated as ${normalizedEmail}`);
        return { ok: true };
      }

      const nextAttempts = failedLoginAttempts + 1;
      setFailedLoginAttempts(nextAttempts);
      if (nextAttempts >= 5) {
        const until = Date.now() + 30000;
        setLockoutUntil(until);
        return {
          ok: false,
          error: '5 failed login attempts detected. Account locked for 30 seconds.',
        };
      }
      return {
        ok: false,
        error: `Invalid admin credentials (${5 - nextAttempts} attempts remaining).`,
      };
    },
    [admins, failedLoginAttempts, lockoutUntil, showToast]
  );

  const lockAdminSession = useCallback(async () => {
    setIsAdminUnlocked(false);
    setAdminEmail(null);
    try {
      sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION);
      sessionStorage.removeItem('srt_admin_email_v1');
    } catch {
      // ignore
    }
    if (auth.currentUser) {
      await firebaseSignOut(auth);
    }
    showToast('Session Locked', 'You have signed out of the Admin Portal.', 'info');
  }, [showToast]);

  const updateSiteConfig = useCallback(
    async (partial: Partial<SiteConfig>) => {
      const next: SiteConfig = {
        ...siteConfig,
        ...partial,
        updatedAt: new Date().toISOString(),
      };
      setSiteConfig(next);

      if (auth.currentUser && auth.currentUser.emailVerified) {
        const path = 'site_config/main';
        try {
          await setDoc(doc(db, 'site_config', 'main'), {
            schoolName: next.schoolName.slice(0, 120),
            tagline: next.tagline.slice(0, 120),
            location: next.location.slice(0, 200),
            heroHeadline: next.heroHeadline.slice(0, 180),
            heroSubtext: next.heroSubtext.slice(0, 500),
            welcomeTitle: next.welcomeTitle.slice(0, 160),
            welcomeMessage: next.welcomeMessage.slice(0, 2000),
            principalName: next.principalName.slice(0, 120),
            principalMessage: next.principalMessage.slice(0, 2000),
            vision: next.vision.slice(0, 1000),
            mission: next.mission.slice(0, 1000),
            history: next.history.slice(0, 2500),
            address: next.address.slice(0, 300),
            phonePrimary: next.phonePrimary.slice(0, 30),
            phoneSecondary: (next.phoneSecondary || '').slice(0, 30),
            email: next.email.slice(0, 120),
            workingHours: next.workingHours.slice(0, 120),
            googleMapsUrl: next.googleMapsUrl.slice(0, 500),
            googleMapsEmbedUrl: (next.googleMapsEmbedUrl || '').slice(0, 600),
            whatsappNumber: (next.whatsappNumber || '').slice(0, 25),
            studentsCount: Math.round(next.studentsCount),
            teachersCount: Math.round(next.teachersCount),
            yearsCount: Math.round(next.yearsCount),
            awardsCount: Math.round(next.awardsCount),
            updatedAt: serverTimestamp(),
            updatedBy: auth.currentUser.uid,
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, path);
        }
      }
      showToast('Settings Saved', 'School configuration has been updated.');
    },
    [siteConfig, showToast]
  );

  const addGalleryItem = useCallback(
    async (item: Omit<GalleryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const id = `item-${Date.now()}`;
      const now = new Date().toISOString();
      const newItem: GalleryItem = {
        ...item,
        id,
        createdAt: now,
        updatedAt: now,
      };
      setGalleryItems((prev) => [newItem, ...prev]);

      if (auth.currentUser && auth.currentUser.emailVerified) {
        const path = `gallery_items/${id}`;
        try {
          await setDoc(doc(db, 'gallery_items', id), {
            section: newItem.section,
            title: newItem.title.slice(0, 160),
            ...(newItem.subtitle ? { subtitle: newItem.subtitle.slice(0, 200) } : {}),
            category: newItem.category.slice(0, 80),
            year: newItem.year.slice(0, 20),
            date: newItem.date.slice(0, 40),
            description: newItem.description.slice(0, 1500),
            imageUrl: newItem.imageUrl.slice(0, 15000),
            authorUid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }
      showToast('Content Published', `"${newItem.title}" added to ${newItem.section}.`);
    },
    [showToast]
  );

  const updateGalleryItem = useCallback(
    async (id: string, partial: Partial<GalleryItem>) => {
      setGalleryItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...partial, updatedAt: new Date().toISOString() } : item
        )
      );
      showToast('Content Updated', 'Changes saved successfully.');
    },
    [showToast]
  );

  const deleteGalleryItem = useCallback(
    async (id: string) => {
      setGalleryItems((prev) => prev.filter((item) => item.id !== id));
      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await deleteDoc(doc(db, 'gallery_items', id));
        } catch {
          // Local fallback deleted
        }
      }
      showToast('Item Deleted', 'The selected item has been removed.', 'info');
    },
    [showToast]
  );

  const reorderGalleryItem = useCallback((id: string, direction: 'up' | 'down') => {
    setGalleryItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, moved);
      return copy;
    });
  }, []);

  const uploadMediaFile = useCallback(
    async (file: File, folder: string): Promise<string> => {
      if (auth.currentUser) {
        try {
          const storageRef = ref(
            storage,
            `srt_school/${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`
          );
          await uploadBytes(storageRef, file);
          const url = await getDownloadURL(storageRef);
          return url;
        } catch {
          // Fallback to FileReader data URL below if storage bucket requires rules setup
        }
      }
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(file);
      });
    },
    []
  );

  const submitAdmission = useCallback(
    async (
      payload: Omit<
        AdmissionApplication,
        'id' | 'applicationId' | 'applicantUid' | 'status' | 'createdAt' | 'updatedAt'
      >
    ): Promise<{ ok: boolean; application?: AdmissionApplication; error?: string }> => {
      if (isDuplicateAdmissionEmail(payload.email, admissions)) {
        return {
          ok: false,
          error: `An application with email "${payload.email}" already exists. Please use a different email or check your application status below.`,
        };
      }

      const applicationId = generateApplicationId(payload.batch, admissions.length + 15);
      const id = applicationId;
      const now = new Date().toISOString();
      const applicantUid = auth.currentUser?.uid || `parent-${Date.now()}`;

      const newApp: AdmissionApplication = {
        ...payload,
        id,
        applicationId,
        applicantUid,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
      };

      if (auth.currentUser && auth.currentUser.emailVerified) {
        const path = `admissions/${id}`;
        try {
          await setDoc(doc(db, 'admissions', id), {
            applicationId: newApp.applicationId,
            applicantUid: auth.currentUser.uid,
            studentName: newApp.studentName.slice(0, 120),
            gender: newApp.gender,
            dob: newApp.dob.slice(0, 20),
            batch: newApp.batch.slice(0, 20),
            gradeApplying: newApp.gradeApplying.slice(0, 80),
            residenceType: newApp.residenceType,
            parentName: newApp.parentName.slice(0, 120),
            phone: newApp.phone.slice(0, 10),
            address: newApp.address.slice(0, 400),
            email: newApp.email.slice(0, 120),
            status: 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      setAdmissions((prev) => [newApp, ...prev]);
      showToast(
        'Pre-Admission Registered',
        `Application ID ${applicationId} submitted successfully.`
      );
      return { ok: true, application: newApp };
    },
    [admissions, showToast]
  );

  const updateAdmissionStatus = useCallback(
    async (id: string, status: AdmissionStatus) => {
      setAdmissions((prev) =>
        prev.map((app) =>
          app.id === id || app.applicationId === id
            ? { ...app, status, updatedAt: new Date().toISOString() }
            : app
        )
      );

      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await updateDoc(doc(db, 'admissions', id), {
            status,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Local state updated for seed items
        }
      }

      showToast(
        `Application ${status.toUpperCase()}`,
        `Admission request ${id} marked as ${status}.`
      );
    },
    [showToast]
  );

  const deleteAdmission = useCallback(
    async (id: string) => {
      setAdmissions((prev) => prev.filter((app) => app.id !== id && app.applicationId !== id));
      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await deleteDoc(doc(db, 'admissions', id));
        } catch {
          // Local state updated
        }
      }
      showToast('Application Deleted', `Admission record ${id} removed.`, 'info');
    },
    [showToast]
  );

  const findAdmissionByCredentials = useCallback(
    (emailOrAppId: string): AdmissionApplication | null => {
      const q = emailOrAppId.trim().toLowerCase();
      if (!q) return null;
      return (
        admissions.find(
          (a) =>
            a.applicationId.toLowerCase() === q || a.email.trim().toLowerCase() === q
        ) || null
      );
    },
    [admissions]
  );

  const submitContactMessage = useCallback(
    async (
      payload: Omit<ContactMessage, 'id' | 'senderUid' | 'status' | 'createdAt' | 'updatedAt'>
    ) => {
      const id = `msg-${Date.now()}`;
      const now = new Date().toISOString();
      const senderUid = auth.currentUser?.uid || `visitor-${Date.now()}`;
      const newMsg: ContactMessage = {
        ...payload,
        id,
        senderUid,
        status: 'unread',
        createdAt: now,
        updatedAt: now,
      };

      if (auth.currentUser && auth.currentUser.emailVerified) {
        const path = `contact_messages/${id}`;
        try {
          await setDoc(doc(db, 'contact_messages', id), {
            senderUid: auth.currentUser.uid,
            name: newMsg.name.slice(0, 100),
            email: newMsg.email.slice(0, 120),
            phone: newMsg.phone.slice(0, 20),
            subject: newMsg.subject.slice(0, 150),
            message: newMsg.message.slice(0, 2000),
            status: 'unread',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      setContactMessages((prev) => [newMsg, ...prev]);
      showToast('Message Sent', 'Thank you! Our school office will respond shortly.');
    },
    [showToast]
  );

  const updateContactMessageStatus = useCallback(
    async (id: string, status: ContactMessage['status']) => {
      setContactMessages((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, status, updatedAt: new Date().toISOString() } : m
        )
      );
      showToast('Inbox Updated', `Message marked as ${status}.`);
    },
    [showToast]
  );

  const deleteContactMessage = useCallback(
    async (id: string) => {
      setContactMessages((prev) => prev.filter((m) => m.id !== id));
      showToast('Message Deleted', 'Inquiry removed from inbox.', 'info');
    },
    [showToast]
  );

  const addAdminUser = useCallback(
    async (email: string, role: AdminUserRecord['role']) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) return;
      const uid = `admin-${Date.now()}`;
      const record: AdminUserRecord = {
        uid,
        email: cleanEmail,
        role,
        createdAt: new Date().toISOString(),
      };
      setAdmins((prev) => [...prev, record]);
      showToast('Admin Added', `${cleanEmail} granted ${role} access.`);
    },
    [showToast]
  );

  const removeAdminUser = useCallback(
    async (uid: string) => {
      setAdmins((prev) => prev.filter((a) => a.uid !== uid));
      showToast('Admin Removed', 'Administrator privileges revoked.', 'info');
    },
    [showToast]
  );

  const updateAdminPassword = useCallback(
    (currentPass: string, newPass: string): { ok: boolean; error?: string } => {
      const storedPass = localStorage.getItem(STORAGE_KEYS.ADMIN_PASS) || 'SrtAdmin@2026';
      if (currentPass !== storedPass) {
        return { ok: false, error: 'Current password does not match.' };
      }
      if (newPass.length < 8) {
        return { ok: false, error: 'New password must be at least 8 characters.' };
      }
      localStorage.setItem(STORAGE_KEYS.ADMIN_PASS, newPass);
      showToast('Password Updated', 'Your admin security key has been updated.');
      return { ok: true };
    },
    [showToast]
  );

  const addAnnouncement = useCallback(
    async (payload: {
      title: string;
      category: string;
      isUrgent: boolean;
      date: string;
      link?: string;
    }) => {
      const id = `ann-${Date.now()}`;
      const now = new Date().toISOString();
      const authorUid = auth.currentUser?.uid || 'bootstrap-super-admin';
      const newItem: AnnouncementItem = {
        id,
        title: payload.title.trim().slice(0, 240),
        category: (payload.category.trim() || 'Notice').slice(0, 60),
        priority: payload.isUrgent ? 'urgent' : 'standard',
        isUrgent: payload.isUrgent,
        active: true,
        date: (payload.date.trim() || now.slice(0, 10)).slice(0, 40),
        ...(payload.link?.trim() ? { link: payload.link.trim().slice(0, 300) } : {}),
        authorUid,
        createdAt: now,
        updatedAt: now,
      };

      setAnnouncements((prev) => [newItem, ...prev]);

      if (auth.currentUser && auth.currentUser.emailVerified) {
        const path = `announcements/${id}`;
        try {
          await setDoc(doc(db, 'announcements', id), {
            title: newItem.title,
            category: newItem.category,
            priority: newItem.priority,
            isUrgent: newItem.isUrgent,
            active: newItem.active,
            date: newItem.date,
            ...(newItem.link ? { link: newItem.link } : {}),
            authorUid: auth.currentUser.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, path);
        }
      }

      showToast(
        newItem.isUrgent ? 'Urgent Ticker Broadcast Live' : 'Announcement Published',
        `"${newItem.title}" is now streaming on the top marquee ticker.`
      );
    },
    [showToast]
  );

  const toggleAnnouncementUrgent = useCallback(
    async (id: string) => {
      const target = announcements.find((a) => a.id === id);
      if (!target) return;
      const nextUrgent = !target.isUrgent;
      const nextPriority = nextUrgent ? 'urgent' : 'standard';

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                isUrgent: nextUrgent,
                priority: nextPriority,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await updateDoc(doc(db, 'announcements', id), {
            isUrgent: nextUrgent,
            priority: nextPriority,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Local fallback updated for seed items
        }
      }

      showToast(
        nextUrgent ? 'Marked as Urgent' : 'Set to Standard Priority',
        `"${target.title.slice(0, 48)}..." updated.`
      );
    },
    [announcements, showToast]
  );

  const toggleAnnouncementActive = useCallback(
    async (id: string) => {
      const target = announcements.find((a) => a.id === id);
      if (!target) return;
      const nextActive = !target.active;

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                active: nextActive,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await updateDoc(doc(db, 'announcements', id), {
            active: nextActive,
            updatedAt: serverTimestamp(),
          });
        } catch {
          // Local fallback updated
        }
      }

      showToast(
        nextActive ? 'Announcement Activated' : 'Announcement Hidden',
        `"${target.title.slice(0, 48)}..." visibility updated.`
      );
    },
    [announcements, showToast]
  );

  const deleteAnnouncement = useCallback(
    async (id: string) => {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      if (auth.currentUser && auth.currentUser.emailVerified) {
        try {
          await deleteDoc(doc(db, 'announcements', id));
        } catch {
          // Local fallback deleted
        }
      }
      showToast('Announcement Removed', 'Ticker update has been deleted.', 'info');
    },
    [showToast]
  );

  return (
    <SchoolDataContext.Provider
      value={{
        siteConfig,
        galleryItems,
        announcements,
        admissions,
        contactMessages,
        admins,
        currentUser,
        isAuthReady,
        isAdminUnlocked,
        adminEmail,
        failedLoginAttempts,
        lockoutUntil,
        theme,
        toasts,
        toggleTheme,
        showToast,
        dismissToast,
        signInWithGoogle,
        unlockAdminWithPasskey,
        lockAdminSession,
        updateSiteConfig,
        addGalleryItem,
        updateGalleryItem,
        deleteGalleryItem,
        reorderGalleryItem,
        addAnnouncement,
        toggleAnnouncementUrgent,
        toggleAnnouncementActive,
        deleteAnnouncement,
        uploadMediaFile,
        submitAdmission,
        updateAdmissionStatus,
        deleteAdmission,
        findAdmissionByCredentials,
        submitContactMessage,
        updateContactMessageStatus,
        deleteContactMessage,
        addAdminUser,
        removeAdminUser,
        updateAdminPassword,
      }}
    >
      {children}
    </SchoolDataContext.Provider>
  );
};

export function useSchoolData(): SchoolDataContextValue {
  const ctx = useContext(SchoolDataContext);
  if (!ctx) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider');
  }
  return ctx;
}
