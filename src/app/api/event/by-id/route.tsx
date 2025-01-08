import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";
import { findOne } from "@/util/dbUtil";
import { DB_COLLECTIONS } from "@/classes/constants";

const GET = async (req: NextRequest) => {
  const api = "GET EVENT BY ID DB"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const eventId = req.nextUrl.searchParams.get("eventId");
    const data = await findOne(DB_COLLECTIONS.EVENTS,{eventId : {$eq : eventId}});
    console.log(data,'hello')
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
