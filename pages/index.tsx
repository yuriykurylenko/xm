import withAuth from "@/app/hoc/withAuth";

const HomePage = () => {
  return null;
};

export default withAuth(HomePage, ["coach", "client"]);
