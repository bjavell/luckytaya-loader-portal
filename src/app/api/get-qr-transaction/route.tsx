import { formatGenericErrorResponse } from "@/util/commonResponse"
import { NextRequest, NextResponse } from "next/server"
import { findOne } from "@/util/dbUtil"
import { DB_COLLECTIONS } from "@/classes/constants"

const GET = async (req: NextRequest) => {

    try {

        const  msgId = req.nextUrl.searchParams.get('msgId')

        const transaction = await findOne(DB_COLLECTIONS.QR_TRANSACITON, { 'request.msgId': msgId })

        if (transaction) {
            const response = {
                status : transaction.status
            }
            return NextResponse.json(response)
        }

    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }
}

export {
    GET
}