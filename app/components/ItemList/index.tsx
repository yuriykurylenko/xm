import * as React from "react";
import styles from "@/app/components/ItemList/styles.module.css";
import Loading from "../Loading";
import { useEffect, useState } from "react";
import Pagination from "@/app/components/Pagination";

type FilterOption = {
  value: string;
  name: string;
};

interface ItemListProps<T> {
  title: string;
  filterStatusOptions: FilterOption[];
  filterText: string;
  fetchItems: (
    page: number,
    filterStatus: string,
    filterText: string,
    sortColumn: string,
    sortDirection: "asc" | "desc"
  ) => Promise<{ data: T[]; total: number }>;
  renderFilterBar: (
    filterStatus: string,
    changeFilterStatus: (status: string) => void
  ) => JSX.Element;
  renderCard: (
    item: T,
    index: number,
    selectedItems: T[],
    onItemSelect: (item: T) => void
  ) => JSX.Element;
  renderEmptyList: () => JSX.Element;
  renderHeader?: (
    handleSort: (column: string) => void,
    sortColumn: string,
    sortDirection: "desc" | "asc",
    onItemsBulkSelect: () => void,
    selectedItems: T[]
  ) => JSX.Element;
}

const ItemList = <T,>({
  title,
  filterStatusOptions,
  filterText,
  fetchItems,
  renderFilterBar,
  renderCard,
  renderEmptyList,
  renderHeader,
}: ItemListProps<T>) => {
  const [filterStatus, setFilterStatus] = useState<string>(
    filterStatusOptions[0].value
  );
  const [page, setPage] = useState<number>(1);
  const [items, setItems] = useState<T[]>([]);
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isListLoaded, setIsListLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
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

      setIsListLoaded(true);
    })();
  }, [page, filterStatus, filterText, sortColumn, sortDirection]);

  const changeFilterStatus = (status: string) => {
    if (status !== filterStatus) {
      setIsListLoaded(false);
    }
    setFilterStatus(status);
    setPage(1);
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

  return (
    <div className={styles["items-container"]}>
      <div className={styles["items-container-header"]}>
        <div className={styles["items-title-container"]}>
          <h1>{title}</h1>
          {renderFilterBar && renderFilterBar(filterStatus, changeFilterStatus)}
        </div>
      </div>
      {renderHeader &&
        renderHeader(
          handleSort,
          sortColumn,
          sortDirection,
          onItemsBulkSelect,
          selectedItems
        )}
      {isListLoaded ? (
        items.length === 0 ? (
          renderEmptyList()
        ) : (
          <>
            {items.map((item, index) =>
              renderCard(item, index, selectedItems, onItemSelect)
            )}
            <Pagination
              currentPage={page}
              totalPages={Math.ceil(totalItems / 20)}
              onNextPage={handleNextPage}
              onPrevPage={handlePrevPage}
            />
          </>
        )
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ItemList;
