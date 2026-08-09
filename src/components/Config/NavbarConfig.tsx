import React from "react";
import useNavbarConfig from "../../hooks/Navbar/useNavbarConfig";
import { useTranslation } from "react-i18next";
import {
  SectionCard,
  SubSectionTitle,
  type ConfigTheme,
} from "./Styles/style";
import { ConfigColorRow } from "./ConfigPrimitives";

interface Props { theme: ConfigTheme }

const NavbarConfig: React.FC<Props> = ({ theme }) => {
  const { config, updateConfig } = useNavbarConfig();
  const { t } = useTranslation();

  const handleConfigChange = (key: keyof typeof config, value: string) => {
    if (config) updateConfig(key, value);
  };

  return (
    <SectionCard containerBg={theme.containerBg} inputBorder={theme.inputBorder}>
      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("navbar_config.title")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="navbar_config.background_color"          value={config.navbar_background_color}          onChange={v => handleConfigChange("navbar_background_color", v)}          theme={theme} />
      <ConfigColorRow labelKey="navbar_config.buttons_background_color"  value={config.navbar_buttons_background_color}  onChange={v => handleConfigChange("navbar_buttons_background_color", v)}  theme={theme} />
      <ConfigColorRow labelKey="navbar_config.buttons_foreground_color"  value={config.navbar_buttons_foreground_color}  onChange={v => handleConfigChange("navbar_buttons_foreground_color", v)}  theme={theme} />

      <SubSectionTitle textColor={theme.textColor} inputBorder={theme.inputBorder}>
        {t("navbar.search.placeholder").replace("...", "")}
      </SubSectionTitle>

      <ConfigColorRow labelKey="navbar_config.search_background_color" value={config.navbar_search_background_color} onChange={v => handleConfigChange("navbar_search_background_color", v)} theme={theme} />
      <ConfigColorRow labelKey="navbar_config.search_foreground_color" value={config.navbar_search_foreground_color} onChange={v => handleConfigChange("navbar_search_foreground_color", v)} theme={theme} />
    </SectionCard>
  );
};

export default NavbarConfig;
