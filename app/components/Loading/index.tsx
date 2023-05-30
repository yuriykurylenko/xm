import React from "react";
import styles from "@/app/components/Loading/styles.module.css";

export default function Loading() {
  return (
    <div className={styles["loading-container"]}>
      <span className={styles["loading-text"]}>Loading...</span>
    </div>
  );
}
