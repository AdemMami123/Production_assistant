// Small helper to centralize the backend API base URL.
// Uses NEXT_PUBLIC_API_URL when set (recommended for dev/prod),
// otherwise falls back to the local backend dev server.
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const apiUrl = (path: string) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`

export default API_BASE

// Safely parse a Response as JSON. If the response is not JSON, returns null
// and also returns the raw text for debugging.
export async function parseJsonSafe(response: Response) {
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      const json = await response.json()
      return { json, text: null }
    } catch (err) {
      const text = await response.text()
      return { json: null, text }
    }
  }

  const text = await response.text()
  return { json: null, text }
}

// Get authorization headers using the Supabase client session (if available)
export async function authHeaders(): Promise<Record<string, string>> {
  try {
    const mod = await import('@/lib/supabase/client')
    const supabase = mod.createClient()
    // Try to get the current session. In some cases (race on page load)
    // the session may not be immediately available. We'll wait up to
    // ~1 second polling for it before giving up.
    const start = Date.now()
    let token: string | undefined = undefined
    while (!token && Date.now() - start < 1000) {
      const { data } = await supabase.auth.getSession()
      token = (data as any)?.session?.access_token
      if (token) break
      // small delay
      await new Promise(r => setTimeout(r, 50))
    }
    if (token) return { Authorization: `Bearer ${token}` }
    return {}
  } catch (err) {
    // If anything fails, return empty headers
    return {}
  }
}
