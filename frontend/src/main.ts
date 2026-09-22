import { renderAppLayout } from './render'
import './style.css'
import type { Match, TablePosition, Scorer } from './types'
import type { Language } from './i18n'

// Variables d'état (déclarées UNE SEULE FOIS)
let activeTab: 'matches' | 'standings' | 'players' = 'matches'
let currentLeague = 'PL'
let currentFilter = 'ALL'
let searchQuery = ''
let currentLang: Language = 'fr'
let selectedMatch: Match | null = null
let currentSortBy: 'goals' | 'assists' = 'goals' // État de tri par défaut

let allMatches: Match[] = []
let standingsTable: TablePosition[] = []
let topScorers: Scorer[] = []
let isLoading = false

const MATCHES_API_URL = 'http://localhost:5164/api/matches'
const STANDINGS_API_URL = 'http://localhost:5164/api/standings'
const SCORERS_API_URL = 'http://localhost:5164/api/players/scorers'

async function loadMatches(): Promise<void> {
  isLoading = true
  updateUI()
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
    isLoading = false
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

function updateUI(): void {
  const appElement = document.getElementById('app')
  if (!appElement) return

  const filteredMatches = allMatches.filter((m) => {
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

  // Appel de la vue avec le 11e argument : currentSortBy
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
    currentSortBy
  )

  attachEvents()
}

function attachEvents(): void {
  // Choix de la ligue
  document.getElementById('league-select')?.addEventListener('change', (e) => {
    currentLeague = (e.target as HTMLSelectElement).value
    if (activeTab === 'matches') loadMatches()
    if (activeTab === 'standings') loadStandings()
    if (activeTab === 'players') loadTopScorers()
  })

  // Navigation par onglets
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement
      const tab = target.getAttribute('data-tab') as 'matches' | 'standings' | 'players'
      if (tab) {
        activeTab = tab
        if (activeTab === 'matches' && allMatches.length === 0) loadMatches()
        if (activeTab === 'standings' && standingsTable.length === 0) loadStandings()
        if (activeTab === 'players') loadTopScorers()
        updateUI()
      }
    })
  })

  // Clic sur en-tête pour le tri (Buts / Passes d.)
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

  // Champ de recherche
  document.getElementById('search-input')?.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value
    updateUI()
  })

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
    card.addEventListener('click', () => {
      const matchId = Number(card.getAttribute('data-match-id'))
      selectedMatch = allMatches.find((m) => m.id === matchId) || null
      updateUI()
    })
  })

  // Fermer la modale
  document.getElementById('modal-close')?.addEventListener('click', () => {
    selectedMatch = null
    updateUI()
  })

  document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
      selectedMatch = null
      updateUI()
    }
  })
}

// Lancement initial
loadMatches()
loadStandings()