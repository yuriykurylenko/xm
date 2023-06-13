import React from "react";
import styles from "@/app/styles/anonymous.module.css";

interface AnonymousLayoutProps {
  children: React.ReactNode;
}

const AnonymousLayout: React.FC<AnonymousLayoutProps> = ({ children }) => {
  return <div className={styles["blue-background"]}>{children}</div>;
};

export default AnonymousLayout;
