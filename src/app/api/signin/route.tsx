'use server'
import { decrypt } from "@/util/cryptoUtil"
import CustomError from "@/classes/customError"
import { setSession } from "@/context/auth"
import { NextResponse } from "next/server"
import { luckTayaAxios } from "@/helper/config"
import { formatGenericErrorResponse } from "@/helper/commonResponse"

const POST = async (req: Request) => {
    try {
        const { username, password } = await req.json()

        const request = {
            username: username,
            password: decrypt(password),
        }

        const response = await luckTayaAxios.post(`/api/v1/User/Login`, request)
        const responseData = response.data

        if (!responseData.roles.includes('acctmgr')) {
            throw new CustomError('Invalid Account Type', {
                'Not found': [`User '${request.username}' not found.`]
            })
        }

        await setSession(responseData)
        return NextResponse.json(responseData)

    } catch (e: any) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        }, {
            status: 500
        })
    }
}

export { POST }
