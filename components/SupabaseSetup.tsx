
import React, { useState } from 'react';
import { testAndSaveSupabaseCredentials } from '../utils/supabase';

interface SupabaseSetupProps {
  onSuccess: () => void;
}

export const SupabaseSetup: React.FC<SupabaseSetupProps> = ({ onSuccess }) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url || !anonKey) {
        setError("Ambos campos son obligatorios.");
        return;
    }
    setError(null);
    setLoading(true);

    const result = await testAndSaveSupabaseCredentials(url, anonKey);
    
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error || 'No se pudo conectar. Verifica tus credenciales.');
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
      <div className="text-center bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700 max-w-lg mx-auto animate-fade-in">
        <h2 className="text-2xl font-bold text-white mb-2">Conectar a Supabase</h2>
        <p className="text-gray-400 mb-6">
          Para comenzar, conecta la aplicación a tu base de datos.
          Encuentra la URL y la clave anónima (anon key) en la sección <code className="bg-gray-700 p-1 rounded-md text-xs text-red-300">Settings &gt; API</code> de tu proyecto de Supabase.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="supabase-url" className="block mb-2 text-sm font-medium text-left text-gray-300">URL del Proyecto</label>
            <input
              type="text"
              id="supabase-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://[ID-PROYECTO].supabase.co"
              required
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 font-mono"
            />
          </div>
          <div>
            <label htmlFor="supabase-key" className="block mb-2 text-sm font-medium text-left text-gray-300">Clave Pública (Anon Key)</label>
            <input
              type="password"
              id="supabase-key"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="Pega tu clave anónima aquí"
              required
              className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-red-500 focus:border-red-500 block w-full p-2.5 font-mono"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:bg-gray-500 disabled:cursor-wait"
          >
            {loading ? 'Conectando...' : 'Guardar y Conectar'}
          </button>
        </form>
        
        {error && <p className="text-red-400 mt-4 text-sm">{error}</p>}
      </div>
    </div>
  );
};
