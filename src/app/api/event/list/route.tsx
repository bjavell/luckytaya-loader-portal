import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios, otsEngine } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT LIST"
  let correlationId: string | null = null;
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


    const response = await otsEngine.get(`${process.env.OTS_GAME_URL}/game/event/all`, {
      headers: {
        'X-Correlation-ID': correlationId
      },
    });


    // const response = await luckTayaAxios.get(`/api/v1/SabongEvent/V2`, {
    //   headers: {
    //     'X-Correlation-ID': correlationId,
    //     Authorization: `Bearer ${currentSession.token}`,
    //   },
    // });

    const updatedResponse = await Promise.all(response.data.data.event.map(async (event: any) => {
      try {

        const venueResponse = await otsEngine.get(`${process.env.OTS_GAME_URL}/game/venue`, {
          headers: {
            'X-Correlation-ID': correlationId
          },
          params:{
            venueId: event.venueId
          }
        });
        console.log(venueResponse.data)
  
        return {
          ...event,
          venueName: venueResponse.data.data.venueName
        }
      } catch (e){
        console.log('error',e)
        return {
          ...event,
          venueName: 'N/A'
        }
      }
    }))


    const data = updatedResponse.sort((a: any, b: any) => {
      const bDate = new Date(b.eventDate);
      const aDate = new Date(a.eventDate);
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

export { GET };
