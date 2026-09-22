export interface Match {
  id: number
  utcDate: string
  status: string
  homeTeam: {
    name: string
  }
  awayTeam: {
    name: string
  }
  score: {
    fullTime: {
      home: number | null
      away: number | null
    }
  }
}

export interface TablePosition {
  position: number
  team: {
    id: number
    name: string
    crest: string
  }
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
}

export interface Standing {
  stage: string
  type: string
  table: TablePosition[]
}

export interface StandingsResponse {
  standings: Standing[]
}