import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import logger from "@/lib/logger"
import { DB_COLLECTIONS } from "@/classes/constants"
import { findAll, findOne } from "@/util/dbUtil"
import { insertDecimalAtThirdToLast } from "@/util/textUtil"

const GET = async (req: NextRequest) => {
    const api = "GET CASHIN TRANSACTION REPORT"
    let correlationId: string | null = ''
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const params = {
            dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
            dateTimeTo: req.nextUrl.searchParams.get('endDate'),
        }
        const query = {
            tranType: 'cashin',
            transactionDate: {
                $gte: params.dateTimeFrom ?? '',
                $lte: params.dateTimeTo ?? ''
            }
        }

        const getAllPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, {})
        const cashin = await findAll(DB_COLLECTIONS.QR_TRANSACITON, query)

        const customResponse = cashin.map((e: any) => {
            const customerDetails = getAccount(e?.accountNumber, getAllPlayers)
            return {
                id: e._id.toString(),
                transactionId: e.request.msgId,
                transactionDate: e.transactionDate,
                accountNumber: e?.accountNumber,
                amount: parseFloat(insertDecimalAtThirdToLast(e.request.trxAmount)),
                status: e.status,
                fullName: `${customerDetails?.firstname ?? ''} ${customerDetails?.lastname ?? ''}`
            }
        })

        logResponse = {
            ...customResponse
        }
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


const getAccount = (accountNumber: string, users: any) => {

    let matchItem = users.find((user: any) => {
        return Number(user.accountNumber) === Number(accountNumber)
    })

    return matchItem ?? {
        firstname: '',
        lastname: ''
    }

}

export { GET }
