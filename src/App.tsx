/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RouteMindProvider } from './context/RouteMindContext';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { LiveFleetPage } from './pages/LiveFleetPage';
import { RoutesTripsPage } from './pages/RoutesTripsPage';
import { StudentsPage } from './pages/StudentsPage';
import { DriversPage } from './pages/DriversPage';
import { AttendancePage } from './pages/AttendancePage';
import { IntelligencePage } from './pages/IntelligencePage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <RouteMindProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/fleet" element={<LiveFleetPage />} />
            <Route path="/routes" element={<RoutesTripsPage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/attendance" element={<AttendancePage />} />
            <Route path="/intelligence" element={<IntelligencePage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </RouteMindProvider>
    </BrowserRouter>
  );
}
