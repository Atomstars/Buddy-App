import React from 'react';
import { Header } from './Header';
import { FloatingBottomNavbar } from './FloatingBottomNavbar';

export const AppShell = ({ 
  children, 
  activeTab, 
  onTabSelect, 
  onProfileClick 
}) => {
  return (
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 flex flex-col overflow-x-hidden">
      <Header onProfileClick={onProfileClick} />
      
      <main className="flex-1 w-full px-4 pt-4 pb-32 flex flex-col gap-6">
        {children}
      </main>

      <FloatingBottomNavbar activeTab={activeTab} onTabSelect={onTabSelect} />
    </div>
  );
};
