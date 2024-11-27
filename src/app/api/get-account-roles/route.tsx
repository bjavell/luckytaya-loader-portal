import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()

        // const response = await luckTayaAxios.get(`/api/v1/User/GetRoleV2`, {
        //     headers: {
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })


        // "admin",
        // "finance",
        // "operator",
        // "acctmgr",
        // "eventmgr",
        // "licensing",
        // "acctmgrjc",
        // "master"

        const roles = [{
            key: 'admin',
            description: 'Admin'
        }, {
            key: 'acctmgr',
            description: 'Account Manager'
        }, {
            key: 'eventmgr',
            description: 'Event Manager'
        },{
            key: 'operator',
            description: 'Finance'
        },]

        return NextResponse.json(roles)
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
