import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { NextRequest, NextResponse } from "next/server";

const PATCH = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()
        const { accountNumber, action } = await req.json()

        let response

        if (action === 'ADD') {
            response = await luckTayaAxios.post(`/api/v1/AccountMember`, { accountNumber },
                {
                    headers: {
                        'Authorization': `Bearer ${currentSession.token}`,
                    },
                })
        } else {
            response = await luckTayaAxios.delete(`/api/v1/AccountMember/${accountNumber}`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
        }

        return NextResponse.json({ message: 'Successfully Updated!' })
    } catch (e) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export {
    PATCH
}