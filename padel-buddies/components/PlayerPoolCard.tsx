import React from 'react';
import { PlayerPool } from '../types';
import { UsersIcon } from './IconComponents';

interface PlayerPoolCardProps {
  pool: PlayerPool;
  onShowDetails: (pool: PlayerPool) => void;
}

const PlayerPoolCard: React.FC<PlayerPoolCardProps> = ({ pool, onShowDetails }) => {
  return (
    <div className="bg-padel-blue/10 backdrop-blur-md border border-padel-blue/20 rounded-2xl p-4 shadow-lg flex justify-between items-center">
      <div>
        <div className="flex items-center gap-3 text-padel-blue font-bold text-lg">
          <UsersIcon className="w-5 h-5" />
          <h3>{pool.name}</h3>
        </div>
        <p className="text-slate-400 text-sm mt-1">{pool.members.length} members</p>
      </div>
      <button
          onClick={() => onShowDetails(pool)}
          className="border border-white/50 hover:bg-white/10 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
      >
          Pool Details
      </button>
    </div>
  );
};

export default PlayerPoolCard;