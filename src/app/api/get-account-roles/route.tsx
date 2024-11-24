import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()

        const response = await luckTayaAxios.get(`/api/v1/User/GetRoleV2`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

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
