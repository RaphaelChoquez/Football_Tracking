export interface MatchScore {
  winner?: string | null
  duration?: string
  fullTime?: {
    home: number | null
    away: number | null
  }
  halfTime?: {
    home: number | null
    away: number | null
  }
}

export interface Team {
  id: number
  name: string
  shortName?: string
  crest?: string
}

export interface Match {
  id: number
  utcDate: string
  status: string
  matchday?: number
  stage?: string
  group?: string | null
  homeTeam: Team
  awayTeam: Team
  score?: MatchScore
}

export interface Scorer {
  player: {
    id: number
    name: string
    nationality: string
    position: string
  }
  team: Team
  goals: number
  assists?: number | null
  penalties?: number | null
  playedMatches: number
}

export interface TablePosition {
  position: number
  team: Team
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}