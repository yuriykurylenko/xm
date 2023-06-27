import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ClientCard from "@/app/components/clients/ClientCard";
import { Client } from "@/app/types/user";

describe("ClientCard", () => {
  let client: Client;

  beforeEach(() => {
    client = {
      id: "8fa800ea-5a5c-42e2-85f3-ffffffffffff",
      full_name: "John Doe",
      status: "lead",
      email: "john.doe@gmail.com",
      coach_id: "8fa800ea-5a5c-42e2-85f3-50509910b6a2",
    };
  });

  it("renders client name and status", () => {
    render(
      <ClientCard
        client={client}
        onActionButtonClick={() => {}}
        actionButtonText="Send Offer"
        selectedClients={[]}
        onClientSelect={() => {}}
      />
    );

    const nameElement = screen.getByText("John Doe");
    const statusElement = screen.getByText("Send Offer");

    expect(nameElement).toBeInTheDocument();
    expect(statusElement).toBeInTheDocument();
  });

  it("triggers button click event", () => {
    const mockButtonClick = jest.fn();

    render(
      <ClientCard
        client={client}
        onActionButtonClick={mockButtonClick}
        actionButtonText="Send Offer"
        selectedClients={[]}
        onClientSelect={() => {}}
      />
    );

    const statusElement = screen.getByText("Send Offer");

    fireEvent.click(statusElement);

    expect(mockButtonClick).toHaveBeenCalledTimes(1);
  });
});
