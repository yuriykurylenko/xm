import styles from "@/app/components/ItemList/styles.module.css";

interface ItemListProps {
  user: any;
  items: any[];
  children: React.ReactNode;
  renderCard: (item: any, index: number) => JSX.Element;
}

const ItemList: React.FC<ItemListProps> = ({
  user,
  items,
  children,
  renderCard,
}) => {
  return (
    <div className={styles["items-container"]}>
      {items.length > 0
        ? items.map(renderCard)
        : user && (
            <div className={styles["no-items-container"]}>{children}</div>
          )}
    </div>
  );
};

export default ItemList;
