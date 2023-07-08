import * as React from "react";
import styles from "@/app/components/ItemList/styles.module.css";
import Loading from "../Loading";
import { useEffect, useState } from "react";

interface ItemListProps<T> {
  filterStatus: string;
  filterText: string;
  fetchItems: (
    page: number,
    filterStatus: string,
    filterText: string,
    sortColumn: string,
    sortDirection: "asc" | "desc"
  ) => Promise<{ data: T[]; total: number }>;
  renderCard: (item: T, index: number) => JSX.Element;
  renderEmptyList: () => JSX.Element;
  renderPagination?: () => JSX.Element;
  renderHeader?: (
    handleSort: (column: string) => void,
    sortColumn: string,
    sortDirection: "desc" | "asc"
  ) => JSX.Element;
}

const ItemList = <T,>({
  filterStatus,
  filterText,
  fetchItems,
  renderCard,
  renderEmptyList,
  renderPagination,
  renderHeader,
}: ItemListProps<T>) => {
  const [page, setPage] = useState<number>(1);

  const [items, setItems] = useState([]);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isListLoaded, setIsListLoaded] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      setIsListLoaded(false);

      const { data: items } = await fetchItems(
        page,
        filterStatus,
        filterText,
        sortColumn,
        sortDirection
      );
      // @ts-ignore
      setItems(items as T[]);

      setIsListLoaded(true);
    })();
  }, [page, filterStatus, filterText, sortColumn, sortDirection]);

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
      {renderHeader && renderHeader(handleSort, sortColumn, sortDirection)}
      {isListLoaded ? (
        items.length === 0 ? (
          renderEmptyList()
        ) : (
          <>
            {items.map(renderCard)}
            {renderPagination && renderPagination()}
          </>
        )
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default ItemList;
