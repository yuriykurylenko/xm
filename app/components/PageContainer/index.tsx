import React, { FC } from "react";
import styles from "@/app/components/PageContainer/styles.module.css";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export const PageContainer: FC<PageContainerProps> = ({ title, children }) => {
  return (
    <div className={styles["page-container"]}>
      <div className={styles["page-wrapper"]}>
        <h2 className={styles["page-header"]}>{title}</h2>
        <div className={styles["page-content"]}>{children}</div>
      </div>
    </div>
  );
};

export default PageContainer;
