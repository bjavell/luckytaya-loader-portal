import { DB_COLLECTIONS } from "@/classes/constants"
import CustomError from "@/classes/customError"
import { getCurrentSession } from "@/context/auth"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { findAll, findOne, update } from "@/util/dbUtil"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

const POST = async (req: NextRequest) => {

    try {
        const { id } = await req.json()

        console.log('here!')
        const query = { _id: new ObjectId(id) }
        const fundingRequests = await findOne(DB_COLLECTIONS.CASHOUT_REQUESTS, query)

        console.log(fundingRequests)
        if (fundingRequests) {
            await update(DB_COLLECTIONS.CASHOUT_REQUESTS, query, { ...fundingRequests, status: 'APPROVED' })
        } else {
            throw new CustomError('No Data found', {
                'Not found': ['Request Not Found']
            })
        }


        return NextResponse.json({ message: 'Successfully Cashedout!' })
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }
}


export {
    POST
}