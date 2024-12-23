"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";

const POST = async (req: NextRequest) => {
  const api = "SEND OPEN BET"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const request = await req.json();

    logRequest = {
      ...request
    }
    const currentSession = await getCurrentSession();

    request.eventDate = request.eventDate + ":00.000Z";
    request.venueId = parseInt(request.venueId);
    const response = await luckTayaAxios.post(
      `/api/v1/SabongEvent/V2`,
      request,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );
    const responseData = response.data;
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
