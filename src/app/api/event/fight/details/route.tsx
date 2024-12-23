"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import axios from "axios";
import logger from "@/lib/logger";

const POST = async (req: NextRequest) => {
  const api = "POST FIGHT DETAILS"
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

    for (let index = 0; index < request.length; index++) {
      const element = request[index];
      element.operatorId = currentSession.userId;
      if (element.id) {
        element.id = parseInt(element.id);
        delete element.operatorId;
        await luckTayaAxios.put(`/api/v1/SabongFightDetail/V3`, element, {
          headers: {
            'X-Correlation-ID': correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        });
      } else {
        delete element.operatorId;

        await luckTayaAxios.post(`/api/v1/SabongFightDetail/V3`, element, {
          headers: {
            'X-Correlation-ID': correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        });
      }
    }
    logResponse = { message: "Successfully Saved" }
    return NextResponse.json({ message: "Successfully Saved" });
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

const GET = async (req: NextRequest) => {
  const api = "GET FIGHT DETAILS"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const fightId = req.nextUrl.searchParams.get("fightId");

    logRequest = {
      url: {
        fightId
      }
    }
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
export { POST, GET };
