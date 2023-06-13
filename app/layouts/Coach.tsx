import React from "react";
import Header from "@/app/components/Header";

interface CoachLayoutProps {
  children: React.ReactNode;
}

const CoachLayout: React.FC<CoachLayoutProps> = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

export default CoachLayout;
