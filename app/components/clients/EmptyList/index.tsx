import React from "react";
import styles from "@/app/components/clients/EmptyList/styles.module.css";
import { Coach } from "@/app/types/user";

interface EmptyListProps {
  user: Coach;
}

const EmptyList: React.FC<EmptyListProps> = ({ user }) => {
  const applicationLink = `${window.location.protocol}//${window.location.host}/${user.slug}/apply`;
  return (
    <div className={styles["empty-list-container"]}>
      Please share this link to get your clients to apply for coaching:
      <br />
      <a href={applicationLink}>{applicationLink}</a>
    </div>
  );
};

export default EmptyList;
