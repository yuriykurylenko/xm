import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { createClient, fetchCoachBySlug } from "@/app/utils/api";

import Form from "@/app/components/Form";
import withAuth from "@/app/hoc/withAuth";
import Input from "@/app/components/Form/Input";
import Button from "@/app/components/Form/Button";
import PageContainer from "@/app/components/PageContainer";
import { Client, ClientInput } from "@/app/types/user";
import { ClientApplicationPageProps } from "@/app/types/ClientApplicationPageProps";
import { ClientApplicationPageContext } from "@/app/types/ClientApplicationPageContext";
import { UUID } from "crypto";

const ClientApplication = ({ coach }: ClientApplicationPageProps) => {
  const router = useRouter();

  const onSubmit = async (data: ClientInput) => {
    const { full_name, email } = data;
    const { data: client, error } = await createClient({
      full_name,
      email,
      coach_id: coach.id as UUID,
    });

    if (client) {
      router.push(`/${coach.slug}/success`);
    }

    return { data: client, error };
  };

  return (
    <div>
      <Head>
        <title>
          {coach.full_name ? `${coach.full_name} | Application` : "Loading..."}
        </title>
      </Head>
      <PageContainer title={`Apply to work with ${coach?.full_name}`}>
        <Form<Client> onSubmit={onSubmit}>
          <Input name="full_name" placeholder="Full Name" required />
          <Input name="email" placeholder="Email" type="email" required />
          <Button type="submit" submittingText="Submitting..">
            Apply
          </Button>
        </Form>
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
