import React, { useState, useEffect } from "react";

export default function Trend({
  player1,
  player2,
  data,
  isPulaAsul = true,
}: any) {
  const [details, setDetails] = useState<any>({
    pula: 0,
    asul: 0,
    cancel: 0,
  });

  useEffect(() => {
    if (data) {
      const groupedByWinSide = data.reduce((acc: any, fight: any) => {
        if (!acc[fight.winSide]) {
          acc[fight.winSide] = [];
        }
        acc[fight.winSide].push(fight);
        return acc;
      }, {});
      setDetails({
        pula: groupedByWinSide["1"]?.length ?? 0,
        asul: groupedByWinSide["0"]?.length ?? 0,
        cancel: groupedByWinSide["3"]?.length ?? 0,
      });
    }
  }, [data]);

  return (
    <React.Fragment>
      <div className="w-full grid grid-cols-3 grid-rows-1 gap-4">
        <div className="card p-2 rounded-[20px] border-transparent  text-center text-xl">
          {isPulaAsul && (
            <div
              className={`meronColor rounded-full h-10 w-10 mt-[-20]  flex justify-self-center`}
            ></div>
          )}
          {!isPulaAsul && (
            <React.Fragment>
              {player1} <br />
            </React.Fragment>
          )}
          {details.pula}
        </div>

        <div className="card p-2 rounded-[20px] border-transparent  text-center text-xl">
          {isPulaAsul && (
            <div
              className={`walaColor rounded-full h-10 w-10 mt-[-20]  flex justify-self-center`}
            ></div>
          )}
          {!isPulaAsul && 
            <React.Fragment>
              {player2} <br />
            </React.Fragment>}
          {details.asul}

          {/* {`${player2?.owner} ${player2?.breed}`} */}
        </div>
        <div className="card p-2 rounded-[20px] border-transparent  text-center text-xl">
          <div
            className={`cancelColor rounded-full h-10 w-10 mt-[-20] flex justify-self-center`}
          ></div>

          {details.cancel}
        </div>
      </div>
    </React.Fragment>
  );
}
