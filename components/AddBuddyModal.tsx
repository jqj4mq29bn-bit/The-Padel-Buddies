import React, { useState } from 'react';
import { User } from '../types';
import { XIcon, UserPlusIcon } from './IconComponents';

interface AddBuddyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
}

const AddBuddyModal: React.FC<AddBuddyModalProps> = ({ isOpen, onClose, currentUser }) => {
  const [inviteMessage, setInviteMessage] = useState('');

  const handleShare = async () => {
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
    }, 300);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button type="button" onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">Add a New Buddy</h2>
        <p className="text-sm text-slate-400 mb-6">Share this unique link with a friend. When they sign up, you'll automatically become buddies!</p>

        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-3 px-4 rounded-md transition-colors"
        >
          <UserPlusIcon className="w-5 h-5" />
          Share Invite Link
        </button>

        {inviteMessage && <p className="text-center text-sm text-padel-blue mt-3">{inviteMessage}</p>}
      </div>
    </div>
  );
};

export default AddBuddyModal;