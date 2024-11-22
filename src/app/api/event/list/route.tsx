import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";

const GET = async (req: NextRequest) => {
  try {
    const currentSession = await getCurrentSession();

    // const params = {
    //     dateTimeFrom: req.nextUrl.searchParams.get('startDate'),
    //     dateTimeTo: req.nextUrl.searchParams.get('endDate'),
    // }
    const response = await luckTayaAxios.get(`/api/v1/SabongEvent/V2`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    const data = response.data.sort((a: any, b: any) => {
      const bDate = new Date(b.eventDate);
      const aDate = new Date(a.eventDate);
      return bDate.getTime() - aDate.getTime();
    });

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

export { GET };
