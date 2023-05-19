import FilterButton from "./FilterButton";

interface FilterBarProps {
  filterStatus: string;
  setFilterStatus: (status: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  filterStatus,
  setFilterStatus,
}) => {
  return (
    <div>
      {[
        { status: "all", name: "All" },
        { status: "lead", name: "Leads" },
        { status: "offerSent", name: "Offer sent" },
        { status: "client", name: "Client" },
      ].map((item) => (
        <FilterButton
          key={item.status}
          name={item.name}
          status={item.status}
          filterStatus={filterStatus}
          onClick={() => setFilterStatus(item.status)}
        />
      ))}
    </div>
  );
};

export default FilterBar;
