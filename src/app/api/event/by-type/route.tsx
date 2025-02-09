import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";
import { findAll, findOne } from "@/util/dbUtil";
import { DB_COLLECTIONS } from "@/classes/constants";

const GET = async (req: NextRequest) => {
  const api = "GET EVENTS BY TYPE"
  let correlationId
  let logRequest
  let logResponse
  let status = 200
  try {
    correlationId = req.headers.get('x-correlation-id');
    const type = req.nextUrl.searchParams.get("type");
    const query = {"gameType" : {$eq : type}};
    let data = await findAll(DB_COLLECTIONS.EVENTS,query);

    if(type == "6"){
      const child =await findAll(DB_COLLECTIONS.EVENTS,{"gameType" : {$eq : "7"}, "parentEventId" : {$exists: true}});
      const parentIds = child.map((x:any)=> x.parentEventId);
      data = data.filter((x:any)=> !parentIds.includes(x.eventId.toString()))
    }
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
