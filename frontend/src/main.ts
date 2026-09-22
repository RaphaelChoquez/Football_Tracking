import './style.css'
import type { Match, TablePosition, StandingsResponse } from './types'
import type { Language } from './i18n'
import { filterMatches } from './utils'
import { renderAppLayout } from './render'

const MATCHES_API_URL = 'http://localhost:5164/api/matches'
const STANDINGS_API_URL = 'http://localhost:5164/api/standings'

let activeTab: 'matches' | 'standings' = 'matches'
let currentLeague: string = 'PL'
let allMatches: Match[] = []
let standingsTable: TablePosition[] = []
let currentFilter: string = 'ALL'
let searchQuery: string = ''
let currentLang: Language = 'fr'
let selectedMatch: Match | null = null
let isLoading: boolean = false

function updateUI(): void {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (!app) return

  const filteredMatches = filterMatches(allMatches, currentFilter, searchQuery)
  
  app.innerHTML = renderAppLayout(
    activeTab,
    allMatches.length,
    isLoading ? [] : filteredMatches,
    currentFilter,
    searchQuery,
    standingsTable,
    currentLang,
    currentLeague,
    selectedMatch
  )

  if (isLoading && activeTab === 'matches') {
    const listEl = app.querySelector('.matches-list') || app.querySelector('.controls-bar')?.nextElementSibling
    if (listEl) {
      listEl.innerHTML = `<p style="text-align:center; padding: 2rem; color: var(--text-muted);">Chargement des matchs pour ${currentLeague}...</p>`
    }
  }

  // Changement de ligue
  const leagueSelect = app.querySelector<HTMLSelectElement>('#league-select')
  if (leagueSelect) {
    leagueSelect.addEventListener('change', (e) => {
      const newLeague = (e.target as HTMLSelectElement).value
      if (newLeague === currentLeague) return

      currentLeague = newLeague
      allMatches = []
      standingsTable = []
      selectedMatch = null
      
      // Réinitialiser la recherche et les filtres
      currentFilter = 'ALL'
      searchQuery = ''

      if (activeTab === 'matches') {
        loadMatches()
      } else {
        loadStandings()
      }
    })
  }

  // Changement de langue
  const langButtons = app.querySelectorAll<HTMLButtonElement>('.lang-btn')
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const lang = btn.getAttribute('data-lang') as Language
      if (lang) {
        currentLang = lang
        updateUI()
      }
    })
  })

  // Changement d'onglet
  const tabButtons = app.querySelectorAll<HTMLButtonElement>('.tab-btn')
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') as 'matches' | 'standings'
      if (tab && tab !== activeTab) {
        activeTab = tab
        if (activeTab === 'standings' && standingsTable.length === 0) {
          loadStandings()
        } else if (activeTab === 'matches' && allMatches.length === 0) {
          loadMatches()
        } else {
          updateUI()
        }
      }
    })
  })

  // Modale détails
  const cards = app.querySelectorAll<HTMLDivElement>('.match-card')
  cards.forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.getAttribute('data-match-id')
      if (id) {
        selectedMatch = allMatches.find((m) => m.id === Number(id)) || null
        updateUI()
      }
    })
  })

  const closeBtn = app.querySelector('#modal-close')
  const overlay = app.querySelector('#modal-overlay')
  if (closeBtn) closeBtn.addEventListener('click', () => { selectedMatch = null; updateUI(); })
  if (overlay) overlay.addEventListener('click', (e) => { if (e.target === overlay) { selectedMatch = null; updateUI(); } })

  // Recherche & Filtres
  const searchInput = app.querySelector<HTMLInputElement>('#search-input')
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value
      updateUI()
      const updatedInput = document.querySelector<HTMLInputElement>('#search-input')
      if (updatedInput) {
        updatedInput.focus()
        updatedInput.setSelectionRange(searchQuery.length, searchQuery.length)
      }
    })
  }

  const filterButtons = app.querySelectorAll<HTMLButtonElement>('.filter-btn')
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter')
      if (filter) {
        currentFilter = filter
        updateUI()
      }
    })
  })
}

async function loadMatches(): Promise<void> {
  isLoading = true
  updateUI()

  try {
    // Construction explicite de l'URL avec le paramètre de ligue
    const url = new URL(MATCHES_API_URL)
    url.searchParams.set('code', currentLeague)

    console.log(`[Fetch] Appel de l'API : ${url.toString()}`)

    const response = await fetch(url.toString())
    if (!response.ok) {
      console.error(`Erreur HTTP ${response.status} pour la ligue${currentLeague}`)
      allMatches = []
    } else {
      const data: { matches: Match[] } = await response.json()
      console.log(`[Succès] Matchs reçus pour ${currentLeague}:`, data.matches)
      allMatches = data.matches || []
    }
  } catch (error) {
    console.error('Erreur réseau matchs:', error)
    allMatches = []
  } finally {
    isLoading = false
    updateUI()
  }
}

async function loadStandings(): Promise<void> {
  isLoading = true
  updateUI()

  try {
    const response = await fetch(`${STANDINGS_API_URL}?code=${currentLeague}`)
    if (!response.ok) {
      console.error(`Erreur classement HTTP ${response.status} pour ${currentLeague}`)
      standingsTable = []
    } else {
      const data: StandingsResponse = await response.json()
      const totalStanding = data.standings?.find((s) => s.type === 'TOTAL')
      standingsTable = totalStanding ? totalStanding.table : []
    }
  } catch (error) {
    console.error('Erreur réseau classement:', error)
    standingsTable = []
  } finally {
    isLoading = false
    updateUI()
  }
}

loadMatches()