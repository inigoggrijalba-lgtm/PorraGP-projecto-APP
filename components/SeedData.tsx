

import React, { useState } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { PLAYERS, RIDERS } from '../constants';
import { fetchMotogpCalendar } from '../utils/api';

interface SeedDataProps {
  supabaseClient: SupabaseClient;
  onSuccess: () => void;
}

export const SeedData: React.FC<SeedDataProps> = ({ supabaseClient, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  const handleSeed = async () => {
    if (!supabaseClient) {
      setError("El cliente de Supabase no está disponible.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      setStatusMessage('Poblando jugadores...');
      const { error: playersError } = await supabaseClient.from('Players').upsert(PLAYERS);
      if (playersError) throw playersError;

      setStatusMessage('Poblando pilotos...');
      const { error: ridersError } = await supabaseClient.from('Riders').upsert(RIDERS);
      if (ridersError) throw ridersError;
      
      setStatusMessage('Descargando calendario oficial de MotoGP...');
      // Fetch calendar for the latest available season from the API
      const { races: racesFromApi, year: calendarYear } = await fetchMotogpCalendar();

      if (racesFromApi.length === 0) {
        throw new Error('La API de MotoGP ha devuelto un calendario vacío. Por favor, inténtalo más tarde.');
      }

      setStatusMessage('Guardando calendario en la base de datos...');
      // The data from fetchMotogpCalendar is now mapped to the correct schema ('race_date', 'status', etc.).
      // A direct upsert should work without any fallback logic.
      const { error: racesError } = await supabaseClient.from('Races').upsert(racesFromApi);
      
      if (racesError) {
          // Include more context in the error message for easier debugging.
          if (racesError.message.includes('column')) {
                throw new Error(`Error de columna al guardar carreras: ${racesError.message}. Verifica que las columnas de la tabla 'Races' coincidan con los datos de la API.`);
          }
          throw racesError;
      }

      setSuccess(`¡Base de datos poblada con éxito con el calendario ${calendarYear}! Recargando...`);
      setTimeout(onSuccess, 2000);

    } catch (e: any) {
      console.error("Error seeding database:", e);
      setError(`Error: ${e.message}. Asegúrate de que las tablas 'Players', 'Riders', 'Races' y 'Votes' existen y tienen los nombres correctos. También puede haber un problema con la API de MotoGP.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full py-20">
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-2">¡Casi listo!</h2>
            <p className="text-gray-400 mb-6">Tu base de datos está conectada pero vacía. Haz clic para cargar los datos iniciales (jugadores, pilotos y el calendario oficial de la última temporada disponible).</p>
            
            <button
                onClick={handleSeed}
                disabled={loading || !!success}
                className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:bg-gray-500 disabled:cursor-wait"
            >
                {loading ? (statusMessage || 'Poblando base de datos...') : (success ? '¡Éxito!' : 'Poblar Datos Iniciales')}
            </button>
            
            {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
            {success && <p className="text-green-400 mt-4 text-sm">{success}</p>}
        </div>
    </div>
  );
};