import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import logger from "@/lib/logger"

const GET = async (req: NextRequest) => {
    const api = "GET ACCOUNT ROLES"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
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
        }, {
            key: 'operator',
            description: 'Finance'
        },]

        logResponse = roles
        return NextResponse.json(roles)
    } catch (e: any) {
        logger.error(api, {
            correlationId,
            error: e.message,
            errorStack: e.stack
        })

        status = 500
        logResponse = formatGenericErrorResponse(e)
        return NextResponse.json({
            error: logResponse
        }, {
            status: 500
        })
    } finally {
        logger.info(api, {
            correlationId,
            apiLog: {
                status,
                request: logRequest,
                response: logResponse,
            }
        })

    }
}

export { GET }
