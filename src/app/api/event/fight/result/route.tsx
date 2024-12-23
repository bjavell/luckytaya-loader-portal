"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";

const POST = async (req: NextRequest) => {
  const api = "POST FIGHT RESULT"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const request = await req.json();
    const currentSession = await getCurrentSession();

    logRequest = {
      ...request
    }

    request.winSide = parseInt(request.winSide);
    request.fightId = parseInt(request.fightId);
    const response = await luckTayaAxios.post(
      `/api/v1/SabongFightResultEntry`,
      request,
      {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );

    await luckTayaAxios.get(
      `/api/v1/SabongRemit/Remit?fightId=${request.fightId}`,
      {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );
    logResponse = { message: "Successfully Logged In!" }
    return NextResponse.json({ message: "Successfully Logged In!" });
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

export { POST };
