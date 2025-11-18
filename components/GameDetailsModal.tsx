import React from 'react';
import { Meeting } from '../types';
import { XIcon, CalendarIcon, ClockIcon, LocationIcon, PencilIcon } from './IconComponents';
import PlayerChip from './PlayerChip';

interface GameDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  meeting: Meeting | null;
}

const GameDetailsModal: React.FC<GameDetailsModalProps> = ({ isOpen, onClose, onEdit, meeting }) => {
  if (!isOpen || !meeting) return null;

  const formattedDate = new Date(meeting.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const confirmedPlayers = meeting.players.filter(p => p.status === 'CONFIRMED');

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6">Game Details</h2>
        
        <div className="space-y-6 text-slate-300">
          <div className="grid grid-cols-[auto,1fr] items-center gap-x-4 gap-y-4">
              <LocationIcon className="w-6 h-6 text-padel-blue" />
              <div>
                  <p className="text-xs text-slate-400">Location</p>
                  <p className="font-semibold text-white text-lg">{meeting.location}</p>
              </div>

              <CalendarIcon className="w-6 h-6 text-padel-blue" />
              <div>
                  <p className="text-xs text-slate-400">Date</p>
                  <p className="font-semibold text-white text-lg">{formattedDate}</p>
              </div>

              <ClockIcon className="w-6 h-6 text-padel-blue" />
              <div>
                  <p className="text-xs text-slate-400">Time</p>
                  <p className="font-semibold text-white text-lg">{meeting.time}</p>
              </div>
          </div>
          
          <hr className="border-padel-blue/20" />
          
          <div>
            <h3 className="font-semibold text-white mb-2">Players ({confirmedPlayers.length}/4)</h3>
            {confirmedPlayers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {confirmedPlayers.map(player => <PlayerChip key={player.name} player={player} />)}
              </div>
            ) : (
              <p className="text-sm italic">No confirmed players yet.</p>
            )}
          </div>

          <hr className="border-padel-blue/20" />
          
          <div>
            <h3 className="font-semibold text-white mb-2">Court Status</h3>
            {meeting.courtReservedBy ? (
              <div className="space-y-1">
                <p><span className="text-padel-glow-white font-semibold">Reserved</span> by {meeting.courtReservedBy}</p>
                {meeting.entryCode && <p>Entry Code: <span className="font-mono bg-padel-blue/10 px-2 py-1 rounded">{meeting.entryCode}</span></p>}
              </div>
            ) : (
              <p className="text-padel-amber-light font-semibold">Not Reserved</p>
            )}
          </div>
        </div>

        <div className="mt-8 flex gap-4">
            <button 
                onClick={onEdit}
                className="flex-1 flex items-center justify-center gap-2 border border-white/50 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-md transition-colors"
            >
                <PencilIcon className="w-5 h-5"/>
                Edit Game
            </button>
            <button 
                onClick={onClose}
                className="flex-1 border border-white/50 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-md transition-colors"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default GameDetailsModal;