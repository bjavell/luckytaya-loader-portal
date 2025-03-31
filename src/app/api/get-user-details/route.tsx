import { getCurrentSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil"
import { formatGenericErrorResponse } from "@/util/commonResponse"
import logger from "@/lib/logger"

const GET = async (req: NextRequest) => {
    const api = "GET USER DETAILS"
    let correlationId
    let logRequest
    let logResponse
    let status = 200
    try {
        correlationId = req.headers.get('x-correlation-id');
        const currentSession = await getCurrentSession()

        logRequest = {
            username: currentSession.username
        }
        //console.log(currentSession.token,'---------')
        const response = await luckTayaAxios.get(`/api/v1/UserAccount/MyAccount`, {
            headers: {
                'X-Correlation-ID': correlationId,
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })
  
      const otsWalletResponse = await otsEngine.get(`${process.env.OTS_WALLET_URL}/wallet/balance`, {
        headers: {
          'X-Correlation-ID': correlationId
        },
        params: {
            userId: currentSession.userId
        }
      });
        const responseData = response.data
        responseData.balance = otsWalletResponse.data.data.balance

        responseData.roles = currentSession.roles
        logResponse = responseData
        return NextResponse.json(responseData)
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

export { GET }
