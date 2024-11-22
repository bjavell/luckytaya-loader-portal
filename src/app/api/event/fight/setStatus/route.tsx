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
    console.log(request, "--------");
    const response = await luckTayaAxios.put(
      `/api/v1/SabongFight/UpdateStatus`,
      request,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );
    const responseData = response.data;

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
