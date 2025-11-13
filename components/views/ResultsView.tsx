import React, { useState, useEffect, useCallback } from 'react';
import type { Race, Point, ApiSeason, ApiCategory, ApiEvent, ApiSession, ApiClassification, ApiClassificationResponse } from '../../types';

const API_BASE_URL = 'https://api.motogp.pulselive.com/motogp/v1';
const PROXY_URL = '/api/proxy?targetUrl=';

interface ResultsViewProps {
  // Props removed as point awarding is now automatic
}

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-4">
        <div className="w-6 h-6 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
    </div>
);

export const ResultsView: React.FC<ResultsViewProps> = () => {
    const [seasons, setSeasons] = useState<ApiSeason[]>([]);
    const [categories, setCategories] = useState<ApiCategory[]>([]);
    const [events, setEvents] = useState<ApiEvent[]>([]);
    const [sessions, setSessions] = useState<ApiSession[]>([]);
    const [classification, setClassification] = useState<ApiClassification[]>([]);

    const [selectedSeasonId, setSelectedSeasonId] = useState<string>('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [selectedSession, setSelectedSession] = useState<ApiSession | null>(null);
    
    const [loading, setLoading] = useState({
        seasons: false,
        categories: false,
        events: false,
        sessions: false,
        classification: false,
    });
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async <T,>(endpoint: string, loaderKey: keyof typeof loading): Promise<T | null> => {
        setLoading(prev => ({ ...prev, [loaderKey]: true }));
        setError(null);
        
        const retries = 3;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const targetUrl = `${API_BASE_URL}/${endpoint}`;
                const response = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`);
                if (!response.ok) throw new Error(`Network response was not ok for ${endpoint}. Status: ${response.status}`);
                const data = await response.json();
                setLoading(prev => ({ ...prev, [loaderKey]: false }));
                return data;
            } catch (err) {
                console.error(`API Fetch Error (Attempt ${attempt}/${retries}):`, err);
                if (attempt < retries) {
                    const delay = Math.pow(2, attempt - 1) * 1000; // Exponential backoff: 1s, 2s
                    await new Promise(res => setTimeout(res, delay));
                } else {
                    setError(`Failed to fetch ${String(loaderKey)} after several attempts. The service might be temporarily down. Please try again later.`);
                    setLoading(prev => ({ ...prev, [loaderKey]: false }));
                    return null;
                }
            }
        }
        
        return null;
    }, []);

    useEffect(() => {
        fetchData<ApiSeason[]>('seasons', 'seasons').then(data => {
            if (data) setSeasons(data.sort((a,b) => b.year - a.year));
        });
    }, [fetchData]);

    useEffect(() => {
        if (!selectedSeasonId) {
            setCategories([]);
            setSelectedCategoryId('');
            setEvents([]);
            setSelectedEventId('');
            return;
        }

        const fetchDependentData = async () => {
            const categoriesData = await fetchData<ApiCategory[]>(`categories?seasonUuid=${selectedSeasonId}`, 'categories');
            if (categoriesData) {
                setCategories(categoriesData);
                const eventsData = await fetchData<ApiEvent[]>(`events?seasonUuid=${selectedSeasonId}&isFinished=true`, 'events');
                if (eventsData) {
                    setEvents(eventsData.filter(event => !event.sponsored_name.toLowerCase().includes('test')));
                }
            }
        };
        fetchDependentData();
    }, [selectedSeasonId, fetchData]);


    useEffect(() => {
        if (!selectedEventId || !selectedCategoryId) {
            setSessions([]);
            setSelectedSession(null);
            return;
        }
        fetchData<ApiSession[]>(`results/sessions?eventUuid=${selectedEventId}&categoryUuid=${selectedCategoryId}`, 'sessions').then(data => {
            if (data) setSessions(data);
        });
    }, [selectedEventId, selectedCategoryId, fetchData]);
    
    useEffect(() => {
        if (!selectedSession) {
            setClassification([]);
            return;
        };
        fetchData<ApiClassificationResponse>(`results/session/${selectedSession.id}/classification?test=false`, 'classification').then(data => {
            if (data) setClassification(data.classification);
        });
    }, [selectedSession, fetchData]);

    const handleSelectChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: React.ChangeEvent<HTMLSelectElement>) => {
        setter(e.target.value);
        if (setter === setSelectedSeasonId) {
            setSelectedCategoryId('');
            setSelectedEventId('');
            setSelectedSession(null);
        } else if (setter === setSelectedCategoryId || setter === setSelectedEventId) {
            setSelectedSession(null);
        }
    };

    const renderTable = () => {
        if (loading.classification) return <LoadingSpinner />;
        if (classification.length === 0) return null;
        
        const hasPoints = classification[0]?.points !== undefined;

        return (
            <div className="overflow-x-auto mt-6">
                <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                        <tr>
                            <th className="px-4 py-3 text-center">Pos</th>
                            <th className="px-4 py-3">Piloto</th>
                            <th className="px-4 py-3">Equipo</th>
                            <th className="px-4 py-3">Constructor</th>
                            {hasPoints ? (
                                <>
                                    <th className="px-4 py-3 text-right">Tiempo</th>
                                    <th className="px-4 py-3 text-right">Puntos</th>
                                </>
                            ) : (
                                <>
                                    <th className="px-4 py-3 text-right">Mejor Vuelta</th>
                                    <th className="px-4 py-3 text-right">V. Máx (km/h)</th>
                                </>
                            )}
                            <th className="px-4 py-3 text-right">Diferencia</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classification.map(item => (
                            <tr key={item.position} className="border-b border-gray-700 hover:bg-gray-700/40">
                                <td className="px-4 py-3 font-bold text-center">{item.position}</td>
                                <td className="px-4 py-3 font-medium text-white">
                                    #{item.rider.number} {item.rider.full_name} ({item.rider.country.iso})
                                </td>
                                <td className="px-4 py-3">{item.team.name}</td>
                                <td className="px-4 py-3">{item.constructor.name}</td>
                                {hasPoints ? (
                                    <>
                                        <td className="px-4 py-3 text-right font-mono">{item.time}</td>
                                        <td className="px-4 py-3 text-right font-mono font-bold">{item.points}</td>
                                    </>
                                ) : (
                                    <>
                                        <td className="px-4 py-3 text-right font-mono">{item.best_lap?.time}</td>
                                        <td className="px-4 py-3 text-right font-mono">{item.top_speed || '-'}</td>
                                    </>
                                )}
                                <td className="px-4 py-3 text-right font-mono">{item.gap.first}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    const renderSelect = (id: string, label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: {id: string; name: string | number}[], disabled: boolean, isLoading: boolean) => (
        <div className="flex-1">
            <label htmlFor={id} className="block mb-2 text-sm font-medium text-gray-300">{label}</label>
            <div className="relative">
                <select id={id} value={value} onChange={onChange} disabled={disabled || isLoading} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 disabled:opacity-50">
                    <option value="">{`Selecciona ${label.toLowerCase()}`}</option>
                    {options.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                </select>
                {isLoading && <div className="absolute right-2 top-1/2 -translate-y-1/2"><LoadingSpinner/></div>}
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Resultados Históricos MotoGP</h2>
                <p className="text-gray-400 mt-1">Explora los resultados de carreras pasadas.</p>
            </div>
            {error && <div className="bg-red-900/50 text-red-300 p-4 rounded-lg text-center">{error}</div>}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg border border-gray-700 space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {renderSelect('season-select', 'Año', selectedSeasonId, handleSelectChange(setSelectedSeasonId), seasons.map(s => ({id: s.id, name: s.year})), loading.seasons, loading.seasons)}
                    {renderSelect('category-select', 'Categoría', selectedCategoryId, handleSelectChange(setSelectedCategoryId), categories.map(c => ({id: c.id, name: c.name})), !selectedSeasonId, loading.categories)}
                    {renderSelect('event-select', 'Evento', selectedEventId, handleSelectChange(setSelectedEventId), events.map(e => ({id: e.id, name: e.sponsored_name})), !selectedCategoryId, loading.events)}
                </div>
                
                {loading.sessions ? <LoadingSpinner /> : sessions.length > 0 && (
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Selecciona una sesión</h3>
                        <div className="flex flex-wrap gap-2">
                            {sessions.map(session => (
                                <button key={session.id} onClick={() => {
                                    setSelectedSession(session);
                                }}
                                    className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${selectedSession?.id === session.id ? 'bg-red-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
                                    {session.type} {session.number}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                {renderTable()}
            </div>
        </div>
    );
};