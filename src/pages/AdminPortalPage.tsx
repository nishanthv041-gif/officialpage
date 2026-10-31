import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Download,
  Eye,
  FileSpreadsheet,
  FolderKanban,
  Globe,
  Inbox,
  LayoutDashboard,
  Lock,
  LogOut,
  Plus,
  Printer,
  Search,
  Settings,
  ShieldAlert,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';
import { AdminLockScene } from '../components/three/AdminLockScene';
import {
  AdmissionApplication,
  GalleryItem,
  GallerySection,
} from '../types/school';
import {
  convertAdmissionsToCsv,
  filterAdmissions,
} from '../utils/schoolLogic';
import { createEditorialSvgDataUri } from '../data/seedData';
import { ResilientImage } from '../components/common/TiltCard';

type AdminModule =
  | 'overview'
  | 'admissions'
  | 'content'
  | 'school-info'
  | 'inbox'
  | 'settings';

export const AdminPortalPage: React.FC = () => {
  const {
    siteConfig,
    galleryItems,
    admissions,
    contactMessages,
    admins,
    isAdminUnlocked,
    adminEmail,
    theme,
    toggleTheme,
    showToast,
    signInWithGoogle,
    unlockAdminWithPasskey,
    lockAdminSession,
    updateSiteConfig,
    addGalleryItem,
    deleteGalleryItem,
    reorderGalleryItem,
    uploadMediaFile,
    updateAdmissionStatus,
    deleteAdmission,
    updateContactMessageStatus,
    deleteContactMessage,
    addAdminUser,
    removeAdminUser,
    updateAdminPassword,
  } = useSchoolData();

  // Login Screen State
  const [loginEmail, setLoginEmail] = useState('admin@srtuniversal.edu.in');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [lockVisualState, setLockVisualState] = useState<'locked' | 'error' | 'unlocked'>('locked');

  // Active Dashboard Module
  const [activeModule, setActiveModule] = useState<AdminModule>('overview');

  // Admission Manager State
  const [admissionTab, setAdmissionTab] = useState<'pending' | 'accepted' | 'rejected' | 'all'>(
    'pending'
  );
  const [admissionSearch, setAdmissionSearch] = useState('');
  const [admissionResidenceFilter, setAdmissionResidenceFilter] = useState<
    'All' | 'Day Scholar' | 'Hostel'
  >('All');
  const [admissionSort, setAdmissionSort] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplication | null>(null);

  // Content Manager State
  const [activeContentSection, setActiveContentSection] = useState<GallerySection>('events');
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemSubtitle, setNewItemSubtitle] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Academic');
  const [newItemYear, setNewItemYear] = useState('2026');
  const [newItemDate, setNewItemDate] = useState('Mar 2026');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemImage, setNewItemImage] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // School Info Form State
  const [schoolForm, setSchoolForm] = useState(siteConfig);

  // Settings Password & Admin Form State
  const [currentPassInput, setCurrentPassInput] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState<'super_admin' | 'editor'>('editor');

  // Delete Confirmation Modal State
  const [confirmDelete, setConfirmDelete] = useState<{
    label: string;
    onConfirm: () => void;
  } | null>(null);

  const pendingCount = admissions.filter((a) => a.status === 'pending').length;
  const acceptedCount = admissions.filter((a) => a.status === 'accepted').length;
  const rejectedCount = admissions.filter((a) => a.status === 'rejected').length;
  const unreadMessagesCount = contactMessages.filter((m) => m.status === 'unread').length;

  const filteredAdmissions = useMemo(
    () =>
      filterAdmissions(admissions, {
        status: admissionTab,
        searchQuery: admissionSearch,
        residenceType: admissionResidenceFilter,
        sortBy: admissionSort,
      }),
    [admissions, admissionTab, admissionSearch, admissionResidenceFilter, admissionSort]
  );

  const sectionGalleryList = useMemo(
    () => galleryItems.filter((i) => i.section === activeContentSection),
    [galleryItems, activeContentSection]
  );

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const res = await unlockAdminWithPasskey(loginEmail, loginPass);
    if (!res.ok) {
      setLockVisualState('error');
      setLoginError(res.error || 'Authentication failed.');
      window.setTimeout(() => setLockVisualState('locked'), 1100);
      return;
    }
    setLockVisualState('unlocked');
  };

  const handleExportAcceptedCsv = () => {
    const listToExport =
      admissionTab === 'accepted'
        ? admissions.filter((a) => a.status === 'accepted')
        : filteredAdmissions;
    const csv = convertAdmissionsToCsv(listToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srt-admissions-${admissionTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV Exported', `Exported ${listToExport.length} admission records.`);
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadMediaFile(file, activeContentSection);
      setNewItemImage(uploadedUrl);
      showToast('Image Ready', `Uploaded "${file.name}" for preview.`);
    } catch {
      showToast('Upload Error', 'Could not read image file.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleCreateGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim() || !newItemDesc.trim()) return;

    const fallbackSvg = createEditorialSvgDataUri(
      newItemTitle.trim(),
      `${newItemCategory} · ${newItemDate}`,
      '#f59e0b',
      '#1e3a8a',
      activeContentSection === 'sports' ? 'sports' : 'campus'
    );

    await addGalleryItem({
      section: activeContentSection,
      title: newItemTitle.trim(),
      subtitle: newItemSubtitle.trim() || undefined,
      category: newItemCategory.trim() || 'General',
      year: newItemYear.trim() || '2026',
      date: newItemDate.trim() || '2026',
      description: newItemDesc.trim(),
      imageUrl: newItemImage || fallbackSvg,
    });

    setNewItemTitle('');
    setNewItemSubtitle('');
    setNewItemDesc('');
    setNewItemImage('');
  };

  const handleSaveSchoolInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSiteConfig(schoolForm);
  };

  const handlePasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassInput !== confirmPassInput) {
      showToast('Password Mismatch', 'New password and confirmation do not match.', 'error');
      return;
    }
    const res = updateAdminPassword(currentPassInput, newPassInput);
    if (!res.ok) {
      showToast('Password Error', res.error, 'error');
      return;
    }
    setCurrentPassInput('');
    setNewPassInput('');
    setConfirmPassInput('');
  };

  const handleBackupJsonExport = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      siteConfig,
      galleryItems,
      admissions,
      contactMessages,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srt-school-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup Downloaded', 'Full JSON backup saved to your device.');
  };

  // ===========================================================================
  // 1. FULL-SCREEN 3D ANIMATED SECURITY LOGIN GATE (WHEN LOCKED)
  // ===========================================================================
  if (!isAdminUnlocked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 py-12">
        <div
          className={`w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl space-y-6 transition-transform duration-150 ${
            lockVisualState === 'error' ? 'translate-x-2 border-rose-500/60' : ''
          }`}
        >
          <div className="text-center space-y-1">
            <div className="text-xs font-mono uppercase tracking-widest text-amber-400">
              Restricted Institutional Vault
            </div>
            <h1 className="font-display text-2xl font-bold text-white">
              {siteConfig.schoolName} — Admin
            </h1>
            <p className="text-xs text-slate-400">
              Authenticate with your Administrator Security Key or verified Firebase Google Account
            </p>
          </div>

          {/* 3D Interactive Padlock Scene */}
          <AdminLockScene status={lockVisualState} />

          {loginError && (
            <div
              role="alert"
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 flex items-center gap-2"
            >
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="adminEmail" className="block text-xs font-semibold text-slate-300">
                Administrator Email ID
              </label>
              <input
                id="adminEmail"
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="adminPass" className="block text-xs font-semibold text-slate-300">
                  Admin Passkey
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setLoginEmail('admin@srtuniversal.edu.in');
                    setLoginPass('SrtAdmin@2026');
                  }}
                  className="text-xs text-amber-400 hover:underline cursor-pointer"
                >
                  Auto-fill Default Key
                </button>
              </div>
              <input
                id="adminPass"
                type="password"
                required
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="Enter admin passkey (default: SrtAdmin@2026)"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-700 bg-slate-950 text-sm text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Unlock Admin Console</span>
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 space-y-3">
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-2.5 rounded-lg border border-slate-700 hover:bg-slate-800 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              Sign in with Verified Google Admin Account
            </button>

            <div className="text-center">
              <Link to="/" className="text-xs text-slate-400 hover:text-white">
                ← Return to Public School Website
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 2. PROTECTED ADMIN DASHBOARD WORKSPACE (SIDEBAR + TOP BAR + VIEWPORT)
  // ===========================================================================
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation (260px) */}
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between p-5">
        <div className="space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="font-display text-base font-bold text-slate-900 dark:text-white truncate">
              SRT Admin Console
            </div>
            <div className="text-xs text-amber-600 dark:text-amber-400 font-mono truncate">
              {adminEmail || 'admin@srtuniversal.edu.in'}
            </div>
          </div>

          <nav aria-label="Admin Modules" className="space-y-1.5">
            {(
              [
                ['overview', 'Dashboard Overview', LayoutDashboard],
                ['admissions', `Admissions (${pendingCount})`, Users],
                ['content', 'Content Manager', FolderKanban],
                ['school-info', 'School & Social Info', Globe],
                ['inbox', `Contact Inbox (${unreadMessagesCount})`, Inbox],
                ['settings', 'Settings & Roles', Settings],
              ] as [AdminModule, string, React.ElementType][]
            ).map(([modKey, label, Icon]) => (
              <button
                key={modKey}
                type="button"
                onClick={() => setActiveModule(modKey)}
                className={`w-full px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center gap-3 transition-colors cursor-pointer whitespace-nowrap ${
                  activeModule === modKey
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <Link
            to="/"
            className="w-full px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
          >
            View Live Public Website
          </Link>
          <button
            type="button"
            onClick={lockAdminSession}
            className="w-full px-3.5 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Admin Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Breadcrumb Bar */}
        <header className="px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-4">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>SRT Universal Hr. Sec. School</span>
            <span className="mx-2">/</span>
            <strong className="text-slate-900 dark:text-white uppercase tracking-wider">
              {activeModule.replace('-', ' ')}
            </strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBackupJsonExport}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Backup JSON</span>
            </button>
          </div>
        </header>

        <main className="p-8 space-y-8 overflow-y-auto flex-1">
          {/* MODULE 1: DASHBOARD OVERVIEW */}
          {activeModule === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Pending Admissions
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-bold text-amber-500 mt-1">
                    {pendingCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Awaiting review action</div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Accepted Scholars
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-bold text-emerald-500 mt-1">
                    {acceptedCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Ready for CSV/Excel export</div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Rejected Applications
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-bold text-rose-500 mt-1">
                    {rejectedCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Archived requests</div>
                </div>

                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Unread Contact Messages
                  </div>
                  <div className="font-mono tabular-nums text-3xl font-bold text-blue-500 mt-1">
                    {unreadMessagesCount}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Out of {contactMessages.length} total inquiries
                  </div>
                </div>
              </div>

              {/* Visual Analytics Chart & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Admission Pipeline Distribution (2026–2027)
                  </h2>
                  <div className="space-y-4">
                    {[
                      {
                        label: 'Accepted Admissions',
                        count: acceptedCount,
                        color: 'bg-emerald-500',
                      },
                      {
                        label: 'Pending Review',
                        count: pendingCount,
                        color: 'bg-amber-500',
                      },
                      {
                        label: 'Day Scholar Applicants',
                        count: admissions.filter((a) => a.residenceType === 'Day Scholar').length,
                        color: 'bg-blue-500',
                      },
                      {
                        label: 'Residential Hostel Applicants',
                        count: admissions.filter((a) => a.residenceType === 'Hostel').length,
                        color: 'bg-purple-500',
                      },
                    ].map((row) => {
                      const pct = Math.round(
                        (row.count / Math.max(admissions.length, 1)) * 100
                      );
                      return (
                        <div key={row.label} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {row.label}
                            </span>
                            <span className="font-mono tabular-nums text-slate-500">
                              {row.count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${row.color}`}
                              style={{ width: `${Math.max(pct, 6)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Quick Administrative Actions
                  </h2>
                  <div className="grid grid-cols-1 gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        setAdmissionTab('pending');
                        setActiveModule('admissions');
                      }}
                      className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Review Pending Pre-Admissions ({pendingCount})</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAdmissionTab('accepted');
                        setActiveModule('admissions');
                      }}
                      className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Export Accepted Scholars CSV ({acceptedCount})</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule('content')}
                      className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Publish New Event, Sport or Achievement Photo</span>
                      <span>→</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveModule('school-info')}
                      className="px-4 py-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold text-left flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Update Tagline, Counters &amp; Social Media Links</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODULE 2: ADMISSION REQUESTS MANAGER */}
          {activeModule === 'admissions' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Status Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                  {(
                    [
                      ['pending', `Pending (${pendingCount})`],
                      ['accepted', `Accepted Admissions (${acceptedCount})`],
                      ['rejected', `Rejected (${rejectedCount})`],
                      ['all', `All (${admissions.length})`],
                    ] as const
                  ).map(([tKey, label]) => (
                    <button
                      key={tKey}
                      type="button"
                      onClick={() => setAdmissionTab(tKey)}
                      className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                        admissionTab === tKey
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {/* Export to CSV & Print Buttons */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportAcceptedCsv}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export CSV / Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print List</span>
                  </button>
                </div>
              </div>

              {/* Search, Filter & Sort Controls */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={admissionSearch}
                    onChange={(e) => setAdmissionSearch(e.target.value)}
                    placeholder="Search by Application ID, student, parent, phone..."
                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <select
                    aria-label="Filter by Residence Mode"
                    value={admissionResidenceFilter}
                    onChange={(e) =>
                      setAdmissionResidenceFilter(
                        e.target.value as 'All' | 'Day Scholar' | 'Hostel'
                      )
                    }
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="All">All Modes (Day &amp; Hostel)</option>
                    <option value="Day Scholar">Day Scholar Only</option>
                    <option value="Hostel">Hostel Only</option>
                  </select>

                  <select
                    aria-label="Sort Admissions"
                    value={admissionSort}
                    onChange={(e) =>
                      setAdmissionSort(e.target.value as 'newest' | 'oldest' | 'name')
                    }
                    className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="name">Sort: Student Name (A–Z)</option>
                  </select>
                </div>
              </div>

              {/* Admissions Data Table */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-4 font-semibold">App ID</th>
                      <th className="py-3.5 px-4 font-semibold">Student Name</th>
                      <th className="py-3.5 px-4 font-semibold">Class / Group</th>
                      <th className="py-3.5 px-4 font-semibold">Mode</th>
                      <th className="py-3.5 px-4 font-semibold">Parent &amp; Phone</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredAdmissions.map((app) => (
                      <tr
                        key={app.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono tabular-nums font-semibold text-amber-600 dark:text-amber-400">
                          {app.applicationId}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                          {app.studentName}
                          <div className="text-[11px] font-normal text-slate-400">
                            {app.gender} · DOB: {app.dob}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-[220px] truncate">
                          {app.gradeApplying}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          {app.residenceType}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {app.parentName}
                          </div>
                          <div className="font-mono tabular-nums text-slate-400">{app.phone}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono uppercase font-bold">
                          <span
                            className={
                              app.status === 'accepted'
                                ? 'text-emerald-500'
                                : app.status === 'rejected'
                                ? 'text-rose-500'
                                : 'text-amber-500'
                            }
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedAdmission(app)}
                            aria-label={`View ${app.studentName}`}
                            className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {app.status !== 'accepted' && (
                            <button
                              type="button"
                              onClick={() => updateAdmissionStatus(app.id, 'accepted')}
                              aria-label={`Accept ${app.studentName}`}
                              className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-semibold cursor-pointer"
                            >
                              Accept
                            </button>
                          )}
                          {app.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => updateAdmissionStatus(app.id, 'rejected')}
                              aria-label={`Reject ${app.studentName}`}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500 text-amber-400 hover:text-slate-950 font-semibold cursor-pointer"
                            >
                              Reject
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmDelete({
                                label: `Admission application ${app.applicationId} (${app.studentName})`,
                                onConfirm: () => deleteAdmission(app.id),
                              })
                            }
                            aria-label={`Delete ${app.studentName}`}
                            className="p-1.5 rounded bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MODULE 3: CONTENT MANAGER (EVENTS, SPORTS, ACHIEVEMENTS, FACULTY, FAQ, DOWNLOADS) */}
          {activeModule === 'content' && (
            <div className="space-y-8">
              <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                {(
                  [
                    ['events', 'Events'],
                    ['sports', 'Sports'],
                    ['achievements', 'Achievements'],
                    ['announcements', 'Announcements'],
                    ['faculty', 'Faculty'],
                    ['testimonials', 'Testimonials'],
                    ['downloads', 'Downloads'],
                    ['faq', 'FAQ'],
                  ] as [GallerySection, string][]
                ).map(([secKey, label]) => (
                  <button
                    key={secKey}
                    type="button"
                    onClick={() => setActiveContentSection(secKey)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 ${
                      activeContentSection === secKey
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Add New Content Item Form with Drag & Drop Image Upload */}
              <form
                onSubmit={handleCreateGalleryItem}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4"
              >
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  Add New Item to {activeContentSection.toUpperCase()}
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    required
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Title *"
                    className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                  <input
                    type="text"
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                    placeholder="Category (e.g. Kabaddi, Athletics, Cultural)"
                    className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newItemDate}
                      onChange={(e) => setNewItemDate(e.target.value)}
                      placeholder="Date (e.g. 14 Feb 2026)"
                      className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                    />
                    <input
                      type="text"
                      value={newItemYear}
                      onChange={(e) => setNewItemYear(e.target.value)}
                      placeholder="Year"
                      className="w-20 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                    />
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Detailed description or caption *"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                />

                <div className="flex flex-wrap items-center justify-between gap-4">
                  <label className="px-4 py-2 rounded-lg border border-dashed border-slate-400 dark:border-slate-600 text-xs text-slate-600 dark:text-slate-300 inline-flex items-center gap-2 cursor-pointer hover:border-amber-500">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>
                      {isUploadingImage
                        ? 'Uploading to Firebase Storage...'
                        : 'Upload Photo (or auto-generate school card)'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Publish to {activeContentSection}</span>
                  </button>
                </div>
              </form>

              {/* Existing Section Items List with Reorder & Delete */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sectionGalleryList.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex gap-4 items-start justify-between"
                  >
                    <div className="w-24 h-20 rounded-lg overflow-hidden bg-slate-950 shrink-0">
                      <ResilientImage
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-[11px] text-amber-500 font-medium">
                        {item.category} · {item.date}
                      </div>
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => reorderGalleryItem(item.id, 'up')}
                        aria-label={`Move ${item.title} Up`}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => reorderGalleryItem(item.id, 'down')}
                        aria-label={`Move ${item.title} Down`}
                        className="p-1.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 cursor-pointer"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmDelete({
                            label: `"${item.title}"`,
                            onConfirm: () => deleteGalleryItem(item.id),
                          })
                        }
                        aria-label={`Delete ${item.title}`}
                        className="p-1.5 rounded bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MODULE 4: SCHOOL INFO, COUNTERS & SOCIAL MEDIA MANAGER */}
          {activeModule === 'school-info' && (
            <form
              onSubmit={handleSaveSchoolInfo}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  School Identity, Counters &amp; Social Media Links
                </h2>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold">School Name</label>
                  <input
                    type="text"
                    value={schoolForm.schoolName}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, schoolName: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">School Tagline</label>
                  <input
                    type="text"
                    value={schoolForm.tagline}
                    onChange={(e) => setSchoolForm({ ...schoolForm, tagline: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold">Hero Headline</label>
                  <input
                    type="text"
                    value={schoolForm.heroHeadline}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, heroHeadline: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Primary Phone</label>
                  <input
                    type="text"
                    value={schoolForm.phonePrimary}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, phonePrimary: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold">Official Email</label>
                  <input
                    type="email"
                    value={schoolForm.email}
                    onChange={(e) => setSchoolForm({ ...schoolForm, email: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold">Google Maps Location Link</label>
                  <input
                    type="text"
                    value={schoolForm.googleMapsUrl}
                    onChange={(e) =>
                      setSchoolForm({ ...schoolForm, googleMapsUrl: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Animated Counters Editor */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <label className="font-semibold block mb-1">Students Count</label>
                  <input
                    type="number"
                    value={schoolForm.studentsCount}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        studentsCount: parseInt(e.target.value || '0', 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Teachers Count</label>
                  <input
                    type="number"
                    value={schoolForm.teachersCount}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        teachersCount: parseInt(e.target.value || '0', 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Years Legacy</label>
                  <input
                    type="number"
                    value={schoolForm.yearsCount}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        yearsCount: parseInt(e.target.value || '0', 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">Awards Count</label>
                  <input
                    type="number"
                    value={schoolForm.awardsCount}
                    onChange={(e) =>
                      setSchoolForm({
                        ...schoolForm,
                        awardsCount: parseInt(e.target.value || '0', 10),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>
            </form>
          )}

          {/* MODULE 5: CONTACT MESSAGES INBOX */}
          {activeModule === 'inbox' && (
            <div className="space-y-4">
              {contactMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="font-semibold text-amber-500 uppercase">{msg.status}</span>
                      <span>·</span>
                      <span>{msg.name}</span>
                      <span>·</span>
                      <span className="font-mono">{msg.phone}</span>
                      <span>·</span>
                      <span>{msg.email}</span>
                    </div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {msg.subject}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {msg.status === 'unread' && (
                      <button
                        type="button"
                        onClick={() => updateContactMessageStatus(msg.id, 'read')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold cursor-pointer"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setConfirmDelete({
                          label: `Inquiry from ${msg.name}`,
                          onConfirm: () => deleteContactMessage(msg.id),
                        })
                      }
                      aria-label={`Delete message from ${msg.name}`}
                      className="p-2 rounded-lg bg-rose-500/15 hover:bg-rose-500 text-rose-400 hover:text-white cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* MODULE 6: SETTINGS, FEATURE TOGGLES & ADMIN ROLES */}
          {activeModule === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Toggles */}
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
                <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                  System Feature Toggles
                </h2>
                {(
                  [
                    ['admissionFormOpen', 'Pre-Admission Online Form Open'],
                    ['contactFormOpen', 'Public Contact Inquiry Form Open'],
                    ['enableEventsEditing', 'Enable Events Content Editing'],
                    ['enableSportsEditing', 'Enable Sports Content Editing'],
                    ['enable3DHero', 'Enable Interactive 3D Campus Hero'],
                    ['maintenanceMode', 'Maintenance Banner Mode'],
                  ] as [keyof SiteConfig['featureToggles'], string][]
                ).map(([tKey, label]) => (
                  <label
                    key={tKey}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs cursor-pointer"
                  >
                    <span className="font-medium">{label}</span>
                    <input
                      type="checkbox"
                      checked={siteConfig.featureToggles[tKey]}
                      onChange={(e) =>
                        updateSiteConfig({
                          featureToggles: {
                            ...siteConfig.featureToggles,
                            [tKey]: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 accent-amber-500"
                    />
                  </label>
                ))}
                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="font-medium">Active Visual Theme</span>
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="px-3 py-1.5 rounded bg-slate-100 dark:bg-slate-800 font-semibold cursor-pointer"
                  >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </button>
                </div>
              </div>

              {/* Password Change & Role Management */}
              <div className="space-y-6">
                <form
                  onSubmit={handlePasswordChangeSubmit}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-xs"
                >
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Change Administrator Passkey
                  </h2>
                  <input
                    type="password"
                    required
                    value={currentPassInput}
                    onChange={(e) => setCurrentPassInput(e.target.value)}
                    placeholder="Current Passkey"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <input
                    type="password"
                    required
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="New Passkey (min 8 chars)"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <input
                    type="password"
                    required
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Confirm New Passkey"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold cursor-pointer"
                  >
                    Update Passkey
                  </button>
                </form>

                {/* Manage Admin Users */}
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 text-xs">
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Authorized Admin Accounts
                  </h2>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      placeholder="staff@srtuniversal.edu.in"
                      className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                    <select
                      value={newAdminRole}
                      onChange={(e) =>
                        setNewAdminRole(e.target.value as 'super_admin' | 'editor')
                      }
                      className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option value="editor">Editor</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        addAdminUser(newAdminEmail, newAdminRole);
                        setNewAdminEmail('');
                      }}
                      className="px-3.5 py-2 rounded-lg bg-amber-500 text-slate-950 font-semibold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {admins.map((adm) => (
                      <div
                        key={adm.uid}
                        className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-emerald-500" />
                          <span>{adm.email}</span>
                          <span className="font-mono text-amber-500">({adm.role})</span>
                        </div>
                        {adm.email !== 'nishanthv041@gmail.com' && (
                          <button
                            type="button"
                            onClick={() => removeAdminUser(adm.uid)}
                            className="text-rose-400 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Admission Detail Inspection Modal */}
      {selectedAdmission && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
          onClick={() => setSelectedAdmission(null)}
        >
          <div
            className="max-w-lg w-full rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <div className="text-xs text-slate-400">Application Record</div>
                <div className="font-mono text-lg font-bold text-amber-500">
                  {selectedAdmission.applicationId}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAdmission(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">Student Name</span>
                <strong className="text-sm">{selectedAdmission.studentName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Gender &amp; DOB</span>
                <strong>
                  {selectedAdmission.gender} · {selectedAdmission.dob}
                </strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Class / Group Applied</span>
                <strong>{selectedAdmission.gradeApplying}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Batch &amp; Mode</span>
                <strong>
                  {selectedAdmission.batch} · {selectedAdmission.residenceType}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block">Parent / Guardian</span>
                <strong>{selectedAdmission.parentName}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Phone</span>
                <strong className="font-mono">{selectedAdmission.phone}</strong>
              </div>
              <div>
                <span className="text-slate-400 block">Email</span>
                <strong>{selectedAdmission.email}</strong>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block">Address</span>
                <strong>{selectedAdmission.address}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4"
        >
          <div className="max-w-sm w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Confirm Permanent Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete {confirmDelete.label}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDelete.onConfirm();
                  setConfirmDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
