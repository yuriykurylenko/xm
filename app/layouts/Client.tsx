import React from "react";
import Header from "@/app/components/Header";
import { LayoutProps } from "@/types/LayoutProps";

const ClientLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      <div className="main-content">{children}</div>
    </div>
  );
};

export default ClientLayout;
