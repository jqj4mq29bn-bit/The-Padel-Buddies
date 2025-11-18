import React, { useState, useMemo } from 'react';
import { PlayerPool, User } from '../types';
import { XIcon, PlusIcon, UsersIcon } from './IconComponents';

interface PlayerPoolDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pool: PlayerPool;
  currentUser: User;
  onAddPlayer: (poolId: string, playerName: string) => void;
  onProposeGame: (pool: PlayerPool) => void;
}

const PlayerPoolDetailsModal: React.FC<PlayerPoolDetailsModalProps> = ({ isOpen, onClose, pool, currentUser, onAddPlayer, onProposeGame }) => {
  const [isInviting, setIsInviting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddBuddy = (buddyName: string) => {
    onAddPlayer(pool.id, buddyName);
    setSearchTerm(''); // Reset search after adding
  };
  
  const buddiesToInvite = useMemo(() => {
    const allBuddiesToInvite = currentUser.buddies.filter(
      buddy => !pool.members.includes(buddy)
    );
    if (!searchTerm) {
        return allBuddiesToInvite;
    }
    return allBuddiesToInvite.filter(buddy => 
        buddy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [currentUser.buddies, pool.members, searchTerm]);
  
  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setIsInviting(false);
        setSearchTerm('');
    }, 300); // Reset after closing animation
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        
        <div className="flex-shrink-0">
            <div className="flex items-center gap-3 text-padel-blue font-bold text-2xl">
              <UsersIcon className="w-7 h-7" />
              <h3>{pool.name}</h3>
            </div>
            <p className="text-slate-400 text-sm mt-1">{pool.members.length} members</p>
        </div>
      
        <div className="flex-grow mt-4 overflow-y-auto pr-2">
            <div className="flex flex-wrap gap-2 mb-4">
              {pool.members.map(member => (
                <span key={member} className="bg-padel-blue/20 text-padel-blue text-xs font-semibold px-2.5 py-1 rounded-full">
                  {member}
                </span>
              ))}
            </div>

            {isInviting && (
              <div className="mt-4 p-4 bg-padel-blue/5 rounded-lg">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Select a buddy to invite</h4>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search buddies..."
                  className="w-full bg-padel-blue/10 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue mb-3"
                  autoFocus
                />
                {buddiesToInvite.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                    {buddiesToInvite.map(buddy => (
                      <button
                        key={buddy}
                        onClick={() => handleAddBuddy(buddy)}
                        className="bg-slate-600 hover:bg-slate-500 text-slate-200 text-sm font-semibold px-3 py-1.5 rounded-full transition-colors"
                      >
                        <PlusIcon className="w-3 h-3 inline mr-1.5" />
                        {buddy}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">
                    {currentUser.buddies.filter(b => !pool.members.includes(b)).length === 0 
                        ? "All your buddies are already in this pool."
                        : "No buddies found with that name."
                    }
                  </p>
                )}
              </div>
            )}
        </div>

        <div className="flex-shrink-0 mt-6 flex gap-2">
            <button
                onClick={() => {
                    onProposeGame(pool);
                    handleClose();
                }}
                className="flex-1 border border-white/50 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                Propose Pool Game
            </button>
            <button
                onClick={() => {
                    setIsInviting(!isInviting);
                    if (isInviting) setSearchTerm('');
                }}
                className="flex-1 border border-white/50 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
                {isInviting ? 'Cancel' : 'Invite Buddy'}
            </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerPoolDetailsModal;