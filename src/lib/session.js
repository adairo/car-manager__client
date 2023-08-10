export function setSession(token) {
  sessionStorage.setItem('session', token)
}

export function getSession() {
  return sessionStorage.getItem('session')
}

export function clearSession() {
  return sessionStorage.removeItem('session')
}
