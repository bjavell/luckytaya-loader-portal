import { getCurrentSession } from "@/context/auth"
import { NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async () => {
    try {
        const currentSession = await getCurrentSession()

        const response = await luckTayaAxios.get(`/api/v1/UserAccount/AllPlayerAccount`, {
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
