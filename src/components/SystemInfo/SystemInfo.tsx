import React from "react";
import { useTranslation } from "react-i18next";
import useSystemInfoData from "../../hooks/SystemInfo/useSystemInfoData";
import useSystemInfoConfig from "../../hooks/SystemInfo/useSystemInfoConfig";
import { convertData } from "../../helpers/useDataConverter";
import Spinner from "../Misc/Spinner";
import {
    Container,
    TopBar,
    PageTitle,
    RefreshButton,
    SectionGrid,
    SystemCard,
    CardTitle,
    InfoGrid,
    InfoItem,
    InfoLabel,
    InfoValue,
} from "./Styles/style";

type Row = { label: string; value: string | null | undefined };

const renderValue = (value: string | null | undefined, fallback: string): string => {
    if (value === null || value === undefined || value === "") {
        return fallback;
    }
    return value;
};

const InfoSection: React.FC<{
    title: string;
    rows: Row[];
    theme: ThemeProps;
}> = ({ title, rows, theme }) => {
    if (rows.every((r) => r.value === null || r.value === undefined || r.value === "")) {
        return null;
    }
    return (
        <SystemCard
            $bg={theme.$bg}
            $boxesBg={theme.$boxesBg}
            $titleColor={theme.$titleColor}
            $labelColor={theme.$labelColor}
            $valueColor={theme.$valueColor}
            $borderColor={theme.$borderColor}
        >
            <CardTitle $titleColor={theme.$titleColor} $borderColor={theme.$borderColor}>
                {title}
            </CardTitle>
            <InfoGrid>
                {rows.map((row) => (
                    <InfoItem key={row.label} $borderColor={theme.$borderColor}>
                        <InfoLabel $labelColor={theme.$labelColor}>{row.label}</InfoLabel>
                        <InfoValue $valueColor={theme.$valueColor}>
                            {renderValue(row.value, "N/A")}
                        </InfoValue>
                    </InfoItem>
                ))}
            </InfoGrid>
        </SystemCard>
    );
};

interface ThemeProps {
    $bg: string;
    $boxesBg: string;
    $titleColor: string;
    $labelColor: string;
    $valueColor: string;
    $borderColor: string;
}

const SystemInfo: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { data, loading, error, refetch } = useSystemInfoData();
    const sysConfig = useSystemInfoConfig();

    const theme: ThemeProps = {
        $bg: sysConfig.config.system_info_background_color,
        $boxesBg: sysConfig.config.system_info_boxes_background_color,
        $titleColor: sysConfig.config.system_info_title_color,
        $labelColor: sysConfig.config.system_info_label_color,
        $valueColor: sysConfig.config.system_info_value_color,
        $borderColor: sysConfig.config.system_info_border_color,
    };

    const formatBytes = (bytes: number | null | undefined): string | null => {
        if (bytes === null || bytes === undefined) return null;
        const converted = convertData(bytes);
        return `${converted.value} ${converted.unit}`;
    };

    const info = data.info;

    // --- Build per-section rows ---

    const osRows: Row[] = [
        { label: t("system_info.os_name"), value: info?.os_name },
        { label: t("system_info.os_version"), value: info?.os_version },
        { label: t("system_info.os_codename"), value: info?.os_codename },
        { label: t("system_info.os_arch"), value: info?.os_arch },
        { label: t("system_info.desktop_env"), value: info?.desktop_env },
        { label: t("system_info.session_type"), value: info?.session_type },
    ];

    const kernelRows: Row[] = [
        { label: t("system_info.kernel_version"), value: info?.kernel_version },
    ];

    const hostRows: Row[] = [
        { label: t("system_info.hostname"), value: info?.hostname },
        { label: t("system_info.chassis_type"), value: info?.chassis_type },
        { label: t("system_info.board_vendor"), value: info?.board_vendor },
        { label: t("system_info.board_name"), value: info?.board_name },
        { label: t("system_info.product_name"), value: info?.product_name },
        { label: t("system_info.product_version"), value: info?.product_version },
        { label: t("system_info.bios_vendor"), value: info?.bios_vendor },
        { label: t("system_info.bios_version"), value: info?.bios_version },
    ];

    const cpu = data.cpu;
    const cpuRows: Row[] = [
        { label: t("system_info.cpu_model"), value: cpu?.name },
        { label: t("system_info.cpu_socket"), value: cpu?.socket },
        { label: t("system_info.cpu_cores"), value: cpu?.cores },
        { label: t("system_info.cpu_threads"), value: cpu?.threads },
        { label: t("system_info.cpu_virtualization"), value: cpu?.virtualization },
        { label: t("system_info.cpu_base_speed"), value: cpu?.base_speed },
        { label: t("system_info.cpu_max_speed"), value: cpu?.max_speed },
        { label: t("system_info.cpu_cache_l1"), value: cpu?.cache_l1 },
        { label: t("system_info.cpu_cache_l2"), value: cpu?.cache_l2 },
        { label: t("system_info.cpu_cache_l3"), value: cpu?.cache_l3 },
    ];

    const gpuRows: Row[] = data.gpus.length > 0
        ? data.gpus.map((gpu, i) => ({
              label:
                  data.gpus.length === 1
                      ? t("system_info.gpu_name")
                      : `${t("system_info.gpu_name")} ${i + 1}`,
              value: [
                  gpu.name,
                  gpu.driver_version ? `Driver: ${gpu.driver_version}` : null,
                  gpu.memory_total ? `VRAM: ${gpu.memory_total}` : null,
              ]
                  .filter(Boolean)
                  .join(" — ") || null,
          }))
        : [];

    const mem = data.mem;
    const memRows: Row[] = [
        { label: t("system_info.memory_total"), value: formatBytes(mem.total) },
        { label: t("system_info.memory_available"), value: formatBytes(mem.available) },
        { label: t("system_info.swap_total"), value: formatBytes(mem.swap_total) },
    ];

    const bootRows: Row[] = [
        { label: t("system_info.uptime"), value: info?.uptime },
        {
            label: t("system_info.boot_time"),
            value: info?.boot_time_epoch
                ? new Date(info.boot_time_epoch * 1000).toLocaleString(i18n.language)
                : null,
        },
    ];

    const userRows: Row[] = [
        { label: t("system_info.current_user"), value: info?.current_user },
        { label: t("system_info.default_shell"), value: info?.default_shell },
    ];

    const pkgRows: Row[] = [
        { label: t("system_info.package_counts"), value: info?.package_counts },
    ];

    const localeRows: Row[] = [
        { label: t("system_info.locale"), value: info?.locale },
    ];

    // Non-loopback IPs from network interfaces
    const ipAddresses = data.interfaces
        .filter((iface) => iface.interface !== "lo")
        .flatMap((iface) => [...iface.ipv4_addresses, ...iface.ipv6_addresses]);

    const netRows: Row[] = [
        { label: t("system_info.hostname"), value: info?.hostname },
        {
            label: t("system_info.ip_addresses"),
            value: ipAddresses.length > 0 ? ipAddresses.join(", ") : null,
        },
    ];

    return (
        <Container $bg={theme.$bg}>
            {loading ? (
                <Spinner />
            ) : error && !info ? (
                <div>
                    <p>{t("error.fetch_failed")}</p>
                    <RefreshButton
                        $bg={theme.$boxesBg}
                        $fg={theme.$valueColor}
                        $border={theme.$borderColor}
                        onClick={() => refetch()}
                    >
                        {t("system_info.refresh")}
                    </RefreshButton>
                </div>
            ) : !info ? (
                <p>{t("system_info.no_data")}</p>
            ) : (
                <>
                    <TopBar>
                        <PageTitle $color={theme.$titleColor}>
                            {t("navbar.system_info")}
                        </PageTitle>
                        <RefreshButton
                            $bg={theme.$boxesBg}
                            $fg={theme.$valueColor}
                            $border={theme.$borderColor}
                            onClick={() => refetch()}
                        >
                            {t("system_info.refresh")}
                        </RefreshButton>
                    </TopBar>
                    <SectionGrid>
                        <InfoSection title={t("system_info.section_os")} rows={osRows} theme={theme} />
                        <InfoSection title={t("system_info.section_kernel")} rows={kernelRows} theme={theme} />
                        <InfoSection title={t("system_info.section_host")} rows={hostRows} theme={theme} />
                        <InfoSection title={t("system_info.section_cpu")} rows={cpuRows} theme={theme} />
                        <InfoSection title={t("system_info.section_gpu")} rows={gpuRows} theme={theme} />
                        <InfoSection title={t("system_info.section_memory")} rows={memRows} theme={theme} />
                        <InfoSection title={t("system_info.section_boot")} rows={bootRows} theme={theme} />
                        <InfoSection title={t("system_info.section_user")} rows={userRows} theme={theme} />
                        <InfoSection title={t("system_info.section_packages")} rows={pkgRows} theme={theme} />
                        <InfoSection title={t("system_info.section_locale")} rows={localeRows} theme={theme} />
                        <InfoSection title={t("system_info.section_network")} rows={netRows} theme={theme} />
                    </SectionGrid>
                </>
            )}
        </Container>
    );
};

export default SystemInfo;
