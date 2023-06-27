import React from "react";
import { render, fireEvent } from "@testing-library/react";
import FilterBar from "./index";

describe("FilterBar Component", () => {
  it("renders without crashing", () => {
    const { getByText } = render(
      <FilterBar
        filterOptions={[{ name: "Option 1", value: "option1" }]}
        filterStatus=""
        setFilterStatus={() => {}}
      />
    );

    expect(getByText("Option 1")).toBeInTheDocument();
  });

  it("handles filter options correctly", () => {
    const setFilterStatus = jest.fn();
    const { getByText } = render(
      <FilterBar
        filterOptions={[
          { name: "Option 1", value: "option1" },
          { name: "Option 2", value: "option2" },
        ]}
        filterStatus=""
        setFilterStatus={setFilterStatus}
      />
    );
    fireEvent.click(getByText("Option 1"));

    expect(setFilterStatus).toHaveBeenCalledWith("option1");
  });
});
