import { DB_COLLECTIONS } from "@/classes/constants";
import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { findAll } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {


    try {


        const tayaUsers = await findAll(DB_COLLECTIONS.TAYA_USERS, {})
        const fundingRequests = await findAll(DB_COLLECTIONS.FUNDING_REQUESTS, { status: 'Created' })

        const player = fundingRequests.map((_player: any) => {

            const matchItem = tayaUsers.find((fundRequest: any) => fundRequest.accountNumber === _player.accountNumber)
            if (matchItem) {
                console.log('matchItem', matchItem)
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

        console.log(player)

        return NextResponse.json(player)
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export {
    GET
}