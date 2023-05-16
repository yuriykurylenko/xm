import Head from "next/head";
import "@/app/globals.css";
import { useEffect, useState } from "react";
import withAuth from "@/app/components/withAuth";
import { fetchCoachById } from "@/app/utils/api";

const Welcome = ({ user }: { user: any }) => {
  const [coach, setCoach] = useState(null);3

  useEffect(() => {
    (async () => {
      const { data } = await fetchCoachById(user.coach_id);
      setCoach(data);
    })
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
      <div className="form-container">
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

export default withAuth(Welcome, ["client"]);
