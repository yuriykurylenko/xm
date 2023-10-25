import React from "react";
import styles from "@/app/styles/anonymous.module.css";
import { LayoutProps } from "@/types/LayoutProps";
import ConfigProvider from "@/app/hooks/useConfig/Provider";

const AnonymousLayout: React.FC<LayoutProps> = ({ children }) => (
  <ConfigProvider>
    <div className={styles["blue-background"]}>{children}</div>
  </ConfigProvider>
);

export default AnonymousLayout;
