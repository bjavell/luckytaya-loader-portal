import { starpayAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { sha256withRSAsign } from "@/util/cryptoUtil"
import { getToken } from "@/util/generator"
import * as fs from 'fs'
import { NextResponse } from "next/server"

const mchId = process.env.NEXT_PUBLIC_STARPAY_MERCHANT_ID
const name = process.env.NEXT_PUBLIC_PAYMENT_NAME

const GET = async () => {

    try {
        const request = {
            "msgId": getToken(15),
            "mchId": mchId,
            "service": "pay.starpay.instapay.bank.list"
        }


        const privateKey = fs.readFileSync('./key/Private.key')

        const signature = sha256withRSAsign(JSON.stringify(request), privateKey)
        const data = {
            request: request,
            signature: signature
        }

        const response = await starpayAxios.post(`${process.env.NEXT_PUBLIC_BASE_URL_STARPAY}/v1/disburse`, data)
        const responseData = response.data


        return NextResponse.json(responseData.response)

    } catch (e: any) {
        console.error(e.response.data)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}


export {
    GET
}