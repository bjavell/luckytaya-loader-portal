import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {

    try {

        const currentSession = await getCurrentSession()
        const { roles, accountNumber, accountType, suspended, id } = await req.json()

        const request = {
            roles,
            accountNumber,
            accountType,
            suspended,
            userId: id
        }

        const response = await luckTayaAxios.put('/api/v1/User/UserRoleAccountTypeUpdate', request, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            }
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


export {
    POST
}