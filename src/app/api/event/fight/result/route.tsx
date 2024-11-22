"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";

const POST = async (req: NextRequest) => {
  try {
    const request = await req.json();
    const currentSession = await getCurrentSession();
    
    request.winSide = parseInt(request.winSide)
    request.fightId = parseInt(request.fightId)
    console.log(request,'--------')
    const response = await luckTayaAxios.post(
      `/api/v1/SabongFightResultEntry`,
      request,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );

    await luckTayaAxios.get(
      `/api/v1/SabongRemit/Remit?fightId=${request.fightId}`,
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
