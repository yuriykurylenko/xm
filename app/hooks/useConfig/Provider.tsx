import React, { useState, useEffect, ReactNode } from "react";
import axios from "axios";
import ConfigContext from "@/app/hooks/useConfig/context";

interface ConfigProviderProps {
  children: ReactNode;
}

const ConfigProvider: React.FC<ConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get("/api/config/actions");
        setConfig(data);
      } catch (error) {
        console.error("Failed to fetch config:", error);
      }
    };

    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

export default ConfigProvider;
