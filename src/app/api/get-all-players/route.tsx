import axios from "axios"
import { Agent } from "https"
import { getCurrentSession } from "@/context/auth"
import { NextResponse } from "next/server"

const GET = async (req: Request) => {
    try {
        // Get the current session
        const currentSession = await getCurrentSession()

        // Create an HTTPS agent for the request
        const httpsAgent = new Agent({
            rejectUnauthorized: false, // Be cautious with this in production
            host: '161.49.111.17',
            port: 1443,
        })

        // Make the GET request
        const response = await axios.get(`${process.env.BASE_URL}/api/v1/UserAccount/AllPlayerAccount`, {
            httpsAgent,
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        // Return the response data
        return NextResponse.json(response.data)
    } catch (error: any) {
        // Handle errors
        const errorMessage = error.response?.data?.errors || ['An unexpected error occurred']
        return NextResponse.json({ error: errorMessage }, { status: 500 })
    }
}

export { GET }
