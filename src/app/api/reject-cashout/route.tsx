import { DB_COLLECTIONS } from "@/classes/constants"
import CustomError from "@/classes/customError"
import { getCurrentSession } from "@/context/auth"
import logger from "@/lib/logger"
import { luckTayaAxios } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import { decrypt, encrypt } from "@/util/cryptoUtil"
import { findAll, findOne, update } from "@/util/dbUtil"
import { ObjectId } from "mongodb"
import { NextRequest, NextResponse } from "next/server"

const POST = async (req: NextRequest) => {

    const api = "REJECT CASHOUT"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const { id } = await req.json()

        logRequest = {
            id
        }
        console.log('here!')
        const query = { _id: new ObjectId(id) }
        const fundingRequests = await findOne(DB_COLLECTIONS.CASHOUT_REQUESTS, query)

        console.log(fundingRequests)
        if (fundingRequests) {

            const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })
            // const auth = decrypt(transaction.agentAuth)
            if (config) {
                await otherAccountTransfer(fundingRequests.amount, fundingRequests.fromAccountNumber, config, correlationId)

                await update(DB_COLLECTIONS.CASHOUT_REQUESTS, query, { ...fundingRequests, status: 'REJECTED' })
            } else {
                throw new CustomError('No Data found', {
                    'Not found': ['Request Not Found']
                })
            }
        } else {
            throw new CustomError('No Data found', {
                'Not found': ['Request Not Found']
            })
        }



        logResponse = { message: 'Successfully Rejected!' }
        return NextResponse.json(logResponse)
    } catch (e: any) {
        // console.error(e)
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


const fundTransferV2 = async (auth: string, transferRequest: any, correlationId: string | null) => {

    const response = await luckTayaAxios.get('/api/v1/Account/transferV2', {
        params: transferRequest,
        headers: {
            'X-Correlation-ID': correlationId,
            'Authorization': `Bearer ${auth}`,
        },
    })

    console.log(response.data)

    return response.data
}


const otherAccountTransfer = async (amount: number, accountNumber: string, config: any, correlationId: string | null) => {
    try {
        const auth = config.mainMasterAuth
        await fundTransferV2(decrypt(auth), {
            amount: amount,
            toAccountNumber: accountNumber
        }, correlationId)
    } catch (e) {
        const tempAccount = await loginAccount(config, correlationId)
        await fundTransferV2(tempAccount.token, {
            amount: amount,
            toAccountNumber: accountNumber
        }, correlationId)
    }

}


const loginAccount = async (config: any, correlationId: string | null) => {
    try {


        const request = {
            username: config.mainMasterAgentUname,
            password: config.mainMasterAgentPword
        }

        console.log(request)

        const response = await luckTayaAxios.post(`/api/v1/User/Login`, request,
            {
                headers: {
                    'X-Correlation-ID': correlationId,
                },
            }
        )
        const responseData = response.data


        const updateConfig = {
            ...config
        }

        updateConfig.mainMasterAuth = encrypt(responseData.token)

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