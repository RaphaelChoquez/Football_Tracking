const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const CACHE_KEY_PREFIX = 'yt_highlight_'

export async function fetchMatchHighlight(homeTeam: string, awayTeam: string): Promise<string | null> {
  const query = `Highlights ${homeTeam} vs ${awayTeam}`
  const cacheKey = `${CACHE_KEY_PREFIX}${homeTeam}_${awayTeam}`

  // 1. Vérifier si l'ID vidéo est déjà en cache (évite de consommer l'API inutilement)
  const cachedVideoId = localStorage.getItem(cacheKey)
  if (cachedVideoId) {
    return cachedVideoId
  }

  try {
    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('q', query)
    url.searchParams.set('type', 'video')
    url.searchParams.set('maxResults', '1')
    url.searchParams.set('key', YOUTUBE_API_KEY)

    const response = await fetch(url.toString())
    if (!response.ok) return null

    const data = await response.json()
    const videoId = data.items?.[0]?.id?.videoId

    if (videoId) {
      // Sauvegarder dans le cache local
      localStorage.setItem(cacheKey, videoId)
      return videoId
    }
  } catch (err) {
    console.error('Erreur recherche vidéo YouTube:', err)
  }

  return null
}