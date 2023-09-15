import { Action } from "@/types/action";
import { Client } from "@/types/user";
import StripeApi from "stripe";
import { MailService } from "@sendgrid/mail";

import { ClientTermsFormFields } from "@/domains/clients/components/DialogForms/TermsFields";

import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import {
  createClientSubscription,
  sendClientPaymentLink,
  updateClientById,
} from "@/app/utils/api";
import { Subscription } from "@/types/subscription";

export const sendClientOffer = async (
  clientId: UUID,
  {
    monthlyAmount,
    currency = "USD",
    trialPeriodDays,
    trialPeriod,
    startDate,
  }: {
    monthlyAmount: number;
    currency: string;
    trialPeriodDays?: number;
    trialPeriod?: boolean;
    startDate?: Date | string | null;
  },
  { stripe, sgMail }: { stripe: StripeApi; sgMail: MailService }
) => {
  const { data: subscription, error: subscriptionError } =
    await createClientSubscription(
      clientId as UUID,
      {
        monthlyAmount,
        currency,
        trialPeriodDays: trialPeriodDays || (trialPeriod ? 14 : 0),
        startDate,
      },
      stripe
    );

  if (subscriptionError) {
    return { subscription, error: { message: "Error creating subscription" } };
  }

  if (subscription) {
    await sendClientPaymentLink(subscription as Subscription, sgMail);
  }

  const { data, error } = await updateClientById(clientId as UUID, {
    status: "offerSent",
  });
  return { data, error };
};

const onSendOfferComplete = (
  setFilterStatus?: (filterStatus: string) => void
) => setFilterStatus && setFilterStatus("offerSent");

const sendOffer: Action<Client> = {
  name: "sendOffer",
  title: "Send offer",
  titleBulk: "Send offers",
  icon: faPaperPlane,
  show: (client: Client) => client.status === "lead",
  apiOperation: "sendOffer",
  apiHandler: sendClientOffer,
  onComplete: onSendOfferComplete,
  DialogForm: ({ items, user }: { items: Client[]; user: any }) =>
    ClientTermsFormFields({ items, coach: user }),
  dialogTitle: "Send offer to {{full_name}}",
  dialogTitleBulk: "Send offers to {{n}} clients",
  dialogText: "Please specify the price and start date for {{full_name}}.",
  dialogTextBulk: "Please specify the price and start date for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly.",
  dialogInfoTextBulk:
    "Your clients will receive an email with the link to subscribe and pay your specified amount monthly.",
};

export default sendOffer;
