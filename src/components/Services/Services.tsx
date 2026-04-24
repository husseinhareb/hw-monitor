import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import useServicesData, { SystemService } from "../../hooks/Services/useServicesData";
import useProcessConfig from "../../hooks/Proc/useProcessConfig";
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr, BottomBar, KillButton } from "../../styles/proc-style";
import { safeLighten } from '../../utils/safeLighten';
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import Spinner from "../Misc/Spinner";
import { useTranslation } from "react-i18next";
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

const ModalOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
`;

const ModalBox = styled.div<{ bg: string; fg: string; border: string }>`
    background: ${p => p.bg};
    color: ${p => p.fg};
    border: 1px solid ${p => p.border};
    padding: 20px 24px;
    min-width: 300px;
    max-width: 380px;
    width: 90%;
    display: flex;
    flex-direction: column;
    gap: 12px;
`;

const ModalTitle = styled.h3`
    margin: 0;
    font-size: 14px;
    font-weight: 600;
`;

const ModalDesc = styled.p`
    margin: 0;
    font-size: 12px;
    opacity: 0.8;
`;

const ModalInput = styled.input<{ bg: string; fg: string; border: string }>`
    background: ${p => p.bg};
    color: ${p => p.fg};
    border: 1px solid ${p => p.border};
    padding: 6px 10px;
    font-size: 13px;
    outline: none;
    width: 100%;
    box-sizing: border-box;
`;

const ModalError = styled.p`
    margin: 0;
    font-size: 12px;
    color: #e55;
`;

const ModalActions = styled.div`
    display: flex;
    gap: 8px;
    justify-content: flex-end;
`;

const ModalButton = styled.button<{ bg: string; fg: string; border: string }>`
    background: ${p => p.bg};
    color: ${p => p.fg};
    border: 1px solid ${p => p.border};
    padding: 5px 14px;
    font-size: 12px;
    cursor: pointer;
    &:disabled { opacity: 0.5; cursor: default; }
`;

const DetailsPanel = styled.div<{ bg: string; fg: string; border: string }>`
    position: fixed;
    left: 0;
    right: 0;
    bottom: 36px;
    height: 38vh;
    background: ${p => p.bg};
    color: ${p => p.fg};
    border-top: 1px solid ${p => p.border};
    z-index: 20;
    display: flex;
    flex-direction: column;
    min-height: 260px;
`;

const DetailsHeader = styled.div<{ bg: string; border: string }>`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: ${p => p.bg};
    border-bottom: 1px solid ${p => p.border};
    flex-shrink: 0;
`;

const DetailsTitle = styled.h3`
    margin: 0;
    font-size: 13px;
    font-weight: 600;
`;

const DetailsButton = styled.button<{ bg: string; fg: string; border: string }>`
    background: ${p => p.bg};
    color: ${p => p.fg};
    border: 1px solid ${p => p.border};
    padding: 4px 10px;
    font-size: 12px;
    cursor: pointer;
    &:disabled { opacity: 0.5; cursor: default; }
`;

const DetailsSummary = styled.div<{ border: string }>`
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 0;
    border-bottom: 1px solid ${p => p.border};
    flex-shrink: 0;
`;

const SummaryItem = styled.div<{ border: string }>`
    padding: 7px 10px;
    border-right: 1px solid ${p => p.border};
    min-width: 0;
    &:last-child { border-right: none; }
`;

const SummaryLabel = styled.div`
    font-size: 10px;
    opacity: 0.58;
    text-transform: uppercase;
    margin-bottom: 3px;
`;

const SummaryValue = styled.div`
    font-size: 12px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const DetailsContent = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 0;
    flex: 1;
`;

const DetailsSection = styled.section<{ border: string }>`
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    border-right: 1px solid ${p => p.border};
    &:last-child { border-right: none; }
`;

const DetailsSectionTitle = styled.div<{ border: string }>`
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 600;
    border-bottom: 1px solid ${p => p.border};
    flex-shrink: 0;
`;

const DetailsPre = styled.pre`
    margin: 0;
    padding: 10px;
    overflow: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-family: monospace;
    font-size: 11px;
    line-height: 1.35;
    flex: 1;
`;

const columns: { key: keyof SystemService; labelKey: string }[] = [
    { key: "name", labelKey: "services.col_name" },
    { key: "description", labelKey: "services.col_description" },
    { key: "load_state", labelKey: "services.col_load" },
    { key: "active_state", labelKey: "services.col_active" },
    { key: "sub_state", labelKey: "services.col_sub" },
    { key: "unit_file_state", labelKey: "services.col_enabled" },
];

type ServiceAction = "start" | "stop" | "restart" | "enable" | "disable";

const serviceActionCommands: Record<ServiceAction, string> = {
    start: "start_service",
    stop: "stop_service",
    restart: "restart_service",
    enable: "enable_service",
    disable: "disable_service",
};

interface ServiceDetailsData {
    name: string;
    unit_file_path: string | null;
    status: string;
    logs: string;
}

const installableStates = new Set(["disabled", "indirect"]);
const removableStates = new Set(["enabled", "enabled-runtime", "linked", "linked-runtime"]);

const isMasked = (service: SystemService) =>
    service.load_state === "masked" || service.unit_file_state.startsWith("masked");

const canRunAction = (service: SystemService, action: ServiceAction): boolean => {
    switch (action) {
        case "start":
            return !isMasked(service) && service.active_state !== "active" && service.active_state !== "activating";
        case "stop":
            return !isMasked(service) && service.active_state !== "inactive" && service.active_state !== "deactivating";
        case "restart":
            return !isMasked(service) && service.active_state === "active";
        case "enable":
            return !isMasked(service) && installableStates.has(service.unit_file_state);
        case "disable":
            return removableStates.has(service.unit_file_state);
    }
};

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
    const { services, loading, error, refetch } = useServicesData();
    const processConfig = useProcessConfig();
    const { t } = useTranslation();

    const [sortBy, setSortBy] = useState<keyof SystemService>("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [selectedName, setSelectedName] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [authModal, setAuthModal] = useState<{
        show: boolean;
        pendingAction: ServiceAction | null;
        password: string;
        error: string;
        loading: boolean;
    }>({ show: false, pendingAction: null, password: "", error: "", loading: false });
    const [serviceDetails, setServiceDetails] = useState<{
        name: string | null;
        data: ServiceDetailsData | null;
        loading: boolean;
        error: string | null;
    }>({ name: null, data: null, loading: false, error: null });
    const detailsRequestId = useRef(0);

    const sortedServices = useMemo(() => {
        return [...services].sort((a, b) => {
            const va = (a[sortBy] || "").toLowerCase();
            const vb = (b[sortBy] || "").toLowerCase();
            if (sortOrder === "asc") return va > vb ? 1 : va < vb ? -1 : 0;
            return va < vb ? 1 : va > vb ? -1 : 0;
        });
    }, [services, sortBy, sortOrder]);

    const filteredServices = useMemo(() => {
        if (!deferredSearchQuery) return sortedServices;
        const q = deferredSearchQuery.toLowerCase();
        return sortedServices.filter(s =>
            s.name.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q) ||
            s.active_state.toLowerCase().includes(q)
        );
    }, [deferredSearchQuery, sortedServices]);

    const selectedService = useMemo(
        () => selectedName ? services.find((service) => service.name === selectedName) ?? null : null,
        [selectedName, services],
    );

    const fetchServiceDetails = useCallback(async (name: string) => {
        const requestId = detailsRequestId.current + 1;
        detailsRequestId.current = requestId;
        setServiceDetails({ name, data: null, loading: true, error: null });
        try {
            const details = await invoke<ServiceDetailsData>("get_service_details", { name });
            if (detailsRequestId.current === requestId) {
                setServiceDetails({ name, data: details, loading: false, error: null });
            }
        } catch (error) {
            if (detailsRequestId.current === requestId) {
                setServiceDetails({ name, data: null, loading: false, error: String(error) });
            }
        }
    }, []);

    const closeAuthModal = useCallback(() =>
        setAuthModal({ show: false, pendingAction: null, password: "", error: "", loading: false }), []);

    useEffect(() => {
        if (selectedName !== null && !services.some((service) => service.name === selectedName)) {
            setSelectedName(null);
            closeAuthModal();
        }
    }, [selectedName, services, closeAuthModal]);

    useEffect(() => {
        if (!selectedName) {
            detailsRequestId.current += 1;
            setServiceDetails({ name: null, data: null, loading: false, error: null });
            return;
        }

        void fetchServiceDetails(selectedName);
    }, [selectedName, fetchServiceDetails]);

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

    const handleAction = (action: ServiceAction) => {
        if (!selectedName || !selectedService || !canRunAction(selectedService, action)) return;
        setAuthModal({ show: true, pendingAction: action, password: "", error: "", loading: false });
    };

    const submitAuth = async () => {
        if (!authModal.pendingAction || !selectedName) return;
        const action = authModal.pendingAction;
        const name = selectedName;
        const password = authModal.password;
        setAuthModal(prev => ({ ...prev, loading: true, error: "", password: "" }));
        try {
            await invoke(serviceActionCommands[action], {
                name,
                password,
            });
            closeAuthModal();
            await refetch();
            await fetchServiceDetails(name);
        } catch (error) {
            const errStr = String(error);
            setAuthModal(prev => ({
                ...prev,
                loading: false,
                error: errStr.includes("incorrect_password")
                    ? t("error.service_auth_failed")
                    : errStr.includes("service_action_timeout")
                        ? t("error.service_action_failed")
                    : t("error.service_action_failed"),
            }));
        }
    };

    const hasSelection = selectedName !== null;
    const colCount = columns.length;
    const actionEnabled = (action: ServiceAction) =>
        selectedService ? canRunAction(selectedService, action) : false;

    return (
        <TableContainer style={{
            backgroundColor: processConfig.config.processes_body_background_color,
            minHeight: "100vh",
            color: processConfig.config.processes_body_color,
            position: "relative",
            paddingBottom: hasSelection ? "calc(38vh + 50px)" : undefined,
        }}>
            {loading ? (
                <Spinner />
            ) : error && services.length === 0 ? (
                <p>{t("error.fetch_failed")}</p>
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
                                            ? safeLighten(0.15, processConfig.config.processes_body_background_color)
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
            {selectedService && (
                <DetailsPanel
                    bg={processConfig.config.processes_body_background_color}
                    fg={processConfig.config.processes_body_color}
                    border={processConfig.config.processes_border_color}
                >
                    <DetailsHeader
                        bg={processConfig.config.processes_head_background_color}
                        border={processConfig.config.processes_border_color}
                    >
                        <DetailsTitle>{t("services.details_title")}: {selectedService.name}</DetailsTitle>
                        <span style={{ fontSize: "12px", opacity: 0.7, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {selectedService.description}
                        </span>
                        <DetailsButton
                            bg={processConfig.config.processes_body_background_color}
                            fg={processConfig.config.processes_body_color}
                            border={processConfig.config.processes_border_color}
                            onClick={() => fetchServiceDetails(selectedService.name)}
                            disabled={serviceDetails.loading}
                            style={{ marginLeft: "auto" }}
                        >
                            {serviceDetails.loading ? "..." : t("services.refresh_details")}
                        </DetailsButton>
                    </DetailsHeader>
                    <DetailsSummary border={processConfig.config.processes_border_color}>
                        <SummaryItem border={processConfig.config.processes_border_color}>
                            <SummaryLabel>{t("services.col_load")}</SummaryLabel>
                            <SummaryValue>{selectedService.load_state}</SummaryValue>
                        </SummaryItem>
                        <SummaryItem border={processConfig.config.processes_border_color}>
                            <SummaryLabel>{t("services.col_active")}</SummaryLabel>
                            <SummaryValue>{selectedService.active_state}</SummaryValue>
                        </SummaryItem>
                        <SummaryItem border={processConfig.config.processes_border_color}>
                            <SummaryLabel>{t("services.col_sub")}</SummaryLabel>
                            <SummaryValue>{selectedService.sub_state}</SummaryValue>
                        </SummaryItem>
                        <SummaryItem border={processConfig.config.processes_border_color}>
                            <SummaryLabel>{t("services.col_enabled")}</SummaryLabel>
                            <SummaryValue>{selectedService.unit_file_state}</SummaryValue>
                        </SummaryItem>
                        <SummaryItem border={processConfig.config.processes_border_color}>
                            <SummaryLabel>{t("services.unit_file")}</SummaryLabel>
                            <SummaryValue title={serviceDetails.data?.unit_file_path ?? undefined}>
                                {serviceDetails.data?.unit_file_path ?? t("services.no_unit_file")}
                            </SummaryValue>
                        </SummaryItem>
                    </DetailsSummary>
                    <DetailsContent>
                        <DetailsSection border={processConfig.config.processes_border_color}>
                            <DetailsSectionTitle border={processConfig.config.processes_border_color}>
                                {t("services.status")}
                            </DetailsSectionTitle>
                            <DetailsPre>
                                {serviceDetails.loading
                                    ? t("services.details_loading")
                                    : serviceDetails.error
                                        ? t("services.details_failed")
                                        : serviceDetails.data?.status || t("services.no_details")}
                            </DetailsPre>
                        </DetailsSection>
                        <DetailsSection border={processConfig.config.processes_border_color}>
                            <DetailsSectionTitle border={processConfig.config.processes_border_color}>
                                {t("services.logs")}
                            </DetailsSectionTitle>
                            <DetailsPre>
                                {serviceDetails.loading
                                    ? t("services.details_loading")
                                    : serviceDetails.error
                                        ? serviceDetails.error
                                        : serviceDetails.data?.logs || t("services.no_logs")}
                            </DetailsPre>
                        </DetailsSection>
                    </DetailsContent>
                </DetailsPanel>
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
                        disabled={!actionEnabled("start")}
                    >{t("services.start")}</KillButton>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={() => handleAction("stop")}
                        disabled={!actionEnabled("stop")}
                    >{t("services.stop")}</KillButton>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={() => handleAction("restart")}
                        disabled={!actionEnabled("restart")}
                    >{t("services.restart")}</KillButton>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={() => handleAction("enable")}
                        disabled={!actionEnabled("enable")}
                    >{t("services.enable_startup")}</KillButton>
                    <KillButton
                        killButtonBackgroundColor={processConfig.config.processes_body_background_color}
                        killButtonColor={processConfig.config.processes_body_color}
                        onClick={() => handleAction("disable")}
                        disabled={!actionEnabled("disable")}
                    >{t("services.disable_startup")}</KillButton>
                </BottomBar>
            )}
        {authModal.show && (
            <ModalOverlay onClick={closeAuthModal}>
                <ModalBox
                    bg={processConfig.config.processes_body_background_color}
                    fg={processConfig.config.processes_body_color}
                    border={processConfig.config.processes_border_color}
                    onClick={e => e.stopPropagation()}
                >
                    <ModalTitle>{t("services.auth_title")}</ModalTitle>
                    <ModalDesc>{t("services.auth_desc")}</ModalDesc>
                    <ModalInput
                        type="password"
                        autoFocus
                        placeholder={t("services.auth_password")}
                        value={authModal.password}
                        bg={processConfig.config.processes_head_background_color}
                        fg={processConfig.config.processes_body_color}
                        border={processConfig.config.processes_border_color}
                        onChange={e => setAuthModal(prev => ({ ...prev, password: e.target.value }))}
                        onKeyDown={e => { if (e.key === "Enter") submitAuth(); }}
                        disabled={authModal.loading}
                    />
                    {authModal.error && <ModalError>{authModal.error}</ModalError>}
                    <ModalActions>
                        <ModalButton
                            bg={processConfig.config.processes_body_background_color}
                            fg={processConfig.config.processes_body_color}
                            border={processConfig.config.processes_border_color}
                            onClick={closeAuthModal}
                            disabled={authModal.loading}
                        >{t("services.auth_cancel")}</ModalButton>
                        <ModalButton
                            bg={processConfig.config.processes_body_background_color}
                            fg={processConfig.config.processes_body_color}
                            border={processConfig.config.processes_border_color}
                            onClick={submitAuth}
                            disabled={authModal.loading}
                        >{authModal.loading ? "…" : t("services.auth_confirm")}</ModalButton>
                    </ModalActions>
                </ModalBox>
            </ModalOverlay>
        )}
        </TableContainer>
    );
};

export default Services;
