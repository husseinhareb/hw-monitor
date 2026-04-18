import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Module-level cache shared across all component instances.
const cache = new Map<string, string | null>();

// Listeners waiting for an in-flight request.
const listeners = new Map<string, Set<(src: string | null) => void>>();

// Tracks names currently being fetched to prevent duplicate requests.
const inFlight = new Set<string>();

function notifyListeners(name: string, result: string | null) {
    listeners.get(name)?.forEach((listener) => listener(result));
}

function subscribe(name: string, onResult: (src: string | null) => void) {
    if (!listeners.has(name)) {
        listeners.set(name, new Set());
    }

    const currentListeners = listeners.get(name)!;
    currentListeners.add(onResult);

    return () => {
        currentListeners.delete(onResult);
        if (currentListeners.size === 0) {
            listeners.delete(name);
        }
    };
}

function fetchIcon(name: string): void {
    if (cache.has(name) || inFlight.has(name)) {
        return;
    }

    inFlight.add(name);

    invoke<string | null>('get_process_icon', { name })
        .then(result => {
            cache.set(name, result);
            notifyListeners(name, result);
        })
        .catch(() => {
            cache.set(name, null);
            notifyListeners(name, null);
        })
        .finally(() => {
            inFlight.delete(name);
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
        if (!name) {
            setSrc(null);
            return;
        }

        setSrc(cache.get(name) ?? null);
        const unsubscribe = subscribe(name, setSrc);
        fetchIcon(name);
        return unsubscribe;
    }, [name]);

    return src;
}
