import React from "react";
import useNavbarConfig from "../../hooks/Navbar/useNavbarConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  SettingRow,
  SettingLabel,
  SettingControl,
  ColorInputWrapper,
  StyledColorInput,
  ColorHex,
  type ConfigTheme,
} from "./Styles/style";

interface NavbarConfig {
  navbar_background_color: string;
  navbar_buttons_background_color: string;
  navbar_buttons_foreground_color: string;
  navbar_search_background_color: string;
  navbar_search_foreground_color: string;
}

interface Props { theme: ConfigTheme }

const NavbarConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useNavbarConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof NavbarConfig, value: string) => {
    if (config) updateConfig(key, value);
  };

  const colorRow = (labelKey: string, field: keyof NavbarConfig) => (
    <SettingRow inputBorder={theme.inputBorder}>
      <SettingLabel textColor={theme.textColor}>{t(labelKey)}</SettingLabel>
      <SettingControl>
        <ColorInputWrapper>
          <StyledColorInput
            type="color"
            value={config[field] as string}
            onChange={e => handleConfigChange(field, e.target.value)}
          />
          <ColorHex textColor={theme.textColor} inputBorder={theme.inputBorder} inputBg={theme.inputBg}>
            {config[field] as string}
          </ColorHex>
        </ColorInputWrapper>
      </SettingControl>
    </SettingRow>
  );

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("navbar_config.title")}
      </SubSectionTitle>

      {colorRow("navbar_config.background_color",          "navbar_background_color")}
      {colorRow("navbar_config.buttons_background_color",  "navbar_buttons_background_color")}
      {colorRow("navbar_config.buttons_foreground_color",  "navbar_buttons_foreground_color")}

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("navbar.search.placeholder").replace("...", "")}
      </SubSectionTitle>

      {colorRow("navbar_config.search_background_color", "navbar_search_background_color")}
      {colorRow("navbar_config.search_foreground_color", "navbar_search_foreground_color")}
    </SectionCard>
  );
};

export default NavbarConfig;
