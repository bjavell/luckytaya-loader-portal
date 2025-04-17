'use server'
import { decrypt } from "@/util/cryptoUtil"
import CustomError from "@/classes/customError"
import { setSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import logger from "@/lib/logger"
import { AxiosError } from "axios"

const portalType = process.env.PORTAL

const POST = async (req: NextRequest) => {
    const api = "SIGN IN"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {

        correlationId = req.headers.get('x-correlation-id');
        const { username, password } = await req.json()

        const request = {
            username: username,
            password: decrypt(password)
        }

        logRequest = {
            ...request,
            password: 'XXXXXX'
        }


        const loginResponse = await otsEngine.post(`${process.env.OTS_USER_URL}/user/login`, {
            userName: request.username,
            password: request.password,
        }, {
            headers: {
                'X-Correlation-ID': correlationId,
            },
        })


        const loginResponseData = loginResponse.data




        //console.log(request, '-------')
        // const response = await luckTayaAxios.post(`/api/v1/User/Login`, request,
        //     {
        //         headers: {
        //             'X-Correlation-ID': correlationId,
        //         },
        //     }
        // )
        // const responseData = response.data

        if (portalType === 'ADMIN') {
            if (!loginResponseData.data.user.role.includes('admin')) {
                throw new CustomError('Invalid Account Type', {
                    'Not found': [`User '${request.username}' not found.`]
                })
            }
        } else {
            if (loginResponseData.data.user.role.includes('admin')) {
                throw new CustomError('Invalid Account Type', {
                    'Not found': [`User '${request.username}' not found.`]
                })
            }

            if (!loginResponseData.data.user.role.includes('acctmgr') && !loginResponseData.data.user.role.includes('eventmgr') && !loginResponseData.data.user.role.includes('master') && !loginResponseData.data.user.role.includes('finance')) {
                throw new CustomError('Invalid Account Type', {
                    'Not found': [`User '${request.username}' not found.`]
                })
            }
        }

        logResponse = {
            ...loginResponseData.data,
            token: 'XXXXXX'
        }

        await setSession(loginResponseData.data)
        return NextResponse.json({ 'message': 'Successfully Logged In!' })

    } catch (e: any) {
        // console.error(e)
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
