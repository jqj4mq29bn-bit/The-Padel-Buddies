import React from 'react';
import { Player } from '../types';

interface PlayerChipProps {
  player: Player;
}

const PlayerChip: React.FC<PlayerChipProps> = ({ player }) => {
  // Using span for inline-block behavior and a more compact, tag-like appearance
  return (
    <span className="bg-padel-blue/20 text-padel-blue text-xs font-semibold px-2.5 py-1 rounded-full">
      {player.name}
    </span>
  );
};

export default PlayerChip;