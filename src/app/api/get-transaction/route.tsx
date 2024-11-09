import { getCurrentSession } from "@/context/auth"
import { NextResponse } from "next/server"
import { luckTayaAxios } from "@/helper/config"
import { formatGenericErrorResponse } from "@/helper/commonResponse"

const GET = async (req: Request) => {
    try {
        const currentSession = await getCurrentSession()

        const params = {
            dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
            dateTimeTo: req.nextUrl.searchParams.get('endDate'),
            accountNumber: currentSession.accountNumber
        }
        const response = await luckTayaAxios.get(`${process.env.LUCKY_TAYA_BASE_URL}/api/v1/xAccountTransaction/GetTransByAcctNumByDateV2`, {
            params,
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        return NextResponse.json(response.data)
    } catch (e: any) {
        console.log(e)

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
