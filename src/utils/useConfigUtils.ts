import { useCallback, useEffect, useMemo, useRef } from "react";
import { shallow } from "zustand/shallow";
import {
  type ConfigData,
  type ConfigSlice,
  pickConfig,
  useConfigStore,
} from "../services/configStore";

type ConfigType = Record<string, string | number | boolean | string[]>;

const useConfigSection = <T extends ConfigType>(
  keys: readonly (keyof ConfigData)[],
  command: string,
): ConfigSlice<T> => {
  const keysRef = useRef(keys);
  const config = useConfigStore(
    useCallback(
      (state) => pickConfig(state.config, keysRef.current),
      [],
    ),
    shallow,
  );
  const hydrated = useConfigStore((state) => state.hydrated);
  const hydrating = useConfigStore((state) => state.hydrating);
  const lastLoadError = useConfigStore((state) => state.lastLoadError);
  const hydrate = useConfigStore((state) => state.hydrate);
  const persistPartial = useConfigStore((state) => state.persistPartial);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const slice = useMemo(
    () => config as unknown as T,
    [config],
  );

  const updateConfig = useCallback(
    async <K extends keyof T>(key: K, value: T[K]) => {
      await persistPartial({ [key as string]: value } as Partial<ConfigData>, command);
    },
    [command, persistPartial],
  );

  return {
    config: slice,
    hydrated,
    hydrating,
    lastLoadError,
    updateConfig,
  };
};

export default useConfigSection;
