import React, { lazy, Suspense } from 'react';
import { Navigate, createBrowserRouter } from 'react-router-dom';

import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));

const HomePage = lazy(() => import('../pages/home/HomePage'));

const MeetingPage = lazy(() => import('../pages/meeting/MeetingPage'));
const MeetingCreatePage = lazy(() => import('../pages/meeting/MeetingCreatePage'));
const MeetingDetailsPage = lazy(() => import('../pages/meeting/MeetingDetailsPage'));
const MeetingEditPage = lazy(() => import('../pages/meeting/MeetingEditPage'));

const UserPage = lazy(() => import('../pages/user/UserPage'));
const UserCreatePage = lazy(() => import('../pages/user/UserCreatePage'));
const UserEditPage = lazy(() => import('../pages/user/UserEditPage'));

const DivisionPage = lazy(() => import('../pages/division/DivisionPage'));
const DivisionCreatePage = lazy(() => import('../pages/division/DivisionCreatePage'));
const DivisionDetailsPage = lazy(() => import('../pages/division/DivisionDetailsPage'));
const DivisionEditPage = lazy(() => import('../pages/division/DivisionEditPage'));

const RoomPage = lazy(() => import('../pages/room/RoomPage'));
const RoomCreatePage = lazy(() => import('../pages/room/RoomCreatePage'));
const RoomDetailsPage = lazy(() => import('../pages/room/RoomDetailsPage'));
const RoomEditPage = lazy(() => import('../pages/room/RoomEditPage'));

const NotificationPage = lazy(() => import('../pages/notification/NotificationPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));

const LoadingFallback = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
    <p className="text-sm font-medium text-slate-500 animate-pulse">Memuat halaman...</p>
  </div>
);

// 🏛️ KONFIGURASI OBJECT ROUTER TERPUSAT
export const router = createBrowserRouter([
  {
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <PublicLayout />
      </Suspense>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
    ]
  },
  {
    element: (
      <Suspense fallback={<LoadingFallback />}>
        <DashboardLayout />
      </Suspense>
    ),
    children: [
      { path: '/', element: <Navigate to="/home" replace /> },
      { path: '/home', element: <HomePage /> },

      // 📅 Sub-Routes: Meetings
      {
        path: '/meetings',
        children: [
          { index: true, element: <MeetingPage /> },
          { path: 'create', element: <MeetingCreatePage /> },
          { path: 'details/:id', element: <MeetingDetailsPage /> },
          { path: 'edit/:id', element: <MeetingEditPage /> },
        ]
      },

      // 👤 Sub-Routes: Users
      {
        path: '/users',
        children: [
          { index: true, element: <UserPage /> },
          { path: 'create', element: <UserCreatePage /> },
          { path: 'edit/:id', element: <UserEditPage /> },
        ]
      },

      // 🏢 Sub-Routes: Divisions
      {
        path: '/divisions',
        children: [
          { index: true, element: <DivisionPage /> },
          { path: 'create', element: <DivisionCreatePage /> },
          { path: 'details/:id', element: <DivisionDetailsPage /> },
          { path: 'edit/:id', element: <DivisionEditPage /> },
        ]
      },

      // 🚪 Sub-Routes: Rooms
      {
        path: '/rooms',
        children: [
          { index: true, element: <RoomPage /> },
          { path: 'create', element: <RoomCreatePage /> },
          { path: 'details/:id', element: <RoomDetailsPage /> },
          { path: 'edit/:id', element: <RoomEditPage /> },
        ]
      },

      { path: '/notifications', element: <NotificationPage /> },
      { path: '/settings', element: <SettingsPage /> },
    ]
  },
  { path: '*', element: <Navigate to="/login" replace /> }
]);