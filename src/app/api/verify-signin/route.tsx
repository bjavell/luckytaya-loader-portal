'use server'
import { decrypt } from "@/util/cryptoUtil"
import CustomError from "@/classes/customError"
import { getCurrentSession, setSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const portalType = process.env.PORTAL

const POST = async (req: NextRequest) => {
    try {
        const { password } = await req.json()
        
        const currentSession = await getCurrentSession()
        const request = {
            username: currentSession.username,
            password: decrypt(password)
        }
        const response = await luckTayaAxios.post(`/api/v1/User/Login`, request)
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

        console.log(responseData,'hello')
        await setSession(responseData)
        return NextResponse.json({ 'message': 'Successfully Verified!' })

    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        }, {
            status: 500
        })
    }
}

export { POST }
