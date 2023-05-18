import withAuth from "@/app/components/withAuth";

const Home = () => {
  return null;
};

export default withAuth(Home, ["coach", "client"]);
