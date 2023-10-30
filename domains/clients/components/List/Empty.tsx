import React from "react";
import styles from "@/domains/clients/components/List/styles.module.css";
import { Coach } from "@/types/user";

export interface EmptyListProps {
  user?: Coach;
  isSearchResult: boolean;
}

const EmptyList: React.FC<EmptyListProps> = ({ user, isSearchResult }) => {
  const applicationLink = `${window.location.protocol}//${window.location.host}/${user?.slug}/apply`;
  return (
    <div className={styles["empty-list-container"]}>
      {!isSearchResult && user ? (
        <>
          Please share this link to get your clients to apply for coaching:
          <br />
          <a href={applicationLink}>{applicationLink}</a>
        </>
      ) : (
        <>No clients found</>
      )}
    </div>
  );
};

export default EmptyList;
