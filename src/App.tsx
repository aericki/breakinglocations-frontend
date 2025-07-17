import React, { Suspense, lazy } from 'react';
import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";

// Layout and Protected Route
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports (now dynamic)
const HomePage = lazy(() => import('./pages/Home'));
const SignUpPage = lazy(() => import('./pages/SignUp').then(module => ({ default: module.SignUpPage })));
const LoginPage = lazy(() => import('./pages/Login').then(module => ({ default: module.LoginPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPassword').then(module => ({ default: module.ForgotPasswordPage })));
const Localization = lazy(() => import('./pages/Locations'));
const AddLocationPage = lazy(() => import('./pages/AddLocation'));
const LocationDetailPage = lazy(() => import('./pages/LocationDetail'));
const UserProfilePage = lazy(() => import('./pages/Profile'));

const App: React.FC = () => {
  return (
    <>
      <BrowserRouter basename='/'>
        <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Skeleton className="h-24 w-24 rounded-full" /></div>}>
          <Routes>
            {/* --- Standalone Auth Routes --- */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* --- Main App Layout --- */}
            <Route element={<Layout />}>
              {/* --- Public Routes --- */}
              <Route path="/" element={<HomePage />} />
              <Route path="/locations" element={<Localization />} />
              <Route path="/locations/:id" element={<LocationDetailPage />} />
              <Route path="/profile/:id" element={<UserProfilePage />} />

              {/* --- Protected Routes within Layout --- */}
              <Route element={<ProtectedRoute />}>
                <Route path="/add-location" element={<AddLocationPage />} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;
