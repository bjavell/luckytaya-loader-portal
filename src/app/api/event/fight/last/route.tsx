"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";

const GET = async (req: NextRequest) => {
  const api = "GET LAST FIGHT"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const currentSession = await getCurrentSession();

    const eventId = req.nextUrl.searchParams.get("eventId");

    logRequest = {
      url: {
        eventId
      }
    }
    
    const response = await luckTayaAxios.get(
      `/api/v1/SabongFight/GetLastFightNum/${eventId}`,
      {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );

    const data = response.data;
    data.fightDetails = await fightDetails(data.fightId, correlationId);

    logResponse = data
    return NextResponse.json(data);
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

const fightDetails = async (fightId: number, correlationId: string | null) => {
  try {
    const currentSession = await getCurrentSession();

    const response = await luckTayaAxios.get(
      `/api/v1/SabongFightDetail/GetByFightId/V3/${fightId}`,
      {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );
    return response.data;
  } catch (e) {
    return NextResponse.json(
      {
        error: formatGenericErrorResponse(e),
      },
      {
        status: 500,
      }
    );
  }
};
export { GET };
