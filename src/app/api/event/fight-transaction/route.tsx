import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()

        const fightId =  req.nextUrl.searchParams.get('fightId');
        const response = await luckTayaAxios.get(`/api/v1/SabongBet/GetByFightId?fightId=${fightId}`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        console.log(response.data)
        return NextResponse.json(response.data)
    } catch (e) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
