import { DB_COLLECTIONS } from "@/classes/constants";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { findAll } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {

    const api = "GET FUNDING REQUEST"
    let correlationId
    let logRequest
    let logResponse
    let status = 200

    try {
        correlationId = req.headers.get('x-correlation-id');


        const tayaUsers = await findAll(DB_COLLECTIONS.TAYA_USERS, {})
        const fundingRequests = await findAll(DB_COLLECTIONS.FUNDING_REQUESTS, { status: 'Created' })

        const player = fundingRequests.map((_player: any) => {

            const matchItem = tayaUsers.find((fundRequest: any) => fundRequest.accountNumber === _player.accountNumber)
            if (matchItem) {
                //console.log('matchItem', matchItem)
                return {
                    ..._player,
                    firstname: matchItem.firstname,
                    lastname: matchItem.lastname
                }
            }
            return {
                ..._player,
                firstname: '',
                lastname: ''
            }
        })

        //console.log(player)
        logResponse = player

        return NextResponse.json(player)
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