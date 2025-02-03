import { DB_COLLECTIONS } from "@/classes/constants"
import { getCurrentSession } from "@/context/auth"
import logger from "@/lib/logger"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findAll } from "@/util/dbUtil"
import { NextRequest, NextResponse } from "next/server"

const GET = async (req: NextRequest) => {
    const api = "GET COMMISSION"
    let correlationId
    let logRequest
    let logResponse
    let status = 200

    try {
        correlationId = req.headers.get('x-correlation-id');

        const currentSession = await getCurrentSession()

        const { accountType } = currentSession

        const query = { commissions: { $exists: true } }
        const commissions = await findAll(DB_COLLECTIONS.EVENTS, query)


        const customResponse = commissions.map((e: any) => {
            return {
                eventId: e.eventId,
                eventName: e.eventName,
                sales: e.totalSales,
                commission: accountType === 6 ? e.commissions.agentCommission : e.commissions.maCommission,
            }
        }).toSorted((a, b) => a.eventId - b.eventId)

        return NextResponse.json(customResponse)
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