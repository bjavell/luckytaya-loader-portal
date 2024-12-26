import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT LOCATIONS"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const currentSession = await getCurrentSession();
    const response = await luckTayaAxios.get(`/api/v1/SabongVenue`, {
      headers: {
        'X-Correlation-ID': correlationId,
        Authorization: `Bearer ${currentSession.token}`,
      },
    });
    const data = response.data.filter((x:any)=>x.venueId >= 10 && x.venueId <=21)
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

const POST = async (req: NextRequest) => {
  let result: any;
  const api = "POST EVENT LOCATION"
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

    if (request.venueId && request.venueId != 0) {
      request.venueId = parseInt(request.venueId);
      result = await luckTayaAxios.put(`/api/v1/SabongVenue`, request, {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    } else {
      delete request.venueId;
      result = await luckTayaAxios.post(`/api/v1/SabongVenue`, request, {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    }
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

export { GET, POST };
