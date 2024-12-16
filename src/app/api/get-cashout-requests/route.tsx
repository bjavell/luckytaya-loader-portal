import { DB_COLLECTIONS } from "@/classes/constants";
import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { findAll } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const GET = async (req: NextRequest) => {


    try {


        // const tayaUsers = await findAll(DB_COLLECTIONS.TAYA_USERS, {})
        const fundingRequests = await findAll(DB_COLLECTIONS.CASHOUT_REQUESTS, { status: 'PENDING' })

        // const player = fundingRequests.map((_player: any) => {

        //     const matchItem = tayaUsers.find((fundRequest: any) => fundRequest.accountNumber === _player.fromAccountNumber)
        //     if (matchItem) {
        //         console.log('matchItem', matchItem)
        //         return {
        //             ..._player,
        //             firstname: matchItem.firstname,
        //             lastname: matchItem.lastname
        //         }
        //     }
        // })

        // console.log(player)

        const sortedRequests = fundingRequests.toSorted((a, b) => a.transactionDateTime - b.transactionDateTime)

        console.log(sortedRequests)
        return NextResponse.json(sortedRequests)
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