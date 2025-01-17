import React from "react";
import FormField from "./formField";

export default function PlayerInput({ gameType, data }: any) {
  if (gameType == 2)
    return (
      <React.Fragment>
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col w-full gap-4">
            <label
              htmlFor="player1"
              className="text-white font-sans font-light text-nowrap"
            >
              Player 1
            </label>
            <div className="flex flex-row items-center gap-4">
              <FormField
                name="player1"
                value={data == null ? "" : data.player1}
                // label="Player 1"
                placeholder="Name"
                type="text"
              /> 
              <FormField
              name="player1Other"
              value={data == null ? "" : data.player1Other}
              // label="Player 1"
              placeholder="Name"
              type="text"
            />
            </div>{" "}
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col w-full gap-4">
            <label
              htmlFor="player1"
              className="text-white font-sans font-light text-nowrap"
            >
              Player 2
            </label>
            <div className="flex flex-row items-center gap-4">
              <FormField
                name="player2"
                value={data == null ? "" : data.player2}
                // label="Player 2"
                placeholder="Name"
                type="text"
              />{" "}
              <FormField
                name="player2Other"
                value={data == null ? "" : data.player2Other}
                // label="Player 2"
                placeholder="Name"
                type="text"
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  else if (gameType == 3)
    return (
      <React.Fragment>
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col w-full gap-4">
            <label
              htmlFor="player1"
              className="text-white font-sans font-light text-nowrap"
            >
              Team A
            </label>
            <div className="flex flex-row items-center gap-4">
              <FormField
                name="player1"
                value={data == null ? "" : data.player1}
                // label="Player 1"
                placeholder="Name"
                type="text"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center gap-4">
          <div className="flex flex-col w-full gap-4">
            <label
              htmlFor="player1"
              className="text-white font-sans font-light text-nowrap"
            >
              Team B
            </label>
            <div className="flex flex-row items-center gap-4">
              <FormField
                name="player2"
                value={data == null ? "" : data.player2}
                // label="Player 2"
                placeholder="Name"
                type="text"
              />
            </div>
          </div>
        </div>
      </React.Fragment>
    );
    else{return<></>}
}
