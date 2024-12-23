import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { NextRequest, NextResponse } from "next/server";

const PATCH = async (req: NextRequest) => {
    const api = "UPDATE MEMBER"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const currentSession = await getCurrentSession()
        const { accountNumber, action } = await req.json()

        logRequest = {
            accountNumber,
            action
        }

        if (action === 'ADD') {
            await luckTayaAxios.post(`/api/v1/AccountMember`, { accountNumber },
                {
                    headers: {
                        'X-Correlation-ID': correlationId,
                        'Authorization': `Bearer ${currentSession.token}`,
                    },
                })
        } else {
            await luckTayaAxios.delete(`/api/v1/AccountMember/${accountNumber}`, {
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
        }

        logResponse = { message: 'Successfully Updated!' }

        return NextResponse.json(logResponse)
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

export {
    PATCH
}