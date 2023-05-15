import withAuth from "@/app/components/withAuth";
import CoachSignupForm from "../app/components/CoachSignupForm";
import "@/app/globals.css";
import Head from "next/head";

const Signup = () => {
  return (
    <div>
      <Head>
        <title>Coaching | Sign up</title>
      </Head>
      <CoachSignupForm />
    </div>
  );
};

export default withAuth(Signup, ["anonymous"]);
