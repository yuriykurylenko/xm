import styles from "@/app/components/ItemList/styles.module.css";

interface ItemListProps {
  user: any;
  items: any[];
  renderCard: (item: any, index: number) => JSX.Element;
  renderEmptyList: (user: any) => JSX.Element;
}

const ItemList: React.FC<ItemListProps> = ({
  user,
  items,
  renderCard,
  renderEmptyList,
}) => {
  return (
    <div className={styles["items-container"]}>
      {items.length > 0 ? items.map(renderCard) : renderEmptyList(user)}
    </div>
  );
};

export default ItemList;
