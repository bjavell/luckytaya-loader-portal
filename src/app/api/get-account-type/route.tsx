import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {
        // const currentSession = await getCurrentSession()

        // const response = await luckTayaAxios.get(`/api/v1/AccountType`, {
        //     headers: {
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })

        const accountType = [
            // {
            //     "accountType": 0,
            //     "description": "Operator"
            // },
            // {
            //     "accountType": 1,
            //     "description": "Finance"
            // },
            {
                "accountType": 2,
                "description": "Master"
            },
            // {
            //     "accountType": 3,
            //     "description": "National"
            // },
            {
                "accountType": 4,
                "description": "Declarator"
            },
            // {
            //     "accountType": 5,
            //     "description": "DealerAgent"
            // },
            {
                "accountType": 6,
                "description": "Agent"
            },
            // {
            //     "accountType": 7,
            //     "description": "Agent Player"
            // },
            // {
            //     "accountType": 8,
            //     "description": "Player"
            // },
            {
                "accountType": 9,
                "description": "System"
            },
            // {
            //     "accountType": 10,
            //     "description": "KioskPlayer"
            // }
        ]

        return NextResponse.json(accountType)
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
