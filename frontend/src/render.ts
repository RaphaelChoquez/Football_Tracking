import type { Match, TablePosition } from './types'
import { formatDate, statusClass } from './utils'

export function renderMatchCard(match: Match): string {
  const score =
    match.status === 'FINISHED'
      ? `${match.score.fullTime.home ?? '-'} - ${match.score.fullTime.away ?? '-'}`
      : 'vs'

  return `
    <div class="match-card">
      <div class="match-date">
        ${formatDate(match.utcDate)}
      </div>
      <div class="match-teams">
        <span class="team">${match.homeTeam.name}</span>
        <span class="score">${score}</span>
        <span class="team">${match.awayTeam.name}</span>
      </div>
      <div class="match-status ${statusClass(match.status)}">
        ${match.status}
      </div>
    </div>
  `
}

export function renderStandingsTable(table: TablePosition[]): string {
  if (!table || table.length === 0) {
    return '<p>Aucun classement disponible.</p>'
  }

  const rows = table
    .map(
      (row) => `
    <tr>
      <td><strong>${row.position}</strong></td>
      <td>
        <div class="team-cell">
          ${row.team.crest ? `<img src="${row.team.crest}" alt="" class="team-crest" />` : ''}
          <span>${row.team.name}</span>
        </div>
      </td>
      <td>${row.playedGames}</td>
      <td>${row.won}</td>
      <td>${row.draw}</td>
      <td>${row.lost}</td>
      <td>${row.goalsFor}:${row.goalsAgainst}</td>
      <td>${row.goalDifference > 0 ? '+' : ''}${row.goalDifference}</td>
      <td><strong>${row.points}</strong></td>
    </tr>
  `
    )
    .join('')

  return `
    <div class="standings-table-container">
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Équipe</th>
            <th>J</th>
            <th>G</th>
            <th>N</th>
            <th>P</th>
            <th>B</th>
            <th>DB</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `
}

export function renderAppLayout(
  activeTab: 'matches' | 'standings',
  allCount: number,
  filteredMatches: Match[],
  currentFilter: string,
  searchQuery: string,
  standingsTable: TablePosition[]
): string {
  const matchesContent = `
    <div class="search-container">
      <input 
        type="text" 
        id="search-input" 
        class="search-input" 
        placeholder="Rechercher une équipe..." 
        value="${searchQuery}"
      />
    </div>

    <div class="filters-bar">
      <button class="filter-btn ${currentFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">Tous</button>
      <button class="filter-btn ${currentFilter === 'SCHEDULED' ? 'active' : ''}" data-filter="SCHEDULED">À venir</button>
      <button class="filter-btn ${currentFilter === 'LIVE' ? 'active' : ''}" data-filter="LIVE">En direct</button>
      <button class="filter-btn ${currentFilter === 'FINISHED' ? 'active' : ''}" data-filter="FINISHED">Terminés</button>
    </div>

    ${
      filteredMatches.length === 0
        ? '<p>Aucun match ne correspond à votre recherche.</p>'
        : `<div class="matches-list">${filteredMatches.map(renderMatchCard).join('')}</div>`
    }
  `

  const standingsContent = renderStandingsTable(standingsTable)

  return `
    <h1>Premier League</h1>
    <p class="subtitle">Saison en cours</p>

    <div class="nav-tabs">
      <button class="tab-btn ${activeTab === 'matches' ? 'active' : ''}" data-tab="matches">Matchs (${allCount})</button>
      <button class="tab-btn ${activeTab === 'standings' ? 'active' : ''}" data-tab="standings">Classement</button>
    </div>

    ${activeTab === 'matches' ? matchesContent : standingsContent}
  `
}