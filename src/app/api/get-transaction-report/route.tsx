import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"

const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()

        const params = {
            dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
            dateTimeTo: req.nextUrl.searchParams.get('endDate'),
        }
        const response = await luckTayaAxios.get(`/api/v1/xAccountTransaction/GetTransByDateV2`, {
            params,
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const customResponse = response.data.map((e: any) => {

            const transaction = {
                ...e,
                fromFullName: `${e.fromFirstname} ${e.fromLastname}`,
                toFullName: `${e.toFirstname} ${e.toLastname}`
            }


            if (transaction.amount < 0) {
                transaction.amount *= -1
            }


            return transaction
        }).sort((a: any, b: any) => {
            return b.transactionNumber - a.transactionNumber
        })

        return NextResponse.json(customResponse)
    } catch (e) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export { GET }
