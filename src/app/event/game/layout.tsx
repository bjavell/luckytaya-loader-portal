import { ReactNode } from "react";
import { Metadata } from "next";
import { WebSocketProvider } from "@/context/webSocketContext";

const GameLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <WebSocketProvider>{children}</WebSocketProvider>;
};

export default GameLayout;

export const metadata: Metadata = {
  title: "Game",
};
