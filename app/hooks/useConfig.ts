import { useContext } from "react";
import ConfigContext from "@/app/hooks/useConfig/context";

const useConfig = () => useContext(ConfigContext);

export default useConfig;
