import { clearSession, getCurrentSession } from "@/context/auth"
import logger from "@/lib/logger"
import { luckTayaAxios } from "@/util/axiosUtil"
import { NextRequest, NextResponse } from "next/server"

const POST = async (req: NextRequest) => {

    const api = "SIGNOUT"
    let correlationId
    const logRequest = {}
    const logResponse = {}
    let status = 200
    try {

        correlationId = req.headers.get('x-correlation-id');

        const currentSession = await getCurrentSession()
        await luckTayaAxios.get(`/api/v1/User/Logout`, {
            headers: {
                'X-Correlation-ID': correlationId,
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })
    } catch (e: any) {
        status = 500
        logger.error(api, {
            correlationId,
            error: e.message,
            errorStack: e.stack
        })

    } finally {
        logger.info(api, {
            correlationId,
            apiLog: {
                status,
                request: logRequest,
                response: logResponse,
            }
        })

    }
    await clearSession()

    return NextResponse.json({})
    // res.setHeader("set-cookie", `session=; path=/; samesite=lax; httponly;`)
    // res.status(200).json({})
}

export {
    POST
}
