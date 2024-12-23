import { DB_COLLECTIONS } from "@/classes/constants";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { findOne, update } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {
    const api = "UPDATE USER ACCOUNT"
    let correlationId
    let logRequest
    let logResponse
    let status = 200

    try {
        correlationId = req.headers.get('x-correlation-id');
        
        const currentSession = await getCurrentSession()
        const { accountNumber, accountType, suspended, id, status } = await req.json()

        let roles
        if (accountType === 3 || accountType === 6) {
            roles = ['acctmgr']
        } else if (accountType === 4 || accountType === 5) {
            roles = ['eventmgr']
        } else if (accountType === 1) {
            roles = ['finance']
        } else if (accountType === 9) {
            roles = ['admin']
        }
        //console.log(typeof accountNumber)

        const request = {
            roles,
            accountNumber,
            accountType,
            suspended,
            userId: id
        }

        
        logRequest = {
            ...request
        }


        //console.log(request)


        if (roles) {

            await luckTayaAxios.put('/api/v1/User/UserRoleAccountTypeUpdate', request, {
                headers: {
                    'X-Correlation-ID': correlationId,
                    'Authorization': `Bearer ${currentSession.token}`,
                }
            })

        } else {

            if (suspended === 1) {
                //console.log(id)

                await luckTayaAxios.post('/api/v1/User/SuspendUserId', {
                }, {
                    params: {
                        userId: id
                    },
                    headers: {
                        'X-Correlation-ID': correlationId,
                        'Authorization': `Bearer ${currentSession.token}`,
                    }
                })
            } else {

                await luckTayaAxios.post('/api/v1/User/UnsuspendUserId', {
                }, {
                    params: {
                        userId: id
                    },
                    headers: {
                        'X-Correlation-ID': correlationId,
                        'Authorization': `Bearer ${currentSession.token}`,
                    }
                })
            }

        }

        const query = { userId: id }
        const user = await findOne(DB_COLLECTIONS.TAYA_USERS, query)
        //console.log(user)
        if (user) {
            if (user.status === 'PENDING') {
                //console.log('UPDATING USER STATUS')
                await update(DB_COLLECTIONS.TAYA_USERS, query, { ...user, status })
            }
        }

        logResponse = { message: 'Successfully updated!' }
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

    }finally {
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