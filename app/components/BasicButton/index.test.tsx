import * as React from "react";
import { render, screen } from "@testing-library/react";
import Button from "./";

test("renders the button with the correct label", () => {
  render(<Button>Click me</Button>);
  const linkElement = screen.getByText(/Click me/i);
  expect(linkElement).toBeInTheDocument();
});
