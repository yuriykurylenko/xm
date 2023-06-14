import Form from "@/app/components/Form";
import Input from "@/app/components/Form/Input";
import Button from "@/app/components/Form/Button";

import styles from "@/app/components/Form/styles.module.css";

import useAuth from "@/app/hooks/useAuth";
import withAuth from "@/app/hoc/withAuth";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PageContainer from "@/app/components/PageContainer";

type LoginFormData = {
  email: string;
  password: string;
};

const Login = () => {
  const { logIn, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.reload();
    }
  }, [user]);

  const onSubmit = (data: LoginFormData) => {
    const { email, password } = data;
    return logIn(email, password);
  };

  return (
    <div>
      <Head>
        <title>Coaching | Log in</title>
      </Head>
      <PageContainer title="Log in">
        <Form<LoginFormData> onSubmit={onSubmit}>
          <Input name="email" placeholder="Email" type="email" required />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            required
          />
          <Button type="submit" submittingText="Logging in...">
            Log in
          </Button>
          <p className={styles["sign-up-log-in"]}>
            Don&apos;t have an account yet? <Link href="/signup">Sign up</Link>
          </p>
        </Form>
      </PageContainer>
    </div>
  );
};

export default withAuth(Login, ["anonymous"]);
