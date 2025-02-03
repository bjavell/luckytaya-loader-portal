"use client";

import Tables from "@/components/tables";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { format, formatDate, getDate } from "date-fns";
import FormField from "@/components/formField";
import Form from "@/components/form";
import Button from "@/components/button";
import { formatMoney } from "@/util/textUtil";
import Modal from "@/components/modal";
import { eventSort } from "@/util/eventSorting";
import LoginModal from "@/components/loginModal";
import { encrypt } from "@/util/cryptoUtil";
import { localAxios } from "@/util/localAxiosUtil";
import { gameTypes } from "@/util/gameTypes";
import isJsonObjectEmpty from "@/util/isJsonObjectEmpty";
import PlayerInput from "@/components/playerInput";
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

type VenueType = {
  venueName: string;
  venueId: number;
};

const options = [
  {
    name: "Status",
    value: "eventStatusCode",
  },
  { name: "Date", value: "eventDate" },
];
const Event = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState<any>();
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [sortBy, setSortBy] = useState(options[0].value);
  const [fights, setFights] = useState([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [form, setForm] = useState();
  const [speedShoots, setSpeedShoots] = useState<any>();

  const [selecteGameType, setSelecteGameType] = useState(1);
  const [feed, setFeed] = useState({
    isShowFeed: false,
    feedUrl: "",
  });
  const getEventStatus = (code: number): any => {
    return statuses.find((x: any) => x.code == code);
  };
  const getEventVenue = (venueId: number): any => {
    return venues.find((x: any) => x.venueId == venueId);
  };
  const getEvents = async () => {
    await localAxios
      .get("/api/event/list")
      .then((response) => {
        let data = response.data;
        data = data.map((e: SabongEvent) => {
          const stats = getEventStatus(e.eventStatusCode);
          const location = getEventVenue(e.venueId);
          return {
            ...e,
            eventStatusName: stats.name,
            venueName: location?.venueName,
          };
        });

        data = eventSort(sortBy, data);
        setEvents(data);
      })
      .catch(() => {
        setEvents([]);
      });
  };
  const getSpeedShootsInDb = async () => {
    await localAxios
      .get(`/api/event/by-type?type=6`)
      .then((response) => {
        const { data } = response;
        setSpeedShoots(data);
      })
      .catch(() => {});
  };
  const getStatus = async () => {
    await localAxios
      .get("/api/event/status")
      .then((response) => {
        setStatuses(response.data);
      })
      .catch(() => {
        setStatuses([]);
      });
  };

  useEffect(() => {
    if (selectedEvent) {
      getFights(selectedEvent.eventId);
      setSelecteGameType(selectedEvent.gameType ?? 1);
    }
    return () => {};
  }, [selectedEvent]);

  const getFights = async (eventId: any) => {
    await localAxios
      .get("/api/event/fight", {
        params: {
          eventId,
        },
      })
      .then((response) => {
        let data = response.data;
        data = data
          .filter(
            (x: any) =>
              x.fight.fightStatusCode == 10 || x.fight.fightStatusCode == 11
          )
          .map((x: any) => {
            return x.fight;
          });
        setFights(data);
      })
      .catch((e) => {
        console.log(e);
      });
  };

  const getVenues = async () => {
    await localAxios
      .get("/api/event/locations")
      .then((response) => {
        const data = response.data.sort((a: any, b: any) =>
          a.venueName
            .trim()
            .toLowerCase()
            .localeCompare(b.venueName.trim().toLowerCase())
        );
        setVenues(data);
      })
      .catch(() => {
        setVenues([]);
      });
  };

  const onEventClick = async (item: any) => {
    await localAxios
      .get(`/api/event/by-id?eventId=${item.eventId}`)
      .then((response) => {
        console.log({ ...item, ...response.data }, "hello09");
        setSelectedEvent({ ...item, ...response.data });
      })
      .catch(() => {
        setSelectedEvent(item);
      });
    setIsModalOpen(true);
    setErrorMessage("");
  };

  useEffect(() => {
    const getData = async () => {
      await getStatus();
      await getVenues();
      await localAxios
        .get("/api/event/feed")
        .then((response) => {
          const data = response.data;
          if (data) {
            setFeed({
              isShowFeed: data.isShowFeed,
              feedUrl: data.feedUrl,
            });
          }
        })
        .catch((e) => {})
        .finally(() => {});
    };

    getData();
  }, []);

  useEffect(() => {
    if (events) {
      const data = Object.assign([], events);
      setEvents(eventSort(sortBy, data));
    }
  }, [sortBy]);

  useEffect(() => {
    if (statuses && venues) {
      getEvents();
      getSpeedShootsInDb();
    }
  }, [statuses, venues]);

  const onHandleSubmit = async (e: any, isForced = false) => {
    setForm(e);
    setIsLoading(true);
    setErrorMessage("");
    e.preventDefault();

    const form = e.target;

    if (
      form.eventStatusCodeNew &&
      form.eventStatusCodeNew.value == 12 &&
      !isForced
    ) {
      if (fights.length > 0) {
        // setIsModalOpen(false);
        setIsLoginModalOpen(true);
        setIsLoading(false);
        return;
      }
    }
    if (!form.venueId.value) {
      setIsLoading(false);
      setErrorMessage("Please Select Venue");
      return;
    }
    if (!form.eventName.value) {
      setIsLoading(false);
      setErrorMessage("Please Select Name");
      return;
    }

    if (!selectedEvent && !form.eventDate.value) {
      setIsLoading(false);
      setErrorMessage("Please Select Date");
      return;
    }
    const request = {
      eventId: form.eventId.value,
      venueId: form.venueId.value,
      eventName: form.eventName.value,
      eventDate: !isJsonObjectEmpty(selectedEvent)
        ? selectedEvent.eventDate
        : `${form.eventDate.value}T00:00:00.008Z`,
      webRtcStream: form.webRtcStream.value,
      eventStatusCode: !isJsonObjectEmpty(selectedEvent)
        ? selectedEvent.eventStatusCode
        : 0,
      eventStatusCodeNew: !isJsonObjectEmpty(selectedEvent)
        ? form.eventStatusCodeNew.value
        : 0,
      fights: fights,
      details: {
        gameType: form.gameType.value,
        player1: selecteGameType == 1 ? "Pula" : form.player1?.value ?? "",
        player2: selecteGameType == 1 ? "Asul" : form.player2?.value ?? "",
        player3: form.player3?.value ?? "",
        player1Other: form.player1Other?.value ?? "",
        player2Other: form.player2Other?.value ?? "",
        player3Other: form.player3Other?.value ?? "",
        player4: form.player4?.value ?? "",
        player5: form.player5?.value ?? "",
        player6: form.player6?.value ?? "",
        player7: form.player7?.value ?? "",
        player8: form.player8?.value ?? "",
        player9: form.player9?.value ?? "",
        player10: form.player10?.value ?? "",
        player11: form.player11?.value ?? "",
        player12: form.player12?.value ?? "",
        player13: form.player13?.value ?? "",
        player14: form.player14?.value ?? "",
        player15: form.player15?.value ?? "",
        player16: form.player16?.value ?? "",
      },
    };
    await localAxios
      .post("/api/event", request)
      .then(() => {
        getEvents();
        setErrorMessage("");
        setIsModalOpen(false);
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

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const onNewEvent = () => {
    setSelectedEvent({});
    setSelecteGameType(1);
    setIsModalOpen(true);
  };

  const onGameTypeSelect = (e: any) => {
    setSelecteGameType(e.target.value);
  };

  const onLoginSubmit = async (password: string, rePassword: string) => {
    if (password != rePassword) {
      setErrorMessage("Password does not match");
      return;
    }
    setIsLoading(true);
    setErrorMessage("");
    await localAxios
      .post("/api/verify-signin", {
        password: encrypt(password),
      })
      .then(() => {
        setIsLoginModalOpen(false);
        // setIsModalOpen(true)
        onHandleSubmit(form, true);
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
        setIsLoading(false);
      })
      .finally(() => {});
  };

  const onHandleCheckBox = (key: string, checked: boolean) => {
    const tmpSelectedEvent = {
      ...selectedEvent,
    };

    tmpSelectedEvent[key] = checked;

    setSelectedEvent(tmpSelectedEvent);
  };
  const safeDateFormat = (date: any, format: string) => {
    try {
      formatDate(date, format);
    } catch (error) {
      return "";
    }
  };

  const onHandleSubmitFeed = async (e: any) => {
    setIsLoading(true);
    setErrorMessage("");
    e.preventDefault();

    const form = e.target;

    if (!form.feedUrl?.value && feed.isShowFeed) {
      setIsLoading(false);
      alert("Please Enter Feed Url");
      return;
    }

    const request = {
      isShowFeed: feed.isShowFeed,
      feedUrl: form.feedUrl?.value,
    };
    await localAxios
      .post("/api/event/feed", request)
      .then(() => {
        setErrorMessage("");
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
  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-xl">Events</h1>
      <div className="w-sm">
        <Button
          onClick={() => onNewEvent()}
          isLoading={isLoading}
          loadingText="Loading..."
          type={"button"}
        >
          + New Event
        </Button>
      </div>

      <Form onSubmit={(e: any) => onHandleSubmitFeed(e)}>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 ">
            <input
              type="checkbox"
              name="isShowFeed"
              checked={feed.isShowFeed}
              onChange={(e) =>
                setFeed((x: any) => ({ ...x, isShowFeed: e.target.checked }))
              }
            />
            <label htmlFor="isShowFeed" className="text-xl">
              Show Feed
            </label>
            <FormField
              name="feedUrl"
              // label="URL"
              value={feed.feedUrl == null ? "" : feed.feedUrl}
              placeholder="Enter Feed Url"
              type="text"
            />
          </div>

          <div className="w-sm">
            <Button
              onClick={() => {}}
              isLoading={isLoading}
              loadingText="Loading..."
              type={"submit"}
            >
              Save Feed
            </Button>
          </div>
        </div>
      </Form>

      <Modal size="medium" isOpen={isModalOpen} onClose={closeModal}>
        <div className="w-full p-4">
          {errorMessage !== "" ? (
            <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
              {errorMessage}
            </div>
          ) : (
            ""
          )}
          <Form onSubmit={(e: any) => onHandleSubmit(e, false)}>
            <input
              hidden
              name="eventId"
              value={selectedEvent == null ? "" : selectedEvent.eventId}
            ></input>
            <div className="flex flex-col gap-5">
              <label
                htmlFor="venueId"
                className="text-white font-sans font-light text-nowrap "
              >
                Venue
              </label>
              <select
                name="venueId"
                disabled={!isJsonObjectEmpty(selectedEvent)}
                defaultValue={
                  selectedEvent == null ? "" : selectedEvent.venueId
                }
                className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
              >
                {venues.map((item, index): any => {
                  return (
                    <option key={`option-${index}`} value={item.venueId}>
                      {item.venueName}
                    </option>
                  );
                })}
              </select>
              <FormField
                name="eventName"
                label="Event Name"
                value={selectedEvent == null ? "" : selectedEvent.eventName}
                placeholder="Enter Event Name"
                type="text"
              />
              <FormField
                name="eventDate"
                label="Event Date"
                readonly={!isJsonObjectEmpty(selectedEvent)}
                value={
                  isJsonObjectEmpty(selectedEvent) == null
                    ? ""
                    : safeDateFormat(selectedEvent?.eventDate, "yyyy-MM-dd")
                }
                placeholder="Enter Event Date"
                //   value={endDate}
                //   onChange={(e) => {
                //     setEndDate(e.target.value);
                //   }}
                type="date"
              />
              <FormField
                name="webRtcStream"
                value={selectedEvent == null ? "" : selectedEvent.webRtcStream}
                label="Web Rtc Stream Url"
                placeholder="Enter Url"
                type="text"
              />

              <React.Fragment>
                <label
                  htmlFor="gameType"
                  className="text-white font-sans font-light text-nowrap "
                >
                  Game Type
                </label>
                <select
                  name="gameType"
                  defaultValue={
                    selectedEvent == null
                      ? ""
                      : parseInt(selectedEvent.gameType)
                  }
                  onChange={(e) => onGameTypeSelect(e)}
                  className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
                >
                  {gameTypes.map((item: any, index: any) => {
                    return (
                      <option key={`option-${index}`} value={item.id}>
                        {item.name}
                      </option>
                    );
                  })}
                </select>
                {selecteGameType == 7 && (
                  <React.Fragment>
                    <label
                      htmlFor="parentEventId"
                      className="text-white font-sans font-light text-nowrap "
                    >
                      Parent Event
                    </label>
                    <select
                      name="parentEventId"
                      defaultValue={
                        selectedEvent == null ? "" : selectedEvent.parentEventId
                      }
                      className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
                    >
                      {speedShoots.map((item: any, index: any) => {
                        return (
                          <option key={`option-${index}`} value={item.eventId}>
                            {item.eventName}
                          </option>
                        );
                      })}
                    </select>
                  </React.Fragment>
                )}
                <PlayerInput
                  data={selectedEvent}
                  gameType={selecteGameType}
                ></PlayerInput>
              </React.Fragment>
              {!isJsonObjectEmpty(selectedEvent) && (
                <React.Fragment>
                  <label
                    htmlFor="eventStatusCodeNew"
                    className="text-white font-sans font-light text-nowrap "
                  >
                    Status
                  </label>
                  <select
                    name="eventStatusCodeNew"
                    defaultValue={
                      selectedEvent == null ? "" : selectedEvent.eventStatusCode
                    }
                    className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
                  >
                    {statuses.map((item: any, index: any) => {
                      return (
                        <option key={`option-${index}`} value={item.code}>
                          {item.name}
                        </option>
                      );
                    })}
                  </select>
                </React.Fragment>
              )}
              <Button
                onClick={() => {}}
                isLoading={isLoading}
                loadingText="Loading..."
                type={"submit"}
              >
                Submit
              </Button>
            </div>
          </Form>{" "}
        </div>
      </Modal>

      <LoginModal
        isModalOpen={isLoginModalOpen}
        onHandleSubmit={onLoginSubmit}
        closeModal={() => setIsLoginModalOpen(false)}
      ></LoginModal>
      <div className="inline-flex items-center gap-2">
        <label
          htmlFor="accountType"
          className="text-white font-sans font-light text-nowrap text-xs"
        >
          Sort By:
        </label>
        <select
          id="sortBy"
          className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-sm tacking-[5%] text-white"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          required
        >
          {options.map((e: any) => {
            return (
              <option key={e.value} value={e.value}>
                {e.name}
              </option>
            );
          })}
        </select>
      </div>
      <div className="flex flex-col">
        <Tables
          primaryId="id"
          onItemClick={onEventClick}
          headers={[
            {
              key: "eventDate",
              label: "Event Date",
              format: (val: string) => {
                const formatDate = new Date(val);
                return format(formatDate, "yyyy-MM-dd");
              },
            },
            {
              key: "eventName",
              label: "Event Name",
            },
            {
              key: "venueName",
              label: "Venue",
            },
            {
              key: "eventStatusName",
              label: "Status",
            },
          ]}
          items={events}
          isCentered={true}
        />
      </div>
    </div>
  );
};

export default Event;
