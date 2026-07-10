import React from 'react';
import { Route, Routes, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/common/Sidebar';
import Navbar from './components/common/Navbar';
import useAuthUser from './hooks/useAuthUser';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

import HomePage from './pages/home/HomePage';
import MeetingPage from './pages/meeting/MeetingPage';
import UserPage from './pages/user/UserPage';
import UserCreatePage from './pages/user/UserCreatePage';
import UserEditPage from './pages/user/UserEditPage';
import DivisionPage from './pages/division/DivisionPage';
import DivisionCreatePage from './pages/division/DivisionCreatePage';
import DivisionEditPage from './pages/division/DivisionEditPage';
import DivisionDetailsPage from './pages/division/DivisionDetailsPage';
import RoomPage from './pages/room/RoomPage';
import NotificationPage from './pages/notification/NotificationPage';
import SettingsPage from './pages/settings/SettingsPage';

function PublicLayout() {
  const { data: authUser, isLoading } = useAuthUser();

  if (isLoading) return null;

  if (authUser) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}

function DashboardLayout() {
  const { data: authUser, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <p className="text-sm font-medium text-slate-500 animate-pulse">Memeriksa otentikasi...</p>
      </div>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen w-screen bg-slate-100 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar />
        
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        
        <Route path="/home" element={<HomePage />} />
        <Route path="/meetings" element={<MeetingPage />} />

        <Route path="/users" element={<UserPage />} />
        <Route path="/users/create" element={<UserCreatePage />} />
        <Route path="/users/edit/:id" element={<UserEditPage />} />

        <Route path="/divisions" element={<DivisionPage />} />
        <Route path="/divisions/create" element={<DivisionCreatePage />} />
        <Route path="/divisions/edit/:id" element={<DivisionEditPage />} />
        <Route path="/divisions/details/:id" element={<DivisionDetailsPage />} />

        <Route path="/rooms" element={<RoomPage />} />
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}