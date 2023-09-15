import StripeApi from "stripe";
import { MailService } from "@sendgrid/mail";

import { Action } from "@/types/action";
import { Client, Coach } from "@/types/user";

import { ClientTermsFormFields } from "@/domains/clients/components/DialogForms/TermsFields";

import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { UUID } from "crypto";
import {
  createClientSubscription,
  sendClientPaymentLink,
  updateClientById,
} from "@/app/utils/api";
import { Subscription } from "@/types/subscription";

const sendClientOffer = async (
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

const sendOfferToEndedClient: Action<Client> = {
  name: "sendOfferToEndedClient",
  title: "Send a new offer",
  titleBulk: "Send new offers",
  icon: faRotate,
  show: (client: Client) => client.status === "ended",
  apiOperation: "sendOfferToEndedClient",
  apiHandler: sendClientOffer,
  onComplete: onSendOfferComplete,
  DialogForm: ({ items, user }: { items: Client[]; user: Client | Coach }) =>
    ClientTermsFormFields({ items, coach: user as Coach }),
  dialogTitle: "Send a new offer to {{full_name}}",
  dialogTitleBulk: "Send new offers to {{n}} clients",
  dialogText: "Please specify the price and start date for {{full_name}}.",
  dialogTextBulk: "Please specify the price and start date for your clients.",
  dialogInfoText:
    "{{full_name}} will receive an email with the link to subscribe and pay your specified amount monthly.",
  dialogInfoTextBulk:
    "Your clients will receive an email with the link to subscribe and pay your specified amount monthly.",
};

export default sendOfferToEndedClient;
