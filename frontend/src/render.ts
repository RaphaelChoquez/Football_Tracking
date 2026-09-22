import './style.css'
import type { Match, TablePosition, Scorer } from './types'
import type { Language } from './i18n'
import { translations } from './i18n'

export function renderAppLayout(
  activeTab: 'matches' | 'standings' | 'players',
  _allCount: number,
  filteredMatches: Match[],
  currentFilter: string,
  searchQuery: string,
  standingsTable: TablePosition[],
  topScorers: Scorer[],
  lang: Language,
  currentLeague: string,
  selectedMatch: Match | null,
  sortBy: 'goals' | 'assists' = 'goals',
  highlightVideoId: string | null = null,
  isLoading: boolean = false // 👈 13e argument ajouté ici !
): string {
  const t = translations[lang]

  // Trier les joueurs selon la sélection
  const sortedScorers = [...topScorers].sort((a, b) => {
    const valA = sortBy === 'assists' ? (a.assists ?? 0) : (a.goals ?? (a as any).goalsCount ?? 0)
    const valB = sortBy === 'assists' ? (b.assists ?? 0) : (b.goals ?? (b as any).goalsCount ?? 0)
    return valB - valA
  })

  // 1. Liste des Matchs (Gestion du chargement VS aucun résultat)
  let matchesHtml = ''
  if (isLoading) {
    matchesHtml = `<div style="text-align:center; padding: 3rem; color: var(--text-secondary);">${t.loading}</div>`
  } else if (filteredMatches.length === 0) {
    matchesHtml = `<div style="text-align:center; padding: 3rem; color: var(--text-secondary);">${t.noMatches}</div>`
  } else {
    matchesHtml = filteredMatches.map((m) => {
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
          ${m.status === 'FINISHED' ? `<div class="view-stats-hint">${t.clickStatsHint}</div>` : ''}
        </div>
      `
    }).join('')
  }

  // 2. Tableau du Classement
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

  // 3. Tableau des Buteurs (avec tri et alignement corrigé)
  const playersHtml = sortedScorers.length === 0
    ? `<div style="text-align:center; padding: 3rem; color: var(--text-secondary);">${t.loading}</div>`
    : `
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th style="text-align:left;">${t.thPlayer}</th>
            <th style="text-align:left;">${t.thTeam}</th>
            <th>${t.thMatches}</th>
            <th class="sortable-header ${sortBy === 'goals' ? 'active' : ''}" data-sort="goals" style="cursor:pointer;">
              ${t.thGoals} ${sortBy === 'goals' ? '▼' : ''}
            </th>
            <th class="sortable-header ${sortBy === 'assists' ? 'active' : ''}" data-sort="assists" style="cursor:pointer;">
              ${t.thAssists} ${sortBy === 'assists' ? '▼' : ''}
            </th>
          </tr>
        </thead>
        <tbody>
          ${sortedScorers.map((s, idx) => {
            const goals = s.goals ?? (s as any).goalsCount ?? 0
            const matches = s.playedMatches ?? '-'
            const assists = s.assists ?? 0

            return `
              <tr>
                <td style="vertical-align: middle;"><strong>${idx + 1}</strong></td>
                <td style="text-align:left; vertical-align: middle;">
                  <strong>${s.player.name}</strong>
                  <div style="font-size:0.75rem; color:var(--text-secondary);">${s.player.nationality || ''}</div>
                </td>
                <td style="text-align:left; vertical-align: middle;">
                  <div style="display: flex; align-items: center; gap: 0.5rem;">
                    ${s.team.crest ? `<img src="${s.team.crest}" class="team-crest" alt="" style="width:20px; height:20px; object-fit:contain;" />` : ''}
                    <span>${s.team.name}</span>
                  </div>
                </td>
                <td style="vertical-align: middle;">${matches}</td>
                <td style="vertical-align: middle;"><strong style="color: ${sortBy === 'goals' ? 'var(--accent-color, #3b82f6)' : 'inherit'};">${goals}</strong></td>
                <td style="vertical-align: middle;"><strong style="color: ${sortBy === 'assists' ? 'var(--accent-color, #3b82f6)' : 'inherit'};">${assists}</strong></td>
              </tr>
            `
          }).join('')}
        </tbody>
      </table>
    `

  // 4. Modale Statistiques + Vidéo Résumé YouTube
  const modalHtml = selectedMatch ? `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal-content">
        <button class="modal-close" id="modal-close">&times;</button>
        <h2>${t.modalTitle}</h2>
        <div class="modal-match-header">
          <div class="modal-team">
            ${selectedMatch.homeTeam.crest ? `<img src="${selectedMatch.homeTeam.crest}" />` : ''}
            <h3>${selectedMatch.homeTeam.name}</h3>
          </div>
          <div class="modal-score">
            <span>${selectedMatch.score?.fullTime?.home ?? 0} - ${selectedMatch.score?.fullTime?.away ?? 0}</span>
            <small>${selectedMatch.status}</small>
          </div>
          <div class="modal-team">
            ${selectedMatch.awayTeam.crest ? `<img src="${selectedMatch.awayTeam.crest}" />` : ''}
            <h3>${selectedMatch.awayTeam.name}</h3>
          </div>
        </div>

        ${selectedMatch.status === 'FINISHED' ? `
          <div class="video-container" style="margin-top: 1.5rem; text-align: center;">
            <h4 style="margin-bottom: 0.75rem; color: var(--text-primary, #ffffff);">${t.videoHighlightTitle}</h4>${highlightVideoId ? `
              <div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 8px;">
                <iframe 
                  src="https://www.youtube.com/embed/${highlightVideoId}" 
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowfullscreen>
                </iframe>
              </div>
            ` : `<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 1rem;">${t.videoLoading}</p>`}
          </div>
        ` : ''}

        <div class="modal-stats-list" style="margin-top: 1.5rem;">
          <div class="stat-row">
            <span>${t.modalMatchDate}</span>
            <strong>${formatDate(selectedMatch.utcDate, lang)}</strong>
          </div>
          ${selectedMatch.status === 'FINISHED' ? `
            <div class="stat-row">
              <span>${t.modalHalfTimeScore}</span>
              <strong>${selectedMatch.score?.halfTime?.home ?? 0} - ${selectedMatch.score?.halfTime?.away ?? 0}</strong>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  ` : ''

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
        <button class="tab-btn ${activeTab === 'players' ? 'active' : ''}" data-tab="players">${t.tabPlayers}</button>
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
      ${activeTab === 'matches' ? `<div class="matches-list">${matchesHtml}</div>` : ''}
      ${activeTab === 'standings' ? standingsHtml : ''}
      ${activeTab === 'players' ? playersHtml : ''}
    </main>

    ${modalHtml}
  `
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