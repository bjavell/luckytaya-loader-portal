import { NextResponse } from "next/server"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import CustomError from "@/classes/customError"
import { findOne } from "@/util/dbUtil"
import { DB_COLLECTIONS } from "@/classes/constants"

const GET = async () => {
    try {
        const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })

        if (config) {
            const data = {
                cashInConFeeFixPlayer: config.cashInConFeeFixPlayer,
                cashInConFeePercentage: config.cashInConFeePercentage,
                cashInConFeeType: config.cashInConFeeType,
                cashOutConFeeType: config.cashOutConFeeType,
                cashInCommissionFee: config.cashInCommissionFee
            }

            return NextResponse.json(data)
        }
        throw new CustomError('No Data found', {
            'Not found': ['No Configuration Found']
        })
    } catch (e) {

        console.error(e)

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
