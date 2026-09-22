import './style.css'
import type { Match, TablePosition, StandingsResponse } from './types'
import { filterMatches } from './utils'
import { renderAppLayout } from './render'

const MATCHES_API_URL = 'http://localhost:5164/api/matches'
const STANDINGS_API_URL = 'http://localhost:5164/api/standings'

let activeTab: 'matches' | 'standings' = 'matches'
let allMatches: Match[] = []
let standingsTable: TablePosition[] = []
let currentFilter: string = 'ALL'
let searchQuery: string = ''

function updateUI(): void {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (!app) return

  const filteredMatches = filterMatches(allMatches, currentFilter, searchQuery)
  app.innerHTML = renderAppLayout(
    activeTab,
    allMatches.length,
    filteredMatches,
    currentFilter,
    searchQuery,
    standingsTable
  )

  // Écouteurs pour les onglets
  const tabButtons = app.querySelectorAll<HTMLButtonElement>('.tab-btn')
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab') as 'matches' | 'standings'
      if (tab && tab !== activeTab) {
        activeTab = tab
        if (activeTab === 'standings' && standingsTable.length === 0) {
          loadStandings()
        } else {
          updateUI()
        }
      }
    })
  })

  // Écouteur pour la recherche en temps réel (si vue matchs)
  const searchInput = app.querySelector<HTMLInputElement>('#search-input')
  if (searchInput) {
    searchInput.focus()
    searchInput.setSelectionRange(searchInput.value.length, searchInput.value.length)
    searchInput.addEventListener('input', (e) => {
      searchQuery = (e.target as HTMLInputElement).value
      updateUI()
    })
  }

  // Écouteurs pour les filtres (si vue matchs)
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
  try {
    const response = await fetch(MATCHES_API_URL)
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`)
    const data: { matches: Match[] } = await response.json()
    allMatches = data.matches
    updateUI()
  } catch (error) {
    console.error('Erreur matchs:', error)
  }
}

async function loadStandings(): Promise<void> {
  const app = document.querySelector<HTMLDivElement>('#app')
  if (app && standingsTable.length === 0) {
    // Petit message de chargement temporaire si nécessaire
  }

  try {
    const response = await fetch(STANDINGS_API_URL)
    if (!response.ok) throw new Error(`Erreur HTTP ${response.status}`)
    const data: StandingsResponse = await response.json()
    
    // Récupérer la table de type 'TOTAL'
    const totalStanding = data.standings.find((s) => s.type === 'TOTAL')
    if (totalStanding) {
      standingsTable = totalStanding.table
    }
    updateUI()
  } catch (error) {
    console.error('Erreur classement:', error)
  }
}

loadMatches()