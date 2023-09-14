import * as React from "react";
import Head from "next/head";
import { useEffect, useState } from "react";
import withAuth from "@/app/hoc/withAuth";
import { fetchCoachById } from "@/app/utils/api";
import styles from "@/app/styles/home.module.css";
import { Client, Coach } from "@/types/user";
import { UUID } from "crypto";

const Home = ({ user }: { user: Client }) => {
  const [coach, setCoach] = useState<Coach | null>(null);

  useEffect(() => {
    (async () => {
      const coachResponse = user.coach_id
        ? await fetchCoachById(user.coach_id as UUID)
        : null;
      setCoach(coachResponse?.data as Coach);
    })();
  }, [user]);

  return (
    <div>
      <Head>
        <title>
          {coach?.full_name ? `${coach.full_name} | Coaching` : "Loading..."}
        </title>
      </Head>
      <div className={styles["main-container"]}>
        <h1>Welcome, {user.full_name}!</h1>
        <p>
          This is your space with {coach?.full_name}. <br />
          <br />
          More functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default withAuth(Home, ["client"]);
