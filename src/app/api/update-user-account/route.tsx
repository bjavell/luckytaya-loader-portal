import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {

    try {

        const currentSession = await getCurrentSession()
        const { accountNumber, accountType, suspended, id } = await req.json()

        let roles
        if (accountType === 3 || accountType === 6) {
            roles = ['acctmgr']
        } else if (accountType === 4 || accountType === 5) {
            roles = ['eventmgr']
        } else if (accountType === 1) {
            roles = ['finance']
        }
        console.log(typeof accountNumber)

        const request = {
            roles,
            accountNumber,
            accountType,
            suspended,
            userId: id
        }

        console.log(request)

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