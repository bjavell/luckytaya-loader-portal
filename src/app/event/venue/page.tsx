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
import { localAxios } from "@/util/localAxiosUtil";


type VenueType = {
  venueName: string;
  venueId: number;
};
const Event = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<VenueType>();
  const [venues, setVenues] = useState<VenueType[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getVenues = async () => {
    await localAxios
      .get("/api/event/locations")
      .then((response) => {
        const data = response.data.sort(
          (a: any, b: any) => a.venueName.trim().toLowerCase().localeCompare(b.venueName.trim().toLowerCase())
        );
        setVenues(data);
      })
      .catch(() => {
        setVenues([]);
      });
  };

  useEffect(() => {
    const getData = async () => {
      await getVenues();
    };

    getData();
  }, []);

  const onHandleSubmit = async (e: any) => {
    setIsLoading(true);
    setErrorMessage("");
    e.preventDefault();

    const form = e.target;

    // if (!form.venueId.value) {
    //   setErrorMessage("Please Select Venue");
    //   return;
    // }

    if (!form.venueName.value) {
      setErrorMessage("Please Enter Venue");
      return;
    }

    const request = {
      venueId: form.venueId.value,
      venueName: form.venueName.value,
    };
    await localAxios
      .post("/api/event/locations", request)
      .then(() => {
        getVenues();
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

  const onVenueClick = (e : any) =>{
    setSelectedVenue(e)
    setIsModalOpen(true)
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <h1 className="text-xl">Venue</h1>
      <div className="w-sm">
        <Button
          onClick={() => setIsModalOpen(true)}
          isLoading={isLoading}
          loadingText="Loading..."
          type={"button"}
        >
          + New Venue
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
              <input hidden name="venueId" value={selectedVenue?.venueId}/>
              <FormField
                name="venueName"
                label="Venue Name"
                value={selectedVenue?.venueName}
                placeholder="Enter Venue Name"
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
          onItemClick={onVenueClick}
          headers={[
            {
              key: "venueName",
              label: "Venue",
            },
          ]}
          items={venues}
          isCentered={true}
        />
      </div>
    </div>
  );
};

export default Event;
