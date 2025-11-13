import React, { useState, useEffect, useCallback } from 'react';
import type { ApiSeason, ApiCategory, ApiStanding } from '../../types';
import { TrophyIcon } from '../icons/TrophyIcon';

const API_BASE_URL = 'https://api.motogp.pulselive.com/motogp/v1/results';
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="w-6 h-6 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
    </div>
);

export const MotoGPStandingsView: React.FC = () => {
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [standings, setStandings] = useState<ApiStanding[]>([]);
    const [currentSeason, setCurrentSeason] = useState<ApiSeason | null>(null);
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

    const [loading, setLoading] = useState({
        initial: true,
        standings: false,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async <T,>(endpoint: string): Promise<T | null> => {
        try {
            const targetUrl = `${API_BASE_URL}/${endpoint}`;
            const response = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`);
            if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error(`API Fetch Error for ${endpoint}:`, err);
            setError(`Fallo al cargar los datos. El servicio puede no estar disponible.`);
            return null;
        }
    }, []);

    // Step 1: Fetch seasons on mount to find the current one.
    useEffect(() => {
        const initialize = async () => {
            setLoading(prev => ({ ...prev, initial: true }));
            setError(null);
            
            const seasonsData = await fetchData<ApiSeason[]>('seasons');
            if (seasonsData) {
                const current = seasonsData.find(s => s.current);
                if (current) {
                    setCurrentSeason(current);
                } else {
                    setError("No se pudo determinar la temporada actual.");
                    setLoading(prev => ({ ...prev, initial: false }));
                }
            } else {
                 setLoading(prev => ({ ...prev, initial: false }));
            }
        };
        initialize();
    }, [fetchData]);

    // Step 2: Fetch categories once the current season is determined.
    useEffect(() => {
        if (!currentSeason) return;

        const fetchCategories = async () => {
            const categoriesData = await fetchData<ApiCategory[]>(`categories?seasonUuid=${currentSeason.id}`);
            if (categoriesData) {
                setCategories(categoriesData);
                const motogpCategory = categoriesData.find(c => c.name === 'MotoGP™');
                if (motogpCategory) {
                    setSelectedCategoryId(motogpCategory.id);
                } else if (categoriesData.length > 0) {
                    setSelectedCategoryId(categoriesData[0].id);
                }
            }
            // End of initial loading sequence
            setLoading(prev => ({ ...prev, initial: false }));
        };
        fetchCategories();
    }, [currentSeason, fetchData]);

    // Step 3: Fetch standings when category changes.
    useEffect(() => {
        if (!currentSeason || !selectedCategoryId) return;

        const fetchStandings = async () => {
            setLoading(prev => ({ ...prev, standings: true }));
            setStandings([]); // Reset standings before fetching
            
            const data = await fetchData<{ classification: ApiStanding[] }>(`standings/worldstanding?seasonUuid=${currentSeason.id}&categoryUuid=${selectedCategoryId}`);
            
            // FIX: The API returns the array under the "classification" key for this endpoint.
            if (data && Array.isArray(data.classification)) {
                setStandings(data.classification);
            } else {
                setStandings([]); // Fallback to empty array on unexpected response
                console.warn("Standings data was not in the expected format (expected 'classification' property):", data);
            }
            setLoading(prev => ({ ...prev, standings: false }));
        };
        fetchStandings();
    }, [currentSeason, selectedCategoryId, fetchData]);

    const getRankColor = (rank: number) => {
        switch(rank) {
            case 1: return 'text-yellow-400';
            case 2: return 'text-gray-300';
            case 3: return 'text-yellow-600';
            default: return 'text-gray-400';
        }
    };
    
    return (
        <div className="animate-fade-in space-y-6 max-w-4xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Clasificación Oficial {currentSeason?.year}</h2>
                <p className="text-gray-400 mt-1">Clasificación del campeonato mundial.</p>
            </div>
            
            {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-lg text-center">{error}</div>}

            {loading.initial ? <LoadingSpinner /> : (
                <>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 flex justify-center">
                        <div className="flex-1 max-w-xs">
                            <label htmlFor="category-select" className="block mb-2 text-sm font-medium text-gray-300">Categoría</label>
                            <select 
                                id="category-select" 
                                value={selectedCategoryId} 
                                onChange={(e) => setSelectedCategoryId(e.target.value)} 
                                disabled={!categories.length} 
                                className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5"
                            >
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {loading.standings ? <LoadingSpinner /> : (
                        standings && standings.length > 0 ? (
                            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                                        <tr>
                                            <th className="px-4 py-3 text-center">Pos</th>
                                            <th className="px-6 py-3">Piloto</th>
                                            <th className="px-6 py-3 hidden md:table-cell">Equipo / Constructor</th>
                                            <th className="px-6 py-3 text-right">Puntos</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {standings.map((item) => (
                                            <tr key={item.position} className="border-b border-gray-700 hover:bg-gray-700/40">
                                                <td className={`px-4 py-4 font-bold text-center text-lg ${getRankColor(item.position)}`}>
                                                    {item.position <= 3 ? <TrophyIcon className="inline-block w-6 h-6"/> : item.position}
                                                </td>
                                                <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                                                    #{item.rider.number} {item.rider.full_name}
                                                </td>
                                                <td className="px-6 py-4 hidden md:table-cell">
                                                    <div>{item.team.name}</div>
                                                    <div className="text-xs text-gray-400">{item.constructor.name}</div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-lg">{item.points}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                           <div className="text-center py-10"><p className="text-gray-500 italic">No hay datos de clasificación para esta selección.</p></div>
                        )
                    )}
                </>
            )}
        </div>
    );
};