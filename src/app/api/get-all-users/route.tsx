import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { DB_COLLECTIONS, USER_TYPE } from "@/classes/constants"
import { findAll } from "@/util/dbUtil"
import logger from "@/lib/logger"

const GET = async (req: NextRequest) => {
    const api = "GET ALL USERS"
    let correlationId
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

        const mgmtRole = await luckTayaAxios.get(`/api/v1/User/MgmtRole`, {
            headers: {
                'X-Correlation-ID': correlationId,
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const playerRole = await luckTayaAxios.get(`/api/v1/User/PlayerRole`, {
            headers: {
                'X-Correlation-ID': correlationId,
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const response = mgmtRole.data.concat(playerRole.data)
        let customResponse = []
        if (type === USER_TYPE.MANAGEMENT) {
            const accountType = [
                {
                    "accountType": 1,
                    "description": "Finance"
                },
                {
                    "accountType": 4,
                    "description": "Event Manager"
                },
                {
                    "accountType": 5,
                    "description": "Declarator"
                },
                {
                    "accountType": 9,
                    "description": "Admin"
                },
            ]



            customResponse = response.filter((combinedUser: any) => accountType.some((acctType: any) => {
                return acctType.accountType === combinedUser.accountType
            }))
        } else {

            const accountType = [
                {
                    "accountType": 3,
                    "description": "Master Agent"
                },
                {
                    "accountType": 6,
                    "description": "Agent"
                },
                {
                    "accountType": 7,
                    "description": "Agent Player"
                },
                {
                    "accountType": 8,
                    "description": "Player"
                },
            ]

            const getAllAgentPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, {})



            customResponse = response.map((player: any) => {

                const matchItem = getAllAgentPlayers.find((agentPlayer: any) => {
                    return Number(agentPlayer.accountNumber) === Number(player.accountNumber)
                })
                if (matchItem) {
                    return {
                        ...player,
                        image: matchItem.id,
                        status: matchItem.status
                    }
                }
                return {
                    ...player,
                    image: '',
                    status: ''
                }
            }).filter((combinedUser: any) => accountType.some((acctType: any) => {
                return acctType.accountType === combinedUser.accountType
            }))

        }
        logResponse = {
            ...customResponse
        }

        return NextResponse.json(customResponse)
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
        },
            { status: 500 })
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

export { GET }
