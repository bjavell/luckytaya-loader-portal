"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { DB_COLLECTIONS } from "@/classes/constants";
import { insert } from "@/util/dbUtil";

const POST = async (req: NextRequest) => {
  const api = "SET FIGHT STATUS";
  let correlationId;
  let logRequest;
  let logResponse;
  let status = 200;
  try {
    correlationId = req.headers.get("x-correlation-id");
    const request = await req.json();

    logRequest = {
      ...request,
    };

    const currentSession = await getCurrentSession();
    request.fightStatusCode = parseInt(request.fightStatusCode);
    request.fightId = parseInt(request.fightId);
    // fightId: gameData.fight.fightId,
    // fightStatusCode: status,
    // parentEventId : selectedEventDet?.gameType?.parentEventId,
    // fightNum : gameData.fight.fightNum,
    // eventId : gameData.event.eventId
    const updateRequest = {
      fightStatusCode: parseInt(request.fightStatusCode),
      fightId: parseInt(request.fightId),
    };

    const token = currentSession
      ? `Bearer ${currentSession.token}`
      : req.headers.get("Authorization");
    await setStatus(token ?? "", updateRequest, correlationId ?? "");
    logResponse = { message: "Successfully Logged In!" };
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

const setStatus = async (
  token: string,
  request: any,
  correlationId: string
) => {
  const response = await luckTayaAxios.put(
    `/api/v1/SabongFight/UpdateStatus`,
    request,
    {
      headers: {
        "X-Correlation-ID": correlationId,
        Authorization: token,
      },
    }
  );
  // cancelled event
  if (request.fightStatusCode == 21) {
    await luckTayaAxios.get(
      `/api/v1/SabongRemit/Remit?fightId=${request.fightId}`,
      {
        headers: {
          "X-Correlation-ID": correlationId,
          Authorization: token,
        },
      }
    );

    const dbResult = await insert(DB_COLLECTIONS.GAMES, request);
  }
  return response.data;
};
export { POST };
