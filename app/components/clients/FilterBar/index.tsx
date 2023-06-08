// import FilterButton from "@/app/components/clients/FilterBar/FilterButton";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/clients/FilterBar/styles.module.css";

interface FilterBarProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterOptions: { value: string; name: string }[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterStatus,
  setFilterStatus,
  filterOptions,
}) => {
  return (
    <div>
      {filterOptions.map((option) => (
        <BasicButton
          key={option.value}
          type="button"
          onClick={() => setFilterStatus(option.value)}
          className={`${styles["filter-btn"]} ${
            filterStatus === option.value ? styles["filter-btn-active"] : ""
          }`}
        >
          {option.name}
        </BasicButton>
      ))}
    </div>
  );
};

export default FilterBar;
