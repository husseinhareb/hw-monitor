import React, { useState, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import useServicesData, { SystemService } from "../../hooks/Services/useServicesData";
import useProcessConfig from "../../hooks/Proc/useProcessConfig";
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr, BottomBar, KillButton } from "../../styles/proc-style";
import { lighten } from "polished";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Spinner from "../Misc/Spinner";
import { useTranslation } from "react-i18next";
import { notify } from "../../services/store";
import styled from "styled-components";

const StatusDot = styled.span<{ color: string }>`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${p => p.color};
    margin-right: 6px;
    flex-shrink: 0;
`;

const columns: { key: keyof SystemService; labelKey: string }[] = [
    { key: "name", labelKey: "services.col_name" },
    { key: "description", labelKey: "services.col_description" },
    { key: "load_state", labelKey: "services.col_load" },
    { key: "active_state", labelKey: "services.col_active" },
    { key: "sub_state", labelKey: "services.col_sub" },
    { key: "unit_file_state", labelKey: "services.col_enabled" },
];

const activeColor = (state: string): string => {
    switch (state) {
        case "active": return "#4ec94e";
        case "inactive": return "#888888";
        case "failed": return "#e55";
        case "activating":
        case "deactivating": return "#e5c245";
        default: return "#888888";
    }
};

const Services: React.FC = () => {
    const { services, refetch } = useServicesData();
    const processConfig = useProcessConfig();
    const { t } = useTranslation();

    const [sortBy, setSortBy] = useState<keyof SystemService>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const sortedServices = useMemo(() => {
        return [...services].sort((a, b) => {
            const va = (a[sortBy] || "").toLowerCase();
            const vb = (b[sortBy] || "").toLowerCase();
            if (sortOrder === "asc") return va > vb ? 1 : va < vb ? -1 : 0;
            return va < vb ? 1 : va > vb ? -1 : 0;
        });
    }, [services, sortBy, sortOrder]);

    const filteredServices = useMemo(() => {
        if (!searchQuery) return sortedServices;
        const q = searchQuery.toLowerCase();
        return sortedServices.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.active_state.toLowerCase().includes(q)
        );
    }, [searchQuery, sortedServices]);

    const sortColumn = (col: keyof SystemService) => {
        if (sortBy === col) {
            setSortOrder(o => (o === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(col);
            setSortOrder("asc");
        }
    };

    const getSortIndicator = (col: keyof SystemService) => {
        if (sortBy !== col) return null;
        return sortOrder === "asc"
            ? <FaArrowUp style={{ fontSize: "10px", marginLeft: "4px" }} />
            : <FaArrowDown style={{ fontSize: "10px", marginLeft: "4px" }} />;
    };

    const handleAction = async (action: "start" | "stop" | "restart") => {
        if (!selectedName) return;
        try {
            await invoke(`${action}_service`, { name: selectedName });
            refetch();
        } catch (error) {
            console.error(`Failed to ${action} service:`, error);
            notify("error.service_action_failed");
        }
    };

    const hasSelection = selectedName !== null;
    const colCount = columns.length;

    return (
        <TableContainer style={{
            backgroundColor: processConfig.config.processes_body_background_color,
            minHeight: "100vh",
            color: processConfig.config.processes_body_color,
            position: "relative",
        }}>
            {services.length === 0 ? (
                <Spinner />
            ) : (
                <>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 8px",
                        backgroundColor: processConfig.config.processes_head_background_color,
                        gap: "8px",
                    }}>
                        <input
                            type="text"
                            placeholder={t("services.search_placeholder")}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{
                                background: processConfig.config.processes_body_background_color,
                                color: processConfig.config.processes_body_color,
                                border: `1px solid ${processConfig.config.processes_border_color}`,
                                padding: "3px 8px",
                                fontSize: "12px",
                                outline: "none",
                                width: "220px",
                            }}
                        />
                        <span style={{ marginLeft: "auto", fontSize: "11px", opacity: 0.6 }}>
                            {filteredServices.length} {t("services.total")}
                        </span>
                    </div>
                    <Table
                        bodyBackgroundColor={processConfig.config.processes_body_background_color}
                        bodyColor={processConfig.config.processes_body_color}
                        headBackgroundColor={processConfig.config.processes_head_background_color}
                        headColor={processConfig.config.processes_head_color}
                    >
                        <Thead
                            headBackgroundColor={processConfig.config.processes_head_background_color}
                            headColor={processConfig.config.processes_head_color}
                        >
                            <Tr>
                                {columns.map(col => (
                                    <Th
                                        key={col.key}
                                        onClick={() => sortColumn(col.key)}
                                        headBackgroundColor={processConfig.config.processes_head_background_color}
                                        headColor={processConfig.config.processes_head_color}
                                        borderColor={processConfig.config.processes_border_color}
                                        columnCount={colCount}
                                    >
                                        <div className="header-label">
                                            <span className="label">{t(col.labelKey)}</span>
                                            {getSortIndicator(col.key)}
                                        </div>
                                    </Th>
                                ))}
                            </Tr>
                        </Thead>
                        <Tbody
                            bodyBackgroundColor={processConfig.config.processes_body_background_color}
                            bodyColor={processConfig.config.processes_body_color}
                        >
                            {filteredServices.map(svc => (
                                <Tr
                                    key={svc.name}
                                    onClick={() => setSelectedName(prev => prev === svc.name ? null : svc.name)}
                                    bodyBackgroundColor={processConfig.config.processes_body_background_color}
                                    style={{
                                        backgroundColor: selectedName === svc.name
                                            ? lighten(0.15, processConfig.config.processes_body_background_color)
                                            : "transparent",
                                    }}
                                >
                                    {columns.map(col => (
                                        <Td
                                            key={`${svc.name}-${col.key}`}
                                            bodyBackgroundColor={processConfig.config.processes_body_background_color}
                                            bodyColor={processConfig.config.processes_body_color}
                                            borderColor={processConfig.config.processes_border_color}
                                            columnCount={colCount}
                                        >
                                            {col.key === "active_state" ? (
                                                <span style={{ display: "inline-flex", alignItems: "center" }}>
                                                    <StatusDot color={activeColor(svc.active_state)} />
                                                    {svc.active_state}
                                                </span>
                                            ) : (
                                                svc[col.key]
                                            )}
                                        </Td>
                                    ))}
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </>
            )}
            {hasSelection && (
                <BottomBar bottomBarBackgroundColor={processConfig.config.processes_head_background_color}>
                    <span style={{ fontSize: "12px", marginRight: "auto", paddingLeft: "8px" }}>
                        {selectedName}
                    </span>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={() => handleAction("start")}
                    >{t("services.start")}</KillButton>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={() => handleAction("stop")}
                    >{t("services.stop")}</KillButton>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={() => handleAction("restart")}
                    >{t("services.restart")}</KillButton>
                </BottomBar>
            )}
        </TableContainer>
    );
};

export default Services;
