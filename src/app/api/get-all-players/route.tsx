import { getCurrentSession } from "@/context/auth"
import { NextResponse } from "next/server"
import { luckTayaAxios } from "@/helper/config"
import { formatGenericErrorResponse } from "@/helper/commonResponse"

const GET = async (req: Request) => {
    try {
        const currentSession = await getCurrentSession()

        const response = await luckTayaAxios.get(`${process.env.LUCKY_TAYA_BASE_URL}/api/v1/UserAccount/AllPlayerAccount`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        return NextResponse.json(response.data)
    } catch (e: any) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
