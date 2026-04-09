import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import useFetchAndSetConfig from "../../utils/useConfigUtils";
import { invoke } from "@tauri-apps/api/core";
import { notify } from "../../services/store";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import SensorsConfig from "./SensorsConfig";
import DisksConfig from "./DisksConfig";
import NavbarConfig from "./NavbarConfig";
import HeatbarConfig from "./HeatbarConfig";
import ConfigPanelConfigSection from "./ConfigPanelConfig";

const Config: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [reloadFlag, setReloadFlag] = React.useState(false);

  const { config, updateConfig } = useFetchAndSetConfig<{ language: string }>(
    { language: i18n.language },
    "get_configs",
    "set_language_config"
  );

  const load_default_config = async () => {
    try {
      await invoke("set_default_config");
      setReloadFlag((prevFlag) => !prevFlag);
    } catch (error) {
      notify('error.config_failed');
      console.error("Error fetching performance config:", error);
    }
  };

  const handleLanguageChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    await updateConfig("language", selectedLanguage);
  };

  return (
    <div>
      <div>
        <button onClick={load_default_config}>
          {t('config.load_default')}
        </button>
        <label htmlFor="language-select">
          Lang:
          <select
            id="language-select"
            onChange={handleLanguageChange}
            value={config.language}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="uk">Українська</option>
            <option value="pl">Polski</option>
            <option value="ar">العربية</option>
            <option value="ru">Русский</option>
          </select>
        </label>
      </div>
      <div key={reloadFlag ? "reload" : "no-reload"}>
        <ProcessesConfig />
        <PerformanceConfig />
        <SensorsConfig />
        <DisksConfig />
        <HeatbarConfig />
        <NavbarConfig />
        <ConfigPanelConfigSection />
      </div>
    </div>
  );
};

export default Config;
