import axios from "axios";

export const create = ({ email }: { email: string }) =>
  axios.post("/api/stripe/setup_intent", { email });
