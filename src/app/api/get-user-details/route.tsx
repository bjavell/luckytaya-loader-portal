import { getCurrentSession } from "@/context/auth"
import { NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async () => {
    try {
        const currentSession = await getCurrentSession()
        console.log(currentSession.token,'---------')
        const response = await luckTayaAxios.get(`/api/v1/UserAccount/MyAccount`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const responseData = response.data
        responseData.roles = currentSession.roles
        return NextResponse.json(responseData)
    } catch (e) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
