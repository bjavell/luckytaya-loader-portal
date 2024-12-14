"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";

const POST = async (req: NextRequest) => {
  try {
    const request = await req.json();
    const currentSession = await getCurrentSession();

    request.venueId = parseInt(request.venueId);
    let response;
    if (!request.eventId) {
      delete request.eventId;
      delete request.eventStatusCode;
      response = await luckTayaAxios.post(`/api/v1/SabongEvent/V2`, request, {
        headers: {
          Authorization: `Bearer ${currentSession.token}`,
        },
      });
    } else {
      const copyRequest = JSON.parse(JSON.stringify(request));
      request.eventId = parseInt(request.eventId);
      request.venueId = parseInt(request.venueId);
      request.eventStatusCode = parseInt(request.eventStatusCode);

      delete request.eventStatusCodeNew;
      const eventStatusRequest = {
        eventId: parseInt(copyRequest.eventId),
        eventStatusCode: parseInt(copyRequest.eventStatusCodeNew),
      };

      if (request.eventStatusCode == 10)
        response = await luckTayaAxios.put(`/api/v1/SabongEvent/V2`, request, {
          headers: {
            Authorization: `Bearer ${currentSession.token}`,
          },
        });

      if (request.eventStatusCode != eventStatusRequest.eventStatusCode) {
        await luckTayaAxios.put(
          `/api/v1/SabongEvent/UpdateStatus`,
          eventStatusRequest,
          {
            headers: {
              Authorization: `Bearer ${currentSession.token}`,
            },
          }
        );
      }
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

export { POST };
