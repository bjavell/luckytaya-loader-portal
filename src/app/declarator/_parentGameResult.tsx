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

interface ParentGameResultProps {
  eventData : any;
  setWinSide : any;
  fightNum : number
}

const ParentGameResult: React.FC<ParentGameResultProps> = ({
  eventData,setWinSide,fightNum
}) => {
  
  const getPlayerName = (side: number) => {
    if (!isJsonObjectEmpty(eventData)) {
      const fightNumber = Math.ceil(fightNum/3) - 1;
      const fight = eventData.find((x:any)=> x.fight.fightNum == fightNumber)
      const player = fight?.fightDetails?.find((x: any) => x.side == side);
      if (player) {
        return `${player.owner.trim()} ${player.breed.trim()}`.trim();
      }
    }
    return "";
  };

  return (
    <React.Fragment>
      <div className="flex flex-col justify-center p-4">
          <label className="text-[20px]">Select Winner Side (Parent)</label>
          <br />
          <br />
          <div className="grid grid-cols-3 grid-rows-1 gap-1">
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
            
            <MeronWalaWin
              type={2}
              onClick={() => setWinSide(2)}
              playerName={"CANCEL"}
            />
          </div>
        </div>
    </React.Fragment>
  );
};

export default ParentGameResult;
