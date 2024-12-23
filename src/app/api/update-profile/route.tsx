import { DB_COLLECTIONS } from "@/classes/constants";
import CustomError from "@/classes/customError";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { decrypt } from "@/util/cryptoUtil";
import { findAll, findOne, update } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {

    const api = "UPDATE PROFILE"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {

        correlationId = req.headers.get('x-correlation-id');
        const request = await req.json()
        const currentSession = await getCurrentSession()

        const decryptedRequest = {
            ...request,
            currentPassword: decrypt(request.currentPassword),
            newPassword: decrypt(request.newPassword),
            confirmPassword: decrypt(request.confirmPassword),
            userId: currentSession.userId,
            username: currentSession.username,
            facebookAccount: currentSession.facebookAccount,
            referralCode: currentSession.referralCode
        }

        logRequest = {
            ...request,
            currentPassword: 'XXXXXX',
            newPassword: 'XXXXXX',
            confirmPassword: 'XXXXXX'
        }



        const accountExists = await findOne(DB_COLLECTIONS.TAYA_AGENTS, {
            $or: [
                { 'response.email': request.email },
                { 'response.phoneNumber': request.phoneNumber }
            ]
        })


        if (accountExists && currentSession.userId !== accountExists.response.userId) {
            throw new CustomError('Bad request', {
                'Bad request': [`Email or Mobile already exists`]
            })
        }

        const updateResponse = await luckTayaAxios.put('/api/v1/User/UpdateV2', decryptedRequest, {
            headers: {
                'X-Correlation-ID': correlationId,
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const accountQuery = { 'response.userId': updateResponse.data.userId }
        //console.log(accountQuery)

        const account = await findOne(DB_COLLECTIONS.TAYA_AGENTS, accountQuery)
        //console.log('account', account)

        if (account) {
            const updatedAccount = {
                ...account,
                response: {
                    ...account?.response,
                    ...updateResponse.data
                }
            }

            await update(DB_COLLECTIONS.TAYA_AGENTS, accountQuery, updatedAccount)
        }

        if (decryptedRequest.newPassword && decryptedRequest.confirmPassword) {
            await luckTayaAxios.post('/api/v1/User/ChangePasswordV2', decryptedRequest, {
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
        }

        //console.log(decryptedRequest)



        logResponse = { 'message': 'Successfully updated!' }

        return NextResponse.json(logResponse)

    } catch (e: any) {
        logger.error(api, {
            correlationId,
            error: e.message,
            errorStack: e.stack
        })

        status = 500
        logResponse = formatGenericErrorResponse(e)
        return NextResponse.json({
            error: logResponse
        },
            { status: 500 })
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

export {
    POST
}