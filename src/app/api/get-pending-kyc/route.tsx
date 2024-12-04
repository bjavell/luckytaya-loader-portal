import { DB_COLLECTIONS } from "@/classes/constants"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findAll } from "@/util/dbUtil"
import { NextResponse } from "next/server"

const GET = async () => {
    try {

        const pendingReKyc = await findAll(DB_COLLECTIONS.TAYA_USERS, { status: 'PENDING' })

        if (pendingReKyc) {

            return NextResponse.json({ count: pendingReKyc.length })
        }

        return NextResponse.json({ count: 0 })

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