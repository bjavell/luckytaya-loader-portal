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
import Form from "@/components/form";
import FormField from "@/components/formField";
import Image from "next/image";
import Logout from "@/assets/images/Logout.svg";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useRouter } from "next/navigation";
import { fightSortV2, fightStatus, getLastFight } from "@/util/fightSorting";
import isJsonObjectEmpty from "@/util/isJsonObjectEmpty";
import { localAxios } from "@/util/localAxiosUtil";
import Trend from "@/components/trend";
import ThreeManTrend from "@/components/threeManTrend";
import Link from "next/link";
import Dashboard from "@/assets/images/Dashboard.svg";
import Game from "@/assets/images/Game.png";

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
  const router = useRouter();
  const { socket, messages } = useWebSocketContext();
  const [events, setEvents] = useState<SabongEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingWithScreen, setIsLoadingWithScreen] = useState(false);
  const [fightStatusCode, setFightStatusCode] = useState(-1);
  const [isFightStatusModalOpen, setIsFightStatusModalOpen] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [fight, setFight] = useState<any>(null);
  const [fights, setFights] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedEventDet, setSelectedEventDet] = useState<any>(null);
  const [gameData, setGameData] = useState<any>({});
  const [winningSide, setWinningSide] = useState(-1);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isErrorMessageOpen, setIsErrorMessageOpen] = useState(false);
  const [fightDetails, setFightDetails] = useState<any>();
  const [isModalSendMessageOpen, setIsModalSendMessageOpen] = useState(false);
  const [isCreateAnotherGame, setIsCreateAnotherGame] = useState(false);
  const [lastFight, setLastFight] = useState<any>(null);
  const [isGameAvailable, setIsGameAvailable] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [game3Details, setGame3Details] = useState({
    players: [""],
    loser: "",
    winner: "",
  });
  const [playerNames, setPlayerNames] = useState({
    player1FirstName: "",
    player1LastName: "",
    player2FirstName: "",
    player2LastName: "",
  });

  const [betDetails, setBetDetails] = useState({
    fId: 0,
    s0c: 0,
    s0a: 0,
    s0o: 0,
    s1c: 0,
    s1a: 0,
    s1o: 0,
  });
  const [webRtcStream, setWebRtcStream] = useState(
    process.env.NEXT_PUBLIC_WEB_RTC_URL
  );

  useEffect(() => {
    try {
      if (messages != null && gameData) {
        const parseMessage = JSON.parse(messages);
        switch (parseMessage.PacketType) {
          case 10:
            const betDetail = JSON.parse(parseMessage.jsonPacket);
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
          case 30:
            refreshFight(true);
            break;
          case 50:
            break;
          default:
            refreshFight();
            break;
        }
      }
    } catch (error) { }
  }, [messages]);

  useEffect(() => {
    if (errorMessage != "") setIsErrorMessageOpen(true);
  }, [errorMessage]);
  const onCloseErrorMessage = () => {
    setIsErrorMessageOpen(false);
    setErrorMessage("");
  };
  useEffect(() => {
    if (isErrorMessageOpen) {
      setIsConfirmModalOpen(false);
      setIsFightStatusModalOpen(false);
    }

    return () => { };
  }, [isErrorMessageOpen]);

  const getEventStatus = (code: number): any => {
    return statuses.find((x: any) => x.code == code);
  };
  const getEvents = async () => {
    await localAxios
      .get("/api/event/list-open")
      .then((response) => {
        const data = response.data;
        setEvents(data);
        if (data) setSelectedEvent(data[0]);
      })
      .catch(() => {
        setEvents([]);
      });
  };

  const getStatus = async () => {
    await localAxios
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
    await localAxios
      .get("/api/event/fight", {
        params: {
          eventId: eventId,
        },
      })
      .then((response) => {
        const data = fightSortV2("fightStatusCode", response.data, true);
        const lastFight = getLastFight(response.data);
        setLastFight(lastFight);
        setFights(data);
        if (data.length > 0) {
          setFight(getFightWithStatus(data[0].fight));
          setFightDetails(data[0].fightDetails);
        } else {
          setTimeout(() => {
            setIsCreateAnotherGame(true);
          }, 500);
          setIsGameAvailable(false);
        }
      })
      .catch(() => { });
  };

  useEffect(() => {
    setPlayerNames({
      player1FirstName: getLastGameFirstName(1, lastFight, selectedEventDet),
      player1LastName: getLastGameLastName(1, lastFight, selectedEventDet),
      player2FirstName: getLastGameFirstName(0, lastFight, selectedEventDet),
      player2LastName: getLastGameLastName(0, lastFight, selectedEventDet),
    });
  }, [lastFight, game3Details, selectedEventDet]);

  useEffect(() => {
    const getData = async () => {
      await getStatus();
    };

    getData();
  }, []);
  const getPlayer = (side: number) => {
    if (fightDetails) {
      const player = fightDetails?.find((x: any) => x.side == side);
      if (player) {
        return `${player.owner} ${player.breed}`;
      }
    }
    return "";
  };
  useEffect(() => {
    if (statuses) {
      getEvents();
    }
  }, [statuses]);

  useEffect(() => {
    if (selectedEvent && statuses) getFights(selectedEvent.eventId);
    if (selectedEvent) {
      // const evnt = events[selectedEvent];
      // //console.log({events,selectedEvent}, "-----0");
      getEventInDb(selectedEvent);
      setWebRtcStream(
        selectedEvent.webRtcStream == ""
          ? process.env.NEXT_PUBLIC_WEB_RTC_URL
          : selectedEvent.webRtcStream
      );
    }
    return () => {
      // setSelectedEvent(0);
    };
  }, [selectedEvent, statuses]);

  const setupGame = async () => {
    setIsLoading(true);
    const location = await localAxios.get("/api/event/locationById", {
      params: {
        venueId: selectedEvent.venueId,
      },
    });
    const fightList = await localAxios.get("/api/event/fight/", {
      params: {
        eventId: selectedEvent.eventId,
      },
    });

    const trends = await localAxios.get("/api/event/trend", {
      params: {
        eventId: selectedEvent.eventId,
      },
    });
    const game = {
      event: selectedEvent,
      fight: fight,
      venue: location.data,
      totalFight: fightList.data.length,
      trends: trends.data,
    };

    const bet = await localAxios.get("/api/event/betDetails", {
      params: {
        fightId: fight.fightId,
      },
    });
    setBetDetails(bet.data);
    setGameData(game);
    setIsLoading(false);
  };

  const refreshFight = async (isRefreshFight: boolean = false) => {
    if (!gameData) return;
    setIsLoadingWithScreen(true);
    if (isRefreshFight) await getFights(selectedEvent.eventId);

    const bet = await localAxios
      .get("/api/event/fight/byId", {
        params: {
          fightId: gameData.fight.fightId,
        },
      })
      .then((response) => {
        const data = response.data;
        setGameData(data);
        if (data.length > 0) {
          setFight(getFightWithStatus(data[0].fight));
          setFightDetails(data[0].fightDetails);
        }

        setIsLoading(false);
        setIsLoadingWithScreen(false);
      })
      .catch(() => {
        setIsLoading(false);
        setIsLoadingWithScreen(false);
      });
  };

  const getFightWithStatus = (fght: any) => {
    const stats = getEventStatus(fght.fightStatusCode);
    return {
      ...fght,
      fightStatusName: stats ? stats.name : "",
    };
  };

  useEffect(() => {
    if (selectedEvent && fight) setupGame();
    return () => { };
  }, [selectedEvent, fight]);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onHandleSendMessage = async (e: any) => {
    // setIsLoading(true);
    setErrorMessage("");
    e.preventDefault();

    const form = e.target;

    if (!form.message.value) {
      setErrorMessage("Please Enter Message");
      return;
    }

    if (!form.duration.value) {
      setErrorMessage("Please Enter Duration");
      return;
    }

    const request = {
      message: form.message.value,
      duration: form.duration.value,
    };
    await localAxios
      .post("/api/event/sendMessage", request)
      .then(() => {
        setErrorMessage("");
        setIsModalSendMessageOpen(false);
        // alert("Successfully Saved");
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
        // setIsLoading(false);
      });
  };

  const onHandleCancel = async (e: any) => {
    // setIsLoading(true);
    setErrorMessage("");
    e.preventDefault();

    const form = e.target;

    if (!form.reason.value) {
      setErrorMessage("Please Enter Reason");
      return;
    }

    const request = {
      reason: form.reason.value,
      fightId: gameData.fight.fightId,
      fightStatusCode: 21,
      event: selectedEvent,
    };
    setIsLoadingWithScreen(true);
    await localAxios
      .post("/api/event/fight/setStatus", request)
      .then(() => {
        // alert("Successfully Saved");
        refreshFight(true);
        setIsFightStatusModalOpen(false);
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
        setIsCancelModalOpen(false);
        setIsLoadingWithScreen(false);
      });
  };

  const closeSendModal = () => {
    setIsModalSendMessageOpen(false);
  };
  const setWinSide = (side: any) => {
    setWinningSide(side);
    setIsModalOpen(false);
    setIsConfirmModalOpen(true);
  };
  const onCancel = () => {
    setWinningSide(-1);
    setIsConfirmModalOpen(false);
  };
  const findIndexInPlayer = (name: string) => {
    const { players } = game3Details;
    const result = players.findIndex((item) => item.trim() == name);

    return (result + 1).toString();
  };

  const onConfirm = async () => {
    setIsLoadingWithScreen(true);
    const request = {
      fightId: gameData.fight.fightId,
      winSide: winningSide,
      details: {
        gameType: selectedEventDet.gameType,
        eventId: selectedEvent.eventId,
        winnerName: findIndexInPlayer(getPlayerName(winningSide)),
        loserName: findIndexInPlayer(getPlayerName(winningSide == 1 ? 0 : 1)),
      },
    };

    setGame3Details((prev) => ({
      ...prev,
      winner: request.details.winnerName,
      loser: request.details.loserName,
    }));

    await localAxios
      .post("/api/event/fight/result", request)
      .then(() => {
        setErrorMessage("");
        getEventInDb(selectedEvent);
        // alert("Successfully Saved");
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
        refreshFight(true);
        setIsLoadingWithScreen(false);
      });
  };

  const getEventInDb = async (item: any) => {
    await localAxios
      .get(`/api/event/by-id?eventId=${item.eventId}`)
      .then((response) => {
        const { data } = response;
        const { player1, player2, player3 } = data;
        setSelectedEventDet({ ...item, ...response.data });
      })
      .catch(() => {
        setSelectedEventDet(item);
      });
  };

  useEffect(() => {
    if (selectedEventDet) {
      const { lastWinner, lastLoser } = selectedEventDet;
      setGame3Details({
        players: [
          getGameType3Name("player1"),
          getGameType3Name("player2"),
          getGameType3Name("player3"),
        ],
        winner: lastWinner,
        loser: lastLoser,
      });
    }

    return () => { };
  }, [selectedEventDet]);

  const handleEventChange = (e: any) => {
    const item = events[e.target.value];
    setIsLoading(true);
    setSelectedEvent(item);
    setFight({});
    setFightDetails(null);
    setFights([]);
    setIsLoading(false);
  };

  const handleFightChange = (e: any) => {
    setIsLoading(true);
    setFight(getFightWithStatus(fights[e.target.value].fight));
    setFightDetails(fights[e.target.value].fightDetails);
    setIsLoading(false);
  };

  const renderEventStatusButton = () => {
    if (gameData) {
      if (gameData.event.eventStatusCode == 11) {
        return renderResultButton();
      }
      switch (gameData.event.eventStatusCode) {
        case 10:
          <div className="bg-cursedBlack text-center p-3 rounded-xl">
            Waiting
          </div>;

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
    setIsLoadingWithScreen(true);
    axios
      .post("/api/event/game/lastCall", {
        fightId: fight?.fightId,
      })
      .then((response) => {
        // alert("Last Call!!");
        setIsLoadingWithScreen(false);
      });
  };

  const renderResultButton = () => {
    const isDisabled = true;
    if (gameData) {
      if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 12
      )
        return (
          <Button
            size="w-full my-3"
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
        <div className="bg-cursedBlack text-center p-3 rounded-xl">Result</div>
      );
  };

  const onHandleLogout = async () => {
    await localAxios
      .post("/api/signout", {})
      .then((response) => {
        router.push("/login");
      })
      .catch((e) => {
        const errorMessages = e.response.data.error;
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const renderOpenBetting = () => {
    const isDisabled = true;
    if (gameData) {
      if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 10
      )
        return (
          <Button
            onClick={() => onDirectSetFightStatus(11)}
            isLoading={isLoading}
            loadingText="Loading..."
            type={"button"}
          >
            Open Betting
          </Button>
        );
      else if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 11
      ) {
        return (
          <Button
            onClick={() => onCancelGame(21)}
            isLoading={isLoading}
            loadingText="Loading..."
            type={"button"}
          >
            Cancel Game
          </Button>
        );
      }
    }

    if (isDisabled)
      return (
        <button disabled className="bg-gray13 p-3 rounded-xl">
          Open Betting
        </button>
      );
  };

  const renderCloseBetting = () => {
    const isDisabled = true;
    if (gameData) {
      if (
        gameData.event.eventStatusCode == 11 &&
        gameData.fight.fightStatusCode == 11
      )
        return (
          <Button
            onClick={() => onDirectSetFightStatus(12)}
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
    const isDisabled = true;
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

  const onCancelGame = async (status: number) => {
    setIsCancelModalOpen(true);
  };

  const onDirectSetFightStatus = async (status: number) => {
    setIsLoadingWithScreen(true);
    const request = {
      fightId: gameData.fight.fightId,
      fightStatusCode: status,
    };
    await localAxios
      .post("/api/event/fight/setStatus", request)
      .then(() => {
        // alert("Successfully Saved");
        refreshFight(status == 21);
        setIsFightStatusModalOpen(false);
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
        setIsLoadingWithScreen(false);
      });
  };

  const onConfirmSetFightStatus = async () => {
    setIsLoadingWithScreen(true);
    const request = {
      fightId: gameData.fight.fightId,
      fightStatusCode: fightStatusCode,
    };
    await localAxios
      .post("/api/event/fight/setStatus", request)
      .then(() => {
        // alert("Successfully Saved");
        refreshFight(fightStatusCode == 21);
        setIsFightStatusModalOpen(false);
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
        setIsLoadingWithScreen(false);
      });
  };

  const onFightDetailsSubmit = async (e: any) => {
    setErrorMessage("");
    e.preventDefault();

    const form = e.target;
    if (!form["fightNum"].value) {
      setErrorMessage("Please Enter Game Number");
      return;
    }
    if (!form["meron-owner"].value) {
      setErrorMessage("Please Enter Name 1");
      return;
    }
    // if (!form["meron-breed"].value) {
    //   setErrorMessage("Please Enter Pula Last Name");
    //   return;
    // }
    // if (!form["meron-weight"].value) {
    //   setErrorMessage("Please Enter Pula Age");
    //   return;
    // }
    // if (!form["meron-tag"].value) {
    //   setErrorMessage("Please Enter Pula Remarks");
    //   return;
    // }

    if (!form["wala-owner"].value) {
      setErrorMessage("Please Enter Name 1");
      return;
    }
    const request = {
      fight: {
        fightNum: form["fightNum"].value,
        eventId: selectedEvent.eventId,
      },
      fightDetails: [
        {
          side: 1,
          owner: form["meron-owner"].value ?? "",
          breed: form["meron-breed"]?.value ?? "",
          weight: form["meron-weight"]?.value ?? "",
          tag: form["meron-tag"]?.value ?? "",
          imageBase64: "",
          operatorId: 0,
        },
        {
          side: 0,
          owner: form["wala-owner"].value ?? "",
          breed: form["wala-breed"]?.value ?? "",
          weight: form["wala-weight"]?.value ?? "",
          tag: form["wala-tag"]?.value ?? "",
          imageBase64: "",
          operatorId: 0,
        },
      ],
    };
    setIsLoading(true);

    await localAxios
      .post("/api/event/fight", request)
      .then(() => {
        setIsCreateAnotherGame(false);
        setErrorMessage("Successfully Saved");
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
        setIsLoadingWithScreen(false);
        getFights(selectedEvent.eventId);
      });
  };

  const getLastGameNumber = () => {
    if (lastFight) {
      try {
        return (parseInt(lastFight.fight.fightNum) + 1).toString();
      } catch (error) { }
    }
    return "1";
  };

  const getPlayerName = (side: number) => {
    if (!isJsonObjectEmpty(fightDetails)) {
      const player = fightDetails.find((x: any) => x.side == side);
      if (player) {
        return `${player.owner.trim()} ${player.breed.trim()}`.trim();
      }
    }
    return "";
  };

  const getNextPlayerGameType3 = () => {
    try {
      const { players, winner, loser } = game3Details;

      const result = players.findIndex(
        (item) =>
          item.trim() !== getPlayerGame3(winner, selectedEventDet) &&
          item.trim() !== getPlayerGame3(loser, selectedEventDet)
      );
      return selectedEventDet[`player${result + 1}`];
    } catch (error) {
      return "";
    }
  };

  const getNextPlayerGameType3Handicap = () => {
    try {
      const { players, winner, loser } = game3Details;

      const result = players.findIndex(
        (item) =>
          item.trim() !== getPlayerGame3(winner, selectedEventDet) &&
          item.trim() !== getPlayerGame3(loser, selectedEventDet)
      );

      return selectedEventDet[`player${result + 1}Other`];
    } catch (error) {
      return "";
    }
  };

  const getGameType3Name = (player: string) => {
    return `${selectedEventDet[player]} ${selectedEventDet[player + "Other"]}`;
  };

  const getPlayerGame3 = (player: string, evnt: any) => {
    if (!player) return "";

    return (
      evnt[`player${player}`] +
      " " +
      evnt[`player${player}Other`]
    ).trim();
  };

  const getLastGameFirstName = (side: number, lastFght: any, evnt: any) => {
    if (!isJsonObjectEmpty(lastFght)) {
      const player = lastFght.fightDetails.find((x: any) => x.side == side);
      if (player) {
        if (evnt?.gameType == 4) {
          if (
            getPlayerGame3(evnt?.lastWinner, evnt) ==
            `${player.owner.trim()} ${player.breed.trim()}`.trim()
          )
            return `${player.owner.trim()}`;
          else {
            return getNextPlayerGameType3();
          }
        }
        return `${player.owner.trim()}`;
      }
    }
    return "";
  };

  const getLastGameLastName = (side: number, lastFght: any, evnt: any) => {
    if (!isJsonObjectEmpty(lastFght)) {
      const player = lastFght.fightDetails.find((x: any) => x.side == side);
      if (player) {
        if (evnt?.gameType == 4) {
          if (
            getPlayerGame3(evnt?.lastWinner, evnt) ==
            `${player.owner.trim()} ${player.breed.trim()}`.trim()
          )
            return `${player.breed.trim()}`;
          else {
            return getNextPlayerGameType3Handicap();
          }
        }
        return `${player.breed.trim()}`;
      }
    }
    return "";
  };
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="inline-flex justify-between items-center">
        <h1 className="text-xl">Gaming Control</h1>
        <div className="inline-flex">

          <Link
            key="game"
            href="/event/fights"
            className={`p-4 hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54] flex gap-2`}
          >
            <Image src={Game} alt="" className={`h-4 w-auto my-auto`} />
            Game / Rack
          </Link>
          <Link
            key="transactino_history"
            href="/event/transaction_history"
            className={`p-4 hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54] flex gap-2`}
          >
            <Image src={Dashboard} alt="" className={`h-4 w-auto my-auto`} />
            Transaction History
          </Link>
          <button
            onClick={() => onHandleLogout()}
            className="p-4 text-red hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54] flex gap-2"
          >
            <Image src={Logout} alt="" className={`h-4 w-auto my-auto`} />{" "}
            Logout
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isErrorMessageOpen}
        isOkOnly={true}
        onCancel={() => onCloseErrorMessage()}
        onConfirm={() => onCloseErrorMessage()}
        message={errorMessage}
      ></ConfirmationModal>

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
                {item.eventName}
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
          {fights.map((item: any, index: any) => {
            return (
              <option key={`option-${index}`} value={index}>
                {item.fight.fightNum}
              </option>
            );
          })}
        </select>
        <Button
          onClick={() => {
            setIsCreateAnotherGame(true);
          }}
          type={"button"}
        >
          Add Game
        </Button>
      </div>

      <h1>
        {isLoading && isGameAvailable && <label>{"   "}Loading ...</label>}
      </h1>
      {!isGameAvailable && <h1 className="text-3xl">No Game/Rack Available</h1>}
      <Modal size="medium" isOpen={isModalOpen} onClose={closeModal}>
        <div className="flex flex-col justify-center p-4">
          <label className="text-[20px]">Select Winner Side</label>
          <br />
          <br />
          <div className="grid grid-cols-2 grid-rows-1 gap-4">
            <MeronWalaWin
              type={1}
              onClick={() => setWinSide(1)}
              playerName={getPlayerName(1)}
            />
            <MeronWalaWin
              type={0}
              onClick={() => setWinSide(0)}
              playerName={getPlayerName(0)}
            />
          </div>
        </div>
      </Modal>

      {isCreateAnotherGame && (
        <Modal
          size="medium"
          isOpen={isCreateAnotherGame}
          onClose={() => setIsCreateAnotherGame(false)}
        >
          <h1 className="text-3xl">Create Another Game?</h1>
          <br />
          <Form onSubmit={onFightDetailsSubmit} className="">
            <div className="col-span-4 grid grid-cols-3 grid-rows-1 gap-2">
              <FormField
                name="fightNum"
                label="Game Number"
                placeholder="Enter Game Number"
                type="number"
                value={getLastGameNumber()}
              />
            </div>
            <div className="col-span-2 grid grid-cols-2 grid-rows-1 gap-2">
              <label>Name 1</label>
              <label>Name 2</label>
              {/* <label>Age</label>
          <label>Remarks</label> */}
            </div>
            <div className="col-span-2 grid grid-cols-2 grid-rows-1 gap-1">
              <input hidden value={1} name="meron-side" />
              <input hidden name="meron-id" />

              <FormField
                name="meron-owner"
                label=""
                placeholder="Enter Name 1"
                type="text"
                value={playerNames.player1FirstName}
              />
              {selectedEventDet?.gameType != 1 &&
                selectedEventDet?.gameType != 3 && (
                  <FormField
                    name="meron-breed"
                    label=""
                    placeholder="Enter Name 2"
                    type="text"
                    value={playerNames.player1LastName}
                  />
                )}
              <input hidden value={0} name="wala-side" />
              <input hidden name="wala-id" />
              <FormField
                name="wala-owner"
                label=""
                placeholder="Enter Name 1"
                type="text"
                value={playerNames.player2FirstName}
              />
              {selectedEventDet?.gameType != 1 &&
                selectedEventDet?.gameType != 3 && (
                  <FormField
                    name="wala-breed"
                    label=""
                    placeholder="Enter Name 2"
                    type="text"
                    value={playerNames.player2LastName}
                  />
                )}
            </div>
            <br />
            <div className="justify-self-end">
              <Button
                onClick={() => { }}
                loadingText="Loading..."
                type={"submit"}
              >
                Add Game
              </Button>
            </div>
          </Form>
        </Modal>
      )}

      <Modal
        size="medium"
        isOpen={isModalSendMessageOpen}
        onClose={closeSendModal}
      >
        <div className="p-4">
          {errorMessage !== "" ? (
            <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
              {errorMessage}
            </div>
          ) : (
            ""
          )}
          <Form onSubmit={onHandleSendMessage}>
            <div className="flex flex-col gap-5">
              <FormField
                name="message"
                label="Message"
                placeholder="Enter Message"
                type="textarea"
              />
              <FormField
                name="duration"
                label="Duration (in seconds)"
                placeholder="Enter Duration"
                type="number"
              />
              <Button
                onClick={() => { }}
                isLoading={isLoading}
                loadingText="Loading..."
                type={"submit"}
              >
                Send
              </Button>
            </div>
          </Form>{" "}
        </div>
      </Modal>

      <Modal
        size="medium"
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
      >
        <h1 className="text-4xl">Cancel Game</h1>
        <div className="p-4">
          {errorMessage !== "" ? (
            <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
              {errorMessage}
            </div>
          ) : (
            ""
          )}
          <Form onSubmit={onHandleCancel}>
            <div className="flex flex-col gap-5">
              <FormField
                name="reason"
                label="Reason"
                placeholder="Enter Reason"
                type="textarea"
              />

              <Button
                onClick={() => { }}
                isLoading={isLoading}
                loadingText="Loading..."
                type={"submit"}
              >
                Cancel Game
              </Button>
            </div>
          </Form>{" "}
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onCancel={onCancel}
        onConfirm={onConfirm}
        message="Are you sure you want to set Result?"
      ></ConfirmationModal>

      {isLoadingWithScreen && (
        <LoadingSpinner size="w-20 h-20" color="border-blue" />
      )}
      {!isJsonObjectEmpty(gameData) && (
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
                    <label>Total Games {gameData.totalFight}</label>
                  </div>
                  <div>
                    <label>Game # {gameData.fight.fightNum}</label>
                  </div>
                </div>

                <div>
                  {renderEventStatusButton()}
                  <br />
                  <div className="bg-cursedBlack text-center p-3 rounded-xl">
                    Game : {fightStatus(gameData.fight.fightStatusCode)}
                  </div>
                </div>
              </div>
            </div>
            <br />
            <div className="h-full w-full">
              <iframe
                className="relative h-full w-full"
                // src="https://www.youtube.com/embed/4AbXp05VWoQ?si=zzaGMvrDOSoP9tBb?autoplay=1&cc_load_policy=1"
                src={webRtcStream}
                title="Lucky Taya"
                frameBorder="0"
                allow="autoplay;encrypted-media;"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              ></iframe>
            </div>

            {gameData && (
              <div className="grid grid-cols-3 grid-rows-1 gap-4">
                {renderOpenBetting()}
                {renderLastCall()}
                {renderCloseBetting()}
                {/* {renderEventStatusButton()} */}
              </div>
            )}
            <br />
          </div>
          <div className="flex flex-col gap-5">
            {!isJsonObjectEmpty(gameData) &&
              selectedEventDet?.gameType != 4 && (
                <Trend data={gameData?.trends}></Trend>
              )}
            {!isJsonObjectEmpty(gameData) &&
              selectedEventDet?.gameType == 4 && (
                <ThreeManTrend data={selectedEventDet}></ThreeManTrend>
              )}
            <div className="bg-gray13 rounded-xl w-full p-5 capitalize">
              <MeronWala player={getPlayer(1)} type={1} data={betDetails} />
            </div>

            <div className="bg-gray13 rounded-xl w-full p-5 capitalize">
              <MeronWala player={getPlayer(0)} type={0} data={betDetails} />
            </div>
            <Button
              onClick={() => {
                setIsModalSendMessageOpen(true);
              }}
              loadingText="Loading..."
              type={"button"}
            >
              Send Message
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fight;
