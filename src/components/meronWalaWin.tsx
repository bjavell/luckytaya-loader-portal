import React from "react";

const MeronWalaWin = ({ type, onClick }: any) => {
  const color = type == 1 ? "meronColor" : "walaColor";
  const title = type == 1 ? "Meron" : "Wala";

  return (
    <div className="p-2  rounded-lg bg-cursedBlack" onClick={onClick}>
      <div className="p-2 ">
        <div className="inline-flex gap-2 w-full items-center justify-center">
          <div className={`${color} rounded-full h-10 w-10 label-header1`}></div>
          {title}
        </div>
      </div>
    </div>
  );
};

export default MeronWalaWin;
