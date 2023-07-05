import React from "react";
import Header from "@/app/components/Header";
import { LayoutProps } from "@/app/types/LayoutProps";

const CoachLayout: React.FC<LayoutProps> = ({ children }) => {
  const menu = [
    { label: "Home", link: "/coach/home" },
    { label: "Clients", link: "/coach/clients" },
  ];

  return (
    <div>
      <Header menu={menu} />
      <div className="main-content">{children}</div>
    </div>
  );
};

export default CoachLayout;
