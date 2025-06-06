"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { formatDate } from "date-fns";
import { useWebSocketContext } from "@/context/webSocketContext";
import LoadingSpinner from "@/components/loadingSpinner";
import Tables from "@/components/tables";
import { formatDynamicNumber, formatMoney } from "@/util/textUtil";
import { localAxios } from "@/util/localAxiosUtil";
import { eventSort, eventStatus } from "@/util/eventSorting";

type SabongEvent = {
  entryDateTime: string;
  operatorId: number;
  eventId: number;
  eventStatusCode: number;
  venueId: number;
  eventDate: string;
  eventName: string;
  webRtcStream: string;
};

const TransactionHistory = () => {
  const { socket, messages } = useWebSocketContext();
  const [events, setEvents] = useState<SabongEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWithScreen, setIsLoadingWithScreen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [fight, setFight] = useState<any>(null);
  const [fights, setFights] = useState<any>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>();
  const [transactions, setTransactions] = useState<any>();
  const [total, setTotal] = useState(0);
  const getEvents = async () => {
    await localAxios
      .get("/api/event/list")
      .then((response) => {
        let data = response.data;
        data = eventSort("eventStatusCode", data);
        setEvents(data);
        if (data) setSelectedEvent(data[0]);
      })
      .catch(() => {
        setEvents([]);
      });
  };

  const getFights = async (eventId: any) => {
    await localAxios
      .get("/api/event/fight", {
        params: {
          eventId: eventId,
        },
      })
      .then((response) => {
        const data = response.data;

        setFights(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    getEvents();
  }, []);

  const getTransactions = async (id: any, type: any) => {
    setIsLoading(true);
    let params: any;
    let url: any;
    //type  : 1 = fight 2 : event
    if (type == 1) {
      url = "/api/event/fight-transaction";
      params = {
        fightId: id,
      };
    } else {
      url = "/api/event/event-transaction";
      params = {
        eventId: id,
      };
    }

    await localAxios
      .get(url, {
        params,
      })
      .then((response) => {
        setTotal(response.data.summary);
        setTransactions(response.data.list);
      })
      .catch(() => {
        setTransactions([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (fight) {
      getTransactions(fight.fightId, 1);
    } else if (selectedEvent) {
      getTransactions(selectedEvent.eventId, 2);
      getFights(selectedEvent.eventId);
    }
  }, [selectedEvent, fight]);

  const handleEventChange = (e: any) => {
    setIsLoading(true);
    setSelectedEvent(events[e.target.value]);
    setFight(null);
    setFights([]);
  };

  const handleFightChange = (e: any) => {
    if (!e.target.value) {
      setFight(null);
      return;
    }
    setIsLoading(true);
    setFight(fights[e.target.value].fight);
  };
  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-xl">Transaction History</h1>
      <div className="flex gap-3 items-center">
        <label
          htmlFor="venueId"
          className="text-white font-sans font-light text-nowrap "
        >
          Select Event
        </label>
        <select
          onChange={handleEventChange}
          name="venueId"
          className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
        >
          {events.map((item, index): any => {
            return (
              <option key={`option-${index}`} value={index}>
                {formatDate(item.eventDate, "MM/dd/yyyy")} - {item.eventName} -{" "}
                {eventStatus(item.eventStatusCode)}
              </option>
            );
          })}
        </select>

        <label
          htmlFor="venueId"
          className="text-white font-sans font-light text-nowrap "
        >
          Select Game
        </label>
        <select
          onChange={handleFightChange}
          name="venueId"
          className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
        >
          <option>--Select Game--</option>
          {fights.map((item: any, index: any) => {
            return (
              <option key={`option-${index}`} value={index}>
                {item.fight.fightNum}
              </option>
            );
          })}
        </select>
      </div>
      <h1>{isLoading && <label>{"   "}Loading ...</label>}</h1>

      {isLoadingWithScreen && (
        <LoadingSpinner size="w-20 h-20" color="border-blue" />
      )}
      <h1>
        Total :{" "}
        <span className="text-semiYellow">{formatMoney(`${total}`)}</span>
      </h1>
      {!isLoading && (
        <div className="flex flex-col">
          <Tables
            primaryId="id"
            headers={[
              // {
              //   key: "transactionDateTime",
              //   label: "DATE",
              //   format: (val: string) => {
              //     const formatDate = new Date(val);
              //     return format(formatDate, "yyyy-MM-dd hh:mm:ss a");
              //   },
              // },
              {
                key: "transactionNumber",
                label: "Transaction Id",
              },
              {
                key: "accountNumber",
                label: "Account Number",

                customValue: (item) => {
                  return (
                    <>
                      {item.playerName}
                      <br />
                      {formatDynamicNumber(item.accountNumber)}
                    </>
                  );
                  // spliitedVal[0] + ' | ' + formatAccountNumber
                },
              },
              {
                key: "fightNum",
                label: "Game Number",
              },
              {
                key: "meron",
                label: "Pula",
              },
              {
                key: "wala",
                label: "Asul",
              },

              // {
              //   key: "balance",
              //   label: "Meron",
              //   customValue: (item: any) => {
              //     const {fightDetails} = item;
              //     return (
              //       <div className="flex gap-2 items-center justify-center">
              //         <Button
              //           onClick={() => openModal(item)}
              //           type={"button"}
              //           size="text-xs"
              //         >
              //           Edit
              //         </Button>
              //       </div>
              //     );
              //   },
              // },

              {
                key: "side",
                label: "Bet On",
                format: (val: number) => {
                  return val == 1 ? "Pula" : "Asul";
                },
              },
              {
                key: "amount",
                label: "Amount",
                customValueClass: "text-semiYellow",
                format: (val: string) => {
                  return formatMoney(val);
                },
              },
            ]}
            items={transactions}
            isCentered={true}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
