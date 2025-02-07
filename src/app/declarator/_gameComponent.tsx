"use client";

import axios from "axios";
import React, { useEffect, useState } from "react";
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

interface GameComponentProps {
  gameData: any;
  webRtcStream: any;
  selectedEventDet: any;
  betDetails: any;
  fightDetails: any;
  setIsModalSendMessageOpen: any;
  isLoading: boolean;
  setIsModalOpen: any;
  onDirectSetFightStatus: any;
  lastCall: any;
  onCancelGame: any;
  betParentDetails: any;
}

const GameComponent: React.FC<GameComponentProps> = ({
  gameData,
  webRtcStream,
  selectedEventDet,
  betDetails,
  fightDetails,
  setIsModalSendMessageOpen,
  isLoading,
  setIsModalOpen,
  onDirectSetFightStatus,
  lastCall,
  onCancelGame,
  betParentDetails,
}) => {
  
  const getPlayer = (side: number) => {
    if (fightDetails) {
      const player = fightDetails?.find((x: any) => x.side == side);
      if (player) {
        return `${player.owner} ${player.breed}`;
      }
    }
    return "";
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

  return (
    <React.Fragment>
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
          <br />
        </div>
        <div className="flex flex-col gap-5">
          {!isJsonObjectEmpty(gameData) &&
            selectedEventDet?.gameType != 4 &&
            selectedEventDet?.gameType != 6 &&
            selectedEventDet?.gameType != 7 && (
              <Trend data={gameData?.trends}></Trend>
            )}
          {!isJsonObjectEmpty(gameData) && selectedEventDet?.gameType == 4 && (
            <ThreeManTrend data={selectedEventDet}></ThreeManTrend>
          )}
          <div className="bg-gray13 rounded-xl w-full p-5 capitalize">
            <MeronWala
              player={getPlayer(1)}
              type={1}
              isPulaAsul={false}
              parent={betParentDetails}
              data={betDetails}
            />
          </div>

          <div className="bg-gray13 rounded-xl w-full p-5 capitalize">
            <MeronWala
              player={getPlayer(0)}
              type={0}
              isPulaAsul={false}
              parent={betParentDetails}
              data={betDetails}
            />
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default GameComponent;
