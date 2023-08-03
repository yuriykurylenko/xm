import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import {
  cancelClientSubscription,
  cancelClientSubscriptionSchedule,
  changeClientSubscriptionAmount,
  changeClientSubscriptionSchedule,
  fetchClientsByCoachId,
  sendClientOffer,
  updateClientById,
  updateSubscriptionByClientId,
} from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";

import ItemList, { Action } from "@/app/components/ItemList";
import ClientCard from "@/app/components/clients/ClientCard";
import EmptyList, { EmptyListProps } from "@/app/components/clients/EmptyList";
import { Coach, Client } from "@/app/types/user";
import { UUID } from "crypto";

import {
  faDollarSign,
  faPaperPlane,
  faPowerOff,
  faRotate,
  faTrash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import ClientsListHeader from "@/app/components/clients/ClientsListHeader";
import SearchInput from "@/app/components/SearchInput";
import PriceInput from "@/app/components/Form/PriceInput";
import Input from "@/app/components/Form/Input";
import { startOfDay } from "date-fns";

const Clients = ({ user }: { user: Coach }) => {
  const fetchClients = async (
    page: number,
    filterStatus: string,
    filterText?: string,
    sortColumn?: string,
    sortDirection?: "asc" | "desc"
  ) => {
    const { data, total } = await fetchClientsByCoachId(
      user.id as UUID,
      page,
      filterStatus,
      filterText,
      sortColumn,
      sortDirection
    );

    return { data, total } as { data: Client[]; total: number };
  };

  const handleSendOfferToClient = async (
    client: Client,
    data: {
      monthlyAmount: number | string;
      trialPeriod: boolean;
      startDate: Date;
    }
  ) => {
    const { monthlyAmount, trialPeriod, startDate } = data;

    const { data: sendOfferData, error } = await sendClientOffer(
      client.id as UUID,
      {
        monthlyAmount: Number(monthlyAmount) * 100,
        currency: "USD",
        trialPeriodDays: trialPeriod ? 14 : 0,
        startDate: startOfDay(startDate) || new Date(),
      }
    );

    if (error) {
      return { data: sendOfferData, error };
    }

    return { error: null };
  };

  const handleChangeClientSubscriptionSchedule = async (
    client: Client,
    data: {
      monthlyAmount: number | string;
      trialPeriod: boolean;
      startDate: Date;
    }
  ) => {
    const { monthlyAmount, trialPeriod, startDate } = data;

    const { data: changeClientSubscriptionScheduleData, error } =
      await changeClientSubscriptionSchedule(client.id as UUID, {
        monthlyAmount: Number(monthlyAmount) * 100,
        currency: "USD",
        trialPeriodDays: trialPeriod ? 14 : 0,
        startDate: startOfDay(startDate) || new Date(),
      });

    if (error) {
      return { data: changeClientSubscriptionScheduleData, error };
    }

    return { error: null };
  };

  const handleChangeClientSubscriptionAmount = async (
    client: Client,
    data: {
      monthlyAmount: number | string;
      trialPeriod: boolean;
      startDate: Date;
    }
  ) => {
    const { monthlyAmount, trialPeriod, startDate } = data;

    const { data: changeClientSubscriptionScheduleData, error } =
      await changeClientSubscriptionAmount(client.id as UUID, {
        monthlyAmount: Number(monthlyAmount) * 100,
        currency: "USD",
      });

    if (error) {
      return { data: changeClientSubscriptionScheduleData, error };
    }

    return { error: null };
  };

  const sendOfferToClientAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    return clientStatuses.length === 1 && clientStatuses[0] === "lead";
  };

  const resendOfferToClientAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    return clientStatuses.length === 1 && clientStatuses[0] === "offerSent";
  };

  const changeClientSubscriptionScheduleAllowed = (
    client: Client | Client[]
  ) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    return clientStatuses.length === 1 && clientStatuses[0] === "starting";
  };

  const changeClientSubscriptionAmountAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    const clientEndDates = [...new Set([client].flat().map((c) => c.end_date))];
    return (
      clientStatuses.length === 1 &&
      clientStatuses[0] === "client" &&
      clientEndDates.length === 1 &&
      clientEndDates[0] === null
    );
  };

  const cancelSubscriptionAllowed = (client: Client | Client[]) => {
    const clientSubscriptionStatuses = [
      ...new Set([client].flat().map((c) => c.subscription_status)),
    ];
    return clientSubscriptionStatuses.every((val?: string) =>
      ["past_due", "unpaid", "active", "trialing"].includes(val as string)
    );
  };

  const cancelOfferAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    return clientStatuses.length === 1 && clientStatuses[0] === "offerSent";
  };

  const cancelSubscriptionScheduleAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    return clientStatuses.length === 1 && clientStatuses[0] === "starting";
  };

  const archiveClientAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    const clientSubscriptionStatuses = [
      ...new Set([client].flat().map((c) => c.subscription_status)),
    ];

    return (
      clientSubscriptionStatuses.every((val?: string) => val === "canceled") ||
      clientStatuses.every((val?: string) => val === "lead")
    );
  };

  const revokeAccessAllowed = (client: Client | Client[]) => {
    const clientStatuses = [...new Set([client].flat().map((c) => c.status))];
    const clientUserIds = [client].flat().map((c) => c.user_id);

    return (
      clientUserIds.every((val?: string) => val != null) &&
      clientStatuses.every((val?: string) => val === "ended")
    );
  };

  const onSendOfferComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("offerSent");

  const handleArchiveClient = async (client: Client) => {
    const { data, error } = await updateClientById(client.id as UUID, {
      archived_at: new Date(),
    });
    return { data, error };
  };

  const handleRevokeAccess = async (client: Client) => {
    const { data, error } = await updateClientById(client.id as UUID, {
      user_id: null,
    });
    return { data, error };
  };

  const handleCancelClientSubscription = async (
    client: Client,
    data: {
      endImmediately: boolean;
      accessAfterEndDate: boolean;
    }
  ) => {
    const { endImmediately, accessAfterEndDate } = data;
    return await cancelClientSubscription(
      client,
      endImmediately,
      accessAfterEndDate
    );
  };

  const handleCancelClientSubscriptionSchedule = async (client: Client) => {
    return await cancelClientSubscriptionSchedule(client);
  };

  const handleCancelClientOffer = async (client: Client) => {
    await updateSubscriptionByClientId(client.id as string, {
      archived_at: new Date(),
      start_date: null,
      end_date: null,
    });
    return await updateClientById(client.id as string, {
      status: "lead",
      subscription_status: null,
    });
  };

  const onCancelClientOfferComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("lead");

  const onCancelClientSubscriptionComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("ended");

  const onCancelClientSubscriptionScheduleComplete = (
    setFilterStatus?: (filterStatus: string) => void
  ) => setFilterStatus && setFilterStatus("lead");

  const actions: Action<Client>[] = [
    {
      name: "sendOffer",
      title: "Send offer",
      titleBulk: "Send offers",
      icon: faPaperPlane,
      show: sendOfferToClientAllowed,
      handler: handleSendOfferToClient,
      onComplete: onSendOfferComplete,
      DialogForm: () => (
        <>
          <PriceInput
            name="monthlyAmount"
            placeholder="Monthly price"
            required
            defaultValue={user.monthly_subscription_amount / 100}
          />
          <Input
            name="startDate"
            type="date"
            placeholder="Start date"
            defaultValue={new Date()}
          />
          <Input
            name="trialPeriod"
            type="checkbox"
            placeholder="Offer trial period (14 days)"
          />
        </>
      ),
      dialogTitle: (selectedClient: Client) =>
        `Send offer to ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Send offers to ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `${selectedClient.full_name} will receive an email with the link to subscribe and pay your specified amount monthly.`,
      dialogTextBulk: (selectedClients: Client[]) =>
        "Your clients  will receive an email with the link to subscribe and pay your specified amount monthly.",
    },
    {
      name: "changeStartingSubscrition",
      title: "Change client's terms",
      titleBulk: "Change clients' terms",
      icon: faRotate,
      show: changeClientSubscriptionScheduleAllowed,
      handler: handleChangeClientSubscriptionSchedule,
      DialogForm: () => (
        <>
          <PriceInput
            name="monthlyAmount"
            placeholder="Monthly price"
            required
            defaultValue={user.monthly_subscription_amount / 100}
          />
          <Input
            name="startDate"
            type="date"
            placeholder="Start date"
            defaultValue={new Date()}
          />
          <Input
            name="trialPeriod"
            type="checkbox"
            placeholder="Offer trial period (14 days)"
          />
        </>
      ),
      dialogTitle: (selectedClient: Client) =>
        `Change terms for ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Change terms ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `Please specify the new price and start date for ${selectedClient.full_name}. They will receive an email confirming the change of the terms but would not need to add their credit card again.`,
      dialogTextBulk: (selectedClients: Client[]) =>
        "Please specify the new price and start date for selected clients. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "changeSubscritionAmount",
      title: "Change client's monthly price",
      titleBulk: "Change clients' monthly price",
      icon: faDollarSign,
      show: changeClientSubscriptionAmountAllowed,
      handler: handleChangeClientSubscriptionAmount,
      DialogForm: () => (
        <>
          <PriceInput
            name="monthlyAmount"
            placeholder="Monthly price"
            required
            defaultValue={user.monthly_subscription_amount / 100}
          />
        </>
      ),
      dialogTitle: (selectedClient: Client) =>
        `Change price for ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Change price ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `Please specify the new price for ${selectedClient.full_name}. They will receive an email confirming the change of the terms but would not need to add their credit card again.`,
      dialogTextBulk: (selectedClients: Client[]) =>
        "Please specify the new price for selected clients. They will receive an email confirming the change of the terms but would not need to add their credit card again.",
    },
    {
      name: "resendOffer",
      title: "Resend offer",
      titleBulk: "Resend offers",
      icon: faRotate,
      show: resendOfferToClientAllowed,
      handler: handleSendOfferToClient,
      onComplete: onSendOfferComplete,
      DialogForm: () => (
        <>
          <PriceInput
            name="monthlyAmount"
            placeholder="Monthly price"
            required
            defaultValue={user.monthly_subscription_amount / 100}
          />
          <Input
            name="startDate"
            type="date"
            placeholder="Start date"
            defaultValue={new Date()}
          />
          <Input
            name="trialPeriod"
            type="checkbox"
            placeholder="Offer trial period (14 days)"
          />
        </>
      ),
      dialogTitle: (selectedClient: Client) =>
        `Resend offer to ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Resend offers to ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `${selectedClient.full_name} will receive an email with the link to subscribe and pay your specified amount monthly. Your previous offer to the client will be canceled.`,
      dialogTextBulk: (selectedClients: Client[]) =>
        "Your clients will receive an email with the link to subscribe and pay your specified amount monthly. Your previous offers to them will be canceled.",
    },
    {
      name: "cancelOffer",
      title: "Cancel offer",
      titleBulk: "Cancel offers",
      icon: faXmark,
      show: cancelOfferAllowed,
      handler: handleCancelClientOffer,
      onComplete: onCancelClientOfferComplete,
      dialogTitle: (selectedClient: Client) =>
        `Cancel ${selectedClient.full_name}'s offer`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Cancel ${selectedClients.length + " clients' offers"}`,
      dialogText: (selectedClient: Client) =>
        `Are you sure you would like to cancel ${selectedClient.full_name}'s offer?`,
      dialogTextBulk: (selectedClients: Client[]) =>
        `Are you sure you would like to cancel ${selectedClients.length} clients' offers?`,
    },
    {
      name: "cancelSubscriptionSchedule",
      title: "Cancel starting client",
      titleBulk: "Cancel starting clients",
      icon: faXmark,
      show: cancelSubscriptionScheduleAllowed,
      handler: handleCancelClientSubscriptionSchedule,
      onComplete: onCancelClientSubscriptionScheduleComplete,
      dialogTitle: (selectedClient: Client) =>
        `Cancel ${selectedClient.full_name}'s start`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Cancel ${selectedClients.length + " clients' start"}`,
      dialogText: (selectedClient: Client) =>
        `Are you sure you would like to cancel ${selectedClient.full_name}'s start?`,
      dialogTextBulk: (selectedClients: Client[]) =>
        `Are you sure you would like to cancel ${selectedClients.length} clients' start?`,
    },
    {
      name: "revokeAccess",
      title: "Revoke platform access",
      titleBulk: "Revoke platform access",
      icon: faPowerOff,
      show: revokeAccessAllowed,
      handler: handleRevokeAccess,
      dialogTitle: (selectedClient: Client) =>
        `Revoke access for ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Revoke access for ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `Are you sure you would like to revoke platform access for ${selectedClient.full_name}?`,
      dialogTextBulk: (selectedClients: Client[]) =>
        `Are you sure you would like to revoke platform access for ${selectedClients.length} clients?`,
    },
    {
      name: "endSubscription",
      title: "End client",
      titleBulk: "End clients",
      icon: faXmark,
      show: cancelSubscriptionAllowed,
      handler: handleCancelClientSubscription,
      onComplete: onCancelClientSubscriptionComplete,
      DialogForm: () => (
        <>
          <Input
            name="endImmediately"
            type="checkbox"
            placeholder="End immediately"
          />
          <Input
            name="accessAfterEndDate"
            type="checkbox"
            placeholder="Allow platform access after the client stops"
          />
        </>
      ),
      dialogTitle: (selectedClient: Client) =>
        `End ${selectedClient.full_name}'s subscription`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `End ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `Are you sure you would like to end ${selectedClient.full_name}? The client will stop at the end of their monthly billing cycle.`,
      dialogTextBulk: (selectedClients: Client[]) =>
        `Are you sure you would like to end ${selectedClients.length} clients? The client will be ended at the end of their respective monthly billing cycles.`,
    },
    {
      name: "archive",
      title: "Archive",
      titleBulk: "Archive",
      icon: faTrash,
      show: archiveClientAllowed,
      handler: handleArchiveClient,
      dialogTitle: (selectedClient: Client) =>
        `Archive ${selectedClient.full_name}`,
      dialogTitleBulk: (selectedClients: Client[]) =>
        `Archive ${selectedClients.length + " clients"}`,
      dialogText: (selectedClient: Client) =>
        `Are you sure you would like to archive ${selectedClient.full_name}?`,
      dialogTextBulk: (selectedClients: Client[]) =>
        `Are you sure you would like to archive ${selectedClients.length} clients?`,
    },
  ];

  return (
    <>
      <Head>
        <title>Coaching | Clients</title>
      </Head>
      <>
        <ItemList<Client>
          title="Clients"
          filterStatusOptions={[
            { value: "lead", name: "Leads" },
            { value: "offerSent", name: "Sent Offers" },
            { value: "starting", name: "Starting" },
            { value: "client", name: "Active" },
            { value: "ended", name: "Ended" },
          ]}
          fetchItems={fetchClients}
          actions={actions}
          SearchInputComponent={SearchInput}
          FilterBarComponent={FilterBar}
          HeaderComponent={ClientsListHeader}
          CardComponent={ClientCard}
          EmptyListComponent={(props: EmptyListProps) => (
            <EmptyList {...props} user={user} />
          )}
        />
      </>
    </>
  );
};

export default withAuth(Clients, ["coach"]);
