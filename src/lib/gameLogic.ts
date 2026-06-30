import playersData from '../data/mockPlayers.json';

export interface PlayerData {
  id: number;
  name: string;
  age: number;
  nationality: string;
  team: string;
  league: string;
  position: string;
}

export function getCleanPlayers(): PlayerData[] {
  // @ts-ignore
  return playersData.map(p => ({
    id: p.player.id,
    name: p.player.name,
    age: p.player.age,
    nationality: p.player.nationality,
    team: p.statistics[0]?.team?.name || 'Unknown',
    league: p.statistics[0]?.league?.name || 'Unknown',
    position: p.statistics[0]?.games?.position || 'Unknown',
  }));
}

export function getDailyPlayer(): PlayerData {
  const players = getCleanPlayers();
  // Simple deterministic logic based on date
  const dateStr = new Date().toISOString().split('T')[0];
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % players.length;
  return players[index];
}

export type MatchStatus = 'match' | 'mismatch' | 'higher' | 'lower';

export interface GuessResult {
  player: PlayerData;
  nationality: MatchStatus;
  league: MatchStatus;
  team: MatchStatus;
  position: MatchStatus;
  age: MatchStatus;
}

export function evaluateGuess(guess: PlayerData, target: PlayerData): GuessResult {
  return {
    player: guess,
    nationality: guess.nationality === target.nationality ? 'match' : 'mismatch',
    league: guess.league === target.league ? 'match' : 'mismatch',
    team: guess.team === target.team ? 'match' : 'mismatch',
    position: guess.position === target.position ? 'match' : 'mismatch',
    age: guess.age === target.age ? 'match' : guess.age < target.age ? 'higher' : 'lower',
  };
}
