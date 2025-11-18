import React, { useState, useMemo } from 'react';
import { User, Meeting, PlayerPool } from '../types';
import { XIcon, SparklesIcon } from './IconComponents';
import { getAiGameSuggestion } from '../services/geminiService';

interface SuggestMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  myPools: PlayerPool[];
  allUsers: User[];
  allMeetings: Meeting[];
  onSuggestionComplete: (suggestion: {
    date: string;
    time: string;
    invitedPlayers: string[];
    poolId: string;
  }) => void;
}

type ModalStep = 'selectPool' | 'loading' | 'showSuggestion';

const SuggestMatchModal: React.FC<SuggestMatchModalProps> = ({ isOpen, onClose, currentUser, myPools, allUsers, allMeetings, onSuggestionComplete }) => {
  const [step, setStep] = useState<ModalStep>('selectPool');
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<{ date: string; time: string; reason: string; } | null>(null);

  const selectedPool = useMemo(() => {
    if (!selectedPoolId) return null;
    return myPools.find(p => p.id === selectedPoolId);
  }, [selectedPoolId, myPools]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep('selectPool');
      setSelectedPoolId(null);
      setError(null);
      setSuggestion(null);
    }, 300);
  };

  const handleFindTime = async () => {
    if (!selectedPool) {
      setError("Please select a pool to get a suggestion for.");
      return;
    }
    setError(null);
    setStep('loading');

    const playersInPool = allUsers.filter(u => selectedPool.members.includes(u.name));

    try {
      const result = await getAiGameSuggestion(selectedPool, playersInPool, allMeetings);
      setSuggestion(result);
      setStep('showSuggestion');
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      setStep('selectPool');
    }
  };
  
  const handleCreateProposal = () => {
    if (!suggestion || !selectedPool) return;
    
    const invitedPlayers = selectedPool.members.filter(m => m !== currentUser.name);

    onSuggestionComplete({
        date: suggestion.date,
        time: suggestion.time,
        invitedPlayers: invitedPlayers,
        poolId: selectedPool.id,
    });
    handleClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'loading':
        return (
          <div className="text-center p-8">
            <SparklesIcon className="w-12 h-12 text-padel-blue mx-auto animate-pulse" />
            <p className="mt-4 text-slate-300 font-semibold">Analyzing pool history and schedules...</p>
            <p className="text-slate-400 text-sm">Our AI is finding the perfect slot for the "{selectedPool?.name}" pool!</p>
          </div>
        );

      case 'showSuggestion':
        if (!suggestion || !selectedPool) return null;
        return (
          <>
            <h3 className="text-lg font-bold text-center text-white mb-4">AI Suggestion for "{selectedPool.name}" ✨</h3>
            <div className="bg-padel-blue/5 p-4 rounded-lg space-y-3 mb-6">
                <div>
                    <p className="text-sm text-slate-400">Suggested Date & Time</p>
                    <p className="font-semibold text-white">{new Date(suggestion.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {suggestion.time}</p>
                </div>
                 <div>
                    <p className="text-sm text-slate-400">Reasoning</p>
                    <p className="font-semibold text-white text-sm italic">"{suggestion.reason}"</p>
                </div>
            </div>
             <button onClick={handleCreateProposal} className="w-full bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-3 px-4 rounded-md transition-colors">
                Propose this Time to "{selectedPool.name}"
            </button>
             <button onClick={() => setStep('selectPool')} className="w-full text-center mt-3 text-sm text-slate-400 hover:text-white">
                Back to pool selection
            </button>
          </>
        );

      case 'selectPool':
      default:
        return (
          <>
            <h3 className="text-lg font-bold text-white mb-4">Select a Player Pool</h3>
            <p className="text-slate-400 text-sm mb-4">Choose a pool, and the AI will find the best time for all members based on their shared history and availability.</p>
             <div>
                {myPools.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {myPools.map(pool => (
                      <button
                        type="button"
                        key={pool.id}
                        onClick={() => setSelectedPoolId(pool.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors border-2 ${
                          selectedPoolId === pool.id
                            ? 'bg-padel-blue/20 border-padel-blue'
                            : 'bg-padel-blue/5 border-transparent hover:border-padel-blue/20'
                        }`}
                      >
                        <p className="font-semibold text-white">{pool.name}</p>
                        <p className="text-xs text-slate-400">{pool.members.length} members</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 text-center py-4">You need to be in a player pool to use this feature.</p>
                )}
             </div>
             {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
             <button onClick={handleFindTime} className="w-full bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-3 px-4 rounded-md transition-colors mt-6 disabled:opacity-50" disabled={!selectedPoolId}>
                Find Best Time
            </button>
          </>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-padel-blue/10 backdrop-blur-lg border border-padel-blue/20 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button onClick={handleClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <XIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold text-white mb-2">Suggest a Game (AI)</h2>
        <div className="mt-4">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SuggestMatchModal;