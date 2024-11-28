import { DB_COLLECTIONS } from "@/classes/constants"
import { getCurrentSession } from "@/context/auth"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findAll } from "@/util/dbUtil"
import { NextRequest, NextResponse } from "next/server"


const GET = async (req: NextRequest) => {
    try {
        const currentSession = await getCurrentSession()

        const type = req.nextUrl.searchParams.get('type')

        if (type === 'agents') {

            const directMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/Direct`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
            const indirectMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/Indirect`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })

            const orphanMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/OrphanAccount`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })

            const getAllAgentOfMasterAgents = await findAll(DB_COLLECTIONS.TAYA_AGENTS, { 'request.masterAgentAccountNumber': String(currentSession.accountNumber) })


            const filteredOrphanAccounts = orphanMemberResponse.data.filter((orphanAccount: any) =>
                getAllAgentOfMasterAgents.some((agent: any) => Number(orphanAccount.accountNumber) === Number(agent.response.accountNumber))
            )

            const response = {
                direct: directMemberResponse.data,
                indirect: indirectMemberResponse.data,
                orphan: filteredOrphanAccounts
            }

            return NextResponse.json(response)
        } else {
            const playerResponse = await luckTayaAxios.get(`/api/v1/UserAccount/AllPlayerAccount`, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
            const getAllAgentPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, { agentReferralCode: String(currentSession.referralCode) })


            console.log(getAllAgentPlayers)
            console.log(playerResponse.data)

            const filteredPlayerAccounts = getAllAgentPlayers.filter((agentPlayer: any) =>
                playerResponse.data.some((players: any) => Number(players.accountNumber) === Number(agentPlayer.accountNumber))
            )

            const customPlayerResponse = filteredPlayerAccounts.map((customPlayer:any) => {
                delete customPlayer._id
                delete customPlayer.pin
                return customPlayer
            })


            return NextResponse.json(customPlayerResponse)
        }
    } catch (e) {

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export {
    GET
}