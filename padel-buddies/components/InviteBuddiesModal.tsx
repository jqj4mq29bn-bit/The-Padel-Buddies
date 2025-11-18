import React, { useState, useMemo, useEffect } from 'react';
import { User, Meeting } from '../types';
import { XIcon } from './IconComponents';

interface InviteBuddiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  meeting: Meeting;
  onInvite: (buddiesToInvite: string[]) => void;
}

const InviteBuddiesModal: React.FC<InviteBuddiesModalProps> = ({ isOpen, onClose, currentUser, meeting, onInvite }) => {
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
        setTimeout(() => {
            setSelectedBuddies([]);
            setSearchTerm('');
        }, 300); // Delay to allow for closing animation
    }
  }, [isOpen]);

  const buddiesToInvite = useMemo(() => {
    const alreadyInvolved = new Set([
      ...meeting.players.map(p => p.name),
      ...meeting.invitedPlayers
    ]);
    return currentUser.buddies.filter(buddy => !alreadyInvolved.has(buddy));
  }, [currentUser.buddies, meeting]);

  const filteredBuddies = useMemo(() => {
    if (!searchTerm) {
      return buddiesToInvite;
    }
    return buddiesToInvite.filter(buddy =>
      buddy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, buddiesToInvite]);

  const handleToggleBuddy = (buddyName: string) => {
    setSelectedBuddies(prev =>
      prev.includes(buddyName)
        ? prev.filter(b => b !== buddyName)
        : [...prev, buddyName]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedBuddies.length > 0) {
      onInvite(selectedBuddies);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form onSubmit={handleSubmit} className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button type="button" onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">Invite Buddies to the Game</h2>
        <p className="text-sm text-slate-400 mb-4">Select buddies to send them an invitation to this game.</p>
        
        <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search your buddies..."
            className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue mb-2"
        />

        <div className="min-h-[6rem]">
            {buddiesToInvite.length > 0 ? (
                <div className="flex flex-wrap gap-2 p-2 bg-padel-blue/5 rounded-md max-h-40 overflow-y-auto">
                    {filteredBuddies.map(buddy => (
                    <button
                        type="button"
                        key={buddy}
                        onClick={() => handleToggleBuddy(buddy)}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${
                        selectedBuddies.includes(buddy)
                            ? 'bg-padel-blue text-white font-semibold'
                            : 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                        }`}
                    >
                        {buddy}
                    </button>
                    ))}
                    {filteredBuddies.length === 0 && (
                        <p className="text-sm text-slate-400 w-full text-center py-2">No buddies found.</p>
                    )}
                </div>
            ) : (
                <p className="text-sm text-slate-400 px-2 py-4 text-center">All your buddies are already in this game!</p>
            )}
        </div>
        
        <button type="submit" disabled={selectedBuddies.length === 0} className="w-full mt-4 bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50">
            Send {selectedBuddies.length > 0 ? selectedBuddies.length : ''} Invite(s)
        </button>
      </form>
    </div>
  );
};

export default InviteBuddiesModal;