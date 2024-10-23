import Cookies from 'js-cookie'

const SESSION_COOKIE_NAME = 'session'

const getCurrentSession = () => {
    const currentSession = Cookies.get(SESSION_COOKIE_NAME)
    if (currentSession)
        return JSON.parse(currentSession)

    return currentSession
}

const setSession = (session: any) => {
    Cookies.set(SESSION_COOKIE_NAME, JSON.stringify(session), { path: '/' })
}

const clearSession = () => {
    Cookies.remove(SESSION_COOKIE_NAME)
}

export {
    getCurrentSession,
    setSession,
    clearSession
}