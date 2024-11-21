import { clearSession, getCurrentSession } from "@/context/auth"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { NextResponse } from "next/server"

const POST = async () => {

    try {

        const currentSession = await getCurrentSession()

        await luckTayaAxios.get(`/api/v1/User/Logout`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        await clearSession()
        return NextResponse.json({})
    } catch (e) {

        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        }, {
            status: 500
        })
    }
    // res.setHeader("set-cookie", `session=; path=/; samesite=lax; httponly;`)
    // res.status(200).json({})
}

export {
    POST
}
