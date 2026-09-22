import type { Match } from './types'

export function filterMatches(
  matches: Match[],
  filter: string,
  searchQuery: string
): Match[] {
  if (!matches || !Array.isArray(matches)) return []

  return matches.filter((match) => {
    // 1. Filtrage par statut de match
    let matchesStatus = true
    if (filter === 'SCHEDULED') {
      matchesStatus = match.status === 'SCHEDULED' || match.status === 'TIMED'
    } else if (filter === 'LIVE') {
      matchesStatus =
        match.status === 'IN_PLAY' ||
        match.status === 'PAUSED' ||
        match.status === 'IN_PLAY_1ST_HALF' ||
        match.status === 'IN_PLAY_2ND_HALF'
    } else if (filter === 'FINISHED') {
      matchesStatus = match.status === 'FINISHED'
    }

    // 2. Filtrage par recherche texte
    let matchesSearch = true
    if (searchQuery && searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim()
      const homeName = (match.homeTeam?.name || match.homeTeam?.shortName || '').toLowerCase()
      const awayName = (match.awayTeam?.name || match.awayTeam?.shortName || '').toLowerCase()
      
      matchesSearch = homeName.includes(q) || awayName.includes(q)
    }

    return matchesStatus && matchesSearch
  })
}

export function formatDate(dateString: string, lang: string = 'fr'): string {
  if (!dateString) return ''
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(lang === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}