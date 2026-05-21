import { describe, it, expect } from "vitest";
import { useUIStore } from "@/state/uiStore";

describe("uiStore", () => {
  it("starts with sidebar open", () => {
    const state = useUIStore.getState();
    expect(state.sidebarOpen).toBe(true);
  });

  it("toggleSidebar flips the value", () => {
    const { toggleSidebar } = useUIStore.getState();
    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    toggleSidebar();
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });

  it("setSidebarOpen sets the value", () => {
    useUIStore.getState().setSidebarOpen(false);
    expect(useUIStore.getState().sidebarOpen).toBe(false);
    useUIStore.getState().setSidebarOpen(true);
    expect(useUIStore.getState().sidebarOpen).toBe(true);
  });
});
