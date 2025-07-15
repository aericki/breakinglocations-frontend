import React from 'react';
import { HashRouter as BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

// Layout and Protected Route
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Page Imports
import HomePage from './pages/Home';
import { SignUpPage } from './pages/SignUp';
import { LoginPage } from './pages/Login';
import { ForgotPasswordPage } from './pages/ForgotPassword';
import Localization from './pages/Locations';
import AddLocationPage from './pages/AddLocation';
import LocationDetailPage from './pages/LocationDetail'; // Import the new page
import UserProfilePage from './pages/Profile';
// import EditLocationPage from './pages/EditLocation';


const App: React.FC = () => {
  return (
    <>
      <BrowserRouter basename='/'>
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
            <Route path="/locations/:id" element={<LocationDetailPage />} /> {/* Add detail page route */}
            <Route path="/profile/:id" element={<UserProfilePage />} />

            {/* --- Protected Routes within Layout --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/add-location" element={<AddLocationPage />} />
              {/* <Route path="/edit-location/:id" element={<EditLocationPage />} /> */}
              {/* Add other protected routes here */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster />
    </>
  );
};

export default App;
