import { ACCOUNT_TYPE, DB_COLLECTIONS, QR_TRANSACTION_STATUS } from "@/classes/constants";
import { findOne, update } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";
import * as fs from 'fs'
import { decrypt, encrypt, sha256withRSAverify } from "@/util/cryptoUtil";
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

        transaction.response = rawRequest.request
        if (config) {

            if (rawRequest.request.trxState === 'SUCCESS') {


                // const commissionFee = parseFloat(transaction.commissionFee)
                const fees = parseFloat(transaction.convenienceFee) // + commissionFee
                // const commissionFee = parseFloat(transaction.commissionFee)
                const amountToBeCredited = parseFloat(insertDecimalAtThirdToLast(rawRequest.request.trxAmount))

                // const masterAgentAccount = await loginAccount(config, ACCOUNT_TYPE.MASTER)
                console.log('Master Agent to Agent')
                const masterAgentToAgent = await otherAccountTransfer(amountToBeCredited, transaction.accountNumber, config, ACCOUNT_TYPE.MASTER)

                // console.log('Agent to Commission Account/Wallet')
                // const agentToCommission = await fundTransferV2(auth, {
                //     amount: commissionFee,
                //     toAccountNumber: config.commissionAccountNumber
                // })

                // console.log('Agent To Incovenience Fee Account/Wallet')
                // const agentToFee = await fundTransferV2(auth, {
                //     amount: fees,
                //     toAccountNumber: config.commissionAccountNumber
                // })

                // console.log('Commission Account/Wallet to Agent')
                // const commissionToAgent = await otherAccountTransfer(commissionFee, transaction.agentAccountNumber, config, ACCOUNT_TYPE.COMMISSION)



                // transaction.agentToFee = agentToFee
                // transaction.agentToCommission = agentToCommission
                transaction.masterAgentToAgent = masterAgentToAgent
                // transaction.commissionToAgent = commissionToAgent
                // transaction.commissionFeeToAgent = commissionFeeToAgent
                // transaction.agentToAgentPlayer = agentToAgentPlayer
                transaction.status = QR_TRANSACTION_STATUS.COMPLETED
            } else {
                transaction.status = QR_TRANSACTION_STATUS.FAILED
            }
            await update(DB_COLLECTIONS.QR_TRANSACITON, query, transaction)

        } else {

            return NextResponse.json({ code: "500", message: "Oops! an error occurred" })
        }




    } catch (e: any) {
        console.log(e.response.errors)
    }

    return NextResponse.json({ code: "200", message: "success" })
}

const fundTransferV2 = async (auth: string, transferRequest: any) => {

    const response = await luckTayaAxios.get('/api/v1/Account/transferV2', {
        params: transferRequest,
        headers: {
            'Authorization': `Bearer ${auth}`,
        },
    })

    console.log(response.data)

    return response.data
}


const otherAccountTransfer = async (amount: number, accountNumber: string, config: any, accountType: string) => {
    try {
        let auth
        if (accountType === ACCOUNT_TYPE.MASTER) {
            auth = config.masterWalletAuth
        } else if (accountType === ACCOUNT_TYPE.COMMISSION) {
            auth = config.commissionAuth
        }
        await fundTransferV2(decrypt(auth), {
            amount: amount,
            toAccountNumber: accountNumber
        })
    } catch (e) {
        const tempAccount = await loginAccount(config, accountType)
        await fundTransferV2(tempAccount.token, {
            amount: amount,
            toAccountNumber: accountNumber
        })
    }

}


const loginAccount = async (config: any, accountType: string) => {
    try {

        let username, password

        if (accountType === ACCOUNT_TYPE.COMMISSION) {
            username = config.commissionUsername
            password = config.commissionPassword
        } else if (accountType === ACCOUNT_TYPE.MASTER) {
            username = config.masterUsername
            password = config.masterPassword
        }

        const request = {
            username,
            password
        }

        console.log(request)

        const response = await luckTayaAxios.post(`/api/v1/User/Login`, request)
        const responseData = response.data


        const updateConfig = {
            ...config
        }

        if (accountType === ACCOUNT_TYPE.COMMISSION) {
            updateConfig.commissionAuth = encrypt(responseData.token)
        } else if (accountType === ACCOUNT_TYPE.MASTER) {
            updateConfig.masterWalletAuth = encrypt(responseData.token)
        }

        await update(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' }, updateConfig)

        return {
            accountNumber: responseData.accountNumber,
            token: responseData.token
        }
    } catch (e) {
        console.log(e)
    }

    return {
        accountNumber: '',
        token: ''
    }
}

export {
    POST
}
