import isJsonObjectEmpty from "@/util/isJsonObjectEmpty";
import React from "react";

const MeronWala = ({ player, type, data, parent ,isPulaAsul = true }: any) => {
  const color = isPulaAsul ? (type == 1 ? "meronColor" : "walaColor") : "";
  const title = player;
  const getSafeData = (data: any, field: any) => {
    try {
      return data[field];
    } catch (error) {
      return "0";
    }
  };

  const calculateOddPercentage = (data: any) => {
    const numerator = parseFloat(getSafeData(data, `s${type}a`));
    const denominator =
      parseFloat(getSafeData(data, "s1a")) +
      parseFloat(getSafeData(data, "s0a"));

    if (numerator === 0 || denominator === 0) {
      return "0 %";
    }

    return `${((numerator / denominator) * 100).toFixed(0)} %`;
  };

  return (
    <div className="p-2  rounded-lg bg-cursedBlack">
      <div className="p-2 ">
        <div className="inline-flex w-full justify-between">
          <div className="inline-flex gap-2 text-xl">
           {isPulaAsul && <div
              className={`${color} rounded-full h-5 w-5`}
            ></div>}
            {title}
          </div>
          {/* {!isJsonObjectEmpty(parent) && (
            <div className="">
              Bet : {getSafeData(parent, `s${type}a`)} <br />
            </div>
          )} */}
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
          <div className="bg-dark-no-border p-1 rounded-[20px] border-transparent">
            Odd Percentage
            <div className="bg-gray13 rounded-xl w-full  mt-1 p-1 text-center capitalize">
              {calculateOddPercentage(data)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeronWala;
