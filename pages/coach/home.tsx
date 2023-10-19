import withAuth from "@/app/hoc/withAuth";
import { Coach } from "@/types/user";
import Head from "next/head";

const HomePage = ({ user }: { user: Coach }) => {
  return (
    <>
      <Head>
        <title>Coaching | Home</title>
      </Head>
      <h1>Welcome, {user.full_name}!</h1>
      <p>This is your space</p>
    </>
  );
};

export default withAuth(HomePage, ["coach"]);
