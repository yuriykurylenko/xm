import withAuth from "@/app/hoc/withAuth";

const Home = () => {
  return null;
};

export default withAuth(Home, ["coach", "client"]);
