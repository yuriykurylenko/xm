import ItemCard from "@/app/components/ItemList/ItemCard";
import styles from "@/app/components/ItemList/styles.module.css";

interface ItemListProps {
  user: any;
  entities: any[];
  onActionButtonClick: (entity: any) => void;
  actionButtonText: string;
  children: React.ReactNode;
}

const ItemList: React.FC<ItemListProps> = ({
  user,
  entities,
  onActionButtonClick,
  actionButtonText,
  children,
}) => {
  return (
    <div className={styles["entities-container"]}>
      {entities.length > 0
        ? entities.map((entity) => (
            <ItemCard
              key={entity.id}
              entity={entity}
              onActionButtonClick={() => onActionButtonClick(entity)}
              actionButtonText={actionButtonText}
            />
          ))
        : user && (
            <div className={styles["no-entities-container"]}>{children}</div>
          )}
    </div>
  );
};

export default ItemList;
