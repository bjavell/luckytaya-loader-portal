import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";

const GET = async (req: NextRequest) => {
  try {
    const currentSession = await getCurrentSession();

    const fightId = req.nextUrl.searchParams.get("fightId");
    const response = await luckTayaAxios.get(
      `/api/v1/SabongBet/GetByFightId?fightId=${fightId}`,
      {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      }
    );

    const data = response.data;
    let total = 0;
    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      total += element.amount;
      const fight = await luckTayaAxios.get(
        `/api/v1/SabongFight/${element.fightId}`,
        {
          headers: {
            Authorization: `Bearer ${currentSession.token}`,
          },
        }
      );
      const fightDetails = await luckTayaAxios.get(
        `/api/v1/SabongFightDetail/GetByFightId/V3/${element.fightId}`,
        {
          headers: {
            Authorization: `Bearer ${currentSession.token}`,
          },
        }
      );
      data[index].fightNum = fight.data.fightNum

      if (fightDetails.data) {
        const meron = fightDetails.data.find((x: any) => x.side == 1);
        const wala = fightDetails.data.find((x: any) => x.side == 0);
        if (meron) {
          data[index].meron = `${meron.owner} ${meron.breed}`;
        }
        if (wala) {
          data[index].wala = `${wala.owner} ${wala.breed}`;
        }
      }
    }
    return NextResponse.json({ list: data, summary: total });
  } catch (e) {
    return NextResponse.json(
      {
        error: formatGenericErrorResponse(e),
      },
      { status: 500 }
    );
  }
};

export { GET };
