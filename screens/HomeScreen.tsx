import React, { useEffect, useState } from 'react';
import { User, Meeting, PlayerPool, PlayerStatus } from '../types';
import MeetingCard from '../components/MeetingCard';
import { PlusIcon, ChevronDownIcon } from '../components/IconComponents';

interface HomeScreenProps {
  currentUser: User;
  meetings: Meeting[];
  myPools: PlayerPool[];
  onUpdatePlayerStatus: (meetingId: string, playerName: string, newStatus: PlayerStatus) => void;
  onSetCourtReserved: (meetingId: string, user: string | null, entryCode?: string) => void;
  onProposeGame: () => void;
  onAddBuddy: () => void;
  onEditGame: (meeting: Meeting) => void;
  onShowDetails: (meeting: Meeting) => void;
  onInviteBuddies: (meetingId: string, buddiesToInvite: string[]) => void;
  highlightedMeetingId: string | null;
}

const HomeScreen: React.FC<HomeScreenProps> = ({
  currentUser,
  meetings,
  myPools,
  onUpdatePlayerStatus,
  onSetCourtReserved,
  onProposeGame,
  onAddBuddy,
  onEditGame,
  onShowDetails,
  onInviteBuddies,
  highlightedMeetingId,
}) => {
  const [isJoinedGamesOpen, setIsJoinedGamesOpen] = useState(true);
  const [isNewGamesOpen, setIsNewGamesOpen] = useState(true);

  const myPoolIds = new Set(myPools.map(p => p.id));

  useEffect(() => {
    if (highlightedMeetingId) {
      const element = document.getElementById(highlightedMeetingId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightedMeetingId]);

  // Joined Games are any games the user has confirmed they are attending.
  const joinedGames = meetings
    .filter(m => {
      return m.players.some(p => p.name === currentUser.name && p.status === PlayerStatus.Confirmed);
    })
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
  // New Games are all other relevant games that the user has not joined yet.
  const newGames = meetings
    .filter(m => {
      // First, check if it's relevant at all
      const isParticipant = m.players.some(p => p.name === currentUser.name);
      const isInvited = m.invitedPlayers.includes(currentUser.name);
      const isProposedInPool = m.poolId && myPoolIds.has(m.poolId) && !isParticipant && !isInvited;
      const isRelevant = isParticipant || isInvited || isProposedInPool;
      
      if (!isRelevant) return false;

      // Now, check if it's already in the joined list.
      const isJoined = joinedGames.some(joinedGame => joinedGame.id === m.id);
      return !isJoined;
    })
    .sort((a, b) => {
      const aIsUrgent = !!a.courtReservedBy && a.players.filter(p => p.status === PlayerStatus.Confirmed).length < 4;
      const bIsUrgent = !!b.courtReservedBy && b.players.filter(p => p.status === PlayerStatus.Confirmed).length < 4;

      if (aIsUrgent && !bIsUrgent) {
        return -1; // a comes first
      }
      if (!aIsUrgent && bIsUrgent) {
        return 1; // b comes first
      }

      // If both are urgent or neither are, sort by date
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });


  const hasAnyGames = joinedGames.length > 0 || newGames.length > 0;

  return (
    <>
      <header className="flex flex-col mb-8 gap-4">
        <div className="text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-padel-blue tracking-tight">Padel Buddies</h1>
        </div>
        <button 
          onClick={onProposeGame} 
          className="w-full bg-white/10 hover:bg-white/20 border border-padel-glow-white text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 text-lg animate-contour-glow"
        >
          <PlusIcon className="w-6 h-6"/>
          Create Game
        </button>
        <button 
          onClick={onAddBuddy} 
          className="w-full bg-white/10 hover:bg-white/20 border border-padel-glow-white text-white font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center gap-2 text-lg animate-contour-glow"
        >
          <PlusIcon className="w-6 h-6"/>
          Add Buddy
        </button>
      </header>

      <main className="space-y-12 mt-8">
        {!hasAnyGames ? (
             <div className="text-center py-16 px-6 bg-padel-blue/10 backdrop-blur-md rounded-2xl border border-padel-blue/20">
                <h2 className="text-2xl font-semibold text-white">No Games scheduled!</h2>
                <p className="text-slate-400 mt-2">Ready to play? Create a new Game to get started.</p>
            </div>
        ) : (
            <>
                <section>
                    <button 
                        onClick={() => setIsJoinedGamesOpen(!isJoinedGamesOpen)}
                        className="w-full flex justify-between items-center text-left"
                    >
                        <h2 className="text-2xl font-bold text-white">Joined Games</h2>
                        <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isJoinedGamesOpen ? 'rotate-180' : ''}`} />
                    </button>
                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isJoinedGamesOpen ? 'max-h-[10000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        {joinedGames.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {joinedGames.map(meeting => (
                                    <MeetingCard 
                                        key={meeting.id} 
                                        meeting={meeting} 
                                        currentUser={currentUser}
                                        myPools={myPools}
                                        onUpdatePlayerStatus={onUpdatePlayerStatus}
                                        onSetCourtReserved={onSetCourtReserved}
                                        onEditGame={onEditGame}
                                        onShowDetails={onShowDetails}
                                        onInviteBuddies={onInviteBuddies}
                                        isHighlighted={meeting.id === highlightedMeetingId}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">You have no joined Games.</p>
                        )}
                    </div>
                </section>

                <section>
                    <button 
                        onClick={() => setIsNewGamesOpen(!isNewGamesOpen)}
                        className="w-full flex justify-between items-center text-left"
                    >
                        <h2 className="text-2xl font-bold text-white">New Games</h2>
                        <ChevronDownIcon className={`w-6 h-6 text-slate-400 transition-transform ${isNewGamesOpen ? 'rotate-180' : ''}`} />
                    </button>
                     <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isNewGamesOpen ? 'max-h-[10000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                        {newGames.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {newGames.map(meeting => (
                                    <MeetingCard 
                                        key={meeting.id} 
                                        meeting={meeting} 
                                        currentUser={currentUser}
                                        myPools={myPools}
                                        onUpdatePlayerStatus={onUpdatePlayerStatus}
                                        onSetCourtReserved={onSetCourtReserved}
                                        onEditGame={onEditGame}
                                        onShowDetails={onShowDetails}
                                        onInviteBuddies={onInviteBuddies}
                                        isHighlighted={meeting.id === highlightedMeetingId}
                                    />
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic">You have no new Games.</p>
                        )}
                    </div>
                </section>
            </>
        )}
      </main>
    </>
  );
};

export default HomeScreen;