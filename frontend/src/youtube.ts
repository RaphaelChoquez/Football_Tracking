// L'URL de ton backend ASP.NET Core (déployé sur Render, ou localhost en dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5164'
const CACHE_KEY_PREFIX = 'yt_highlight_'

export async function fetchMatchHighlight(
  homeTeam: string, 
  awayTeam: string, 
  matchDate?: string
): Promise<string | null> {
  // Nettoyage des suffixes (FC, AFC, etc.)
  const cleanHome = homeTeam.replace(/\s+(FC|AFC)$/i, '').trim()
  const cleanAway = awayTeam.replace(/\s+(FC|AFC)$/i, '').trim()

  // Extraction de l'année si la date est fournie (ex: "2026-09-22T..." -> "2026")
  const year = matchDate ? new Date(matchDate).getFullYear() : new Date().getFullYear()

  const cacheKey = `${CACHE_KEY_PREFIX}${cleanHome}_${cleanAway}_${year}`

  // 1. Vérifier le cache local
  const cachedVideoId = localStorage.getItem(cacheKey)
  if (cachedVideoId) {
    return cachedVideoId
  }

  try {
    const params = new URLSearchParams({
      home: cleanHome,
      away: cleanAway,
      year: String(year)
    })

    // Appel à notre propre backend, qui détient la clé YouTube côté serveur
    const response = await fetch(`${API_BASE_URL}/api/highlights?${params.toString()}`)

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      console.error('❌ Erreur du backend (highlights) :', errorData)
      return null
    }

    const data = await response.json()
    const videoId = data.videoId as string | null

    if (videoId) {
      localStorage.setItem(cacheKey, videoId)
      return videoId
    }
  } catch (err) {
    console.error('Erreur recherche vidéo YouTube:', err)
  }

  return null
}