import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";

const POST = async (req: NextRequest) => {
  const request = await req.json();

  try {
    const currentSession = await getCurrentSession();

    const params = `?message=${encodeURIComponent(request.message)}&duration=${request.duration}`
    await luckTayaAxios.get(
      `/api/v1/WsMessaging/BroadcastGlobalCrawlerMessage${params}`,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );
    return NextResponse.json({ message: "Successfully Logged In!" });
  } catch (e) {
    console.error(e);
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

export { POST };
