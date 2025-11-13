import React, { useMemo } from 'react';
import type { Player, PlayerStats } from '../../types';
import { TrophyIcon } from '../icons/TrophyIcon';

interface StandingsViewProps {
  playerStats: PlayerStats[];
  playersById: Map<number, Player>;
  onPlayerClick: (playerId: number) => void;
}

export const StandingsView: React.FC<StandingsViewProps> = ({ playerStats, playersById, onPlayerClick }) => {
  
  const sortedStandings = useMemo(() => {
    return [...playerStats].sort((a, b) => b.points - a.points);
  }, [playerStats]);

  const leaderPoints = sortedStandings.length > 0 ? sortedStandings[0].points : 0;

  const getRankColor = (rank: number) => {
    switch(rank) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-gray-300';
      case 2: return 'text-yellow-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Clasificación General</h2>
        <p className="text-gray-400 mt-1">Puntos acumulados durante la temporada.</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
            <tr>
              <th scope="col" className="px-4 py-3 text-center">#</th>
              <th scope="col" className="px-6 py-3">Jugador</th>
              <th scope="col" className="px-6 py-3 text-right">Puntos</th>
              <th scope="col" className="px-6 py-3 text-right">Gap</th>
              <th scope="col" className="px-6 py-3 text-right">Ult. Carrera</th>
            </tr>
          </thead>
          <tbody>
            {sortedStandings.map((stats, index) => {
              const player = playersById.get(stats.playerId);
              const gap = leaderPoints - stats.points;
              return (
                <tr 
                  key={stats.playerId} 
                  className="border-b border-gray-700 hover:bg-gray-700/40 cursor-pointer"
                  onClick={() => player && onPlayerClick(player.id)}
                >
                  <td className={`px-4 py-4 font-bold text-center text-lg ${getRankColor(index)}`}>
                    {index < 3 ? <TrophyIcon className="inline-block w-6 h-6"/> : index + 1}
                  </td>
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap">
                    {player?.name || 'Unknown'}
                  </th>
                  <td className="px-6 py-4 text-right font-mono text-lg">{stats.points}</td>
                  <td className="px-6 py-4 text-right font-mono text-base">{index === 0 ? '-' : `-${gap}`}</td>
                  <td className="px-6 py-4 text-right font-mono text-base text-gray-400">
                    {stats.lastRacePoints > 0 ? `+${stats.lastRacePoints}` : stats.lastRacePoints}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};