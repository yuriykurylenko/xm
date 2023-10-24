import * as React from "react";
import styles from "@/app/components/ItemList/styles.module.css";
import { useEffect, useState } from "react";
import Pagination from "@/app/components/ItemList/Pagination";
import ItemSkeleton from "@/app/components/ItemList/ItemSkeleton";
import { UUID } from "crypto";
import useAuth from "@/app/hooks/useAuth";

type FilterOption = {
  value: string;
  name: string;
};

interface ItemListProps<T extends { id: UUID | string }> {
  title: string;
  filterStatusOptions: FilterOption[];
  filterState?: {
    [key: string]: string | string[] | undefined;
  };
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
    actions: any;
    totalItemsCount: number;
    user?: any;
  }>;
  CardComponent: React.ComponentType<{
    item: T;
    selectedItems: T[];
    onSelect: () => void;
    bulkOperationsAllowed: boolean;
    actions?: any;
    filterStatus: string;
    user?: any;
  }>;
  EmptyListComponent?: React.ComponentType<{
    isSearchResult: boolean;
  }>;
  actions: string[];
}

const ItemList = <T extends { id: UUID | string }>({
  title,
  filterStatusOptions,
  filterState,
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
      ? (filterState?.status as string) || filterStatusOptions[0].value
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

  useEffect(() => {
    if (filterState?.status) {
      setFilterStatus(filterState.status as string);
    }
  }, [filterState]);

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
          actions={actions}
          onSort={handleSort}
          sortColumn={sortColumn}
          sortDirection={sortDirection}
          totalItemsCount={filterCounts[filterStatus]}
          user={user}
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
                actions={actions}
                filterStatus={filterStatus}
                user={user}
              />
            ))}
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalItems / 20)}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
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
