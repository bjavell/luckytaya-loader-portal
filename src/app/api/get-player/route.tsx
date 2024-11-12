import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {

        const accountNumber = req.nextUrl.searchParams.get('accountNumber')

        const currentSession = await getCurrentSession()

        const response = await luckTayaAxios.get(`${process.env.LUCKY_TAYA_BASE_URL}/api/v1/UserAccount/AllPlayerAccount`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const playerList = response.data


        const filteredPlayerList = playerList.filter((e: any) => {
            return e.accountNumber === Number(accountNumber)
        })

        if (filteredPlayerList.length > 0) {
            return NextResponse.json(filteredPlayerList[0])
        }

        return NextResponse.json({})
    } catch (e) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
