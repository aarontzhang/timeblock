import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TimeEntriesProvider } from './contexts/TimeEntriesContext';
import { AuthGuard } from './components/auth/AuthGuard';
import { Layout } from './components/layout/Layout';
import { TimeGrid } from './components/tracking/TimeGrid';
import { StatsView } from './components/stats/StatsView';
import { SettingsView } from './components/settings/SettingsView';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGuard>
          <TimeEntriesProvider>
            <Layout>
              <Routes>
                <Route path="/" element={<TimeGrid />} />
                <Route path="/stats" element={<StatsView />} />
                <Route path="/settings" element={<SettingsView />} />
              </Routes>
            </Layout>
          </TimeEntriesProvider>
        </AuthGuard>
      </AuthProvider>
    </BrowserRouter>
  );
}
