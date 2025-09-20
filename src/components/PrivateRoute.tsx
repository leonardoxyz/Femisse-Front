import React from 'react';
import { Navigate } from 'react-router-dom';
import { getToken } from '../hooks/useAuth';

export default function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
