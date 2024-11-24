import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()

        const eventId =  req.nextUrl.searchParams.get('eventId');
        const response = await luckTayaAxios.get(`/api/v1/SabongBet/GetByEventId?eventId=${eventId}`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })
       

        return NextResponse.json(response.data)
    } catch (e) {
        console.log(e,'hell0')
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
