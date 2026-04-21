import { useLayoutEffect } from "react";
import { type HeaderConfig, useHeaderContext } from "../context/HeaderContext";

export function useHeaderConfig(config: HeaderConfig) {
  const { registerConfig } = useHeaderContext();

  useLayoutEffect(() => {
    registerConfig(config);
  }, [
    config.heroColor,
    config.heroHeight,
    config.showLogo,
    config.scrollTitle,
    config.scrollAction,
    config.onAction,
    registerConfig,
  ]);
}
