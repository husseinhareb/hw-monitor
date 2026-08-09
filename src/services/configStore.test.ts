import { describe, it, expect, vi, beforeEach } from 'vitest';
import { defaultConfig } from './configStore';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}));

vi.mock('./store', () => ({
  notify: vi.fn(),
}));

// Deferred promise helper — cleaner than raw Promise constructors in tests
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// We must import useConfigStore AFTER the mocks are set up.
// Reset modules between describe blocks that mutate the persist queue
// so we get a fresh module-level persistQueue each time.
async function freshStore() {
  vi.resetModules();
  const mod = await import('./configStore');
  const store = mod.useConfigStore;
  store.setState({
    config: mod.defaultConfig,
    hydrated: false,
    hydrating: false,
    lastLoadError: null,
  });
  return { store, defaultConfig: mod.defaultConfig };
}

describe('configStore', () => {
  describe('hydrate', () => {
    let store: Awaited<ReturnType<typeof freshStore>>['store'];

    beforeEach(async () => {
      vi.clearAllMocks();
      const fresh = await freshStore();
      store = fresh.store;
    });

    it('fetches config from backend and sets hydrated=true', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const backendConfig = { ...defaultConfig, language: 'fr' };
      vi.mocked(invoke).mockResolvedValueOnce(backendConfig);

      const result = await store.getState().hydrate();

      expect(invoke).toHaveBeenCalledWith('get_configs');
      expect(result).toEqual(backendConfig);
      expect(store.getState().hydrated).toBe(true);
      expect(store.getState().config.language).toBe('fr');
    });

    it('is idempotent — second call returns cached config without re-fetching', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce({ ...defaultConfig, language: 'ar' });

      const first = await store.getState().hydrate();
      expect(invoke).toHaveBeenCalledTimes(1);
      expect(first.language).toBe('ar');

      const second = await store.getState().hydrate();
      expect(invoke).toHaveBeenCalledTimes(1);
      expect(second.language).toBe('ar');
    });

    it('hydrate(true) forces a re-fetch even when already hydrated', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke)
        .mockResolvedValueOnce({ ...defaultConfig, language: 'en' })
        .mockResolvedValueOnce({ ...defaultConfig, language: 'pl' });

      await store.getState().hydrate();
      expect(store.getState().config.language).toBe('en');

      await store.getState().hydrate(true);
      expect(invoke).toHaveBeenCalledTimes(2);
      expect(store.getState().config.language).toBe('pl');
    });

    it('sets lastLoadError and notifies on failure', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const { notify } = await import('./store');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('network error'));

      await expect(store.getState().hydrate()).rejects.toThrow('network error');
      expect(store.getState().lastLoadError).toBe('Error: network error');
      expect(store.getState().hydrated).toBe(false);
      expect(notify).toHaveBeenCalledWith('error.config_failed');
    });
  });

  describe('persistPartial', () => {
    let store: Awaited<ReturnType<typeof freshStore>>['store'];

    beforeEach(async () => {
      vi.clearAllMocks();
      const fresh = await freshStore();
      store = fresh.store;
    });

    it('optimistically updates config immediately', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce(undefined);

      store.setState({ config: defaultConfig, hydrated: true });

      const promise = store.getState().persistPartial(
        { language: 'es' },
        'set_configs',
      );

      expect(store.getState().config.language).toBe('es');

      await promise;
      expect(invoke).toHaveBeenCalledWith('set_configs', {
        configs: { language: 'es' },
      });
    });

    it('rolls back on invoke failure when config has not changed', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const { notify } = await import('./store');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('save failed'));

      store.setState({ config: { ...defaultConfig, language: 'en' }, hydrated: true });

      const promise = store.getState().persistPartial(
        { language: 'de' },
        'set_configs',
      );

      expect(store.getState().config.language).toBe('de');

      await expect(promise).rejects.toThrow('save failed');

      expect(store.getState().config.language).toBe('en');
      expect(notify).toHaveBeenCalledWith('error.save_config_failed');
    });

    it('does NOT rollback if config was changed by another persist in the meantime', async () => {
      const { invoke } = await import('@tauri-apps/api/core');

      // First invoke: hangs until we resolve it
      const firstDeferred = deferred<unknown>();
      // Second invoke: resolves immediately
      vi.mocked(invoke)
        .mockImplementationOnce(() => firstDeferred.promise)
        .mockResolvedValueOnce(undefined);

      store.setState({ config: { ...defaultConfig, language: 'en' }, hydrated: true });

      // Issue first persist (language → fr) — this will hang
      const firstPromise = store.getState().persistPartial(
        { language: 'fr' },
        'set_configs',
      );

      // Issue second persist — it's queued but also sets config immediately to 'ar'
      const secondPromise = store.getState().persistPartial(
        { language: 'ar' },
        'set_configs',
      );

      // Now fail the first persist
      firstDeferred.reject(new Error('first failed'));

      await expect(firstPromise).rejects.toThrow('first failed');
      await secondPromise;

      // The first persist should NOT roll back because config had already
      // moved to 'ar' by the time the error arrived.
      expect(store.getState().config.language).toBe('ar');
    });

    it('serializes persists so they run in order', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const calls: string[] = [];
      vi.mocked(invoke).mockImplementation(async (_cmd, args) => {
        const { configs } = args as { configs: Record<string, unknown> };
        calls.push(configs.language as string);
      });

      store.setState({ config: defaultConfig, hydrated: true });

      const p1 = store.getState().persistPartial({ language: 'es' }, 'set_configs');
      const p2 = store.getState().persistPartial({ language: 'pl' }, 'set_configs');
      const p3 = store.getState().persistPartial({ language: 'uk' }, 'set_configs');

      await Promise.all([p1, p2, p3]);

      expect(calls).toEqual(['es', 'pl', 'uk']);
    });
  });

  describe('persistAll', () => {
    let store: Awaited<ReturnType<typeof freshStore>>['store'];

    beforeEach(async () => {
      vi.clearAllMocks();
      const fresh = await freshStore();
      store = fresh.store;
    });

    it('calls set_all_configs by default', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockResolvedValueOnce(undefined);

      const nextConfig = { ...defaultConfig, language: 'ar', navbar_background_color: '#111' };
      await store.getState().persistAll(nextConfig);

      expect(invoke).toHaveBeenCalledWith('set_all_configs', { configs: nextConfig });
      expect(store.getState().config.language).toBe('ar');
    });

    it('rolls back on failure', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      vi.mocked(invoke).mockRejectedValueOnce(new Error('boom'));

      const original = { ...defaultConfig, language: 'en' };
      store.setState({ config: original, hydrated: true });

      await expect(
        store.getState().persistAll({ ...original, language: 'de' }),
      ).rejects.toThrow('boom');

      expect(store.getState().config.language).toBe('en');
    });
  });

  describe('resetToDefault', () => {
    let store: Awaited<ReturnType<typeof freshStore>>['store'];

    beforeEach(async () => {
      vi.clearAllMocks();
      const fresh = await freshStore();
      store = fresh.store;
    });

    it('fetches fresh config after resetting to defaults', async () => {
      const { invoke } = await import('@tauri-apps/api/core');
      const freshConfig = { ...defaultConfig, language: 'en' };
      vi.mocked(invoke)
        .mockResolvedValueOnce(undefined) // set_default_config
        .mockResolvedValueOnce(freshConfig); // get_configs after reset

      store.setState({
        config: { ...defaultConfig, language: 'fr' },
        hydrated: true,
      });

      await store.getState().resetToDefault();

      expect(invoke).toHaveBeenCalledWith('set_default_config');
      expect(invoke).toHaveBeenCalledWith('get_configs');
      expect(store.getState().config.language).toBe('en');
    });
  });
});
