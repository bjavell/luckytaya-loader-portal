"use client";

import Tables from "@/components/tables";
import axios from "axios";
import { useEffect, useState } from "react";
import { format, getDate } from "date-fns";
import FormField from "@/components/formField";
import Form from "@/components/form";
import Button from "@/components/button";
import { formatMoney } from "@/util/textUtil";
import Modal from "@/components/modal";

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
const Event = () => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        var data = response.data;
        data = data.map((e: SabongEvent) => {
          const stats = getEventStatus(e.eventStatusCode);
          const location = getEventVenue(e.venueId);
          return {
            ...e,
            eventStatusName: stats.name,
            venueName: location.venueName,
          };
        });
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

  useEffect(() => {
    const getData = async () => {
      await getStatus();
      await getVenues();
    };

    getData();
  }, []);

  useEffect(() => {
    if (statuses && venues) {
      getEvents();
    }
  }, [statuses, venues]);

  const onHandleSubmit = async (e: any) => {
    const self = this;
    setIsLoading(true);
    setErrorMessage("");
    e.preventDefault();
    console.log(e.target.venueId.value, "hello");

    const form = e.target;

    if (!form.venueId.value) {
      setErrorMessage("Please Select Venue");
      return;
    }
    if (!form.eventName.value) {
      setErrorMessage("Please Select Name");
      return;
    }

    if (!form.eventDate.value) {
      setErrorMessage("Please Select Date");
      return;
    }

    const request = {
      venueId: form.venueId.value,
      eventName: form.eventName.value,
      eventDate: form.eventDate.value,
      webRtcStream: form.webRtcStream.value,
    };
    await axios
      .post("/api/event", request)
      .then(() => {
        getEvents();
        setErrorMessage("");
        setIsModalOpen(false)
        alert("Successfully Saved")
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

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-xl">Events</h1>
      <div className="w-sm">
        <Button
          onClick={() => setIsModalOpen(true)}
          isLoading={isLoading}
          loadingText="Loading..."
          type={"button"}
        >
          + New Event
        </Button>
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <div className="w-full p-4">
          {errorMessage !== "" ? (
            <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
              {errorMessage}
            </div>
          ) : (
            ""
          )}
          <Form onSubmit={onHandleSubmit}>
            <div className="flex flex-col gap-5">
              <label
                htmlFor="venueId"
                className="text-white font-sans font-light text-nowrap "
              >
                Venue
              </label>
              <select
                name="venueId"
                className="peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light text-[13px] tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C]"
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
                placeholder="Enter Event Name"
                type="text"
              />
              <FormField
                name="eventDate"
                label="Event Date"
                placeholder="Enter Event Date"
                //   value={endDate}
                //   onChange={(e) => {
                //     setEndDate(e.target.value);
                //   }}
                type="datetime-local"
              />
              <FormField
                name="webRtcStream"
                label="Web Rtc Stream Url"
                placeholder="Enter Url"
                type="text"
              />
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
      <div className="flex flex-col">
        <Tables
          primaryId="id"
          headers={[
            {
              key: "eventDate",
              label: "Event Date",
              format: (val: string) => {
                const formatDate = new Date(val);
                return format(formatDate, "yyyy-MM-dd hh:mm:ss a");
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
