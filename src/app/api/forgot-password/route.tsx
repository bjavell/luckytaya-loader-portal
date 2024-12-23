import logger from "@/lib/logger";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {

    const api = "FORGOT PASSWORD"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const { username } = await req.json()
        logRequest = {
            username
        }
        await luckTayaAxios.get('/api/v1/User/ForgotPassword/V2', {
            params: {
                username
            },
            headers: {
                'X-Correlation-ID': correlationId,
            }
        })

        //console.log(response)
        logResponse = { 'message': 'Password is sent to your email!' }

        return NextResponse.json({ 'message': 'Password is sent to your email!' })

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
    POST
}