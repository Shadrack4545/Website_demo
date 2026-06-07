import React from 'react';
import { useAuth } from '../../hooks/useContext';
import { Navigate } from 'react-router-dom';

interface RequireAdminProps {
  children: React.ReactElement;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) return null;

  if (!currentUser || !(currentUser.role === 'admin' || currentUser.role === 'super-admin')) {
    // redirect to dashboard/home if not authorized
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
