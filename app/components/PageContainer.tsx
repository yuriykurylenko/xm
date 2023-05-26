import React, { FC } from "react";
import styles from "@/app/components/Form/styles.module.css";

interface PageContainerProps {
  title: string;
  children: React.ReactNode;
}

export const PageContainer: FC<PageContainerProps> = ({ title, children }) => {
  return (
    <div className={styles["form-container"]}>
      <div className={styles["form-wrapper"]}>
        <h2 className={styles["form-header"]}>{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
