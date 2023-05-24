import Form, { Button, Input } from "@/app/components/Form";
import styles from "@/app/components/Form/styles.module.css";

import useAuth from "@/app/utils/useAuth";
import withAuth from "@/app/components/withAuth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";

const Login = () => {
  const { logIn, user, error } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.reload();
    }
    if (error) {
      setSubmitting(false);
    }
  }, [user, error]);

  const onSubmit = async (data: any) => {
    setSubmitting(true);

    const { email, password } = data;
    await logIn(email, password);

    setSubmitting(false);
  };

  return (
    <div>
      <Head>
        <title>Coaching | Log in</title>
      </Head>
      <div className={styles["form-container"]}>
        <div className={styles["form-wrapper"]}>
          <Form onSubmit={onSubmit}>
            <h2 className={styles["form-header"]}>Log in</h2>
            <Input name="email" placeholder="Email" type="email" required />
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
            />
            <Button type="submit" disabled={submitting} error={error || ""}>
              {submitting ? "Logging in..." : "Log in"}
            </Button>
            <p className={styles["sign-up-log-in"]}>
              Don&apos;t have an account yet?{" "}
              <Link href="/signup">Sign up</Link>
            </p>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default withAuth(Login, ["anonymous"]);
