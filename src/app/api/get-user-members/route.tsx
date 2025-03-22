import { DB_COLLECTIONS } from "@/classes/constants"
import { getCurrentSession } from "@/context/auth"
import logger from "@/lib/logger"
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findAll, findOne } from "@/util/dbUtil"
import { NextRequest, NextResponse } from "next/server"


const GET = async (req: NextRequest) => {
    const api = "GET USER MEMBER"
    let correlationId: string | null = "";
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');

        const currentSession = await getCurrentSession()

        const type = req.nextUrl.searchParams.get('type')

        logRequest = {
            url: {
                type
            }
        }

        if (type === 'agent' || type === 'masterAgent') {

            const directMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/Direct`, {
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
            const indirectMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/Indirect`, {
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })

            const orphanMemberResponse = await luckTayaAxios.get(`/api/v1/AccountMember/OrphanAccount`, {
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })

            let filteredOrphanAccounts
            let filteredDirectMemberResponse
            if (type === 'masterAgent') {

                //console.log(directMemberResponse.data)
                const getAllAgentOfMasterAgents = await findAll(DB_COLLECTIONS.TAYA_AGENTS, {})

                filteredDirectMemberResponse = await Promise.all(directMemberResponse.data.map(async (member: any) => {
                    const matchItem = await getAllAgentOfMasterAgents.find(async (agent: any) => Number(agent.response.accountNumber) === Number(member.accountNumber));
                    const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance`, {
                        headers: {
                            'X-Correlation-ID': correlationId
                        },
                        params: {
                            userId: member.aspnetuserId
                        }
                    });

                    member.balance = otsWalletResponse.data.data.balance;
                    if (matchItem) {
                       
                        return {
                            ...member,
                            email: matchItem.response.email || '-'
                        };
                    }
                    return {
                        ...member,
                        email: '-'
                    };
                }));

                const tempFilteredOrphanAccounts = orphanMemberResponse.data.filter((orphanAccount: any) => orphanAccount.accountType === 3)
            
                filteredOrphanAccounts = await Promise.all(tempFilteredOrphanAccounts.map(async (orphan: any) => {
                    const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance`, {
                        headers: {
                            'X-Correlation-ID': correlationId
                        },
                        params: {
                            userId: orphan.aspnetuserId
                        }
                    });

                    orphan.balance = otsWalletResponse.data.data.balance;

                    return orphan;
                }));
            } else {
                const getAllAgentOfMasterAgents = await findAll(DB_COLLECTIONS.TAYA_AGENTS, { 'request.masterAgentAccountNumber': String(currentSession.accountNumber) })

                filteredDirectMemberResponse = await Promise.all(directMemberResponse.data.map(async(member: any) => {

                    const matchItem = getAllAgentOfMasterAgents.find(async(agent: any) => agent.response.accountNumber === member.accountNumber)

                    const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance`, {
                        headers: {
                            'X-Correlation-ID': correlationId
                        },
                        params: {
                            userId: member.aspnetuserId
                        }
                    });

                    member.balance = otsWalletResponse.data.data.balance;
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
                }))

                filteredOrphanAccounts = await (await Promise.all(orphanMemberResponse.data.map(async (orphan: any) => {
                    const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance`, {
                        headers: {
                            'X-Correlation-ID': correlationId
                        },
                        params: {
                            userId: orphan.aspnetuserId
                        }
                    });

                    orphan.balance = otsWalletResponse.data.data.balance;
                    const matchItem = getAllAgentOfMasterAgents.find(async (agent: any) => agent.response.accountNumber === orphan.accountNumber)
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
                })))
                    .filter((orphan: any) =>
                        getAllAgentOfMasterAgents.some((agent: any) => {
                            //console.log(orphan, agent, orphan.accountNumber === agent.response.accountNumber)
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


            const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })

            let getAllAgentPlayers
            if (config) {
                if (config.mainAgentAccount === currentSession.accountNumber) {
                    getAllAgentPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, { agentReferralCode: { $exists: false } })
                } else {
                    getAllAgentPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, { agentReferralCode: String(currentSession.referralCode) })
                }
            } else {
                getAllAgentPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, { agentReferralCode: String(currentSession.referralCode) })
            }


            //console.log(getAllAgentPlayers)

            const filteredPlayerAccounts = playerResponse.data.map((player: any) => {

                const matchItem = getAllAgentPlayers.find((agentPlayer: any) => agentPlayer.accountNumber === player.accountNumber)
                if (matchItem) {
                    return {
                        ...player,
                        email: matchItem.email || '-',
                        firstname: matchItem.firstname || '-',
                        lastname: matchItem.lastname || '-'
                    }
                }
                return {
                    ...player,
                    email: '-',
                    firstname: '',
                    lastname: ''
                }
            })
                .filter((player: any) =>
                    getAllAgentPlayers.some((agentPlayer: any) => {
                        //console.log(player, agentPlayer, player.accountNumber === agentPlayer.accountNumber)
                        return player.accountNumber === agentPlayer.accountNumber
                    })
                )



            const customPlayerResponse = filteredPlayerAccounts.map((customPlayer: any) => {
                delete customPlayer._id
                delete customPlayer.pin
                return customPlayer
            })

            logResponse = {
                ...customPlayerResponse
            }

            return NextResponse.json(customPlayerResponse)
        }
    } catch (e: any) {
        logger.error(api, {
            correlationId,
            error: e.message,
            errorStack: e.stack
        })

        status = 500
        logResponse = formatGenericErrorResponse(e)
        return NextResponse.json({
            error: logResponse
        }, {
            status: 500
        })
    } finally {
        logger.info(api, {
            correlationId,
            apiLog: {
                status,
                request: logRequest,
                response: logResponse,
            }
        })

    }
}

export {
    GET
}