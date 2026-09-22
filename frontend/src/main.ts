import { renderAppLayout } from './render'
import './style.css'
import type { Match, TablePosition, Scorer } from './types'
import type { Language } from './i18n'
import { fetchMatchHighlight } from './youtube'

// Variables d'état
let activeTab: 'matches' | 'standings' | 'players' = 'matches'
let currentLeague = 'PL'
let currentFilter = 'ALL'
let searchQuery = ''
let currentLang: Language = 'fr'
let selectedMatch: Match | null = null
let currentSortBy: 'goals' | 'assists' = 'goals'
let currentVideoId: string | null = null // 👈 Stocke l'ID vidéo de la modale active

let allMatches: Match[] = []
let standingsTable: TablePosition[] = []
let topScorers: Scorer[] = []
let isLoading = true

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

  // Ne filtre les matchs QUE si le chargement est terminé
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

  // Transmet isLoading en 13ème argument !
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
    isLoading // 👈 13ème argument indispensable
  )

  attachEvents()
}

function attachEvents(): void {
// Choix de la ligue
// Choix de la ligue
  document.getElementById('league-select')?.addEventListener('change', (e) => {
    currentLeague = (e.target as HTMLSelectElement).value

    // 1. Réinitialiser toutes les données
    allMatches = []
    standingsTable = []
    topScorers = []
    selectedMatch = null
    currentVideoId = null

    // 2. FORCER L'ÉTAT DE CHARGEMENT AVANT D'APPELER L'API
    isLoading = true
    updateUI() // Affiche immédiatement "Chargement..." sans aucun clignotement

    // 3. Charger les données de la catégorie active
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
        
        // Si les données de l'onglet sont vides, active le chargement immédiatement
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

// Champ de recherche
const searchInput = document.getElementById('search-input') as HTMLInputElement | null
if (searchInput) {
  // Remet le curseur à la fin du texte si le composant s'est fait re-rendre
  if (document.activeElement !== searchInput && searchQuery) {
    searchInput.focus()
    searchInput.setSelectionRange(searchQuery.length, searchQuery.length)
  }

  searchInput.addEventListener('input', (e) => {
    searchQuery = (e.target as HTMLInputElement).value
    
    // Met uniquement à jour la liste des matchs SANS ré-exécuter isLoading ou re-détruire la page entière
    const matchesListContainer = document.querySelector('.matches-list')
    if (matchesListContainer) {
      const filtered = allMatches.filter((m) => {
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

      // Si aucun résultat après la saisie
      if (filtered.length === 0) {
        matchesListContainer.innerHTML = `<div style="text-align:center; padding: 3rem; color: var(--text-secondary);">${translations[currentLang].noMatches}</div>`
      } else {
        // Met à jour la liste en direct sans toucher au reste du DOM
        updateUI()
      }
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
        currentVideoId = null // Réinitialise la vidéo précédente
        updateUI() // Affiche immédiatement la modale

        //On cherche la vidéo UNIQUEMENT si le match est terminé
        if (match.status === 'FINISHED' || match.status === 'FT') {
          // On passe l'année/date via match.utcDate en 3e argument
          const videoId = await fetchMatchHighlight(
            match.homeTeam.name,
            match.awayTeam.name,
            match.utcDate
          )

          if (selectedMatch && selectedMatch.id === match.id) {
            currentVideoId = videoId
            updateUI() // Ré-affiche la modale avec le lecteur vidéo
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

// Lancement initial
loadMatches()
loadStandings()