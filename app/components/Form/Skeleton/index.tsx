import React from "react";
import styles from "@/app/components/Form/Skeleton/styles.module.css";

const FormSkeleton = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.field} />
      <div className={styles.button} />
    </div>
  );
};

export default FormSkeleton;
