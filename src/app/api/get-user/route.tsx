import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findOne } from "@/util/dbUtil"
import { DB_COLLECTIONS } from "@/classes/constants"

const GET = async (req: NextRequest) => {
    try {

        const accountNumber = req.nextUrl.searchParams.get('accountNumber')

        const currentSession = await getCurrentSession()

        const response = await luckTayaAxios.get(`/api/v1/UserAccount/AllPlayerAccount`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const playerList = response.data


        const filteredPlayerList = playerList.filter((e: any) => {
            return e.accountNumber === Number(accountNumber) && (e.roleName === 'acctmgr' || e.roleName == '')
        })

        const player = filteredPlayerList[0]

        const customResponse = {
            ...player
        }

        if (player) {
            const userData = await findOne(DB_COLLECTIONS.TAYA_USERS, { 'accountNumber': player.accountNumber })

            if (userData) {
                customResponse.email = userData.email
            }
        }

        if (filteredPlayerList.length > 0) {
            return NextResponse.json(customResponse)
        }


        return NextResponse.json({})
    } catch (e) {
        console.error(e)

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
