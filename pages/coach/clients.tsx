import * as React from "react";
import Head from "next/head";

import { Coach, Client } from "@/types/user";
import { UUID } from "crypto";

import { fetchAllByCoachId as fetchClientsByCoachId } from "@/domains/clients/model";

import withAuth from "@/app/hoc/withAuth";

import FilterBar from "@/app/components/FilterBar";
import ItemList from "@/app/components/ItemList";
import SearchInput from "@/app/components/SearchInput";

import ClientCard from "@/domains/clients/components/ListCard";
import EmptyList, {
  EmptyListProps,
} from "@/domains/clients/components/EmptyList";
import ClientsListHeader from "@/domains/clients/components/ListHeader";

const ClientsPage = ({ user }: { user: Coach }) => {
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

  return (
    <>
      <Head>
        <title>Coaching | Clients</title>
      </Head>
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
        actions={[
          "clients.sendOffer",
          "clients.changeTerms",
          "clients.changePricing",
          // "clients.renewSubscription",
          // "clients.resendOffer",
          // "clients.sendOfferWhenEnded",
          "clients.revokeAccess",
          "clients.cancelOffer",
          "clients.cancelStart",
          "clients.cancelSubscription",
          "clients.archive",
        ]}
        SearchInputComponent={SearchInput}
        FilterBarComponent={FilterBar}
        HeaderComponent={ClientsListHeader}
        CardComponent={ClientCard}
        EmptyListComponent={(props: EmptyListProps) => (
          <EmptyList {...props} user={user} />
        )}
      />
    </>
  );
};

export default withAuth(ClientsPage, ["coach"]);
