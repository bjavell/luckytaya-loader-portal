import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { USER_TYPE } from "@/classes/constants"

const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()
        const type = req.nextUrl.searchParams.get('type')

        let response
        if (type === USER_TYPE.MANAGEMENT) {
            response = await luckTayaAxios.get(`/api/v1/User/MgmtRole`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
        } else {
            response = await luckTayaAxios.get(`/api/v1/User/PlayerRole`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
        }

        return NextResponse.json(response.data)
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
