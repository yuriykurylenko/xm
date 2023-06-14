import styles from "@/app/components/ItemList/styles.module.css";

interface ItemListProps<T> {
  items: T[];
  renderCard: (item: T, index: number) => JSX.Element;
  renderEmptyList: () => JSX.Element;
}

const ItemList = <T,>({
  items,
  renderCard,
  renderEmptyList,
}: ItemListProps<T>) => {
  return (
    <div className={styles["items-container"]}>
      {items.length > 0 ? items.map(renderCard) : renderEmptyList()}
    </div>
  );
};

export default ItemList;
