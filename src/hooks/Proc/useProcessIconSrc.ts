import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Module-level cache shared across all component instances.
const cache = new Map<string, string | null>();

// Listeners waiting for an in-flight request.
const listeners = new Map<string, Set<(src: string | null) => void>>();

function fetchIcon(name: string, onResult: (src: string | null) => void): void {
    if (cache.has(name)) {
        onResult(cache.get(name) ?? null);
        return;
    }

    // Register listener before kicking off the request.
    if (!listeners.has(name)) {
        listeners.set(name, new Set());
    }
    listeners.get(name)!.add(onResult);

    // Only one in-flight request per name.
    if (listeners.get(name)!.size > 1) return;

    invoke<string | null>('get_process_icon', { name })
        .then(result => {
            cache.set(name, result);
            listeners.get(name)?.forEach(cb => cb(result));
        })
        .catch(() => {
            cache.set(name, null);
            listeners.get(name)?.forEach(cb => cb(null));
        })
        .finally(() => {
            listeners.delete(name);
        });
}

/**
 * Returns the system icon for a process as a base64 data URL, or null if
 * no matching .desktop entry / icon file was found.
 * Falls back to null immediately while the Tauri command is in flight.
 */
export function useProcessIconSrc(name: string): string | null {
    const [src, setSrc] = useState<string | null>(() => cache.get(name) ?? null);

    useEffect(() => {
        if (!name) return;

        let cancelled = false;

        fetchIcon(name, result => {
            if (!cancelled) setSrc(result);
        });

        return () => {
            cancelled = true;
        };
    }, [name]);

    return src;
}
