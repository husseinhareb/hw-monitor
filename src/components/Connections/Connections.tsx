import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import useConnectionsData, { Connection } from "../../hooks/Connections/useConnectionsData";
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

const ToolbarSelect = styled.select<{ background: string; color: string; border: string }>`
    background: ${p => p.background};
    color: ${p => p.color};
    border: 1px solid ${p => p.border};
    padding: 3px 6px;
    font-size: 12px;
    outline: none;
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
    const processConfig = useProcessConfig();
    const { t } = useTranslation();

    const [sortBy, setSortBy] = useState<ConnectionSortKey>("local_port");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [protocolFilter, setProtocolFilter] = useState<ProtocolFilter>("all");
    const [stateFilter, setStateFilter] = useState<StateFilter>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const deferredSearchQuery = useDeferredValue(searchQuery);
    const [selectedKey, setSelectedKey] = useState<string | null>(null);

    const stateColor = (state: string): string => {
        if (state === "ESTABLISHED" || state === "LISTEN") {
            return processConfig.config.processes_services_active_color;
        }
        if (transitioningStates.has(state)) {
            return processConfig.config.processes_services_transitioning_color;
        }
        return processConfig.config.processes_services_inactive_color;
    };

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
            case "remote_address":
                return isWildcardEndpoint(connection.remote_address, connection.remote_port)
                    ? "*"
                    : connection.remote_address;
            case "remote_port":
                return isWildcardEndpoint(connection.remote_address, connection.remote_port)
                    ? "*"
                    : connection.remote_port;
            case "pid":
                return connection.pid ?? "—";
            case "process_name":
                return connection.process_name ?? "—";
            case "user":
                return connection.user ?? String(connection.uid);
            default:
                return connection[key];
        }
    };

    const colCount = columns.length;
    const bodyBackground = processConfig.config.processes_body_background_color;
    const bodyColor = processConfig.config.processes_body_color;
    const headBackground = processConfig.config.processes_head_background_color;
    const headColor = processConfig.config.processes_head_color;
    const borderColor = processConfig.config.processes_border_color;

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
                        <ToolbarSelect
                            aria-label={t("connections.filter_protocol")}
                            value={protocolFilter}
                            onChange={event => setProtocolFilter(event.target.value as ProtocolFilter)}
                            background={bodyBackground}
                            color={bodyColor}
                            border={borderColor}
                        >
                            <option value="all">{t("connections.protocol_all")}</option>
                            <option value="tcp">{t("connections.protocol_tcp")}</option>
                            <option value="udp">{t("connections.protocol_udp")}</option>
                        </ToolbarSelect>
                        <ToolbarSelect
                            aria-label={t("connections.filter_state")}
                            value={stateFilter}
                            onChange={event => setStateFilter(event.target.value as StateFilter)}
                            background={bodyBackground}
                            color={bodyColor}
                            border={borderColor}
                        >
                            <option value="all">{t("connections.state_all")}</option>
                            <option value="listening">{t("connections.state_listening")}</option>
                            <option value="established">{t("connections.state_established")}</option>
                        </ToolbarSelect>
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
