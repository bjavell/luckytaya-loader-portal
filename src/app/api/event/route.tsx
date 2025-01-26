"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios, luckTayaMainAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { findAll, findOne, insert, update } from "@/util/dbUtil";
import { DB_COLLECTIONS } from "@/classes/constants";
import { localAxios } from "@/util/localAxiosUtil";
import { transferFromMaster } from "@/common/transaction";

const POST = async (req: NextRequest) => {
  const api = "POST EVENT";
  let correlationId: string | null = '';
  let logRequest;
  let logResponse;
  let status = 200;
  try {
    correlationId = req.headers.get("x-correlation-id");
    const request = await req.json();
    logRequest = {
      ...request,
    };
    const origin = req.headers.get("origin");
    const currentSession = await getCurrentSession();
    const fights = request.fights;
    delete request.fights;
    request.venueId = parseInt(request.venueId);
    let response;
    if (!request.eventId) {
      delete request.eventId;
      delete request.eventStatusCode;
      const eventDetails = request.details
        ? Object.assign({}, request.details)
        : {};
      delete request.details;
      response = await luckTayaAxios.post(`/api/v1/SabongEvent/V2`, request, {
        headers: {
          "X-Correlation-ID": correlationId,
          Authorization: `Bearer ${currentSession.token}`,
        },
      });

      const dbResult = await insert(DB_COLLECTIONS.EVENTS, {
        eventId: response.data.eventId,
        ...eventDetails,
      });

      const gameRequest = {
        fight: {
          fightNum: "1",
          eventId: response.data.eventId,
        },
        fightDetails: [
          {
            id: "",
            side: 1,
            owner: eventDetails.player1 ?? "",
            breed: eventDetails.player1Other ?? "",
            weight: "",
            tag: "",
            imageBase64: "",
            operatorId: 0,
          },
          {
            id: "",
            side: 0,
            owner: eventDetails.player2 ?? "",
            breed: eventDetails.player2Other ?? "",
            weight: "",
            tag: "",
            imageBase64: "",
            operatorId: 0,
          },
        ],
      };

      try {
        const resgame = await createGame(
          gameRequest,
          currentSession.token,
          currentSession.userId,
          correlationId
        );
      } catch (error: any) {
      }
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

      const query = { eventId: parseInt(copyRequest.eventId) };
      const previousData = await findOne(DB_COLLECTIONS.EVENTS, query);

      if (previousData) {
        const eventDetails = request.details
          ? Object.assign({}, request.details)
          : {};
        await update(DB_COLLECTIONS.EVENTS, query, {
          ...previousData,
          ...eventDetails,
        });
      }
      if (request.eventStatusCode == 10 || request.eventStatusCode == 11)
        response = await luckTayaAxios.put(`/api/v1/SabongEvent/V2`, request, {
          headers: {
            "X-Correlation-ID": correlationId,
            Authorization: `Bearer ${currentSession.token}`,
          },
        });

      if (request.eventStatusCode != eventStatusRequest.eventStatusCode) {
        if (eventStatusRequest.eventStatusCode == 12) {
          await cancelFights(
            origin ? origin.toString() : "",
            fights,
            currentSession.token,
            correlationId
          );
        }
        
        await luckTayaAxios.put(
          `/api/v1/SabongEvent/UpdateStatus`,
          eventStatusRequest,
          {
            headers: {
              "X-Correlation-ID": correlationId,
              Authorization: `Bearer ${currentSession.token}`,
            },
          }
        );


        if (eventStatusRequest.eventStatusCode === 12) {

          const config = await findOne(DB_COLLECTIONS.CONFIG, { code: 'CFG0001' })
          if (config) {
            const getBetSummarryResponse = await luckTayaAxios.get('api/v1/xAccountTransaction/GetTransByAcctNumByEventIdSummary', {
              headers: {
                "X-Correlation-ID": correlationId,
                Authorization: `Bearer ${currentSession.token}`,
              },
              params: {
                accountNumber: config.operatorAccountNumber,
                eventId: parseInt(copyRequest.eventId)
              }
            });

            const getBetSummaryResponseData = getBetSummarryResponse.data;

            const bets = getBetSummaryResponseData.find((e: any) => e.transTypeDesc === 'Bet');
            const sales = getBetSummaryResponseData.find((e: any) => e.transTypeDesc === 'Win');
            const draw = getBetSummaryResponseData.find((e: any) => e.transTypeDesc === 'Draw');
            const cancelled = getBetSummaryResponseData.find((e: any) => e.transTypeDesc === 'Cancelled');
            
            const totalSales = (bets?.amount || 0) - (sales?.amount || 0) - (draw?.amount || 0) - (cancelled?.amount || 0);

            const maCommission = (totalSales * config.masterAgentCommision).toFixed(2)
            const agentCommission = (parseFloat(maCommission) * config.agentCommission).toFixed(2)

            console.log(maCommission, agentCommission);

            const allMaAgents = await findAll(DB_COLLECTIONS.TAYA_AGENTS, { 'request.accountType': '3' })

            const allMaAgentsAccount = allMaAgents.map((e: any) => e.response.accountNumber)

            const allAgentsAccount = await Promise.all(allMaAgentsAccount.map(async (e: any) => {

              const agentsUnderMaAccount = await findAll(DB_COLLECTIONS.TAYA_AGENTS, { 'request.masterAgentAccountNumber': String(e) })

              return agentsUnderMaAccount.map((e: any) => e.response.accountNumber)
            }))

            const allTransfers = [
              ...allMaAgentsAccount.map((e: any) => ({
              amount: parseFloat(maCommission),
              account: e,
              })),
              ...allAgentsAccount.flat().map((d: any) => ({
              amount: parseFloat(agentCommission),
              account: d,
              })),
            ];

            for (const transfer of allTransfers) {
              await transferFromMaster(transfer.amount, transfer.account, correlationId);
            }
          }
        }
      }
    }
    logResponse = { message: "Successfully Logged In!" };
    return NextResponse.json({ message: "Successfully Logged In!" });
  } catch (e: any) {
    logger.error(api, {
      correlationId,
      error: e.message,
      errorStack: e.stack,
    });

    status = 500;
    logResponse = formatGenericErrorResponse(e);
    return NextResponse.json(
      {
        error: logResponse,
      },
      {
        status: 500,
      }
    );
  } finally {
    logger.info(api, {
      correlationId,
      apiLog: {
        status,
        request: logRequest,
        response: logResponse,
      },
    });
  }
};

const cancelFights = async (
  url: string,
  fights: any,
  token: string,
  correlation: string | null
) => {
  const requests = [];
  for (let index = 0; index < fights.length; index++) {
    const element = fights[index];
    const request = {
      fightId: element.fightId,
      fightStatusCode: element.fightStatusCode == 10 ? "20" : "21",
    };
    requests.push(fightRequest(url, request, token, correlation));
  }
  try {
    await Promise.all(requests);
  } catch (error: any) {
    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    } else if (error.request) {
      console.log("Error URL (no response):", error.config.url);
      console.log("Request:", error.request);
    } else {
      console.log("Error message:", error.message);
    }
  }
};

const fightRequest = async (
  url: string,
  request: any,
  token: string,
  correlationId: string | null
) => {
  return luckTayaMainAxios.post("/api/event/fight/setStatus", request, {
    headers: {
      "X-Correlation-ID": correlationId,
      Authorization: `Bearer ${token}`,
    },
  });
};

const createGame = (
  request: any,
  token: string,
  userId: string,
  correlationId: string | null
) => {
  return luckTayaMainAxios.post("/api/event/fight", request, {
    headers: {
      "X-Correlation-ID": correlationId,
      Authorization: `Bearer ${token}`,
      "UserId": userId
    },
  });
};
export { POST };
