import React from "react";
import Header from "@/app/components/Header";
import { LayoutProps } from "@/types/LayoutProps";
import ConfigProvider from "@/app/hooks/useConfig/Provider";

const CoachLayout: React.FC<LayoutProps> = ({ children }) => {
  const menu = [
    { label: "Home", link: "/coach/home" },
    { label: "Clients", link: "/coach/clients" },
  ];

  return (
    <ConfigProvider>
      <Header menu={menu} />
      <div className="main-content">{children}</div>
    </ConfigProvider>
  );
};

export default CoachLayout;
