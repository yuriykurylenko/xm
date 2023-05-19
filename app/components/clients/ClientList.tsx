interface ClientListProps {
  clients: any[];
  onClick: (client: any) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onClick }) => {
  // ...same as before
};

export default ClientList;
