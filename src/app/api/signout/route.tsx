import { clearSession, getCurrentSession } from "@/context/auth"
import { luckTayaAxios } from "@/util/axiosUtil"
import { NextResponse } from "next/server"

const POST = async () => {

    try {

        const currentSession = await getCurrentSession()
        await luckTayaAxios.post(`/api/v1/User/Logout`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })
    } catch (e) {

    }
    await clearSession()

    return NextResponse.json({})
    // res.setHeader("set-cookie", `session=; path=/; samesite=lax; httponly;`)
    // res.status(200).json({})
}

export {
    POST
}
