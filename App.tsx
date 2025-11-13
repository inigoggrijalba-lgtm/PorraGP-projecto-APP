

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { NavBar } from './components/NavBar';
import { HomeView } from './components/views/HomeView';
import { VoteView } from './components/views/VoteView';
import { StandingsView } from './components/views/StandingsView';
import { CalendarView } from './components/views/CalendarView';
import { HistoryView } from './components/views/HistoryView';
import { ResultsView } from './components/views/ResultsView';
import { NewsView } from './components/views/NewsView';
import { LiveTimingView } from './components/views/LiveTimingView';
import { StatsView } from './components/views/StatsView';
import { MotoGPStandingsView } from './components/views/MotoGPStandingsView';
import { SeedData } from './components/SeedData';
import { initializeSupabaseClient } from './utils/supabase';
import { fetchMotogpCalendar } from './utils/api';
import type { Tab, PlayerStats, Race, Player, Rider, Vote, Point } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [supabaseClient, setSupabaseClient] = useState<SupabaseClient | null>(null);
  
  const [players, setPlayers] = useState<Player[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [calendarYear, setCalendarYear] = useState<number | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsSeeding, setNeedsSeeding] = useState(false);

  // State for manual calendar population
  const [isPopulating, setIsPopulating] = useState(false);
  const [populateError, setPopulateError] = useState<string | null>(null);

  const [historySelectedPlayerId, setHistorySelectedPlayerId] = useState<number>(0);
  const [nextRace, setNextRace] = useState<Race | undefined>();

  const [isVotingOpen, setIsVotingOpen] = useState(true);
  
  const loadData = useCallback(async () => {
    if (!supabaseClient) return;
    
    setLoading(true);
    setError(null);
    setNeedsSeeding(false);
    
    try {
      // --- Carga de Datos Esenciales ---
      const tables = ['Players', 'Riders', 'Races', 'Votes', 'Points'];
      const results = await Promise.all(
          tables.map(table => supabaseClient.from(table).select('*'))
      );
      
      const [
        { data: playersData, error: playersError },
        { data: ridersData, error: ridersError },
        { data: racesData, error: racesError },
        { data: votesData, error: votesError },
        { data: pointsData, error: pointsError },
      ] = results;

      if (playersError) throw playersError;
      if (ridersError) throw ridersError;
      if (racesError) console.warn(`Advertencia al cargar Carreras: ${racesError.message}. La tabla puede no existir.`);
      if (votesError) console.warn(`Advertencia al cargar Votos: ${votesError.message}. La tabla puede no existir.`);
      if (pointsError) console.warn(`Advertencia al cargar Puntos: ${pointsError.message}. La tabla puede no existir.`);
      
      if (!playersData || playersData.length === 0) {
        setNeedsSeeding(true);
        setLoading(false);
        return;
      }
      
      setPlayers(playersData.sort((a,b) => a.id - b.id));
      setRiders(ridersData.sort((a,b) => a.id - b.id));
      setHistorySelectedPlayerId(playersData[0]?.id || 0);
      
      const sortedRaces = (racesData || []).sort((a, b) => new Date(a.race_date).getTime() - new Date(b.race_date).getTime());
      setRaces(sortedRaces);
      setVotes(votesData || []);
      setPoints(pointsData || []);

      if (sortedRaces.length > 0) {
        setCalendarYear(new Date(sortedRaces[0].race_date).getFullYear());
      } else {
        setCalendarYear(null);
      }

      setNeedsSeeding(false);

    } catch (e: any) {
      if (e.message.includes('relation') && e.message.includes('does not exist')) {
        setNeedsSeeding(true); 
      } else {
        setError(`Error crítico al conectar con la base de datos: ${e.message}.`);
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  }, [supabaseClient]);

  useEffect(() => {
    const { client, error: clientError } = initializeSupabaseClient();
    if (client) {
      setSupabaseClient(client);
    } else {
      setError(clientError);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supabaseClient) {
      loadData();
    }
  }, [supabaseClient, loadData]);

  const playersById = useMemo(() => new Map<number, Player>(players.map(p => [p.id, p])), [players]);
  const ridersById = useMemo(() => new Map<number, Rider>(riders.map(r => [r.id, r])), [riders]);

  useEffect(() => {
    if (races.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const upcomingRace = races.find(race => {
        return new Date(race.race_date) >= today;
      });
      const currentNextRace = upcomingRace || races[races.length - 1];
      setNextRace(currentNextRace);

      if (currentNextRace) {
        const raceDate = new Date(currentNextRace.race_date);
        const votingDeadline = new Date(raceDate);
        // Find the Saturday of the race week
        const dayOfWeek = raceDate.getUTCDay(); // Sunday = 0, Saturday = 6
        const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
        votingDeadline.setUTCDate(raceDate.getUTCDate() + daysUntilSaturday - 1); // Go to Saturday of the GP
        votingDeadline.setUTCHours(14, 0, 0, 0); // 14:00 UTC on Saturday

        setIsVotingOpen(new Date() < votingDeadline);
      } else {
        setIsVotingOpen(false);
      }

    } else {
      setNextRace(undefined);
      setIsVotingOpen(false);
    }
  }, [races]);

  const { playerStats, bets, lockedVotes } = useMemo(() => {
    const stats: PlayerStats[] = players.map(player => ({
        playerId: player.id,
        points: 0,
        lastRacePoints: 0,
        voteHistory: new Map<number, number>(),
    }));

    const statsById = new Map<number, PlayerStats>(stats.map(s => [s.playerId, s]));
    
    const lastScoredRaceId = points.length > 0
        ? Math.max(...points.map(p => p.race_id))
        : null;

    for (const point of points) {
        const playerStat = statsById.get(point.player_id);
        if (playerStat) {
            playerStat.points += point.points;
            if (lastScoredRaceId && point.race_id === lastScoredRaceId) {
                playerStat.lastRacePoints += point.points;
            }
        }
    }

    const currentBets = new Map<number, number>();
    const currentLockedVotes = new Map<number, boolean>();
    for (const vote of votes) {
        const playerStat = statsById.get(vote.player_id);
        if(playerStat) {
            const count = playerStat.voteHistory.get(vote.rider_id) || 0;
            playerStat.voteHistory.set(vote.rider_id, count + 1);
        }

        if(nextRace && vote.race_id === nextRace.id) {
            currentBets.set(vote.player_id, vote.rider_id);
            currentLockedVotes.set(vote.player_id, vote.is_locked);
        }
    }
    
    return { playerStats: stats, bets: currentBets, lockedVotes: currentLockedVotes };
  }, [players, votes, points, nextRace]);
  
  const playerStatsById = useMemo(() => new Map<number, PlayerStats>(playerStats.map(ps => [ps.playerId, ps])), [playerStats]);

  const handleVote = async (playerId: number, riderId: number): Promise<{ success: boolean; message: string }> => {
    if (!supabaseClient) return { success: false, message: "El cliente de Supabase no está disponible." };
    if (!nextRace) return { success: false, message: "No se ha podido determinar la próxima carrera." };
    if (!isVotingOpen) return { success: false, message: "El plazo para votar ha finalizado." };

    const stats = playerStatsById.get(playerId);
    if (!stats) return { success: false, message: "Jugador no encontrado." };

    const voteHistoryCount = stats.voteHistory.get(riderId) || 0;
    const isCurrentVoteForThisRider = bets.get(playerId) === riderId;

    if (voteHistoryCount >= 3 && !isCurrentVoteForThisRider) {
      return { success: false, message: `Ya has votado por ${ridersById.get(riderId)?.name} 3 veces.` };
    }

    try {
      const { data: existingVoteData, error: selectError } = await supabaseClient
        .from('Votes')
        .select('*')
        .eq('player_id', playerId)
        .eq('race_id', nextRace.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (existingVoteData) {
        if (existingVoteData.is_locked) {
          return { success: false, message: "Ya has cambiado tu voto para esta carrera. No se permiten más cambios." };
        }
        
        if (existingVoteData.rider_id === riderId) {
            return { success: true, message: "Has reconfirmado tu voto." };
        }

        const { error: updateError } = await supabaseClient
          .from('Votes')
          .update({ rider_id: riderId, is_locked: true })
          .eq('player_id', playerId)
          .eq('race_id', nextRace.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabaseClient
          .from('Votes')
          .insert({ player_id: playerId, race_id: nextRace.id, rider_id: riderId, is_locked: false });
        
        if (insertError) throw insertError;
      }
      
      const { data: votesData, error: votesError } = await supabaseClient.from('Votes').select('*');
      if (votesError) throw votesError;
      setVotes(votesData || []);

      return { success: true, message: "¡Voto registrado con éxito!" };
    } catch (e: any) {
        console.error("Error saving vote:", e);
        return { success: false, message: `Error al guardar el voto: ${e.message}`};
    }
  };

  const handleSelectPlayerHistory = (playerId: number) => {
    setHistorySelectedPlayerId(playerId);
    setActiveTab('history');
  };

  const handlePopulateCalendar = useCallback(async () => {
    if (!supabaseClient) return;

    setIsPopulating(true);
    setPopulateError(null);

    try {
        const { races: racesFromApi } = await fetchMotogpCalendar();
        
        if (racesFromApi.length === 0) {
            throw new Error('La API de MotoGP ha devuelto un calendario vacío. Por favor, inténtalo más tarde.');
        }
        
        const { error: upsertError } = await supabaseClient.from('Races').upsert(racesFromApi);
        
        if (upsertError) {
            if (upsertError.message.includes('column')) {
                 throw new Error(`Error de columna al guardar carreras: ${upsertError.message}. Verifica que la columna 'api_event_id' existe en la tabla 'Races'.`);
            }
            throw upsertError;
        }

        await loadData();

    } catch (e: any) {
        console.error("Error al poblar el calendario:", e);
        setPopulateError(`Error al poblar el calendario: ${e.message}`);
    } finally {
        setIsPopulating(false);
    }
  }, [supabaseClient, loadData]);

  const renderContent = () => {
    switch (activeTab) {
      case 'results': return <ResultsView />;
      case 'livetiming': return <LiveTimingView />;
      case 'news': return <NewsView />;
      case 'motogpStandings': return <MotoGPStandingsView />;
    }
    
    if (loading) return <div className="text-center p-10">Conectando y cargando datos...</div>;
    if (error) return <div className="bg-red-900/50 text-red-300 p-4 m-4 rounded-lg text-center whitespace-pre-wrap">{error}</div>;
    if (needsSeeding) return <SeedData supabaseClient={supabaseClient!} onSuccess={loadData} />;

    switch (activeTab) {
      case 'calendar': return (
        <CalendarView
          races={races}
          calendarYear={calendarYear}
          onPopulateCalendar={handlePopulateCalendar}
          isPopulating={isPopulating}
          populateError={populateError}
        />
      );
      case 'vote': return <VoteView players={players} riders={riders} playerStatsById={playerStatsById} handleVote={handleVote} currentBets={bets} lockedVotes={lockedVotes} isVotingOpen={isVotingOpen} nextRace={nextRace} />;
      case 'standings': return <StandingsView playerStats={playerStats} playersById={playersById} onPlayerClick={handleSelectPlayerHistory} />;
      case 'stats': return <StatsView playersById={playersById} ridersById={ridersById} votes={votes} points={points} playerStats={playerStats} />;
      case 'history': return <HistoryView playerStats={playerStats} playersById={playersById} ridersById={ridersById} selectedPlayerId={historySelectedPlayerId} setSelectedPlayerId={setHistorySelectedPlayerId} />;
      case 'home': default: return <HomeView bets={bets} playersById={playersById} ridersById={ridersById} nextRace={nextRace} onPlayerClick={handleSelectPlayerHistory} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col">
      <div className="sticky top-0 z-10">
        <Header />
        <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8 md:py-12">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;