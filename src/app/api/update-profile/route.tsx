import { DB_COLLECTIONS } from "@/classes/constants";
import CustomError from "@/classes/customError";
import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { decrypt } from "@/util/cryptoUtil";
import { findOne } from "@/util/dbUtil";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {

    try {

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
        
        const accountExists = await findOne(DB_COLLECTIONS.TAYA_AGENTS, {
            $or: [
                { 'request.email': request.email },
                { 'request.phoneNumber': request.phoneNumber }
            ]
        })


        if (accountExists) {
            throw new CustomError('Bad request', {
                'Bad request': [`Email or Mobile already exists`]
            })
        }


        
        await luckTayaAxios.put('/api/v1/User/UpdateV2', decryptedRequest, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        if (decryptedRequest.newPassword && decryptedRequest.confirmPassword) {
            await luckTayaAxios.post('/api/v1/User/ChangePasswordV2', decryptedRequest, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })
        }

        console.log(decryptedRequest)



        return NextResponse.json({ 'message': 'Successfully updated!' })

    } catch (e) {
        console.error(e)
        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })

    }

}

export {
    POST
}