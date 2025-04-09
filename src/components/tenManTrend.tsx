import React from "react";

export default function TenManTrend({ data }: any) {
  const createElement = () => {};

  return (
    <React.Fragment>
        <h1 className="text-sm lg:text-xl">Scores : </h1>
      <div className="w-full grid grid-cols-2 grid-rows-1 gap-1">
        {Array.from({ length: 5 }, (_, index) => index + 1).map((item) => (
          <React.Fragment>
            <div className="card p-2 rounded-[20px] border-transparent  text-center text-l">
              <div className={`text-center  flex justify-self-center`}>
                {data[`player${item}`]??""}
              </div>
              {data[`player${item}Score`]??"0"}
            </div>

            <div className="card p-2 rounded-[20px] border-transparent  text-center text-l">
              <div className={`text-center  flex justify-self-center`}>
                {data[`player${item + 5}`]??""}
              </div>
              {data[`player${item + 5}Score`]??"0"}
            </div>

          </React.Fragment>
        ))}
      </div>
    </React.Fragment>
  );
}
