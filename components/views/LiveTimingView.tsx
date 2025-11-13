import React, { useState, useEffect, useMemo } from 'react';
import type { LiveTimingResponse, LiveTimingRider } from '../../types';

const API_URL = 'https://api.motogp.pulselive.com/motogp/v1/timing-gateway/livetiming-lite';
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="w-8 h-8 border-4 border-gray-600 border-t-red-500 rounded-full animate-spin"></div>
    </div>
);

const formatRemainingTime = (remainingSecondsStr: string): string => {
    const totalSeconds = parseInt(remainingSecondsStr, 10);
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const LiveTimingView: React.FC = () => {
    const [liveData, setLiveData] = useState<LiveTimingResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const doFetch = async () => {
            try {
                const response = await fetch(`${PROXY_URL}${encodeURIComponent(API_URL)}`);
                if (!response.ok) {
                    throw new Error(`Error fetching Live Timing: ${response.statusText}`);
                }
                const data: LiveTimingResponse = await response.json();
                setLiveData(data);
                setError(null);
            } catch (err) {
                console.error("Failed to fetch live timing data:", err);
                setError("No se pudo cargar el Live Timing. Puede que no haya una sesión activa o el servicio no esté disponible.");
            } finally {
                setLoading(false);
            }
        };

        doFetch();
        const intervalId = setInterval(doFetch, 5000);
        return () => clearInterval(intervalId);
    }, []);

    const riders = useMemo(() => {
        if (!liveData?.rider) return [];
        // FIX: Explicitly type sort parameters to prevent TypeScript from inferring them as 'unknown'.
        return Object.values(liveData.rider).sort((a: LiveTimingRider, b: LiveTimingRider) => a.order - b.order);
    }, [liveData]);
    
    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="bg-red-900/50 text-red-300 p-4 rounded-lg text-center">{error}</div>;
    }

    if (!liveData || !liveData.head) {
        return <div className="text-center py-10"><p className="text-gray-500 italic">No hay datos de Live Timing disponibles en este momento.</p></div>;
    }

    const { head } = liveData;

    return (
        <div className="animate-fade-in space-y-6">
            <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white">Live Timing</h2>
                <p className="text-gray-400 mt-1">{head.event_tv_name}</p>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                    <p className="text-sm text-gray-400">Categoría</p>
                    <p className="font-bold text-lg">{head.category}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Sesión</p>
                    <p className="font-bold text-lg">{head.session_name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Estado</p>
                    <p className="font-bold text-lg">{head.session_status_name}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-400">Restante</p>
                    <p className="font-bold text-lg font-mono">{formatRemainingTime(head.remaining)}</p>
                </div>
            </div>

            <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-300">
                        <thead className="text-xs text-gray-400 uppercase bg-gray-700/50">
                            <tr>
                                <th className="px-2 py-3 text-center">Pos</th>
                                <th className="px-4 py-3">Piloto</th>
                                <th className="px-4 py-3">Equipo / Moto</th>
                                <th className="px-4 py-3 text-right">Tiempo Vuelta</th>
                                <th className="px-4 py-3 text-right">Última Vuelta</th>
                                <th className="px-4 py-3 text-right">Diferencia</th>
                                <th className="px-4 py-3 text-right">Diferencia Ant.</th>
                                <th className="px-2 py-3 text-center">Vueltas</th>
                                <th className="px-4 py-3 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {riders.map((rider: LiveTimingRider) => (
                                <tr key={rider.rider_id} className="border-b border-gray-700 hover:bg-gray-700/40">
                                    <td className="px-2 py-3 font-bold text-center">{rider.pos > -1 ? rider.pos : rider.order}</td>
                                    <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                                        <span 
                                            className="inline-block text-center w-8 mr-2 px-1 rounded text-xs font-bold"
                                            style={{ backgroundColor: `#${rider.color}`, color: `#${rider.text_color}` }}
                                        >
                                            {rider.rider_number}
                                        </span>
                                        {rider.rider_surname} ({rider.rider_nation})
                                    </td>
                                    <td className="px-4 py-3">
                                        <div>{rider.team_name}</div>
                                        <div className="text-xs text-gray-400">{rider.bike_name}</div>
                                    </td>
                                    <td className="px-4 py-3 text-right font-mono">{rider.lap_time !== "0.000" ? rider.lap_time : '-'}</td>
                                    <td className="px-4 py-3 text-right font-mono">{rider.last_lap_time !== "0.000" ? rider.last_lap_time : '-'}</td>
                                    <td className="px-4 py-3 text-right font-mono">{rider.gap_first !== "0.000" ? rider.gap_first : '-'}</td>
                                    <td className="px-4 py-3 text-right font-mono">{rider.gap_prev !== "0.000" ? rider.gap_prev : '-'}</td>
                                    <td className="px-2 py-3 text-center font-mono">{rider.num_lap}</td>
                                    <td className="px-4 py-3 text-center">
                                        {rider.on_pit ? <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-300 rounded-full">PIT</span> : ''}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};