import React from "react";
import { render, fireEvent } from "@testing-library/react";
import FilterBar from "./index";

describe("FilterBar Component", () => {
  it("renders without crashing", () => {
    const { getByText } = render(
      <FilterBar
        filterOptions={[{ name: "Option 1", value: "option1" }]}
        filterStatus=""
      />
    );

    expect(getByText("Option 1")).toBeInTheDocument();
  });
});
