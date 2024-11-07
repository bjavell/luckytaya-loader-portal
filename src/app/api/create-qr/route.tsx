import { formatGenericErrorResponse } from "@/helper/commonResponse"
import { starpayAxios } from "@/helper/config"
import { NextResponse } from "next/server"
import * as fs from 'fs'
import { sha256withRSAsign } from "@/util/cryptoUtil"
import { getToken } from "@/util/generator"
import CustomError from "@/classes/customError"

const mchId = process.env.NEXT_PUBLIC_STARPAY_MERCHANT_ID
const name = process.env.NEXT_PUBLIC_PAYMENT_NAME


const createRequest = (req: any, privateKey: Buffer) => {
    const request = {
        "msgId": getToken(15),
        "mchId": mchId,
        "notifyUrl": `https://localhost:8080/api/transaction/complete/order`,
        "deviceInfo": name,
        "currency": "PHP",
        "service": "pay.starpay.repayment",
        ...req
    }

    const signature = sha256withRSAsign(JSON.stringify(request), privateKey)
    const data = {
        request: request,
        signature: signature
    }

    return data
}


const POST = async (req: Request) => {

    try {
        const privateKey = fs.readFileSync('./key/Private.key')
        const rawRequest = await req.json()

        const parsedRequest = createRequest(rawRequest, privateKey)

        console.log(parsedRequest)

        const response = await starpayAxios.post(`${process.env.NEXT_PUBLIC_BASE_URL_STARPAY}/v1/repayment`, parsedRequest)
        const responseData = response.data

        console.log(responseData)

        if (responseData.response.code !== 200) {
            throw new CustomError('Not Success', { 'Err': [responseData.response.message] })
        }
        return NextResponse.json({ 'Success': 'Success' })
    } catch (e: any) {
        console.log(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }



}


export { POST }