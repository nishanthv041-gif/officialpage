/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { SchoolDataProvider } from './context/SchoolDataContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { ToastContainer } from './components/common/ToastContainer';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { AcademicsPage } from './pages/AcademicsPage';
import { GalleriesPage } from './pages/GalleriesPage';
import { PreAdmissionPage } from './pages/PreAdmissionPage';
import { ContactLocationPage } from './pages/ContactLocationPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { resolveSpaRouteTarget } from './utils/schoolLogic';

function SpaRouteNormalizer() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const normalizedTarget = resolveSpaRouteTarget(
      location.pathname,
      location.search,
      location.hash
    );
    if (normalizedTarget) {
      navigate(normalizedTarget, { replace: true });
    }
  }, [location.pathname, location.search, location.hash, navigate]);

  return null;
}

export default function App() {
  const [bootLoading, setBootLoading] = useState<boolean>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('autostart') !== '1';
  });

  useEffect(() => {
    if (!bootLoading) return;
    const timer = window.setTimeout(() => {
      setBootLoading(false);
    }, 450);
    return () => window.clearTimeout(timer);
  }, [bootLoading]);

  return (
    <SchoolDataProvider>
      {bootLoading && (
        <div
          aria-label="Loading SRT Universal School Portal"
          className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-opacity duration-200"
        >
          <div className="w-16 h-16 rounded-2xl border-2 border-amber-500 bg-slate-900 flex items-center justify-center font-display text-xl font-bold text-amber-400 mb-4 shadow-lg">
            SRT
          </div>
          <div className="font-display text-lg font-bold text-white tracking-tight">
            SRT UNIVERSAL HR.SEC SCHOOL
          </div>
          <div className="text-xs text-amber-400 mt-1">
            Sathyamangalam · Learn. Lead. Inspire.
          </div>
        </div>
      )}

      <BrowserRouter>
        <SpaRouteNormalizer />
        <Routes>
          {/* Protected / Full-Screen Admin Route */}
          <Route path="/admin" element={<AdminPortalPage />} />
          <Route path="/admin/*" element={<AdminPortalPage />} />

          {/* Public School Website Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/about"
            element={
              <PublicLayout>
                <AboutPage />
              </PublicLayout>
            }
          />
          <Route
            path="/academics"
            element={
              <PublicLayout>
                <AcademicsPage />
              </PublicLayout>
            }
          />
          <Route
            path="/galleries"
            element={
              <PublicLayout>
                <GalleriesPage />
              </PublicLayout>
            }
          />
          <Route
            path="/events"
            element={
              <PublicLayout>
                <GalleriesPage initialTab="events" />
              </PublicLayout>
            }
          />
          <Route
            path="/sports"
            element={
              <PublicLayout>
                <GalleriesPage initialTab="sports" />
              </PublicLayout>
            }
          />
          <Route
            path="/achievements"
            element={
              <PublicLayout>
                <GalleriesPage initialTab="achievements" />
              </PublicLayout>
            }
          />
          <Route
            path="/admissions"
            element={
              <PublicLayout>
                <PreAdmissionPage />
              </PublicLayout>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicLayout>
                <ContactLocationPage />
              </PublicLayout>
            }
          />
          <Route
            path="/location"
            element={
              <PublicLayout>
                <ContactLocationPage />
              </PublicLayout>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </SchoolDataProvider>
  );
}
