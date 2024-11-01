'use server'
import { decrypt } from "@/util/cryptoUtil"
import axios from "axios"
import { Agent } from "https"
import CustomError from "@/classes/customError"
import { setSession } from "@/context/auth"
import { NextResponse } from "next/server"

const POST = async (req: Request) => {
    try {
        const { username, password } = await req.json()

        const request = {
            username: username,
            password: decrypt(password),
        }

        const httpsAgent = new Agent({
            rejectUnauthorized: false, // Be cautious with this in production
            host: '161.49.111.17',
            port: 1443,
        })

        const response = await axios.post(`${process.env.BASE_URL}/api/v1/User/Login`, request, { httpsAgent })
        const responseData = response.data

        if (!responseData.roles.includes('acctmgr')) {
            throw new CustomError('Invalid Account Type', {
                'Not found': [`User '${request.username}' not found.`]
            })
        }

        await setSession(responseData)
        return NextResponse.json(responseData)

    } catch (e: any) {
        const errors = e.response?.data?.errors || ['An unexpected error occurred']
        return NextResponse.json({
            error: errors
        }, {
            status: 500
        })
    }
}

export { POST }
