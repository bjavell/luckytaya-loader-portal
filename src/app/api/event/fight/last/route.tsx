"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";

const GET = async (req: NextRequest) => {
  try {
    const currentSession = await getCurrentSession();

    const eventId = req.nextUrl.searchParams.get("eventId");
    const response = await luckTayaAxios.get(
      `/api/v1/SabongFight/GetLastFightNum/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );

    const data = response.data;
    data.fightDetails = await fightDetails(data.fightId)
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      {
        error: formatGenericErrorResponse(e),
      },
      { status: 500 }
    );
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
    return response.data;
  } catch (e) {
    return {};
  }
};
export { GET };
