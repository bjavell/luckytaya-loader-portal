"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";

const POST = async (req: NextRequest) => {
  try {
    const request = await req.json();
    const currentSession = await getCurrentSession();

    for (let index = 0; index < request.length; index++) {
      const element = request[index];
      element.operatorId = currentSession.userId;
      if (element.id) {
        element.id = parseInt(element.id);
        delete element.operatorId;
        await luckTayaAxios.put(`/api/v1/SabongFightDetail/V3`, element, {
          headers: {
            Authorization: `Bearer ${currentSession.token}`,
          },
        });
      } else {

        delete element.operatorId;

        await luckTayaAxios.post(`/api/v1/SabongFightDetail/V3`, element, {
          headers: {
            Authorization: `Bearer ${currentSession.token}`,
          },
        });
      }
    }

    return NextResponse.json({ message: "Successfully Saved" });
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

const GET = async (fightId: number) => {
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
export { POST, GET };
