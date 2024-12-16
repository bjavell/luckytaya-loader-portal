"use client";

import Tables from "@/components/tables";
import axios from "axios";
import { useEffect, useState } from "react";
import { format, formatDate, getDate } from "date-fns";
import FormField from "@/components/formField";
import Form from "@/components/form";
import Button from "@/components/button";
import { eventSort, eventStatus } from "@/util/eventSorting";
import { fightSort, fightSortV2 } from "@/util/fightSorting";
import Modal from "@/components/modal";
import GameUpload from "@/components/gameUpload";
import ConfirmationModal from "@/components/confirmationModal";

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

type SabongFight = {
  fightId: number;
  eventId: number;
  fightNum: number;
  fightStatusCode: number;
  entryDateTime: string;
  operatorId: number;
  fightDetails: any;
};

const Fight = () => {
  const [events, setEvents] = useState<SabongEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [fights, setFights] = useState<any>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorMessageOpen, setIsErrorMessageOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(0);
  const [selectedFight, setSelectedFight] = useState<any>();
  const [isModalFightOpen, setIsModalFightOpen] = useState(false);
  const [fightList, setFightList] = useState<any>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // const [walaImage, setWalaImage] = useState("");
  // const [meronImage, setMeronImage] = useState("");
  // const handleFileChange = (
  //   event: React.ChangeEvent<HTMLInputElement>,
  //   type: any
  // ) => {
  //   const file = event.target.files?.[0]; // Get the selected file
  //   if (file) {
  //     const reader = new FileReader();

  //     // Convert the image file to base64
  //     reader.onloadend = () => {
  //       if (reader.result) {
  //         if (type == 1) setMeronImage(reader.result.toString());
  //         else setWalaImage(reader.result.toString());
  //       }
  //     };

  //     // Read the file as a data URL (Base64)
  //     reader.readAsDataURL(file);
  //   }
  // };

  // const imageInput = (id: any, type: any) => {
  //   const image = type == 1 ? meronImage : walaImage;
  //   return (
  //     <div>
  //       {" "}
  //       <input
  //         type="file"
  //         id={id}
  //         accept="image/*"
  //         onChange={(e) => handleFileChange(e, type)}
  //         className="mb-4"
  //       />
  //       {image ? (
  //         <div>
  //           <h3>Preview:</h3>
  //           <img
  //             src={image}
  //             alt="Base64 Preview"
  //             className="w-64 h-64 object-cover"
  //           />
  //         </div>
  //       ) : (
  //         <p>No image selected</p>
  //       )}
  //     </div>
  //   );
  // };

  const getEventStatus = (code: number): any => {
    return statuses.find((x: any) => x.code == code);
  };
  const getEvents = async () => {
    await axios
      .get("/api/event/list")
      .then((response) => {
        let data = response.data;
        data = eventSort("eventStatusCode", data);
        setEvents(data);
        if (data) setSelectedEvent(data[0].eventId);
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
      })
      .catch(() => {
        setStatuses([]);
      });
  };
  const getFights = async (eventId: any) => {
    await axios
      .get("/api/event/fight", {
        params: {
          eventId,
        },
      })
      .then((response) => {
        let data = response.data;
        data = data.map((e: any) => {
          const stats = getEventStatus(e.fight.fightStatusCode);
          return {
            ...e,
            fightStatusName: stats ? stats.name : "",
          };
        });

        let fightlst = data.map((e: any) => {
          const meron = e.fightDetails.find((x: any) => x.side == 1);
          const wala = e.fightDetails.find((x: any) => x.side == 0);

          return {
            ...e.fight,
            fightDetails: e.fightDetails,
            meron: meron ? `${meron.owner} ${meron.breed}` : "",
            wala: wala ? `${wala.owner} ${wala.breed}` : "",
            fightStatusName: e.fightStatusName,
          };
        });

        fightlst = fightSort("fightNum", fightlst);
        setFightList(fightlst);
        setFights(fightSort("fightNum", data));
      })
      .catch((e) => {
        //console.log(e);
      });
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
    if (selectedEvent && statuses) getFights(selectedEvent);
    return () => {
      // setSelectedEvent(0);
    };
  }, [selectedEvent, statuses]);

  const handleEventChange = (e: any) => {
    setSelectedEvent(e.target.value);
  };

  const onFightClick = (fight: any) => {
    setIsLoading(true);
    setSelectedFight(fight);
    setIsModalFightOpen(true);
    refreshFields();
    // setWalaImage("");
    // setMeronImage("");
  };

  const refreshFields = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  const getFightDetailValue = (side: any, property: any) => {
    if (
      selectedFight &&
      Object.keys(selectedFight).length > 0 &&
      selectedFight.fightDetails.length > 0
    ) {
      const { fightDetails } = selectedFight;

      const fightSide = fightDetails.find((x: any) => x.side == side);
      if (fightSide) {
        return fightSide[property];
      }
      return "";
    }
    return "";
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
      setErrorMessage("Please Enter Pula First Name");
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
      setErrorMessage("Please Enter Asul First Name");
      return;
    }
    // if (!form["wala-breed"].value) {
    //   setErrorMessage("Please Enter Asul Last Name");
    //   return;
    // }
    // if (!form["wala-weight"].value) {
    //   setErrorMessage("Please Enter Asul Age");
    //   return;
    // }
    // if (!form["wala-tag"].value) {
    //   setErrorMessage("Please Enter Asul Remarks");
    //   return;
    // }
    const request = {
      fight: {
        fightId: selectedFight?.fightId,
        fightNum: form["fightNum"].value,
        eventId: selectedEvent,
      },
      fightDetails: [
        {
          fightId: selectedFight?.fightId,
          id: form["meron-id"]?.value,
          side: 1,
          owner: form["meron-owner"].value ?? "",
          breed: form["meron-breed"].value?? "",
          weight: form["meron-weight"].value ?? "",
          tag: form["meron-tag"].value?? "",
          imageBase64: "",
          operatorId: 0,
        },
        {
          fightId: selectedFight?.fightId,
          id: form["wala-id"]?.value,
          side: 0,
          owner: form["wala-owner"].value?? "",
          breed: form["wala-breed"].value?? "",
          weight: form["wala-weight"].value?? "",
          tag: form["wala-tag"].value?? "",
          imageBase64: "",
          operatorId: 0,
        },
      ],
    };
    setIsLoading(true);

    await axios
      .post("/api/event/fight", request)
      .then(() => {
        getFights(selectedEvent);
        setIsModalFightOpen(false);
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
        setSelectedFight({});
        refreshFields();
      });
  };

  const batchUpload = (items: any) => {
    //console.log(items);
    const requests = [];
    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      requests.push(fightRequest(element));
    }
    setIsLoading(true);
    Promise.all(requests)
      .then((results: any) => {
        setIsUploadModalOpen(false);
        setErrorMessage("Successfully Uploaded");
        getFights(selectedEvent);
      })
      .catch((error) => {
        // This runs if any of the promises reject
        setErrorMessage("Error in uploading the file.");
      });
  };
  const fightRequest = (request: any) => {
    return axios.post("/api/event/fight", request);
  };
  const onUpload = (csvData: any) => {
    const items = csvData.map((x: any) => {
      return {
        fight: {
          fightId: 0,
          fightNum: x["Game Number"],
          eventId: selectedEvent,
        },
        fightDetails: [
          {
            fightId: 0,
            id: 0,
            side: 1,
            owner: x["Pula"],
            breed: "",
            weight: "",
            tag: "",
            imageBase64: "",
            operatorId: 0,
          },
          {
            fightId: 0,
            id: 0,
            side: 0,
            owner: x["Asul"],
            breed: "",
            weight: "",
            tag: "",
            imageBase64: "",
            operatorId: 0,
          },
        ],
      };
    });

    batchUpload(items);
  };

  const renderBody = () => {
    return (
      <Form onSubmit={onFightDetailsSubmit} className="">
        <div className="col-span-4 grid grid-cols-5 grid-rows-1 gap-2">
          <FormField
            name="fightNum"
            label="Game Number"
            placeholder="Enter Game Number"
            type="number"
            value={selectedFight?.fightNum}
          />
        </div>

        <Modal
          size="medium"
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        >
          <GameUpload onUpload={onUpload} />
        </Modal>
        <div className="col-span-4 grid grid-cols-5 grid-rows-1 gap-2">
          <label>First Name</label>
          <label>Last Name</label>
          <label>Age</label>
          <label>Remarks</label>
        </div>
        <div className="grid grid-cols-5 grid-rows-1 gap-0 items-center">
          <div className="col-span-4 grid grid-cols-4 grid-rows-1 gap-1">
            <input hidden value={1} name="meron-side" />
            <input
              hidden
              value={getFightDetailValue(1, "id")}
              name="meron-id"
            />

            <FormField
              name="meron-owner"
              label=""
              placeholder="Enter First Name"
              type="text"
              value={getFightDetailValue(1, "owner")}
            />
            <FormField
              name="meron-breed"
              label=""
              placeholder="Enter Last Name"
              value={getFightDetailValue(1, "breed")}
              type="text"
            />
            <FormField
              name="meron-weight"
              label=""
              placeholder="Enter Age"
              value={getFightDetailValue(1, "weight")}
              type="text"
            />
            <FormField
              name="meron-tag"
              label=""
              placeholder="Enter Remarks"
              value={getFightDetailValue(1, "tag")}
              type="text"
            />

            <input hidden value={0} name="wala-side" />
            <input hidden value={getFightDetailValue(0, "id")} name="wala-id" />
            <FormField
              name="wala-owner"
              label=""
              placeholder="Enter First Name"
              value={getFightDetailValue(0, "owner")}
              type="text"
            />
            <FormField
              name="wala-breed"
              label=""
              placeholder="Enter Last Name"
              value={getFightDetailValue(0, "breed")}
              type="text"
            />
            <FormField
              name="wala-weight"
              label=""
              placeholder="Enter Age"
              value={getFightDetailValue(0, "weight")}
              type="text"
            />
            <FormField
              name="wala-tag"
              label=""
              placeholder="Enter Remarks"
              value={getFightDetailValue(0, "tag")}
              type="text"
            />
          </div>
          <div className="justify-self-center">
            <Button
              onClick={() => {}}
              isLoading={isLoading}
              loadingText="Loading..."
              type={"submit"}
            >
              Add Game
            </Button>
          </div>
        </div>
      </Form>
    );
  };
  
  useEffect(() => {
    if (errorMessage != "") setIsErrorMessageOpen(true);
  }, [errorMessage]);
  const onCloseErrorMessage = () => {
    setIsErrorMessageOpen(false);
    setErrorMessage("");
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-xl">Event Games</h1>
      <ConfirmationModal
        isOpen={isErrorMessageOpen}
        isOkOnly={true}
        onCancel={() => onCloseErrorMessage()}
        onConfirm={() => onCloseErrorMessage()}
        message={errorMessage}
      ></ConfirmationModal>
      <div className="inline-flex gap-3 items-center">
        <div>
          <label
            htmlFor="venueId"
            className="px-2 text-white font-sans font-light text-nowrap "
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
                <option key={`option-${index}`} value={item.eventId}>
                  {formatDate(item.eventDate, "MM/dd/yyyy")} - {item.eventName}{" "}
                  - {eventStatus(item.eventStatusCode)}
                </option>
              );
            })}
          </select>
        </div>
        <Button
          onClick={() => {
            setIsUploadModalOpen(true);
          }}
          isLoading={false}
          loadingText="Loading..."
          type={"button"}
        >
          Upload Game
        </Button>
      </div>
      {/* <div className="w-sm">
        <Button
          onClick={() => setIsModalOpen(true)}
          isLoading={isLoading}
          loadingText="Loading..."
          type={"button"}
        >
          + New Game
        </Button>
      </div> */}
      {!isLoading && renderBody()}
      <div className="flex flex-col">
        <Tables
          onItemClick={onFightClick}
          primaryId="id"
          headers={[
            {
              key: "entryDateTime",
              label: "Entry Date Time",
              format: (val: string) => {
                const formatDate = new Date(val);
                return format(formatDate, "yyyy-MM-dd");
              },
            },
            {
              key: "fightId",
              label: "Game Id",
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

            {
              key: "fightStatusName",
              label: "Status",
            },
          ]}
          items={fightList}
          isCentered={true}
        />
      </div>
    </div>
  );
};

export default Fight;
