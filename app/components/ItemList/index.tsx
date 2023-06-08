import ItemCard from "@/app/components/ItemList/ItemCard";
import styles from "@/app/components/ItemList/styles.module.css";

interface ItemListProps {
  user: any;
  items: any[];
  onActionButtonClick: (entity: any) => void;
  actionButtonText: string;
  children: React.ReactNode;
}

const ItemList: React.FC<ItemListProps> = ({
  user,
  items,
  onActionButtonClick,
  actionButtonText,
  children,
}) => {
  return (
    <div className={styles["items-container"]}>
      {items.length > 0
        ? items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              onActionButtonClick={() => onActionButtonClick(item)}
              actionButtonText={actionButtonText}
            />
          ))
        : user && (
            <div className={styles["no-items-container"]}>{children}</div>
          )}
    </div>
  );
};

export default ItemList;
