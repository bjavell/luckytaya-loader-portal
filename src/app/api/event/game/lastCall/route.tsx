"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";

const POST = async (req: NextRequest) => {
  try {
    const request = await req.json();
    const currentSession = await getCurrentSession();

    const response = await luckTayaAxios.get(
      `https://espaunan.cloud/api/v1/WsMessaging/Lastcall?Show=1&FightId=${request.fightId}&Message=Last%20Call%21%21`,

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
