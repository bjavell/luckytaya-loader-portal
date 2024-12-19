import React from "react";

const MeronWala = ({player, type, data }: any) => {
  const color = type == 1 ? "meronColor" : "walaColor";
  const title = player;
  const getSafeData = (data: any, field: any) => {
    try {
      return data[field];
    } catch (error) {
      return "0";
    }
  };
  return (
    <div className="p-2  rounded-lg bg-cursedBlack">
      <div className="p-2 ">
        <div className="inline-flex gap-2 w-full">
          <div className={`${color} rounded-full h-5 w-5 label-header1`}></div>
          {title}
        </div>
        <div className="col card rounded-[20] ">
          <br />
          Bet
          <div className="bg-gray13  text-center rounded-xl mt-1 w-full p-1 capitalize">
            {getSafeData(data, `s${type}a`)} <br />
          </div>
          <div className="bg-dark-no-border p-1 rounded-[20px] border-transparent">
            Payout
            <div className="bg-gray13 rounded-xl w-full  mt-1 p-1 text-center capitalize">
              {parseFloat(getSafeData(data, `s${type}o`)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeronWala;
