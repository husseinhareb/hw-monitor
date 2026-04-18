import React, { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import useConfigPanelConfig from "../../hooks/Config/useConfigPanelConfig";
import { useConfigStore } from "../../services/configStore";
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
  const [langOpen, setLangOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const config = useConfigStore((state) => state.config);
  const hydrate = useConfigStore((state) => state.hydrate);
  const persistPartial = useConfigStore((state) => state.persistPartial);
  const persistAll = useConfigStore((state) => state.persistAll);
  const resetToDefault = useConfigStore((state) => state.resetToDefault);

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

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

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
      await resetToDefault();
      await i18n.changeLanguage(useConfigStore.getState().config.language);
    } catch (error) {
      console.error("Error loading default config:", error);
    }
  };

  const applyTheme = useCallback(async (index: number) => {
    const preset = themes[index];
    if (!preset) return;
    try {
      await persistAll({ ...config, ...preset.values, language: config.language });
      setThemeOpen(false);
    } catch (error) {
      console.error("Error applying theme:", error);
    }
  }, [config, persistAll]);

  const handleLanguageSelect = useCallback(async (langValue: string) => {
    const previousLanguage = config.language;
    await i18n.changeLanguage(langValue);
    try {
      await persistPartial({ language: langValue }, "set_language_config");
      setLangOpen(false);
    } catch (error) {
      await i18n.changeLanguage(previousLanguage);
      console.error("Error updating language config:", error);
    }
  }, [config.language, i18n, persistPartial]);

  const activeLabel = t(sections.find(s => s.key === activeSection)!.labelKey);

  const renderSection = () => {
    switch (activeSection) {
      case "processes":   return <ProcessesConfig theme={theme} />;
      case "performance": return <PerformanceConfig theme={theme} />;
      case "sensors":     return <SensorsConfig theme={theme} />;
      case "disks":       return <DisksConfig theme={theme} />;
      case "heatbar":     return <HeatbarConfig theme={theme} />;
      case "navbar":      return <NavbarConfig theme={theme} />;
      case "configpanel": return <ConfigPanelConfigSection theme={theme} />;
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
