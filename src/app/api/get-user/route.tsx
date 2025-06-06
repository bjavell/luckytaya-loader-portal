import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findOne } from "@/util/dbUtil"
import { DB_COLLECTIONS } from "@/classes/constants"
import logger from "@/lib/logger"

const GET = async (req: NextRequest) => {

    const api = "GET USERS"
    let correlationId
    let logRequest
    let logResponse
    let status = 200

    try {

        correlationId = req.headers.get('x-correlation-id');
        const accountNumber = req.nextUrl.searchParams.get('accountNumber')

        const currentSession = await getCurrentSession()


        logRequest = {
            url: {
                accountNumber
            }
        }



        const response = await luckTayaAxios.get(`/api/v1/UserAccount/AllPlayerAccount`, {
            headers: {
                'X-Correlation-ID': correlationId,
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const playerList = response.data

        const filteredPlayerList = playerList.filter((e: any) => {
            return e.accountNumber === Number(accountNumber)
        })

        const player = filteredPlayerList[0]

        const customResponse = {
            ...player
        }

        if (player) {
            const userData = await findOne(DB_COLLECTIONS.TAYA_USERS, { 'accountNumber': player.accountNumber })

            if (userData) {
                customResponse.email = userData.email
            }
        }

        if (filteredPlayerList.length > 0) {
            logResponse = {
                ...customResponse
            }
            return NextResponse.json(customResponse)
        }

        logResponse = {}
        return NextResponse.json({})
    } catch (e: any) {
        logger.error(api, {
            correlationId,
            error: e.message,
            errorStack: e.stack
        })

        status = 500
        logResponse = formatGenericErrorResponse(e)
        console.error(e)

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
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

export { GET }
