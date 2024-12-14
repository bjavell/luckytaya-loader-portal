import {
  WebSocketProvider,
} from "@/context/webSocketContext";
import Fight from "./_component";
import { getCurrentSession } from "@/context/auth";

const GamePage = async () => {
  const session = await getCurrentSession();
  const token = session ? session.token : "";

  return (
    <WebSocketProvider token={token}>
      <Fight></Fight>
    </WebSocketProvider>
  );
};

export default GamePage;
