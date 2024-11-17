import { getCurrentSession } from "@/context/auth"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { luckTayaAxios } from "@/util/axiosUtil"
import { NextRequest, NextResponse } from "next/server"
import { findOne } from "@/util/dbUtil"
import { DB_COLLECTIONS } from "@/classes/constants"

const POST = async (req: NextRequest) => {

    try {
        const currentSession = await getCurrentSession()
        const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })

        if (config) {

            const { amount, toAccountNumber, comFee, convFee } = await req.json()

            const feeTransferResponse = await luckTayaAxios.get(`/api/v1/Account/transferV2`, {
                params: {
                    amount: convFee,
                    toAccountnumber: config.commissionAccountNumber
                },
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })


            const agentToPlayerResponse = await luckTayaAxios.get(`/api/v1/Account/transferV2`, {
                params: {
                    amount: amount,
                    toAccountnumber: toAccountNumber
                },
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })

        } else {
            throw new Error('Oops an error occurred')
        }

        return NextResponse.json({ message: 'Successfully Cashed-In!' })
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }
}

export {
    POST
}