import { DB_COLLECTIONS } from "@/classes/constants";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { findAll } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {


    try {

        const fundingRequests = await findAll(DB_COLLECTIONS.FUNDING_REQUESTS, { status: 'Created' })

        return NextResponse.json(fundingRequests)
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