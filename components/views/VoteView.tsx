
import React, { useState, useMemo } from 'react';
import type { Player, Rider, PlayerStats, Race } from '../../types';

interface VoteViewProps {
  players: Player[];
  riders: Rider[];
  playerStatsById: Map<number, PlayerStats>;
  handleVote: (playerId: number, riderId: number) => Promise<{ success: boolean; message: string }>;
  currentBets: Map<number, number>;
  lockedVotes: Map<number, boolean>;
  isVotingOpen: boolean;
  nextRace?: Race;
}

export const VoteView: React.FC<VoteViewProps> = ({ players, riders, playerStatsById, handleVote, currentBets, lockedVotes, isVotingOpen, nextRace }) => {
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const selectedPlayerStats = useMemo(() => {
    return selectedPlayerId ? playerStatsById.get(selectedPlayerId) : null;
  }, [selectedPlayerId, playerStatsById]);

  const isVoteLocked = useMemo(() => {
    if (!selectedPlayerId) return false;
    return lockedVotes.get(selectedPlayerId) || false;
  }, [selectedPlayerId, lockedVotes]);
  
  const handleSubmit = async () => {
    if (!selectedPlayerId || !selectedRiderId) {
      setMessage({ type: 'error', text: 'Por favor, selecciona un jugador y un piloto.' });
      return;
    }
    setIsLoading(true);
    const result = await handleVote(selectedPlayerId, selectedRiderId);
    setMessage({ type: result.success ? 'success' : 'error', text: result.message });
    setIsLoading(false);
  };
  
  const handlePlayerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const playerId = parseInt(e.target.value, 10);
      setSelectedPlayerId(playerId);
      setSelectedRiderId(currentBets.get(playerId) || null);
      setMessage(null);
  }
  
  const renderVoteContent = () => {
    if (!isVotingOpen) {
      return (
        <div className="text-center p-8 rounded-lg bg-gray-800/50 text-gray-300 border border-gray-700">
          <h3 className="text-2xl font-bold">Votación Cerrada</h3>
          <p className="mt-2">El plazo para votar en el {nextRace?.name || 'próximo GP'} ha finalizado. ¡Mucha suerte!</p>
        </div>
      );
    }
    
    if (selectedPlayerId && isVoteLocked) {
      return (
        <div className="text-center p-8 rounded-lg bg-blue-900/50 text-blue-300">
            <h3 className="text-2xl font-bold">Tu voto para esta carrera está confirmado.</h3>
            <p className="mt-2">Ya has utilizado tu único cambio permitido. ¡Mucha suerte!</p>
        </div>
      );
    }
    
    if (message) {
      return (
          <div className={`text-center p-8 rounded-lg ${message.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              <h3 className="text-2xl font-bold">{message.text}</h3>
          </div>
      );
    }

    return (
      <>
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">2. Elige un piloto</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {riders.map((rider) => {
              const voteCount = selectedPlayerStats?.voteHistory.get(rider.id) || 0;
              const isVoted = voteCount >= 3;
              const isSelected = selectedRiderId === rider.id;
              
              return (
                <button
                  key={rider.id}
                  disabled={isVoted}
                  onClick={() => setSelectedRiderId(rider.id)}
                  className={`rounded-lg text-center transition-all duration-200 border-2 overflow-hidden ${
                    isSelected ? 'border-red-500 bg-red-900/50 scale-105' : 'border-gray-700 bg-gray-900 hover:border-red-500'
                  } ${isVoted ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <img src={rider.imageUrl} alt={rider.name} className="w-full h-28 object-cover rounded-md" />
                  <div className="p-2">
                    <p className="mt-1 font-semibold text-sm text-white truncate">{rider.name}</p>
                    <p className="text-xs text-gray-400">#{rider.number}</p>
                    <div className="mt-2 flex justify-center space-x-1.5">
                      {[...Array(3)].map((_, i) => (
                        <span key={i} className={`block w-2.5 h-2.5 rounded-full ${i < voteCount ? 'bg-red-600' : 'bg-green-500'}`}></span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {selectedRiderId && (
          <div className="mt-6 flex flex-col items-center">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:bg-gray-500 disabled:cursor-wait"
            >
              {isLoading ? 'Confirmando...' : 'Confirmar Voto'}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Realiza tu Voto</h2>
        <p className="text-gray-400 mt-1">
          {isVotingOpen 
            ? `Votación abierta para el ${nextRace?.name || 'próximo GP'}.`
            : 'La votación está actualmente cerrada.'
          }
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
        <div>
          <label htmlFor="player-select" className="block mb-2 text-sm font-medium text-gray-300">1. Selecciona tu nombre</label>
          <select
            id="player-select"
            onChange={handlePlayerChange}
            value={selectedPlayerId || ''}
            disabled={!isVotingOpen}
            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="" disabled>Elige un jugador</option>
            {players.map((player) => (
              <option key={player.id} value={player.id}>{player.name}</option>
            ))}
          </select>
        </div>

        {selectedPlayerId && (
          <div className="animate-fade-in">
            {renderVoteContent()}
          </div>
        )}
      </div>
    </div>
  );
};
