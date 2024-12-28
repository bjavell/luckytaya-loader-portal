"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios, luckTayaMainAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import axios from "axios";
import logger from "@/lib/logger";

const POST = async (req: NextRequest) => {
  const api = "POST EVENT"
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
    const origin = req.headers.get("origin");
    const currentSession = await getCurrentSession();
    const fights = request.fights;
    delete request.fights;
    request.venueId = parseInt(request.venueId);
    let response;
    if (!request.eventId) {
      delete request.eventId;
      delete request.eventStatusCode;
      response = await luckTayaAxios.post(`/api/v1/SabongEvent/V2`, request, {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    } else {
      const copyRequest = JSON.parse(JSON.stringify(request));
      request.eventId = parseInt(request.eventId);
      request.venueId = parseInt(request.venueId);
      request.eventStatusCode = parseInt(request.eventStatusCode);

      delete request.eventStatusCodeNew;
      const eventStatusRequest = {
        eventId: parseInt(copyRequest.eventId),
        eventStatusCode: parseInt(copyRequest.eventStatusCodeNew),
      };
      if (request.eventStatusCode == 10 || request.eventStatusCode == 11)
        response = await luckTayaAxios.put(`/api/v1/SabongEvent/V2`, request, {
          headers: {
            'X-Correlation-ID': correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        });

      if (request.eventStatusCode != eventStatusRequest.eventStatusCode) {
        if (eventStatusRequest.eventStatusCode == 12) {
          await cancelFights(origin ? origin.toString() : "", fights, currentSession.token, correlationId);
        }
        await luckTayaAxios.put(
          `/api/v1/SabongEvent/UpdateStatus`,
          eventStatusRequest,
          {
            headers: {
              'X-Correlation-ID': correlationId,
              Authorization: `Bearer ${currentSession.token}`,
            },
          }
        );
      }
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

const cancelFights = async (url: string, fights: any, token: string, correlation: string | null) => {
  const requests = [];
  for (let index = 0; index < fights.length; index++) {
    const element = fights[index];
    const request = {
      fightId: element.fightId,
      fightStatusCode: element.fightStatusCode == 10 ? "20" : "21",
    };
    requests.push(fightRequest(url, request, token, correlation));
  }
  try {
    await Promise.all(requests);
  } catch (error: any) {
    if (error.response) {
      console.log('Response Status:', error.response.status);  
      console.log('Response Data:', error.response.data);  
    } else if (error.request) {
      console.log('Error URL (no response):', error.config.url);
      console.log('Request:', error.request);
    } else {
      console.log('Error message:', error.message);
    }
  }
};

const fightRequest = (url: string, request: any, token: string, correlationId: string | null) => {
  return luckTayaMainAxios.post("/api/event/fight/setStatus", request,
    {
      headers: {
        'X-Correlation-ID': correlationId,
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export { POST };
