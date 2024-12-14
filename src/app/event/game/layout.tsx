import { ReactNode } from "react";
import { Metadata } from "next";

const GameLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
   
  return <>{children}</>;
};

export default GameLayout;

export const metadata: Metadata = {
  title: "Game",
};
