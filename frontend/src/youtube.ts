const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const CACHE_KEY_PREFIX = 'yt_highlight_'

export async function fetchMatchHighlight(
  homeTeam: string, 
  awayTeam: string, 
  matchDate?: string
): Promise<string | null> {
  if (!YOUTUBE_API_KEY) {
    console.warn("Clé d'API YouTube manquante dans le fichier .env")
    return null
  }

  // Nettoyage des suffixes (FC, AFC, etc.)
  const cleanHome = homeTeam.replace(/\s+(FC|AFC)$/i, '').trim()
  const cleanAway = awayTeam.replace(/\s+(FC|AFC)$/i, '').trim()

  // Extraction de l'année si la date est fournie (ex: "2026-09-22T..." -> "2026")
  const year = matchDate ? new Date(matchDate).getFullYear() : new Date().getFullYear()

  // Terme de recherche précis avec l'année
  const query = `Highlights ${cleanHome} vs ${cleanAway} ${year}`
  const cacheKey = `${CACHE_KEY_PREFIX}${cleanHome}_${cleanAway}_${year}`

  // 1. Vérifier le cache local
  const cachedVideoId = localStorage.getItem(cacheKey)
  if (cachedVideoId) {
    return cachedVideoId
  }

  try {
    const params = new URLSearchParams({
      part: 'snippet',
      q: query,
      type: 'video',
      maxResults: '1',
      key: YOUTUBE_API_KEY
    })

    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`)
    
    if (!response.ok) {
      const errorData = await response.json()
      console.error("❌ Détail de l'erreur Google :", errorData)
      return null
    }

    const data = await response.json()
    const videoId = data.items?.[0]?.id?.videoId

    if (videoId) {
      localStorage.setItem(cacheKey, videoId)
      return videoId
    }
  } catch (err) {
    console.error('Erreur recherche vidéo YouTube:', err)
  }

  return null
}