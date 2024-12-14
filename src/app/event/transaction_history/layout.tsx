import { ReactNode } from "react";
import { Metadata } from "next";

const TransHistoryLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export default TransHistoryLayout;

export const metadata: Metadata = {
  title: "Transaction History",
};
