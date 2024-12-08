import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { NextRequest, NextResponse } from "next/server";

const POST = async (req: NextRequest) => {

    try {

        const { username } = await req.json()
        const response = await luckTayaAxios.get('/api/v1/User/ForgotPassword/V2', {
            params: {
                username
            }
        })

        console.log(response)

        return NextResponse.json({ 'message': 'Password is sent to your email!' })

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