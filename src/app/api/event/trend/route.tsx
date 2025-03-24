import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";

const GET = async (req: NextRequest) => {
  const api = "GET TRENDS"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const currentSession = await getCurrentSession();

 
    const eventId = req.nextUrl.searchParams.get("eventId");

    // const response = await luckTayaAxios.get(`/api/v1/SabongFightResult/Trending/${eventId}`, {
    //   headers: {
    //     'X-Correlation-ID': correlationId,
    //     Authorization: `Bearer ${currentSession.token}`,
    //   },
    // });

    const response = await otsEngine.get(`${process.env.OTS_GAME_URL}/game/trend`, {
      headers: {
        'X-Correlation-ID': correlationId
      },
      params: {
        eventId
      }
    });


    logResponse = response.data.data
    return NextResponse.json(response.data.data);
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
