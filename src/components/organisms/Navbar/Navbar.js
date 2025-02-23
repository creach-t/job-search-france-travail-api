import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-primary p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-white text-xl font-bold">Job Search</Link>
        <div className="space-x-4">
          <Link to="/search" className="text-white hover:text-gray-200">Recherche</Link>
          <Link to="/favorites" className="text-white hover:text-gray-200">Favoris</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;