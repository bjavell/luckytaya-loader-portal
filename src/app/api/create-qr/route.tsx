import { formatGenericErrorResponse } from "@/util/commonResponse"
import { starpayAxios } from "@/util/axiosUtil"
import { NextRequest, NextResponse } from "next/server"
import * as fs from 'fs'
import { encrypt, sha256withRSAsign } from "@/util/cryptoUtil"
import { getToken } from "@/util/generator"
import CustomError from "@/classes/customError"
import { insert } from "@/util/dbUtil"
import { DB_COLLECTIONS, QR_TRANSACTION_STATUS, TRAN_TYPE } from "@/classes/constants"
import { getCurrentSession } from "@/context/auth"

const mchId = process.env.NEXT_PUBLIC_STARPAY_MERCHANT_ID
const name = process.env.NEXT_PUBLIC_PAYMENT_NAME

const createRequest = (req: NextRequest, privateKey: Buffer, type: string) => {

    let notifyUrl
    if (type === TRAN_TYPE.CASHIN) {
        notifyUrl = 'http://136.158.92.61:6001/api/notify/cashin'
    } else {
        notifyUrl = 'http://136.158.92.61:6001/api/notify/cashout'
    }


    const request = {
        "msgId": getToken(15),
        "mchId": mchId,
        "notifyUrl": notifyUrl,
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

        const currentSession = await getCurrentSession()
        const privateKey = fs.readFileSync('./key/Private.key')
        const rawRequest = await req.json()

        const accountNumber = rawRequest.accountNumber
        const accountName = rawRequest.accountName
        const commissionFee = rawRequest.commissionFee
        const convenienceFee = rawRequest.convenienceFee
        const type = rawRequest.type
        const comment = rawRequest.comment

        delete rawRequest.accountNumber
        delete rawRequest.convenienceFee
        delete rawRequest.commissionFee
        delete rawRequest.type
        delete rawRequest.comment
        delete rawRequest.accountName

        const isSelfCashIn = String(accountNumber) === String(currentSession.accountNumber)
        console.log(isSelfCashIn)
        console.log(accountNumber)
        console.log(currentSession.accountNumber)
        const parsedRequest = createRequest(rawRequest, privateKey, type)

        await insert(DB_COLLECTIONS.QR_TRANSACITON, {
            request: parsedRequest.request,
            status: QR_TRANSACTION_STATUS.CREATED,
            accountNumber: accountNumber,
            agentAccountNumber: currentSession.accountNumber,
            transactionDate: new Date().toISOString(),
            agentAuth: encrypt(currentSession.token),
            convenienceFee,
            commissionFee,
            comment,
            tranType: type,
            accountName,
            isSelfCashIn

        })

        const response = await starpayAxios.post(`${process.env.NEXT_PUBLIC_BASE_URL_STARPAY}/v1/repayment`, parsedRequest)
        const responseData = response.data

        if (responseData.response.code !== '200') {
            throw new CustomError('Not Success', { 'Err': [responseData.response.message] })
        }
        return NextResponse.json(responseData.response)
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }



}


export { POST }