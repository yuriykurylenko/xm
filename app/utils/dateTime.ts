import { format } from "date-fns";

export const startOfUtcDay = (date: Date) => {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  ).toISOString();
};

export const formatDate = (date?: Date) => format(
  date
    ? new Date(date)
    : new Date(),
  "dd/MM/yyyy"
)
