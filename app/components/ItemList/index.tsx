import styles from "@/app/components/ItemList/styles.module.css";

interface ItemListProps {
  items: any[];
  renderCard: (item: any, index: number) => JSX.Element;
  renderEmptyList: () => JSX.Element;
}

const ItemList: React.FC<ItemListProps> = ({
  items,
  renderCard,
  renderEmptyList,
}) => {
  return (
    <div className={styles["items-container"]}>
      {items.length > 0 ? items.map(renderCard) : renderEmptyList()}
    </div>
  );
};

export default ItemList;
