export type Language = 'fr' | 'en'

export const translations = {
  fr: {
    title: 'Football Tracker',
    selectLeague: 'Sélectionner une ligue',
    tabMatches: 'Matchs',
    tabStandings: 'Classement',
    searchPlaceholder: 'Rechercher une équipe...',
    filterAll: 'Tous',
    filterScheduled: 'À venir',
    filterLive: 'En direct',
    filterFinished: 'Terminés',
    noMatches: 'Aucun match trouvé.',
    loading: 'Chargement en cours...',
    close: 'Fermer',
    matchDetails: 'Détails du match',
    tableTeam: 'Équipe',
    tablePlayed: 'J',
    tableWon: 'G',
    tableDraw: 'N',
    tableLost: 'P',
    tableDiff: 'DB',
    tablePoints: 'Pts',
    statusFINISHED: 'Terminé',
    statusSCHEDULED: 'À venir',
    statusTIMED: 'À venir',         // <-- Ajouté ici
    statusLIVE: 'En direct',
    statusIN_PLAY: 'En direct',
    statusPAUSED: 'Mi-temps',
    leagues: {
      PL: 'Premier League',
      FL1: 'Ligue 1',
      PD: 'La Liga',
      BL1: 'Bundesliga',
      SA: 'Serie A',
      CL: 'Ligue des Champions'
    }
  },
  en: {
    title: 'Football Tracker',
    selectLeague: 'Select League',
    tabMatches: 'Matches',
    tabStandings: 'Standings',
    searchPlaceholder: 'Search a team...',
    filterAll: 'All',
    filterScheduled: 'Upcoming',
    filterLive: 'Live',
    filterFinished: 'Finished',
    noMatches: 'No matches found.',
    loading: 'Loading...',
    close: 'Close',
    matchDetails: 'Match Details',
    tableTeam: 'Team',
    tablePlayed: 'MP',
    tableWon: 'W',
    tableDraw: 'D',
    tableLost: 'L',
    tableDiff: 'GD',
    tablePoints: 'Pts',
    statusFINISHED: 'Finished',
    statusSCHEDULED: 'Upcoming',
    statusTIMED: 'Upcoming',         // <-- Ajouté ici
    statusLIVE: 'Live',
    statusIN_PLAY: 'Live',
    statusPAUSED: 'Half-Time',
    leagues: {
      PL: 'Premier League',
      FL1: 'Ligue 1',
      PD: 'La Liga',
      BL1: 'Bundesliga',
      SA: 'Serie A',
      CL: 'Champions League'
    }
  }
}