export type Language = 'fr' | 'en'

export const translations = {
  fr: {
    noMatches: 'Aucun match trouvé',
    loading: 'Chargement...',
    tableTeam: 'Équipe',
    tablePlayed: 'J',
    tableWon: 'V',
    tableDraw: 'N',
    tableLost: 'D',
    tableDiff: 'Diff',
    tablePoints: 'Pts',
    tabMatches: 'Matchs',
    tabStandings: 'Classement',
    searchPlaceholder: 'Rechercher une équipe...',
    filterAll: 'Tous',
    filterScheduled: 'À venir',
    filterLive: 'En direct',
    filterFinished: 'Terminés',
    
    // Buteurs
    tabPlayers: 'Buteurs',
    thPlayer: 'Joueur',
    thTeam: 'Équipe',
    thMatches: 'Matchs',
    thGoals: 'Buts',
    thAssists: 'Passes d.',

    // Modale & Statuts & Vidéo
    modalTitle: 'Détails du match',
    modalMatchDate: 'Date du match',
    modalHalfTimeScore: 'Score Mi-Temps',
    clickStatsHint: 'Cliquez pour voir les détails',
    videoHighlightTitle: 'Résumé vidéo du match',
    videoLoading: 'Chargement du résumé vidéo...',
    videoNotFound: 'Aucun résumé disponible pour ce match.',

    statusSCHEDULED: 'À venir',
    statusTIMED: 'Programmé',
    statusIN_PLAY: 'En cours',
    statusPAUSED: 'Mi-temps',
    statusFINISHED: 'Terminé',
    statusSUSPENDED: 'Suspendu',
    statusPOSTPONED: 'Reporté',
    statusCANCELLED: 'Annulé',

    leagues: {
      PL: 'Premier League',
      PD: 'La Liga',
      FL1: 'Ligue 1',
      BL1: 'Bundesliga',
      SA: 'Serie A'
    }
  },
  en: {
    noMatches: 'No matches found',
    loading: 'Loading...',
    tableTeam: 'Team',
    tablePlayed: 'P',
    tableWon: 'W',
    tableDraw: 'D',
    tableLost: 'L',
    tableDiff: 'GD',
    tablePoints: 'Pts',
    tabMatches: 'Matches',
    tabStandings: 'Standings',
    searchPlaceholder: 'Search team...',
    filterAll: 'All',
    filterScheduled: 'Upcoming',
    filterLive: 'Live',
    filterFinished: 'Finished',
    
    // Top Scorers
    tabPlayers: 'Top Scorers',
    thPlayer: 'Player',
    thTeam: 'Team',
    thMatches: 'Matches',
    thGoals: 'Goals',
    thAssists: 'Assists',

    // Modal & Statuses & Video
    modalTitle: 'Match Details',
    modalMatchDate: 'Match Date',
    modalHalfTimeScore: 'Half-Time Score',
    clickStatsHint: 'Click to view details',
    videoHighlightTitle: 'Match Video Highlights',
    videoLoading: 'Loading video highlights...',
    videoNotFound: 'No highlights available for this match.',

    statusSCHEDULED: 'Upcoming',
    statusTIMED: 'Scheduled',
    statusIN_PLAY: 'Live',
    statusPAUSED: 'Half-Time',
    statusFINISHED: 'Finished',
    statusSUSPENDED: 'Suspended',
    statusPOSTPONED: 'Postponed',
    statusCANCELLED: 'Cancelled',

    leagues: {
      PL: 'Premier League',
      PD: 'La Liga',
      FL1: 'Ligue 1',
      BL1: 'Bundesliga',
      SA: 'Serie A'
    }
  }
}