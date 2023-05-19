interface OfferModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onSendOffer: (event: React.FormEvent) => Promise<void>;
  selectedClient: any; // replace 'any' with the appropriate type for a client
  monthlyAmount: number | null;
  setMonthlyAmount: (amount: number) => void;
  isSubmitting: boolean;
}

const OfferModal: React.FC<OfferModalProps> = ({
  isOpen,
  closeModal,
  onSendOffer,
  selectedClient,
  monthlyAmount,
  setMonthlyAmount,
  isSubmitting,
}) => {
  return <></>;
};

export default OfferModal;
