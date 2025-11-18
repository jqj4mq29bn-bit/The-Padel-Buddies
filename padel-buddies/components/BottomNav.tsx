import React from 'react';
import { HomeIcon, UsersIcon, UserCircleIcon } from './IconComponents';

type View = 'home' | 'buddies' | 'profile';

interface BottomNavProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
      isActive ? 'text-padel-blue' : 'text-slate-400 hover:text-padel-blue'
    }`}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
  </button>
);

const BottomNav: React.FC<BottomNavProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-padel-blue/10 backdrop-blur-md border-t border-padel-blue/20 flex justify-around items-center z-40">
      <NavItem
        label="Home"
        icon={<HomeIcon className="w-6 h-6 mb-1" />}
        isActive={activeView === 'home'}
        onClick={() => setActiveView('home')}
      />
      <NavItem
        label="Buddies"
        icon={<UsersIcon className="w-6 h-6 mb-1" />}
        isActive={activeView === 'buddies'}
        onClick={() => setActiveView('buddies')}
      />
      <NavItem
        label="Profile"
        icon={<UserCircleIcon className="w-6 h-6 mb-1" />}
        isActive={activeView === 'profile'}
        onClick={() => setActiveView('profile')}
      />
    </div>
  );
};

export default BottomNav;