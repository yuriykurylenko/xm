import React from "react";
import styles from "@/app/components/ItemList/ItemSkeleton/styles.module.css";

const ItemSkeleton = () => {
  return (
    <div className={styles.skeleton}>
      <div className={styles.bulk}>
        <div className={styles.checkbox}></div>
      </div>
      <div className={styles.image} />
      <div className={styles.content}>
        <div className={styles.line} style={{ width: "60%" }} />
        <div className={styles.line} style={{ width: "80%" }} />
      </div>
    </div>
  );
};

export default ItemSkeleton;
