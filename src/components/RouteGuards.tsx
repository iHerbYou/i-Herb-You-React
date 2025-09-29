import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function isLoggedIn(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    return !!window.sessionStorage.getItem('auth');
  } catch {
    return false;
  }
}

export const GuestOnly: React.FC = () => {
  const authed = isLoggedIn();
  const location = useLocation();
  if (authed) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export const RequireAuth: React.FC = () => {
  const authed = isLoggedIn();
  const location = useLocation();
  if (!authed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

