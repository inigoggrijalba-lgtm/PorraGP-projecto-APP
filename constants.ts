import type { Player, Rider, PlayerStats, Race } from './types';

export const PLAYERS: Player[] = [
  { id: 1, name: 'ANITA' },
  { id: 2, name: 'APA' },
  { id: 3, name: 'ASIER' },
  { id: 4, name: 'BEGO' },
  { id: 5, name: 'DAVITXI' },
  { id: 6, name: 'IÑIGO' },
  { id: 7, name: 'JOANA' },
  { id: 8, name: 'JORGE' },
  { id: 9, name: 'MARTA' },
  { id: 10, name: 'OSKAR' },
  { id: 11, name: 'TXARLY' },
  { id: 12, name: 'XABI' },
];

export const RIDERS: Rider[] = [
    { id: 1, name: 'Marc Márquez', number: 93, team: 'Ducati Corse', imageUrl: 'https://picsum.photos/seed/MMarquez/200' },
    { id: 2, name: 'Pecco Bagnaia', number: 63, team: 'Ducati Corse', imageUrl: 'https://picsum.photos/seed/Bagnaia/200' },
    { id: 3, name: 'Pedro Acosta', number: 31, team: 'KTM', imageUrl: 'https://picsum.photos/seed/Acosta/200' },
    { id: 4, name: 'Brad Binder', number: 33, team: 'KTM', imageUrl: 'https://picsum.photos/seed/Binder/200' },
    { id: 5, name: 'Jorge Martín', number: 89, team: 'Aprilia', imageUrl: 'https://picsum.photos/seed/Martin/200' },
    { id: 6, name: 'Marco Bezzecchi', number: 72, team: 'Aprilia', imageUrl: 'https://picsum.photos/seed/Bezzecchi/200' },
    { id: 7, name: 'Joan Mir', number: 36, team: 'Honda', imageUrl: 'https://picsum.photos/seed/Mir/200' },
    { id: 8, name: 'Luca Marini', number: 10, team: 'Honda', imageUrl: 'https://picsum.photos/seed/Marini/200' },
    { id: 9, name: 'Fabio Quartararo', number: 20, team: 'Yamaha', imageUrl: 'https://picsum.photos/seed/Quartararo/200' },
    { id: 10, name: 'Alex Rins', number: 42, team: 'Yamaha', imageUrl: 'https://picsum.photos/seed/Rins/200' },
    { id: 11, name: 'Toprak Razgatlioglu', number: 54, team: 'Pramac', imageUrl: 'https://picsum.photos/seed/Toprak/200' },
    { id: 12, name: 'Jack Miller', number: 43, team: 'Pramac', imageUrl: 'https://picsum.photos/seed/Miller/200' },
    { id: 13, name: 'Raúl Fernández', number: 25, team: 'Trackhouse', imageUrl: 'https://picsum.photos/seed/RFernandez/200' },
    { id: 14, name: 'Ai Ogura', number: 79, team: 'Trackhouse', imageUrl: 'https://picsum.photos/seed/Ogura/200' },
    { id: 15, name: 'Maverick Viñales', number: 12, team: 'RB Tech3 KTM', imageUrl: 'https://picsum.photos/seed/Vinales/200' },
    { id: 16, name: 'Enea Bastianini', number: 23, team: 'RB Tech3 KTM', imageUrl: 'https://picsum.photos/seed/Bastianini/200' },
    { id: 17, name: 'Johann Zarco', number: 5, team: 'LCR-Honda', imageUrl: 'https://picsum.photos/seed/Zarco/200' },
    { id: 18, name: 'Diogo Moreira', number: 10, team: 'LCR-Honda', imageUrl: 'https://picsum.photos/seed/Moreira/200' },
    { id: 19, name: 'Fabio Di Giannantonio', number: 49, team: 'VR46 Racing Team', imageUrl: 'https://picsum.photos/seed/Diggia/200' },
    { id: 20, name: 'Franco Morbidelli', number: 21, team: 'VR46 Racing Team', imageUrl: 'https://picsum.photos/seed/Morbidelli/200' },
    { id: 21, name: 'Alex Márquez', number: 73, team: 'Gresini Racing', imageUrl: 'https://picsum.photos/seed/AMarquez/200' },
    { id: 22, name: 'Fermín Aldeguer', number: 81, team: 'Gresini Racing', imageUrl: 'https://picsum.photos/seed/Aldeguer/200' },
];

// Initialize player stats from the PLAYERS list with 0 points and empty history.
export const INITIAL_PLAYER_STATS: PlayerStats[] = PLAYERS.map(player => ({
  playerId: player.id,
  points: 0,
  lastRacePoints: 0,
  voteHistory: new Map<number, number>(),
}));

// Initialize with no bets.
export const INITIAL_BETS = new Map<number, number>();