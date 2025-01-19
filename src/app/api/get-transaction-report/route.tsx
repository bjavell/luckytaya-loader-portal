import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import logger from "@/lib/logger"
import { DB_COLLECTIONS } from "@/classes/constants"
import { findAll, findOne } from "@/util/dbUtil"

const GET = async (req: NextRequest) => {
    const api = "GET TRANSACTION REPORT"
    let correlationId: string | null = ''
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const currentSession = await getCurrentSession()

        const reportType = req.nextUrl.searchParams.get('type')
        const accountNumber = req.nextUrl.searchParams.get('accountNumber')

        const params = {
            dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
            dateTimeTo: req.nextUrl.searchParams.get('endDate'),
        }

        const uri = `/api/v1/xAccountTransaction/GetTransByDateV2`

        // if (reportType === 'player') {
        //     uri = `/api/v1/xAccountTransaction/GetTransByAcctNumByDateV2`
        //     params = {
        //         accountNumber: req.nextUrl.searchParams.get('accountNumber'),
        //         dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
        //         dateTimeTo: req.nextUrl.searchParams.get('endDate'),
        //     }
        // } else {
        //     uri 
        //     params 
        // }



        logRequest = {
            ...params
        }


        const response = await luckTayaAxios.get(uri, {
            params,
            headers: {
                'X-Correlation-ID': correlationId,
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const responseData = response.data

        let filteredData = responseData

        if (reportType === 'player') {
            filteredData = responseData.filter((e: any) => e.fromAccountNumber === Number(accountNumber) || e.toAccountNumber === Number(accountNumber))
        }

        const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })

        const getAllAgentPlayers = await findAll(DB_COLLECTIONS.TAYA_AGENTS, {})
        const getAllPlayers = await findAll(DB_COLLECTIONS.TAYA_USERS, {})

        const fightIds: string[] = Array.from(new Set(filteredData.map((e: any) => e.fightId).filter((id: number) => id !== 0 && id !== null && id !== undefined)))

        const fightDetails = await Promise.all(fightIds.map(async (fightId: string) => {

            const fightResponse = await luckTayaAxios.get(`/api/v1/SabongFight/V3/WithDetails/${fightId}`, {
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            });

            const fightResponseData = fightResponse.data

            const betResponse = await luckTayaAxios.get(`/api/v1/SabongBet/GetByFightId`, {
                params: {
                    fightId
                },
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            });

            const betResponseData = betResponse.data

            fightResponseData.betDetails = betResponseData

            if (fightResponseData.fight.fightStatusCode === 22) {
                const fightResulst = await luckTayaAxios.get(`/api/v1/SabongFightResult/${fightId}`, {
                    headers: {
                        'X-Correlation-ID': correlationId,
                        'Authorization': `Bearer ${currentSession.token}`,
                    },
                });

                fightResponseData.fightResult = fightResulst.data
            }

            const fightDetailsDb = await findOne(DB_COLLECTIONS.GAMES, { fightId: Number(fightId) })

            fightResponseData.dbDetails = fightDetailsDb

            return fightResponseData;

        }));


        const customResponse = filteredData.map((e: any) => {

            const fromAccount = getAccount(e.fromAccountNumber, getAllPlayers, getAllAgentPlayers, config)
            const toAccount = getAccount(e.toAccountNumber, getAllPlayers, getAllAgentPlayers, config)

            const transaction = {
                ...e,
                fromFullName: `${fromAccount?.response?.firstname ?? fromAccount?.firstname} ${fromAccount?.response?.lastname ?? fromAccount?.lastname}`,
                toFullName: `${toAccount?.response?.firstname ?? toAccount?.firstname} ${toAccount?.response?.lastname ?? toAccount?.lastname}`
            }


            if (transaction.amount < 0) {
                transaction.amount *= -1
            }

            const otherInfo = fightDetails.find((fight: any) => fight.fight.fightId === transaction.fightId)

            if (otherInfo) {
                const bet = otherInfo.betDetails.find((bet: any) => bet.transactionNumber === transaction.transactionNumber)
                let otherInfoDesc = `Event Name: ${otherInfo.event.eventName}\nVenue Name: ${otherInfo.venue.venueName}\nGame Number: ${otherInfo.fight.fightNum}`
                let betSide: any

                if (bet) {
                    betSide = otherInfo.fightDetails.find((fight: any) => fight.side === bet.side)
                    otherInfoDesc += `\nBet: ${betSide.owner}`
                } else if (otherInfo.fightResult) {
                    betSide = otherInfo.fightDetails.find((fight: any) => fight.side === otherInfo.fightResult.winSide)
                    otherInfoDesc += `\nBet: ${betSide.owner}`
                } else if (otherInfo.dbDetails) {
                    otherInfoDesc += `\nReason: ${otherInfo.dbDetails.reason}`
                }
                transaction.otherInfo = otherInfoDesc
            }

            transaction.otherDetails = otherInfo


            return transaction
        }).sort((a: any, b: any) => {
            return b.transactionNumber - a.transactionNumber
        })

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

const getAccount = (accountNumber: string, agents: any, users: any, config: any) => {

    let matchItem = agents.find((agent: any) => {
        return Number(agent.accountNumber) === Number(accountNumber)
    })

    if (!matchItem) {
        matchItem = users.find((user: any) => {
            return Number(user.response.accountNumber) === Number(accountNumber)
        })
    }

    if (!matchItem) {
        if (Number(config.operatorAccountNumber) === Number(accountNumber)) {
            return {
                firstname: 'Operator',
                lastname: ''
            }
        }
    }

    if (!matchItem) {
        if (Number(config.mainMasterAccountNumber) === Number(accountNumber)) {
            return {
                firstname: 'Master',
                lastname: ''
            }
        }
    }

    return matchItem ?? {
        firstname: '',
        lastname: ''
    }

}

export { GET }
