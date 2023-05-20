import Head from "next/head";
import { useEffect, useState } from "react";
import withAuth from "@/app/components/withAuth";
import { fetchCoachById } from "@/app/utils/api";
import styles from "@/app/styles/home.module.css";

const Home = ({ user }: { user: any }) => {
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    (async () => {
      const { data } = await fetchCoachById(user.coach_id);
      setCoach(data);
    })();
  }, []);

  return (
    <div>
      <Head>
        <title>
          {(coach as any)?.full_name
            ? `${(coach as any)?.full_name} | Coaching`
            : "Loading..."}
        </title>
      </Head>
      <div className={styles["main-container"]}>
        <h1>Welcome, {(user as any)?.full_name}!</h1>
        <p>
          This is your space with {(coach as any)?.full_name}. <br />
          <br />
          More functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default withAuth(Home, ["client"]);
