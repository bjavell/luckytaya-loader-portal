'use server'
import { SESSION_COOKIE_NAME } from "@/classes/constants"
import { decrypt, encrypt } from "@/util/cryptoUtil"
import { cookies } from "next/headers"


const getCurrentSession = async () => {
    const cookieStore = await cookies()
    const currentSession = cookieStore.get(SESSION_COOKIE_NAME)
    console.log('SESSION', currentSession?.value)
    if (currentSession?.value) {
        return JSON.parse(decrypt(currentSession.value))
    }
    return null
}

const setSession = async (session: any) => {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, encrypt(JSON.stringify(session)), { path: '/' })
}

const clearSession = async () => {
    const cookieStore = await cookies()
    cookieStore.delete(SESSION_COOKIE_NAME)
}

export {
    getCurrentSession,
    setSession,
    clearSession
}