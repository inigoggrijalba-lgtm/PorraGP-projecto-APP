import type { Race, ApiSeason, ApiEvent } from '../types';

const API_BASE_URL = 'https://api.motogp.pulselive.com/motogp/v1';
// Use the internal application proxy to bypass CORS issues.
const PROXY_URL = '/api/proxy?targetUrl=';

/**
 * Converts an ISO 3166-1 alpha-2 country code to a flag emoji.
 * @param iso The two-letter country code.
 * @returns A string containing the flag emoji.
 */
function isoToFlag(iso: string): string {
  if (!iso || iso.length !== 2) return '🏁';
  return iso
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(char.charCodeAt(0) + 127397));
}

/**
 * Fetches data from the MotoGP API via the internal proxy, with retries.
 * @param endpoint The API endpoint to fetch.
 * @returns The JSON response data.
 */
export async function fetchMotogpApiData<T>(endpoint: string): Promise<T> {
  const retries = 3;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const targetUrl = `${API_BASE_URL}/${endpoint}`;
      // Use the internal proxy by passing the target URL as a query parameter.
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`);
      if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error(`API Fetch Error (Attempt ${attempt}/${retries}):`, err);
      if (attempt < retries) {
        const delay = Math.pow(2, attempt - 1) * 1000;
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw new Error(`Failed to fetch from endpoint ${endpoint} after several attempts.`);
      }
    }
  }
  throw new Error('This should not be reached');
}

/**
 * Fetches the official MotoGP calendar for the current season.
 * It finds the season marked as "current", fetches its events, filters out tests,
 * and then formats the data for the application.
 * @returns A promise that resolves to an object containing the array of Race objects and the year of the calendar.
 */
export async function fetchMotogpCalendar(): Promise<{ races: Race[], year: number }> {
  // 1. Fetch all seasons to find the current one
  const seasons = await fetchMotogpApiData<ApiSeason[]>('seasons');
  
  // 2. Find the season object where "current" is true
  const currentSeason = seasons.find(season => season.current === true);
  if (!currentSeason) {
    throw new Error('No se pudo encontrar la temporada actual ("current": true) en la API de MotoGP.');
  }

  // 3. Fetch all events for the current season using its ID
  const events = await fetchMotogpApiData<ApiEvent[]>(`events?seasonUuid=${currentSeason.id}`);
  
  // 4. Filter out events that are tests
  const raceEvents = events.filter(event => event.test === false);

  if (raceEvents.length === 0) {
    throw new Error(`No se encontraron eventos de carrera (no-test) para la temporada ${currentSeason.year}.`);
  }

  // 5. Sort the race events chronologically by their start date
  const sortedEvents = raceEvents.sort((a, b) => new Date(a.date_start).getTime() - new Date(b.date_start).getTime());

  // 6. Map the sorted API events to the application's internal Race format
  const races: Race[] = sortedEvents.map((event, index) => {
    const startDate = new Date(event.date_start);
    const endDate = new Date(event.date_end);
    
    const startMonth = startDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
    const endMonth = endDate.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase().replace('.', '');
    const dates = `${startDate.getUTCDate()} ${startMonth} - ${endDate.getUTCDate()} ${endMonth}`;

    return {
      id: index + 1, // Simple sequential ID
      name: event.sponsored_name,
      country: event.country.name,
      circuit: event.circuit.name,
      dates: dates,
      flag: isoToFlag(event.country.iso),
      race_date: event.date_start, // Match user's schema 'race_date'
      status: event.status, // Match user's schema 'status'
      api_event_id: event.id, // Store the API's unique ID for linking results
    };
  });

  return { races, year: currentSeason.year };
}