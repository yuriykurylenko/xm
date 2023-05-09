import supabase from "@/app/utils/supabaseClient";

export default function Home() {
  // The actual component will not render anything in this case
  return null;
}

export async function getServerSideProps(context: any) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data } = await supabase
      .from("coaches")
      .select("*")
      .eq("user_id", user.id);

    console.log(user, data);

    if (data[0]?.id) {
      return {
        redirect: {
          destination: "/clients",
          permanent: false,
        },
      };
    }
  }

  return {
    redirect: {
      destination: "/signup",
      permanent: false,
    },
  };
}
