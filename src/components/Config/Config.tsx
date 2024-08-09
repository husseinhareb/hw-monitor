import React, { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import useFetchAndSetConfig from "../../utils/useConfigUtils"; 
import { invoke } from "@tauri-apps/api/tauri";
import ProcessesConfig from "./ProcessesConfig";
import PerformanceConfig from "./PerformanceConfig";
import SensorsConfig from "./SensorsConfig";
import DisksConfig from "./DisksConfig";
import NavbarConfig from "./NavbarConfig";
import HeatbarConfig from "./HeatbarConfig";

import {
  Wrapper,
  Container,
  StyledButton,
  Label,
  Select,
  Header,
} from "./Styles/style";

const Config: React.FC = () => {
  const { i18n } = useTranslation();
  const [reloadFlag, setReloadFlag] = React.useState(false);

  const { config, updateConfig } = useFetchAndSetConfig<{ language: string }>(
    { language: i18n.language }, // Initial config
    "get_configs",        // Command to fetch config
    "set_language_config"         // Command to update config
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
    await updateConfig("language", selectedLanguage); // Use the hook to update the language
  };

  return (
    <Wrapper>
      <Header>
        <StyledButton onClick={load_default_config}>
          Load Default Config
        </StyledButton>
        <Label htmlFor="language-select" style={{ color: "white" }}>
          Lang:
          <Select
            id="language-select"
            onChange={handleLanguageChange}
            value={config.language} // Use config from the hook
          >
            <option value="en">English</option>
            <option value="fr">French</option>
            <option value="de">Deutsch</option>
            <option value="uk">Ukranian</option>

          </Select>
        </Label>
      </Header>
      <Container key={reloadFlag ? "reload" : "no-reload"}>
        <ProcessesConfig />
        <PerformanceConfig />
        <SensorsConfig />
        <DisksConfig />
        <HeatbarConfig />
        <NavbarConfig />
      </Container>
    </Wrapper>
  );
};

export default Config;
