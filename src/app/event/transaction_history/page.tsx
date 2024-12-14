import {
  WebSocketProvider,
} from "@/context/webSocketContext";
import { getCurrentSession } from "@/context/auth";
import TransactionHistory from "./_component";

const TransHistPage = async () => {
  const session = await getCurrentSession();
  const token = session ? session.token : "";

  return (
    <WebSocketProvider token={token}>
      <TransactionHistory></TransactionHistory>
    </WebSocketProvider>
  );
};

export default TransHistPage;
