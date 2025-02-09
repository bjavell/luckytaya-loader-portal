import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import axios from "axios";
import logger from "@/lib/logger";
import { DB_COLLECTIONS } from "@/classes/constants";
import { findOne } from "@/util/dbUtil";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT TRANSACTION"
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
      `/api/v1/SabongBet/GetByEventId?eventId=${eventId}`,
      {
        headers: {
          'X-Correlation-ID': correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );
    const data = response.data;
    let total = 0;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      total += element.amount;
      const fight = await luckTayaAxios.get(
        `/api/v1/SabongFight/${element.fightId}`,
        {
          headers: {
            'X-Correlation-ID': correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        }
      );
      const fightDetails = await luckTayaAxios.get(
        `/api/v1/SabongFightDetail/GetByFightId/V3/${element.fightId}`,
        {
          headers: {
            'X-Correlation-ID': correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        }
      );
      data[index].fightNum = fight.data.fightNum

      if (fightDetails.data) {
        const meron = fightDetails.data.find((x: any) => x.side == 1);
        const wala = fightDetails.data.find((x: any) => x.side == 0);
        if (meron) {
          data[index].meron = `${meron.owner} ${meron.breed}`;
        }
        if (wala) {
          data[index].wala = `${wala.owner} ${wala.breed}`;
        }
      }

      const userData = await findOne(DB_COLLECTIONS.TAYA_USERS, { 'accountNumber': data[index].accountNumber })
      data[index].playerName = ''
      if (userData) {
        data[index].playerName = `${userData.firstname} ${userData.lastname}`;
      }
    }

    logResponse = { list: data, summary: total }
    return NextResponse.json({ list: data, summary: total });
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
