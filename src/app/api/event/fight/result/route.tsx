"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { findOne, update } from "@/util/dbUtil";
import { DB_COLLECTIONS } from "@/classes/constants";

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
    const sabongRequest = {
      winSide : request.winSide,
      fightId : request.fightId
    }
    const response = await luckTayaAxios.post(
      `/api/v1/SabongFightResultEntry`,
      sabongRequest,
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
    if(request.details.gameType == 4){
      try {
        const {details} = request;
        const query = {eventId : {$eq : parseInt(`${request.details.eventId}`)}};
        const event = await findOne(DB_COLLECTIONS.EVENTS,query)
        const winName = details.winnerName.replace('(H)','').trim();
        if(event){
          if(event.lastWinner){
            if(1 == winName){
              event.player1Score = (event.player1Score + 1);
            }
            else if(2 == winName){
              event.player2Score = (event.player2Score + 1);
            }
            else if(3 == winName){
              event.player3Score = (event.player3Score + 1);
            }
          }else{
            event.player1Score = 0;
            event.player2Score = 0;
            event.player3Score = 0;
            if(1 == winName){
              event.player1Score = 1;
            }
            else if(2 == winName){
              event.player2Score = 1;
            }
            else if(3 == winName){
              event.player3Score = 1;
            } 
          }
          event.lastWinner = details.winnerName;
          event.lastLoser = details.loserName;
          
          const dbResponse = await update(DB_COLLECTIONS.EVENTS,query,event)
        }
      } catch (error) {
        console.log(error, "DB RESPONSE")
      }

    }

    logResponse = { message: "Successfully Set Result!" }
    return NextResponse.json({ message: "Successfully Set Result!" });
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
