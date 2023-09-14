import * as React from "react";
import styles from "@/app/components/ItemList/styles.module.css";
import { useEffect, useState } from "react";
import Pagination from "@/app/components/ItemList/Pagination";
import ActionDialog from "../ActionDialog";
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import ItemSkeleton from "@/app/components/ItemList/ItemSkeleton";
import { UUID } from "crypto";

import Handlebars from "handlebars";
import axios from "axios";
import useAuth from "@/app/hooks/useAuth";
import { Client, Coach } from "@/types/user";

type FilterOption = {
  value: string;
  name: string;
};

export type Action<T extends { id: UUID | string }, D = any, U = any> = {
  name: string;
  title: string;
  titleBulk: string;
  icon: IconDefinition;
  show: (item: T) => boolean;
  handler?: (itemId: UUID, data: D) => Promise<U>;
  apiOperation?: string;
  onComplete?: (setFilterStatus?: (filterStatus: string) => void) => void;
  DialogForm?: React.ComponentType<{ items: T[]; user: Client | Coach }>;
  dialogTitle: string;
  dialogTitleBulk: string;
  dialogText?: string;
  dialogTextBulk?: string;
  dialogInfoText?: string;
  dialogInfoTextBulk?: string;
};

interface ItemListProps<T extends { id: UUID | string }> {
  title: string;
  filterStatusOptions: FilterOption[];
  fetchItems: (
    page: number,
    filterStatus: string,
    filterText?: string,
    sortColumn?: string,
    sortDirection?: "asc" | "desc"
  ) => Promise<{ data: T[]; total: number }>;
  SearchInputComponent?: React.ComponentType<{
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
  }>;
  FilterBarComponent?: React.ComponentType<{
    filterStatus: string;
    setFilterStatus: (status: string) => void;
    filterOptions: FilterOption[];
  }>;
  HeaderComponent?: React.ComponentType<{
    onSort: (column: string) => void;
    sortColumn: string;
    sortDirection: "desc" | "asc";
    onBulkSelect: () => void;
    selectedItems: T[];
    actions: Action<T>[];
    totalItemsCount: number;
  }>;
  CardComponent: React.ComponentType<{
    item: T;
    selectedItems: T[];
    onSelect: () => void;
    bulkOperationsAllowed: boolean;
    actions?: any;
    filterStatus: string;
  }>;
  EmptyListComponent?: React.ComponentType<{
    isSearchResult: boolean;
  }>;
  actions: any;
}

const ItemList = <T extends { id: UUID | string }>({
  title,
  filterStatusOptions,
  fetchItems,
  SearchInputComponent,
  FilterBarComponent,
  HeaderComponent,
  CardComponent,
  EmptyListComponent,
  actions,
}: ItemListProps<T>) => {
  const { user } = useAuth();

  const [filterStatus, setFilterStatus] = useState<string>(
    filterStatusOptions && FilterBarComponent
      ? filterStatusOptions[0].value
      : "all"
  );
  const [filterText, setFilterText] = useState<string>("");

  const [filterCounts, setFilterCounts] = useState<Record<string, number>>(
    filterStatusOptions
      .map((fso) => fso.name)
      .reduce<Record<string, number>>((acc, key) => {
        acc[key] = 0;
        return acc;
      }, {})
  );

  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<T[]>([]);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sortColumn, setSortColumn] = useState("updated_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [isListLoaded, setIsListLoaded] = useState<boolean>(false);

  const [openActionDialogs, setOpenActionDialogs] = useState<string[]>([]);

  const prepareData = async () => {
    setIsListLoaded(false);

    const { data: items, total } = await fetchItems(
      page,
      filterStatus,
      filterText,
      sortColumn,
      sortDirection
    );
    // @ts-ignore
    setItems(items as T[]);
    setTotalItems(total);
    updateFilterCounts();

    setIsListLoaded(true);
  };

  useEffect(() => {
    (async () => {
      await prepareData();
    })();
  }, [page, filterStatus, filterText, sortColumn, sortDirection]);

  const changeFilterStatus = (status: string) => {
    if (status !== filterStatus) {
      setIsListLoaded(false);
    }
    setFilterStatus(status);
    setPage(1);
    setSelectedItems([]);
  };

  const updateFilterCounts = async () => {
    const counts: Record<string, number> = {};

    for (const filterOption of filterStatusOptions) {
      const { total } = await fetchItems(1, filterOption.value);
      counts[filterOption.value] = total as number;
    }

    setFilterCounts(counts);
  };

  const onItemSelect = (item: T) => {
    selectedItems.includes(item)
      ? setSelectedItems(selectedItems.filter((i) => i !== item))
      : setSelectedItems([...selectedItems, item]);
  };

  const onItemsBulkSelect = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items);
    }
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePrevPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  const handleSort = (column: React.SetStateAction<string>) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const handleSearch = (value: string) => {
    setPage(1);
    setFilterText(value);
  };

  const enhancedActions = actions.map((action: { name: string }) => ({
    ...action,
    handler: (itemId?: UUID | UUID[]) => {
      if (itemId) {
        setSelectedItems(
          items.filter((i: T) => [itemId].flat().includes(i.id as UUID))
        );
      }
      setOpenActionDialogs([action.name]);
    },
  }));

  const handleCloseDialog = () => {
    setSelectedItems([]);
    setOpenActionDialogs([]);
  };

  const handleConfirmAction = async (action: any, data?: any) => {
    for (const item of selectedItems) {
      try {
        const { error } = action.handler
          ? await action.handler(item.id, data)
          : await axios.put(
              `/api/clients/${item.id}/${action.apiOperation}`,
              data
            );

        if (error) {
          return { error };
        }
      } catch (e: any) {
        console.log(e);
        return (
          e.response?.data || { error: { message: "Something went wrong" } }
        );
      }
    }

    handleCloseDialog();
    await prepareData();
    action.onComplete && action.onComplete(setFilterStatus);

    return { error: null };
  };

  const searchPlaceholder =
    filterStatus != "all"
      ? `Search in ${
          filterStatusOptions.find((o) => o.value === filterStatus)?.name
        }`
      : "Search";

  return (
    <div className={styles["items-container"]}>
      <div className={styles["items-container-header"]}>
        <div className={styles["items-title-container"]}>
          <h1>{title}</h1>
          {SearchInputComponent && (
            <SearchInputComponent
              value={filterText}
              onChange={handleSearch}
              placeholder={searchPlaceholder}
            />
          )}
        </div>
        {FilterBarComponent && (
          <FilterBarComponent
            filterOptions={filterStatusOptions.map((option: FilterOption) => ({
              ...option,
              count: filterCounts[option.value],
            }))}
            filterStatus={filterStatus}
            setFilterStatus={changeFilterStatus}
          />
        )}
      </div>
      {HeaderComponent && (
        <HeaderComponent
          onBulkSelect={onItemsBulkSelect}
          selectedItems={selectedItems}
          actions={enhancedActions}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          totalItemsCount={filterCounts[filterStatus]}
        />
      )}
      {isListLoaded && items ? (
        items.length === 0 && EmptyListComponent ? (
          <EmptyListComponent isSearchResult={filterText !== ""} />
        ) : (
          <>
            {items.map((item, index) => (
              <CardComponent
                key={index}
                item={item}
                selectedItems={selectedItems}
                bulkOperationsAllowed={true}
                onSelect={() => onItemSelect(item)}
                actions={enhancedActions}
                filterStatus={filterStatus}
              />
            ))}
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalItems / 20)}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
            {actions.map((action: any) => {
              const dialogTitleTemplate = Handlebars.compile(
                action.dialogTitle
              );
              const dialogTitleBulkTemplate = Handlebars.compile(
                action.dialogTitleBulk
              );
              const dialogTextTemplate = Handlebars.compile(
                action.dialogText || ""
              );
              const dialogTextBulkTemplate = Handlebars.compile(
                action.dialogTextBulk || ""
              );
              const dialogInfoTextTemplate = Handlebars.compile(
                action.dialogInfoText || ""
              );
              const dialogInfoTextBulkTemplate = Handlebars.compile(
                action.dialogInfoTextBulk || ""
              );

              return (
                openActionDialogs.includes(action.name) && (
                  <ActionDialog
                    key={action.name}
                    onConfirm={(data?: any) =>
                      handleConfirmAction(action, data)
                    }
                    onCancel={handleCloseDialog}
                    title={
                      selectedItems.length === 1
                        ? dialogTitleTemplate(selectedItems[0])
                        : dialogTitleBulkTemplate({ n: selectedItems.length })
                    }
                    text={
                      selectedItems.length === 1
                        ? dialogTextTemplate(selectedItems[0])
                        : dialogTextBulkTemplate({
                            n: selectedItems.length,
                          })
                    }
                    infoText={
                      selectedItems.length === 1
                        ? dialogInfoTextTemplate(selectedItems[0])
                        : dialogInfoTextBulkTemplate({
                            n: selectedItems.length,
                          })
                    }
                  >
                    {action.DialogForm && (
                      <action.DialogForm items={selectedItems} user={user} />
                    )}
                  </ActionDialog>
                )
              );
            })}
          </>
        )
      ) : (
        <>
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
          <ItemSkeleton />
        </>
      )}
    </div>
  );
};

export default ItemList;
