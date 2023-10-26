import { createContext } from "react";

type ConfigType = {
  actions: Record<string, any>;
  events: Record<string, any>;
} | null;
const ConfigContext = createContext<ConfigType>(null);

export default ConfigContext;
