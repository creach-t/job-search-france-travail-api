import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import NotFoundPage from './pages/NotFoundPage';
import { ROUTES } from './utils/constants';

function App() {
  return (
    <Routes>
      <Route path={ROUTES.HOME} element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path={`${ROUTES.JOB_DETAILS}/:id`} element={<JobDetailsPage />} />
        <Route path={ROUTES.SAVED_JOBS} element={<SavedJobsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
