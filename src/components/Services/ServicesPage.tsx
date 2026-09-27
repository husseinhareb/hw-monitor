import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import useServicesConfig from "../../hooks/Services/useServicesConfig";
import { ViewToggleBtn } from "../../styles/proc-style";
import Services from "./Services";
import StartupApps from "./StartupApps";

const ServicesPage: React.FC = () => {
    const { t } = useTranslation();
    const { config } = useServicesConfig();
    const [view, setView] = useState<"services" | "startup">("services");

    const tab = (key: typeof view) => (
        <ViewToggleBtn
            active={view === key}
            bgColor={config.services_body_background_color}
            color={config.services_body_color}
            borderColor={config.services_border_color}
            onClick={() => setView(key)}
        >
            {t(`services.tab_${key}`)}
        </ViewToggleBtn>
    );

    return (
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", backgroundColor: config.services_background_color }}>
            <div style={{ display: "flex", gap: "8px", padding: "6px 8px", flexShrink: 0, backgroundColor: config.services_head_background_color, borderBottom: `1px solid ${config.services_border_color}` }}>
                {tab("services")}
                {tab("startup")}
            </div>
            {view === "services" ? <Services /> : <StartupApps />}
        </div>
    );
};

export default ServicesPage;
