import { formatGenericErrorResponse } from "@/util/commonResponse";
import { NextRequest, NextResponse } from "next/server";

const POST = (req: NextRequest) => {

    try {

    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }

}

export {
    POST
}