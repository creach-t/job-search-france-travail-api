import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/organisms/Layout';
import HomePage from './pages/HomePage';
import JobDetailsPage from './pages/JobDetailsPage';
import SavedJobsPage from './pages/SavedJobsPage';
import NotFoundPage from './pages/NotFoundPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="job/:id" element={<JobDetailsPage />} />
          <Route path="saved" element={<SavedJobsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

export default App;
