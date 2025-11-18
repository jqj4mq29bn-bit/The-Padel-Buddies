import React, { useState } from 'react';
import { Meeting, Player, PlayerStatus, User, PlayerPool } from '../types';
import PlayerChip from './PlayerChip';
import { CalendarIcon, ClockIcon, LocationIcon, PlusIcon, ExternalLinkIcon, PencilIcon } from './IconComponents';
import InviteBuddiesModal from './InviteBuddiesModal';

interface MeetingCardProps {
  meeting: Meeting;
  currentUser: User;
  myPools: PlayerPool[]; // To check for proposed matches
  onUpdatePlayerStatus: (meetingId: string, playerName:string, newStatus: PlayerStatus) => void;
  onSetCourtReserved: (meetingId: string, user: string | null, entryCode?: string) => void;
  onEditGame: (meeting: Meeting) => void;
  onShowDetails: (meeting: Meeting) => void;
  onInviteBuddies: (meetingId: string, buddiesToInvite: string[]) => void;
  isHighlighted?: boolean;
}

const availabilityLinks: { [key: string]: string } = {
    'TC De Mol': 'https://www.tennisenpadelvlaanderen.be/nl/clubdashboard/reserveer-een-terrein?clubId=1933',
    'TC Iris': 'https://www.tennisenpadelvlaanderen.be/nl/clubdashboard/reserveer-een-terrein?clubId=1856'
};

const MeetingCard: React.FC<MeetingCardProps> = ({ meeting, currentUser, myPools, onUpdatePlayerStatus, onSetCourtReserved, onEditGame, onShowDetails, onInviteBuddies, isHighlighted }) => {
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [entryCodeInput, setEntryCodeInput] = useState(meeting.entryCode || '');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const confirmedPlayersList = meeting.players.filter(p => p.status === PlayerStatus.Confirmed);
  const confirmedPlayersCount = confirmedPlayersList.length;
  const isGameOn = confirmedPlayersCount >= 4;
  const isGameFull = confirmedPlayersCount >= 4;

  const currentUserPlayer = meeting.players.find(p => p.name === currentUser.name);
  const isCurrentUserConfirmed = !!currentUserPlayer && currentUserPlayer.status === PlayerStatus.Confirmed;
  const isCurrentUserDeclined = !!currentUserPlayer && currentUserPlayer.status === PlayerStatus.Declined;
  
  const hasExplicitInvite = meeting.invitedPlayers.includes(currentUser.name);
  // A game is open to a user if it's in their pool and they haven't already responded (confirmed or declined).
  const isPoolGameOpenToUser = !!meeting.poolId && myPools.some(p => p.id === meeting.poolId) && meeting.creator !== currentUser.name && !currentUserPlayer;
  const canRejoin = isCurrentUserDeclined;

  const isUrgentVacancy = !!meeting.courtReservedBy && !isGameFull;

  // The user can join if they are eligible, not already confirmed, and the game isn't full (or if it's an urgent vacancy).
  const canJoin = (!isGameFull || isUrgentVacancy) && !isCurrentUserConfirmed && (hasExplicitInvite || isPoolGameOpenToUser || canRejoin);
  
  const canEdit = isCurrentUserConfirmed;
  const canManageCourt = isCurrentUserConfirmed;

  // Derive the UI states from the core logic above
  const isUpcomingGame = isCurrentUserConfirmed && isGameOn; // Used for court reservation section
  const showBookNowButton = isGameOn && !meeting.courtReservedBy && canManageCourt;
  const showJoinNowButton = canJoin && !isUrgentVacancy;
  const isJoinedButNotFull = isCurrentUserConfirmed && !isGameOn;


  const formattedDate = new Date(meeting.date).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
   const shortDate = new Date(meeting.date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
  
  const getPlayerCountTag = (colorClass: 'green' | 'amber' | 'blue' | 'slate') => {
    const colorStyles = {
        green: 'bg-padel-green/10 text-padel-green border-padel-green/50',
        amber: 'bg-padel-amber/10 text-padel-amber-light border-padel-amber/50',
        blue: 'bg-padel-blue/10 text-padel-blue border-padel-blue/50',
        slate: 'bg-slate-700/50 text-slate-300 border-slate-600/50'
    };
    return (
        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${colorStyles[colorClass]}`}>
            {confirmedPlayersCount}/4
        </span>
    );
  };

  const getStatusComponent = () => {
    if (showJoinNowButton) {
      return (
        <div className="flex items-center gap-2">
          <span className="text-white text-xs font-bold px-2 py-1 rounded-full animate-tag-pending-glow border">
            Waiting for players
          </span>
          {getPlayerCountTag('blue')}
        </div>
      );
    }
    if (isUrgentVacancy && canJoin) {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdatePlayerStatus(meeting.id, currentUser.name, PlayerStatus.Confirmed)}
            className="text-white text-xs font-bold px-2 py-1 rounded-full animate-tag-book-now-glow border transition-transform hover:scale-105"
          >
            Buddy Cancelled - Join Urgent!
          </button>
          {getPlayerCountTag('amber')}
        </div>
      );
    }
    if (isGameOn && meeting.courtReservedBy) {
      return (
        <div className="flex items-center gap-2">
            <span className="text-white text-xs font-bold px-2 py-1 rounded-full animate-tag-game-on-glow border">
            Game Full - Court Booked - Game On!
            </span>
            {getPlayerCountTag('green')}
        </div>
      );
    }
    if (showBookNowButton) {
      return (
        <div className="flex items-center gap-2">
            <a 
            href={availabilityLinks[meeting.location]} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white text-xs font-bold px-2 py-1 rounded-full animate-tag-book-now-glow border transition-transform hover:scale-105"
            >
            Game Full! Click to Book Court
            </a>
            {getPlayerCountTag('amber')}
        </div>
      );
    }
    if (isCurrentUserConfirmed && !isGameOn) {
      return (
        <div className="flex items-center gap-2">
            <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="text-white text-xs font-bold px-2 py-1 rounded-full animate-tag-joined-glow border transition-transform hover:scale-105"
            >
            Joined! Click to invite buddies.
            </button>
            {getPlayerCountTag('amber')}
        </div>
      );
    }
    // Fallback for states not covered (like full but not bookable by current user)
    return (
      <div className="flex items-center gap-2">
        <span className="text-slate-300 text-xs font-bold px-2 py-1 rounded-full bg-slate-700/50">
            {isGameFull ? 'Game is Full' : 'Status Unavailable'}
        </span>
        {getPlayerCountTag('slate')}
      </div>
    );
  };


  const handleReserveClick = () => {
    if (!canManageCourt) return;

    if (meeting.courtReservedBy) {
        // Un-reserving
        const confirmed = window.confirm(`Are you sure you want to mark the court as NOT reserved? This will also clear the entry code.`);
        if (confirmed) {
            onSetCourtReserved(meeting.id, null);
        }
    } else {
        // Reserving without asking for code immediately
        onSetCourtReserved(meeting.id, currentUser.name);
    }
  };

  const cardBorderClass = 
      isUrgentVacancy || showBookNowButton || isJoinedButNotFull
      ? 'border-padel-amber' 
      : (isGameOn && meeting.courtReservedBy)
      ? 'border-padel-green'
      : showJoinNowButton
      ? 'border-padel-blue'
      : 'border-padel-blue/20';

  return (
    <div id={meeting.id} className={`bg-padel-blue/10 backdrop-blur-md rounded-2xl p-4 shadow-lg flex flex-col h-full border ${cardBorderClass} relative overflow-hidden`}>
        <div className="mb-3">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2 truncate">
                <LocationIcon className="w-6 h-6 text-slate-400 flex-shrink-0" />
                {meeting.location.replace('TC ', '')}
            </h3>
            <div className="flex items-center gap-4 text-slate-400 mt-1 text-base">
                <span className="flex items-center gap-1.5"><CalendarIcon className="w-4 h-4" /> {formattedDate}</span>
                <span className="flex items-center gap-1.5"><ClockIcon className="w-4 h-4" /> {meeting.time}</span>
            </div>
        </div>
      
      <div className="my-3">
        {getStatusComponent()}
      </div>

      <div className="my-3 flex justify-between items-center gap-4">
        <div className="flex flex-wrap gap-2 items-center">
          {confirmedPlayersList.length > 0 ? (
            confirmedPlayersList.map(player => (
            <PlayerChip
              key={player.name}
              player={player}
            />
          ))) : (
            isCurrentUserConfirmed ? null : <p className="text-slate-400 text-sm italic">Be the first to join!</p>
          )}
        </div>

        {isUpcomingGame && !meeting.courtReservedBy && (
          <div title={!canManageCourt ? "You must confirm your attendance to manage court reservation." : ""}>
            <label htmlFor={`reserved-${meeting.id}`} className={`flex-shrink-0 flex items-center gap-2 p-2 rounded-lg transition-colors ${canManageCourt ? 'cursor-pointer hover:bg-padel-blue/10' : 'cursor-not-allowed opacity-60'}`}>
              <input
                type="checkbox"
                id={`reserved-${meeting.id}`}
                checked={!!meeting.courtReservedBy}
                onChange={handleReserveClick}
                disabled={!canManageCourt}
                className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-padel-blue focus:ring-2 focus:ring-padel-blue focus:ring-offset-slate-800 focus:ring-2 disabled:cursor-not-allowed"
              />
              <span className={'text-slate-300 font-semibold text-sm'}>
                Court Booked!
              </span>
            </label>
          </div>
        )}
      </div>
      
      <div className="flex-grow" />

      {(canEdit || showJoinNowButton || (isGameFull && !currentUserPlayer && hasExplicitInvite)) && (
          <div className="mt-auto pt-4 border-t border-padel-blue/20">
            {canEdit && (
                <div className="flex gap-2">
                    <button
                        onClick={() => onShowDetails(meeting)}
                        className="flex-1 border border-white/50 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Game Details
                    </button>
                    <button
                        onClick={() => onUpdatePlayerStatus(meeting.id, currentUser.name, PlayerStatus.Declined)}
                        className="flex-1 border border-white/50 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-md transition-colors"
                    >
                        Leave Game
                    </button>
                </div>
            )}
            {showJoinNowButton && (
              <div className="flex gap-2">
                  <button
                      onClick={() => onShowDetails(meeting)}
                      className="flex-1 border border-white/50 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-md transition-colors"
                  >
                      Game Details
                  </button>
                  <button
                      onClick={() => onUpdatePlayerStatus(meeting.id, currentUser.name, PlayerStatus.Confirmed)}
                      className="flex-1 text-white font-bold py-2 px-4 rounded-md transition-colors animate-tag-pending-glow border"
                  >
                      Join Game
                  </button>
              </div>
            )}
            
            {isGameFull && !currentUserPlayer && hasExplicitInvite && !canEdit && !showJoinNowButton && (
              <p className="text-sm text-center text-slate-400">This Game is full.</p>
            )}
          </div>
      )}

      <InviteBuddiesModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        currentUser={currentUser}
        meeting={meeting}
        onInvite={(buddiesToInvite) => {
          onInviteBuddies(meeting.id, buddiesToInvite);
          setIsInviteModalOpen(false); // Close modal on invite
        }}
      />
    </div>
  );
};

export default MeetingCard;