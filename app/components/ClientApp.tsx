import Head from "next/head";
import Header from "./Header";
import "@/app/globals.css";

const ClientApp = ({ client, coach }: { client: any; coach: any }) => {
  return (
    <div>
      <Head>
        <title>
          {(coach as any)?.full_name
            ? `${(coach as any)?.full_name} | Coaching`
            : "Loading..."}
        </title>
      </Head>
      <Header />
      <div className="form-container">
        <h1>Welcome, {(client as any)?.full_name}!</h1>
        <p>
          This is your space with {(coach as any)?.full_name}. <br />
          <br />
          More functionality coming soon!
        </p>
      </div>
    </div>
  );
};

export default ClientApp;
