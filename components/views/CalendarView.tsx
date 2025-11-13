
import React from 'react';
import type { Race } from '../../types';

interface CalendarViewProps {
  races: Race[];
  calendarYear: number | null;
  onPopulateCalendar: () => Promise<void>;
  isPopulating: boolean;
  populateError: string | null;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ races, calendarYear, onPopulateCalendar, isPopulating, populateError }) => {
  if (races.length === 0 && !isPopulating) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 max-w-md mx-auto animate-fade-in">
          <h2 className="text-2xl font-bold text-white mb-2">Calendario Vacío</h2>
          <p className="text-gray-400 mb-6">No se han encontrado carreras. Esto puede ocurrir si la tabla de carreras está vacía o si hubo un problema durante la carga inicial. Puedes intentar poblarla manualmente.</p>
          
          <button
            onClick={onPopulateCalendar}
            disabled={isPopulating}
            className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:bg-gray-500 disabled:cursor-wait"
          >
            {isPopulating ? 'Poblando...' : 'Poblar Calendario'}
          </button>
          
          {populateError && <p className="text-red-400 mt-4 text-sm">{populateError}</p>}
        </div>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-white">
            {calendarYear ? `Calendario de Carreras ${calendarYear}` : 'Calendario de Carreras'}
        </h2>
        <p className="text-gray-400 mt-1">La temporada completa de MotoGP.</p>
      </div>
      
      {isPopulating ? (
        <div className="text-center p-10">Descargando y guardando el calendario...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {races.map((race) => (
            <div key={race.id} className="bg-gray-800 rounded-lg p-4 shadow-md border border-gray-700 flex items-center space-x-4 transition-transform hover:scale-105">
                <span className="text-4xl">{race.flag}</span>
                <div className="flex-grow">
                <p className="font-bold text-lg text-white">{race.country}</p>
                <p className="text-sm text-gray-300">{race.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                <p className="font-semibold text-red-400">{race.dates}</p>
                <p className="text-xs text-gray-400 uppercase">{race.circuit}</p>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};
