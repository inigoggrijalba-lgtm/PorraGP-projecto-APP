import React from 'react';
import type { Player, Rider, Race } from '../../types';

interface HomeViewProps {
  bets: Map<number, number>;
  playersById: Map<number, Player>;
  ridersById: Map<number, Rider>;
  nextRace?: Race;
  onPlayerClick: (playerId: number) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ bets, playersById, ridersById, nextRace, onPlayerClick }) => {
  const players = Array.from(playersById.values());

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Votos para la Próxima Carrera</h2>
        {nextRace ? (
          <p className="text-gray-400 mt-1">{nextRace.country} GP - {nextRace.circuit}</p>
        ) : (
          <p className="text-gray-400 mt-1">Calendario no disponible</p>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Fix: Explicitly type 'player' as 'Player' to resolve type inference issues. */}
        {players.map((player: Player) => {
          const riderId = bets.get(player.id);
          const rider = riderId ? ridersById.get(riderId) : null;
          return (
            <div 
              key={player.id} 
              className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700 flex items-center justify-between transition-transform hover:scale-105 cursor-pointer"
              onClick={() => onPlayerClick(player.id)}
            >
              <span className="font-bold text-lg">{player.name}</span>
              {rider ? (
                 <div className="text-right">
                    <p className="font-semibold text-red-400">{rider.name}</p>
                    <p className="text-xs text-gray-400">{rider.team}</p>
                 </div>
              ) : (
                <span className="text-gray-500 italic">No ha votado</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};