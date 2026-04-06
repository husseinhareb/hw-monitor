import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import useFetchAndSetConfig from "../../utils/useConfigUtils";
import { invoke } from "@tauri-apps/api/core";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import SensorsConfig from "./SensorsConfig";
import DisksConfig from "./DisksConfig";
import NavbarConfig from "./NavbarConfig";
import HeatbarConfig from "./HeatbarConfig";
import ConfigPanelConfigSection from "./ConfigPanelConfig";
import useConfigPanelConfig from "../../hooks/Config/useConfigPanelConfig";

import {
  Wrapper,
  Container,
  StyledButton,
  Label,
  Select,
  Header,
} from "./Styles/style";

const Config: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [reloadFlag, setReloadFlag] = React.useState(false);
  const { config: panelConfig } = useConfigPanelConfig();

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
      console.error("Error fetching performance config:", error);
    }
  };

  const handleLanguageChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    await updateConfig("language", selectedLanguage);
  };

  return (
    <Wrapper
      bgColor={panelConfig.config_background_color}
      textColor={panelConfig.config_text_color}
      inputBorderColor={panelConfig.config_input_border_color}
    >
      <Header>
        <StyledButton
          buttonBgColor={panelConfig.config_button_background_color}
          buttonTextColor={panelConfig.config_button_foreground_color}
          onClick={load_default_config}
        >
          {t('config.load_default')}
        </StyledButton>
        <Label htmlFor="language-select" style={{ color: panelConfig.config_text_color }}>
          Lang:
          <Select
            id="language-select"
            inputBgColor={panelConfig.config_input_background_color}
            borderColor={panelConfig.config_input_border_color}
            textColor={panelConfig.config_button_foreground_color}
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
          </Select>
        </Label>
      </Header>
      <Container bgColor={panelConfig.config_background_color} key={reloadFlag ? "reload" : "no-reload"}>
        <ProcessesConfig />
        <PerformanceConfig />
        <SensorsConfig />
        <DisksConfig />
        <HeatbarConfig />
        <NavbarConfig />
        <ConfigPanelConfigSection />
      </Container>
    </Wrapper>
  );
};

export default Config;
