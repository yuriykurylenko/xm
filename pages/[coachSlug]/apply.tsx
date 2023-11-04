import React from "react";
import Head from "next/head";

import { fetchBySlug as fetchCoachBySlug } from "@/domains/coaches/model";

import withAuth from "@/app/hoc/withAuth";
import PageContainer from "@/app/components/PageContainer";
import { ClientApplicationPageProps } from "@/types/ClientApplicationPageProps";
import { ClientApplicationPageContext } from "@/types/ClientApplicationPageContext";
import ActionForm from "@/app/components/Actions/Form";

const ClientApplication = ({ coach }: ClientApplicationPageProps) => {
  return (
    <div>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Application` : "Loading..."}
        </title>
      </Head>
      <PageContainer title={`Apply to work with ${coach.full_name}`}>
        <ActionForm action="clients.apply" values={{ coach_id: coach.id }} />
      </PageContainer>
    </div>
  );
};

export async function getServerSideProps(
  context: ClientApplicationPageContext
) {
  const { coachSlug } = context.params;
  const { data: coach, error } = await fetchCoachBySlug(coachSlug);

  if (error) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      coach,
    },
  };
}

export default withAuth(ClientApplication, ["anonymous"]);
