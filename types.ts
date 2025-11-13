

export interface Player {
  id: number;
  name: string;
}

export interface Rider {
  id: number;
  name: string;
  number: number;
  team: string;
  imageUrl: string;
}

export interface PlayerStats {
  playerId: number;
  points: number;
  lastRacePoints: number;
  voteHistory: Map<number, number>; // Map<riderId, count>
}

export interface Bet {
  playerId: number;
  riderId: number;
}

export interface Vote {
  player_id: number;
  race_id: number;
  rider_id: number;
  is_locked: boolean;
}

export interface Point {
  id: number;
  player_id: number;
  race_id: number;
  rider_id: number;
  session_id: string;
  session_name: string | null;
  points: number;
}


export interface Race {
  id: number;
  name: string;
  country: string;
  circuit: string;
  dates: string;
  flag: string;
  race_date: string; // Used to determine the next race, matches user schema
  status: string; // Matches user schema
  api_event_id: string; // The GUID from the MotoGP API
}

export type Tab = 'home' | 'vote' | 'standings' | 'calendar' | 'history' | 'results' | 'livetiming' | 'news' | 'stats' | 'motogpStandings';

// Types for MotoGP API
export interface ApiSeason {
  id: string;
  name: string | null;
  year: number;
  current: boolean;
}

export interface ApiCategory {
  id: string;
  name: string;
}

export interface ApiEvent {
  id: string;
  sponsored_name: string;
  date_start: string;
  date_end: string;
  circuit: {
    name: string;
  };
  country: {
    name: string;
    iso: string;
  };
  test: boolean;
  status: string;
}

export interface ApiSession {
  id: string;
  type: string;
  number: number | null;
}

export interface ApiClassification {
  position: number;
  rider: {
    full_name: string;
    number: number;
    country: { iso: string };
  };
  team: { name: string };
  constructor: { name: string };
  best_lap?: { time: string; number: number };
  total_laps: number;
  top_speed?: number;
  gap: { first: string };
  time?: string;
  points?: number;
  status: string;
}

export interface ApiClassificationResponse {
  classification: ApiClassification[];
}

export interface ApiStanding {
  id: string;
  position: number;
  rider: {
    id: string;
    full_name: string;
    country: {
      iso: string;
      name: string;
      region_iso: string;
    };
    legacy_id: number;
    riders_id: string;
    number: number;
    riders_api_uuid: string;
  };
  team: {
    id: string;
    name: string;
    legacy_id: number;
    season: {
      id: string;
      year: number;
      current: boolean;
    };
  };
  constructor: {
    id: string;
    name: string;
    legacy_id: number;
  };
  session: string;
  points: number;
  race_wins: number | null;
  podiums: number | null;
  last_positions: { [key: string]: number | null };
  sprint_wins: number | null;
  sprint_podiums: number | null;
  sprint_last_positions: { [key: string]: number | null } | null;
}

// Type for News Feed
export interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  imageUrl: string;
}

// Types for LiveTiming
export interface LiveTimingHead {
  championship_id: string;
  category: string;
  circuit_id: string;
  circuit_name: string;
  global_event_id: string;
  event_id: string;
  event_tv_name: string;
  event_shortname: string;
  date: string;
  datet: number;
  datst: number;
  num_laps: number;
  gmt: string;
  trsid: number;
  session_id: string;
  session_type: number;
  session_name: string;
  session_shortname: string;
  duration: string;
  remaining: string;
  session_status_id: string;
  session_status_name: string;
  date_formated: string;
  url: string | null;
}

export interface LiveTimingRider {
  order: number;
  rider_id: number;
  status_name: string;
  status_id: string;
  rider_number: string;
  color: string;
  text_color: string;
  pos: number;
  rider_shortname: string;
  rider_name: string;
  rider_surname: string;
  rider_nation: string;
  lap_time: string;
  num_lap: number;
  last_lap_time: string;
  trac_status: string;
  team_name: string;
  bike_name: string;
  bike_id: number;
  gap_first: string;
  gap_prev: string;
  on_pit: boolean;
}

export interface LiveTimingResponse {
  head: LiveTimingHead;
  rider: { [key: string]: LiveTimingRider };
}