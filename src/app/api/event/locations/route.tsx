import { getCurrentSession } from "@/context/auth";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";

const GET = async (req: NextRequest) => {
  try {
    const currentSession = await getCurrentSession();
    const response = await luckTayaAxios.get(`/api/v1/SabongVenue`, {
      headers: {
        Authorization: `Bearer ${currentSession.token}`,
      },
    });

    return NextResponse.json(response.data);
  } catch (e) {
    return NextResponse.json(
      {
        error: formatGenericErrorResponse(e),
      },
      { status: 500 }
    );
  }
};

const POST = async (req: NextRequest) => {
  const request = await req.json();
  let result: any;
  try {
    const currentSession = await getCurrentSession();

    if (request.venueId && request.venueId != 0) {
      request.venueId = parseInt(request.venueId);
      result = await luckTayaAxios.put(`/api/v1/SabongVenue`, request, {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    } else {
      delete request.venueId;   
      result = await luckTayaAxios.post(`/api/v1/SabongVenue`, request, {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    }

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

export { GET, POST };
