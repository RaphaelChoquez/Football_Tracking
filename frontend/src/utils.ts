import type { Match } from './types'

export function formatDate(isoString: string): string {
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) {
    return 'Date inconnue'
  }
  return date.toLocaleString('fr-CA', {
    dateStyle: 'short',
    timeStyle: 'short'
  })
}

export function statusClass(status: string): string {
  switch (status) {
    case 'FINISHED':
      return 'status-finished'
    case 'IN_PLAY':
    case 'LIVE':
    case 'PAUSED':
      return 'status-live'
    default:
      return 'status-scheduled'
  }
}

export function filterMatches(matches: Match[], filter: string, searchQuery: string): Match[] {
  return matches.filter((m) => {
    // 1. Filtre par statut
    let matchesStatus = true
    if (filter === 'SCHEDULED') {
      matchesStatus = m.status === 'SCHEDULED' || m.status === 'TIMED'
    } else if (filter === 'LIVE') {
      matchesStatus = m.status === 'IN_PLAY' || m.status === 'LIVE' || m.status === 'PAUSED'
    } else if (filter === 'FINISHED') {
      matchesStatus = m.status === 'FINISHED'
    }

    // 2. Filtre par nom d'équipe
    const query = searchQuery.trim().toLowerCase()
    const matchesSearch =
      query === '' ||
      m.homeTeam.name.toLowerCase().includes(query) ||
      m.awayTeam.name.toLowerCase().includes(query)

    return matchesStatus && matchesSearch
  })
}