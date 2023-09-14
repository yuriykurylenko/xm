import React from "react";
import Head from "next/head";
import { fetchCoachBySlug } from "@/app/utils/api";
import PageContainer from "@/app/components/PageContainer";
import withAuth from "@/app/hoc/withAuth";
import { ClientApplicationPageProps } from "@/types/ClientApplicationPageProps";
import { ClientApplicationPageContext } from "@/types/ClientApplicationPageContext";

const Success = ({ coach }: ClientApplicationPageProps) => {
  return (
    <div>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Success` : "Loading..."}
        </title>
      </Head>
      <PageContainer title="Congratulations!">
        <p>
          You have succesfully applied to work with <b>{coach.full_name}</b>.
          You will hear from us shortly.
        </p>
      </PageContainer>
    </div>
  );
};

export async function getServerSideProps(
  context: ClientApplicationPageContext
) {
  const { coachSlug } = context.params;
  const { data, error } = await fetchCoachBySlug(coachSlug);

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      coach: data,
    },
  };
}

export default withAuth(Success, ["anonymous"]);
