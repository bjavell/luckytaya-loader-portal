import { getCurrentSession } from "@/context/auth"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil"
import { NextRequest, NextResponse } from "next/server"
import { findOne, update } from "@/util/dbUtil"
import { ACCOUNT_TYPE, DB_COLLECTIONS } from "@/classes/constants"
import { decrypt, encrypt } from "@/util/cryptoUtil"

const POST = async (req: NextRequest) => {

    let correlationId: string | null = "";
    try {
        correlationId = req.headers.get("x-correlation-id");
        const currentSession = await getCurrentSession()
        const { amount, toAccountNumber, comFee, convFee } = await req.json()

        // const toAccount = await findOne(DB_COLLECTIONS.TAYA_AGENTS, { 'response.accountNumber': Number(toAccountNumber) })

        // if (!toAccount) {
        //     throw new Error('Account not found');
        // }

        const otsWalletResponse = await otsEngine.post(`${process.env.OTS_WALLET_URL}/wallet/transact`, {
            amount: amount,
            userId: String(currentSession.userId),
            toUserId: String(toAccountNumber),
            type: "CREDIT",
            otherDetails: {
                action: 'Transfer'
            }

        }, {
            headers: {
                'X-Correlation-ID': correlationId
            }
        });


        //console.log('Agent to Player')
        // await luckTayaAxios.get(`/api/v1/Account/transferV2`, {
        //     params: {
        //         amount: amount,
        //         toAccountnumber: toAccountNumber
        //     },
        //     headers: {
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })

        // //console.log('Agent to Fee')
        // // await otherAccountTransfer(convFee * -1, toAccountNumber, config, ACCOUNT_TYPE.FEE)
        // await luckTayaAxios.get(`/api/v1/Account/transferV2`, {
        //     params: {
        //         amount: convFee,
        //         toAccountnumber: config.convenienceAccountNumber
        //     },
        //     headers: {
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })

        // //console.log('Agent to Commission')
        // // await otherAccountTransfer(comFee * -1, toAccountNumber, config, ACCOUNT_TYPE.COMMISSION)
        // await luckTayaAxios.get(`/api/v1/Account/transferV2`, {
        //     params: {
        //         amount: comFee,
        //         toAccountnumber: config.commissionAccountNumber
        //     },
        //     headers: {
        //         'Authorization': `Bearer ${currentSession.token}`,
        //     },
        // })

        // //console.log('Commission to Agent')
        // await otherAccountTransfer(comFee, currentSession.accountNumber, config, ACCOUNT_TYPE.COMMISSION)


        if (otsWalletResponse.data.success)
            return NextResponse.json({ message: 'Successfully Cashed-In!' })
        else {
            throw new Error(otsWalletResponse.data.errors.message)
        }
    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }
}


const fundTransferV2 = async (auth: string, transferRequest: any) => {

    const response = await luckTayaAxios.get('/api/v1/Account/transferV2', {
        params: transferRequest,
        headers: {
            'Authorization': `Bearer ${auth}`,
        },
    })

    return response.data
}

const otherAccountTransfer = async (amount: number, accountNumber: string, config: any, accountType: string) => {
    try {
        let auth
        if (accountType === ACCOUNT_TYPE.MASTER) {
            auth = config.masterWalletAuth
        } else if (accountType === ACCOUNT_TYPE.COMMISSION) {
            auth = config.commissionAuth
        } else if (accountType === ACCOUNT_TYPE.FEE) {
            auth = config.convenienceAuth
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
        } else if (accountType === ACCOUNT_TYPE.FEE) {
            username = config.convenienceUsername
            password = config.conveniencePassword
        }

        const request = {
            username,
            password
        }

        const response = await luckTayaAxios.post(`/api/v1/User/Login`, request)
        const responseData = response.data


        const updateConfig = {
            ...config
        }

        if (accountType === ACCOUNT_TYPE.COMMISSION) {
            updateConfig.commissionAuth = encrypt(responseData.token)
        } else if (accountType === ACCOUNT_TYPE.MASTER) {
            updateConfig.masterWalletAuth = encrypt(responseData.token)
        } else if (accountType === ACCOUNT_TYPE.FEE) {
            updateConfig.convenienceAuth = encrypt(responseData.token)
        }

        await update(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' }, updateConfig)

        return {
            accountNumber: responseData.accountNumber,
            token: responseData.token
        }
    } catch (e) {
    }

    return {
        accountNumber: '',
        token: ''
    }
}


export {
    POST
}
