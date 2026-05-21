import { useSyncStore } from "@/state/syncStore";

export default function SyncIndicator() {
  const { status, lastSynced, errorMessage } = useSyncStore();

  const statusConfig: Record<string, { color: string; label: string }> = {
    idle: { color: "bg-green-500", label: "Saved" },
    syncing: { color: "bg-blue-500 animate-pulse", label: "Syncing..." },
    error: { color: "bg-red-500", label: errorMessage ?? "Sync error" },
    offline: { color: "bg-gray-400", label: "Offline" },
  };

  const config = statusConfig[status] ?? statusConfig.idle;

  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white rounded-full shadow-sm border border-[#EBEBEA] text-xs">
      <span className={`w-2 h-2 rounded-full ${config.color}`} />
      <span className="text-gray-600">{config.label}</span>
      {lastSynced && (
        <span className="text-gray-400">
          {new Date(lastSynced).toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
