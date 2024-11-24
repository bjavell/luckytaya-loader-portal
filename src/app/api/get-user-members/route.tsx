import { getCurrentSession } from "@/context/auth"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { NextResponse } from "next/server"


const GET = async() => {
    try {
        const currentSession = await getCurrentSession()

        const directMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/Direct`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })
        const indirectMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/Indirect`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })
        const orphanMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/OrphanAccount`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        
        const response ={
            direct: directMemberResponse.data,
            indirect: indirectMemberResponse.data,
            orphan: orphanMemberResponse.data
        }

        return NextResponse.json(response)
    } catch (e) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export {
    GET
}