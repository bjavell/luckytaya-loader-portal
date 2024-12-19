import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findAll, findOne } from "@/util/dbUtil"
import { DB_COLLECTIONS } from "@/classes/constants"

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


        const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })
        const getAllUser = await findAll(DB_COLLECTIONS.TAYA_USERS, {})
        const getAllBackofficeUsers = await findAll(DB_COLLECTIONS.TAYA_AGENTS, {})

        const customResponse = response.data.map((e: any) => {

            const fromAccount = getMatchedAccount(e.fromAccountNumber, getAllUser, getAllBackofficeUsers, config)
            const toAccount = getMatchedAccount(e.toAccountNumber, getAllUser, getAllBackofficeUsers, config)

            const transaction = {
                ...e,
                fromFullName: fromAccount,
                toFullName: toAccount
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


const getMatchedAccount = (accountNumber: number, getAllUser: any, getAllBackofficeUsers: any, config:any) => {

    const matchedPlayer = getAllUser.find((players: any) => {
        return Number(players.accountNumber) === Number(accountNumber)
    })

    const matchedBackofficeUser = getAllBackofficeUsers.find((agents: any) => {
        return Number(agents.response.accountNumber) === Number(accountNumber)
    })

    if (matchedPlayer) {
        return `${matchedPlayer.firstname} ${matchedPlayer.lastname}`
    } else if (matchedBackofficeUser) {
        return `${matchedBackofficeUser.response.firstname} ${matchedBackofficeUser.response.lastname}`
    } else {
        if (config) {
            if (config.operatorAccountNumber === accountNumber) {
                return 'Operator'
            } else if (config.mainAgentAccount === accountNumber) {
                return 'Starpay Wallet'
            }
        }

        return '-'
    }

}

export { GET }
