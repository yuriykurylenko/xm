// useConfig.ts
import { useContext } from "react";
import ConfigContext from "@/app/hooks/useConfig/context";

const useConfig = () => {
  const context = useContext(ConfigContext);

  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }

  return context;
};

export default useConfig;
