import { DB_COLLECTIONS } from "@/classes/constants"
import CustomError from "@/classes/customError"
import logger from "@/lib/logger"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findOne, update } from "@/util/dbUtil"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

const POST = async (req: NextRequest) => {

    const api = "APPROVE CASHOUT"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const { id } = await req.json()

        logRequest = {
            id
        }
        console.log('here!')
        const query = { _id: new ObjectId(id) }
        const fundingRequests = await findOne(DB_COLLECTIONS.CASHOUT_REQUESTS, query)

        console.log(fundingRequests)
        if (fundingRequests) {
            await update(DB_COLLECTIONS.CASHOUT_REQUESTS, query, { ...fundingRequests, status: 'APPROVED' })
        } else {
            throw new CustomError('No Data found', {
                'Not found': ['Request Not Found']
            })
        }
        logResponse = { message: 'Successfully Cashed Out!' }


        return NextResponse.json({ message: 'Successfully Cashed Out!' })
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
    POST
}