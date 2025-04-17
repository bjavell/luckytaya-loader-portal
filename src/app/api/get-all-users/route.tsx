import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { DB_COLLECTIONS, USER_TYPE } from "@/classes/constants"
import { findAll } from "@/util/dbUtil"
import logger from "@/lib/logger"

const GET = async (req: NextRequest) => {
    const api = "GET ALL USERS"
    let correlationId: string | null = null
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const currentSession = await getCurrentSession()
        const type = req.nextUrl.searchParams.get('type')

        let users
        if (type === USER_TYPE.MANAGEMENT) {
            const response = await otsEngine.get(`${process.env.OTS_USER_URL}/user`, {
                params: {
                    type: 'backoffice',
                },
                headers: {
                    "x-correlation-id": correlationId,
                    Authorization: `Bearer ${currentSession.accessToken}`,
                }
            })

            if (!response.data.success) {
                throw new Error(response.data.errors.message)
            }

            const responseData = response.data.data

            const tmpUsers = responseData.users

            users = await Promise.all(tmpUsers.map(async (user: any) => {

                const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance`, {
                    headers: {
                        'X-Correlation-ID': correlationId,
                        Authorization: `Bearer ${currentSession.accessToken}`,
                    },
                    params: {
                        userId: user.userId
                    }
                });
                const responseData = otsWalletResponse.data?.data


                console.log(responseData)
            }))


        } else {
            const response = await otsEngine.get(`${process.env.OTS_USER_URL}/user`, {
                params: {
                    type: 'player',
                },
                headers: {
                    "x-correlation-id": correlationId,
                    Authorization: `Bearer ${currentSession.accessToken}`,
                }
            })

            if (!response.data.success) {
                throw new Error(response.data.errors.message)
            }

            const responseData = response.data.data
            const tmpUsers = responseData.users

            users = await Promise.all(tmpUsers.map(async (user: any) => {

                const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance/${user.userId}`, {
                    headers: {
                        'X-Correlation-ID': correlationId,
                        Authorization: `Bearer ${currentSession.accessToken}`,
                    }
                });
                const otsWalletResponseData = otsWalletResponse.data.data

                return {
                    ...user,
                    walletId: otsWalletResponseData.walletId,
                    accountBalance: otsWalletResponseData.balance ?? 0,
                }
            }))
        }

        // logRequest = {
        //     url: {
        //         type
        //     }
        // }

        // const mgmtRole = await luckTayaAxios.get(`/api/v1/User/MgmtRole`, {
        //     headers: {
        //         'X-Correlation-ID': correlationId,
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })

        // const playerRole = await luckTayaAxios.get(`/api/v1/User/PlayerRole`, {
        //     headers: {
        //         'X-Correlation-ID': correlationId,
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })

        // const response = mgmtRole.data.concat(playerRole.data)
        // let customResponse = []
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



            // customResponse = response.filter((combinedUser: any) => accountType.some((acctType: any) => {
            //     return acctType.accountType === combinedUser.accountType
            // }))
        } else {

            //     const accountType = [
            //         {
            //             "accountType": 3,
            //             "description": "Master Agent"
            //         },
            //         {
            //             "accountType": 6,
            //             "description": "Agent"
            //         },
            //         {
            //             "accountType": 7,
            //             "description": "Agent Player"
            //         },
            //         {
            //             "accountType": 8,
            //             "description": "Player"
            //         },
            //     ]

            //     const getAllAgentPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, {})



            //     const mappedResponse = await Promise.all(response.map(async (player: any) => {

            //         const matchItem = getAllAgentPlayers.find((agentPlayer: any) => {
            //             return Number(agentPlayer.accountNumber) === Number(player.accountNumber)
            //         })

            //         const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance`, {
            //             headers: {
            //                 'X-Correlation-ID': correlationId
            //             },
            //             params: {
            //                 userId: player.id
            //             }
            //         });
            //         const responseData = otsWalletResponse.data?.data

            //         if (matchItem) {
            //             return {
            //                 ...player,
            //                 accountBalance: responseData?.balance ?? 0,
            //                 image: matchItem.id,
            //                 status: matchItem.status
            //             }
            //         }
            //         return {
            //             ...player,
            //             accountBalance: responseData?.balance ?? 0,
            //             image: '',
            //             status: ''
            //         }
            //     }));

            //     customResponse = mappedResponse.filter((combinedUser: any) => accountType.some((acctType: any) => {
            //         return acctType.accountType === combinedUser.accountType
            //     }));


            // }
            // logResponse = {
            //     ...customResponse
            // }

            // return NextResponse.json(customResponse)

        }
        return NextResponse.json(users)
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
