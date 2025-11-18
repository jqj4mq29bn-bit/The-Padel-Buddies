import React from 'react';
import { User } from '../types';
import { UsersIcon } from './IconComponents';

interface PadelbuddiesCardProps {
  currentUser: User;
  onShowDetails: () => void;
}

const PadelbuddiesCard: React.FC<PadelbuddiesCardProps> = ({ currentUser, onShowDetails }) => {
  const buddyCount = currentUser.buddies.length;

  return (
    <button
      onClick={onShowDetails}
      className="w-full bg-padel-blue/10 backdrop-blur-md border border-padel-blue/20 rounded-2xl p-6 shadow-lg text-left hover:bg-padel-blue/20 transition-colors"
    >
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 text-padel-blue font-bold text-xl">
            <UsersIcon className="w-6 h-6" />
            <h3>My Padelbuddies</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-white">{buddyCount}</p>
          <p className="text-sm text-slate-400">buddies</p>
        </div>
      </div>
    </button>
  );
};

export default PadelbuddiesCard;