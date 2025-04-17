import { DB_COLLECTIONS } from "@/classes/constants"
import { getCurrentSession } from "@/context/auth"
import logger from "@/lib/logger"
import { otsEngine } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findAll } from "@/util/dbUtil"
import { NextRequest, NextResponse } from "next/server"

const GET = async (req: NextRequest) => {
    const api = "GET PENDING KYC"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const currentSession = await getCurrentSession()

        const response = await otsEngine.get(`${process.env.OTS_USER_URL}/user`, {
            params: {
                type: 'player',
                status: 'PENDING',
            },
            headers: {
                "x-correlation-id": correlationId,
                Authorization: `Bearer ${currentSession.accessToken}`,
            }
        })

        if (response.data.success) {
            logResponse = { count: response.data.data.users.length }
            return NextResponse.json({ count: response.data.data.users.length })
        }


        // const pendingReKyc = await findAll(DB_COLLECTIONS.TAYA_USERS, { status: 'PENDING' })

        // if (pendingReKyc) {
        //     logResponse = { count: pendingReKyc.length }

        //     return NextResponse.json(logResponse)
        // }

        logResponse = { count: 0 }
        return NextResponse.json({ count: 0 })

    } catch (e: any) {
        logger.error(api, {
            correlationId,
            error: e.message,
            errorStack: e.stack
        })

        status = 500
        logResponse = formatGenericErrorResponse(e)
        return NextResponse.json({
            error: logResponse
        }, {
            status: 500
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

}

export {
    GET
}