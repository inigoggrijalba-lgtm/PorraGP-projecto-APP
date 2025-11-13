

import React from 'react';
import type { Tab } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { VoteIcon } from './icons/VoteIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { HistoryIcon } from './icons/HistoryIcon';
import { FlagIcon } from './icons/FlagIcon';
import { NewsIcon } from './icons/NewsIcon';
import { LiveTimingIcon } from './icons/LiveTimingIcon';
import { StatsIcon } from './icons/StatsIcon';
import { MotoGPStandingsIcon } from './icons/MotoGPStandingsIcon';

interface NavBarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Próxima Carrera', icon: <HomeIcon /> },
    { id: 'vote', label: 'Votar', icon: <VoteIcon /> },
    { id: 'calendar', label: 'Calendario', icon: <CalendarIcon /> },
    { id: 'standings', label: 'Clasificación Porra', icon: <TrophyIcon /> },
    { id: 'stats', label: 'Estadísticas Porra', icon: <StatsIcon /> },
    { id: 'history', label: 'Historial Votos', icon: <HistoryIcon /> },
    { id: 'results', label: 'Resultados MotoGP', icon: <FlagIcon /> },
    { id: 'motogpStandings', label: 'Clas. MotoGP', icon: <MotoGPStandingsIcon /> },
    { id: 'livetiming', label: 'Live Timing', icon: <LiveTimingIcon /> },
    { id: 'news', label: 'Noticias', icon: <NewsIcon /> },
  ];

  return (
    <nav className="bg-gray-800/60 backdrop-blur-sm border-b border-gray-700 shadow-md">
      <div className="container mx-auto flex justify-center py-2">
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto pb-2 -mb-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`flex items-center space-x-2 px-2 sm:px-3 py-2 rounded-md transition-all duration-300 text-xs sm:text-sm font-semibold flex-shrink-0 ${
                activeTab === item.id
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <div className="w-5 h-5">{item.icon}</div>
              <span className="hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};