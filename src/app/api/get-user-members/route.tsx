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

        if (type === 'agents' || type === 'masterAgents') {

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

            let filteredOrphanAccounts
            let filteredDirectMemberResponse
            if (type === 'masterAgents') {

                console.log(directMemberResponse.data)
                const getAllAgentOfMasterAgents = await findAll(DB_COLLECTIONS.TAYA_AGENTS, {})

                filteredDirectMemberResponse = directMemberResponse.data.map((member: any) => {

                    const matchItem = getAllAgentOfMasterAgents.find((agent: any) => agent.response.accountNumber === member.accountNumber)
                    if (matchItem) {
                        return {
                            ...member,
                            email: matchItem.response.email || '-'
                        }
                    }
                    return {
                        ...member,
                        email: '-'
                    }
                })

                filteredOrphanAccounts = orphanMemberResponse.data.filter((orphanAccount: any) => orphanAccount.accountType === 3)
            } else {
                const getAllAgentOfMasterAgents = await findAll(DB_COLLECTIONS.TAYA_AGENTS, { 'request.masterAgentAccountNumber': String(currentSession.accountNumber) })

                filteredDirectMemberResponse = directMemberResponse.data.map((member: any) => {

                    const matchItem = getAllAgentOfMasterAgents.find((agent: any) => agent.response.accountNumber === member.accountNumber)
                    if (matchItem) {
                        return {
                            ...member,
                            email: matchItem.response.email || '-'
                        }
                    }
                    return {
                        ...member,
                        email: '-'
                    }
                })

                filteredOrphanAccounts = orphanMemberResponse.data.map((orphan: any) => {

                    const matchItem = getAllAgentOfMasterAgents.find((agent: any) => agent.response.accountNumber === orphan.accountNumber)
                    if (matchItem) {
                        return {
                            ...orphan,
                            email: matchItem.response.email || '-'
                        }
                    }
                    return {
                        ...orphan,
                        email: '-'
                    }
                })
                    .filter((orphan: any) =>
                        getAllAgentOfMasterAgents.some((agent: any) => {
                            console.log(orphan, agent, orphan.accountNumber === agent.response.accountNumber)
                            return orphan.accountNumber === agent.response.accountNumber
                        })
                    )
            }


            const response = {
                direct: filteredDirectMemberResponse,
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

            const filteredPlayerAccounts = playerResponse.data.map((player: any) => {

                const matchItem = getAllAgentPlayers.find((agentPlayer: any) => agentPlayer.response.accountNumber === player.accountNumber)
                if (matchItem) {
                    return {
                        ...player,
                        email: matchItem.response.email || '-'
                    }
                }
                return {
                    ...player,
                    email: '-'
                }
            })
                .filter((player: any) =>
                    getAllAgentPlayers.some((agentPlayer: any) => {
                        console.log(player, agentPlayer, player.accountNumber === agentPlayer.response.accountNumber)
                        return player.accountNumber === agentPlayer.response.accountNumber
                    })
                )



            const customPlayerResponse = filteredPlayerAccounts.map((customPlayer: any) => {
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