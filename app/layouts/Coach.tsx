import React from "react";
import Header from "@/app/components/Header";
import { LayoutProps } from "@/app/types/LayoutProps";

const CoachLayout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default CoachLayout;
