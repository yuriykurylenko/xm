import { useEffect, useState } from "react";
import supabase from "@/app/utils/supabaseClient";
import styles from "@/app/styles/subscriptionPage.module.css";

const SubscriptionPage = ({ subscription }: { subscription: any }) => {
  const [client, setClient] = useState(null);
  const [coach, setCoach] = useState(null);

  useEffect(() => {
    fetchClientAndCoach();
  }, []);

  async function fetchClientAndCoach() {
    const { data: clientData } = await supabase
      .from("clients")
      .select("*")
      .eq("id", subscription.client_id);

    const { data: coachData } = await supabase
      .from("coaches")
      .select("*")
      .eq("id", clientData[0]?.coach_id);

    setClient(clientData[0]);
    setCoach(coachData[0]);
  }

  // Helper function to format the subscription amount
  const formatAmount = (amount: number, currency: string) => {
    const formattedAmount = Number((amount / 100).toFixed(2));
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(formattedAmount);
  };

  return (
    <div className={styles["subscription-page"]}>
      <div className={styles["subscription-container"]}>
        <h1 className={styles["header"]}>Coaching Subscription</h1>
        <div className={styles["content"]}>
          Dear <b>{(client as any)?.full_name}</b>, you will now start a
          coaching subscription with me. Please enter your payment details in
          the form below. You will be paying{" "}
          <b>
            {formatAmount(subscription?.monthly_amount, subscription.currency)}
          </b>{" "}
          monthly. Can&apos;t wait to get started!
          <p className={styles["signature"]}>
            Sincerely, <br />
            {(coach as any)?.full_name}
          </p>
        </div>
      </div>
    </div>
  );
};

export async function getServerSideProps(context: {
  params: { subscription_id: any };
}) {
  console.log(context.params);
  const { subscription_id } = context.params;

  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", subscription_id);

  const subscription = subscriptionData[0];

  return {
    props: {
      subscription,
    },
  };
}

export default SubscriptionPage;
