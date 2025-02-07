import { ReactNode } from "react";
import { Metadata } from "next";
import { getCurrentSession } from "@/context/auth";
import CommonLayout from "../layout/commonLayout";

const GameLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <CommonLayout slug="MAIN DASHBOARD">
      {children}
    </CommonLayout>
  );
};

export default GameLayout;

export const metadata: Metadata = {
  title: "Game",
};
