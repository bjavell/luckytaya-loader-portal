import { getCurrentSession } from "@/context/auth"
import { NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import db from "@/lib/mongodb"
import CustomError from "@/classes/customError"

const GET = async () => {
    try {
        const database = await db()
        const collection = database.collection('config')
        const config = await collection.findOne({ code: 'CFG0001' })

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
