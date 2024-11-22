'use client'
import { useRouter } from "next/navigation"
import { useEffect } from "react"

const Customer404 = () => {
    const router = useRouter()
    useEffect(() => {
        router.push('/dashboard')
    }, [router])

    return null
}

export default Customer404