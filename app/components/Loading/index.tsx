import React from "react";
import styles from "@/app/components/Loading/styles.module.css";
import { BeatLoader } from "react-spinners";

export default function Loading() {
  return (
    <div className={styles["spinner-container"]}>
      <BeatLoader color="#5683d7" size={11} />
    </div>
  );
}
