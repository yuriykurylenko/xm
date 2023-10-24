import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/FilterBar/styles.module.css";
import router from "next/router";

interface FilterBarProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  filterOptions: { value: string; name: string; count?: number }[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterStatus,
  setFilterStatus,
  filterOptions,
}) => {
  return (
    <div>
      {filterOptions.map((option, index) => (
        <BasicButton
          key={option.value}
          type="button"
          onClick={() => {
            setFilterStatus(option.value);
            router.push(`?status=${option.value}`);
          }}
          className={`${styles["filter-btn"]} ${
            filterStatus === option.value || (index === 0 && !filterStatus)
              ? styles["filter-btn-active"]
              : ""
          }`}
        >
          {option.name}
          {!isNaN(Number(option.count)) && ` (${option.count})`}
        </BasicButton>
      ))}
    </div>
  );
};

export default FilterBar;
