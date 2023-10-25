import React from "react";
import Header from "@/app/components/Header";
import { LayoutProps } from "@/types/LayoutProps";
import ConfigProvider from "@/app/hooks/useConfig/Provider";

const ClientLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <ConfigProvider>
      <Header />
      <div className="main-content">{children}</div>
    </ConfigProvider>
  );
};

export default ClientLayout;
