"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { format, formatDate, getDate } from "date-fns";
import MeronWala from "@/components/meronWala";
import Button from "@/components/button";
import Modal from "@/components/modal";
import MeronWalaWin from "@/components/meronWalaWin";
import { useWebSocketContext } from "@/context/webSocketContext";
import ConfirmationModal from "@/components/confirmationModal";
import LoadingSpinner from "@/components/loadingSpinner";

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

const Fight = () => {
  const { socket, messages } = useWebSocketContext();
  const [events, setEvents] = useState<SabongEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statuses, setStatuses] = useState([]);
  const [fight, setFight] = useState<any>(null);
  const [fights, setFights] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [gameData, setGameData] = useState<any>({});
  const [winningSide, setWinningSide] = useState(-1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [betDetails, setBetDetails] = useState({
    fId: 0,
    s0c: 0,
    s0a: 0,
    s0o: 0,
    s1c: 0,
    s1a: 0,
    s1o: 0,
  });

  useEffect(() => {
    try {
      if (messages != null && gameData) {
        const parseMessage = JSON.parse(messages);
        const betDetail = JSON.parse(parseMessage.jsonPacket);

        switch (parseMessage.PacketType) {
          case 10:
            if (
              gameData.fight.fightId == parseMessage.FightId &&
              gameData.event.eventId == parseMessage.EventId
            ) {
              setBetDetails(betDetail);
            }
            break;
            // last call
          case 22:
            break;
          // result
          case 50:
            break;
          default:
            refreshFight();
            break;
        }
      }
    } catch (error) {}
  }, [messages]);

  useEffect(() => {
    if (errorMessage) alert(errorMessage);

    return () => {
      setErrorMessage("");
    };
  }, [errorMessage]);

  const getEventStatus = (code: number): any => {
    return statuses.find((x: any) => x.code == code);
  };
  const getEvents = async () => {
    await axios
      .get("/api/event/list")
      .then((response) => {
        var data = response.data;
        setEvents(data);
        if (data) setSelectedEvent(data[0]);
      })
      .catch(() => {
        setEvents([]);
      });
  };

  const getStatus = async () => {
    await axios
      .get("/api/event/fight/status")
      .then((response) => {
        setStatuses(response.data);
        // refreshFight();
      })
      .catch(() => {
        setStatuses([]);
      });
  };
  const getFights = async (eventId: any) => {
    await axios
      .get("/api/event/fight", {
        params: {
          eventId: eventId,
        },
      })
      .then((response) => {
        var data = response.data;
        data = data.map((e: any) => {
          const stats = getEventStatus(e.fightStatusCode);
          return {
            ...e,
            fightStatusName: stats ? stats.name : "",
          };
        });
        setFights(data);
        if (data.length > 0) setFight(data[0]);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const getData = async () => {
      await getStatus();
    };

    getData();
  }, []);

  useEffect(() => {
    if (statuses) {
      getEvents();
    }
  }, [statuses]);
  useEffect(() => {
    if (selectedEvent && statuses) getFights(selectedEvent.eventId);
    return () => {
      // setSelectedEvent(0);
    };
  }, [selectedEvent, statuses]);

  const setupGame = async () => {
    setIsLoading (true)
    const location = await axios.get("/api/event/locationById", {
      params: {
        venueId: selectedEvent.venueId,
      },
    });
    const fightList = await axios.get("/api/event/fight/", {
      params: {
        eventId: selectedEvent.eventId,
      },
    });

    const game = {
      event: selectedEvent,
      fight: fight,
      venue: location.data,
      totalFight: fightList.data.length,
    };

    const bet = await axios.get("/api/event/betDetails", {
      params: {
        fightId: fight.fightId,
      },
    });
    setBetDetails(bet.data);

    setGameData(game);
    setIsLoading(false);
  };

  const refreshFight = async () => {
    
    setIsLoading (true)
    const bet = await axios
      .get("/api/event/fight/byId", {
        params: {
          fightId: gameData.fight.fightId,
        },
      })
      .then((response) => {
        var data = response.data;
        setGameData(data);
        if (data.length > 0) setFight(data[0]);
        setIsLoading (false)
      })
      .catch(() => {});
      
  };

  useEffect(() => {
    if (selectedEvent && fight) setupGame();
    return () => {};
  }, [selectedEvent, fight]);

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const setWinSide = (side: any) => {
    setWinningSide(side);
    setIsModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const onConfirm = async () => {
    
    setIsLoading (true)
    const request = {
      fightId: gameData.fight.fightId,
      winSide: winningSide,
    };

    await axios
      .post("/api/event/fight/result", request)
      .then(() => {
        setErrorMessage("");
        alert("Successfully Saved");
        // refreshFight()
      })
      .catch((e) => {
        const errorMessages = e.response.data.error;
        if (errorMessages) {
          if (errorMessages["Not found"]) {
            setErrorMessage(errorMessages["Not found"][0]);
          } else if (errorMessages["Bad request"]) {
            setErrorMessage(errorMessages["Bad request"][0]);
          } else if (errorMessages["Unexpexted Error"]) {
            setErrorMessage(errorMessages["Unexpexted Error"][0]);
          } else {
            setErrorMessage("Oops! something went wrong");
          }
        } else {
          setErrorMessage("Oops! something went wrong");
        }
      })
      .finally(() => {
        onCancel();
        refreshFight();
      });
  };
  const onCancel = () => {
    setWinningSide(-1);
    setIsConfirmModalOpen(false);
  };
  const handleEventChange = (e: any) => {
    setIsLoading(true);
    setSelectedEvent(events[e.target.value]);
    setFight({});
    setFights([]);
  };

  const handleFightChange = (e: any) => {
    setIsLoading(true);
    setFight(fights[e.target.value]);
  };

  const renderEventStatusButton = () => {
    if (gameData) {
      switch (gameData.event.eventStatusCode) {
        case 10:
          return (
            <Button
              onClick={() => {}}
              isLoading={isLoading}
              loadingText="Loading..."
              type={"button"}
            >
              Start Event
            </Button>
          );

        case 11:
          return (
            <div className="bg-cursedBlack text-center p-3 rounded-xl">
              Started
            </div>
          );
        case 12:
          return (
            <div className="bg-cursedBlack text-center p-3 rounded-xl">
              Closed
            </div>
          );
        case 21:
          return (
            <div className="bg-cursedBlack text-center p-3 rounded-xl">
              Cancelled
            </div>
          );
        default:
          break;
      }
    }
    return <></>;
  };

  const lastCall = () => {
    
    setIsLoading (true)
    axios
      .post("/api/event/game/lastCall", {
        fightId: fight?.fightId,
      })
      .then((response) => {
        alert("Last Call!!");
        setIsLoading(false)
      });
  };

  const setFightStatus = async (status: any) => {
    
    setIsLoading (true)
    const request = {
      fightId: gameData.fight.fightId,
      fightStatusCode: status,
    };
    await axios
      .post("/api/event/fight/setStatus", request)
      .then(() => {
        alert("Successfully Saved");
      })
      .catch((e) => {
        const errorMessages = e.response.data.error;
        if (errorMessages) {
          if (errorMessages["Not found"]) {
            setErrorMessage(errorMessages["Not found"][0]);
          } else if (errorMessages["Bad request"]) {
            setErrorMessage(errorMessages["Bad request"][0]);
          } else if (errorMessages["Unexpexted Error"]) {
            setErrorMessage(errorMessages["Unexpexted Error"][0]);
          } else {
            setErrorMessage("Oops! something went wrong");
          }
        } else {
          setErrorMessage("Oops! something went wrong");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderOpenBetting = () => {
    var isDisabled = true;
    if (gameData) {
      if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 10
      )
        return (
          <Button
            onClick={() => setFightStatus(11)}
            isLoading={isLoading}
            loadingText="Loading..."
            type={"button"}
          >
            Open Betting
          </Button>
        );
    }

    if (isDisabled)
      return (
        <button disabled className="bg-gray13 p-3 rounded-xl">
          Open Betting
        </button>
      );
  };

  const renderCloseBetting = () => {
    var isDisabled = true;
    if (gameData) {
      if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 11
      )
        return (
          <Button
            onClick={() => setFightStatus(12)}
            isLoading={isLoading}
            loadingText="Loading..."
            type={"button"}
          >
            Close Betting
          </Button>
        );
    }

    if (isDisabled)
      return (
        <button disabled className="bg-gray13 p-3 rounded-xl">
          Close Betting
        </button>
      );
  };

  const renderLastCall = () => {
    var isDisabled = true;
    if (gameData) {
      if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 11
      )
        return (
          <Button
            onClick={() => lastCall()}
            isLoading={isLoading}
            loadingText="Loading..."
            type={"button"}
          >
            Final Call
          </Button>
        );
    }

    if (isDisabled)
      return (
        <button disabled className="bg-gray13 p-3 rounded-xl">
          Final Call
        </button>
      );
  };
  const renderResultButton = () => {
    var isDisabled = true;
    if (gameData) {
      if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 12
      )
        return (
          <Button
            onClick={() => {
              setIsModalOpen(true);
            }}
            isLoading={isLoading}
            loadingText="Loading..."
            type={"button"}
          >
            Result
          </Button>
        );
    }

    if (isDisabled)
      return (
        <button disabled className="bg-gray13 p-3 rounded-xl">
          Result
        </button>
      );
  };
  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-xl">Gaming Control</h1>
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
          className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light text-[13px] tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
        >
          {events.map((item, index): any => {
            return (
              <option key={`option-${index}`} value={index}>
                {item.eventName}
              </option>
            );
          })}
        </select>

        <label
          htmlFor="venueId"
          className="text-white font-sans font-light text-nowrap "
        >
          Select Fight
        </label>
        <select
          onChange={handleFightChange}
          name="venueId"
          className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light text-[13px] tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
        >
          {fights.map((item: any, index: any) => {
            return (
              <option key={`option-${index}`} value={index}>
                {item.fightNum}
              </option>
            );
          })}
        </select>
      </div>
      <h1>{isLoading && <label>{"   "}Loading ...</label>}</h1>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <label className="text-[20px]">Select Winner Side</label>
        <br />
        <br />
        <div className="grid grid-cols-2 grid-rows-1 gap-4">
          <MeronWalaWin type={1} onClick={() => setWinSide(1)} />
          <MeronWalaWin type={0} onClick={() => setWinSide(0)} />
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onCancel={onCancel}
        onConfirm={onConfirm}
        message="Are you sure you want to set Result?"
      ></ConfirmationModal>
      {isLoading && <LoadingSpinner size="w-20 h-20" color="border-blue" />}
      {!isLoading && gameData && (
        <div className="grid grid-cols-4 grid-rows-1 gap-4">
          <div className="col-span-3">
            <div className="flex bg-gray13 rounded-xl w-full p-5 capitalize">
              <div className="grid grid-cols-5 grid-rows-1 gap-4 w-full">
                <div className="col-span-4 uppercase label-header1">
                  <div>
                    <label>{gameData.event.eventName}</label>
                  </div>
                  <div>
                    <label>{gameData.venue.venueName}</label>
                  </div>
                  <div>
                    <label>
                      {formatDate(gameData.event.eventDate, "MM/dd/yyyy")}
                    </label>
                  </div>
                  <div>
                    <label>Total Fights {gameData.totalFight}</label>
                  </div>
                  <div>
                    <label>Fight # {gameData.fight.fightNum}</label>
                  </div>
                </div>

                <div>
                  {renderEventStatusButton()}
                  <br />
                  <div className="bg-cursedBlack text-center p-3 rounded-xl">
                    Fight : {gameData.fight.fightStatusName}
                  </div>
                </div>
              </div>
            </div>
            <br />
            <div className="h-full w-full">
              <iframe
                className="relative h-full w-full"
                // src="https://www.youtube.com/embed/4AbXp05VWoQ?si=zzaGMvrDOSoP9tBb?autoplay=1&cc_load_policy=1"
                src="http://161.49.111.13/#%7B%22playerOption%22%3A%7B%22autoStart%22%3Atrue%2C%22autoFallback%22%3Atrue%2C%22mute%22%3Afalse%2C%22sources%22%3A%5B%7B%22type%22%3A%22webrtc%22%2C%22file%22%3A%22ws%3A%2F%2F161.49.111.13%3A3333%2Fapp%2Ftest-input-stream%3Ftransport%3Dtcp%22%7D%5D%2C%22expandFullScreenUI%22%3Atrue%7D%2C%22demoOption%22%3A%7B%22autoReload%22%3Atrue%2C%22autoReloadInterval%22%3A2000%7D%7D"
                title="Lucky Taya"
                frameBorder="0"
                allow="autoplay;encrypted-media;"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>
            <br />
            {gameData && (
              <div className="grid grid-cols-4 grid-rows-1 gap-4">
                {renderOpenBetting()}
                {renderLastCall()}
                {renderCloseBetting()}
                {renderResultButton()}
              </div>
            )}

            <br />
          </div>
          <div className="flex flex-col gap-2">
            <div className="bg-gray13 rounded-xl w-full p-5 capitalize">
              <MeronWala type={1} data={betDetails} />
            </div>

            <div className="bg-gray13 rounded-xl w-full p-5 capitalize">
              <MeronWala type={0} data={betDetails} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fight;
