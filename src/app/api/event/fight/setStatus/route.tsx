"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";

const POST = async (req: NextRequest) => {
  try {
    const request = await req.json();
    
    const currentSession = await getCurrentSession();
    request.fightStatusCode = parseInt(request.fightStatusCode);
    request.fightId = parseInt(request.fightId);
    
    const token = currentSession ? `Bearer ${currentSession.token}` : req.headers.get('Authorization')
    const response = await luckTayaAxios.put(
      `/api/v1/SabongFight/UpdateStatus`,
      request,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    // cancelled event
    if (request.fightStatusCode == 21) {
      await luckTayaAxios.get(
        `/api/v1/SabongRemit/Remit?fightId=${request.fightId}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );
    }
    const responseData = response.data;

    return NextResponse.json({ message: "Successfully Logged In!" });
  } catch (e) {
    console.log(e,'hello')
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
