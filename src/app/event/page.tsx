"use client";

import Tables from "@/components/tables";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { format, getDate } from "date-fns";
import FormField from "@/components/formField";
import Form from "@/components/form";
import Button from "@/components/button";
import { formatMoney } from "@/util/textUtil";
import Modal from "@/components/modal";
import { eventSort } from "@/util/eventSorting";
import LoginModal from "@/components/loginModal";
import { encrypt } from "@/util/cryptoUtil";

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

  const getEventStatus = (code: number): any => {
    return statuses.find((x: any) => x.code == code);
  };
  const getEventVenue = (venueId: number): any => {
    return venues.find((x: any) => x.venueId == venueId);
  };
  const getEvents = async () => {
    await axios
      .get("/api/event/list")
      .then((response) => {
        let data = response.data;
        data = data.map((e: SabongEvent) => {
          const stats = getEventStatus(e.eventStatusCode);
          const location = getEventVenue(e.venueId);
          return {
            ...e,
            eventStatusName: stats.name,
            venueName: location.venueName,
          };
        });

        data = eventSort(sortBy, data);
        setEvents(data);
      })
      .catch(() => {
        setEvents([]);
      });
  };

  const getStatus = async () => {
    await axios
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
    }
    return () => {};
  }, [selectedEvent]);
  useEffect(() => {
    console.log(fights, "helo-");
  }, [fights]);

  const getFights = async (eventId: any) => {
    await axios
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
    await axios
      .get("/api/event/locations")
      .then((response) => {
        setVenues(response.data);
      })
      .catch(() => {
        setVenues([]);
      });
  };

  const onEventClick = (item: any) => {
    setSelectedEvent(item);
    setIsModalOpen(true);
    setErrorMessage("");
  };

  useEffect(() => {
    const getData = async () => {
      await getStatus();
      await getVenues();
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
    }
  }, [statuses, venues]);

  const onHandleSubmit = async (e: any, isForced = false) => {
    setForm(e);
    setIsLoading(true);
    setErrorMessage("");
    e.preventDefault();

    const form = e.target;

    if (form.eventStatusCodeNew.value == 12 && !isForced) {
      console.log(fights);
      if (fights.length > 0) {
        // setIsModalOpen(false);
        setIsLoginModalOpen(true);
      }
      setIsLoading(false);
      return;
    }
    if (!form.venueId.value) {
      setErrorMessage("Please Select Venue");
      return;
    }
    if (!form.eventName.value) {
      setErrorMessage("Please Select Name");
      return;
    }

    if (!selectedEvent && !form.eventDate.value) {
      setErrorMessage("Please Select Date");
      return;
    }
    const request = {
      eventId: form.eventId.value,
      venueId: form.venueId.value,
      eventName: form.eventName.value,
      eventDate: selectedEvent
        ? selectedEvent.eventDate
        : `${form.eventDate.value}T00:00:00.008Z`,
      webRtcStream: form.webRtcStream.value,
      eventStatusCode:
        selectedEvent != null ? selectedEvent.eventStatusCode : 0,
      eventStatusCodeNew:
        selectedEvent != null ? form.eventStatusCodeNew.value : 0,
      fights : fights
    };

    await axios
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
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const onLoginSubmit = async (userId: string, password: string) => {
    setIsLoading(true);
    setErrorMessage("");
    await axios
      .post("/api/verify-signin", {
        username: userId,
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
                disabled={selectedEvent != null}
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
                readonly={selectedEvent != null}
                value={selectedEvent == null ? "" : selectedEvent.eventDate}
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
              {selectedEvent && (
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
