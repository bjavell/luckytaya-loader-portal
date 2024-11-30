import { ReactNode } from "react";
import { Metadata } from "next";
import { WebSocketProvider } from "@/context/webSocketContext";
import { getCurrentSession } from "@/context/auth";
import CommonLayout from "../layout/commonLayout";

const GameLayout: React.FC<{ children: ReactNode }> = async ({ children }) => {
  const session = await getCurrentSession();
  const token = session ? session.token : "";
  return (
    <CommonLayout slug="MAIN DASHBOARD" hasSideBar={false}>
      <WebSocketProvider token={token}>{children}</WebSocketProvider>
    </CommonLayout>
  );
};

export default GameLayout;

export const metadata: Metadata = {
  title: "Game",
};
