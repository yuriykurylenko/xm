import Form from "@/app/components/Form";
import PriceInput from "@/app/components/Form/PriceInput";
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

interface CoachSignUpFormData {
  email: string;
  password: string;
  full_name: string;
  monthly_subscription_amount: number | string;
}

const Signup = () => {
  const { user, coachSignUp } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.reload();
    }
  }, [user]);

  const onSubmit = (data: CoachSignUpFormData) => {
    const { email, password, full_name, monthly_subscription_amount } = data;

    return coachSignUp({
      email,
      password,
      full_name,
      monthly_subscription_amount: Number(monthly_subscription_amount) * 100,
    });
  };

  return (
    <div>
      <Head>
        <title>Coaching | Sign up</title>
      </Head>
      <PageContainer title="Sign up as a Coach">
        <Form onSubmit={onSubmit}>
          <Input name="full_name" placeholder="Full Name" required />
          <Input name="email" placeholder="Email" type="email" required />
          <Input
            name="password"
            placeholder="Password"
            type="password"
            required
            validation={{
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters long",
              },
            }}
          />
          <PriceInput
            name="monthly_subscription_amount"
            placeholder="Monthly price"
            required
          />
          <Button type="submit" submittingText="Signing up...">
            Sign up
          </Button>
          <p className={styles["sign-up-log-in"]}>
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </Form>
      </PageContainer>
    </div>
  );
};

export default withAuth(Signup, ["anonymous"]);
