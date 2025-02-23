import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../components/molecules/Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
