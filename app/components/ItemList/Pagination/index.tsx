import React from "react";
import BasicButton from "@/app/components/BasicButton";
import styles from "@/app/components/ItemList/Pagination/styles.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onNextPage: () => void;
  onPrevPage: () => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onNextPage,
  onPrevPage,
}) => {
  return totalPages > 1 ? (
    <div className={styles["pagination-container"]}>
      <span>
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>
      <BasicButton onClick={onPrevPage} disabled={currentPage === 1}>
        Previous
      </BasicButton>
      <BasicButton onClick={onNextPage} disabled={currentPage >= totalPages}>
        Next
      </BasicButton>
    </div>
  ) : (
    <></>
  );
};

export default Pagination;
