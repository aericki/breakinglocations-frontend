// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { firebaseUser, loading } = useAuth();

  if (loading) {
    // You can add a loading spinner here if you want
    return <div>Carregando...</div>;
  }

  if (!firebaseUser) {
    // User is not authenticated, redirect to login page
    return <Navigate to="/login" replace />;
  }

  // User is authenticated, render the child route content
  return <Outlet />;
};

export default ProtectedRoute;
