import React, { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import useServicesConfig from "../../hooks/Services/useServicesConfig";
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr, KillButton } from "../../styles/proc-style";
import { notify } from "../../services/store";
import ProcessIcon from "../Processes/ProcessIcon";
import Spinner from "../Misc/Spinner";
import type { StartupApp } from "../../bindings";

const StatusDot = styled.span<{ color: string }>`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${p => p.color};
    margin-right: 6px;
`;

const Muted = styled.div`
    font-size: 0.85em;
    opacity: 0.6;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const COLUMNS = ["name", "command", "scope", "status", "action"] as const;

const StartupApps: React.FC = () => {
    const { t } = useTranslation();
    const { config } = useServicesConfig();
    const [apps, setApps] = useState<StartupApp[] | null>(null);
    const [pending, setPending] = useState<string | null>(null);

    const load = useCallback(() => {
        invoke<StartupApp[]>("get_startup_apps")
            .then(setApps)
            .catch(() => {
                setApps([]);
                notify("error.fetch_failed");
            });
    }, []);

    useEffect(load, [load]);

    const toggle = async (app: StartupApp) => {
        setPending(app.id);
        try {
            await invoke("set_startup_app_enabled", { id: app.id, enabled: !app.enabled });
        } catch {
            notify("error.startup_toggle_failed");
        } finally {
            setPending(null);
            load();
        }
    };

    if (apps === null) return <Spinner />;

    return (
        <TableContainer style={{ backgroundColor: config.services_body_background_color, color: config.services_body_color }}>
            {apps.length === 0 ? (
                <p style={{ padding: "12px" }}>{t("startup.none")}</p>
            ) : (
                <Table
                    bodyBackgroundColor={config.services_body_background_color}
                    bodyColor={config.services_body_color}
                    headBackgroundColor={config.services_head_background_color}
                    headColor={config.services_head_color}
                >
                    <Thead headBackgroundColor={config.services_head_background_color} headColor={config.services_head_color}>
                        <Tr>
                            {COLUMNS.map(column => (
                                <Th
                                    key={column}
                                    headBackgroundColor={config.services_head_background_color}
                                    headColor={config.services_head_color}
                                    borderColor={config.services_border_color}
                                    columnCount={COLUMNS.length}
                                    style={{ cursor: "default" }}
                                >
                                    {column === "action" ? "" : t(`startup.col_${column}`)}
                                </Th>
                            ))}
                        </Tr>
                    </Thead>
                    <Tbody bodyBackgroundColor={config.services_body_background_color} bodyColor={config.services_body_color}>
                        {apps.map(app => {
                            const cell = { bodyBackgroundColor: config.services_body_background_color, bodyColor: config.services_body_color, borderColor: config.services_border_color, columnCount: COLUMNS.length };
                            return (
                                <Tr key={app.id} bodyBackgroundColor={config.services_body_background_color}>
                                    <Td {...cell} style={{ maxWidth: "260px" }}>
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                            <ProcessIcon name={app.executable ?? app.name} fallbackColor={config.services_body_color} />
                                            {app.name}
                                        </span>
                                        {app.comment && <Muted title={app.comment}>{app.comment}</Muted>}
                                    </Td>
                                    <Td {...cell} title={app.command ?? ""} style={{ maxWidth: "320px", opacity: 0.8 }}>{app.command}</Td>
                                    <Td {...cell}>{t(`startup.scope_${app.scope}`)}</Td>
                                    <Td {...cell}>
                                        <StatusDot color={app.enabled ? config.services_active_color : config.services_inactive_color} />
                                        {app.enabled ? t("startup.enabled") : t("startup.disabled")}
                                    </Td>
                                    <Td {...cell}>
                                        <KillButton
                                            killButtonBackgroundColor={config.services_head_background_color}
                                            killButtonColor={config.services_body_color}
                                            disabled={pending !== null}
                                            onClick={() => void toggle(app)}
                                        >
                                            {app.enabled ? t("startup.disable") : t("startup.enable")}
                                        </KillButton>
                                    </Td>
                                </Tr>
                            );
                        })}
                    </Tbody>
                </Table>
            )}
        </TableContainer>
    );
};

export default StartupApps;
