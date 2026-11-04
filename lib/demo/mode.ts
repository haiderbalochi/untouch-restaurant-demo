"use client";

import { create } from "zustand";

/**
 * Demo-mode signal shared by the storefront and the admin panel.
 *
 * - `serverDemo` is true when the privileged Firebase Admin SDK is not
 *   configured (the server renders the dashboard in demo mode).
 * - `catalogEmpty` becomes true the moment the live Realtime Database returns
 *   no products, which switches the storefront to the bundled sample menu.
 */
interface DemoModeState {
  serverDemo: boolean;
  catalogEmpty: boolean;
  /** True once a live Realtime Database catalogue has actually been read. */
  liveCatalog: boolean;
  setServerDemo: (value: boolean) => void;
  setCatalogEmpty: (value: boolean) => void;
  setLiveCatalog: (value: boolean) => void;
}

export const useDemoModeStore = create<DemoModeState>()((set) => ({
  serverDemo: false,
  catalogEmpty: false,
  liveCatalog: false,
  setServerDemo: (value) => set({ serverDemo: value }),
  setCatalogEmpty: (value) => set({ catalogEmpty: value }),
  setLiveCatalog: (value) => set({ liveCatalog: value }),
}));

export function useDemoMode() {
  const serverDemo = useDemoModeStore((state) => state.serverDemo);
  const catalogEmpty = useDemoModeStore((state) => state.catalogEmpty);
  return { serverDemo, catalogEmpty, demo: serverDemo || catalogEmpty };
}

export function isDemoActive() {
  const state = useDemoModeStore.getState();
  return state.serverDemo || state.catalogEmpty;
}
