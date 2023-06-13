import React from "react";
import Header from "@/app/components/Header";
import { LayoutProps } from "@/app/types/LayoutProps";

const ClientLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default ClientLayout;
