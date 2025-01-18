import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import logger from "@/lib/logger";
import { findOne, update } from "@/util/dbUtil";
import { DB_COLLECTIONS } from "@/classes/constants";

const POST = async (req: NextRequest) => {
  const api = "FEED";
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

    const query = { code: { $eq: "CFG0002" } };

    const config = await findOne(DB_COLLECTIONS.CONFIG, query);

    await update(DB_COLLECTIONS.CONFIG, query, { ...config, ...request });

    const params = `?message=CONFIG&packetType=${200}`;

    await luckTayaAxios.get(`/api/v1/WsMessaging/BroadcastMessage${params}`, {
      headers: {
        "X-Correlation-ID": correlationId,
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

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

const GET = async (req: NextRequest) => {
  const api = "GET FEED";
  let correlationId;
  let logRequest;
  let logResponse;
  let status = 200;
  try {
    correlationId = req.headers.get("x-correlation-id");
    const currentSession = await getCurrentSession();

    logRequest = {};
    const config = await findOne(DB_COLLECTIONS.CONFIG, { code: { $eq: "CFG0002" } });
    return NextResponse.json(config);
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
export { POST, GET };
