import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ClientCard from "@/app/components/clients/ClientCard";
import { Client } from "@/app/types/user";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

describe("ClientCard", () => {
  let client: Client;

  const ACTION = {
    title: "Send offer",
    titleBulk: "Send offers",
    icon: <FontAwesomeIcon icon={faPaperPlane} />,
    show: true,
  };

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
        selectedClients={[]}
        onClientSelect={() => {}}
        bulkOperationsAllowed={true}
        actions={[ACTION]}
      />
    );

    const nameElement = screen.getByText("John Doe");
    const statusElement = screen.getByTitle("Send offer");

    expect(nameElement).toBeInTheDocument();
    expect(statusElement).toBeInTheDocument();
  });

  it("triggers button click event", () => {
    const mockButtonClick = jest.fn();

    render(
      <ClientCard
        client={client}
        selectedClients={[]}
        onClientSelect={() => {}}
        bulkOperationsAllowed={true}
        actions={[{ ...ACTION, handler: mockButtonClick }]}
      />
    );

    const statusElement = screen.getByTitle("Send offer").firstElementChild;
    fireEvent.click(statusElement as Element);

    expect(mockButtonClick).toHaveBeenCalledTimes(1);
  });
});
