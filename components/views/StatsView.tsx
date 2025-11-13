
import React, { useMemo } from 'react';
import type { Player, Rider, Vote, Point, PlayerStats } from '../../types';

interface StatsViewProps {
  playersById: Map<number, Player>;
  ridersById: Map<number, Rider>;
  votes: Vote[];
  points: Point[];
  playerStats: PlayerStats[];
}

const StatCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 text-center">
    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">{title}</h3>
    {children}
  </div>
);

export const StatsView: React.FC<StatsViewProps> = ({ playersById, ridersById, votes, points, playerStats }) => {

  const stats = useMemo(() => {
    if (votes.length === 0 && points.length === 0) {
      return { mostVotedRider: null, topScoringRider: null, playerGuru: null };
    }

    // 1. Most Voted Rider
    const voteCounts = votes.reduce((acc, vote) => {
      acc.set(vote.rider_id, (acc.get(vote.rider_id) || 0) + 1);
      return acc;
    }, new Map<number, number>());

    let mostVotedRider = null;
    if (voteCounts.size > 0) {
      const [riderId, count] = [...voteCounts.entries()].sort((a, b) => b[1] - a[1])[0];
      const rider = ridersById.get(riderId);
      if (rider) {
        mostVotedRider = { ...rider, count };
      }
    }

    // 2. Rider with Most Points Awarded
    const pointsByRider = points.reduce((acc, point) => {
      acc.set(point.rider_id, (acc.get(point.rider_id) || 0) + point.points);
      return acc;
    }, new Map<number, number>());

    let topScoringRider = null;
    if (pointsByRider.size > 0) {
      const [riderId, totalPoints] = [...pointsByRider.entries()].sort((a, b) => b[1] - a[1])[0];
      const rider = ridersById.get(riderId);
      if (rider) {
        topScoringRider = { ...rider, totalPoints };
      }
    }

    // 3. Player Guru (best points per vote average)
    const playerAverages = playerStats.map(stat => {
        const totalVotes = votes.filter(v => v.player_id === stat.playerId).length;
        const average = totalVotes > 0 ? stat.points / totalVotes : 0;
        return { playerId: stat.playerId, average, totalVotes };
    }).filter(p => p.totalVotes > 0) // Only consider players who have voted
      .sort((a, b) => b.average - a.average);
    
    let playerGuru = null;
    if (playerAverages.length > 0) {
        const guruData = playerAverages[0];
        const player = playersById.get(guruData.playerId);
        if (player) {
            playerGuru = { ...player, average: guruData.average };
        }
    }

    return { mostVotedRider, topScoringRider, playerGuru };
  }, [votes, points, playerStats, ridersById, playersById]);

  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">Estadísticas de la Porra</h2>
        <p className="text-gray-400 mt-1">Datos y curiosidades de la temporada.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="El Favorito de la Afición">
          {stats.mostVotedRider ? (
            <>
              <p className="text-2xl font-bold text-white">{stats.mostVotedRider.name}</p>
              <p className="text-red-400">{stats.mostVotedRider.count} votos recibidos</p>
            </>
          ) : <p className="text-gray-500">Sin datos de votos</p>}
        </StatCard>

        <StatCard title="El Reparte-Puntos">
          {stats.topScoringRider ? (
            <>
              <p className="text-2xl font-bold text-white">{stats.topScoringRider.name}</p>
              <p className="text-red-400">{stats.topScoringRider.totalPoints} puntos repartidos</p>
            </>
          ) : <p className="text-gray-500">Sin datos de puntos</p>}
        </StatCard>
        
        <StatCard title="El Gurú de la Porra">
          {stats.playerGuru ? (
            <>
              <p className="text-2xl font-bold text-white">{stats.playerGuru.name}</p>
              <p className="text-red-400">{stats.playerGuru.average.toFixed(2)} pts / voto</p>
            </>
          ) : <p className="text-gray-500">Se necesita más participación</p>}
        </StatCard>
      </div>
    </div>
  );
};
