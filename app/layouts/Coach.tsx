import React from "react";
import Header from "@/app/components/Header";
import { LayoutProps } from "@/app/types/LayoutProps";

const CoachLayout: React.FC<LayoutProps> = ({ children }) => {
  const menu = [
    { label: "Home", link: "/home" },
    { label: "Clients", link: "/clients" },
  ];

  return (
    <div>
      <Header menu={menu} />
      <div className="main-content">{children}</div>
    </div>
  );
};

export default CoachLayout;
