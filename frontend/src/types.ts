export interface Team {
  id: number;
  name: string;
  shortName?: string; // <-- Ajouté ici
  crest?: string;
}

export interface Match {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: Team;
  awayTeam: Team;
  score?: {
    fullTime?: {
      home: number | null;
      away: number | null;
    };
  };
}

export interface TablePosition {
  position: number;
  team: Team;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalDifference: number;
  points: number;
}

export interface StandingsResponse {
  standings: {
    type: string;
    table: TablePosition[];
  }[];
}