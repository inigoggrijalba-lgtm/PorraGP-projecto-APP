

import React, { useMemo } from 'react';
import type { Player, PlayerStats, Rider } from '../../types';

interface HistoryViewProps {
  playerStats: PlayerStats[];
  playersById: Map<number, Player>;
  ridersById: Map<number, Rider>;
  selectedPlayerId: number;
  setSelectedPlayerId: (id: number) => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ playerStats, playersById, ridersById, selectedPlayerId, setSelectedPlayerId }) => {

  const players = Array.from(playersById.values());

  const chartData = useMemo(() => {
    const stats = playerStats.find(p => p.playerId === selectedPlayerId);
    if (!stats || stats.voteHistory.size === 0) {
      return [];
    }
    // FIX: The `reduce` method's accumulator type is explicitly defined using a generic.
    // This resolves the issue where TypeScript infers the initial empty array `[]` as `never[]` or `unknown`,
    // causing errors on lines 29 and 33 when trying to call `.push` or `.sort` on the result.
    return Array.from(stats.voteHistory.entries())
      .reduce<{ rider: Rider; count: number }[]>((acc, [riderId, count]) => {
        const rider = ridersById.get(riderId);
        if (rider) {
          acc.push({ rider, count });
        }
        return acc;
      }, [])
      .sort((a, b) => b.count - a.count); // Sort by vote count descending
  }, [selectedPlayerId, playerStats, ridersById]);

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Historial de Votos por Jugador</h2>
        <p className="text-gray-400 mt-1">Selecciona un jugador para ver su distribución de votos.</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
        <div>
          <label htmlFor="player-history-select" className="block mb-2 text-sm font-medium text-gray-300">Selecciona un jugador</label>
          <select
            id="player-history-select"
            onChange={(e) => setSelectedPlayerId(parseInt(e.target.value, 10))}
            value={selectedPlayerId}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full md:w-1/2 mx-auto p-2.5"
          >
            {/* FIX: Explicitly type 'player' to resolve type inference issues. */}
            {players.map((player: Player) => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </div>

        <div className="mt-6">
            {chartData.length > 0 ? (
                <div className="flex w-full h-72 space-x-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    {/* Y-Axis Labels */}
                    <div className="flex flex-col justify-between h-full text-xs text-gray-400 py-1">
                        <span>3</span>
                        <span>2</span>
                        <span>1</span>
                        <span>0</span>
                    </div>
                    {/* Bars */}
                    <div className="flex-grow flex items-end justify-around border-b border-gray-600">
                      {chartData.map(({ rider, count }) => (
                        <div key={rider.id} className="flex flex-col items-center w-1/12">
                          <div 
                            className="w-full bg-gradient-to-t from-red-600 to-red-500 rounded-t-md transition-all duration-500 ease-out flex items-center justify-center text-white font-bold"
                            style={{ height: `${(count / 3) * 100}%` }}
                            title={`${rider.name}: ${count} ${count > 1 ? 'votos' : 'voto'}`}
                           >
                            {count}
                          </div>
                          <p className="mt-2 text-xs text-center text-gray-300 truncate w-full" title={rider.name}>{rider.name.split(' ')[1] || rider.name}</p>
                        </div>
                      ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-gray-500 italic">Este jugador aún no ha realizado ningún voto.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
