import React from "react";
import Head from "next/head";
import { fetchCoachBySlug } from "@/app/utils/api";
import PageContainer from "@/app/components/PageContainer";
import withAuth from "@/app/hoc/withAuth";

const Success = ({ coachName }: { coachName: any }) => {
  return (
    <div>
      <Head>
        <title>{coachName ? `${coachName} | Success` : "Loading..."}</title>
      </Head>
      <PageContainer title="Congratulations!">
        <p>
          You have succesfully applied to work with <b>{coachName}</b>. You will
          hear from us shortly.
        </p>
      </PageContainer>
    </div>
  );
};

export async function getServerSideProps(context: any) {
  const { coachSlug } = context.params;
  const { data, error } = await fetchCoachBySlug(coachSlug);

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      coachName: data.full_name,
    },
  };
}

export default withAuth(Success, ["anonymous"]);
