import React, { useState } from 'react';
import { User } from '../types';
import { XIcon, UserPlusIcon, UsersIcon } from './IconComponents';

interface PadelbuddiesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const PadelbuddiesListModal: React.FC<PadelbuddiesListModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [inviteMessage, setInviteMessage] = useState('');

  const handleInvite = async () => {
    const inviteLink = `${window.location.origin}${window.location.pathname}?invite_from=${encodeURIComponent(currentUser.name)}`;
    const shareData = {
      title: 'Join me on Padel Buddies!',
      text: `Let's organize our padel Games easily. Join me on Padel Buddies!`,
      url: inviteLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Web Share API not supported');
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      navigator.clipboard.writeText(inviteLink).then(() => {
        setInviteMessage('Invite link copied to clipboard!');
        setTimeout(() => setInviteMessage(''), 3000);
      });
    }
  };
  
  const handleClose = () => {
    onClose();
    setTimeout(() => {
        setInviteMessage('');
    }, 300); // Reset after closing animation
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl flex flex-col max-h-[90vh]">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 text-padel-blue font-bold text-2xl mb-4">
          <UsersIcon className="w-7 h-7" />
          <h3>My Padelbuddies</h3>
        </div>

        <div className="flex-grow overflow-y-auto pr-2">
            {currentUser.buddies.length > 0 ? (
            <div className="flex flex-wrap gap-2">
                {currentUser.buddies.map(buddy => (
                <span key={buddy} className="bg-padel-blue/20 text-padel-blue text-sm font-semibold px-3 py-1.5 rounded-full">
                    {buddy}
                </span>
                ))}
            </div>
            ) : (
            <p className="text-slate-400 italic">
                You have not added any buddies yet. Invite some friends to get started!
            </p>
            )}
        </div>
        
        <div className="flex-shrink-0 mt-6">
            <button
                onClick={handleInvite}
                className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-padel-blue/30 hover:border-padel-blue hover:text-padel-blue text-slate-400 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
                <UserPlusIcon className="w-5 h-5" />
                Invite a Buddy
            </button>
            {inviteMessage && <p className="text-center text-sm text-padel-blue mt-3">{inviteMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default PadelbuddiesListModal;