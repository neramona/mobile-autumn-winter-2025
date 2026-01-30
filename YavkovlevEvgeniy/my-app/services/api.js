const BASE_URL = 'https://cloud.kit-imi.info/api'

let authToken = null

export function setAuthToken(token) {
  authToken = token
}

export function clearAuthToken() {
  authToken = null
}

async function parseJsonSafe(res) {
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (e) {
    return text
  }
}

export async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
  const headers = { Accept: 'application/json', ...(options.headers || {}) }

  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(options.body)
  }

  if (authToken) headers['Authorization'] = `Bearer ${authToken}`


  let res
  try {
    res = await fetch(url, { ...options, headers })
  } catch (networkErr) {
    const err = new Error(networkErr.message || 'Network error')
    err.status = 0
    err.body = { error: networkErr.message }
    throw err
  }

  const body = await parseJsonSafe(res)


  if (!res.ok) {
    let message = ''
    if (body && typeof body === 'object') {
      if (body.message) message = body.message
      else if (body.error) message = body.error
      else message = JSON.stringify(body)
    } else {
      message = String(body || res.statusText || 'Request failed')
    }
    message = `${res.status}: ${message}`
    const err = new Error(message)
    err.status = res.status
    err.body = body
    throw err
  }

  return body
}

export default { request, setAuthToken, clearAuthToken }
