import React, { useState } from 'react';
import { User, PlayerPool } from '../types';
import PadelbuddiesCard from '../components/PadelbuddiesCard';
import PlayerPoolCard from '../components/PlayerPoolCard';
import { PlusIcon } from '../components/IconComponents';
import PlayerPoolDetailsModal from '../components/PlayerPoolDetailsModal';
import PadelbuddiesListModal from '../components/PadelbuddiesListModal';

interface BuddiesScreenProps {
  currentUser: User;
  myPools: PlayerPool[]; // Pools the current user is a member of
  onAddPlayerToPool: (poolId: string, playerName: string) => void;
  onProposePoolGame: (pool: PlayerPool) => void;
  onSetIsPoolModalOpen: (isOpen: boolean) => void;
}

const BuddiesScreen: React.FC<BuddiesScreenProps> = ({
  currentUser,
  myPools,
  onAddPlayerToPool,
  onProposePoolGame,
  onSetIsPoolModalOpen
}) => {
  const [selectedPoolForDetails, setSelectedPoolForDetails] = useState<PlayerPool | null>(null);
  const [isBuddiesListModalOpen, setIsBuddiesListModalOpen] = useState(false);

  return (
    <>
      <div className="space-y-12">
        <section>
          <h1 className="text-3xl font-bold text-white mb-4">Padel Buddies</h1>
          <PadelbuddiesCard 
            currentUser={currentUser} 
            onShowDetails={() => setIsBuddiesListModalOpen(true)}
          />
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Player Pools</h2>
              <button onClick={() => onSetIsPoolModalOpen(true)} className="flex items-center gap-2 bg-padel-blue hover:bg-padel-blue-darker text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                  <PlusIcon className="w-4 h-4"/>
                  Create New Pool
              </button>
          </div>
          <div className="space-y-4">
              {myPools.length > 0 ? myPools.map(pool => (
                  <PlayerPoolCard 
                      key={pool.id}
                      pool={pool}
                      onShowDetails={setSelectedPoolForDetails}
                  />
              )) : (
                  <div className="text-center py-10 px-6 bg-padel-blue/10 backdrop-blur-md rounded-2xl border border-dashed border-padel-blue/20">
                        <h3 className="text-xl font-semibold text-white">No pools yet!</h3>
                      <p className="text-slate-400 mt-1">Create a pool to organize Games with your friends.</p>
                  </div>
              )}
          </div>
        </section>
      </div>
      
      {selectedPoolForDetails && (
        <PlayerPoolDetailsModal
            isOpen={!!selectedPoolForDetails}
            onClose={() => setSelectedPoolForDetails(null)}
            pool={selectedPoolForDetails}
            currentUser={currentUser}
            onAddPlayer={onAddPlayerToPool}
            onProposeGame={onProposePoolGame}
        />
      )}

      <PadelbuddiesListModal
        isOpen={isBuddiesListModalOpen}
        onClose={() => setIsBuddiesListModalOpen(false)}
        currentUser={currentUser}
      />
    </>
  );
};

export default BuddiesScreen;