import React from 'react';
import { Outlet } from 'react-router-dom';
import CommandBar from './CommandBar';

// Shell applicatif glassmorphism : une seule barre de commande en haut, pas de sidebar.
const AppShell = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <CommandBar />
      <main className="flex-1 px-3 pb-10 pt-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
