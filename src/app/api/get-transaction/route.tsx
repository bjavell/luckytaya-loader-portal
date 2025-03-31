import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import logger from "@/lib/logger"
import { use } from "react"

const GET = async (req: NextRequest) => {
    const api = "GET TRANSACTION"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const currentSession = await getCurrentSession()

        const params = {
            userId: currentSession.userId,
            dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
            dateTimeTo: req.nextUrl.searchParams.get('endDate'),
        }


        logRequest = {
            ...params
        }


        const response = await otsEngine.get(`http://localhost:3003/history`, {
            params,
            headers: {
                'X-Correlation-ID': correlationId,
            }
        })

        // const response = await luckTayaAxios.get(`/api/v1/xAccountTransaction/GetTransByUserIdByDateV2`, {
        //     params,
        //     headers: {
        //         'X-Correlation-ID': correlationId,
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })

        // const customResponse = response.data.data.histories.map((e: any) => {

        //     const transaction = {
        //         ...e,
        //         fromFullName: `${e.fromFirstname} ${e.fromLastname}`,
        //         toFullName: `${e.toFirstname} ${e.toLastname}`
        //     }


        //     if (transaction.amount < 0) {
        //         transaction.amount *= -1
        //     }


        //     return transaction
        // }).sort((a: any, b: any) => {
        //     return b.transactionNumber - a.transactionNumber
        // })

        logResponse = {
            ...response.data.data.histories
        }
        return NextResponse.json(response.data.data.histories)
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

export { GET }