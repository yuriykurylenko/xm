import styles from "@/app/components/Form/styles.module.css";

import withAuth from "@/app/hoc/withAuth";
import Link from "next/link";
import Head from "next/head";
import PageContainer from "@/app/components/PageContainer";
import ActionForm from "@/app/components/Actions/ActionForm";

const SignupPage = () => (
  <>
    <Head>
      <title>Coaching | Sign up</title>
    </Head>
    <PageContainer title="Sign up as a Coach">
      <ActionForm action="coaches.createAccount" />
      <p className={styles["sign-up-log-in"]}>
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </PageContainer>
  </>
);

export default withAuth(SignupPage, ["anonymous"]);
