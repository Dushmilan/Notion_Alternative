import { create } from "zustand";

interface SettingsState {
  dbFilename: string;
  syncPollInterval: number;
  logLevel: string;
  setDbFilename: (name: string) => void;
  setSyncPollInterval: (ms: number) => void;
  setLogLevel: (level: string) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  dbFilename: "notion-alternative.db",
  syncPollInterval: 30000,
  logLevel: "info",
  setDbFilename: (name) => set({ dbFilename: name }),
  setSyncPollInterval: (ms) => set({ syncPollInterval: ms }),
  setLogLevel: (level) => set({ logLevel: level }),
}));
