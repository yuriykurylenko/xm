import * as React from "react";
import Head from "next/head";
import withAuth from "@/app/hoc/withAuth";
import { fetchClientsByCoachId } from "@/app/utils/api";
import FilterBar from "@/app/components/FilterBar";

import ItemList from "@/app/components/ItemList";
import ClientCard from "@/domains/clients/components/ListCard";
import EmptyList, {
  EmptyListProps,
} from "@/domains/clients/components/EmptyList";
import { Coach, Client } from "@/types/user";
import { UUID } from "crypto";

import ClientsListHeader from "@/domains/clients/components/ListHeader";
import SearchInput from "@/app/components/SearchInput";
import actions from "@/domains/clients/actions";

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
