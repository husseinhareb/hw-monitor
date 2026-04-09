import React, { useState, useMemo, useCallback } from 'react';
import { Process } from '../../hooks/Proc/useProcessData';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { lighten } from 'polished';

interface ProcessTreeProps {
    processes: Process[];
    processConfig: {
        config: {
            processes_body_background_color: string;
            processes_body_color: string;
            processes_head_background_color: string;
            processes_head_color: string;
            processes_table_values: string[];
            processes_border_color: string;
            processes_tree_toggle_color: string;
        };
    };
    onSelectProcess: (process: Process) => void;
    selectedPid: number | null;
}

interface TreeNode {
    process: Process;
    children: TreeNode[];
    depth: number;
}

const TreeContainer = styled.div<{ bgColor: string; color: string }>`
    width: 100%;
    overflow-y: auto;
    background-color: ${props => props.bgColor};
    color: ${props => props.color};
`;

const TreeHeader = styled.div<{ bgColor: string; color: string; borderColor: string; gridCols: string }>`
    display: grid;
    grid-template-columns: ${props => props.gridCols};
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: ${props => props.bgColor};
    color: ${props => props.color};
    border-bottom: 1px solid ${props => props.borderColor};
`;

const HeaderCell = styled.div<{ borderColor: string }>`
    padding: 8px;
    font-weight: bold;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-right: 1px solid ${props => props.borderColor};
`;

const TreeRow = styled.div<{ bgColor: string; selected: boolean; depth: number; borderColor: string; gridCols: string }>`
    display: grid;
    grid-template-columns: ${props => props.gridCols};
    align-items: center;
    cursor: pointer;
    background-color: ${props => props.selected ? lighten(0.15, props.bgColor) : 'transparent'};
    border-bottom: 1px solid ${props => props.borderColor};
    &:hover {
        background-color: ${props => lighten(0.08, props.bgColor)};
    }
`;

const TreeCell = styled.div<{ color: string; borderColor: string }>`
    padding: 6px 8px;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${props => props.color};
    border-right: 1px solid ${props => props.borderColor};
    min-width: 0;
`;

const NameCell = styled.div<{ color: string; depth: number; borderColor: string }>`
    padding: 6px 8px;
    padding-left: ${props => 8 + props.depth * 20}px;
    font-size: 13px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${props => props.color};
    border-right: 1px solid ${props => props.borderColor};
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
`;

const ToggleButton = styled.span<{ toggleColor: string; bodyColor: string }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    font-size: 10px;
    cursor: pointer;
    user-select: none;
    flex-shrink: 0;
    color: ${props => props.toggleColor};
    &:hover {
        color: ${props => props.bodyColor};
    }
`;

const LeafIcon = styled.span`
    display: inline-flex;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
`;

const ProcessTree: React.FC<ProcessTreeProps> = ({ processes, processConfig, onSelectProcess, selectedPid }) => {
    const { t } = useTranslation();
    const [expandedPids, setExpandedPids] = useState<Set<number>>(new Set());

    const toggleExpand = useCallback((pid: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedPids(prev => {
            const next = new Set(prev);
            if (next.has(pid)) {
                next.delete(pid);
            } else {
                next.add(pid);
            }
            return next;
        });
    }, []);

    const expandAll = useCallback(() => {
        const allPids = new Set(processes.map(p => p.pid));
        setExpandedPids(allPids);
    }, [processes]);

    const collapseAll = useCallback(() => {
        setExpandedPids(new Set());
    }, []);

    // Build tree from flat list
    const { flattenedNodes } = useMemo(() => {
        const pidMap = new Map<number, Process>();
        const childrenMap = new Map<number | null, Process[]>();

        for (const proc of processes) {
            pidMap.set(proc.pid, proc);
        }

        for (const proc of processes) {
            const ppid = proc.ppid;
            if (!childrenMap.has(ppid)) {
                childrenMap.set(ppid, []);
            }
            childrenMap.get(ppid)!.push(proc);
        }

        // Roots: processes whose parent is not in the process list (or ppid is null/0)
        const roots: TreeNode[] = [];
        for (const proc of processes) {
            if (proc.ppid === null || proc.ppid === 0 || !pidMap.has(proc.ppid)) {
                roots.push(buildNode(proc, 0));
            }
        }

        function buildNode(proc: Process, depth: number): TreeNode {
            const children = (childrenMap.get(proc.pid) || []).map(child => buildNode(child, depth + 1));
            // Sort children by PID
            children.sort((a, b) => a.process.pid - b.process.pid);
            return { process: proc, children, depth };
        }

        // Sort roots by PID
        roots.sort((a, b) => a.process.pid - b.process.pid);

        // Flatten visible nodes based on expanded state
        const flattenedNodes: TreeNode[] = [];
        function flatten(nodes: TreeNode[]) {
            for (const node of nodes) {
                flattenedNodes.push(node);
                if (node.children.length > 0 && expandedPids.has(node.process.pid)) {
                    flatten(node.children);
                }
            }
        }
        flatten(roots);

        return { flattenedNodes };
    }, [processes, expandedPids]);

    // Column config derived from user settings
    const columnMapping: { key: string; label: string; fr: number }[] = [
        { key: 'name',            label: t('proc.table_value_name'),            fr: 3   },
        { key: 'pid',             label: t('proc.table_value_pid'),             fr: 1   },
        { key: 'ppid',            label: t('proc.table_value_ppid'),            fr: 1   },
        { key: 'user',            label: t('proc.table_value_user'),            fr: 1.5 },
        { key: 'state',           label: t('proc.table_value_state'),           fr: 1   },
        { key: 'memory',          label: t('proc.table_value_memory'),          fr: 1.5 },
        { key: 'cpu_usage',       label: t('proc.table_value_cpu_usage'),       fr: 1   },
        { key: 'read_disk_usage', label: t('proc.table_value_read_disk_usage'), fr: 2   },
        { key: 'write_disk_usage',label: t('proc.table_value_write_disk_usage'),fr: 2   },
        { key: 'read_disk_speed', label: t('proc.table_value_read_disk_speed'), fr: 2   },
        { key: 'write_disk_speed',label: t('proc.table_value_write_disk_speed'),fr: 2   },
    ];
    const columnConfig = columnMapping.filter(col =>
        processConfig.config.processes_table_values.includes(col.key)
    );
    const gridTemplateColumns = columnConfig.map(col => `${col.fr}fr`).join(' ');

    return (
        <TreeContainer bgColor={processConfig.config.processes_body_background_color} color={processConfig.config.processes_body_color}>
            <div style={{ display: 'flex', gap: '8px', padding: '4px 8px', backgroundColor: processConfig.config.processes_head_background_color }}>
                <ExpandCollapseBtn bgColor={processConfig.config.processes_body_background_color} color={processConfig.config.processes_body_color} onClick={expandAll}>
                    {t('proc.expand_all')}
                </ExpandCollapseBtn>
                <ExpandCollapseBtn bgColor={processConfig.config.processes_body_background_color} color={processConfig.config.processes_body_color} onClick={collapseAll}>
                    {t('proc.collapse_all')}
                </ExpandCollapseBtn>
            </div>
            <TreeHeader bgColor={processConfig.config.processes_head_background_color} color={processConfig.config.processes_head_color} borderColor={processConfig.config.processes_border_color} gridCols={gridTemplateColumns}>
                {columnConfig.map(col => (
                    <HeaderCell key={col.key} borderColor={processConfig.config.processes_border_color}>{col.label}</HeaderCell>
                ))}
            </TreeHeader>
            {flattenedNodes.map(node => {
                const proc = node.process;
                const hasChildren = node.children.length > 0;
                const isExpanded = expandedPids.has(proc.pid);
                return (
                    <TreeRow
                        key={proc.pid}
                        bgColor={processConfig.config.processes_body_background_color}
                        selected={selectedPid === proc.pid}
                        depth={node.depth}
                        borderColor={processConfig.config.processes_border_color}
                        gridCols={gridTemplateColumns}
                        onClick={() => onSelectProcess(proc)}
                    >
                        {columnConfig.map(col => {
                            if (col.key === 'name') {
                                return (
                                    <NameCell key={`${proc.pid}-${col.key}`} color={processConfig.config.processes_body_color} depth={node.depth} borderColor={processConfig.config.processes_border_color}>
                                        {hasChildren ? (
                                            <ToggleButton toggleColor={processConfig.config.processes_tree_toggle_color} bodyColor={processConfig.config.processes_body_color} onClick={(e) => toggleExpand(proc.pid, e)}>
                                                {isExpanded ? '▼' : '▶'}
                                            </ToggleButton>
                                        ) : (
                                            <LeafIcon />
                                        )}
                                        {proc.name}
                                    </NameCell>
                                );
                            }
                            const value = col.key === 'cpu_usage'
                                ? `${proc[col.key] || '0'} %`
                                : String(proc[col.key] || '');
                            return (
                                <TreeCell key={`${proc.pid}-${col.key}`} color={processConfig.config.processes_body_color} borderColor={processConfig.config.processes_border_color}>
                                    {value}
                                </TreeCell>
                            );
                        })}
                    </TreeRow>
                );
            })}
        </TreeContainer>
    );
};

const ExpandCollapseBtn = styled.button<{ bgColor: string; color: string }>`
    background-color: ${props => props.bgColor};
    color: ${props => props.color};
    border: none;
    padding: 3px 10px;
    font-size: 11px;
    cursor: pointer;
    &:hover {
        opacity: 0.8;
    }
`;

export default ProcessTree;
