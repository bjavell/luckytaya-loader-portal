const eventSort = (sortBy: string, data: any) => {
  switch (sortBy) {
    case "eventDate":
      return data.sort(
        (a: any, b: any) =>
          new Date(b[sortBy]).getTime() - new Date(a[sortBy]).getTime()
      );
    case "eventStatusCode":
      return data.sort(
        (a: any, b: any) =>
          sortStatusTempCode(a[sortBy]) - sortStatusTempCode(b[sortBy])
      );
    default:
      break;
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
    case 21:
      return 4;
    default:
      return 100;
  }
};

const eventStatus = (code: any) => {
  switch (code) {
    //waiting
    case 10:
      return "Waiting";
    case 11: // open
      return "Open";
    case 12: // closed
      return "Closed";
    case 21:
      return "Cancelled";
    default:
      return "";
  }
};
export { eventSort,eventStatus };
