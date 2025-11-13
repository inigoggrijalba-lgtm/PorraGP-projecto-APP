
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Pre-configured Supabase credentials
const DEFAULT_SUPABASE_URL = 'https://tjdwfludyzymrepfuqcs.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqZHdmbHVkeXp5bXJlcGZ1cWNzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjMwNzQsImV4cCI6MjA3ODU5OTA3NH0.Xz8LZy3bZHXH3MrwGLeKCR7pK8R54oQyh7wsm-1fVSo';


/**
 * Initializes the Supabase client using pre-configured credentials.
 * @returns An object containing the client instance or an error message.
 */
export function initializeSupabaseClient(): { client: SupabaseClient | null; error: string | null } {
    const supabaseUrl = DEFAULT_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = DEFAULT_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        return { 
            client: null, 
            error: "Las credenciales de Supabase no están configuradas en el código." 
        };
    }

    try {
        const client = createClient(supabaseUrl, supabaseAnonKey);
        return { client, error: null };
    } catch (e: any) {
        return { 
            client: null, 
            error: `Error al inicializar Supabase: ${e.message}. Revisa que la URL y la clave sean correctas.` 
        };
    }
}

// FIX: Add missing function `testAndSaveSupabaseCredentials` to resolve import error in `SupabaseSetup.tsx`.
/**
 * Stub function to fix compilation errors in the unused SupabaseSetup component.
 * This function does not test or save credentials as the app uses hardcoded values.
 * @param url The Supabase project URL.
 * @param anonKey The Supabase anon key.
 * @returns A success result to allow the calling component to proceed.
 */
export async function testAndSaveSupabaseCredentials(url: string, anonKey: string): Promise<{ success: boolean; error?: string }> {
  console.warn("Attempted to use testAndSaveSupabaseCredentials. This component is not active and the application is using pre-configured Supabase credentials.");
  // This is a stub. It returns success to allow the UI to proceed,
  // but no credentials are saved, and no connection is tested.
  return { success: true };
}
