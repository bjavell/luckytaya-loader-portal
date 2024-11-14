import { DB_COLLECTIONS, QR_TRANSACTION_STATUS } from "@/classes/constants";
import { findOne, update } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";
import * as fs from 'fs'
import { decrypt, sha256withRSAverify } from "@/util/cryptoUtil";
import { insertDecimalAtThirdToLast } from "@/util/textUtil";
import { luckTayaAxios } from "@/util/axiosUtil";

const POST = async (req: NextRequest) => {

    try {

        const rawRequest = await req.json()
        const query = { 'request.msgId': rawRequest.request.originalMsgId }
        const transaction = await findOne(DB_COLLECTIONS.QR_TRANSACITON, query)

        const sppublicKey = fs.readFileSync('./key/SP_Public.key')

        const result = sha256withRSAverify(JSON.stringify(rawRequest.request), rawRequest.signature, sppublicKey)

        if (!result) {
            return NextResponse.json({ code: "401", message: "Unauthorized" }, { status: 401 })
        }

        if (!transaction) {
            return NextResponse.json({ code: "500", message: "Transaction Not found" })
        }

        if (transaction.status === QR_TRANSACTION_STATUS.COMPLETED || transaction.response) {
            return NextResponse.json({ code: "500", message: "Transaction already processed" })
        }

        const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })
        const auth = decrypt(transaction.agentAuth)

        if (config) {
            const amountToBeCredited = parseFloat(insertDecimalAtThirdToLast(rawRequest.request.trxAmount))

            console.log('Agent To Master Agent Account/Wallet')
            const agentToMaterWallet = await fundTransferV2(auth, {
                amount: amountToBeCredited,
                toAccountNumber: config.masterAgentWallet
            })

            transaction.agentToMaterWallet = agentToMaterWallet
            transaction.response = rawRequest.request
            transaction.status = QR_TRANSACTION_STATUS.COMPLETED
            const updateResult = await update(DB_COLLECTIONS.QR_TRANSACITON, query, transaction)

            console.log(updateResult)
        } else {

            return NextResponse.json({ code: "500", message: "An Error Occurred" })
        }




    } catch (e: any) {
        console.log(e.response.errors)
    }

    return NextResponse.json({ code: "200", message: "success" })
}

const fundTransferV2 = async (auth: string, transferRequest: any) => {
    console.log('fundTransferV2', auth, transferRequest)

    const response = await luckTayaAxios.get('/api/v1/Account/transferV2', {
        params: transferRequest,
        headers: {
            'Authorization': `Bearer ${auth}`,
        },
    })

    console.log(response.data)

    return response.data
}


const loginCommissionAccount = async (username: string, password: string) => {


    const response = await luckTayaAxios.post(`/api/v1/User/Login`, {
        username: username,
        password: password
    })
    const responseData = response.data

    return {
        accountNumber: responseData.accountNumber,
        token: responseData.token
    }
}

export {
    POST
}
