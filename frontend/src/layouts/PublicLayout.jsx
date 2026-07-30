import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthUser from '../hooks/useAuthUser';

export default function PublicLayout() {
  const { data: authUser, isLoading } = useAuthUser();

  if (isLoading) return null;

  if (authUser) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}