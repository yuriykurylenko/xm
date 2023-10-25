import { createContext } from "react";

type ConfigType = Record<string, any> | null;
const ConfigContext = createContext<ConfigType>(null);

export default ConfigContext;
