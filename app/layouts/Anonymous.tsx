import React from "react";
import styles from "@/app/styles/anonymous.module.css";
import { LayoutProps } from "@/app/types/LayoutProps";

const AnonymousLayout: React.FC<LayoutProps> = ({ children }) => {
  return <div className={styles["blue-background"]}>{children}</div>;
};

export default AnonymousLayout;
