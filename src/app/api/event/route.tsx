"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import axios from "axios";

const POST = async (req: NextRequest) => {
  try {
    const request = await req.json();
    const origin = req.headers.get("origin");
    const currentSession = await getCurrentSession();
    const fights = request.fights;
    delete request.fights;
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
        if (eventStatusRequest.eventStatusCode == 12) {
          await cancelFights(origin? origin.toString() : "", fights, currentSession.token);
        }
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

const cancelFights = async (url: string, fights: any, token: string) => {
  const requests = [];
  for (let index = 0; index < fights.length; index++) {
    const element = fights[index];
    const request = {
      fightId: element.fightId,
      fightStatusCode: element.fightStatusCode == 10 ? "20" : "21",
    };
    requests.push(fightRequest(url, request,token));
  }
  try {
    await Promise.all(requests);
  } catch (error) {
    console.log(error, "error============Cancel Fights");
  }
};

const fightRequest = (url: string, request: any,token : string) => {
  return axios.post(url + "/api/event/fight/setStatus", request,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
export { POST };
