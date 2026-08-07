import React, { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import useConnectionsData, { Connection } from "../../hooks/Connections/useConnectionsData";
import useConnectionsConfig from "../../hooks/Connections/useConnectionsConfig";
import useProcessConfig from "../../hooks/Proc/useProcessConfig";
import { TableContainer, Table, Tbody, Thead, Td, Th, Tr, BottomBar } from "../../styles/proc-style";
import { safeLighten } from "../../utils/safeLighten";
import { convertData } from "../../helpers/useDataConverter";
import {
    ConnectionSortKey,
    compareConnections,
    connectionKey,
    formatEndpoint,
    isWildcardEndpoint,
    matchesConnectionQuery,
} from "../../helpers/connectionTable";
import * as CountryFlags from "country-flag-icons/react/3x2";
import Spinner from "../Misc/Spinner";

const StatusDot = styled.span<{ color: string }>`
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${p => p.color};
    margin-right: 6px;
    flex-shrink: 0;
`;

const Toolbar = styled.div<{ background: string }>`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    padding: 4px 8px;
    background-color: ${p => p.background};
    gap: 8px;
`;

const ToolbarInput = styled.input<{ background: string; color: string; border: string }>`
    background: ${p => p.background};
    color: ${p => p.color};
    border: 1px solid ${p => p.border};
    padding: 3px 8px;
    font-size: 12px;
    outline: none;
    width: 220px;
`;

// ── Dropdown (matches the Config page theme/language dropdown style) ──

const DropdownWrapper = styled.div`
    position: relative;
    display: inline-block;
`;

const DropdownTrigger = styled.button<{ bg: string; color: string; border: string }>`
    background-color: ${p => p.bg};
    color: ${p => p.color};
    border: 1px solid ${p => p.border};
    border-radius: 0;
    padding: 3px 24px 3px 8px;
    font-size: 12px;
    cursor: pointer;
    outline: none;
    height: 26px;
    text-align: left;
    min-width: 100px;
    position: relative;
    white-space: nowrap;

    &::after {
        content: '';
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid ${p => p.color}99;
    }

    &:focus {
        border-color: ${p => p.color}55;
    }
`;

const DropdownMenu = styled.ul<{ bg: string; border: string; color: string }>`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    background-color: ${p => p.bg};
    border: 1px solid ${p => p.border};
    border-top: none;
    z-index: 100;
    max-height: 200px;
    overflow-y: auto;
`;

const DropdownItem = styled.li<{ bg: string; color: string; selected: boolean }>`
    padding: 5px 8px;
    font-size: 12px;
    cursor: pointer;
    color: ${p => p.color};
    background-color: ${p => p.selected ? `${p.color}15` : p.bg};

    &:hover {
        background-color: ${p => p.color}22;
    }
`;

const ToolbarCount = styled.span`
    margin-left: auto;
    font-size: 11px;
    opacity: 0.6;
`;

const EmptyState = styled.p`
    padding: 16px 8px;
    font-size: 12px;
    opacity: 0.7;
`;

const Hint = styled.div`
    padding: 4px 8px;
    font-size: 11px;
    opacity: 0.55;
`;

const DetailField = styled.span`
    font-size: 12px;
    margin-right: 16px;
    white-space: nowrap;

    b {
        opacity: 0.6;
        font-weight: normal;
        margin-right: 4px;
    }
`;

const DetailBar = styled(BottomBar)`
    justify-content: flex-start;
    overflow-x: auto;
    padding-left: 8px;
`;

type ProtocolFilter = "all" | "tcp" | "udp";
type StateFilter = "all" | "listening" | "established";

const columns: { key: ConnectionSortKey; labelKey: string }[] = [
    { key: "protocol", labelKey: "connections.col_protocol" },
    { key: "local_address", labelKey: "connections.col_local_address" },
    { key: "local_port", labelKey: "connections.col_local_port" },
    { key: "remote_address", labelKey: "connections.col_remote_address" },
    { key: "remote_port", labelKey: "connections.col_remote_port" },
    { key: "state", labelKey: "connections.col_state" },
    { key: "pid", labelKey: "connections.col_pid" },
    { key: "process_name", labelKey: "connections.col_process" },
    { key: "user", labelKey: "connections.col_user" },
];

// A datagram socket that is bound without a peer is the UDP equivalent of a
// listening socket, which is how `ss -l` presents it too.
const listeningStates = new Set(["LISTEN", "UNCONN"]);
const transitioningStates = new Set([
    "SYN_SENT",
    "SYN_RECV",
    "FIN_WAIT1",
    "FIN_WAIT2",
    "TIME_WAIT",
    "CLOSE_WAIT",
    "LAST_ACK",
    "CLOSING",
    "NEW_SYN_RECV",
]);

const formatQueue = (bytes: number) => {
    const { value, unit } = convertData(bytes);
    return `${value} ${unit}`;
};

const Connections: React.FC = () => {
    const { connections, loading, error } = useConnectionsData();
    const connectionsConfig = useConnectionsConfig();
    const processConfig = useProcessConfig();
    const { t, i18n } = useTranslation();

    const [sortBy, setSortBy] = useState<ConnectionSortKey>("local_port");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>("all");
    const [stateFilter, setStateFilter] = useState<StateFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    // Custom dropdown state
    const [protocolOpen, setProtocolOpen] = useState(false);
    const [stateOpen, setStateOpen] = useState(false);
    const protocolRef = useRef<HTMLDivElement>(null);
    const stateRef = useRef<HTMLDivElement>(null);

    // Click-outside to close dropdowns
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (protocolRef.current && !protocolRef.current.contains(e.target as Node)) {
                setProtocolOpen(false);
            }
            if (stateRef.current && !stateRef.current.contains(e.target as Node)) {
                setStateOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const protocolOptions: { value: ProtocolFilter; labelKey: string }[] = [
        { value: "all", labelKey: "connections.protocol_all" },
        { value: "tcp", labelKey: "connections.protocol_tcp" },
        { value: "udp", labelKey: "connections.protocol_udp" },
    ];

    const stateOptions: { value: StateFilter; labelKey: string }[] = [
        { value: "all", labelKey: "connections.state_all" },
        { value: "listening", labelKey: "connections.state_listening" },
        { value: "established", labelKey: "connections.state_established" },
    ];

    const stateColor = (state: string): string => {
        if (state === "ESTABLISHED" || state === "LISTEN") {
            return processConfig.config.processes_services_active_color;
        }
        if (transitioningStates.has(state)) {
            return processConfig.config.processes_services_transitioning_color;
        }
        return processConfig.config.processes_services_inactive_color;
    };

    // Memoised country-name resolver using the browser's built-in Intl API.
    // Falls back to the country code itself when the region is unknown.
    const countryDisplayName = useMemo(() => {
        const lang = i18n.language.slice(0, 2);
        const names = new Intl.DisplayNames([lang], { type: "region" });
        return (code: string) => {
            try {
                const name = names.of(code);
                return name ?? code;
            } catch {
                return code;
            }
        };
    }, [i18n.language]);

    const visibleConnections = useMemo(() => {
        const query = deferredSearchQuery.trim().toLowerCase();

        const filtered = connections.filter(connection => {
            if (protocolFilter !== "all" && !connection.protocol.startsWith(protocolFilter)) {
                return false;
            }
            if (stateFilter === "listening" && !listeningStates.has(connection.state)) {
                return false;
            }
            if (stateFilter === "established" && connection.state !== "ESTABLISHED") {
                return false;
            }
            return matchesConnectionQuery(connection, query);
        });

        return filtered.sort((a, b) => {
            const result = compareConnections(a, b, sortBy);
            return sortOrder === "asc" ? result : -result;
        });
    }, [connections, deferredSearchQuery, protocolFilter, stateFilter, sortBy, sortOrder]);

    const selectedConnection = useMemo(
        () => visibleConnections.find(connection => connectionKey(connection) === selectedKey) ?? null,
        [visibleConnections, selectedKey],
    );

    // A socket that closes while selected must not leave a stale detail bar.
    useEffect(() => {
        if (selectedKey !== null && !selectedConnection) {
            setSelectedKey(null);
        }
    }, [selectedKey, selectedConnection]);

    const hasUnattributed = useMemo(
        () => connections.some(connection => connection.pid === null),
        [connections],
    );

    const sortColumn = (key: ConnectionSortKey) => {
        if (sortBy === key) {
            setSortOrder(order => (order === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
    };

    const getSortIndicator = (key: ConnectionSortKey) => {
        if (sortBy !== key) return null;
        return sortOrder === "asc"
            ? <FaArrowUp style={{ fontSize: "10px", marginLeft: "4px" }} />
            : <FaArrowDown style={{ fontSize: "10px", marginLeft: "4px" }} />;
    };

    const renderCell = (connection: Connection, key: ConnectionSortKey) => {
        switch (key) {
            case "state":
                return (
                    <span style={{ display: "inline-flex", alignItems: "center" }}>
                        <StatusDot color={stateColor(connection.state)} />
                        {connection.state}
                    </span>
                );
            case "remote_address": {
                if (isWildcardEndpoint(connection.remote_address, connection.remote_port)) {
                    return "*";
                }
                const countryCode = connection.remote_country_code?.toUpperCase();
                const FlagComponent = countryCode
                    ? (CountryFlags as Record<string, React.FC<React.SVGProps<SVGSVGElement>>>)[countryCode]
                    : null;
                const label = countryCode
                    ? countryDisplayName(countryCode)
                    : undefined;
                return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        {FlagComponent && (
                            <span title={label} style={{ display: "inline-flex", alignItems: "center" }}>
                                <FlagComponent
                                    style={{ width: 18, height: 12, flexShrink: 0, verticalAlign: "middle" }}
                                />
                            </span>
                        )}
                        {connection.remote_address}
                    </span>
                );
            }
            case "remote_port":
                return isWildcardEndpoint(connection.remote_address, connection.remote_port)
                    ? "*"
                    : connection.remote_port;
            case "pid":
                return connection.pid ?? "-";
            case "process_name":
                return connection.process_name ?? "-";
            case "user":
                return connection.user ?? String(connection.uid);
            default:
                return connection[key];
        }
    };

    const colCount = columns.length;
    const bodyBackground = connectionsConfig.config.connections_body_background_color;
    const bodyColor = connectionsConfig.config.connections_body_color;
    const headBackground = connectionsConfig.config.connections_head_background_color;
    const headColor = connectionsConfig.config.connections_head_color;
    const borderColor = connectionsConfig.config.connections_border_color;

    return (
        <TableContainer style={{
            backgroundColor: bodyBackground,
            minHeight: "100vh",
            color: bodyColor,
            position: "relative",
            paddingBottom: selectedConnection ? "50px" : undefined,
        }}>
            {loading ? (
                <Spinner />
            ) : error && connections.length === 0 ? (
                <p>{t("error.connections_failed")}</p>
            ) : (
                <>
                    <Toolbar background={headBackground}>
                        <ToolbarInput
                            type="text"
                            placeholder={t("connections.search_placeholder")}
                            value={searchQuery}
                            onChange={event => setSearchQuery(event.target.value)}
                            background={bodyBackground}
                            color={bodyColor}
                            border={borderColor}
                        />
                        <DropdownWrapper ref={protocolRef}>
                            <DropdownTrigger
                                bg={bodyBackground}
                                color={bodyColor}
                                border={borderColor}
                                onClick={() => setProtocolOpen(o => !o)}
                                type="button"
                            >
                                {t(protocolOptions.find(o => o.value === protocolFilter)!.labelKey)}
                            </DropdownTrigger>
                            {protocolOpen && (
                                <DropdownMenu bg={bodyBackground} border={borderColor} color={bodyColor}>
                                    {protocolOptions.map(opt => (
                                        <DropdownItem
                                            key={opt.value}
                                            bg={bodyBackground}
                                            color={bodyColor}
                                            selected={protocolFilter === opt.value}
                                            onClick={() => { setProtocolFilter(opt.value); setProtocolOpen(false); }}
                                        >
                                            {t(opt.labelKey)}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            )}
                        </DropdownWrapper>
                        <DropdownWrapper ref={stateRef}>
                            <DropdownTrigger
                                bg={bodyBackground}
                                color={bodyColor}
                                border={borderColor}
                                onClick={() => setStateOpen(o => !o)}
                                type="button"
                            >
                                {t(stateOptions.find(o => o.value === stateFilter)!.labelKey)}
                            </DropdownTrigger>
                            {stateOpen && (
                                <DropdownMenu bg={bodyBackground} border={borderColor} color={bodyColor}>
                                    {stateOptions.map(opt => (
                                        <DropdownItem
                                            key={opt.value}
                                            bg={bodyBackground}
                                            color={bodyColor}
                                            selected={stateFilter === opt.value}
                                            onClick={() => { setStateFilter(opt.value); setStateOpen(false); }}
                                        >
                                            {t(opt.labelKey)}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            )}
                        </DropdownWrapper>
                        <ToolbarCount>
                            {visibleConnections.length} {t("connections.total")}
                        </ToolbarCount>
                    </Toolbar>

                    {hasUnattributed && <Hint>{t("connections.unattributed_hint")}</Hint>}

                    {connections.length === 0 ? (
                        <EmptyState>{t("connections.none")}</EmptyState>
                    ) : visibleConnections.length === 0 ? (
                        <EmptyState>{t("connections.no_matches")}</EmptyState>
                    ) : (
                        <Table
                            bodyBackgroundColor={bodyBackground}
                            bodyColor={bodyColor}
                            headBackgroundColor={headBackground}
                            headColor={headColor}
                        >
                            <Thead headBackgroundColor={headBackground} headColor={headColor}>
                                <Tr>
                                    {columns.map(column => (
                                        <Th
                                            key={column.key}
                                            onClick={() => sortColumn(column.key)}
                                            headBackgroundColor={headBackground}
                                            headColor={headColor}
                                            borderColor={borderColor}
                                            columnCount={colCount}
                                        >
                                            <div className="header-label">
                                                <span className="label">{t(column.labelKey)}</span>
                                                {getSortIndicator(column.key)}
                                            </div>
                                        </Th>
                                    ))}
                                </Tr>
                            </Thead>
                            <Tbody bodyBackgroundColor={bodyBackground} bodyColor={bodyColor}>
                                {visibleConnections.map(connection => {
                                    const key = connectionKey(connection);
                                    return (
                                        <Tr
                                            key={key}
                                            onClick={() => setSelectedKey(previous => previous === key ? null : key)}
                                            bodyBackgroundColor={bodyBackground}
                                            style={{
                                                backgroundColor: selectedKey === key
                                                    ? safeLighten(0.15, bodyBackground)
                                                    : "transparent",
                                            }}
                                        >
                                            {columns.map(column => (
                                                <Td
                                                    key={`${key}-${column.key}`}
                                                    bodyBackgroundColor={bodyBackground}
                                                    bodyColor={bodyColor}
                                                    borderColor={borderColor}
                                                    columnCount={colCount}
                                                >
                                                    {renderCell(connection, column.key)}
                                                </Td>
                                            ))}
                                        </Tr>
                                    );
                                })}
                            </Tbody>
                        </Table>
                    )}
                </>
            )}

            {selectedConnection && (
                <DetailBar bottomBarBackgroundColor={headBackground}>
                    <DetailField>
                        <b>{t("connections.local_endpoint")}</b>
                        {formatEndpoint(selectedConnection.local_address, selectedConnection.local_port)}
                    </DetailField>
                    <DetailField>
                        <b>{t("connections.remote_endpoint")}</b>
                        {formatEndpoint(selectedConnection.remote_address, selectedConnection.remote_port)}
                    </DetailField>
                    <DetailField>
                        <b>{t("connections.col_process")}</b>
                        {selectedConnection.process_name ?? t("connections.unknown")}
                        {selectedConnection.pid !== null && ` (${selectedConnection.pid})`}
                    </DetailField>
                    <DetailField>
                        <b>{t("connections.uid")}</b>
                        {selectedConnection.uid}
                    </DetailField>
                    <DetailField>
                        <b>{t("connections.rx_queue")}</b>
                        {formatQueue(selectedConnection.rx_queue)}
                    </DetailField>
                    <DetailField>
                        <b>{t("connections.tx_queue")}</b>
                        {formatQueue(selectedConnection.tx_queue)}
                    </DetailField>
                    <DetailField>
                        <b>{t("connections.inode")}</b>
                        {selectedConnection.inode}
                    </DetailField>
                </DetailBar>
            )}
        </TableContainer>
    );
};

export default Connections;
