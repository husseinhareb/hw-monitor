import React, { useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { useTranslation } from 'react-i18next';
import { Process } from '../../hooks/Proc/useProcessData';
import { ProcessAffinity } from '../../bindings';
import { notify } from '../../services/store';
import {
    ManageModalOverlay,
    ManageModalContent,
    ManageModalHeader,
    ManageModalTitle,
    ManageModalClose,
    ManageModalBody,
    ManageSection,
    ManageSectionTitle,
    ManageRow,
    ManageHint,
    ManageRangeInput,
    ManageNumberInput,
    ManageActionButton,
    AffinityGrid,
    AffinityCpuButton,
    ManageErrorText,
} from '../../styles/proc-style';

interface Props {
    process: Process;
    backgroundColor: string;
    color: string;
    onClose: () => void;
    onKilled: () => void;
}

const NICE_MIN = -20;
const NICE_MAX = 19;

const ProcessManageModal: React.FC<Props> = ({ process, backgroundColor, color, onClose, onKilled }) => {
    const { t } = useTranslation();
    const [niceness, setNiceness] = useState<number>(process.nice ?? 0);
    const [priorityPending, setPriorityPending] = useState(false);

    const [affinity, setAffinity] = useState<ProcessAffinity | null>(null);
    const [selectedCpus, setSelectedCpus] = useState<Set<number>>(new Set());
    const [affinityLoading, setAffinityLoading] = useState(true);
    const [affinityError, setAffinityError] = useState<string | null>(null);
    const [affinityPending, setAffinityPending] = useState(false);

    const [killPending, setKillPending] = useState(false);
    const [forceKillPending, setForceKillPending] = useState(false);

    useEffect(() => {
        let cancelled = false;
        setAffinityLoading(true);
        setAffinityError(null);
        invoke<ProcessAffinity>('get_process_affinity', { process })
            .then((result) => {
                if (cancelled) return;
                setAffinity(result);
                setSelectedCpus(new Set(result.allowed_cpus));
            })
            .catch((error) => {
                if (cancelled) return;
                console.error('Failed to load CPU affinity:', error);
                setAffinityError(t('error.affinity_fetch_failed'));
            })
            .finally(() => {
                if (!cancelled) setAffinityLoading(false);
            });
        return () => { cancelled = true; };
    }, [process.pid, process.start_time]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    const handleApplyPriority = async () => {
        if (priorityPending) return;
        setPriorityPending(true);
        try {
            await invoke('set_process_priority', { process, niceness });
        } catch (error) {
            console.error('Failed to set process priority:', error);
            notify('error.priority_failed');
        } finally {
            setPriorityPending(false);
        }
    };

    const toggleCpu = (cpu: number) => {
        setSelectedCpus((prev) => {
            const next = new Set(prev);
            if (next.has(cpu)) {
                next.delete(cpu);
            } else {
                next.add(cpu);
            }
            return next;
        });
    };

    const handleSelectAllCpus = () => {
        if (!affinity) return;
        setSelectedCpus(new Set(Array.from({ length: affinity.total_cpus }, (_, i) => i)));
    };

    const handleClearCpus = () => {
        setSelectedCpus(new Set());
    };

    const handleApplyAffinity = async () => {
        if (affinityPending || selectedCpus.size === 0) return;
        setAffinityPending(true);
        try {
            await invoke('set_process_affinity', { process, cpus: Array.from(selectedCpus) });
        } catch (error) {
            console.error('Failed to set CPU affinity:', error);
            notify('error.affinity_apply_failed');
        } finally {
            setAffinityPending(false);
        }
    };

    const handleKill = async (force: boolean) => {
        if (killPending || forceKillPending) return;
        (force ? setForceKillPending : setKillPending)(true);
        try {
            await invoke('kill_process', { process, force });
            onKilled();
        } catch (error) {
            console.error('Failed to kill process:', error);
            notify('error.kill_failed');
        } finally {
            (force ? setForceKillPending : setKillPending)(false);
        }
    };

    return (
        <ManageModalOverlay onClick={onClose}>
            <ManageModalContent $backgroundColor={backgroundColor} $color={color} onClick={(e) => e.stopPropagation()}>
                <ManageModalHeader>
                    <ManageModalTitle title={`${process.name ?? ''} (PID: ${process.pid})`}>
                        {t('proc.manage_title')}: {process.name} (PID: {process.pid})
                    </ManageModalTitle>
                    <ManageModalClose type="button" aria-label="Close" onClick={onClose}>
                        &times;
                    </ManageModalClose>
                </ManageModalHeader>
                <ManageModalBody>
                    <ManageSection>
                        <ManageSectionTitle>{t('proc.priority_title')}</ManageSectionTitle>
                        <ManageRow>
                            <ManageRangeInput
                                type="range"
                                min={NICE_MIN}
                                max={NICE_MAX}
                                value={niceness}
                                onChange={(e) => setNiceness(Number(e.target.value))}
                            />
                            <ManageNumberInput
                                type="number"
                                min={NICE_MIN}
                                max={NICE_MAX}
                                value={niceness}
                                onChange={(e) => setNiceness(Number(e.target.value))}
                            />
                            <ManageActionButton type="button" onClick={handleApplyPriority} disabled={priorityPending}>
                                {priorityPending ? '…' : t('proc.priority_apply')}
                            </ManageActionButton>
                        </ManageRow>
                        <ManageHint>{t('proc.priority_hint')}</ManageHint>
                    </ManageSection>

                    <ManageSection>
                        <ManageSectionTitle>{t('proc.affinity_title')}</ManageSectionTitle>
                        {affinityLoading ? (
                            <ManageHint>{t('proc.affinity_loading')}</ManageHint>
                        ) : affinityError ? (
                            <ManageErrorText>{affinityError}</ManageErrorText>
                        ) : affinity ? (
                            <>
                                <AffinityGrid>
                                    {Array.from({ length: affinity.total_cpus }, (_, cpu) => (
                                        <AffinityCpuButton
                                            key={cpu}
                                            type="button"
                                            $selected={selectedCpus.has(cpu)}
                                            onClick={() => toggleCpu(cpu)}
                                        >
                                            {cpu}
                                        </AffinityCpuButton>
                                    ))}
                                </AffinityGrid>
                                <ManageRow>
                                    <ManageActionButton type="button" onClick={handleSelectAllCpus}>
                                        {t('proc.affinity_select_all')}
                                    </ManageActionButton>
                                    <ManageActionButton type="button" onClick={handleClearCpus}>
                                        {t('proc.affinity_clear')}
                                    </ManageActionButton>
                                    <ManageActionButton
                                        type="button"
                                        onClick={handleApplyAffinity}
                                        disabled={affinityPending || selectedCpus.size === 0}
                                    >
                                        {affinityPending ? '…' : t('proc.affinity_apply')}
                                    </ManageActionButton>
                                </ManageRow>
                            </>
                        ) : null}
                    </ManageSection>

                    <ManageSection>
                        <ManageSectionTitle>{t('proc.danger_zone')}</ManageSectionTitle>
                        <ManageRow>
                            <ManageActionButton type="button" onClick={() => handleKill(false)} disabled={killPending || forceKillPending}>
                                {killPending ? '…' : t('proc.kill_process')}
                            </ManageActionButton>
                            <ManageActionButton
                                type="button"
                                $danger
                                onClick={() => handleKill(true)}
                                disabled={killPending || forceKillPending}
                            >
                                {forceKillPending ? '…' : t('proc.force_kill')}
                            </ManageActionButton>
                        </ManageRow>
                        <ManageHint>{t('proc.force_kill_hint')}</ManageHint>
                    </ManageSection>
                </ManageModalBody>
            </ManageModalContent>
        </ManageModalOverlay>
    );
};

export default ProcessManageModal;
