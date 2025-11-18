import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Meeting, PlayerStatus, PlayerPool, User } from '../types';
import { XIcon, ExternalLinkIcon, SparklesIcon } from './IconComponents';
import { getAiGameSuggestion } from '../services/geminiService';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onUpdateMeeting: (meeting: Meeting) => void;
  currentUser: User;
  poolForMeeting?: PlayerPool | null; // From "propose pool match"
  gameToEdit?: Meeting | null;
  myPools: PlayerPool[]; // All pools for general AI suggestion
  allUsers: User[];
  allMeetings: Meeting[];
}

const openingHours: { [key: string]: { [key: number]: { open: string, close: string } | null } } = {
  'TC De Mol': {
    0: { open: '07:30', close: '24:00' }, 1: { open: '07:30', close: '24:00' }, 2: { open: '07:30', close: '24:00' }, 3: { open: '07:30', close: '24:00' }, 4: { open: '07:30', close: '24:00' }, 5: { open: '07:30', close: '24:00' }, 6: { open: '07:30', close: '24:00' },
  },
  'TC Iris': {
    0: { open: '08:00', close: '24:00' }, 1: { open: '08:00', close: '24:00' }, 2: { open: '08:00', close: '24:00' }, 3: { open: '08:00', close: '24:00' }, 4: { open: '08:00', close: '24:00' }, 5: { open: '08:00', close: '24:00' }, 6: { open: '08:00', close: '24:00' },
  },
};

const availabilityLinks: { [key: string]: string } = {
    'TC De Mol': 'https://www.tennisenpadelvlaanderen.be/nl/clubdashboard/reserveer-een-terrein?clubId=1933',
    'TC Iris': 'https://www.tennisenpadelvlaanderen.be/nl/clubdashboard/reserveer-een-terrein?clubId=1856'
};

const findNextOpening = (location: string): { date: string; time: string } => {
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const checkDate = new Date();
    checkDate.setDate(now.getDate() + i);
    const dayOfWeek = checkDate.getDay();
    const locationHours = openingHours[location]?.[dayOfWeek];

    if (locationHours) {
      const openingTime = locationHours.open;
      const isToday = i === 0;

      if (isToday) {
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        if (currentTime < openingTime) {
          return { date: checkDate.toISOString().split('T')[0], time: openingTime };
        }
      } else {
        return { date: checkDate.toISOString().split('T')[0], time: openingTime };
      }
    }
  }
  return { date: '', time: '' };
};


const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({ isOpen, onClose, onAddMeeting, onUpdateMeeting, currentUser, poolForMeeting, gameToEdit, myPools, allUsers, allMeetings }) => {
  const [location, setLocation] = useState('TC De Mol');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedPoolId, setSelectedPoolId] = useState('');
  const [invitedPlayers, setInvitedPlayers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCourtReserved, setIsCourtReserved] = useState(false);
  const [entryCode, setEntryCode] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const isEditMode = !!gameToEdit;

  // AI State
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<{reason: string} | null>(null);
  
  const resetForm = useCallback(() => {
    setLocation('TC De Mol');
    setDate('');
    setTime('');
    setSelectedPoolId('');
    setInvitedPlayers([]);
    setSearchTerm('');
    setFormError(null);
    setIsAiLoading(false);
    setAiError(null);
    setAiSuggestion(null);
    setIsCourtReserved(false);
    setEntryCode('');
  }, []);

  // Effect for initializing the form when it opens or mode changes
  useEffect(() => {
    if (isOpen) {
      if (gameToEdit) {
        // Edit mode: set initial values from the game being edited
        setLocation(gameToEdit.location);
        setDate(gameToEdit.date);
        setTime(gameToEdit.time);
        setSelectedPoolId(''); // Default to "No specific pool" as requested for edit mode.
        const existingRespondedPlayers = gameToEdit.players.filter(p => p.name !== currentUser.name).map(p => p.name);
        setInvitedPlayers([...new Set([...gameToEdit.invitedPlayers, ...existingRespondedPlayers])]);
        setIsCourtReserved(!!gameToEdit.courtReservedBy);
        setEntryCode(gameToEdit.entryCode || '');
      } else {
        // Create mode (for both general and for a specific pool)
        // Set an initial location. The effect below will handle date/time.
        setLocation('TC De Mol'); 
        if (poolForMeeting) {
          setSelectedPoolId(poolForMeeting.id);
          setInvitedPlayers(poolForMeeting.members.filter(m => m !== currentUser.name));
        } else {
          // Reset pool and players for a generic new game
          setSelectedPoolId('');
          setInvitedPlayers([]);
        }
      }
    } else if (!isOpen) {
        // When modal closes, reset everything after animation
        setTimeout(resetForm, 300);
    }
  }, [isOpen, poolForMeeting, gameToEdit, resetForm, currentUser.name]);

  // Effect for updating date/time in CREATE MODE when location changes
  useEffect(() => {
    // This ensures that when creating a new game, changing the location
    // updates the suggested date/time, but it does NOT run in edit mode, which fixes the bug.
    if (isOpen && !gameToEdit) {
      const nextOpening = findNextOpening(location);
      setDate(nextOpening.date);
      setTime(nextOpening.time);
    }
  }, [location, isOpen, gameToEdit]);

  const timeValidation = useMemo(() => {
    if (!date || !location) return { isValid: true, message: null };
    const locationHoursData = openingHours[location];
    if (!locationHoursData) return { isValid: true, message: null };
    const selectedDate = new Date(date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    const hours = locationHoursData[dayOfWeek];
    if (!hours) return { isValid: false, message: `${location} is closed on this day.` };
    const closeTimeDisplay = hours.close === '24:00' ? '00:00' : hours.close;
    const hint = `(Open ${hours.open} - ${closeTimeDisplay})`;
    if (time) {
        if (time < hours.open || time >= hours.close) {
             return { isValid: false, message: `Time must be between ${hours.open} and ${closeTimeDisplay}.` };
        }
    }
    return { isValid: true, message: hint };
  }, [date, time, location]);

  const availableToInvite = useMemo(() => {
    if (selectedPoolId) {
        const pool = myPools.find(p => p.id === selectedPoolId);
        return pool ? pool.members.filter(m => m !== currentUser.name) : [];
    }
    return currentUser.buddies;
  }, [selectedPoolId, myPools, currentUser]);
  
  useEffect(() => {
    if (!isEditMode && !poolForMeeting) {
      setInvitedPlayers([]);
      setSearchTerm('');
    }
  }, [selectedPoolId, isEditMode, poolForMeeting]);


  const filteredPlayersToInvite = useMemo(() => {
    if (!searchTerm) return availableToInvite;
    return availableToInvite.filter(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm, availableToInvite]);

  const handleTogglePlayer = (name: string) => {
    setInvitedPlayers(prev => prev.includes(name) ? prev.filter(p => p !== name) : [...prev, name]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!location || !date || !time) {
      setFormError("Please fill in location, date, and time.");
      return;
    }
    if (!timeValidation.isValid) return;
    
    if (isEditMode && gameToEdit) {
        const newPlayersList = gameToEdit.players.filter(p => invitedPlayers.includes(p.name) || p.name === currentUser.name);
        invitedPlayers.forEach(name => {
            if (!newPlayersList.some(p => p.name === name)) {
                newPlayersList.push({ name: name, status: PlayerStatus.Pending });
            }
        });

        const newInvitedPlayersList = invitedPlayers.filter(name => !gameToEdit.players.some(p => p.name === name));
        
        const updatedMeeting: Meeting = {
            ...gameToEdit,
            date, time, location,
            poolId: selectedPoolId || undefined,
            invitedPlayers: newInvitedPlayersList,
            players: newPlayersList,
            courtReservedBy: isCourtReserved ? (gameToEdit.courtReservedBy || currentUser.name) : undefined,
            entryCode: isCourtReserved && (location === 'TC De Mol' || location === 'TC Iris') ? entryCode : undefined,
        };
        onUpdateMeeting(updatedMeeting);
    } else {
        // FIX: Add missing 'all_involved_users' property.
        const allInvolved = [...new Set([currentUser.name, ...invitedPlayers])];
        onAddMeeting({
            date, time, location,
            creator: currentUser.name,
            players: [{ name: currentUser.name, status: PlayerStatus.Confirmed }],
            invitedPlayers,
            poolId: selectedPoolId || undefined,
            all_involved_users: allInvolved
        });
    }

    onClose();
  };
  
  const areAllInvited = availableToInvite.length > 0 && availableToInvite.every(p => invitedPlayers.includes(p));

  const handleToggleAllPlayers = () => {
    if (areAllInvited) {
      setInvitedPlayers(prev => prev.filter(p => !availableToInvite.includes(p)));
    } else {
      setInvitedPlayers(prev => [...new Set([...prev, ...availableToInvite])]);
    }
  };
  
  const handleAiSuggest = async () => {
    const poolToSuggest = myPools.find(p => p.id === selectedPoolId);
    if (!poolToSuggest) {
        setAiError("Please select a pool for the AI to analyze.");
        return;
    }
    setAiError(null);
    setIsAiLoading(true);
    setAiSuggestion(null);

    const playersInPool = allUsers.filter(u => poolToSuggest.members.includes(u.name));
    try {
        const result = await getAiGameSuggestion(poolToSuggest, playersInPool, allMeetings);
        setDate(result.date);
        setTime(result.time);
        setAiSuggestion({ reason: result.reason });
        setInvitedPlayers(poolToSuggest.members.filter(m => m !== currentUser.name));
    } catch (err) {
        setAiError(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
        setIsAiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white"><XIcon className="w-6 h-6" /></button>
        <h2 className="text-2xl font-bold text-white mb-4">{isEditMode ? 'Edit Game Details' : 'Propose a New Game'}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-300">Location</label>
                {availabilityLinks[location] && (
                  <a
                    href={availabilityLinks[location]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs border border-white/50 hover:bg-white/10 text-white font-semibold py-1 px-3 rounded-md transition-colors"
                  >
                    Check Availability <ExternalLinkIcon className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                  <button
                      type="button"
                      onClick={() => setLocation('TC De Mol')}
                      className={`w-full p-2 rounded-md text-center font-semibold transition-colors ${
                          location === 'TC De Mol' 
                          ? 'bg-padel-blue text-white ring-2 ring-padel-blue' 
                          : 'bg-padel-blue/10 hover:bg-padel-blue/20 border border-padel-blue/20 text-slate-300'
                      }`}
                  >
                      TC De Mol
                  </button>
                  <button
                      type="button"
                      onClick={() => setLocation('TC Iris')}
                      className={`w-full p-2 rounded-md text-center font-semibold transition-colors ${
                          location === 'TC Iris' 
                          ? 'bg-padel-blue text-white ring-2 ring-padel-blue' 
                          : 'bg-padel-blue/10 hover:bg-padel-blue/20 border border-padel-blue/20 text-slate-300'
                      }`}
                  >
                      TC Iris
                  </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue" required />
                </div>
                <div>
                    <label htmlFor="time" className="block text-sm font-medium text-slate-300 mb-1">Time</label>
                    <input type="time" id="time" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue" required />
                    {timeValidation.message && <p className={`text-sm mt-1 ${!timeValidation.isValid ? 'text-red-400' : 'text-slate-400'}`}>{timeValidation.message}</p>}
                </div>
            </div>
          
            <div>
                <label htmlFor="select-pool" className="block text-sm font-medium text-slate-300 mb-1">Select Pool (Optional)</label>
                <select id="select-pool" value={selectedPoolId} onChange={e => setSelectedPoolId(e.target.value)} disabled={!!poolForMeeting} className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue disabled:opacity-50">
                    <option value="">No specific pool</option>
                    {myPools.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>

            <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-slate-300">Invite Players</label>
                  {availableToInvite.length > 0 && 
                    <button type="button" onClick={handleToggleAllPlayers} className="border border-white/50 hover:bg-white/10 text-white font-semibold py-1 px-3 rounded-md transition-colors text-xs">
                      {areAllInvited ? 'Deselect All' : 'Invite All'}
                    </button>
                  }
                </div>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={selectedPoolId ? "Search pool members..." : "Search your buddies..."} className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue mb-2" />
                {availableToInvite.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-2 bg-padel-blue/5 rounded-md max-h-40 overflow-y-auto">
                        {filteredPlayersToInvite.map(player => <button type="button" key={player} onClick={() => handleTogglePlayer(player)} className={`px-3 py-1 text-sm rounded-full transition-colors ${invitedPlayers.includes(player) ? 'bg-padel-blue text-white font-semibold' : 'bg-slate-600 hover:bg-slate-500 text-slate-200'}`}>{player}</button>)}
                        {filteredPlayersToInvite.length === 0 && <p className="text-sm text-slate-400 w-full text-center">No players found.</p>}
                    </div>
                ) : <p className="text-sm text-slate-400 px-2 py-1">{selectedPoolId ? "There are no other members in this pool to invite." : "Add some buddies to invite them to a Game!"}</p>}
            </div>
            
            {isEditMode && (
              <div className="pt-2">
                <label htmlFor={`reserved-edit`} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-padel-blue/10 transition-colors">
                  <input type="checkbox" id={`reserved-edit`} checked={isCourtReserved} onChange={(e) => setIsCourtReserved(e.target.checked)} className="w-5 h-5 rounded bg-slate-600 border-slate-500 text-padel-blue focus:ring-padel-blue focus:ring-offset-slate-800 focus:ring-2"/>
                  <span className={`${isCourtReserved ? 'text-padel-glow-white' : 'text-slate-300'} font-semibold`}>Court Booked!</span>
                </label>
                {isCourtReserved && (location === 'TC De Mol' || location === 'TC Iris') && (
                  <div className="mt-2 pl-10">
                    <label htmlFor="entryCode" className="block text-sm font-medium text-slate-300 mb-1">Entry Code</label>
                    <input type="text" id="entryCode" value={entryCode} onChange={(e) => setEntryCode(e.target.value)} placeholder="Enter court code" className="w-full bg-padel-blue/5 border-padel-blue/30 rounded-md p-2 text-white focus:ring-2 focus:ring-padel-blue focus:border-padel-blue" />
                  </div>
                )}
              </div>
            )}
            
            {!isEditMode && <hr className="border-padel-blue/20" />}
            
            {!isEditMode && (
              <div className="p-4 bg-padel-blue/10 rounded-lg space-y-3">
                  <div className="flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-padel-blue flex-shrink-0" /><h3 className="font-semibold text-white">AI Assistant</h3></div>
                  <button type="button" onClick={handleAiSuggest} disabled={isAiLoading || !selectedPoolId} className="w-full border border-white/50 hover:bg-white/10 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                      {isAiLoading ? "Analyzing..." : "Suggest Time with AI"}
                  </button>
                  {!selectedPoolId && <p className="text-xs text-slate-400 text-center -mt-2">Select a pool to enable AI suggestions.</p>}
                  {aiError && <p className="text-red-400 text-sm">{aiError}</p>}
                  {aiSuggestion && !isAiLoading && (
                      <div className="p-3 bg-padel-blue/10 border border-padel-blue rounded-md text-sm">
                          <p className="font-semibold text-padel-blue mb-1">AI Reasoning:</p>
                          <p className="text-slate-300 whitespace-pre-wrap">{aiSuggestion.reason}</p>
                      </div>
                  )}
              </div>
            )}
          
            {formError && <p className="text-red-400 text-sm">{formError}</p>}

            <button type="submit" disabled={!date || !time || !timeValidation.isValid} className="w-full bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-3 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6">
              {isEditMode ? 'Update Game' : 'Create Game Proposal'}
            </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMeetingModal;