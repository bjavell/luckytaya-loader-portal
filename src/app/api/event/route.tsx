"use server";
import { NextRequest, NextResponse } from "next/server";
import { luckTayaAxios, luckTayaMainAxios, otsEngine } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { getCurrentSession } from "@/context/auth";
import logger from "@/lib/logger";
import { findAll, findOne, insert, update } from "@/util/dbUtil";
import { DB_COLLECTIONS } from "@/classes/constants";
import { localAxios } from "@/util/localAxiosUtil";
import { transferFromMaster } from "@/common/transaction";

const POST = async (req: NextRequest) => {
  const api = "POST EVENT";
  let correlationId: string | null = "";
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
    // request.venueId = parseInt(request.venueId);
    let response;
    if (!request.eventId) {
      delete request.eventId;
      delete request.eventStatusCode;
      const eventDetails = request.details
        ? Object.assign({}, request.details)
        : {};
      delete request.details;
        
      response = await otsEngine.post(`${process.env.OTS_GAME_URL}/game/event/add`, request, {
        headers: {
          'X-Correlation-ID': correlationId
        }
      });

      if(!response.data.success) {
        throw new Error(response.data.errors.message);
      } 


      // response = await luckTayaAxios.post(`/api/v1/SabongEvent/V2`, request, {
      //   headers: {
      //     "X-Correlation-ID": correlationId,
      //     Authorization: `Bearer ${currentSession.token}`,
      //   },
      // });

      const dbResult = await insert(DB_COLLECTIONS.EVENTS, {
        eventId: response.data.data.eventId,
        ...eventDetails,
        ...request,
      });

      if (eventDetails.gameType == 6) {
        let currentPlayer = 0;
        for (let index = 1; index < 17; index++) {
          const player1 = `player${currentPlayer + 1}`;
          const player2 = `player${currentPlayer + 2}`;
          const gameRequest = {
            fight: {
              fightNum: index.toString(),
              eventId: response.data.eventId,
            },
            fightDetails: [
              {
                id: "",
                side: 1,
                owner: eventDetails[player1] ?? "",
                breed: "",
                weight: "",
                tag: "",
                imageBase64: "",
                operatorId: 0,
              },
              {
                id: "",
                side: 0,
                owner: eventDetails[player2] ?? "",
                breed: "",
                weight: "",
                tag: "",
                imageBase64: "",
                operatorId: 0,
              },
            ],
          };

          try {
            const resgame = await createUpdateGame(
              gameRequest,
              currentSession.token,
              currentSession.userId,
              correlationId
            );
          } catch (error: any) {}

          currentPlayer += 2;
        }
      } else if (eventDetails.gameType == 7) {
        const parentEvent = await findOne(DB_COLLECTIONS.EVENTS, {
          eventId: { $eq: parseInt(eventDetails.parentEventId) },
        });
        if (parentEvent) {
          let currentPlayer = 0;
          let gameNumber = 0;
          for (let index = 1; index < 17; index++) {
            const player1 = `player${currentPlayer + 1}`;
            const player2 = `player${currentPlayer + 2}`;
            for (let i = 0; i < 3; i++) {
              gameNumber += 1;
              const gameRequest = {
                fight: {
                  fightNum: gameNumber.toString(),
                  eventId: response.data.eventId,
                },
                fightDetails: [
                  {
                    id: "",
                    side: 1,
                    owner: parentEvent[player1] ?? "",
                    breed: "",
                    weight: "",
                    tag: "",
                    imageBase64: "",
                    operatorId: 0,
                  },
                  {
                    id: "",
                    side: 0,
                    owner: parentEvent[player2] ?? "",
                    breed: "",
                    weight: "",
                    tag: "",
                    imageBase64: "",
                    operatorId: 0,
                  },
                ],
              };

              try {
                const resgame = await createUpdateGame(
                  gameRequest,
                  currentSession.token,
                  currentSession.userId,
                  correlationId
                );
              } catch (error: any) {}
            }

            currentPlayer += 2;
          }
        }
      } else {

        const gameRequest = {
          eventId: response.data.data.eventId,
          venueId: request.venueId,
          type: eventDetails.gameType,
          gameNumber: 1,
          players: [
            {
              id: 1,
              side: 1,
              owner: eventDetails.player1 ?? "",
              breed: eventDetails.player1Other ?? "",
              weight: "",
              tag: "",
              imageBase64: "",
              operatorId: 0,
              
            },
            {
              id: 2,
              side: 0,
              owner: eventDetails.player2 ?? "",
              breed: eventDetails.player2Other ?? "",
              weight: "",
              tag: "",
              imageBase64: "",
              operatorId: 0,
              
            }
          ]
        }

        // const gameRequest = {
        //   fight: {
        //     fightNum: "1",
        //     eventId: response.data.eventId,
        //   },
        //   fightDetails: [
        //     {
        //       id: "",
        //       side: 1,
        //       owner: eventDetails.player1 ?? "",
        //       breed: eventDetails.player1Other ?? "",
        //       weight: "",
        //       tag: "",
        //       imageBase64: "",
        //       operatorId: 0,
        //     },
        //     {
        //       id: "",
        //       side: 0,
        //       owner: eventDetails.player2 ?? "",
        //       breed: eventDetails.player2Other ?? "",
        //       weight: "",
        //       tag: "",
        //       imageBase64: "",
        //       operatorId: 0,
        //     },
        //   ],
        // };

        try {
          const resgame = await createUpdateGame(
            gameRequest,
            currentSession.token,
            currentSession.userId,
            correlationId
          );
        } catch (error: any) {

          console.log(error)

        }
      }
    } else {
      const copyRequest = JSON.parse(JSON.stringify(request));
      request.eventId = request.eventId;
      request.venueId = request.venueId
      // request.eventStatusCode = parseInt(request.eventStatusCode);

      delete request.eventStatusCodeNew;
      const eventStatusRequest = {
        eventId: copyRequest.eventId,
        eventStatusCode: copyRequest.eventStatusCodeNew,
      };

      const query = { eventId: copyRequest.eventId };
      const previousData = await findOne(DB_COLLECTIONS.EVENTS, query);

      if (previousData) {
        if (previousData.gameType == 6) {
          const childData = await findOne(DB_COLLECTIONS.EVENTS, {
            parentEventId: { $eq: previousData.eventId.toString() },
          });
          let childFights: any;
          try {
            
            childFights = await getFightByEventId(
              childData?.eventId,
              currentSession.token,
              correlationId
            );
            childFights = childFights.data;
          } catch (error: any) {}
          let currentPlayer = 0;
          for (let index = 1; index < 17; index++) {
            const currentFight = fights.find(
              (x: any) => x.fight.fightNum == index
            );
            if (currentFight) {
              const { fight, fightDetails } = currentFight;
              const player1 = request?.details[`player${currentPlayer + 1}`];
              const player2 = request?.details[`player${currentPlayer + 2}`];

              const dbPlayer1 = fightDetails.find((x: any) => x.side == 1);
              const dbPlayer2 = fightDetails.find((x: any) => x.side == 0);
              if (player1 != dbPlayer1?.owner || player2 != dbPlayer2?.owner) {
                dbPlayer1.owner = player1;
                dbPlayer2.owner = player2;

                const fightGameRequest = {
                  fight,
                  fightDetails: [dbPlayer1, dbPlayer2],
                };

                try {
                  
                  await createUpdateGame(
                    fightGameRequest,
                    currentSession.token,
                    currentSession.userId,
                    correlationId
                  );
                } catch (error: any) {
                  console.log(error.response.data, "parent");
                }
                const start = ((index * 3) - 3) + 1
                const end = start + 3;
                for (let x = start; x < end; x++) {
                  const childFight = childFights.find(
                    (xx: any) => xx.fight.fightNum == x
                  );
                  if (childFight) {
                    const {
                      fight: chldFight,
                      fightDetails: childFightDetails,
                    } = childFight;

                    const dbPlayer1 = childFightDetails.find(
                      (x: any) => x.side == 1
                    );
                    const dbPlayer2 = childFightDetails.find(
                      (x: any) => x.side == 0
                    );
                    dbPlayer1.owner = player1;
                    dbPlayer2.owner = player2;
                    const fightGameChildRequest = {
                      fight: chldFight,
                      fightDetails: [dbPlayer1, dbPlayer2],
                    };

                    try {
                      await createUpdateGame(
                        fightGameChildRequest,
                        currentSession.token,
                        currentSession.userId,
                        correlationId
                      );
                    } catch (error: any) {
                      console.log(error.response.data, "child");
                    }
                  }
                }
              }
            }
            currentPlayer += 2;
          }
        }
        const eventDetails = request.details
          ? Object.assign({}, request.details)
          : {};
        await update(DB_COLLECTIONS.EVENTS, query, {
          ...previousData,
          ...eventDetails,
          ...request,
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

        await otsEngine.post(`${process.env.OTS_GAME_URL}/game/event/update`, {
          eventId: eventStatusRequest.eventId,
          status: "Open"
        }, {
          headers: {
            'X-Correlation-ID': correlationId
          }
        });


        // await luckTayaAxios.put(
        //   `/api/v1/SabongEvent/UpdateStatus`,
        //   eventStatusRequest,
        //   {
        //     headers: {
        //       "X-Correlation-ID": correlationId,
        //       Authorization: `Bearer ${currentSession.token}`,
        //     },
        //   }
        // );

        if (eventStatusRequest.eventStatusCode === 12) {
          const config = await findOne(DB_COLLECTIONS.CONFIG, {
            code: "CFG0001",
          });
          if (config) {
            const getBetSummarryResponse = await luckTayaAxios.get(
              "api/v1/xAccountTransaction/GetTransByAcctNumByEventIdSummary",
              {
                headers: {
                  "X-Correlation-ID": correlationId,
                  Authorization: `Bearer ${currentSession.token}`,
                },
                params: {
                  accountNumber: config.operatorAccountNumber,
                  eventId: parseInt(copyRequest.eventId),
                },
              }
            );

            const getBetSummaryResponseData = getBetSummarryResponse.data;

            const bets = getBetSummaryResponseData.find(
              (e: any) => e.transTypeDesc === "Bet"
            );
            const sales = getBetSummaryResponseData.find(
              (e: any) => e.transTypeDesc === "Win"
            );
            const draw = getBetSummaryResponseData.find(
              (e: any) => e.transTypeDesc === "Draw"
            );
            const cancelled = getBetSummaryResponseData.find(
              (e: any) => e.transTypeDesc === "Cancelled"
            );

            //  const totalSales = (bets?.amount || 0) - (sales?.amount || 0) - (draw?.amount || 0) - (cancelled?.amount || 0);

            const totalSales =
              (bets?.amount || 0) -
              (sales?.amount || 0) -
              (draw?.amount || 0) -
              (cancelled?.amount || 0);

            const maCommission = (
              totalSales * config.masterAgentCommision
            ).toFixed(2);
            const agentCommission = (
              parseFloat(maCommission) * config.agentCommission
            ).toFixed(2);

            const commissions = {
              agentCommission: agentCommission,
              maCommission: maCommission,
            };

            const prevData = await findOne(DB_COLLECTIONS.EVENTS, query);
            await update(DB_COLLECTIONS.EVENTS, query, {
              ...prevData,
              commissions,
              totalSales: totalSales.toFixed(2),
            });

            const allMaAgents = await findAll(DB_COLLECTIONS.TAYA_AGENTS, {
              "request.accountType": "3",
            });

            const allMaAgentsAccount = allMaAgents.map(
              (e: any) => e.response.accountNumber
            );

            const allAgentsAccount = await Promise.all(
              allMaAgentsAccount.map(async (e: any) => {
                const agentsUnderMaAccount = await findAll(
                  DB_COLLECTIONS.TAYA_AGENTS,
                  { "request.masterAgentAccountNumber": String(e) }
                );

                return agentsUnderMaAccount.map(
                  (e: any) => e.response.accountNumber
                );
              })
            );

            const allTransfers = [
              ...allMaAgentsAccount.map((e: any) => ({
                amount: parseFloat(maCommission),
                account: e,
                userId: e.response.userId
              })),
              ...allAgentsAccount.flat().map((d: any) => ({
                amount: parseFloat(agentCommission),
                account: d,
                userId: d.response.userId
              })),
            ];

            for (const transfer of allTransfers) {
              try {
                await transferFromMaster(
                  transfer.amount,
                  transfer.account,
                  correlationId
                );
              } catch (error: any) {
                logger.error(api, {
                  correlationId,
                  error: error.message,
                  errorStack: error.stack,
                });
              }
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
      fightId: element.fight.fightId,
      fightStatusCode: element.fight.fightStatusCode == 10 ? 20 : 21,
    };
    if(element.fightStatusCode == 22 || element.fightStatusCode == 22) continue;
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

const createUpdateGame = async (
  request: any,
  token: string,
  userId: string,
  correlationId: string | null
) => {
  // return luckTayaMainAxios.post("/api/event/fight", request, {
  //   headers: {
  //     "X-Correlation-ID": correlationId,
  //     Authorization: `Bearer ${token}`,
  //     UserId: userId,
  //   },
  // });


  const response = await otsEngine.post(`${process.env.OTS_GAME_URL}/game/add`, request, {
    headers: {
      'X-Correlation-ID': correlationId
    }
  });


  return response
};

const getFightByEventId = (
  eventId: any,
  token: string,
  correlationId: string | null
) => {
  return luckTayaMainAxios.get(`/api/event/fight`, {
    params: {
      eventId,
    },
    headers: {
      "X-Correlation-ID": correlationId,
      Authorization: `Bearer ${token}`,
    },
  });
};
export { POST };
