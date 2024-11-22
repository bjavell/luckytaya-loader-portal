import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()
          // const params = {
        //     dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
        //     dateTimeTo: req.nextUrl.searchParams.get('endDate'),
        // }
        const venueId =  req.nextUrl.searchParams.get('venueId');
        const response = await luckTayaAxios.get(`/api/v1/SabongVenue/${venueId}`, {
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

export { GET }
