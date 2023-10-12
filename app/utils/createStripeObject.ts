import axios from "axios";

const createStripeObject = (object: string, data?: any) =>
  axios.post(`/api/integrations/stripe/${object}`, data);

export default createStripeObject;
