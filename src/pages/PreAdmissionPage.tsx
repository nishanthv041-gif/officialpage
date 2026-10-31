import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Search,
  ShieldCheck,
  UserCheck,
  Printer,
} from 'lucide-react';
import { useSchoolData } from '../context/SchoolDataContext';
import {
  evaluatePasswordStrength,
  isDuplicateAdmissionEmail,
  validateIndianPhone,
} from '../utils/schoolLogic';
import { AdmissionApplication } from '../types/school';

const CLASS_GROUPS = [
  'Class XI - Group I (Maths, Physics, Chemistry, Biology)',
  'Class XI - Group II (Maths, Physics, Chemistry, Computer Science)',
  'Class XI - Group III (Physics, Chemistry, Botany, Zoology)',
  'Class XI - Group IV (Commerce, Accountancy, Economics, Computer App / BM)',
  'Class IX - State Board English Medium',
  'Class VI to VIII - Middle School Wing',
  'LKG to Class V - Primary & Foundational Wing',
];

export const PreAdmissionPage: React.FC = () => {
  const {
    siteConfig,
    admissions,
    currentUser,
    signInWithGoogle,
    submitAdmission,
    findAdmissionByCredentials,
  } = useSchoolData();

  const [mode, setMode] = useState<'register' | 'status'>('register');
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [stepError, setStepError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedRecord, setSubmittedRecord] = useState<AdmissionApplication | null>(null);

  // Step 1 fields
  const [studentName, setStudentName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('');
  const [batch, setBatch] = useState('2026-2027');
  const [gradeApplying, setGradeApplying] = useState(CLASS_GROUPS[0]);
  const [residenceType, setResidenceType] = useState<'Day Scholar' | 'Hostel'>('Day Scholar');

  // Step 2 fields
  const [parentName, setParentName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 3 fields
  const [accountMethod, setAccountMethod] = useState<'email' | 'google'>('email');
  const [googleVerifiedEmail, setGoogleVerifiedEmail] = useState<string | null>(null);

  // Parent Status Lookup fields
  const [lookupInput, setLookupInput] = useState('');
  const [lookupResult, setLookupResult] = useState<AdmissionApplication | null>(null);
  const [lookupSearched, setLookupSearched] = useState(false);

  const passwordStrength = evaluatePasswordStrength(password);

  const validateStep1 = (): boolean => {
    if (studentName.trim().length < 2) {
      setStepError('Please enter the student’s full name (minimum 2 characters).');
      return false;
    }
    if (!dob) {
      setStepError('Please select the student’s Date of Birth.');
      return false;
    }
    setStepError(null);
    return true;
  };

  const validateStep2 = (): boolean => {
    if (parentName.trim().length < 2) {
      setStepError('Please enter the parent or guardian’s full name.');
      return false;
    }
    if (!validateIndianPhone(phone)) {
      setStepError('Please enter a valid 10-digit mobile number (numbers only).');
      return false;
    }
    if (address.trim().length < 5) {
      setStepError('Please enter your complete residential address.');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStepError('Please enter a valid email address (used as your Parent User ID).');
      return false;
    }
    if (isDuplicateAdmissionEmail(email, admissions)) {
      setStepError(
        `An application is already registered with "${email.trim()}". Use the Check Application Status tab or provide a different email.`
      );
      return false;
    }
    if (password.length < 8) {
      setStepError('Password must be at least 8 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setStepError('Password and Confirm Password do not match.');
      return false;
    }
    setStepError(null);
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3) {
      setStepError(null);
      setStep(4);
    }
  };

  const handleGoogleVerify = async () => {
    const user = await signInWithGoogle();
    if (user?.email) {
      setEmail(user.email);
      setGoogleVerifiedEmail(user.email);
      setAccountMethod('google');
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStepError(null);
    setIsSubmitting(true);

    const res = await submitAdmission({
      studentName: studentName.trim(),
      gender,
      dob,
      batch,
      gradeApplying,
      residenceType,
      parentName: parentName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      email: email.trim(),
    });

    setIsSubmitting(false);
    if (!res.ok || !res.application) {
      setStepError(res.error || 'Could not submit application.');
      return;
    }
    setSubmittedRecord(res.application);
  };

  const handleStatusLookup = (e: React.FormEvent) => {
    e.preventDefault();
    setLookupSearched(true);
    const found = findAdmissionByCredentials(lookupInput);
    setLookupResult(found);
  };

  if (!siteConfig.featureToggles.admissionFormOpen) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">
          Online Pre-Admission Registration Currently Paused
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Please contact the school admission office at {siteConfig.phonePrimary} or visit our
          Sathyamangalam campus directly.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-14 space-y-10">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span>Admissions Portal 2026–2027</span>
            <span aria-hidden="true">·</span>
            <span>Day Scholar &amp; Residential Hostel</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            Pre-Admission Registration &amp; Status Portal
          </h1>
        </div>

        <div className="flex items-center gap-1 p-1.5 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 self-start">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'register'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            New Pre-Admission Form
          </button>
          <button
            type="button"
            onClick={() => setMode('status')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'status'
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Check Application Status
          </button>
        </div>
      </div>

      {mode === 'status' ? (
        /* PARENT APPLICATION STATUS PORTAL */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 space-y-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
              Parent Application Status Tracker
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Enter your registered Parent Email ID or Application ID (for example:{' '}
              <span className="font-mono text-amber-500">SRT-2026-1001</span> or{' '}
              <span className="font-mono text-amber-500">SRT-2026-1002</span>) to view live
              admission status.
            </p>
          </div>

          <form onSubmit={handleStatusLookup} className="flex flex-col sm:flex-row gap-3 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={lookupInput}
                onChange={(e) => setLookupInput(e.target.value)}
                placeholder="Enter Application ID (e.g. SRT-2026-1001) or Email..."
                aria-label="Application ID or Parent Email"
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm whitespace-nowrap shrink-0 cursor-pointer"
            >
              Check Status
            </button>
          </form>

          {lookupSearched && !lookupResult && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>
                No application found matching &ldquo;{lookupInput}&rdquo;. Please verify your
                Application ID or registered Email ID.
              </span>
            </div>
          )}

          {lookupResult && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Application ID</div>
                  <div className="font-mono tabular-nums text-xl font-bold text-amber-500">
                    {lookupResult.applicationId}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Current Status</div>
                  <div
                    className={`font-mono text-sm font-bold uppercase mt-0.5 ${
                      lookupResult.status === 'accepted'
                        ? 'text-emerald-400'
                        : lookupResult.status === 'rejected'
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {lookupResult.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Student Name
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {lookupResult.studentName}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Batch &amp; Mode
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {lookupResult.batch} · {lookupResult.residenceType}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Class / Group Applied
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {lookupResult.gradeApplying}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Parent / Guardian
                  </span>
                  <strong className="text-slate-900 dark:text-white">
                    {lookupResult.parentName}
                  </strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Registered Email
                  </span>
                  <strong className="text-slate-900 dark:text-white">{lookupResult.email}</strong>
                </div>
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Registered Phone
                  </span>
                  <strong className="font-mono tabular-nums text-slate-900 dark:text-white">
                    {lookupResult.phone}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : submittedRecord ? (
        /* SUBMISSION SUCCESS SCREEN */
        <div
          data-testid="admission-success-card"
          className="rounded-2xl border border-emerald-500/40 bg-white dark:bg-slate-900 p-8 sm:p-10 space-y-6 text-center max-w-2xl mx-auto"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Pre-Admission Application Submitted
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Thank You, {submittedRecord.parentName}!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Your child <strong>{submittedRecord.studentName}</strong>’s pre-admission registration
              for <strong>{submittedRecord.gradeApplying}</strong> ({submittedRecord.residenceType})
              has been recorded with status <strong>PENDING</strong>.
            </p>
          </div>

          <div className="rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 space-y-1">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Unique Application Reference ID
            </div>
            <div
              data-testid="generated-application-id"
              className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-amber-500"
            >
              {submittedRecord.applicationId}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Registered Parent User ID: {submittedRecord.email}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Acknowledgement</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLookupInput(submittedRecord.applicationId);
                setLookupResult(submittedRecord);
                setLookupSearched(true);
                setMode('status');
              }}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold cursor-pointer"
            >
              Track Application Status Live
            </button>
          </div>
        </div>
      ) : (
        /* 4-STEP MULTI-STEP REGISTRATION FORM */
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-10 space-y-8">
          {/* Step Progress Bar */}
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium">
              {[
                [1, '01. Student Details'],
                [2, '02. Parent & Contact'],
                [3, '03. Account Verification'],
                [4, '04. Review & Submit'],
              ].map(([sNum, label]) => (
                <div
                  key={sNum}
                  className={`pb-2 border-b-2 transition-colors ${
                    step >= Number(sNum)
                      ? 'border-amber-500 text-slate-900 dark:text-white font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-400'
                  }`}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          {stepError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-400 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{stepError}</span>
            </div>
          )}

          <form onSubmit={handleFinalSubmit} className="space-y-6">
            {/* STEP 1: STUDENT INFORMATION */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2 space-y-1.5">
                  <label
                    htmlFor="studentName"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Student Full Name *
                  </label>
                  <input
                    id="studentName"
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Harish Kumar R."
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="gender"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Gender *
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'Male' | 'Female' | 'Other')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dob"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Date of Birth *
                  </label>
                  <input
                    id="dob"
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="batch"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Academic Batch to Join *
                  </label>
                  <select
                    id="batch"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="2026-2027">2026-2027</option>
                    <option value="2027-2028">2027-2028</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="residenceType"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Scholar Status (Day Scholar / Hostel) *
                  </label>
                  <select
                    id="residenceType"
                    value={residenceType}
                    onChange={(e) => setResidenceType(e.target.value as 'Day Scholar' | 'Hostel')}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Day Scholar">Day Scholar</option>
                    <option value="Hostel">Hostel (Residential Boarding)</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label
                    htmlFor="gradeApplying"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Class / Higher Secondary Group Applying For *
                  </label>
                  <select
                    id="gradeApplying"
                    value={gradeApplying}
                    onChange={(e) => setGradeApplying(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    {CLASS_GROUPS.map((cg) => (
                      <option key={cg} value={cg}>
                        {cg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* STEP 2: PARENT / GUARDIAN DETAILS */}
            {step === 2 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label
                    htmlFor="parentName"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Parent / Guardian Full Name *
                  </label>
                  <input
                    id="parentName"
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="e.g. R. Rajendran"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="phone"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    10-Digit Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="9842722045"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-mono tabular-nums text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label
                    htmlFor="address"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Full Residential Address *
                  </label>
                  <textarea
                    id="address"
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Door No, Street, Town/Village, District, Pincode"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label
                    htmlFor="parentEmail"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Email ID (Used as Parent Portal User ID) *
                  </label>
                  <input
                    id="parentEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Portal Password *
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 dark:text-slate-400">
                      Strength: <strong>{passwordStrength.label}</strong>
                    </span>
                    <span className="font-mono tabular-nums text-amber-500">
                      {passwordStrength.score} / 4
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Confirm Password *
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: ACCOUNT VERIFICATION (GOOGLE OR EMAIL) */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-amber-500 shrink-0" />
                    <div>
                      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                        Verify Parent Account Identity
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        You may link your Google account via Firebase Auth to auto-verify your
                        email, or proceed with your Email &amp; Password credentials ({email}).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => setAccountMethod('email')}
                      className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                        accountMethod === 'email'
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                          Email &amp; Password Signup
                        </span>
                        <UserCheck className="w-4 h-4 text-amber-500" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Parent ID: {email}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={handleGoogleVerify}
                      className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                        accountMethod === 'google'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display text-sm font-bold text-slate-900 dark:text-white">
                          Sign in with Google
                        </span>
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {googleVerifiedEmail || currentUser?.email
                          ? `Verified: ${googleVerifiedEmail || currentUser?.email}`
                          : 'Click to verify with Firebase Google Auth'}
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-6 space-y-4">
                  <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Review Pre-Admission Application Summary
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Student Full Name
                      </span>
                      <strong className="text-slate-900 dark:text-white">{studentName}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Gender &amp; Date of Birth
                      </span>
                      <strong className="text-slate-900 dark:text-white">
                        {gender} · {dob}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Batch &amp; Scholar Mode
                      </span>
                      <strong className="text-slate-900 dark:text-white">
                        {batch} · {residenceType}
                      </strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Class / Group Applying For
                      </span>
                      <strong className="text-slate-900 dark:text-white">{gradeApplying}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Parent / Guardian Name
                      </span>
                      <strong className="text-slate-900 dark:text-white">{parentName}</strong>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Phone &amp; Email ID
                      </span>
                      <strong className="text-slate-900 dark:text-white">
                        {phone} · {email}
                      </strong>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400 block">
                        Residential Address
                      </span>
                      <strong className="text-slate-900 dark:text-white">{address}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStepError(null);
                    setStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
                  }}
                  className="px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Step</span>
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Step {step + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isSubmitting ? 'Submitting...' : 'Submit Pre-Admission Application'}</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
