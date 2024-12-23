import { NextRequest, NextResponse } from "next/server"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import CustomError from "@/classes/customError"
import { findOne } from "@/util/dbUtil"
import { DB_COLLECTIONS } from "@/classes/constants"
import logger from "@/lib/logger"

const GET = async (req: NextRequest) => {
    const api = "GET LOADING STATION CONFIG"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })

        if (config) {
            const data = {
                cashInConFeeFixPlayer: config.cashInConFeeFixPlayer,
                cashInConFeePercentage: config.cashInConFeePercentage,
                cashInConFeeType: config.cashInConFeeType,
                cashOutConFeeType: config.cashOutConFeeType,
                cashInCommissionFee: config.cashInCommissionFee,
                commissionFeePercentage: config.commissionFeePercentage,
                commissionFeeType: config.commissionFeeType,

            }

            logResponse = data
            return NextResponse.json(data)
        }
        throw new CustomError('No Data found', {
            'Not found': ['No Configuration Found']
        })
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
