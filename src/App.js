import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell';
import SearchPage from './pages/SearchPage';
import JobDetailsPage from './pages/JobDetailsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell />}>
        <Route index element={<SearchPage />} />
        <Route path="job/:id" element={<JobDetailsPage />} />
        <Route path="favoris" element={<SavedJobsPage />} />

        {/* Redirections des anciennes URLs — tout est désormais centré sur la recherche */}
        <Route path="offres" element={<Navigate to="/" replace />} />
        <Route path="dashboard" element={<Navigate to="/" replace />} />
        <Route path="tendances" element={<Navigate to="/?tab=analyse" replace />} />
        <Route path="analyse" element={<Navigate to="/?tab=analyse" replace />} />
        <Route path="carte" element={<Navigate to="/?tab=carte" replace />} />
        <Route path="map" element={<Navigate to="/?tab=carte" replace />} />
        <Route path="saved" element={<Navigate to="/favoris" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
