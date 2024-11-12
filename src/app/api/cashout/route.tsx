import { getCurrentSession } from "@/context/auth"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { luckTayaAxios } from "@/util/axiosUtil"
import { NextRequest, NextResponse } from "next/server"

const POST = async (req: NextRequest) => {

    try {
        const currentSession = await getCurrentSession()

        const { amount, toAccountNumber } = await req.json()
        const request = {
            amount,
            toAccountNumber
        }

        const response = await luckTayaAxios.post(`${process.env.LUCKY_TAYA_BASE_URL}/api/v1/Account/cashInV2`, request, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })
        return NextResponse.json(response.data)
    } catch (e) {
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }
}

export {
    POST
}