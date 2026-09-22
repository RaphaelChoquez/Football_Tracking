import type { Match, TablePosition } from './types'
import type { Language } from './i18n'
import { translations } from './i18n'
import { formatDate } from './utils'

export function renderAppLayout(
  activeTab: 'matches' | 'standings',
  _allCount: number,
  filteredMatches: Match[],
  currentFilter: string,
  searchQuery: string,
  standingsTable: TablePosition[],
  lang: Language,
  currentLeague: string,
  _selectedMatch: Match | null
): string {
  const t = translations[lang]

  const matchesHtml = filteredMatches.length === 0
    ? `<div style="text-align:center; padding: 3rem; color: var(--text-secondary);">${t.noMatches}</div>`
    : filteredMatches.map((m) => {
        const statusKey = `status${m.status}` as keyof typeof t
        const statusText = t[statusKey] || m.status
        const homeScore = m.score?.fullTime?.home ?? '-'
        const awayScore = m.score?.fullTime?.away ?? '-'

        return `
          <div class="match-card" data-match-id="${m.id}">
            <div class="match-header">
              <span>${formatDate(m.utcDate, lang)}</span>
              <span class="match-status status-${m.status}">${statusText}</span>
            </div>
            <div class="teams-container">
              <div class="team-row">
                <div class="team-info">
                  ${m.homeTeam.crest ? `<img src="${m.homeTeam.crest}" class="team-crest" alt="" />` : ''}
                  <span class="team-name">${m.homeTeam.name}</span>
                </div>
                <span class="team-score">${homeScore}</span>
              </div>
              <div class="team-row">
                <div class="team-info">
                  ${m.awayTeam.crest ? `<img src="${m.awayTeam.crest}" class="team-crest" alt="" />` : ''}
                  <span class="team-name">${m.awayTeam.name}</span>
                </div>
                <span class="team-score">${awayScore}</span>
              </div>
            </div>
          </div>
        `
      }).join('')

  const standingsHtml = standingsTable.length === 0
    ? `<div style="text-align:center; padding: 3rem; color: var(--text-secondary);">${t.loading}</div>`
    : `
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th style="text-align:left;">${t.tableTeam}</th>
            <th>${t.tablePlayed}</th>
            <th>${t.tableWon}</th>
            <th>${t.tableDraw}</th>
            <th>${t.tableLost}</th>
            <th>${t.tableDiff}</th>
            <th>${t.tablePoints}</th>
          </tr>
        </thead>
        <tbody>
          ${standingsTable.map((row) => `
            <tr>
              <td><strong>${row.position}</strong></td>
              <td class="team-cell">
                ${row.team.crest ? `<img src="${row.team.crest}" class="team-crest" alt="" />` : ''}
                <span>${row.team.name}</span>
              </td>
              <td>${row.playedGames}</td>
              <td>${row.won}</td>
              <td>${row.draw}</td>
              <td>${row.lost}</td>
              <td>${row.goalDifference}</td>
              <td><strong>${row.points}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `

  return `
    <header>
      <h1>Football Tracker</h1>
      <select id="league-select">
        ${Object.entries(t.leagues).map(([code, name]) => `
          <option value="${code}" ${code === currentLeague ? 'selected' : ''}>${name}</option>
        `).join('')}
      </select>
    </header>

    <div class="controls-bar">
      <div style="display: flex; gap: 0.5rem;">
        <button class="tab-btn ${activeTab === 'matches' ? 'active' : ''}" data-tab="matches">${t.tabMatches}</button>
        <button class="tab-btn ${activeTab === 'standings' ? 'active' : ''}" data-tab="standings">${t.tabStandings}</button>
      </div>

      ${activeTab === 'matches' ? `
        <div class="search-bar">
          <input type="text" id="search-input" placeholder="${t.searchPlaceholder}" value="${searchQuery}" />
        </div>
        <div class="filters">
          <button class="filter-btn ${currentFilter === 'ALL' ? 'active' : ''}" data-filter="ALL">${t.filterAll}</button>
          <button class="filter-btn ${currentFilter === 'SCHEDULED' ? 'active' : ''}" data-filter="SCHEDULED">${t.filterScheduled}</button>
          <button class="filter-btn ${currentFilter === 'LIVE' ? 'active' : ''}" data-filter="LIVE">${t.filterLive}</button>
          <button class="filter-btn ${currentFilter === 'FINISHED' ? 'active' : ''}" data-filter="FINISHED">${t.filterFinished}</button>
        </div>
      ` : ''}

      <div style="display: flex; gap: 0.25rem;">
        <button class="lang-btn ${lang === 'fr' ? 'active' : ''}" data-lang="fr">FR</button>
        <button class="lang-btn ${lang === 'en' ? 'active' : ''}" data-lang="en">EN</button>
      </div>
    </div>

    <main>
      ${activeTab === 'matches' ? `<div class="matches-list">${matchesHtml}</div>` : standingsHtml}
    </main>
  `
}