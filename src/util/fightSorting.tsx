const fightSort = (
  sortBy: string,
  data: any,
  isWaitingOpenOnly: boolean = false
) => {
  if (isWaitingOpenOnly)
    data = data.filter(
      (x: any) =>
        x.fightStatusCode == 10 ||
        x.fightStatusCode == 11 ||
        x.fightStatusCode == 12
    );
  switch (sortBy) {
    case "entryDateTime":
      return data.sort(
        (a: any, b: any) =>
          new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
      );
    case "fightStatusCode":
      return data.sort((a: any, b: any) => {
        if (a.fightStatusCode == b.fightStatusCode) {
          return a.fightNum - b.fightNum;
        }
        if (isWaitingOpenOnly)
          return (
            (b[sortBy]) -
            (a[sortBy])
          );
        else
          return sortStatusTempCode(a[sortBy]) - sortStatusTempCode(b[sortBy]);
      });
    default:
      return data.sort((a: any, b: any) => a[sortBy] - b[sortBy]);
  }
};
const fightSortV2 = (
  sortBy: string,
  data: any,
  isWaitingOpenOnly: boolean = false
) => {
  if (isWaitingOpenOnly)
    data = data.filter(
      (x: any) =>
        x.fight.fightStatusCode == 10 ||
        x.fight.fightStatusCode == 11 ||
        x.fight.fightStatusCode == 12
    );

  switch (sortBy) {
    case "entryDateTime":
      return data.sort(
        (a: any, b: any) =>
          new Date(b.fight[sortBy]).getTime() -
          new Date(a.fight[sortBy]).getTime()
      );
    case "fightStatusCode":
      return data.sort((a: any, b: any) => {
        if (a.fight.fightStatusCode == b.fight.fightStatusCode) {
          return a.fight.fightNum - b.fight.fightNum;
        }

        if (isWaitingOpenOnly)
          return (
            (b.fight[sortBy]) -
            (a.fight[sortBy])
          );
        else
          return (
            sortStatusTempCode(a.fight[sortBy]) -
            sortStatusTempCode(b.fight[sortBy])
          );
      });
    default:
      return data.sort((a: any, b: any) => a.fight[sortBy] - b.fight[sortBy]);
  }
};

const sortStatusTempCode = (code: any) => {
  switch (code) {
    //waiting
    case 10:
      return 2;
    case 11: // open
      return 1;
    case 12: // closed
      return 3;
    case 20:
      return 4;
    case 21:
      return 5;
    case 22:
      return 6;
    default:
      return 100;
  }
};

const fightStatus = (code: any) => {
  switch (code) {
    //waiting
    case 10:
      return "Waiting";
    case 11: // open
      return "Open";
    case 12: // closed
      return "Closed";
    case 20:
      return "Dropped";
    case 21:
      return "Cancelled";
    case 22:
      return "Ended";
    default:
      return "";
  }
};

export { fightSort, fightSortV2, fightStatus };
