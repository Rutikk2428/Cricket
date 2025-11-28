export type Team = 'Team A' | 'Team B';

export enum MatchPhase {
  SETUP = 'SETUP',
  INNINGS_1 = 'INNINGS_1',
  BREAK = 'BREAK',
  INNINGS_2 = 'INNINGS_2',
  RESULT = 'RESULT',
}

export type BallResult = {
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  label: string; // e.g., "1", "W", "Nb+1" (rendered as Extra)
  timestamp: number;
};

export type Over = BallResult[];

export interface InningsState {
  battingTeam: Team;
  bowlingTeam: Team;
  runs: number;
  wickets: number;
  validBalls: number; // For over calculation
  oversHistory: Over[];
  currentOver: Over;
}

export interface MatchState {
  totalOvers: number;
  phase: MatchPhase;
  innings1: InningsState;
  innings2: InningsState;
  target: number | null;
  winner: Team | null | 'Draw';
  winMargin: string | null;
}