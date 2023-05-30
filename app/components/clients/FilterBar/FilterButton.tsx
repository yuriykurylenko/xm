import styles from "@/app/components/clients/FilterBar/styles.module.css";

interface FilterButtonProps {
  status: string;
  name: string;
  filterStatus: string;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
  status,
  name,
  filterStatus,
  onClick,
}) => {
  return (
    <button
      className={`${styles["filter-btn"]} ${
        filterStatus === status && styles["filter-btn-active"]
      }`}
      onClick={onClick}
    >
      {name}
    </button>
  );
};

export default FilterButton;
