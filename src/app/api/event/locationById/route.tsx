import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT LOCATION BY ID"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const currentSession = await getCurrentSession();
    // const params = {
    //     dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
    //     dateTimeTo: req.nextUrl.searchParams.get('endDate'),
    // }
    const venueId = req.nextUrl.searchParams.get("venueId");

    logRequest = {
      url: {
        venueId
      }
    }
    const response = await luckTayaAxios.get(`/api/v1/SabongVenue/${venueId}`, {
      headers: {
        'X-Correlation-ID': correlationId,
        Authorization: `Bearer ${currentSession.token}`,
      },
    });
    logResponse = response.data
    return NextResponse.json(response.data);
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
