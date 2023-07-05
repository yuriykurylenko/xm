import withAuth from "@/app/hoc/withAuth";
import { Coach } from "@/app/types/user";

const Home = ({ user }: { user: Coach }) => {
  return (
    <>
      <h1>Welcome, {user.full_name}!</h1>
      <p>This is your space</p>
    </>
  );
};

export default withAuth(Home, ["coach"]);
