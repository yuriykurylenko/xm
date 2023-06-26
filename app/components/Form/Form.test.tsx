import Button from "./Button";
import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Form from "./index";
describe("Form Component", () => {
  it("renders without crashing", () => {
    const { getByText } = render(
      <Form onSubmit={() => {}}>
        <Button type="submit" submittingText="Submitting...">
          Submit
        </Button>
      </Form>
    );
    expect(getByText("Submit")).toBeInTheDocument();
  });
  it("handles user interaction correctly", () => {
    const { getByLabelText, getByText } = render(<Form />);
    fireEvent.change(getByLabelText("Name"), { target: { value: "Test Name" } });
    fireEvent.click(getByText("Submit"));
    // Add expectations based on what should happen when the form is submitted
  });
  // Add more tests as necessary for other functionality
});
