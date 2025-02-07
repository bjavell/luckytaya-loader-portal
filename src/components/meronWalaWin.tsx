import React from "react";

const MeronWalaWin = ({ type, onClick,playerName,isPulaAsul=true }: any) => {
  const color = isPulaAsul ? (type == 1 ? "meronColor" : type == 0 ? "walaColor": "cancelColor") : "";

  return (
    <div className="p-2  rounded-lg bg-cursedBlack cursor-pointer" onClick={onClick}>
      <div className="p-2 ">
        <div className="inline-flex gap-2 w-full items-center justify-center">
          <div className={`${color} rounded-full h-10 w-10 label-header1`}></div>
          {playerName}
        </div>
      </div>
    </div>
  );
};

export default MeronWalaWin;
