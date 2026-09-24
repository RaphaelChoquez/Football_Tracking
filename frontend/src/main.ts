import { renderAppLayout } from './render'
import './style.css'
import type { Match, TablePosition, Scorer } from './types'
import type { Language } from './i18n'
import { translations } from './i18n'
import { fetchMatchHighlight } from './youtube'

// Variables d'état
let activeTab: 'matches' | 'standings' | 'players' = 'matches'
let currentLeague = 'PL'
let currentFilter = 'ALL'
let searchQuery = ''
let currentLang: Language = 'fr'
let selectedMatch: Match | null = null
let currentSortBy: 'goals' | 'assists' = 'goals'
let currentVideoId: string | null = null

let allMatches: Match[] = []
let standingsTable: TablePosition[] = []
let topScorers: Scorer[] = []
let isLoading = true

const MATCHES_API_URL = 'http://localhost:5164/api/matches'
const STANDINGS_API_URL = 'http://localhost:5164/api/standings'
const SCORERS_API_URL = 'http://localhost:5164/api/players/scorers'

// Intervalle de rafraîchissement automatique (30 secondes)
const POLLING_INTERVAL_MS = 30000
let pollingIntervalId: ReturnType<typeof setInterval> | null = null

async function loadMatches(showLoading: boolean = true): Promise<void> {
  if (showLoading) {
    isLoading = true
    updateUI()
  }
  try {
    const url = new URL(MATCHES_API_URL)
    url.searchParams.set('code', currentLeague)
    const response = await fetch(url.toString())
    if (response.ok) {
      const data = await response.json()
      allMatches = data.matches || []
    }
  } catch (err) {
    console.error('Erreur chargement matchs:', err)
  } finally {
    if (showLoading) isLoading = false
    updateUI()
  }
}

async function loadStandings(): Promise<void> {
  isLoading = true
  updateUI()
  try {
    const url = new URL(STANDINGS_API_URL)
    url.searchParams.set('code', currentLeague)
    const response = await fetch(url.toString())
    if (response.ok) {
      const data = await response.json()
      standingsTable = data.standings?.[0]?.table || []
    }
  } catch (err) {
    console.error('Erreur chargement classement:', err)
  } finally {
    isLoading = false
    updateUI()
  }
}

async function loadTopScorers(): Promise<void> {
  isLoading = true
  updateUI()
  try {
    const url = new URL(SCORERS_API_URL)
    url.searchParams.set('code', currentLeague)
    const response = await fetch(url.toString())
    if (response.ok) {
      const data = await response.json()
      topScorers = data.scorers || []
    }
  } catch (err) {
    console.error('Erreur chargement buteurs:', err)
  } finally {
    isLoading = false
    updateUI()
  }
}

function startPolling(): void {
  if (pollingIntervalId !== null) return // déjà en cours

  pollingIntervalId = setInterval(() => {
    // On ne rafraîchit que si on regarde l'onglet "Matchs"
    // et qu'aucune modale n'est ouverte (pour ne pas perturber l'utilisateur)
    if (activeTab === 'matches' && !selectedMatch) {
      loadMatches(false) // false = pas de spinner, rafraîchissement silencieux
    }
  }, POLLING_INTERVAL_MS)
}

function stopPolling(): void {
  if (pollingIntervalId !== null) {
    clearInterval(pollingIntervalId)
    pollingIntervalId = null
  }
}

function updateUI(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  const filteredMatches = isLoading
    ? []
    : allMatches.filter((m) => {
        const matchesFilter =
          currentFilter === 'ALL' ||
          (currentFilter === 'SCHEDULED' && (m.status === 'SCHEDULED' || m.status === 'TIMED')) ||
          (currentFilter === 'LIVE' && (m.status === 'LIVE' || m.status === 'IN_PLAY')) ||
          (currentFilter === 'FINISHED' && m.status === 'FINISHED')

        const matchesSearch =
          m.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase())

        return matchesFilter && matchesSearch
      })

  appElement.innerHTML = renderAppLayout(
    activeTab,
    allMatches.length,
    filteredMatches,
    currentFilter,
    searchQuery,
    standingsTable,
    topScorers,
    currentLang,
    currentLeague,
    selectedMatch,
    currentSortBy,
    currentVideoId,
    isLoading
  )

  attachEvents()
}

function attachEvents(): void {
  // Choix de la ligue
  document.getElementById('league-select')?.addEventListener('change', (e) => {
    stopPolling() // évite qu'un rafraîchissement silencieux arrive avec l'ancienne ligue
    currentLeague = (e.target as HTMLSelectElement).value

    allMatches = []
    standingsTable = []
    topScorers = []
    selectedMatch = null
    currentVideoId = null

    isLoading = true
    updateUI()

    if (activeTab === 'matches') loadMatches()
    if (activeTab === 'standings') loadStandings()
    if (activeTab === 'players') loadTopScorers()

    startPolling()
  })

  // Navigation par onglets
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      const tab = target.getAttribute('data-tab') as 'matches' | 'standings' | 'players'
      if (tab) {
        activeTab = tab

        if (
          (activeTab === 'matches' && allMatches.length === 0) ||
          (activeTab === 'standings' && standingsTable.length === 0) ||
          activeTab === 'players'
        ) {
          isLoading = true
        }

        if (activeTab === 'matches' && allMatches.length === 0) loadMatches()
        if (activeTab === 'standings' && standingsTable.length === 0) loadStandings()
        if (activeTab === 'players') loadTopScorers()

        updateUI()
      }
    })
  })

  // Clic sur en-tête pour le tri
  document.querySelectorAll('.sortable-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      const sortType = target.getAttribute('data-sort') as 'goals' | 'assists'
      if (sortType) {
        currentSortBy = sortType
        updateUI()
      }
    })
  })

  // Filtres de statut
  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      currentFilter = target.getAttribute('data-filter') || 'ALL'
      updateUI()
    })
  })

  // Champ de recherche avec conservation du focus
  const searchInput = document.getElementById('search-input') as HTMLInputElement | null
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value
      updateUI()

      const newSearchInput = document.getElementById('search-input') as HTMLInputElement | null
      if (newSearchInput) {
        newSearchInput.focus()
        newSearchInput.setSelectionRange(searchQuery.length, searchQuery.length)
      }
    })
  }

  // Changement de langue
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      currentLang = (target.getAttribute('data-lang') as Language) || 'fr'
      updateUI()
    })
  })

  // Clic sur une carte de match
  document.querySelectorAll('.match-card').forEach((card) => {
    card.addEventListener('click', async () => {
      const matchId = Number(card.getAttribute('data-match-id'))
      const match = allMatches.find((m) => m.id === matchId)

      if (match) {
        selectedMatch = match
        currentVideoId = null
        updateUI()

        if (match.status === 'FINISHED' || match.status === 'FT') {
          const videoId = await fetchMatchHighlight(
            match.homeTeam.name,
            match.awayTeam.name,
            match.utcDate
          )

          if (selectedMatch && selectedMatch.id === match.id) {
            currentVideoId = videoId
            updateUI()
          }
        }
      }
    })
  })

  // Fermer la modale
  document.getElementById('modal-close')?.addEventListener('click', () => {
    selectedMatch = null
    currentVideoId = null
    updateUI()
  })

  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      selectedMatch = null
      currentVideoId = null
      updateUI()
    }
  })
}

// Pause le polling quand l'onglet du navigateur n'est pas visible (économise les requêtes)
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopPolling()
  } else {
    startPolling()
  }
})

// Lancement initial
loadMatches()
startPolling()