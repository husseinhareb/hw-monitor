import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import useFetchAndSetConfig, { invalidateConfigCache } from "../../utils/useConfigUtils";
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
import { themes } from "./themes";
import {
  ConfigPage,
  ConfigSidebar,
  SidebarHeader,
  SidebarItem,
  ConfigContent,
  TopBar,
  TopBarTitle,
  LangLabel,
  DropdownWrapper,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  ActionButton,
  SectionWrapper,
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

const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Español" },
    { value: "fr", label: "Français" },
    { value: "de", label: "Deutsch" },
    { value: "uk", label: "Українська" },
    { value: "pl", label: "Polski" },
    { value: "ar", label: "العربية" },
    { value: "ru", label: "Русский" },
  ];

const Config: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [activeSection, setActiveSection] = useState<SectionKey>("processes");
  const [reloadFlag, setReloadFlag] = React.useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setThemeOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const load_default_config = async () => {
    try {
      await invoke("set_default_config");
      invalidateConfigCache();
      setReloadFlag(f => !f);
    } catch (error) {
      notify("error.config_failed");
      console.error("Error loading default config:", error);
    }
  };

  const applyTheme = useCallback(async (index: number) => {
    const preset = themes[index];
    if (!preset) return;
    try {
      const configs = { ...preset.values, language: config.language };
      await invoke("set_all_configs", { configs });
      invalidateConfigCache();
      setReloadFlag(f => !f);
      setThemeOpen(false);
    } catch (error) {
      notify("error.config_failed");
      console.error("Error applying theme:", error);
    }
  }, [config.language]);

  const handleLanguageSelect = useCallback(async (langValue: string) => {
    i18n.changeLanguage(langValue);
    await updateConfig("language", langValue);
    setLangOpen(false);
  }, [i18n, updateConfig]);

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
            <DropdownWrapper ref={langRef}>
              <DropdownTrigger
                inputBg={theme.inputBg}
                inputBorder={theme.inputBorder}
                textColor={theme.textColor}
                onClick={() => setLangOpen(o => !o)}
                type="button"
              >
                {languages.find(l => l.value === config.language)?.label ?? config.language}
              </DropdownTrigger>
              {langOpen && (
                <DropdownMenu
                  inputBg={theme.inputBg}
                  inputBorder={theme.inputBorder}
                  textColor={theme.textColor}
                >
                  {languages.map(lang => (
                    <DropdownItem
                      key={lang.value}
                      inputBg={theme.inputBg}
                      textColor={theme.textColor}
                      isSelected={config.language === lang.value}
                      onClick={() => handleLanguageSelect(lang.value)}
                    >
                      {lang.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              )}
            </DropdownWrapper>
          </LangLabel>
          <DropdownWrapper ref={themeRef}>
            <DropdownTrigger
              inputBg={theme.inputBg}
              inputBorder={theme.inputBorder}
              textColor={theme.textColor}
              onClick={() => setThemeOpen(o => !o)}
              type="button"
            >
              {t("config.theme")}
            </DropdownTrigger>
            {themeOpen && (
              <DropdownMenu
                inputBg={theme.inputBg}
                inputBorder={theme.inputBorder}
                textColor={theme.textColor}
              >
                {themes.map((preset, idx) => (
                  <DropdownItem
                    key={preset.label}
                    inputBg={theme.inputBg}
                    textColor={theme.textColor}
                    isSelected={false}
                    onClick={() => applyTheme(idx)}
                  >
                    {t(preset.labelKey)}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            )}
          </DropdownWrapper>
          <ActionButton
            buttonBg={theme.buttonBg}
            buttonFg={theme.buttonFg}
            onClick={load_default_config}
          >
            {t("config.load_default")}
          </ActionButton>
        </TopBar>

        <SectionWrapper>
          {renderSection()}
        </SectionWrapper>
      </ConfigContent>
    </ConfigPage>
  );
};

export default Config;

