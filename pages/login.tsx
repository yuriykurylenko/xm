import styles from "@/app/components/Form/styles.module.css";

import withAuth from "@/app/hoc/withAuth";
import Link from "next/link";
import Head from "next/head";
import PageContainer from "@/app/components/PageContainer";
import ActionForm from "@/app/components/Actions/ActionForm";

const LoginPage = () => {
  return (
    <>
      <Head>
        <title>Coaching | Log in</title>
      </Head>
      <PageContainer title="Log in">
        <ActionForm action="common.logIn" />
        <p className={styles["sign-up-log-in"]}>
          Don&apos;t have an account yet? <Link href="/signup">Sign up</Link>
        </p>
      </PageContainer>
    </>
  );
};

export default withAuth(LoginPage, ["anonymous"]);
