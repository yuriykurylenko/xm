import * as React from "react";
import styles from "@/app/components/ItemList/styles.module.css";

interface ItemListProps<T> {
  isListLoaded: boolean;
  items: T[];
  renderCard: (item: T, index: number) => JSX.Element;
  renderEmptyList: () => JSX.Element;
  renderPagination?: () => JSX.Element;
  renderHeader?: () => JSX.Element;
}

const ItemList = <T,>({
  isListLoaded,
  items,
  renderCard,
  renderEmptyList,
  renderPagination,
  renderHeader,
}: ItemListProps<T>) => {
  return (
    <div className={styles["items-container"]}>
      {renderHeader && (items.length > 0 || !isListLoaded) && renderHeader()}
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
        <>Loading</>
      )}
    </div>
  );
};

export default ItemList;
