"use server";
import { luckTayaAxios } from "@/util/axiosUtil";;
import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";


const GET = async (req: NextRequest) => {
  try {
    const currentSession = await getCurrentSession();
    const fightId = req.nextUrl.searchParams.get('fightId')
    const response = await luckTayaAxios.get(
      `/api/v1/SabongFight/WithDetails/V2/${fightId}`,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );

    return NextResponse.json(response.data)
  } catch (e) {
    return {};
  }
};
export { GET };
