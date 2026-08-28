import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import MapPage from './pages/MapPage';
import AnalysePage from './pages/AnalysePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<DashboardPage />} />
        <Route path="offres" element={<HomePage />} />
        <Route path="job/:id" element={<JobDetailsPage />} />
        <Route path="tendances" element={<AnalysePage />} />
        <Route path="carte" element={<MapPage />} />
        <Route path="favoris" element={<SavedJobsPage />} />

        {/* Redirections des anciennes URLs */}
        <Route path="analyse" element={<Navigate to="/tendances" replace />} />
        <Route path="map" element={<Navigate to="/carte" replace />} />
        <Route path="saved" element={<Navigate to="/favoris" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
