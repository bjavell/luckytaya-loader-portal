"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import axios from "axios";
import logger from "@/lib/logger";
import { fi } from "date-fns/locale";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT FIGHT";
  let correlationId;
  let logRequest;
  let logResponse;
  let status = 200;
  try {
    correlationId = req.headers.get("x-correlation-id");
    const currentSession = await getCurrentSession();
    const token = currentSession
      ? `Bearer ${currentSession.token}`
      : req.headers.get("Authorization");

    const eventId = req.nextUrl.searchParams.get("eventId");
    logRequest = {
      url: {
        eventId,
      },
    };
    

    const response = await otsEngine.get(`${process.env.OTS_GAME_URL}/game/all`,{
      headers: {
        'X-Correlation-ID': correlationId
      },
      params: {
        eventId: eventId
      }
    });


    // const response = await luckTayaAxios.get(
    //   `/api/v1/SabongFight/WithDetailsByEventIdV2/${eventId}`,
    //   {
    //     headers: {
    //       "X-Correlation-ID": correlationId,
    //       Authorization: `${token}`,
    //     },
    //   }
    // );
    const data = response.data.data.games.sort((a: any, b: any) => {
      const bDate = new Date(b.createdDate);
      const aDate = new Date(a.createdDate);
      return bDate.getTime() - aDate.getTime();
    });

    logResponse = data;

    return NextResponse.json(data);
  } catch (e: any) {
    logger.error(api, {
      correlationId,
      error: e.message,
      errorStack: e.stack,
    });

    status = 500;
    logResponse = formatGenericErrorResponse(e);
    return NextResponse.json(
      {
        error: logResponse,
      },
      {
        status: 500,
      }
    );
  } finally {
    logger.info(api, {
      correlationId,
      apiLog: {
        status,
        request: logRequest,
        response: logResponse,
      },
    });
  }
};

const POST = async (req: NextRequest) => {
  const api = "POST EVENT FIGHT";
  let correlationId;
  let logRequest;
  let logResponse;
  let status = 200;
  let fightResult: any;
  let isContinue = true;
  let result: any;
  const currentSession = await getCurrentSession();
  const request = await req.json();
  const { fightDetails, fight } = request;

  const token = currentSession
    ? `Bearer ${currentSession.token}`
    : req.headers.get("Authorization");
  const userId = currentSession
    ? `${currentSession.userId}`
    : req.headers.get("UserId");
  try {
    logRequest = {
      fightDetails,
      fight,
    };
    correlationId = req.headers.get("x-correlation-id");
    fight.eventId = fight.eventId;
    fight.fightNum = fight.fightNum;
    if (fight.fightId && fight.fightId != 0) {
      fight.fightId = fight.fightId;

      

      fightResult = await otsEngine.post(`${process.env.OTS_GAME_URL}/game/add`,
      {
        eventId: fight.eventId,
        gameNumber: fight.fightNum,

      },
      
      {
      headers: {
        'X-Correlation-ID': correlationId
      }
    });
      // fightResult = await luckTayaAxios.put(`/api/v1/SabongFight`, fight, {
      //   headers: {
      //     "X-Correlation-ID": correlationId,
      //     Authorization: `${token}`,
      //   },
      // });
    } else {

      fightResult = await otsEngine.post(`${process.env.OTS_GAME_URL}/game/add`,
        {
          eventId: fight.eventId,
          venueId: fight.venueId,
          gameNumber: fight.fightNum,
          players: fightDetails
        },
        {
        headers: {
          'X-Correlation-ID': correlationId
        }})

      // fightResult = await luckTayaAxios.post(`/api/v1/SabongFight`, fight, {
      //   headers: {
      //     "X-Correlation-ID": correlationId,
      //     Authorization: `${token}`,
      //   },
      // });
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
      element.operatorId = userId;
      if (element.id) {
        element.id = parseInt(element.id);
        delete element.operatorId;

        delete element.imageBase64;
        element.picture = "";
        await luckTayaAxios.put(`/api/v1/SabongFightDetail`, element, {
          headers: {
            "X-Correlation-ID": correlationId,
            Authorization: `${token}`,
          },
        });
      } else {
        element.fightId = fightResult.fightId;
        delete element.operatorId;
        delete element.id;
        delete element.imageBase64;
        element.picture = "";
        // await luckTayaAxios.post(`/api/v1/SabongFightDetail/`, element, {
        //   headers: {
        //     "X-Correlation-ID": correlationId,
        //     Authorization: `${token}`,
        //   },
        // });
      }
    }
    return NextResponse.json({ message: "Successfully Logged In!" });
  } catch (e: any) {
    logger.error(api, {
      correlationId,
      error: e.message,
      errorStack: e.stack,
    });

    status = 500;
    logResponse = formatGenericErrorResponse(e);
    return NextResponse.json(
      {
        error: logResponse,
      },
      {
        status: 500,
      }
    );
  } finally {
    logger.info(api, {
      correlationId,
      apiLog: {
        status,
        request: logRequest,
        response: logResponse,
      },
    });
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
