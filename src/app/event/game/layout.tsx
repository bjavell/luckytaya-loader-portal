import { ReactNode } from "react";
import { Metadata } from "next";
import { WebSocketProvider } from "@/context/webSocketContext";
import { getCurrentSession } from "@/context/auth";

const GameLayout: React.FC<{ children: ReactNode }> = async ({ children }) => {
    const session = await getCurrentSession();
    const token = session? session.token : "";
  return <WebSocketProvider token={token}>{children}</WebSocketProvider>;
};

export default GameLayout;

export const metadata: Metadata = {
  title: "Game",
};
