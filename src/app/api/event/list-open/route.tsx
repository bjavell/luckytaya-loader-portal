import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";
import { findOne } from "@/util/dbUtil";
import { DB_COLLECTIONS } from "@/classes/constants";

const GET = async (req: NextRequest) => {
  const api = "GET OPEN EVENT LIST"
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
    const response = await luckTayaAxios.get(`/api/v1/SabongEvent/V2/EventWithStatusOpen`, {
      headers: {
        'X-Correlation-ID': correlationId,
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    const data = response.data.sort((a: any, b: any) => {
      const bDate = new Date(b.eventDate);
      const aDate = new Date(a.eventDate);
      return bDate.getTime() - aDate.getTime();
    });

    // const removeEvents: number[] = [];
    // for (let index = 0; index < data.length; index++) {
    //   const element = data[index];
      
    //   const eventInDB = await findOne(DB_COLLECTIONS.EVENTS, {
    //     eventId: { $eq: parseInt(element.eventId) },
    //   });
    //   // if(eventInDB){
    //   //   if(eventInDB.gameType == 6){
    //   //     removeEvents.push(element.eventId)
    //   //   }
    //   // }
    // }

    // data = data.filter((x:any)=> !removeEvents.includes(x.eventId));

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

export { GET };
