"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import axios from "axios";
import logger from "@/lib/logger";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT FIGHT"
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
    //console.log(eventId,'hello')
    const response = await luckTayaAxios.get(
      `/api/v1/SabongFight/WithDetailsByEventIdV2/${eventId}`,
      {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );
    const data = response.data.sort((a: any, b: any) => {
      const bDate = new Date(b.fight.entryDateTime);
      const aDate = new Date(a.fight.entryDateTime);
      return bDate.getTime() - aDate.getTime();
    });

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
  const api = "POST EVENT FIGHT"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  let fightResult: any;
  let isContinue = true;
  let result: any;
  const currentSession = await getCurrentSession();
  const request = await req.json(); 
  const { fightDetails, fight } = request;
  
  try {
    logRequest = {
      fightDetails,
      fight
    }
    correlationId = req.headers.get('x-correlation-id');
    fight.eventId = parseInt(fight.eventId);
    fight.fightNum = parseInt(fight.fightNum);
    if (fight.fightId && fight.fightId != 0) {
      fight.fightId = parseInt(fight.fightId);
      fightResult = await luckTayaAxios.put(`/api/v1/SabongFight`, fight, {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    } else {
      fightResult = await luckTayaAxios.post(`/api/v1/SabongFight`, fight, {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    }

    fightResult = fightResult.data;
  } catch (error: any) {
    isContinue = false;
    result = error;
    const { data } = error.response;

    if (data.detail == "Bad request") {
      if (data.errors[data.detail][0].includes("already exists")) {
        isContinue = true;
        fightResult = fight;
      }
    }
  }

  if (!isContinue) {
    return NextResponse.json(
      {
        error: formatGenericErrorResponse(result),
      },
      {
        status: 500,
      }
    );
  }

  try {
    for (let index = 0; index < fightDetails.length; index++) {
      const element = fightDetails[index];
      element.fightId = fightResult.fightId;
      element.operatorId = currentSession.userId;
      if (element.id) {
        element.id = parseInt(element.id);
        delete element.operatorId;

        delete element.imageBase64;
        element.picture = "";
        await luckTayaAxios.put(`/api/v1/SabongFightDetail`, element, {
          headers: {
            'X-Correlation-ID': correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        });
      } else {
        element.fightId = fightResult.fightId;
        delete element.operatorId;
        delete element.id;
        delete element.imageBase64;
        element.picture = "";
        await luckTayaAxios.post(`/api/v1/SabongFightDetail/`, element, {
          headers: {
            'X-Correlation-ID': correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        });
      }
    }
    return NextResponse.json({ message: "Successfully Logged In!" });
  }  catch (e: any) {
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

const fightDetails = async (fightId: number) => {
  try {
    const currentSession = await getCurrentSession();

    const response = await luckTayaAxios.get(
      `/api/v1/SabongFightDetail/GetByFightId/V3/${fightId}`,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );

    return NextResponse.json(response.data);
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
export { POST, GET };
