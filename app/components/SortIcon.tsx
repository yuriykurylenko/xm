import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";

interface SortIconProps {
  sortColumn: string;
  column: string;
  sortDirection: "asc" | "desc";
}

const SortIcon: React.FC<SortIconProps> = ({
  sortColumn,
  column,
  sortDirection,
}) => {
  const isActiveColumn = sortColumn === column;
  const icon: IconDefinition = isActiveColumn
    ? sortDirection === "asc"
      ? faSortUp
      : faSortDown
    : faSort;

  return (
    <span>
      {isActiveColumn ? (
        <FontAwesomeIcon icon={icon} size="sm" />
      ) : (
        <FontAwesomeIcon icon={icon} size="sm" color="#aaa" />
      )}
    </span>
  );
};

export default SortIcon;
