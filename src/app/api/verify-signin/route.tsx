'use server'
import { decrypt } from "@/util/cryptoUtil"
import CustomError from "@/classes/customError"
import { getCurrentSession, setSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import logger from "@/lib/logger"

const portalType = process.env.PORTAL

const POST = async (req: NextRequest) => {
    const api = "VERIFY SIGN IN"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        const { password } = await req.json()
        correlationId = req.headers.get('x-correlation-id');

        const currentSession = await getCurrentSession()
        const request = {
            username: currentSession.username,
            password: decrypt(password)
        }

        logRequest = {
            ...request,
            password: 'XXXXXX'
        }

        const response = await luckTayaAxios.post(`/api/v1/User/Login`, request,
            {
                headers: {
                    'X-Correlation-ID': correlationId,
                },
            }
        )
        const responseData = response.data

        if (portalType === 'ADMIN') {
            if (!responseData.roles.includes('admin')) {
                throw new CustomError('Invalid Account Type', {
                    'Not found': [`User '${request.username}' not found.`]
                })
            }
        } else {
            if (responseData.roles.includes('admin')) {
                throw new CustomError('Invalid Account Type', {
                    'Not found': [`User '${request.username}' not found.`]
                })
            }

            if (!responseData.roles.includes('acctmgr') && !responseData.roles.includes('eventmgr') && !responseData.roles.includes('master') && !responseData.roles.includes('finance')) {
                throw new CustomError('Invalid Account Type', {
                    'Not found': [`User '${request.username}' not found.`]
                })
            }
        }

        console.log(responseData, 'hello')
        await setSession(responseData)
        logResponse = { 'message': 'Successfully Verified!' }
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

export { POST }
