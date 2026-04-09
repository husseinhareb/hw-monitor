import React, { ChangeEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import useFetchAndSetConfig from "../../utils/useConfigUtils";
import useConfigPanelConfig from "../../hooks/Config/useConfigPanelConfig";
import { invoke } from "@tauri-apps/api/core";
import { notify } from "../../services/store";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import SensorsConfig from "./SensorsConfig";
import DisksConfig from "./DisksConfig";
import NavbarConfig from "./NavbarConfig";
import HeatbarConfig from "./HeatbarConfig";
import ConfigPanelConfigSection from "./ConfigPanelConfig";
import {
  ConfigPage,
  ConfigSidebar,
  SidebarHeader,
  SidebarItem,
  ConfigContent,
  TopBar,
  TopBarTitle,
  LangLabel,
  StyledSelect,
  ActionButton,
  SectionWrapper,
  SectionTitle,
  type ConfigTheme,
} from "./Styles/style";

type SectionKey =
  | "processes"
  | "performance"
  | "sensors"
  | "disks"
  | "heatbar"
  | "navbar"
  | "configpanel";

const sections: { key: SectionKey; labelKey: string }[] = [
  { key: "processes",   labelKey: "processes_config.title" },
  { key: "performance", labelKey: "performance_config.title" },
  { key: "sensors",     labelKey: "sensors_config.title" },
  { key: "disks",       labelKey: "disks_config.title" },
  { key: "heatbar",     labelKey: "heatbar_config.title" },
  { key: "navbar",      labelKey: "navbar_config.title" },
  { key: "configpanel", labelKey: "config_panel_config.title" },
];

const Config: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionKey>("processes");
  const [reloadFlag, setReloadFlag] = React.useState(false);

  const { config: panelConfig } = useConfigPanelConfig();

  const theme: ConfigTheme = {
    bgColor:      panelConfig.config_background_color,
    containerBg:  panelConfig.config_container_background_color,
    inputBg:      panelConfig.config_input_background_color,
    inputBorder:  panelConfig.config_input_border_color,
    buttonBg:     panelConfig.config_button_background_color,
    buttonFg:     panelConfig.config_button_foreground_color,
    textColor:    panelConfig.config_text_color,
  };

  const { config, updateConfig } = useFetchAndSetConfig<{ language: string }>(
    { language: i18n.language },
    "get_configs",
    "set_language_config"
  );

  const load_default_config = async () => {
    try {
      await invoke("set_default_config");
      setReloadFlag(f => !f);
    } catch (error) {
      notify("error.config_failed");
      console.error("Error loading default config:", error);
    }
  };

  const handleLanguageChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const selectedLanguage = event.target.value;
    i18n.changeLanguage(selectedLanguage);
    await updateConfig("language", selectedLanguage);
  };

  const activeLabel = t(sections.find(s => s.key === activeSection)!.labelKey);

  const renderSection = () => {
    switch (activeSection) {
      case "processes":   return <ProcessesConfig   key={reloadFlag ? "r" : "n"} theme={theme} />;
      case "performance": return <PerformanceConfig key={reloadFlag ? "r" : "n"} theme={theme} />;
      case "sensors":     return <SensorsConfig     key={reloadFlag ? "r" : "n"} theme={theme} />;
      case "disks":       return <DisksConfig       key={reloadFlag ? "r" : "n"} theme={theme} />;
      case "heatbar":     return <HeatbarConfig     key={reloadFlag ? "r" : "n"} theme={theme} />;
      case "navbar":      return <NavbarConfig      key={reloadFlag ? "r" : "n"} theme={theme} />;
      case "configpanel": return <ConfigPanelConfigSection key={reloadFlag ? "r" : "n"} theme={theme} />;
    }
  };

  return (
    <ConfigPage bgColor={theme.bgColor}>
      <ConfigSidebar containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
        <SidebarHeader textColor={theme.textColor} inputBorder={theme.inputBorder}>
          {t("navbar.config")}
        </SidebarHeader>
        {sections.map(({ key, labelKey }) => (
          <SidebarItem
            key={key}
            textColor={theme.textColor}
            inputBorder={theme.inputBorder}
            buttonBg={theme.buttonBg}
            isActive={activeSection === key}
            onClick={() => setActiveSection(key)}
          >
            {t(labelKey)}
          </SidebarItem>
        ))}
      </ConfigSidebar>

      <ConfigContent bgColor={theme.bgColor}>
        <TopBar containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
          <TopBarTitle textColor={theme.textColor}>{activeLabel}</TopBarTitle>
          <LangLabel textColor={theme.textColor}>
            <StyledSelect
              id="language-select"
              value={config.language}
              onChange={handleLanguageChange}
              inputBg={theme.inputBg}
              inputBorder={theme.inputBorder}
              textColor={theme.textColor}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="uk">Українська</option>
              <option value="pl">Polski</option>
              <option value="ar">العربية</option>
              <option value="ru">Русский</option>
            </StyledSelect>
          </LangLabel>
          <ActionButton
            buttonBg={theme.buttonBg}
            buttonFg={theme.buttonFg}
            onClick={load_default_config}
          >
            {t("config.load_default")}
          </ActionButton>
        </TopBar>

        <SectionWrapper>
          <SectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
            {activeLabel}
          </SectionTitle>
          {renderSection()}
        </SectionWrapper>
      </ConfigContent>
    </ConfigPage>
  );
};

export default Config;

