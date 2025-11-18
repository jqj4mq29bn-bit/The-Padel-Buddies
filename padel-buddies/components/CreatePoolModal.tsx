import React, { useState, useMemo } from 'react';
import { XIcon } from './IconComponents';
import { User } from '../types';

interface CreatePoolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPool: (name: string, members: string[]) => void;
  currentUser: User;
}

const CreatePoolModal: React.FC<CreatePoolModalProps> = ({ isOpen, onClose, onAddPool, currentUser }) => {
  const [name, setName] = useState('');
  const [selectedBuddies, setSelectedBuddies] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onAddPool(name, selectedBuddies);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setName('');
        setSelectedBuddies([]);
        setSearchTerm('');
    }, 300); // Reset after closing animation
  }

  const handleToggleBuddy = (buddyName: string) => {
    setSelectedBuddies(prev =>
      prev.includes(buddyName)
        ? prev.filter(b => b !== buddyName)
        : [...prev, buddyName]
    );
  };

  const filteredBuddies = useMemo(() => {
    if (!searchTerm) {
      return currentUser.buddies;
    }
    return currentUser.buddies.filter(buddy =>
      buddy.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, currentUser.buddies]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-4">Create a New Player Pool</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="poolName" className="block text-sm font-medium text-slate-300 mb-1">Pool Name</label>
            <input 
              type="text" 
              id="poolName" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g., Weekend Warriors" 
              className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue" 
              required 
            />
          </div>
          <div>
            <label htmlFor="searchBuddies" className="block text-sm font-medium text-slate-300 mb-1">Invite Buddies (Optional)</label>
            <input
              type="text"
              id="searchBuddies"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search your buddies..."
              className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue mb-2"
            />
            {currentUser.buddies.length > 0 ? (
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
                   <p className="text-sm text-slate-400 w-full text-center">No buddies found.</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400 px-2 py-1">You have no buddies to invite to a pool yet.</p>
            )}
          </div>
          <button type="submit" className="w-full bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-3 px-4 rounded-md transition-colors">
            Create Pool
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePoolModal;