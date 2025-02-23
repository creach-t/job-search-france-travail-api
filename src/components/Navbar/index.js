import { Fragment, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Disclosure } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAppContext } from '../../context/AppContext';
import MobileMenu from './MobileMenu';
import NavLinks from './NavLinks';

const Navbar = () => {
  const { savedJobs } = useAppContext();
  const savedJobsCount = savedJobs.length;

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 justify-between">
              <div className="flex">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="flex items-center">
                    <span className="text-lg font-semibold text-ft-blue">Recherche Emploi</span>
                  </Link>
                </div>
                <NavLinks savedJobsCount={savedJobsCount} />
              </div>
              
              <div className="-mr-2 flex items-center sm:hidden">
                {/* Mobile menu button */}
                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-ft-blue">
                  <span className="sr-only">Ouvrir le menu principal</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          <MobileMenu savedJobsCount={savedJobsCount} />
        </>
      )}
    </Disclosure>
  );
};

export default Navbar;
