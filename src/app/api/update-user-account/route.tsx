import { DB_COLLECTIONS } from "@/classes/constants";
import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { findOne, update } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {

    try {

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
        console.log(typeof accountNumber)

        const request = {
            roles,
            accountNumber,
            accountType,
            suspended,
            userId: id
        }

        console.log(request)


        if (roles) {

            await luckTayaAxios.put('/api/v1/User/UserRoleAccountTypeUpdate', request, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                }
            })

        } else {

            if (suspended === 1) {
                console.log(id)

                await luckTayaAxios.post('/api/v1/User/SuspendUserId', {
                }, {
                    params: {
                        userId: id
                    },
                    headers: {
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
                        'Authorization': `Bearer ${currentSession.token}`,
                    }
                })
            }

        }

        const query = { userId: id }
        const user = await findOne(DB_COLLECTIONS.TAYA_USERS, query)
        console.log(user)
        if (user) {
            if (user.status === 'PENDING') {
                console.log('UPDATING USER STATUS')
                await update(DB_COLLECTIONS.TAYA_USERS, query, { ...user, status })
            }
        }
        return NextResponse.json({ message: 'Successfully updated!' })

    } catch (e: any) {
        console.error(e?.response?.data)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }
}


export {
    POST
}