import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT BET DETAILS"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const currentSession = await getCurrentSession();
    const fightId = req.nextUrl.searchParams.get("fightId");


    logRequest = {
      url: {
        fightId
      }
    }


    const response = await luckTayaAxios.get(
      `/api/v1/WsMessaging/GetBetRegister?fightId=${fightId}`,
      {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );



    logResponse = JSON.parse(response.data.jsonPacket)

    return NextResponse.json(JSON.parse(response.data.jsonPacket));
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
};

export { GET };
